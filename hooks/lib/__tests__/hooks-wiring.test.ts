import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
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
  // omitted Bash, so the git-branch/worktree classifier never ran in
  // production even though its unit tests passed. This asserts the wiring
  // so the gap cannot silently regress.
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
    // The three SessionStart commands are independent by design (see the header
    // of `hooks/session-start.ts`). This pins that adding the third did not
    // absorb or displace either of the two that were already there.
    const sessionStart = loadHooks().hooks.SessionStart ?? [];
    const commands = sessionStart.flatMap((entry) =>
      entry.hooks.map((h) => h.command),
    );
    expect(commands.some((c) => c.includes("FUSION_PLUGIN_ROOT"))).toBe(true);
    expect(commands.some((c) => c.includes("Fusion loaded"))).toBe(true);
  });
});
