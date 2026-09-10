import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, utimesSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
  BYTE_BASELINE_FILE,
  DISPATCH_BYTES_ADVISORY,
  RULE_SIZES_FILE,
  measureDispatchBytes,
  workItemFromPrompt,
} from "../dispatch-bytes.js";
import {
  CASE_TIMEOUT,
  REPO_ROOT,
  readEvents,
  readOrchestratorEvents,
  runDispatch,
  withProject,
} from "./helpers/guard-harness.js";

// ---------------------------------------------------------------------------
// What a task_start row measures — the byte counts and the claimed work item.
//
// TWO SUBJECTS, AND THE SPLIT IS BY WHAT EACH CAN OBSERVE. The warm path's
// promise is that it spawns NOTHING, and the only honest way to check that is to
// count the calls a stub runner receives — so those cases call the module
// in-process with an injected runner. The work-item promise is about the JSON a
// real dispatch writes, so those cases go through the guard as a subprocess and
// read the emitted row back, never a rendering of it.
// ---------------------------------------------------------------------------

/** A throwaway project with the two files the measurement reads off the root. */
function project(): string {
  const root = resolve(mkdtempSync(resolve(tmpdir(), "fusion-bytes-")), "p");
  mkdirSync(resolve(root, "fusion-workbench"), { recursive: true });
  mkdirSync(resolve(root, "rules"), { recursive: true });
  writeFileSync(resolve(root, "CLAUDE.md"), "# project\n", "utf-8");
  writeFileSync(resolve(root, "rules", "local.md"), "x".repeat(500), "utf-8");
  return root;
}

/** A runner that counts its calls and returns one emitted path. */
function countingRunner(root: string) {
  const calls: string[] = [];
  return {
    calls,
    run: (_helper: string, agent: string) => {
      calls.push(agent);
      return `${resolve(root, "rules", "local.md")}\nskill:demo\n\n`;
    },
  };
}

describe("the rule emission is measured once and memoised", () => {
  it("spawns the runner on the first call and NOTHING on the second", () => {
    const root = project();
    const first = countingRunner(root);
    const a = measureDispatchBytes(root, "coder", first.run);
    expect(first.calls, "the cold path did not run the helper").toEqual(["coder"]);
    expect(a.fields.bytes_rules).toBe(500);

    // Same agent, same tree, nothing touched. The memo answers and the runner is
    // never reached — which is the acceptance criterion, counted rather than
    // asserted in prose.
    const second = countingRunner(root);
    const b = measureDispatchBytes(root, "coder", second.run);
    expect(second.calls, "the warm path spawned a subprocess").toEqual([]);
    expect(b.fields.bytes_rules).toBe(500);
  });

  it("re-measures when a rule file's mtime moves, and not otherwise", () => {
    const root = project();
    measureDispatchBytes(root, "coder", countingRunner(root).run);

    const rule = resolve(root, "rules", "local.md");
    writeFileSync(rule, "x".repeat(900), "utf-8");
    const future = new Date(Date.now() + 5000);
    utimesSync(rule, future, future);

    const after = countingRunner(root);
    const m = measureDispatchBytes(root, "coder", after.run);
    expect(after.calls, "a changed rule file did not invalidate the memo").toEqual(["coder"]);
    expect(m.fields.bytes_rules).toBe(900);
  });

  it("keeps a second agent's measurement out of the first agent's memo", () => {
    const root = project();
    measureDispatchBytes(root, "coder", countingRunner(root).run);
    const other = countingRunner(root);
    measureDispatchBytes(root, "ontocoder", other.run);
    expect(other.calls).toEqual(["ontocoder"]);
    const memo = JSON.parse(readFileSync(resolve(root, "fusion-workbench", ".guard-state", RULE_SIZES_FILE), "utf-8"));
    expect(Object.keys(memo).sort()).toEqual(["coder", "ontocoder"]);
  });
});

describe("an unmeasurable emission is absent and said, never zero", () => {
  it("drops bytes_rules and bytes_total and hands back one advisory", () => {
    const root = project();
    const m = measureDispatchBytes(root, "coder", () => {
      throw new Error("exit 2");
    });
    const keys = Object.keys(m.fields);
    expect(keys, "an unknown emission was written as a figure").not.toContain("bytes_rules");
    expect(keys, "a total was summed over a hole").not.toContain("bytes_total");
    expect(m.advisory ?? "").toContain(DISPATCH_BYTES_ADVISORY);
    // And nothing was armed off a measurement that did not happen.
    expect(m.fields.bytes_delta).toBeUndefined();
  });
});

describe("the baseline is the project's own, armed by its first row", () => {
  it("arms silently, then carries the delta against itself", () => {
    const root = project();
    const first = measureDispatchBytes(root, "coder", countingRunner(root).run);
    expect(first.fields.bytes_total).toBeGreaterThan(0);
    expect(
      Object.keys(first.fields),
      "the arming row carried a delta against itself",
    ).not.toContain("bytes_delta");

    const armed = JSON.parse(
      readFileSync(resolve(root, "fusion-workbench", ".guard-state", BYTE_BASELINE_FILE), "utf-8"),
    );
    expect(armed.coder).toBe(first.fields.bytes_total);

    writeFileSync(resolve(root, "CLAUDE.md"), "# project\n" + "y".repeat(120), "utf-8");
    const second = measureDispatchBytes(root, "coder", countingRunner(root).run);
    expect(second.fields.bytes_delta).toBe(120);
  });
});

describe("the work item is read off the dispatch prompt", () => {
  it("takes the basename, strips the backticks the project writes it in", () => {
    expect(workItemFromPrompt({ prompt: "**Work-item:** `260909-1843_o_thing.md`\nbody" })).toBe(
      "260909-1843_o_thing.md",
    );
    expect(workItemFromPrompt({ prompt: "**Work-item:** shared/backlog/a.md" })).toBe("a.md");
    expect(workItemFromPrompt({ prompt: "no line here" })).toBeUndefined();
    expect(workItemFromPrompt(undefined)).toBeUndefined();
  });

  it(
    "writes work_item on the emitted JSON when the prompt names one",
    () => {
      withProject(({ root }) => {
        runDispatch(root, {
          sessionId: "sid-work-item",
          toolUseId: "toolu_01work",
          subagentType: "fusion:coder",
          prompt: "**Work-item:** `260909-1843_o_measure.md`\n\ndo the thing",
        });
        const rows = readOrchestratorEvents(root).filter((r) => r.event === "task_start");
        expect(rows).toHaveLength(1);
        expect(rows[0].work_item).toBe("260909-1843_o_measure.md");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "writes NO work_item key at all when the prompt names none",
    () => {
      // The state session 2 ships in: C2 is what puts the line in the
      // orchestrator's dispatch prompt, so every row until then takes this path
      // and the key has to be absent rather than empty.
      withProject(({ root }) => {
        runDispatch(root, {
          sessionId: "sid-no-work-item",
          toolUseId: "toolu_01none",
          subagentType: "fusion:coder",
          prompt: "just a directive, no claim",
        });
        const rows = readOrchestratorEvents(root).filter((r) => r.event === "task_start");
        expect(rows).toHaveLength(1);
        expect(Object.keys(rows[0]), "work_item was written empty").not.toContain("work_item");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "carries the three counts and their sum on task_start",
    () => {
      withProject(({ root }) => {
        runDispatch(
          root,
          { sessionId: "sid-bytes", toolUseId: "toolu_01bytes", subagentType: "fusion:coder" },
          { FUSION_PLUGIN_ROOT: REPO_ROOT },
        );
        const row = readOrchestratorEvents(root).filter((r) => r.event === "task_start")[0];
        expect(row.bytes_rules as number, "the emission measured nothing").toBeGreaterThan(0);
        expect(row.bytes_total).toBe(
          (row.bytes_prompt as number) + (row.bytes_rules as number) + (row.bytes_claude_md as number),
        );
        // No CLAUDE.md in a harness project is 0 bytes loaded, which is true —
        // absent-never-zero is about a measurement that FAILED, not about a
        // file that is not there.
        expect(row.bytes_claude_md).toBe(0);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "advises and drops the two keys when the helper refuses the agent",
    () => {
      withProject(({ root }) => {
        runDispatch(
          root,
          { sessionId: "sid-unknown", toolUseId: "toolu_01unk", subagentType: "fusion:notanagent" },
          { FUSION_PLUGIN_ROOT: REPO_ROOT },
        );
        const row = readOrchestratorEvents(root).filter((r) => r.event === "task_start")[0];
        expect(Object.keys(row), "an unknown emission was written as a figure").not.toContain("bytes_rules");
        expect(Object.keys(row)).not.toContain("bytes_total");
        const advisories = readEvents(root).filter((e) => (e.detail ?? "").includes(DISPATCH_BYTES_ADVISORY));
        expect(advisories, "the failed measurement went unreported").toHaveLength(1);
      });
    },
    CASE_TIMEOUT,
  );
});
