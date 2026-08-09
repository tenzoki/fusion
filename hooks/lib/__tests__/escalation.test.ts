import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
  isHalted,
  loadEscalation,
  raiseHalt,
  recordBlock,
  resetBlockCounter,
  saveEscalation,
  clearHalt,
} from "../escalation.js";
import type { EscalationState } from "../escalation.js";

function freshState(): EscalationState {
  return {
    haltActive: false,
    consecutiveBlocks: 0,
    lastBlockTimestamp: null,
    recentEvents: [],
  };
}

describe("escalation state", () => {
  let state: EscalationState;

  beforeEach(() => {
    state = freshState();
  });

  it("starts not halted", () => {
    expect(isHalted(state)).toBe(false);
  });

  it("records blocks and increments counter", () => {
    recordBlock(state, 3, "test", "test message", "Write", "foo.ts");
    expect(state.consecutiveBlocks).toBe(1);
    expect(state.recentEvents).toHaveLength(1);
    expect(state.recentEvents[0].level).toBe("block");
  });

  it("triggers halt after blocksBeforeHalt consecutive blocks", () => {
    const halted1 = recordBlock(state, 3, "test", "msg1");
    expect(halted1).toBe(false);
    const halted2 = recordBlock(state, 3, "test", "msg2");
    expect(halted2).toBe(false);
    const halted3 = recordBlock(state, 3, "test", "msg3");
    expect(halted3).toBe(true);
    expect(isHalted(state)).toBe(true);
    // Should have block events + halt event
    expect(state.recentEvents.filter((e) => e.level === "halt")).toHaveLength(1);
  });

  it("resets block counter", () => {
    recordBlock(state, 3, "test", "msg1");
    recordBlock(state, 3, "test", "msg2");
    expect(state.consecutiveBlocks).toBe(2);
    resetBlockCounter(state);
    expect(state.consecutiveBlocks).toBe(0);
  });

  it("clears halt mode", () => {
    // Force halt
    recordBlock(state, 1, "test", "msg");
    expect(isHalted(state)).toBe(true);
    clearHalt(state);
    expect(isHalted(state)).toBe(false);
    expect(state.consecutiveBlocks).toBe(0);
    expect(state.recentEvents.at(-1)?.trigger).toBe("halt_cleared");
  });

  it("does not halt if threshold not reached", () => {
    recordBlock(state, 5, "test", "msg1");
    recordBlock(state, 5, "test", "msg2");
    recordBlock(state, 5, "test", "msg3");
    recordBlock(state, 5, "test", "msg4");
    expect(isHalted(state)).toBe(false);
    expect(state.consecutiveBlocks).toBe(4);
  });
});

/**
 * The concurrent-writer merge in `saveEscalation`, driven as an INTERLEAVING
 * rather than a race.
 *
 * ## Why there is no concurrency in these tests
 *
 * The defect is a lost update: `guard.ts` loads the state before CHECK 1 and
 * the allow path saves it at the very end, and `tracker.ts` loads, raises the
 * halt and saves inside that window. Two processes are what makes the window
 * happen in the wild, but they are not what makes it a defect — the ORDER is,
 * and the order can be written down. Each case below performs the two callers'
 * steps in one process in the sequence that loses the halt, so it fails on the
 * old code every run rather than on an unlucky one, and needs no sleep, no
 * child process and no retry.
 *
 * `speculation:` how often that order actually occurs is unknown and not
 * measured here (the hook payload carries no per-call correlation key). These
 * tests pin what the merge does when it occurs, not that it does.
 *
 * ## Why a temp project and a chdir
 *
 * The state file is located by walking up from the working directory, and this
 * repository has a workbench of its own directly above `hooks/` — so a test
 * that called `saveEscalation` where it stands would write the developer's live
 * halt state. Vitest 2 runs test files in forked processes, where `chdir` is
 * available and scoped to this file's worker; `afterEach` restores it.
 */
describe("saveEscalation against a second writer", () => {
  const originalCwd = process.cwd();
  let project: string;
  let statePath: string;

  beforeEach(() => {
    project = mkdtempSync(resolve(realpathSync(tmpdir()), "fusion-escalation-"));
    mkdirSync(resolve(project, "fusion-workbench"), { recursive: true });
    writeFileSync(
      resolve(project, "fusion-workbench", ".fusion-setup"),
      JSON.stringify({ version: "test" }),
      "utf-8",
    );
    statePath = resolve(
      project,
      "fusion-workbench",
      ".guard-state",
      "escalation.json",
    );
    process.chdir(project);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(project, { recursive: true, force: true });
  });

  function onDisk(): EscalationState {
    return JSON.parse(readFileSync(statePath, "utf-8")) as EscalationState;
  }

  /** What `tracker.ts` does when the measurement finds a protected path changed. */
  function measurementRaisesHalt(): void {
    const tracker = loadEscalation();
    raiseHalt(
      tracker,
      "protected_path_measured",
      "Protected path changed during a Bash call — rules/x.md restored",
      "Bash",
      "rules/x.md",
    );
    saveEscalation(tracker);
  }

  it("keeps a halt raised between another caller's load and its save", () => {
    // The guard loads before CHECK 1 and finds no halt.
    const guard = loadEscalation();
    expect(isHalted(guard)).toBe(false);

    // The measurement raises one inside the guard's window.
    measurementRaisesHalt();

    // The guard's allow path saves the object it has been holding all along.
    resetBlockCounter(guard);
    saveEscalation(guard);

    expect(onDisk().haltActive).toBe(true);
    expect(
      onDisk().recentEvents.map((e) => e.trigger),
    ).toContain("protected_path_measured");
  });

  it("keeps both writers' events, the file's first and this caller's after", () => {
    const guard = loadEscalation();
    measurementRaisesHalt();

    // A rules-write exemption note — the guard pushes this straight onto the
    // object and lets the single save at the end of the call persist it.
    guard.recentEvents.push({
      level: "clear",
      trigger: "rules_write_exemption",
      message: "FUSION_ALLOW_RULES_WRITE allowed rules/y.md",
      timestamp: new Date().toISOString(),
    });
    saveEscalation(guard);

    expect(onDisk().recentEvents.map((e) => e.trigger)).toEqual([
      "protected_path_measured",
      "rules_write_exemption",
    ]);
  });

  it("still lets a human clear the halt it loaded", () => {
    measurementRaisesHalt();

    // clear-halt.ts: load, clear, save. The halt is on disk at load time and
    // still there at save time, so the merge must NOT read it as newly raised.
    const clearer = loadEscalation();
    expect(isHalted(clearer)).toBe(true);
    clearHalt(clearer);
    saveEscalation(clearer);

    expect(onDisk().haltActive).toBe(false);
    expect(onDisk().recentEvents.at(-1)?.trigger).toBe("halt_cleared");
  });

  it("writes one copy of each event when the same object is saved twice", () => {
    const guard = loadEscalation();
    recordBlock(guard, 3, "protected_path", "first", "Write", "rules/a.md");
    saveEscalation(guard);
    recordBlock(guard, 3, "protected_path", "second", "Write", "rules/b.md");
    saveEscalation(guard);

    expect(onDisk().recentEvents.map((e) => e.message)).toEqual([
      "first",
      "second",
    ]);
    expect(onDisk().consecutiveBlocks).toBe(2);
  });

  it("keeps the newest events when the merged list exceeds the trim limit", () => {
    const guard = loadEscalation();
    measurementRaisesHalt();
    for (let i = 0; i < 12; i++) {
      guard.recentEvents.push({
        level: "block",
        trigger: "protected_path",
        message: `block ${i}`,
        timestamp: new Date().toISOString(),
      });
    }
    saveEscalation(guard);

    const events = onDisk().recentEvents;
    // MAX_RECENT_EVENTS is 10 and applies to the merged list, not to either
    // writer's half — 1 + 12 in, the last 10 kept.
    expect(events).toHaveLength(10);
    expect(events.at(-1)?.message).toBe("block 11");
    expect(onDisk().haltActive).toBe(true);
  });

  it("leaves a single writer's state exactly as it was written", () => {
    const first = loadEscalation();
    recordBlock(first, 3, "protected_path", "only", "Write", "rules/a.md");
    saveEscalation(first);

    const second = loadEscalation();
    expect(second.consecutiveBlocks).toBe(1);
    expect(second.recentEvents).toHaveLength(1);
    expect(second.haltActive).toBe(false);
    expect(second.lastBlockTimestamp).toBe(first.lastBlockTimestamp);
  });
});
