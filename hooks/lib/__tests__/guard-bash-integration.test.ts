import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CASE_TIMEOUT,
  configFiles,
  guardEntry,
  guardStateWritten,
  readEvents,
  runBash,
  runGuard,
  runWrite,
  withProject,
} from "./helpers/guard-harness.js";

// ---------------------------------------------------------------------------
// The guard, run as the hook actually runs — a fresh process, JSON on stdin,
// JSON on stdout, against a throwaway project root.
//
// ## What this file is now
//
// Two properties and one command, and every one of them is about SILENCE or
// about a trace rather than about a verdict. The hook reached its last verdict
// on 2026-08-16; `guard.ts` allows every payload it is given.
//
//   * a fresh project running innocuous Bash writes NOTHING — no state
//     directory, no event row (issues 260707-0750 and 260707-0751);
//   * a write tool is allowed and RECORDED, which is the whole of what the hook
//     still produces;
//   * `git checkout HEAD -- <paths>` runs, which is fusion's own revert
//     strategy and the one command it cannot afford to lose.
//
// ## What was here, and why five cases went in step 9
//
// The file is a survivor of three removals and this is the fourth. It carried
// the end-to-end half of a classifier that read a shell command and predicted
// which files it was about to write (retired 2026-08-07, undecidable from the
// inputs it had); then the git branch policy that predicted whether a command
// would move HEAD (deleted 2026-08-09); then the protected-path deny and its
// fingerprint (2026-08-12).
//
// What went on 2026-08-16 was the last two denies and the stand-down above them:
// the `self-detect stand-down` describe, whose whole subject was a branch that
// no longer exists; two cases asserting a CHECK 3 block on a governed path; the
// precondition case that asserted a block in order to prove the harness was
// pointed somewhere the check ran; and the `macOS realpath trap` case, whose
// subject was a deny arriving as a SILENT ALLOW through an unresolved path —
// indistinguishable, now that everything allows, from correct behaviour. The
// trap itself is not gone and the harness still resolves its root; what moved is
// which side of it bites, and `helpers/guard-harness.ts` states the current one.
//
// This file was in no step's Files list while the plan's Testing Strategy named
// it first among those that "must stay green throughout" (issue `260816-2021`).
// Both statements were about the two properties above, which were green
// throughout and are green here.
//
// Each case is still a fresh subprocess against a temporary project root. That
// is a requirement of the thing under test rather than a style choice: every
// hook resolves its project by walking up from its own working directory, so a
// case run in-process would measure this repository. See
// helpers/guard-harness.ts.
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
    // process.cwd() reports /private/var/folders/…. The child anchors
    // `.guard-state/` on its own resolved cwd, so when the two differ every
    // `readEvents` in this directory opens a path nothing wrote to and every
    // event assertion passes as "no events".
    withProject(({ root, alias }) => {
      expect(realpathSync(root)).toBe(root);
      // And the alias really is a second, unresolved name for the same
      // directory — which is what proves the resolution above did something on
      // this filesystem rather than nothing.
      expect(alias).not.toBe(root);
      expect(realpathSync(alias)).toBe(root);
    });
  });

  it(
    "reaches the real hook, which answers with a bare allow",
    () => {
      // The precondition case, and it had to be rewritten rather than dropped.
      // It used to assert a BLOCK, on the ground that a harness pointed at a
      // root the guard stood down in would make every denial assertion vacuous.
      // There is no deny left to assert and no stand-down to be caught by, so
      // what it can still check is that the hook ran at all and produced the
      // shape Claude Code is promised: an empty object, no `decision` field.
      withProject(({ root }) => {
        const res = runWrite(root, resolve(root, "notes.txt"));
        expect(res.decision).toBeUndefined();
        expect(res.reason).toBeUndefined();
      });
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// The write path — the hook's one product.
// ---------------------------------------------------------------------------

describe("the write path allows and records, for all four write tools", () => {
  it(
    "allows a file_path and appends exactly one guard_allow naming it",
    () => {
      // The write trace is the whole reason the write tools still reach this
      // hook: `bin/monitor` renders that log, and it is the only record of what
      // the write surface did. Asserting the row's `file` as well as its type is
      // what stops the Bash-side case below from passing by deletion — a guard
      // that had stopped writing rows entirely would satisfy that case and fail
      // this one.
      withProject(({ root }) => {
        expect(runWrite(root, resolve(root, "notes.txt")).decision).toBeUndefined();

        const events = readEvents(root);
        expect(events.map((e) => e.event)).toEqual(["guard_allow"]);
        expect(events[0]?.tool).toBe("Edit");
        expect(events[0]?.file).toContain("notes.txt");
      });
    },
    CASE_TIMEOUT,
  );

  // The three cases below are the other three write tools, and until 2026-08-19
  // none of them had ever reached this hook in a test (issue `260816-2320`).
  // `MultiEdit` and `NotebookEdit` appeared under `hooks/lib/__tests__/` in one
  // place only — the `hooks.json` matcher list asserted in `hooks-wiring.test.ts`
  // — so the `notebook_path` branch of `extractFilePath` had no case at all,
  // while three shipped releases told users the trace was the record of what all
  // four tools did.
  //
  // Each case asserts the row's `tool` as well as its `file`. A case asserting
  // `file` alone would stay green if the payload never carried the tool under
  // test and `runWrite` fell back to its default name, which is the one failure
  // these three exist to rule out.
  it(
    "records a Write with the tool name it was given",
    () => {
      withProject(({ root }) => {
        expect(
          runWrite(root, resolve(root, "notes.txt"), "Write").decision,
        ).toBeUndefined();

        const events = readEvents(root);
        expect(events.map((e) => e.event)).toEqual(["guard_allow"]);
        expect(events[0]?.tool).toBe("Write");
        expect(events[0]?.file).toContain("notes.txt");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "records a MultiEdit with the tool name it was given",
    () => {
      withProject(({ root }) => {
        expect(
          runWrite(root, resolve(root, "notes.txt"), "MultiEdit").decision,
        ).toBeUndefined();

        const events = readEvents(root);
        expect(events.map((e) => e.event)).toEqual(["guard_allow"]);
        expect(events[0]?.tool).toBe("MultiEdit");
        expect(events[0]?.file).toContain("notes.txt");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "records a NotebookEdit through the notebook_path branch",
    () => {
      // The only tool that reaches the second branch of `extractFilePath`: a
      // NotebookEdit payload carries `notebook_path` and no `file_path`, so it
      // goes through `runGuard` rather than `runWrite`. This is the case that
      // goes red if that branch is removed, which is the deliberate reddening
      // the plan states for this step.
      withProject(({ root }) => {
        const notebook = resolve(root, "analysis.ipynb");
        expect(
          runGuard(root, "NotebookEdit", { notebook_path: notebook }).decision,
        ).toBeUndefined();

        const events = readEvents(root);
        expect(events.map((e) => e.event)).toEqual(["guard_allow"]);
        expect(events[0]?.tool).toBe("NotebookEdit");
        expect(events[0]?.file).toContain("analysis.ipynb");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "records the allow in a project that HAS a valid configuration file too",
    () => {
      // The seeded name is the loader's own `PROJECT_CONFIG_FILENAME`, through
      // `configFiles`. The harness wrote the literal `fusion-guard.json` into
      // every throwaway project until 2026-08-16, and that name became a RETIRED
      // FILE in the same release — so every project in this suite began emitting
      // an extra `guard_advisory` per guarded call, and this case, which asserts
      // the event list EXACTLY, went red for a reason it was not about
      // (issue `260816-2122`). The single-element assertion below is what would
      // catch that happening again.
      withProject(
        ({ root }) => {
          expect(runWrite(root, resolve(root, "notes.txt")).decision).toBeUndefined();
          expect(readEvents(root).map((e) => e.event)).toEqual(["guard_allow"]);
        },
        { files: configFiles({ orchestrator: { maxTurns: 9 } }) },
      );
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// Ordinary work — the two Bash invariants, which are the reason Bash is on the
// PreToolUse matcher at all and the reason it must stay silent there.
//
// Both are stated in prose at guard.ts's Bash allow path and both are traced to
// a filed issue: an innocuous Bash call must not reset the consecutive-block
// counter (260707-0750) and must not append a guard_allow event (260707-0751).
// The first is now satisfied by there being no counter; what remains assertable,
// and what the assertion below says, is stronger than either: an innocuous Bash
// call in a correctly-configured project writes nothing at all.
//
// ## Why the strong spelling is back
//
// It is how these cases were originally written, and it stopped being able to
// discriminate when the protected-path measurement began writing a fingerprint
// into `.guard-state/` on EVERY guarded tool call — the directory existed after
// the first `ls -la` whatever the guard did, so the cases fell back to naming
// the two files they were about. That measurement went on 2026-08-12 and the
// counter on 2026-08-16, so the directory's absence discriminates again, and it
// needs no list of files to be kept up to date.
// ---------------------------------------------------------------------------

describe("ordinary work is allowed and writes nothing", () => {
  it(
    "a fresh project running innocuous Bash writes no guard state at all",
    () => {
      withProject(({ root }) => {
        expect(runBash(root, "ls -la").decision).toBeUndefined();
        expect(guardStateWritten(root)).toBe(false);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "and goes on writing nothing across the commands agents actually run",
    () => {
      // This case used to open with a deny — three of them over its lifetime, a
      // shell-mutation block, then a branch switch, then a governed write — so
      // that it could assert the counter had not MOVED. There is no counter and
      // no deny to open with, so what it asserts instead is the property those
      // openings were only ever scaffolding for: eight commands, including every
      // mutation verb a returning classifier would light up, and the hook is
      // still silent afterwards.
      withProject(({ root }) => {
        const innocuous = [
          "ls -la",
          "git status",
          // Mutation verbs on ordinary targets — commands agents run constantly.
          "mv notes.txt /tmp/",
          "rm -rf build",
          "sed -i '' 's/a/b/' notes.txt",
          "cp docs/.keep /tmp/y",
          // fusion's own revert strategy. If this ever denies, every agent
          // loses its way to undo a bad edit.
          "git checkout HEAD -- notes.txt",
          "echo hi 2>&1",
        ];

        for (const command of innocuous) {
          expect(
            runBash(root, command).decision,
            `expected an allow for: ${command}`,
          ).toBeUndefined();
        }

        expect(guardStateWritten(root)).toBe(false);
      });
    },
    CASE_TIMEOUT * 2,
  );

  it(
    "but a BROKEN configuration file breaks that silence, on Bash too",
    () => {
      // The bound on the three cases above, and the stated cost of keeping Bash
      // on the matcher: the diagnostic loop runs for every guarded call, Bash
      // included, so a project whose configuration cannot be read hears about it
      // there as well. Pinned here so the silence above reads as a property of a
      // CORRECTLY configured project rather than as a property of the Bash path.
      // The verdict is unaffected — it is an advisory, not a decision.
      withProject(
        ({ root }) => {
          expect(runBash(root, "ls -la").decision).toBeUndefined();
          expect(readEvents(root).map((e) => e.event)).toEqual(["guard_advisory"]);
        },
        { files: configFiles("{ not json") },
      );
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
// Scope: the PreToolUse VERDICT, on ordinary project files. The effect side
// asserts the command really does revert: the working file is dirtied first, and
// the command has to put it back. An allow asserted without the effect would
// pass just as well against a guard that had broken the command some other way.
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
