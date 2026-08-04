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
 * WHICH SHELL EXECUTES WHAT THE GUARD ALLOWED.
 *
 * The classifier's stated model is bash, and for four Turns every effect check
 * here ran `/bin/bash`. That is not the shell on the other side of the Bash
 * tool: Claude Code starts the user's login shell, `SHELL=/bin/zsh` on this
 * machine, and the two disagree about whole constructs — `command cd DIR` moves
 * bash and is inert in zsh. A row measured in the shell that does not run it
 * proves nothing about the shell that does, which is how eleven wrapper rows
 * shipped allowing (`issues/260803-2236…`). So a case names its shell, and the
 * rows where the two shells differ appear TWICE.
 */
const SHELLS = { bash: "/bin/bash", zsh: "/bin/zsh" } as const;
type ShellName = keyof typeof SHELLS;

/**
 * Deny the command, for a reason that is not the halt, and prove the command
 * was worth denying by running it through the named real shell and watching
 * `watch` disappear.
 */
function denyAndShellWouldHaveWritten(
  command: string,
  watch: string,
  opts: { shell?: ShellName; env?: Record<string, string> } = {},
): void {
  const shell = opts.shell ?? "bash";
  withProject(({ root }) => {
    symlinkSync("../agents", resolve(root, "rules/L"));

    const res = runBash(root, command, opts.env ?? {});
    expect(res.decision, command).toBe("block");
    expect(res.reason ?? "", command).not.toContain("[HALTED]");

    // What the deny was worth: the same command, the same project, a real shell.
    const target = resolve(root, watch);
    const before = readFileSync(target, "utf-8");
    spawnSync(SHELLS[shell], ["-c", command], { cwd: root, stdio: "ignore" });
    const after = existsSync(target) ? readFileSync(target, "utf-8") : null;
    expect(
      after,
      `${shell} left ${watch} alone, so ${command} proves nothing`,
    ).not.toBe(before);
  });
}

/** The bash-shell default, kept so the existing rows read as they did. */
function denyAndBashWouldHaveWritten(
  command: string,
  watch: string,
  env: Record<string, string> = {},
): void {
  denyAndShellWouldHaveWritten(command, watch, { shell: "bash", env });
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

  // The two no-flag entrances Turn 5 measured. Neither is a modifier on the
  // builtin, which is why the allow-list inversion above could not reach them:
  // one never arrives at `firstDirArg` (a wrapper hides the builtin), the other
  // arrives, is correctly told there is no operand, and was then pushed onto
  // the model's stack anyway.
  it(
    "denies a cd reached through `command`, which really does run the builtin",
    () => {
      denyAndBashWouldHaveWritten("command cd rules && rm x.md", "rules/x.md");
    },
    CASE_TIMEOUT,
  );

  it(
    "denies a cd reached through `builtin`, the wrapper that was in no table",
    () => {
      denyAndBashWouldHaveWritten("builtin cd rules && rm x.md", "rules/x.md");
    },
    CASE_TIMEOUT,
  );

  it(
    "denies a cd reached through `time`, which is a reserved word, not /usr/bin/time",
    () => {
      denyAndBashWouldHaveWritten("time cd agents && rm coder.md", "agents/coder.md");
    },
    CASE_TIMEOUT,
  );

  it(
    "denies the whole protected list through the wrapper, not one spelling of it",
    () => {
      denyAndBashWouldHaveWritten(
        "command cd skills/demo && rm SKILL.md",
        "skills/demo/SKILL.md",
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "denies a popd that collects a stack entry a bare pushd never pushed",
    () => {
      // Six segments, and the model was one entry deep and one shifted from the
      // bare `pushd` onward: bash swaps, the model pushed. Each later `popd`
      // then recovered a CONFIDENTLY-named directory bash does not go to, so the
      // fail-closed pass never ran. Bash ends in `rules/`; the model said
      // `build/`.
      denyAndBashWouldHaveWritten(
        "cd rules && pushd ../build && pushd ../docs && pushd && popd && popd && rm x.md",
        "rules/x.md",
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "denies the same collection after a pushd +N rotation",
    () => {
      denyAndBashWouldHaveWritten(
        "cd rules && pushd ../build && pushd ../docs && pushd +1 && popd && rm x.md",
        "rules/x.md",
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "denies the same collection after a pushd -N rotation",
    () => {
      denyAndBashWouldHaveWritten(
        "cd rules && pushd ../build && pushd ../docs && pushd -1 && popd && rm x.md",
        "rules/x.md",
      );
    },
    CASE_TIMEOUT,
  );

  // ---------------------------------------------------------------------
  // THE ALLOW DIRECTION of the same wrapper walk (`issues/260803-2236…`).
  //
  // Every row above builds its operand under the cd's DESTINATION, so it can
  // only catch a `cd` the model FAILED to follow. Marking three wrappers
  // builtin-capable made the model follow a `cd` the shell does not make, which
  // moves a later relative operand OFF the protected list — and no probe shaped
  // like the ones above can see it. These rows are the mirror: the operand sits
  // under the ORIGIN, so the deny is the one that survives only while the model
  // refuses to assert a directory it cannot prove.
  //
  // Each is measured in the shell that actually performs the write.
  // ---------------------------------------------------------------------

  it(
    "denies a cd behind `command`, which zsh does NOT run as a builtin",
    () => {
      // zsh's `command` forces an external lookup, so the shell never leaves the
      // project root and `rm rules/x.md` deletes the real file. The model used
      // to place the shell in `build/` and allow it.
      denyAndShellWouldHaveWritten(
        "command cd build && rm rules/x.md",
        "rules/x.md",
        { shell: "zsh" },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "denies a cd behind a chained `command`, which no hop count changes",
    () => {
      denyAndShellWouldHaveWritten(
        "command command cd build && rm rules/x.md",
        "rules/x.md",
        { shell: "zsh" },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "denies a cd behind `\\time`, the spelling that selects /usr/bin/time",
    () => {
      // `resolveWord` erases the backslash because for a VERB `\rm` really is
      // `rm`. For `time` the erasure is backwards: the escape is what demotes
      // the reserved word to the external program, which cannot run `cd` at
      // all. Both shells agree, so bash is enough to prove the write.
      denyAndShellWouldHaveWritten(
        "\\time cd build && rm rules/x.md",
        "rules/x.md",
        { shell: "bash" },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "denies a cd behind /usr/bin/time, the path spelling of the same word",
    () => {
      denyAndShellWouldHaveWritten(
        "/usr/bin/time cd build && rm rules/x.md",
        "rules/x.md",
        { shell: "zsh" },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "denies a cd behind a quoted `time`, in the shell that runs the tool call",
    () => {
      denyAndShellWouldHaveWritten(
        "'time' cd build && rm agents/coder.md",
        "agents/coder.md",
        { shell: "zsh" },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "denies a PATH-SPELLED cd, which is an external program and moves nothing",
    () => {
      // `/usr/bin/cd` is a real binary on macOS. It changes its own process's
      // directory and exits; the shell stays put. `programName` maps it to `cd`
      // — correct for a verb, backwards for a builtin — so the model followed
      // it. Measured inert in bash AND zsh.
      denyAndShellWouldHaveWritten(
        "/usr/bin/cd build && rm rules/x.md",
        "rules/x.md",
        { shell: "bash" },
      );
    },
    CASE_TIMEOUT,
  );

  // ---------------------------------------------------------------------
  // The stack's DEPTH survives a give-up (`issues/260803-2237…`).
  // ---------------------------------------------------------------------

  it(
    "denies a popd whose stack depth was given up on, after an absolute cd re-proved the cwd",
    () => {
      // `pushd -n ..` leaves bash one entry deeper than a model that zeroed the
      // stack's VALUES and kept its length. The mismatch hides while the cwd is
      // unknown and stops hiding the moment an ABSOLUTE `cd` re-proves it: the
      // model's `popd` then finds an empty stack, reads it as bash's stay-put
      // no-op, and leaves a PROVEN `build/` standing while bash pops to the
      // root and deletes the protected file.
      withProject(({ root }) => {
        const cmd = `cd docs && pushd -n .. && cd ${root}/build && popd && rm rules/x.md`;
        const res = runBash(root, cmd);
        expect(res.decision, cmd).toBe("block");
        expect(res.reason ?? "", cmd).not.toContain("[HALTED]");

        const target = resolve(root, "rules/x.md");
        const before = readFileSync(target, "utf-8");
        spawnSync("/bin/bash", ["-c", cmd], { cwd: root, stdio: "ignore" });
        expect(existsSync(target), `bash left rules/x.md alone`).toBe(false);
        expect(before.length).toBeGreaterThan(0);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "keeps allowing the same five segments when the pushd is MODELLED",
    () => {
      // The discriminator. With `pushd ..` instead of `pushd -n ..` the model
      // and bash agree — both end in `docs/` — and nothing protected is
      // reachable. If this row ever denies, the fix above has stopped being a
      // give-up and started being a blanket.
      withProject(({ root }) => {
        const cmd = `cd docs && pushd .. && cd ${root}/build && popd && rm rules/x.md`;
        expect(runBash(root, cmd).decision, cmd).toBeUndefined();
      });
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
          "mkdir -p build && cd build && rm out.js",
          // A wrapper in FRONT of a directory builtin now gives up, and the
          // wrapper in front of a VERB is untouched by that — which is the
          // whole of what the give-up costs. `time npm test` and
          // `command -v jq` are the shapes an agent really writes.
          "time npm test",
          "command -v jq >/dev/null && rm -rf dist",
          "timeout 60 npm test",
          // Quoting and escaping the BUILTIN is not the same as spelling it as
          // a path: `\\cd` and `'cd'` were measured moving the shell in bash and
          // zsh, because `cd` is a builtin rather than a reserved word.
          "\\cd build && rm out.js",
          "'cd' build && rm out.js",
        ]) {
          expect(runBash(root, cmd).decision, cmd).toBeUndefined();
        }
        expect(guardStateWritten(root)).toBe(false);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "states the cost of the wrapper give-up as denials, not as prose",
    () => {
      // These three ALLOWED at 9aacab5, where the model followed the wrapper's
      // `cd`. They deny now, fail-closed, naming the working directory. Nothing
      // is lost: reaching a directory builtin through a wrapper does not make it
      // do anything a bare `cd` does not, and the bare form is right there.
      //
      // One project PER ROW: three denials halt the guard, and a halted deny
      // carries the halt's reason instead of this one, so the assertion would
      // pass for the wrong reason on the third.
      for (const cmd of [
        "command cd build && rm out.js",
        "builtin cd build && rm out.js",
        "time cd build && rm out.js",
      ]) {
        withProject(({ root }) => {
          const res = runBash(root, cmd);
          expect(res.decision, cmd).toBe("block");
          expect(res.reason ?? "", cmd).not.toContain("[HALTED]");
          expect(res.reason ?? "", cmd).toContain(
            "working directory the guard cannot determine",
          );
        });
      }
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// The ambient CDPATH — the same degrade, arriving through the environment.
//
// The in-command case above is visible in the command text. This one is not:
// the Bash tool's shell is initialised from the user's profile, so
// `export CDPATH=…` in a `.zshrc` sends every bare-word `cd` down a search list
// with nothing in the command to show for it. The unit suite carries the
// matrix; what these cases carry is that `process.env` reaches the classifier
// through the real hook at all, and — the claim the user accepted the change on
// — that a shell WITHOUT the variable behaves exactly as it did before.
//
// `runBash`'s third argument is an override on the child's environment, and the
// harness strips `CDPATH` from every other child, so these cases cannot leak
// into their neighbours and a developer's own profile cannot leak into any of
// them.
// ---------------------------------------------------------------------------

describe("an ambient CDPATH degrades the working-directory model", () => {
  it(
    "denies a bare-word cd when CDPATH is set in the environment",
    () => {
      withProject(({ root }) => {
        const cmd = "cd build && rm out.js";
        const res = runBash(root, cmd, { CDPATH: "/decoy" });
        expect(res.decision).toBe("block");
        expect(res.reason ?? "").not.toContain("[HALTED]");
        // The reason names the cause the command text cannot show, and both
        // ways out of it.
        expect(res.reason ?? "").toContain("CDPATH is set in this shell's environment");
        expect(res.reason ?? "").toContain("anchor the `cd` operand");
        expect(res.reason ?? "").toContain("unset CDPATH");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "changes NOTHING when CDPATH is unset, which is the common case",
    () => {
      // The claim the decision was accepted on, measured through the real
      // guard rather than reasoned about. One project, all allows: no denial,
      // so nothing can halt and mask a later row. Each of these would deny
      // under a set CDPATH, and none of them denies here.
      withProject(({ root }) => {
        for (const cmd of [
          "cd build && rm out.js",
          "cd docs && rm ../notes.txt",
          "pushd build > /dev/null && rm out.js; popd > /dev/null",
          "cd build && cd .. && rm notes.txt",
          "rm -rf node_modules",
        ]) {
          expect(runBash(root, cmd).decision, cmd).toBeUndefined();
        }
        // An explicitly BLANK CDPATH is not a CDPATH: `export CDPATH=` in a
        // profile has asked for nothing, and real bash diverts nothing for it.
        expect(
          runBash(root, "cd build && rm out.js", { CDPATH: "" }).decision,
        ).toBeUndefined();
        expect(
          runBash(root, "cd build && rm out.js", { CDPATH: "   " }).decision,
        ).toBeUndefined();
        expect(guardStateWritten(root)).toBe(false);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "leaves an anchored operand allowed even with CDPATH set",
    () => {
      // What keeps the cost near zero for the users who do have CDPATH set:
      // bash consults it only for a BARE-WORD operand, so anchoring the `cd`
      // buys back the exact old behaviour — which is what the deny reason
      // tells them to do.
      withProject(({ root }) => {
        for (const cmd of [
          "cd ./build && rm out.js",
          "cd /tmp && rm -rf x",
          "cd . && rm build/out.js",
          "rm -rf node_modules",
        ]) {
          expect(
            runBash(root, cmd, { CDPATH: "/decoy" }).decision,
            cmd,
          ).toBeUndefined();
        }
        expect(guardStateWritten(root)).toBe(false);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "stands down with the rest of the check in the plugin's own repo",
    () => {
      // The degrade is part of the protected-path policy, not a policy of its
      // own, so it yields where that one yields. Otherwise a fusion developer
      // with CDPATH set would meet denials the stand-down exists to prevent.
      withPluginProject(({ root }) => {
        expect(
          runBash(root, "cd build && rm out.js", { CDPATH: "/decoy" }).decision,
        ).toBeUndefined();
        expect(
          runBash(root, "cd docs && rm ../rules/x.md", { CDPATH: "/decoy" })
            .decision,
        ).toBeUndefined();
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

// ---------------------------------------------------------------------------
// A `cd` the shell does not guarantee, and a redirection that used to walk
// through every directory give-up. Taken together, because each left the
// other's last escape open
// (`decisions/260803-2338_i_…after-a-cd-it-cannot-prove-succeeded.md` option 1,
// `decisions/260804-0106_a_…around-the-program-or-around-the-cause…`).
//
// Every denial below is measured against the real guard subprocess in its own
// throwaway project, asserts the deny is not `[HALTED]`, and then runs the same
// command through the NAMED real shell and watches the file change. The two
// halves are separable in the unit suite; here they are measured as shipped.
// ---------------------------------------------------------------------------

describe("a cd the shell never promised to have made", () => {
  it(
    "denies the one-segment bypass, in bash",
    () => {
      // The whole escape: no flag, no wrapper, one extra segment. `cd` fails,
      // bash stays at the project root, and the model followed the `cd`.
      denyAndShellWouldHaveWritten(
        "cd nonexistent; rm rules/x.md",
        "rules/x.md",
        { shell: "bash" },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "denies the one-segment bypass, in zsh — the shell the tool call runs",
    () => {
      denyAndShellWouldHaveWritten(
        "cd nonexistent; rm rules/x.md",
        "rules/x.md",
        { shell: "zsh" },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "denies its REDIRECT spelling, in bash",
    () => {
      // The spelling neither decision closes on its own: the working directory
      // is unknown (option 1 put it there) and `echo` is outside the verb
      // table, so only the cause-shaped fail-closed bound reaches it.
      denyAndShellWouldHaveWritten(
        "cd nope || true; echo pwned > rules/x.md",
        "rules/x.md",
        { shell: "bash" },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "denies its REDIRECT spelling, in zsh",
    () => {
      denyAndShellWouldHaveWritten(
        "cd nope || true; echo pwned > rules/x.md",
        "rules/x.md",
        { shell: "zsh" },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "names the separator rather than the operand, so the remedy is findable",
    () => {
      withProject(({ root }) => {
        const res = runBash(root, "cd nonexistent; rm rules/x.md");
        expect(res.decision).toBe("block");
        expect(res.reason ?? "").not.toContain("[HALTED]");
        expect(res.reason ?? "").toContain("does not guarantee succeeded");
        expect(res.reason ?? "").toContain("&&");
      });
    },
    CASE_TIMEOUT,
  );
});

describe("a redirect target the guard cannot place denies whatever the program is", () => {
  // The six rows that newly ALLOWED at `048f3db`, plus the wrapper row T6-1
  // named as not closed, plus the three original `260803-1835` rows. Each in
  // the shell that performs the write, one project per row.
  const ROWS: {
    command: string;
    watch: string;
    shell: "bash" | "zsh";
    env?: Record<string, string>;
  }[] = [
    { command: "command cd rules && echo pwned > x.md", watch: "rules/x.md", shell: "bash" },
    { command: "builtin cd rules && echo pwned > x.md", watch: "rules/x.md", shell: "bash" },
    { command: "builtin cd rules && echo pwned > x.md", watch: "rules/x.md", shell: "zsh" },
    { command: "time cd agents && echo pwned > coder.md", watch: "agents/coder.md", shell: "bash" },
    { command: "time cd agents && echo pwned > coder.md", watch: "agents/coder.md", shell: "zsh" },
    {
      // `printf ''` truncates rather than writes, which is still a change the
      // effect check sees — and it is the row as it was measured at `048f3db`.
      command: "command cd skills/demo && printf '' > SKILL.md",
      watch: "skills/demo/SKILL.md",
      shell: "bash",
    },
    // T6-1's eleventh row: zsh's `command` forces an external lookup, so the
    // shell never leaves the root and the LITERAL protected path is written.
    {
      command: "command cd build && echo pwned > rules/x.md",
      watch: "rules/x.md",
      shell: "zsh",
    },
    // The three rows `260803-1835` was filed on. Two need no flag.
    {
      command: "pushd -n docs && echo pwned > agents/coder.md",
      watch: "agents/coder.md",
      shell: "bash",
    },
    {
      command: "cd docs && CDPATH=.. cd agents && echo pwned > coder.md",
      watch: "agents/coder.md",
      shell: "bash",
    },
    {
      command: "cd -P rules/L/.. && echo pwned > agents/coder.md",
      watch: "agents/coder.md",
      shell: "bash",
      env: { FUSION_ALLOW_RULES_WRITE: "1" },
    },
  ];

  for (const { command, watch, shell, env } of ROWS) {
    it(
      `denies (${shell}): ${command}`,
      () => {
        denyAndShellWouldHaveWritten(command, watch, { shell, env });
      },
      CASE_TIMEOUT,
    );
  }
});

describe("the fail-closed bound survives — an unparseable ARGUMENT is still allowed", () => {
  it(
    "leaves the redirect idiom and the flag-value forms alone",
    () => {
      // One project, all allows, so no denial can halt the guard and mask the
      // rest. These are the rows `260801-1859` was filed to protect, and the
      // reason the reversal above is drawn around the CAUSE rather than around
      // the program: in every one of them it is the TOKEN that cannot be
      // resolved, from a working directory the guard knows exactly.
      withProject(({ root }) => {
        for (const cmd of [
          'npm test > "$LOG"',
          'npm test > "$TMPDIR/test.log"',
          "curl -o $OUT https://x",
          "curl -sL https://x -o \"$OUT\"",
          "make $TARGET",
          "cat report.md > ~/backup.md",
          "echo hi >> ~/notes.md",
          'echo x > "$F"',
          'echo x > "rules/$F"',
          'go build -o "$BIN" ./cmd/x',
          'cd build && echo x > "$F"',
        ]) {
          expect(runBash(root, cmd).decision, cmd).toBeUndefined();
        }
        expect(guardStateWritten(root)).toBe(false);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "keeps the ordinary `&&` shapes exact, which is what the cost table bought",
    () => {
      withProject(({ root }) => {
        for (const cmd of [
          "cd build && rm out.js",
          "mkdir -p build && cd build && rm out.js",
          "cd hooks && npm run build && rm -rf dist",
          "cd hooks && npm test",
          "pushd build > /dev/null && rm out.js; popd > /dev/null",
          "cd hooks; npm test; cd ..",
          "ls; rm build/out.js",
        ]) {
          expect(runBash(root, cmd).decision, cmd).toBeUndefined();
        }
        expect(guardStateWritten(root)).toBe(false);
      });
    },
    CASE_TIMEOUT,
  );
});
