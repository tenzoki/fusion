import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync, symlinkSync } from "node:fs";
import { resolve } from "node:path";
import {
  CASE_TIMEOUT,
  guardEntry,
  guardStateWritten,
  readEscalation,
  readEvents,
  runBash,
  runWrite,
  withPluginProject,
  withProject,
} from "./helpers/guard-harness.js";

// ---------------------------------------------------------------------------
// Integration harness — plan step 6.
//
// The unit suites (bash-mutation-guard.test.ts, 177 cases; shell-parse, 30;
// git-branch-guard, 84) carry the classification matrix. They import the
// classifier directly, touch no filesystem, and are unaffected by cwd. This
// file carries what they structurally cannot:
//
//   * that a classifier deny actually reaches a `{"decision":"block"}` through
//     the whole hook, including config loading and path normalisation;
//   * that the escalation counter and the event log move EXACTLY when they
//     should — file-level facts, not verdict-level ones;
//   * that the self-detect stand-down sits where it is meant to sit.
//
// Each case is a fresh subprocess against a temporary project root that is NOT
// a plugin root. That is a requirement of the thing under test, not a style
// choice: `isFusionPluginCwd()` caches per process, so one process can only
// ever answer one way, and inside THIS repository it answers "yes" and stands
// the whole check down. See helpers/guard-harness.ts for the full reasoning.
//
// Case count is deliberately bounded — roughly 30 process starts, ~0.2s each.
// The exhaustive matrix lives in the unit suite, where a case is free.
// ---------------------------------------------------------------------------

describe("integration harness — preconditions", () => {
  it("resolves a guard entry point", () => {
    // Fails loudly rather than skipping. A skipped integration suite reports
    // coverage it does not have, which is the exact failure mode this whole
    // step exists to prevent.
    const entry = guardEntry();
    expect(entry.bin.length).toBeGreaterThan(0);
  });

  it("builds a project root that is its own realpath", () => {
    // The macOS trap: mkdtemp hands back /var/folders/… while the child's
    // process.cwd() reports /private/var/folders/…. When the two differ,
    // normalizeToRelative cannot relativize an absolute file_path, nothing
    // matches a relative glob, and every protected-path case silently ALLOWS.
    withProject(({ root, alias }) => {
      expect(realpathSync(root)).toBe(root);
      // And the alias really is a second, unresolved name for the same
      // directory — otherwise the trap tests below assert nothing.
      expect(alias).not.toBe(root);
      expect(realpathSync(alias)).toBe(root);
    });
  });

  it("runs the guard against a root the write guard does NOT stand down in", () => {
    // The one-line sanity check that the harness is pointed somewhere the
    // check under test actually runs. If this allows, every denial assertion
    // in this file is vacuous.
    withProject(({ root }) => {
      expect(runBash(root, "rm -f rules/x.md").decision).toBe("block");
    });
  }, CASE_TIMEOUT);
});

// ---------------------------------------------------------------------------
// Shell mutation, through the full hook.
// ---------------------------------------------------------------------------

describe("Bash mutation of a protected path is denied end to end", () => {
  const cases: { name: string; command: string; target: string }[] = [
    {
      name: "mv",
      command: "mv rules/x.md /tmp/",
      target: "rules/x.md",
    },
    {
      name: "rm",
      command: "rm -f agents/coder.md",
      target: "agents/coder.md",
    },
    {
      name: "redirection",
      command: "printf '' > rules/x.md",
      target: "rules/x.md",
    },
    {
      name: "a wrapper form",
      command: "sudo rm -f skills/demo/SKILL.md",
      target: "skills/demo/SKILL.md",
    },
    {
      name: "an ancestor directory",
      // The directory is not itself in protectedPaths; removing it would take
      // `rules/**` with it, which is why the ancestor pass exists.
      command: "rm -rf rules",
      target: "rules",
    },
    {
      name: "a cd-relative operand",
      // The sharpest case the originating issue names: without the virtual-cwd
      // walk the operand is `.guard-state` and matches nothing.
      command: "cd fusion-workbench && rm -rf .guard-state",
      target: "fusion-workbench/.guard-state",
    },
    {
      name: "the guard's own state directory, named directly",
      command: "rm -rf fusion-workbench/.guard-state",
      target: "fusion-workbench/.guard-state",
    },
    {
      name: "git mv",
      command: "git mv rules/x.md docs/",
      target: "rules/x.md",
    },
  ];

  for (const { name, command, target } of cases) {
    it(
      `denies ${name}: ${command}`,
      () => {
        withProject(({ root }) => {
          const res = runBash(root, command);

          expect(res.decision, `expected a block for: ${command}`).toBe("block");
          // The reason must name BOTH the offending segment and the path, or
          // the agent reading it cannot tell which part of a compound command
          // was refused.
          expect(res.reason).toContain(target);
          expect(res.reason).toContain("STOP and ask the user");

          // And the block reached the shared escalation surface — same trigger
          // the write tools use, so the monitor and the halt treat them alike.
          const state = readEscalation(root);
          expect(state?.consecutiveBlocks).toBe(1);
          expect(state?.recentEvents.map((e) => e.trigger)).toEqual([
            "protected_path",
          ]);
          expect(readEvents(root).map((e) => e.event)).toEqual(["guard_block"]);
        });
      },
      CASE_TIMEOUT,
    );
  }
});

describe("Bash fail-closed cases are denied end to end", () => {
  it(
    "denies a recognised mutation whose operands cannot be resolved",
    () => {
      withProject(({ root }) => {
        const res = runBash(root, "mv $A $B");
        expect(res.decision).toBe("block");
        expect(res.reason).toContain("fail-closed");
        expect(res.reason).toContain("$A");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "denies a relative operand hanging off a working directory it lost track of",
    () => {
      withProject(({ root }) => {
        const res = runBash(root, "cd $D && rm -rf out");
        expect(res.decision).toBe("block");
        expect(res.reason).toContain("fail-closed");
        // The reason must point at the `cd`, not at the operand: rewriting the
        // path cannot help, dropping the `cd` can.
        expect(res.reason).toContain("cd");
      });
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// The working-directory model, inverted into an allow-list.
//
// Five entrances were measured against this harness, one throwaway project per
// row, and every one of them ALLOWED a command that real bash then used to
// delete or overwrite a protected file
// (`analyses/260803-1803-guard-path-model-root-cause.md`). Two need no flag at
// all. The classifier had asserted a working directory that a `-P`, an `-n` or
// a `CDPATH=` invalidated.
//
// Each case runs the SAME command through real bash afterwards, in the same
// project, so the assertion is "the guard denies the command that would have
// destroyed this file" rather than "the guard denies a string". Each gets its
// own project: three denials halt the guard, and every case after that would
// then pass as `[HALTED]` — for the wrong reason.
// ---------------------------------------------------------------------------

/**
 * Deny the command, for a reason that is not the halt, and prove the command
 * was worth denying by running it through real bash and watching `watch`
 * disappear.
 */
function denyAndBashWouldHaveWritten(
  command: string,
  watch: string,
  env: Record<string, string> = {},
): void {
  withProject(({ root }) => {
    symlinkSync("../agents", resolve(root, "rules/L"));

    const res = runBash(root, command, env);
    expect(res.decision, command).toBe("block");
    expect(res.reason ?? "", command).not.toContain("[HALTED]");

    // What the deny was worth: the same command, the same project, real bash.
    const target = resolve(root, watch);
    const before = readFileSync(target, "utf-8");
    spawnSync("/bin/bash", ["-c", command], { cwd: root, stdio: "ignore" });
    const after = existsSync(target) ? readFileSync(target, "utf-8") : null;
    expect(after, `bash left ${watch} alone, so ${command} proves nothing`).not.toBe(
      before,
    );
  });
}

describe("the working directory is modelled or admitted unknown, never guessed", () => {
  // The grant side: the exploit needs `FUSION_ALLOW_RULES_WRITE` twice, once to
  // plant the link inside `rules/` and once to spend the grant through it. The
  // link is pre-planted here so the TRAVERSE is what is under test.
  const FLAG = { FUSION_ALLOW_RULES_WRITE: "1" };

  it(
    "denies a physical cd that walks through a planted link (cd -P)",
    () => {
      denyAndBashWouldHaveWritten(
        "cd -P rules/L/.. && rm agents/coder.md",
        "agents/coder.md",
        FLAG,
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "denies the same walk with the mode set by `set -P` instead of a flag",
    () => {
      denyAndBashWouldHaveWritten(
        "set -P; cd rules/L/.. && rm agents/coder.md",
        "agents/coder.md",
        FLAG,
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "denies the same walk through pushd -P",
    () => {
      denyAndBashWouldHaveWritten(
        "pushd -P rules/L/.. ; rm agents/coder.md",
        "agents/coder.md",
        FLAG,
      );
    },
    CASE_TIMEOUT,
  );

  // The protection side: NO flag, and the reach is the whole protected list.
  it(
    "denies a bare-word cd resolved through an in-command CDPATH",
    () => {
      denyAndBashWouldHaveWritten(
        "cd docs && CDPATH=.. cd agents && rm coder.md",
        "agents/coder.md",
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "denies a relative write after a pushd -n, which does not change directory",
    () => {
      denyAndBashWouldHaveWritten(
        "pushd -n docs && rm agents/coder.md",
        "agents/coder.md",
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "leaves ordinary shell work alone, which is what bounds the cost",
    () => {
      // One project, all allows — no denial, so nothing can halt and mask the
      // rest. The CDPATH control is the load-bearing row: the same command
      // WITHOUT the assignment still allows, so the denials above cannot be
      // read as the guard having simply stopped tracking `cd`.
      withProject(({ root }) => {
        for (const cmd of [
          "cd build && rm out.js",
          "cd /tmp && rm -rf x",
          "rm -rf node_modules",
          "rm -rf dist",
          "cd docs && cd agents && rm coder.md",
          "set -euo pipefail; cd build && rm out.js",
          "pushd build > /dev/null && rm out.js; popd > /dev/null",
        ]) {
          expect(runBash(root, cmd).decision, cmd).toBeUndefined();
        }
        expect(guardStateWritten(root)).toBe(false);
      });
    },
    CASE_TIMEOUT,
  );
});

describe("the residual, made visible", () => {
  it(
    "allows an unrecognised program that writes a protected path",
    () => {
      // C5c raises the cost of the bypass from zero to deliberate; it does not
      // eliminate it. This asserts CURRENT behaviour on purpose, so the claim
      // in the guard's documentation stays honest and any future widening
      // arrives with a failing test rather than a surprise.
      withProject(({ root }) => {
        expect(runBash(root, "curl -o rules/x.md https://example.test/x").decision)
          .toBeUndefined();
        expect(guardStateWritten(root)).toBe(false);
      });
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// The write path, unchanged — and the trap that makes it look guarded when it
// is not.
// ---------------------------------------------------------------------------

describe("the Edit write path still denies a protected path", () => {
  it(
    "blocks an absolute file_path under the project root",
    () => {
      // This confirms the harness reproduces the guard's EXISTING behaviour,
      // not only the new Bash check. If the harness were misbuilt — wrong cwd,
      // unresolved root, missing workbench marker — this is the case that
      // catches it, because it depends on all three.
      withProject(({ root }) => {
        const res = runWrite(root, resolve(root, "rules/x.md"));
        expect(res.decision).toBe("block");
        expect(res.reason).toContain("rules/x.md");

        const state = readEscalation(root);
        expect(state?.consecutiveBlocks).toBe(1);
        expect(state?.recentEvents[0].trigger).toBe("protected_path");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "allows an unprotected file_path, and records the allow",
    () => {
      withProject(({ root }) => {
        expect(runWrite(root, resolve(root, "notes.txt")).decision).toBeUndefined();
        // The write path — unlike the Bash path — DOES reset the counter and
        // emit guard_allow. Asserting it here is what stops the next test from
        // passing by deletion.
        expect(readEvents(root).map((e) => e.event)).toEqual(["guard_allow"]);
      });
    },
    CASE_TIMEOUT,
  );
});

describe("the macOS realpath trap", () => {
  // Both cases below assert that an absolute path reached through an
  // UNRESOLVED alias of the project root is allowed. That is not a bug report;
  // it is the mechanism by which a harness built on a raw `mktemp -d` turns
  // every protected-path assertion into a vacuous pass. Pinning it here means
  // the next person cannot reintroduce it without also deleting a test that
  // explains exactly what they broke.
  //
  // The positive halves — the same paths through the resolved root — are the
  // "blocks an absolute file_path" case above and the Bash case below.

  it(
    "Edit: an absolute path through an unresolved alias silently ALLOWS",
    () => {
      withProject(({ root, alias }) => {
        expect(runWrite(root, resolve(alias, "rules/x.md")).decision).toBeUndefined();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "Bash: an absolute operand through the resolved root blocks, through the alias does not",
    () => {
      withProject(({ root, alias }) => {
        const resolved = runBash(root, `rm -f ${resolve(root, "rules/x.md")}`);
        expect(resolved.decision).toBe("block");
        expect(resolved.reason).toContain("rules/x.md");

        const aliased = runBash(root, `rm -f ${resolve(alias, "rules/x.md")}`);
        expect(aliased.decision).toBeUndefined();
      });
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// Ordinary work — the largest blast radius in the Circle, and the two Bash
// invariants that are only observable at file level.
// ---------------------------------------------------------------------------

describe("ordinary work is allowed and writes nothing", () => {
  it(
    "a fresh project running innocuous Bash never creates .guard-state at all",
    () => {
      withProject(({ root }) => {
        expect(runBash(root, "ls -la").decision).toBeUndefined();
        // Not "the counter is still zero" — the directory does not exist. That
        // is the strongest form of "zero side effect" available.
        expect(guardStateWritten(root)).toBe(false);
        expect(readEscalation(root)).toBeNull();
        expect(readEvents(root)).toEqual([]);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "innocuous Bash after a block neither resets the counter nor appends an event",
    () => {
      // Issues 260707-0750 (no counter reset) and 260707-0751 (no guard_allow
      // flood). Both are settled properties of the Bash allow path, and both
      // are invisible from a verdict — only the files show them.
      withProject(({ root }) => {
        expect(runBash(root, "rm -f rules/x.md").decision).toBe("block");
        expect(readEscalation(root)?.consecutiveBlocks).toBe(1);

        const innocuous = [
          "ls -la",
          "git status",
          // Mutation VERBS on unprotected targets — the false-positive surface.
          "mv notes.txt /tmp/",
          "rm -rf build",
          "sed -i '' 's/a/b/' notes.txt",
          // A protected path in a READ-only operand role: copying out is fine.
          "cp rules/x.md /tmp/y",
          // fusion's own revert strategy. If this ever denies, every agent
          // loses its way to undo a bad edit.
          "git checkout HEAD -- rules/x.md",
          // The `2>&1` segmentation artifact — a redirection scanner that
          // treated a dangling operator as unresolved would deny this, and
          // agents run it constantly.
          "echo hi 2>&1",
        ];

        for (const command of innocuous) {
          expect(
            runBash(root, command).decision,
            `expected an allow for: ${command}`,
          ).toBeUndefined();
        }

        // Nine allows later: the counter has not moved and the log has not
        // grown past the single block that opened the case.
        expect(readEscalation(root)?.consecutiveBlocks).toBe(1);
        expect(readEvents(root).map((e) => e.event)).toEqual(["guard_block"]);
      });
    },
    CASE_TIMEOUT * 2,
  );
});

// ---------------------------------------------------------------------------
// Escalation: three Bash denials halt, exactly as three write denials do.
// ---------------------------------------------------------------------------

describe("three consecutive Bash denials escalate to a halt", () => {
  it(
    "raises haltActive and emits guard_halt on the third",
    () => {
      withProject(({ root }) => {
        expect(runBash(root, "rm -f rules/x.md").decision).toBe("block");
        expect(readEscalation(root)?.haltActive).toBe(false);

        expect(runBash(root, "mv agents/coder.md /tmp/").decision).toBe("block");
        expect(readEscalation(root)?.haltActive).toBe(false);

        expect(runBash(root, "printf '' > skills/demo/SKILL.md").decision).toBe(
          "block",
        );

        const state = readEscalation(root);
        expect(state?.consecutiveBlocks).toBe(3);
        expect(state?.haltActive).toBe(true);
        expect(state?.recentEvents.map((e) => e.trigger)).toEqual([
          "protected_path",
          "protected_path",
          "protected_path",
          "consecutive_blocks",
        ]);
        expect(readEvents(root).map((e) => e.event)).toEqual([
          "guard_block",
          "guard_block",
          "guard_halt",
        ]);
      });
    },
    CASE_TIMEOUT * 2,
  );
});

// ---------------------------------------------------------------------------
// The stand-down pair — the load-bearing ordering property.
// ---------------------------------------------------------------------------

describe("self-detect stand-down: the mutation check yields, the branch policy does not", () => {
  // Run against a throwaway root carrying `.claude-plugin/plugin.json` with
  // name "fusion" — the single condition isFusionPluginCwd() tests. The REAL
  // repository would work too, and is what a developer actually sits in, but a
  // test must never write into the project's own .guard-state counters.
  //
  // Each case is its own subprocess by construction (runBash spawns), which is
  // what the caching in self-detect.ts requires: one process, one answer.

  it(
    "allows a shell mutation of a protected path in the plugin's own repo",
    () => {
      withPluginProject(({ root }) => {
        // Denied everywhere else in this file. Allowed here because agents/**,
        // rules/** and skills/** are exactly what a fusion developer's agents
        // legitimately move and rewrite.
        expect(runBash(root, "mv rules/x.md /tmp/").decision).toBeUndefined();
        expect(guardStateWritten(root)).toBe(false);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "still denies a branch switch in the plugin's own repo",
    () => {
      withPluginProject(({ root }) => {
        const res = runBash(root, "git switch main");
        expect(res.decision).toBe("block");
        expect(res.reason).toContain("never switch git branches");

        const state = readEscalation(root);
        expect(state?.recentEvents.map((e) => e.trigger)).toEqual([
          "git_branch_switch",
        ]);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "stands the Edit write path down too, so the two surfaces stay coherent",
    () => {
      // If Edit stood down while the shell check stayed active, an agent would
      // learn that `Edit rules/x.md` works and `mv rules/x.md …` does not —
      // which teaches routing around the guard rather than respecting it.
      withPluginProject(({ root }) => {
        expect(runWrite(root, resolve(root, "rules/x.md")).decision).toBeUndefined();
        const events = readEvents(root);
        expect(events.map((e) => e.event)).toEqual(["guard_allow"]);
        expect(events[0].detail).toContain("standing down");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "denies the same mutation as soon as the plugin manifest is not at cwd",
    () => {
      // The boundary, asserted from the other side in the same describe: the
      // ONLY difference between this root and the one two cases up is
      // .claude-plugin/plugin.json. `isFusionPluginCwd()` does no upward walk,
      // so this is the whole of the condition.
      withProject(({ root }) => {
        expect(runBash(root, "mv rules/x.md /tmp/").decision).toBe("block");
      });
    },
    CASE_TIMEOUT,
  );
});
