import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CASE_TIMEOUT,
  GOVERNED_PATH,
  governedFiles,
  guardEntry,
  readEscalation,
  readEvents,
  runBash,
  runWrite,
  withGovernedProject,
  withPluginProject,
  withProject,
} from "./helpers/guard-harness.js";

// ---------------------------------------------------------------------------
// The guard, run as the hook actually runs — a fresh process, JSON on stdin,
// JSON on stdout, against a throwaway project root.
//
// ## What this file used to be, and what is left of it
//
// It carried the end-to-end half of a classifier that read a shell command and
// predicted which files it was about to write. That classifier is gone: the
// question "will this command write?" is not decidable from the command text,
// and the guard now MEASURES what a protected path holds before and after every
// tool call instead (`lib/protected-snapshot.ts`, and
// `protected-snapshot-integration.test.ts` for its end-to-end cases).
//
// Every case here that asserted a shell-mutation deny went with it. What
// remains is what the retirement did not touch, and each of the four is a
// property a future edit could still break:
//
//   * the WRITE-tool path still denies a protected path through the whole hook,
//     including config loading and path normalisation;
//   * the escalation counter and the event log move EXACTLY when they should —
//     file-level facts, not verdict-level ones;
//   * the self-detect stand-down covers the write tools;
//   * fusion's own revert strategy runs.
//
// A second policy outlived the first here — the git branch guard, which read the
// same command text to predict whether HEAD would move. It was deleted on
// 260809 for the reason the classifier was, and with it went every deny this
// surface had. So `Bash` now contributes no block, no counter movement and no
// event anywhere in this file; the cases that remain on it assert that silence
// and the one command fusion cannot afford to lose.
//
// Each case is a fresh subprocess against a temporary project root that is NOT
// a plugin root. That is a requirement of the thing under test, not a style
// choice: `isFusionPluginCwd()` caches per process, so one process can only
// ever answer one way, and inside THIS repository it answers "yes" and stands
// the write guard down. See helpers/guard-harness.ts for the full reasoning.
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
      // directory — otherwise the trap test below asserts nothing.
      expect(alias).not.toBe(root);
      expect(realpathSync(alias)).toBe(root);
    });
  });

  it("runs the guard against a root the write guard does NOT stand down in", () => {
    // The one-line sanity check that the harness is pointed somewhere the
    // check under test actually runs. If this allows, every denial assertion
    // in this file is vacuous.
    //
    // Asserted on the WRITE surface. It used to be a shell mutation, which is
    // no longer a deny anywhere — a stand-down and a retired classifier would
    // now look identical from the shell, which is exactly what a precondition
    // must not do.
    withGovernedProject(({ root }) => {
      expect(runWrite(root, resolve(root, GOVERNED_PATH)).decision).toBe("block");
    });
  }, CASE_TIMEOUT);
});

// ---------------------------------------------------------------------------
// The write path — and the trap that makes it look guarded when it is not.
// ---------------------------------------------------------------------------

describe("the Edit write path still denies a governed path", () => {
  it(
    "blocks an absolute file_path under the project root",
    () => {
      // This confirms the harness reproduces the guard's behaviour end to end.
      // If the harness were misbuilt — wrong cwd, unresolved root, missing
      // workbench marker — this is the case that catches it, because it depends
      // on all three.
      withGovernedProject(({ root }) => {
        const res = runWrite(root, resolve(root, GOVERNED_PATH));
        expect(res.decision).toBe("block");
        expect(res.reason).toContain(GOVERNED_PATH);

        const state = readEscalation(root);
        expect(state?.consecutiveBlocks).toBe(1);
        expect(state?.recentEvents[0].trigger).toBe("decision_governed");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "allows an unguarded file_path, and records the allow",
    () => {
      withGovernedProject(({ root }) => {
        expect(runWrite(root, resolve(root, "notes.txt")).decision).toBeUndefined();
        // The write path — unlike the Bash path — DOES reset the counter and
        // emit guard_allow. Asserting it here is what stops the Bash-side cases
        // below from passing by deletion.
        expect(readEvents(root).map((e) => e.event)).toEqual(["guard_allow"]);
      });
    },
    CASE_TIMEOUT,
  );
});

describe("the macOS realpath trap", () => {
  // The case below asserts that an absolute path reached through an UNRESOLVED
  // alias of the project root is allowed. That is not a bug report; it is the
  // mechanism by which a harness built on a raw `mktemp -d` turns every
  // denial assertion into a vacuous pass. Pinning it here means the
  // next person cannot reintroduce it without also deleting a test that
  // explains exactly what they broke.
  //
  // The positive half — the same path through the resolved root — is the
  // "blocks an absolute file_path" case above.

  it(
    "Edit: an absolute path through an unresolved alias silently ALLOWS",
    () => {
      withGovernedProject(({ root, alias }) => {
        expect(runWrite(root, resolve(alias, GOVERNED_PATH)).decision).toBeUndefined();
      });
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// Ordinary work — the two Bash invariants that are only observable at file
// level.
//
// Both are stated in prose at guard.ts's Bash allow path and both are traced to
// a filed issue: an innocuous Bash call must not reset the consecutive-block
// counter (260707-0750) and must not append a guard_allow event (260707-0751).
//
// ## Why these are no longer asserted as "`.guard-state/` does not exist"
//
// They used to be, and that spelling was the strongest available: a fresh
// project running innocuous Bash created no state directory at all. It is
// wrong now, and would be wrong even if the two properties were violated. The
// PreToolUse hook writes a fingerprint of every protected path into
// `.guard-state/protected-snapshot.json` on every guarded tool call, so the
// directory exists after the first `ls -la` — while the counter and the event
// log, which are what the two issues are about, stay untouched. Asserting the
// directory's absence would now fail on a guard that is behaving perfectly, and
// deleting the cases would drop two properties that still hold. So the
// assertion is on the two files the issues name.
// ---------------------------------------------------------------------------

describe("ordinary work is allowed and writes nothing", () => {
  it(
    "a fresh project running innocuous Bash writes no counter and no event",
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
    "innocuous Bash after a block neither resets the counter nor appends an event",
    () => {
      // The opening block is a write-tool deny. It has been three things: `rm -f
      // rules/x.md` under the mutation classifier, then a branch switch, and now
      // this — because the Bash surface has no deny of its own left to open
      // with. The property under test never depended on which policy blocked,
      // only that a block is standing when the innocuous calls run.
      withGovernedProject(({ root }) => {
        expect(runWrite(root, resolve(root, GOVERNED_PATH)).decision).toBe("block");
        expect(readEscalation(root)?.consecutiveBlocks).toBe(1);

        const innocuous = [
          "ls -la",
          "git status",
          // Mutation verbs on unprotected targets — commands agents run
          // constantly, and the surface a returning classifier would light up.
          "mv notes.txt /tmp/",
          "rm -rf build",
          "sed -i '' 's/a/b/' notes.txt",
          // A guarded path in a READ-only operand role: copying out is fine.
          `cp ${GOVERNED_PATH} /tmp/y`,
          // fusion's own revert strategy. If this ever denies, every agent
          // loses its way to undo a bad edit.
          `git checkout HEAD -- ${GOVERNED_PATH}`,
          "echo hi 2>&1",
        ];

        for (const command of innocuous) {
          expect(
            runBash(root, command).decision,
            `expected an allow for: ${command}`,
          ).toBeUndefined();
        }

        // Eight allows later: the counter has not moved and the log has not
        // grown past the single block that opened the case.
        expect(readEscalation(root)?.consecutiveBlocks).toBe(1);
        expect(readEvents(root).map((e) => e.event)).toEqual(["guard_block"]);
      });
    },
    CASE_TIMEOUT * 2,
  );
});

// ---------------------------------------------------------------------------
// The stand-down pair — the load-bearing ordering property.
// ---------------------------------------------------------------------------

describe("self-detect stand-down: the write guard yields", () => {
  // Run against a throwaway root carrying `.claude-plugin/plugin.json` with
  // name "fusion" — the single condition isFusionPluginCwd() tests. The REAL
  // repository would work too, and is what a developer actually sits in, but a
  // test must never write into the project's own .guard-state counters.
  //
  // Each case is its own subprocess by construction (runBash spawns), which is
  // what the caching in self-detect.ts requires: one process, one answer.
  //
  // The measurement side of the stand-down — a protected path changed by a
  // shell in the plugin's own repo is NOT reverted — is asserted in
  // `protected-snapshot-integration.test.ts`, "the stand-downs".

  it(
    "stands the Edit write path down",
    () => {
      withPluginProject(
        ({ root }) => {
          expect(runWrite(root, resolve(root, GOVERNED_PATH)).decision).toBeUndefined();
          const events = readEvents(root);
          expect(events.map((e) => e.event)).toEqual(["guard_allow"]);
          expect(events[0].detail).toContain("standing down");
        },
        { files: governedFiles() },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "denies the same write as soon as the plugin manifest is not at cwd",
    () => {
      // The boundary, asserted from the other side in the same describe: the
      // ONLY difference between this root and the one above is
      // .claude-plugin/plugin.json. `isFusionPluginCwd()` does no upward walk,
      // so this is the whole of the condition.
      withGovernedProject(({ root }) => {
        expect(runWrite(root, resolve(root, GOVERNED_PATH)).decision).toBe("block");
      });
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// git's revert strategy, end to end.
//
// The orchestrator reverts an agent's out-of-scope edit with
// `git checkout HEAD -- <paths>`, so this command running is a precondition of
// fusion's own error handling. Two retired policies each had to be argued into
// letting it through — the mutation classifier because it names a file, the
// branch policy because it names `HEAD` — and it survived both by a
// discriminator that could have been got wrong. Nothing inspects it now, which
// makes this the case that would notice a third policy arriving on this surface
// and taking it out.
//
// Scope: the PreToolUse VERDICT, on ordinary project files. The two paths this
// used to revert were `rules/x.md` and `agents/coder.md`, chosen when they were
// the harness's protected fixtures and the case doubled as a statement about
// what the guard does to a revert of a protected file. Nothing here depended on
// that, and the fixtures are going, so it reverts unremarkable files instead.
//
// The effect side asserts the command really does revert: the working file is
// dirtied first, and the command has to put it back. An allow asserted without
// the effect would pass just as well against a guard that had broken the
// command some other way.
// ---------------------------------------------------------------------------

/** The two shells, because Claude Code starts the user's login shell, not bash. */
const SHELLS = { bash: "/bin/bash", zsh: "/bin/zsh" } as const;

/** The file the revert puts back. Seeded, tracked, and guarded by nothing. */
const REVERT_TARGET = "notes.txt";

/**
 * Turn a harness project into a git repository with two commits, so `HEAD~1`
 * exists, differs from `HEAD`, and a checkout of either is a real write.
 */
function initRepo(root: string): void {
  const git = (...args: string[]): void => {
    const res = spawnSync("git", args, {
      cwd: root,
      stdio: "ignore",
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "harness",
        GIT_AUTHOR_EMAIL: "harness@example.invalid",
        GIT_COMMITTER_NAME: "harness",
        GIT_COMMITTER_EMAIL: "harness@example.invalid",
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_CONFIG_SYSTEM: "/dev/null",
      },
    });
    if (res.status !== 0) {
      throw new Error(`harness git ${args.join(" ")} failed (${String(res.status)})`);
    }
  };
  git("init", "-q", ".");
  git("add", "-A");
  git("commit", "-qm", "one");
  writeFileSync(resolve(root, REVERT_TARGET), "notes, revised\n", "utf-8");
  writeFileSync(resolve(root, "build/out.js"), "// built, revised\n", "utf-8");
  git("commit", "-qam", "two");
}

describe("the revert strategy is allowed, and it reverts", () => {
  for (const form of [`git checkout HEAD -- ${REVERT_TARGET}`, "git checkout HEAD -- ."]) {
    for (const shell of ["bash", "zsh"] as const) {
      it(
        `allows and reverts (${shell}): ${form}`,
        () => {
          withProject(({ root }) => {
            initRepo(root);
            const res = runBash(root, form);
            expect(res.decision ?? "allow").not.toBe("block");
          });

          withProject(({ root }) => {
            initRepo(root);
            const target = resolve(root, REVERT_TARGET);
            const committed = readFileSync(target, "utf-8");
            writeFileSync(target, "# an agent's out-of-scope edit\n", "utf-8");
            spawnSync(SHELLS[shell], ["-c", form], { cwd: root, stdio: "ignore" });
            expect(readFileSync(target, "utf-8"), shell).toBe(committed);
          });
        },
        CASE_TIMEOUT,
      );
    }
  }

  it(
    "leaves the file in place — the revert is not a delete",
    () => {
      // Guards the assertion above against a git that "reverted" by removing
      // the file, which would satisfy a content comparison against nothing.
      withProject(({ root }) => {
        initRepo(root);
        spawnSync(SHELLS.bash, ["-c", `git checkout HEAD -- ${REVERT_TARGET}`], {
          cwd: root,
          stdio: "ignore",
        });
        expect(existsSync(resolve(root, REVERT_TARGET))).toBe(true);
      });
    },
    CASE_TIMEOUT,
  );
});
