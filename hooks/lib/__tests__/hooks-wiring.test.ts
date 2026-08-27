import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// hooks.json lives at hooks/hooks.json; this test is at hooks/lib/__tests__/.
const hooksJsonPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../hooks.json",
);

interface HookCommand {
  type: string;
  command: string;
}
interface HookEntry {
  matcher?: string;
  hooks: HookCommand[];
}
interface HooksConfig {
  hooks: {
    SessionStart?: HookEntry[];
    PreToolUse?: HookEntry[];
    PostToolUse?: HookEntry[];
  };
}

function loadHooks(): HooksConfig {
  return JSON.parse(readFileSync(hooksJsonPath, "utf-8")) as HooksConfig;
}

describe("hooks.json wiring — guard reaches Bash", () => {
  // Regression guard for 260707-0616[o]: the guard's PreToolUse matcher
  // omitted Bash, so the policy that then read shell commands never ran in
  // production even though its unit tests passed.
  //
  // Nothing reads a command any more, and the fingerprint that justified this
  // wiring after the classifier — the BEFORE-picture of the protected paths,
  // taken here and compared in `tracker.ts` — went with the protected-path half
  // on 2026-08-12. THE REASON THAT HOLDS NOW is the configuration diagnostic
  // loop: `guard.ts` emits one `guard_advisory` per problem the loader hands
  // back, on every guarded call, and Bash is most of a session's guarded calls
  // (`hooks/guard.ts` — the Bash branch states the same thing at the site).
  //
  // That matters more than it did. Since the configuration file was renamed,
  // the retired-file diagnostic IS the whole of the v10 migration for a
  // consuming project (`lib/config.ts`, the retirement section), and this
  // matcher is how it reaches one. Drop Bash from here and a project carrying a
  // stale `fusion-guard.json` hears about it on write-tool calls alone, which
  // is where a silently unapplied Turn budget comes from. These two assertions
  // are what stop that edit.
  it("routes Bash tool calls to guard.js via PreToolUse", () => {
    const preToolUse = loadHooks().hooks.PreToolUse ?? [];
    const guardEntry = preToolUse.find((entry) =>
      entry.hooks.some((h) => h.command.includes("guard.js")),
    );
    expect(guardEntry, "a PreToolUse entry must invoke guard.js").toBeDefined();

    const matcher = guardEntry!.matcher ?? "";
    const tools = matcher.split("|").map((t) => t.trim());
    expect(tools).toContain("Bash");
  });

  it("keeps the write tools wired to guard.js too", () => {
    const preToolUse = loadHooks().hooks.PreToolUse ?? [];
    const guardEntry = preToolUse.find((entry) =>
      entry.hooks.some((h) => h.command.includes("guard.js")),
    );
    const tools = (guardEntry!.matcher ?? "").split("|").map((t) => t.trim());
    for (const tool of ["Write", "Edit", "MultiEdit", "NotebookEdit"]) {
      expect(tools).toContain(tool);
    }
  });

  it("routes the dispatch tool to both hooks and exports identity at SessionStart (v10.8.0 machine rows; debt: shared/issues/260827-0410_*_the-machine-written-event-rows-ship-with-wiring-asserts-only-because-the-hook-test-surface-is-full.md)", () => {
    const cfg = loadHooks().hooks as Record<string, HookEntry[]>;
    expect((cfg.SubagentStop ?? []).flatMap((e) => e.hooks).some((h) => h.command.includes("subagent-stop.js")), "SubagentStop wiring").toBe(true);
    for (const [phase, script] of [["PreToolUse", "guard.js"], ["PostToolUse", "tracker.js"]] as const) {
      const entry = (cfg[phase] ?? []).find((e) => e.hooks.some((h) => h.command.includes(script)));
      const tools = (entry?.matcher ?? "").split("|").map((t) => t.trim());
      expect(tools, `${phase} matcher`).toContain("Task");
      expect(tools, `${phase} matcher`).toContain("Agent");
    }
    const exportCmd = (cfg.SessionStart ?? [])
      .flatMap((e) => e.hooks.map((h) => h.command))
      .find((c) => c.includes("fusion-identity"));
    for (const token of ["FUSION_PERSON", "FUSION_CHECKOUT", "CLAUDE_ENV_FILE"]) {
      expect(exportCmd, "SessionStart identity export").toContain(token);
    }
  });
});

describe("hooks.json wiring — the working-directory warning runs at SessionStart", () => {
  // Same regression shape as the Bash matcher above: `session-start.ts` has its
  // own suite (`session-start-subdirectory.test.ts`), and every case there
  // spawns the hook directly. So the hook can be entirely correct and entirely
  // unreachable, with a green suite either way, if nothing asserts the wiring.
  it("invokes dist/session-start.js from a SessionStart entry", () => {
    const sessionStart = loadHooks().hooks.SessionStart ?? [];
    const commands = sessionStart.flatMap((entry) =>
      entry.hooks.map((h) => h.command),
    );
    expect(
      commands.some((c) => c.includes("dist/session-start.js")),
      "a SessionStart entry must invoke dist/session-start.js",
    ).toBe(true);
  });

  it("keeps the FUSION_PLUGIN_ROOT export and the loaded banner alongside it", () => {
    // The four SessionStart commands are independent by design (see the header
    // of `hooks/session-start.ts`). This pins that the two later arrivals did
    // not absorb or displace either of the two that were already there.
    const sessionStart = loadHooks().hooks.SessionStart ?? [];
    const commands = sessionStart.flatMap((entry) =>
      entry.hooks.map((h) => h.command),
    );
    expect(commands.some((c) => c.includes("FUSION_PLUGIN_ROOT"))).toBe(true);
    expect(commands.some((c) => c.includes("Fusion loaded"))).toBe(true);
  });
});

describe("hooks.json wiring — the session identifier reaches the model at SessionStart", () => {
  // `session-id.ts` runs `main()` at load and awaits stdin, so there is no
  // in-process form: the channel is asserted by spawning the built module.
  // The line must be BARE stdout — a `hookSpecificOutput` envelope would exit 0,
  // log as a successful hook and put nothing in front of the model.
  it("invokes dist/session-id.js from a SessionStart entry", () => {
    const commands = (loadHooks().hooks.SessionStart ?? []).flatMap((e) => e.hooks.map((h) => h.command));
    expect(commands.some((c) => c.includes("dist/session-id.js")), "SessionStart must run session-id.js").toBe(true);
  });

  it("prints the bare line for a session_id and nothing when it is absent or empty", () => {
    const entry = resolve(dirname(fileURLToPath(import.meta.url)), "../../dist/session-id.js");
    const out = (payload: object) =>
      spawnSync(process.execPath, [entry], { input: JSON.stringify(payload), encoding: "utf-8" }).stdout;
    const line = out({ session_id: "102df4a8-09be-4019-8a6b-adaec6e95bc5" });
    expect(line).toBe("fusion: session_id=102df4a8-09be-4019-8a6b-adaec6e95bc5\n");
    expect(() => JSON.parse(line)).toThrow();
    expect(out({})).toBe("");
    expect(out({ session_id: "" })).toBe("");
  });
});
