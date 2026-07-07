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
