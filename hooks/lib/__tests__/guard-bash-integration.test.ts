import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CASE_TIMEOUT,
  guardEntry,
  readEscalation,
  readEvents,
  runBash,
  runWrite,
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
//   * the self-detect stand-down covers the write tools and NOT the branch
//     policy;
//   * the git branch policy still denies, still escalates, and still lets
//     fusion's own revert strategy through.
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
    withProject(({ root }) => {
      expect(runWrite(root, resolve(root, "rules/x.md")).decision).toBe("block");
    });
  }, CASE_TIMEOUT);
});

// ---------------------------------------------------------------------------
// The write path — and the trap that makes it look guarded when it is not.
// ---------------------------------------------------------------------------

describe("the Edit write path still denies a protected path", () => {
  it(
    "blocks an absolute file_path under the project root",
    () => {
      // This confirms the harness reproduces the guard's behaviour end to end.
      // If the harness were misbuilt — wrong cwd, unresolved root, missing
      // workbench marker — this is the case that catches it, because it depends
      // on all three.
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
  // protected-path assertion into a vacuous pass. Pinning it here means the
  // next person cannot reintroduce it without also deleting a test that
  // explains exactly what they broke.
  //
  // The positive half — the same path through the resolved root — is the
  // "blocks an absolute file_path" case above.

  it(
    "Edit: an absolute path through an unresolved alias silently ALLOWS",
    () => {
      withProject(({ root, alias }) => {
        expect(runWrite(root, resolve(alias, "rules/x.md")).decision).toBeUndefined();
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
      // The opening block is a branch switch, which is the one deny the Bash
      // surface still has. It used to be `rm -f rules/x.md`, from the retired
      // classifier.
      withProject(({ root }) => {
        expect(runBash(root, "git switch main").decision).toBe("block");
        expect(readEscalation(root)?.consecutiveBlocks).toBe(1);

        const innocuous = [
          "ls -la",
          "git status",
          // Mutation verbs on unprotected targets — commands agents run
          // constantly, and the surface a returning classifier would light up.
          "mv notes.txt /tmp/",
          "rm -rf build",
          "sed -i '' 's/a/b/' notes.txt",
          // A protected path in a READ-only operand role: copying out is fine.
          "cp rules/x.md /tmp/y",
          // fusion's own revert strategy. If this ever denies, every agent
          // loses its way to undo a bad edit.
          "git checkout HEAD -- rules/x.md",
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
// Escalation: three Bash denials halt, exactly as three write denials do.
//
// The three used to be protected-path mutations. They are branch-policy denials
// now, for the same reason the case above changed its opener — but the property
// is the shared escalation surface, not which policy fed it, and that is
// unchanged: a Bash deny increments the same counter a write deny does and the
// third one raises the halt.
// ---------------------------------------------------------------------------

describe("three consecutive Bash denials escalate to a halt", () => {
  it(
    "raises haltActive and emits guard_halt on the third",
    () => {
      withProject(({ root }) => {
        expect(runBash(root, "git switch main").decision).toBe("block");
        expect(readEscalation(root)?.haltActive).toBe(false);

        expect(runBash(root, "git checkout -b feature").decision).toBe("block");
        expect(readEscalation(root)?.haltActive).toBe(false);

        expect(runBash(root, "git worktree add ../wt feature").decision).toBe(
          "block",
        );

        const state = readEscalation(root);
        expect(state?.consecutiveBlocks).toBe(3);
        expect(state?.haltActive).toBe(true);
        expect(state?.recentEvents.map((e) => e.trigger)).toEqual([
          "git_branch_switch",
          "git_branch_switch",
          "git_branch_switch",
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

describe("self-detect stand-down: the write guard yields, the branch policy does not", () => {
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
    "stands the Edit write path down",
    () => {
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
    "denies the same write as soon as the plugin manifest is not at cwd",
    () => {
      // The boundary, asserted from the other side in the same describe: the
      // ONLY difference between this root and the one above is
      // .claude-plugin/plugin.json. `isFusionPluginCwd()` does no upward walk,
      // so this is the whole of the condition.
      withProject(({ root }) => {
        expect(runWrite(root, resolve(root, "rules/x.md")).decision).toBe("block");
      });
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// git's revert strategy, end to end.
//
// `rules/protected-path-discipline.md` and `rules/git-branch-discipline.md` both
// tell every agent in every consuming project that `git checkout HEAD -- <paths>`
// is always allowed, and the orchestrator reverts an agent's out-of-scope edit
// with it. The branch policy is what has to keep letting it through — it is the
// one policy left on this surface, and the `--` separator is its discriminator.
//
// The effect side asserts the command really does revert: the working file is
// dirtied first, and the command has to put it back. An allow asserted without
// the effect would pass just as well against a guard that had broken the
// command some other way.
// ---------------------------------------------------------------------------

/** The two shells, because Claude Code starts the user's login shell, not bash. */
const SHELLS = { bash: "/bin/bash", zsh: "/bin/zsh" } as const;

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
  writeFileSync(resolve(root, "rules/x.md"), "# a rule, revised\n", "utf-8");
  writeFileSync(resolve(root, "agents/coder.md"), "# an agent, revised\n", "utf-8");
  writeFileSync(resolve(root, "build/out.js"), "// built, revised\n", "utf-8");
  git("commit", "-qam", "two");
}

describe("the revert strategy is allowed, and it reverts", () => {
  for (const form of ["git checkout HEAD -- rules/x.md", "git checkout HEAD -- ."]) {
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
            const target = resolve(root, "rules/x.md");
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
        spawnSync(SHELLS.bash, ["-c", "git checkout HEAD -- rules/x.md"], {
          cwd: root,
          stdio: "ignore",
        });
        expect(existsSync(resolve(root, "rules/x.md"))).toBe(true);
      });
    },
    CASE_TIMEOUT,
  );
});

/**
 * Give a harness repository two extra branches WITHOUT moving HEAD, so a case
 * can name a real switch target.
 *
 * Deliberately self-contained rather than folded into `initRepo`: the cases
 * above depend on that helper's exact effect, and this file's discipline is
 * that a fix adds cases instead of reshaping the ones already passing.
 */
function addBranches(root: string, ...names: string[]): void {
  for (const name of names) {
    const res = spawnSync("git", ["branch", name], {
      cwd: root,
      stdio: "ignore",
      env: {
        ...process.env,
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_CONFIG_SYSTEM: "/dev/null",
      },
    });
    if (res.status !== 0) {
      throw new Error(`harness git branch ${name} failed (${String(res.status)})`);
    }
  }
}

/** The branch HEAD points at, or `"HEAD"` when it is detached. */
function currentBranch(root: string): string {
  const res = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: root,
    encoding: "utf-8",
    env: {
      ...process.env,
      GIT_CONFIG_GLOBAL: "/dev/null",
      GIT_CONFIG_SYSTEM: "/dev/null",
    },
  });
  if (res.status !== 0) {
    throw new Error(`harness git rev-parse failed (${String(res.status)})`);
  }
  return res.stdout.trim();
}

/**
 * The two argument forms the classifier did not know, end to end.
 *
 * Both are the same character of defect — a token the parser mis-read in a
 * position where the evidence that HEAD moves is unconditional — and both were
 * measured moving HEAD against real git 2.49.0 while the guard allowed the
 * call:
 *
 *   * a trailing `--` returned ALLOW before the branch-creating flags were even
 *     looked at
 *     (`issues/260809-1105_o_a-trailing-separator-lifts-the-branch-deny-so-git-checkout-b-name-runs.md`);
 *   * an unrecognised global option's separated value stood in subcommand
 *     position, so `switch` was never reached
 *     (`issues/260809-1106_o_the-unknown-global-option-fix-was-deleted-with-the-mutation-classifier-and-the-branch-guard-never-had-it.md`,
 *     the same class as the closed `260804-1333` / `260804-1344` pair).
 *
 * Each row is asserted twice, and the second half is what makes the first mean
 * anything: the VERDICT through the real hook, and the EFFECT in a throwaway
 * repository. A deny asserted against a command that turns out to be a no-op
 * proves nothing, and at HEAD `451a07e` every one of these commands both
 * allowed and moved HEAD.
 *
 * The effect runs here and only here. `rules/git-branch-discipline.md` forbids
 * reaching for the live command in this repository, and while these defects
 * were open it would have succeeded and moved fusion's own HEAD.
 */
describe("the branch policy denies the forms that used to slip past it, and they really move HEAD", () => {
  const ROWS = [
    { issue: "260809-1105", cmd: "git checkout -b bar --", lands: "bar" },
    { issue: "260809-1105", cmd: "git checkout -B bar --", lands: "bar" },
    { issue: "260809-1106", cmd: "git --namespace ns switch other", lands: "other" },
    { issue: "260809-1106", cmd: "git --attr-source HEAD switch t1", lands: "t1" },
  ];

  for (const { issue, cmd, lands } of ROWS) {
    it(
      `blocks (${issue}): ${cmd}`,
      () => {
        withProject(({ root }) => {
          initRepo(root);
          addBranches(root, "other", "t1");
          const res = runBash(root, cmd);
          expect(res.decision).toBe("block");
          expect(res.reason ?? "").toContain("branch");
        });
      },
      CASE_TIMEOUT,
    );

    for (const shell of ["bash", "zsh"] as const) {
      it(
        `and it moves HEAD (${shell}): ${cmd}`,
        () => {
          withProject(({ root }) => {
            initRepo(root);
            addBranches(root, "other", "t1");
            const before = currentBranch(root);
            spawnSync(SHELLS[shell], ["-c", cmd], { cwd: root, stdio: "ignore" });
            const after = currentBranch(root);
            expect(after, `${shell}: ${cmd}`).toBe(lands);
            expect(after, `${shell}: ${cmd} did not move HEAD at all`).not.toBe(
              before,
            );
          });
        },
        CASE_TIMEOUT,
      );
    }
  }

  it(
    "and fusion's own revert spelling is still allowed alongside them",
    () => {
      // The reorder in `classifyCheckout` reads every argument, pathspecs
      // included. This is the row that would catch it over-reaching into the
      // one command the whole policy is built around.
      withProject(({ root }) => {
        initRepo(root);
        const res = runBash(root, "git checkout HEAD -- rules/x.md");
        expect(res.decision ?? "allow").not.toBe("block");
      });
    },
    CASE_TIMEOUT,
  );
});

describe("the branch policy answers a bare `git checkout` first", () => {
  it(
    "denies `git checkout <file> <file>` on the branch policy's own reason",
    () => {
      // No `--`, and the targets do not exist on disk, so the branch policy's
      // fail-closed clause denies. There is no second policy on this surface any
      // more, so the reason is the only one an agent can meet here — pinned so a
      // future policy cannot start answering in its place unnoticed.
      withProject(({ root }) => {
        const res = runBash(root, "git checkout rules/a.md rules/b.md");
        expect(res.decision).toBe("block");
        expect(res.reason ?? "").toContain("branch");
      });
    },
    CASE_TIMEOUT,
  );
});
