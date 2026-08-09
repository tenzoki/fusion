import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  CASE_TIMEOUT,
  readEscalation,
  readEvents,
  runBash,
  withProject,
} from "./helpers/guard-harness.js";

// ---------------------------------------------------------------------------
// Wiring gate for `guardBashCommand` — what the SOURCE has to keep saying.
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
// The one remaining check on this path — the git branch policy — is deny-only
// precisely so both survive. This gate asserts that on the SOURCE, which is what
// a future edit to guardBashCommand would break; the file-level proof
// (escalation.json and events.jsonl unchanged across an innocuous Bash call) is
// in guard-bash-integration.test.ts, which needs a temporary project root the
// write guard does not stand down in.
//
// ## What left this file
//
// It also carried the wiring of a mutation classifier that read a shell command
// and predicted which protected paths it was about to write, plus the halt gate
// that sat above it. Both are gone: the question was not decidable from the
// command text, the protected paths are measured after the call instead
// (`lib/protected-snapshot.ts`), and the user accepted the loss of the shell
// halt explicitly on 260807-0945. Nothing on this surface reads a command for
// anything but git any more, so the gates that pinned that reading have no
// subject left.
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

/**
 * The body of `emitBlockEvent`, comments stripped — the one place that turns a
 * `recordBlock` outcome into a `guard_block` or a `guard_halt`. It sits ABOVE
 * `guardBashCommand`, so `bashPathCode()` does not contain it.
 */
function blockEmitterCode(): string {
  const start = guardSource.indexOf("function emitBlockEvent(");
  expect(start, "emitBlockEvent not found in guard.ts").toBeGreaterThan(-1);
  const end = guardSource.indexOf("function guardBashCommand(", start);
  expect(end, "guardBashCommand not found after emitBlockEvent").toBeGreaterThan(
    start,
  );
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

describe("guard.ts Bash path — the branch policy is the whole of it", () => {
  const code = bashPathCode();

  it("classifies the command through the git policy", () => {
    expect(code).toContain("classifyGitCommand(command,");
  });

  it("is not gated on the self-detect stand-down at all", () => {
    // The branch policy runs everywhere, INCLUDING the plugin's own repo: this
    // hook only ever gated the AGENT's Bash calls, so standing it down here
    // would remove agent protection for zero human benefit. The assertion used
    // to be an ordering one, because a second check on this path DID stand down;
    // with that check gone, the absence of the condition is the exact statement.
    expect(code).not.toContain("isFusionPluginCwd");
  });

  it("blocks through the same trigger, escalation and events as the write path", () => {
    expect(code).toContain('"git_branch_switch"');
    expect(code).toContain("recordBlock(");
    expect(code).toContain("saveEscalation(escalation)");
    // The block/halt event pair used to be an inline ternary at each recordBlock
    // site. It goes through one shared emitter, so BOTH halves are asserted: the
    // Bash path calls it, and the emitter is still the thing that turns a
    // halting block into a guard_halt. Asserting only the call would let the
    // ternary be deleted from the helper; asserting only the helper would let
    // this path stop using it.
    expect(code).toContain("emitBlockEvent(");
    expect(blockEmitterCode()).toContain('halted ? "guard_halt" : "guard_block"');
    expect(writePathCode()).toContain("emitBlockEvent(");
    // The denied reason is the classifier's, held in a name because the deny is
    // now written before the two state writes that record it and both need the
    // same string. `block(verdict.reason ?? …)` inline was the older spelling;
    // what has to stay true is that the reason comes from the verdict.
    expect(code).toContain("verdict.reason ??");
    expect(code).toContain("() => block(reason)");
  });

  it("records exactly one block per tool call, and returns", () => {
    // Both surfaces feed one consecutive-block counter, and that counter drives
    // the three-block halt. The deny branch returns, so a command cannot be
    // counted twice on its way through this function.
    const deny = code.indexOf("if (verdict.deny)");
    expect(deny, "the git deny branch not found").toBeGreaterThan(-1);
    const denyBranch = code.slice(deny);
    expect(denyBranch).toContain("recordBlock(");
    expect(denyBranch).toContain("return;");
    expect(code.split("recordBlock(")).toHaveLength(2);
  });
});

describe("guard.ts write-tool path — one collapse, above both checks", () => {
  const code = writePathCode();

  it("collapses the spelling before either check reads it", () => {
    // `normalizeToRelative` returns a relative path UNTOUCHED, so CHECK 2 used
    // to compare the raw spelling against the protected list: `./agents/
    // coder.md` allowed and wrote the file `agents/coder.md` denies.
    expect(code).toContain("collapseSegments(normalizeToRelative(rawFilePath))");
    const collapse = code.indexOf("collapseSegments(");
    expect(collapse).toBeLessThan(code.indexOf("isHalted("));
    expect(collapse).toBeLessThan(code.indexOf("matchesAnyFolded(filePath"));
  });

  it("matches the protected list with case FOLDED", () => {
    // A glob compiles to a case-SENSITIVE regex, so `AGENTS/coder.md` missed
    // `agents/**` and wrote `agents/coder.md` on any case-insensitive
    // filesystem — the whole protected list, one letter, no flag. Pinned at
    // the call site because the plain `matchesAny` still exists in the module
    // and is still correct for the grant: swapping this one identifier back
    // reopens the bypass and changes nothing else.
    expect(code).toContain(
      "matchesAnyFolded(filePath, config.guard.protectedPaths)",
    );
    expect(code).not.toContain("matchesAny(filePath, config.guard");
  });

  it("does NOT strip the trailing separator here", () => {
    // A trailing separator widens whatever set it is matched against, which is
    // protection on the protected list and a bigger grant on the exempt one.
    // Stripping it at this site turned `Edit agents/` from a deny into an allow.
    expect(code).not.toContain("canonicalise(normalizeToRelative");
  });

  it("asks the exemption module, not a second copy of the rule", () => {
    expect(code).toContain("isExemptRulePath(filePath, rawFilePath, declared)");
  });

  it("hands the exemption the RAW spelling as well as the collapsed path", () => {
    // Gate 0 refuses a `..` segment, and `rawFilePath` is the last place one
    // still exists: `normalizeToRelative` resolves an absolute path through
    // `resolve` + `relative`, and `collapseSegments` finishes the job on a
    // relative one. Passing `filePath` for both arguments type-checks and
    // silently reopens the symlink escape, so the wiring is pinned here rather
    // than left to a reviewer's eye.
    expect(code).not.toContain("isExemptRulePath(filePath, filePath");
    const exemption = code.indexOf("isExemptRulePath(filePath");
    expect(exemption, "exemption call not found").toBeGreaterThan(-1);
    expect(code.slice(exemption)).toMatch(
      /^isExemptRulePath\(filePath, rawFilePath, declared\)/,
    );
  });

  it("subtracts what the PROJECT declared, never the effective list", () => {
    // Decision 260803-1314, gate 1b. The one substitution that would compile,
    // read as correct, and end the exemption in every project on earth: after
    // 260804-1630 an omitted `protectedPaths` inherits the plugin's list, and
    // the plugin's list contains `rules/**`. Pinned at the call site because
    // the type is `readonly string[]` either way — nothing but this assertion
    // and the loader's own docstring stands between the two spellings.
    expect(code).toContain("projectDeclaredProtectedPaths(config)");
    expect(code).not.toMatch(
      /isExemptRulePath\([^)]*config\.guard\.protectedPaths/,
    );
  });

  it("asks the same two spellings when it explains the refusal", () => {
    // The note comes from re-running the SAME gates on the SAME pair. Asking
    // with `filePath` twice would report a gate-2 refusal for a path gate 0
    // actually refused, which is a message describing a check that did not run.
    expect(code).toContain(
      "exemptionRefusalNote(filePath, rawFilePath, declared)",
    );
  });
});

describe("guard.ts — the refusal note is a diagnostic, never a verdict", () => {
  const whole = stripComments(guardSource);

  it("is asked only while a deny is being rendered", () => {
    // Off the allow path entirely: the extra filesystem work runs on the one
    // call in a session that was going to stop anyway. A note computed above
    // the deny would put gate 2's `lstat` on every exempted write.
    const write = writePathCode();
    expect(write.indexOf("if (!exempted) {")).toBeLessThan(
      write.indexOf("exemptionRefusalNote("),
    );
  });

  it("refuses to answer at all when the flag is unset", () => {
    // So a project that never uses the exemption reads the deny it always read.
    expect(whole).toContain(
      "if (!rulesWriteExemptionActive(process.env)) return null;",
    );
  });

  it("changes no verdict", () => {
    // The note is appended to a reason string and nothing else. If it ever
    // appears in a condition, it has stopped being a diagnostic.
    expect(writePathCode()).not.toMatch(/if\s*\([^)]*exemptionRefusalNote/);
  });
});

describe("guard.ts Bash path — the git override waives only the git op", () => {
  const code = bashPathCode();

  it("answers the override branch with allow, never block", () => {
    // This case used to read "does not return out of the override branch", on
    // the ground that a return there would stop the function ending in the bare
    // allow() the zero-side-effect property rests on. That reason stopped
    // holding: the branch now writes its own verdict FIRST and records the note
    // after it, so it has to return, and the function still ends in the bare
    // allow() — pinned by its own case above, which is where that property
    // belongs.
    //
    // What was actually being protected is that the override is not a second
    // deny surface. `FUSION_ALLOW_BRANCH_SWITCH` buys exactly the git op it
    // names, and a `block(` appearing under this branch would mean the flag had
    // grown a refusal of its own.
    const tail = code.slice(code.indexOf("verdict.overrideUsed"));
    expect(tail).toContain("allow,");
    expect(tail).not.toContain("block(");
  });

  it("reads the override only after the deny branch has passed", () => {
    // An override that was read FIRST used to allow the whole command and
    // return, which is how `FUSION_ALLOW_BRANCH_SWITCH=1` once bought more than
    // a branch switch. The deny branch has to be the first thing that answers.
    const deny = code.indexOf("if (verdict.deny)");
    const override = code.indexOf("verdict.overrideUsed");
    expect(override, "override branch not found").toBeGreaterThan(-1);
    expect(deny).toBeGreaterThan(-1);
    expect(deny).toBeLessThan(override);
  });
});

// ---------------------------------------------------------------------------
// End-to-end: run the guard as the hook actually runs — a fresh process, JSON
// on stdin, JSON on stdout — inside a throwaway project that has a workbench,
// so the escalation counter and the event log are real files we can read back.
//
// This is what the textual gates above cannot prove: how MANY blocks a single
// tool call records, and that an innocuous call writes neither.
// ---------------------------------------------------------------------------

describe(
  "guard.ts Bash path end-to-end — the override and the block count",
  () => {
    it(
      "allows an overridden branch switch, and notes it",
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
      "keeps the two overrides apart — the worktree flag does not lift the branch deny",
      () => {
        // Each override waives only what it names. The pairing used to matter
        // most against the protected-path check, which this surface no longer
        // carries; between the two git denies it still does.
        withProject(({ root }) => {
          const res = runBash(root, "git switch main", {
            FUSION_ALLOW_WORKTREE: "1",
          });

          expect(res.decision).toBe("block");
          expect(res.reason).toContain("never switch git branches");
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
      "records ONE block for a command with two denying segments",
      () => {
        withProject(({ root }) => {
          const res = runBash(root, "git switch main && git worktree add ../wt x");

          // Two recordBlock calls for one tool call would double-count the
          // counter that drives the three-block halt.
          expect(res.decision).toBe("block");

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

          // Neither file exists: no counter write, no guard_allow append. The
          // PreToolUse fingerprint DOES land in `.guard-state/` on this call —
          // that is the measurement's own bookkeeping, and the two issues are
          // about the counter and the event log, which are named here directly.
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
          runBash(root, "git switch main");
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
