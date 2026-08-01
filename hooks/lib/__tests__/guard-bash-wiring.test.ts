import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { classifyBashMutation } from "../bash-mutation-guard.js";
import {
  CASE_TIMEOUT,
  readEscalation,
  readEvents,
  runBash,
  withProject,
} from "./helpers/guard-harness.js";

// ---------------------------------------------------------------------------
// Wiring gate for plan step 5 — classifyBashMutation inside guardBashCommand.
//
// Two properties of the Bash path are settled and load-bearing, each traced to
// a filed issue, and both are stated in prose at guard.ts's allow path:
//
//   1. An innocuous Bash call MUST NOT reset the consecutive-block counter
//      (260707-0750). Agents run Bash constantly between write attempts;
//      resetting here lets any interleaved Bash zero the counter and defeat
//      the halt escalation.
//   2. An innocuous Bash call MUST NOT emit a guard_allow event (260707-0751).
//      One append per Bash call floods events.jsonl and buries the
//      guard_block / guard_halt / guard_advisory entries the monitor exists
//      to surface.
//
// The mutation check is deny-only precisely so both survive. This gate asserts
// that on the SOURCE, which is what a future edit to guardBashCommand would
// break; the file-level proof (escalation.json and events.jsonl unchanged
// across an innocuous Bash call) is plan step 6's integration harness, which
// needs a temporary project root the write guard does not stand down in.
//
// This is a guard, not a fixer (rules/critical-stance.md §2): it reads and
// asserts, it never rewrites guard.ts.
// ---------------------------------------------------------------------------

const guardPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../guard.ts",
);

const guardSource = readFileSync(guardPath, "utf-8");

/**
 * The body of `guardBashCommand`, comments stripped. Comments are removed
 * because the allow path DESCRIBES the two forbidden calls by name — asserting
 * on raw text would fail on the very comment that documents the property.
 */
function bashPathCode(): string {
  const start = guardSource.indexOf("function guardBashCommand(");
  expect(start, "guardBashCommand not found in guard.ts").toBeGreaterThan(-1);
  const end = guardSource.indexOf("async function main(", start);
  expect(end, "main() not found after guardBashCommand").toBeGreaterThan(start);
  return stripComments(guardSource.slice(start, end));
}

/** The body of `main()`, comments stripped — the write-tool path. */
function writePathCode(): string {
  const start = guardSource.indexOf("async function main(");
  expect(start).toBeGreaterThan(-1);
  return stripComments(guardSource.slice(start));
}

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((line) => !/^\s*\/\//.test(line))
    .join("\n");
}

describe("guard.ts Bash path — the two settled constraints", () => {
  it("never resets the consecutive-block counter (260707-0750)", () => {
    expect(bashPathCode()).not.toContain("resetBlockCounter");
  });

  it("never emits a guard_allow event (260707-0751)", () => {
    expect(bashPathCode()).not.toContain("guard_allow");
  });

  it("keeps both on the write-tool path, so the gate cannot pass by deletion", () => {
    const writePath = writePathCode();
    expect(writePath).toContain("resetBlockCounter");
    expect(writePath).toContain("guard_allow");
  });

  it("falls through to a bare allow() as its final statement", () => {
    // Every state write on this path sits inside a branch that returns, so the
    // function's last statement being an unadorned allow() is what makes "an
    // innocuous Bash call has zero side effect" true rather than intended.
    const lines = bashPathCode()
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    expect(lines[lines.length - 1]).toBe("}");
    expect(lines[lines.length - 2]).toBe("allow();");
  });
});

describe("guard.ts Bash path — mutation check wiring", () => {
  const code = bashPathCode();

  it("calls classifyBashMutation", () => {
    expect(code).toContain("classifyBashMutation(command,");
  });

  it("gates the mutation check on the self-detect stand-down", () => {
    // The check must sit INSIDE `if (!isFusionPluginCwd()) { … }`. The git
    // policy above it deliberately is not gated.
    const gate = code.indexOf("if (!isFusionPluginCwd())");
    const call = code.indexOf("classifyBashMutation(");
    expect(gate, "mutation check is not gated on isFusionPluginCwd").toBeGreaterThan(-1);
    expect(call).toBeGreaterThan(gate);
  });

  it("does not gate the git branch policy on the stand-down", () => {
    const gitCall = code.indexOf("classifyGitCommand(");
    const gate = code.indexOf("if (!isFusionPluginCwd())");
    expect(gitCall).toBeGreaterThan(-1);
    expect(gitCall).toBeLessThan(gate);
  });

  it("feeds the classifier the config's protectedPaths", () => {
    expect(code).toContain("protectedPaths: config.guard.protectedPaths");
  });

  it("normalizes operands the same way the write path does", () => {
    // normalizeToRelative is the function that exists because Claude Code
    // sends absolute paths; the config's globs are relative.
    expect(code).toContain("normalize: normalizeToRelative");
    expect(writePathCode()).toContain("normalizeToRelative(rawFilePath)");
  });

  it("blocks through the same trigger, escalation and events as the write path", () => {
    expect(code).toContain('"protected_path"');
    expect(code).toContain("recordBlock(");
    expect(code).toContain("saveEscalation(escalation)");
    expect(code).toContain('halted ? "guard_halt" : "guard_block"');
    expect(code).toContain("block(reason)");
  });

  it("evaluates the git verdict before the mutation verdict", () => {
    expect(code.indexOf("classifyGitCommand(")).toBeLessThan(
      code.indexOf("classifyBashMutation("),
    );
  });
});

describe("guard.ts Bash path — the git override waives only the git op", () => {
  // The hole this closes: the override branch used to sit ABOVE the mutation
  // check and `return` after allow(), so FUSION_ALLOW_BRANCH_SWITCH=1 made
  // `git switch main && rm rules/x.md` allowed in full. That env var authorises
  // a branch switch; it is not consent to write a protected path. The three
  // assertions below pin the structure that keeps the two permissions separate.
  const code = bashPathCode();

  it("runs the mutation check before it reads verdict.overrideUsed", () => {
    const mutation = code.indexOf("classifyBashMutation(");
    const override = code.indexOf("verdict.overrideUsed");
    expect(override, "override branch not found").toBeGreaterThan(-1);
    expect(mutation).toBeLessThan(override);
  });

  it("does not return out of the override branch", () => {
    // Every `return` on this path belongs to a DENY. A return inside the
    // override branch would mean nothing follows it — which is exactly how the
    // hole was shaped when the branch sat first.
    const tail = code.slice(code.indexOf("verdict.overrideUsed"));
    expect(tail).not.toContain("return");
  });

  it("keeps the git deny above the mutation check, so one call blocks once", () => {
    // Both denies call recordBlock, which increments the consecutive-block
    // counter that drives the three-block halt. The git deny returns, so a
    // command that is both git-denied and mutation-denied records ONE block.
    const gitDeny = code.indexOf("if (verdict.deny)");
    const mutation = code.indexOf("classifyBashMutation(");
    expect(gitDeny).toBeGreaterThan(-1);
    expect(gitDeny).toBeLessThan(mutation);
    const gitDenyBlock = code.slice(gitDeny, mutation);
    expect(gitDenyBlock).toContain("recordBlock(");
    expect(gitDenyBlock).toContain("return;");
  });
});

describe("guard.ts Bash path — the arguments it passes actually bite", () => {
  // The wiring gate above is textual. This one is behavioural: it runs the
  // classifier with the shipped protectedPaths and the REAL normalizeToRelative
  // semantics (absolute-under-cwd → relative, everything else untouched), so a
  // wiring that compiled but matched nothing would fail here.
  const protectedPaths = JSON.parse(
    readFileSync(
      resolve(dirname(fileURLToPath(import.meta.url)), "../../config.json"),
      "utf-8",
    ),
  ).guard.protectedPaths as string[];

  const cwd = "/proj";
  const normalize = (p: string): string =>
    p === cwd
      ? ""
      : p.startsWith(cwd + "/")
        ? p.slice(cwd.length + 1)
        : p;

  const classify = (command: string) =>
    classifyBashMutation(command, { protectedPaths, normalize });

  it("denies a relative protected operand", () => {
    const v = classify("mv rules/x.md /tmp/");
    expect(v.deny).toBe(true);
    expect(v.reason).toContain("rules/x.md");
    expect(v.reason).toContain("mv rules/x.md /tmp/");
  });

  it("denies an absolute protected operand under the project root", () => {
    const v = classify("rm -f /proj/agents/coder.md");
    expect(v.deny).toBe(true);
    expect(v.targetPath).toBe("agents/coder.md");
  });

  it("denies a protected operand reached through `..`", () => {
    const v = classify("sed -i '' 's/MUST/may/' hooks/../rules/x.md");
    expect(v.deny).toBe(true);
    expect(v.targetPath).toBe("rules/x.md");
  });

  it("allows the same shapes against an unprotected path", () => {
    expect(classify("mv notes.txt /tmp/").deny).toBe(false);
    expect(classify("rm -f /proj/build/out.js").deny).toBe(false);
    expect(classify("sed -i '' 's/a/b/' notes.txt").deny).toBe(false);
  });

  it("allows an absolute path outside the project root", () => {
    expect(classify("rm -rf /tmp/rules/x.md").deny).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// End-to-end: run the guard as the hook actually runs — a fresh process, JSON
// on stdin, JSON on stdout — inside a throwaway project that has a workbench,
// so the escalation counter and the event log are real files we can read back.
//
// This is what the textual gates above cannot prove: how MANY blocks a single
// tool call records, and that an innocuous call writes nothing at all.
//
// The throwaway-project machinery lives in helpers/guard-harness.ts, shared
// with guard-bash-integration.test.ts (plan step 6). The cases below stay here
// because they are about the OVERRIDE interaction specifically — the property
// the step that wrote them established. There is no skip condition: `tsx` and
// `vitest` come from the same node_modules, so a skip could only hide a real
// problem.
// ---------------------------------------------------------------------------

describe(
  "guard.ts Bash path end-to-end — override, mutation, and the block count",
  () => {
    it(
      "denies the protected-path write even though FUSION_ALLOW_BRANCH_SWITCH is set",
      () => {
        withProject(({ root }) => {
          const res = runBash(root, "git switch main && rm rules/x.md", {
            FUSION_ALLOW_BRANCH_SWITCH: "1",
          });

          expect(res.decision).toBe("block");
          // The reason names the write, not the branch switch: the branch was
          // authorised, the write never was.
          expect(res.reason).toContain("rules/x.md");
          expect(res.reason).not.toContain("never switch git branches");

          const state = readEscalation(root);
          expect(state?.consecutiveBlocks).toBe(1);
          expect(state?.recentEvents.map((e) => e.trigger)).toEqual([
            "protected_path",
          ]);

          // No advisory: nothing was allowed, so nothing is noted as allowed.
          expect(readEvents(root).map((e) => e.event)).toEqual(["guard_block"]);
        });
      },
      CASE_TIMEOUT,
    );

    it(
      "denies the protected-path write even though FUSION_ALLOW_WORKTREE is set",
      () => {
        withProject(({ root }) => {
          const res = runBash(
            root,
            "git worktree add ../wt feature && rm -f agents/coder.md",
            { FUSION_ALLOW_WORKTREE: "1" },
          );

          expect(res.decision).toBe("block");
          expect(res.reason).toContain("agents/coder.md");

          const state = readEscalation(root);
          expect(state?.consecutiveBlocks).toBe(1);
          expect(state?.recentEvents.map((e) => e.trigger)).toEqual([
            "protected_path",
          ]);
        });
      },
      CASE_TIMEOUT,
    );

    it(
      "still allows an overridden branch switch on its own, and still notes it",
      () => {
        withProject(({ root }) => {
          const res = runBash(root, "git switch main", {
            FUSION_ALLOW_BRANCH_SWITCH: "1",
          });

          expect(res.decision).toBeUndefined();

          const state = readEscalation(root);
          expect(state?.consecutiveBlocks).toBe(0);
          expect(state?.recentEvents.map((e) => e.trigger)).toEqual([
            "git_branch_switch_override",
          ]);

          const events = readEvents(root);
          expect(events.map((e) => e.event)).toEqual(["guard_advisory"]);
          expect(events[0].detail).toContain("FUSION_ALLOW_BRANCH_SWITCH");
        });
      },
      CASE_TIMEOUT,
    );

    it(
      "still denies a branch switch when no override is set",
      () => {
        withProject(({ root }) => {
          const res = runBash(root, "git switch main");

          expect(res.decision).toBe("block");
          expect(res.reason).toContain("never switch git branches");

          const state = readEscalation(root);
          expect(state?.consecutiveBlocks).toBe(1);
          expect(state?.recentEvents.map((e) => e.trigger)).toEqual([
            "git_branch_switch",
          ]);
        });
      },
      CASE_TIMEOUT,
    );

    it(
      "records ONE block for a call that is both git-denied and mutation-denied",
      () => {
        withProject(({ root }) => {
          const res = runBash(root, "git switch main && rm rules/x.md");

          // Git denies first, so the user reads the branch reason. Two
          // recordBlock calls for one tool call would double-count the counter
          // that drives the three-block halt.
          expect(res.decision).toBe("block");
          expect(res.reason).toContain("never switch git branches");

          const state = readEscalation(root);
          expect(state?.consecutiveBlocks).toBe(1);
          expect(state?.recentEvents).toHaveLength(1);
          expect(readEvents(root)).toHaveLength(1);
        });
      },
      CASE_TIMEOUT,
    );

    it(
      "leaves guard state untouched for an innocuous call (260707-0750/0751)",
      () => {
        withProject(({ root }) => {
          expect(runBash(root, "ls -la").decision).toBeUndefined();

          // Neither file exists: no counter write, no guard_allow append.
          expect(readEscalation(root)).toBeNull();
          expect(readEvents(root)).toEqual([]);
        });
      },
      CASE_TIMEOUT,
    );

    it(
      "does not let an innocuous call reset the consecutive-block counter",
      () => {
        withProject(({ root }) => {
          runBash(root, "rm rules/x.md");
          expect(readEscalation(root)?.consecutiveBlocks).toBe(1);

          runBash(root, "git status");
          expect(readEscalation(root)?.consecutiveBlocks).toBe(1);

          // And the innocuous call in between appended no event of its own.
          expect(readEvents(root).map((e) => e.event)).toEqual(["guard_block"]);
        });
      },
      CASE_TIMEOUT,
    );
  },
);
