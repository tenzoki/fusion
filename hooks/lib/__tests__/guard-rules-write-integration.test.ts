import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  linkSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import {
  CASE_TIMEOUT,
  childEnv,
  projectConfig,
  readEvents,
  readEscalation,
  REPO_ROOT,
  runBash,
  runGuard,
  runWrite,
  withPluginProject,
  withProject,
} from "./helpers/guard-harness.js";

// ---------------------------------------------------------------------------
// Rules-write exemption and project configuration — plan step 1.
//
// This file exists BEFORE the behaviour it will eventually test. Eleven of the
// twelve acceptance criteria in this Circle describe behaviour in a CONSUMING
// project, and the write guard stands down in this repository, so nothing here
// can verify them by ordinary means. The harness is what buys that ability, and
// a harness capability that is never asserted is a capability nobody knows is
// broken until a later step's case fails for a reason that has nothing to do
// with the step.
//
// So the cases below cover the HARNESS ONLY: the three new `makeProject`
// capabilities and the environment strip. No exemption behaviour is asserted,
// because none exists yet — `FUSION_ALLOW_RULES_WRITE` is read by nothing at
// this commit. Steps 3, 4 and 6 add the behavioural cases to this same file.
// ---------------------------------------------------------------------------

describe("harness capabilities the rules-write cases depend on", () => {
  it(
    "places a caller-supplied file in the project, over the seeded set",
    () => {
      // Two properties in one case, because they are the same mechanism seen
      // from both sides: `files` ADDS a path that is not in SEED_FILES, and it
      // REPLACES one that is. Without the second, a case could not vary the
      // content of `rules/x.md` and would have to work around the seed.
      withProject(
        ({ root }) => {
          expect(readFileSync(resolve(root, "rules/retire-me.md"), "utf-8")).toBe(
            "# a rule due for retirement\n",
          );
          expect(readFileSync(resolve(root, "rules/x.md"), "utf-8")).toBe(
            "# replaced\n",
          );
          // And the rest of the seed is still there, so `files` is a merge and
          // not a substitution — every existing case relies on that.
          expect(existsSync(resolve(root, "agents/coder.md"))).toBe(true);
          expect(existsSync(resolve(root, "rules/retired/.keep"))).toBe(true);
          expect(existsSync(resolve(root, ".claude/rules/local.md"))).toBe(true);
          expect(existsSync(resolve(root, "fusion-workbench/.fusion-setup"))).toBe(
            true,
          );
        },
        {
          files: {
            "rules/retire-me.md": "# a rule due for retirement\n",
            "rules/x.md": "# replaced\n",
          },
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "pre-seeds a halt the guard actually reads",
    () => {
      // The criterion this enables is "setting the flag does not reset or clear
      // an active halt". Reaching halt through three real denials works but
      // couples the case to `escalation.blocksBeforeHalt`; seeding the state
      // asserts the halt itself.
      //
      // The target is `notes.txt`, which is NOT protected. A block on an
      // unprotected path can only come from the halt check, so this case cannot
      // pass for the protected-path reason by accident.
      withProject(
        ({ root }) => {
          const res = runWrite(root, resolve(root, "notes.txt"));

          expect(res.decision).toBe("block");
          expect(res.reason).toContain("[HALTED]");
          expect(readEvents(root).map((e) => e.event)).toEqual(["guard_halt"]);

          // The halt check blocks without touching the counter, so the seeded
          // state survives the call unchanged.
          const state = readEscalation(root);
          expect(state?.haltActive).toBe(true);
          expect(state?.consecutiveBlocks).toBe(3);
        },
        { escalation: { haltActive: true, consecutiveBlocks: 3 } },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "writes a fusion-guard.json at the project root, parseable or deliberately not",
    () => {
      // `projectConfig` is what the C5b cases feed the `files` map. An object
      // becomes JSON; a string is written verbatim, which is the only way to
      // hand the loader a file that does not parse.
      withProject(
        ({ root }) => {
          const written = readFileSync(resolve(root, "fusion-guard.json"), "utf-8");
          expect(JSON.parse(written)).toEqual({
            guard: { protectedPaths: ["secret/**"] },
          });
        },
        {
          files: {
            "fusion-guard.json": projectConfig({
              guard: { protectedPaths: ["secret/**"] },
            }),
          },
        },
      );

      withProject(
        ({ root }) => {
          const written = readFileSync(resolve(root, "fusion-guard.json"), "utf-8");
          expect(written).toBe("{ not json");
          expect(() => JSON.parse(written)).toThrow();
        },
        { files: { "fusion-guard.json": projectConfig("{ not json") } },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "strips FUSION_ALLOW_RULES_WRITE from the child, unless a case asks for it",
    () => {
      // The load-bearing case of the step. A developer with the variable
      // exported would otherwise hand it to every spawned guard and silently
      // void the flag-unset half of five criteria — green suite, nothing
      // checked.
      //
      // Asserted against the real child environment rather than against the
      // absence of the variable, because the second is what a broken strip
      // looks like on a machine that never exported it. The CONTROL spawn below
      // is what makes the case fail when the strip is removed: it proves the
      // variable genuinely was in the parent at the time of the negative
      // assertion.
      const readIt = [
        "-e",
        "process.stdout.write(String(process.env.FUSION_ALLOW_RULES_WRITE))",
      ];
      const saved = process.env.FUSION_ALLOW_RULES_WRITE;
      process.env.FUSION_ALLOW_RULES_WRITE = "1";

      try {
        // Control: an unstripped environment DOES carry it into a child.
        const control = spawnSync(process.execPath, readIt, {
          encoding: "utf-8",
          env: process.env,
        });
        expect(control.status).toBe(0);
        expect(control.stdout).toBe("1");

        // The environment `runGuard` hands to the guard, spawned the same way.
        const stripped = spawnSync(process.execPath, readIt, {
          encoding: "utf-8",
          env: childEnv(),
        });
        expect(stripped.status).toBe(0);
        expect(stripped.stdout).toBe("undefined");


        // And a case that deliberately sets the flag still gets it, or every
        // flag-SET case in steps 3 and 4 would be untestable.
        const asked = spawnSync(process.execPath, readIt, {
          encoding: "utf-8",
          env: childEnv({ FUSION_ALLOW_RULES_WRITE: "1" }),
        });
        expect(asked.stdout).toBe("1");
      } finally {
        if (saved === undefined) delete process.env.FUSION_ALLOW_RULES_WRITE;
        else process.env.FUSION_ALLOW_RULES_WRITE = saved;
      }
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// The exemption on the write-tool path — plan step 3.
//
// Every case runs against a throwaway project root that is NOT a plugin root,
// so CHECK 2 actually runs. Paths are passed ABSOLUTE (`resolve(root, …)`),
// which is both what Claude Code sends and what `normalizeToRelative` can
// relativize; the plan's `Edit ./rules/anything.md` is not reachable as
// written, because a relative `./rules/x.md` matches no protected pattern and
// would be allowed with the flag unset too — a case built on it would pass for
// the wrong reason. The last case below passes raw relative paths deliberately,
// and says why.
//
// The flag is handed to the child through `runWrite`'s overrides. The harness
// strips it from every other spawn (see the case above), so the flag-unset half
// is genuinely unset regardless of the developer's own shell.
// ---------------------------------------------------------------------------

const FLAG_SET = { FUSION_ALLOW_RULES_WRITE: "1" };

describe("FUSION_ALLOW_RULES_WRITE on the write-tool path", () => {
  it(
    "blocks an Edit to a rule file when the flag is unset",
    () => {
      // The control for every case below. If this stopped blocking, the
      // flag-set cases would prove nothing: they would be asserting an allow
      // that was already there.
      withProject(({ root }) => {
        const res = runWrite(root, resolve(root, "rules/x.md"));

        expect(res.decision).toBe("block");
        expect(res.reason).toContain("Protected path");
        expect(res.reason).toContain("rules/x.md");

        const state = readEscalation(root);
        expect(state?.consecutiveBlocks).toBe(1);
        expect(state?.haltActive).toBe(false);
        expect(readEvents(root).map((e) => e.event)).toEqual(["guard_block"]);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "allows the same Edit with the flag set, and records one advisory",
    () => {
      withProject(({ root }) => {
        const res = runWrite(root, resolve(root, "rules/x.md"), "Edit", FLAG_SET);

        expect(res.decision).toBeUndefined();

        // The advisory is FIRST, not ONLY: the exemption waives CHECK 2 and
        // nothing else, so the write continues into the ordinary allow path,
        // which emits guard_allow. Asserting the whole sequence pins that.
        const events = readEvents(root);
        expect(events.map((e) => e.event)).toEqual([
          "guard_advisory",
          "guard_allow",
        ]);
        expect(events[0]?.tool).toBe("Edit");
        expect(events[0]?.file).toBe("rules/x.md");
        expect(events[0]?.detail).toContain("FUSION_ALLOW_RULES_WRITE");
        expect(events[0]?.detail).toContain("rules/x.md");

        // One clear-level entry in escalation.json, the same shape the git
        // override note writes, and no block recorded.
        const state = readEscalation(root);
        const clears = (state?.recentEvents ?? []).filter(
          (e) => e.level === "clear",
        );
        expect(clears).toHaveLength(1);
        expect(clears[0]?.trigger).toBe("rules_write_exemption");
        expect(clears[0]?.message).toContain("FUSION_ALLOW_RULES_WRITE");
        expect(clears[0]?.filePath).toBe("rules/x.md");
        expect(clears[0]?.toolName).toBe("Edit");
        expect(state?.consecutiveBlocks).toBe(0);
        expect(state?.haltActive).toBe(false);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "protects the second rule root, and exempts it on the same terms",
    () => {
      // This case used to assert the opposite, and the flip is the fix.
      // `.claude/rules/**` was on `RULE_DIR_PATTERNS` — the exempt set — while
      // it was NOT on `guard.protectedPaths`, so a write there was allowed
      // outright and the exemption was never asked: protection inverted
      // relative to the content, since `bin/fusion-rules` emits from both roots
      // with no precedence and the heavier project-wide material belongs in
      // this one (`rules/context-lean-claude-md.md`). Closed by
      // `shared/issues/260801-1020_*_guard-protects-rules-but-not-claude-rules.md`.
      //
      // Two projects rather than one, because the first call records a block
      // and the second asserts the whole event sequence of a fresh project.
      withProject(({ root }) => {
        const res = runWrite(root, resolve(root, ".claude/rules/local.md"));

        expect(res.decision).toBe("block");
        expect(res.reason).toContain("Protected path");
        expect(res.reason).toContain(".claude/rules/local.md");
      });

      withProject(({ root }) => {
        const res = runWrite(
          root,
          resolve(root, ".claude/rules/local.md"),
          "Edit",
          FLAG_SET,
        );

        expect(res.decision).toBeUndefined();

        const events = readEvents(root);
        expect(events.map((e) => e.event)).toEqual([
          "guard_advisory",
          "guard_allow",
        ]);
        expect(events[0]?.file).toBe(".claude/rules/local.md");
        expect(events[0]?.detail).toContain("FUSION_ALLOW_RULES_WRITE");
        expect(events[0]?.detail).toContain(".claude/rules/local.md");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "exempts a rule file inside retired/, which needs no pattern of its own",
    () => {
      // `rules/retired/` is the destination the curator job moves a retired
      // rule into. It is inside `rules/`, so it falls out of the same pattern —
      // asserted rather than assumed, because the whole retirement flow rests
      // on it.
      withProject(({ root }) => {
        const res = runWrite(
          root,
          resolve(root, "rules/retired/old.md"),
          "Write",
          FLAG_SET,
        );

        expect(res.decision).toBeUndefined();
        const events = readEvents(root);
        expect(events[0]?.event).toBe("guard_advisory");
        expect(events[0]?.file).toBe("rules/retired/old.md");
        expect(events[0]?.tool).toBe("Write");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "still blocks agents/** with the flag set",
    () => {
      withProject(({ root }) => {
        const res = runWrite(
          root,
          resolve(root, "agents/coder.md"),
          "Edit",
          FLAG_SET,
        );

        expect(res.decision).toBe("block");
        expect(res.reason).toContain("Protected path");

        const state = readEscalation(root);
        expect(state?.consecutiveBlocks).toBe(1);
        expect(
          (state?.recentEvents ?? []).some(
            (e) => e.trigger === "rules_write_exemption",
          ),
        ).toBe(false);
        expect(readEvents(root).map((e) => e.event)).toEqual(["guard_block"]);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "still blocks the plugin manifest with the flag set",
    () => {
      // Was `skills/demo/SKILL.md` until the user took `skills/**` off the
      // shipped list on 260809. The property is about a protected path OUTSIDE
      // the rule directories, and the manifest is one.
      withProject(({ root }) => {
        const res = runWrite(
          root,
          resolve(root, ".claude-plugin/plugin.json"),
          "Edit",
          FLAG_SET,
        );

        expect(res.decision).toBe("block");
        expect(res.reason).toContain("Protected path");
        expect(readEscalation(root)?.consecutiveBlocks).toBe(1);
        expect(readEvents(root).map((e) => e.event)).toEqual(["guard_block"]);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "does not lift an active halt",
    () => {
      // The property the flag most obviously must not have. CHECK 1 runs above
      // CHECK 2, so a halted guard blocks the exempted write like any other —
      // and the halt state must survive the call untouched, which is why the
      // state is asserted and not only the verdict.
      withProject(
        ({ root }) => {
          const res = runWrite(
            root,
            resolve(root, "rules/x.md"),
            "Edit",
            FLAG_SET,
          );

          expect(res.decision).toBe("block");
          expect(res.reason).toContain("[HALTED]");

          const state = readEscalation(root);
          expect(state?.haltActive).toBe(true);
          expect(state?.consecutiveBlocks).toBe(3);
          expect(
            (state?.recentEvents ?? []).some(
              (e) => e.trigger === "rules_write_exemption",
            ),
          ).toBe(false);
          expect(readEvents(root).map((e) => e.event)).toEqual(["guard_halt"]);
        },
        { escalation: { haltActive: true, consecutiveBlocks: 3 } },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "does not exempt an un-canonical spelling that names a non-rule path",
    () => {
      // These two spellings arrive UNCOLLAPSED here and nowhere else.
      // `normalizeToRelative` returns a relative path untouched (guard.ts), and
      // an absolute one goes through `resolve`, which would collapse both. So
      // the raw relative form is the only way to reach the predicate with them,
      // and `runGuard` is used directly to bypass any helper that might
      // normalise on the way in.
      withProject(({ root }) => {
        // Control: the relative route itself works and IS exempted, so the two
        // denials below are the canonicalisation, not a rejection of relative
        // paths.
        const ok = runGuard(
          root,
          "Edit",
          { file_path: "rules/x.md" },
          FLAG_SET,
        );
        expect(ok.decision).toBeUndefined();

        // Matches `rules/**` textually, WRITES agents/coder.md.
        const traversal = runGuard(
          root,
          "Edit",
          { file_path: "rules/../agents/coder.md" },
          FLAG_SET,
        );
        expect(traversal.decision).toBe("block");
        expect(traversal.reason).toContain("Protected path");

        // The bare rule directory. `rules/**` compiles to `^rules/.*$`, whose
        // `.*` matches the empty string, so `rules/` matches while `rules`
        // does not. The flag permits writing rule FILES; it does not permit
        // taking the directory.
        const dir = runGuard(root, "Edit", { file_path: "rules/" }, FLAG_SET);
        expect(dir.decision).toBe("block");
        expect(dir.reason).toContain("Protected path");
      });
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// The exemption and the Bash surface.
//
// This block used to make the flag a control on the shell as well as on the
// write tools: `mv`, `rm`, `sed -i` and `>` reach a rule file too, so the
// mutation classifier applied the same exemption to a command's operands.
//
// The classifier is gone. What a shell does to a protected path is measured
// AFTER the call (`lib/protected-snapshot.ts` + `tracker.ts`), and the exemption
// is asked there — of a path that has actually changed, through
// `isObservedRulePath`. Its cases live in
// `protected-snapshot-integration.test.ts` ("the rules-write exemption reaches
// the measurement") and in `rules-write-exemption.test.ts`, not here.
//
// Seven cases that asserted the grant, the refusal and the advisory on a
// PreToolUse Bash verdict went with it: there is no such verdict left to assert.
// What remains are properties of the Bash surface itself, for which the flag is
// only the setting.
// ---------------------------------------------------------------------------

describe("FUSION_ALLOW_RULES_WRITE and the Bash surface", () => {
  it(
    "leaves guard state untouched for an innocuous call with the flag set",
    () => {
      // The property the whole Bash path is built around (260707-0750/0751).
      // The note is reachable only when something was actually exempted, so
      // setting the flag does not turn ordinary shell work into log traffic.
      withProject(({ root }) => {
        expect(runBash(root, "ls -la", FLAG_SET).decision).toBeUndefined();
        expect(runBash(root, "cat rules/x.md", FLAG_SET).decision).toBeUndefined();

        expect(readEscalation(root)).toBeNull();
        expect(readEvents(root)).toEqual([]);
      });
    },
    CASE_TIMEOUT,
  );

});

// ---------------------------------------------------------------------------
// Turn 2 — the exemption is a filesystem boundary, not a text boundary.
//
// Three findings closed together, because two of them are one input class seen
// from opposite sides. Everything below runs against the REAL guard subprocess
// in a throwaway project, and every attack carries its flag-UNSET control, so a
// deny can never be read as "the flag simply did not apply".
//
// What was measured BEFORE the fix, and is what these cases exist to keep
// closed: with the flag set, `ln -s ../ rules/up` was itself an exempted write,
// after which `Write rules/up/agents/coder.md` and `rm rules/up/hooks/config
// .json` both allowed. The flag was not "write the rule files"; it was "write
// anywhere, in two commands", and the second command could delete the halt
// record.
// ---------------------------------------------------------------------------

/**
 * Assert that each subject is denied — each in its OWN fresh project, and each
 * for a reason that is not the halt.
 *
 * Both halves are load-bearing and the first version of these cases had
 * neither. Three denials halt the guard, so a loop of attacks against one root
 * gets a real verdict for the first three and `[HALTED]` for every one after,
 * and `decision === "block"` passes for all of them. That is the vacuous pass
 * the harness was built to make impossible, reintroduced one level up.
 */
function denyEach(
  subjects: string[],
  call: (root: string, subject: string) => { decision?: string; reason?: string },
  opts: { setup?: (root: string) => void; reasonContains?: string } = {},
): void {
  for (const subject of subjects) {
    withProject(({ root }) => {
      opts.setup?.(root);
      const res = call(root, subject);
      expect(res.decision, subject).toBe("block");
      expect(res.reason ?? "", subject).not.toContain("[HALTED]");
      if (opts.reasonContains !== undefined) {
        expect(res.reason, subject).toContain(opts.reasonContains);
      }
    });
  }
}

/**
 * Where a project-relative path really lands — symlinks resolved the way the
 * KERNEL resolves them, a missing tail appended literally.
 *
 * Deliberately NOT built on `resolve()`. `resolve` collapses `..` lexically,
 * which is the defect these cases exist to pin, so a helper built on it would
 * agree with the bug and every assertion using it would pass.
 */
function realLocation(root: string, rel: string): string {
  let abs = `${root}/${rel}`;
  const tail: string[] = [];
  for (;;) {
    try {
      return [realpathSync.native(abs), ...[...tail].reverse()].join("/");
    } catch {
      const cut = abs.lastIndexOf("/");
      if (cut <= 0) return [abs, ...[...tail].reverse()].join("/");
      tail.push(abs.slice(cut + 1));
      abs = abs.slice(0, cut);
    }
  }
}

const editCall = (root: string, path: string) =>
  runGuard(root, "Edit", { file_path: path }, FLAG_SET);
const editCallNoFlag = (root: string, path: string) =>
  runGuard(root, "Edit", { file_path: path });

/** Plant the aliases directly, so the TRAVERSE is tested on its own. */
function plantAliases(root: string): void {
  mkdirSync(resolve(root, "hooks"), { recursive: true });
  writeFileSync(resolve(root, "hooks/config.json"), "{}\n", "utf-8");
  // A link out of the rule directory, to the project root.
  symlinkSync("../", resolve(root, "rules/up"));
  // A DANGLING link: its target does not exist yet, so `realpath` refuses the
  // whole path and a resolver that read that as "not created yet" would report
  // the lexical location and grant. `.guard-state` is not created until the
  // guard first writes it, which is exactly when an agent would plant this.
  symlinkSync("../fusion-workbench/.guard-state", resolve(root, "rules/gs"));
  // A hard link: a protected inode under a second name inside `rules/`. Both
  // names resolve to themselves, so resolution alone says yes.
  linkSync(resolve(root, "hooks/config.json"), resolve(root, "rules/copy"));
}

describe("the exemption resolves the path against the filesystem (finding 1)", () => {
  const reachable = [
    ["an agent prompt", "rules/up/agents/coder.md"],
    ["the guard configuration", "rules/up/hooks/config.json"],
    ["the permission settings", "rules/up/settings.json"],
    ["the plugin manifest", "rules/up/.claude-plugin/plugin.json"],
    ["the monitor binary", "rules/up/bin/monitor"],
    ["the guard's own state", "rules/up/fusion-workbench/.guard-state/escalation.json"],
    ["the halt record through a dangling link", "rules/gs/escalation.json"],
    ["a protected inode under a second name", "rules/copy"],
    // ---------------------------------------------------------------------
    // The same aliases spelled with a `..` THROUGH the link, one character
    // apart from the rows above and, for one Turn, the difference between a
    // deny and the whole protected list. `posix.normalize` resolves `..`
    // lexically — it deletes `up` from the string — while the kernel resolves
    // `up` to its target first and then takes the parent OF THE TARGET. So the
    // path handed to gate 2 no longer contained the link, gate 2 truthfully
    // answered "inside `rules/`", and the write landed anywhere in the project.
    // Measured, both surfaces, `FUSION_ALLOW_RULES_WRITE=1`.
    // ---------------------------------------------------------------------
    ["an agent prompt, through the link and back up", "rules/up/../agents/coder.md"],
    ["the guard configuration, through the link and back up", "rules/up/../hooks/config.json"],
    ["the hook wiring, through the link and back up", "rules/up/../hooks/hooks.json"],
    ["the permission settings, through the link and back up", "rules/up/../settings.json"],
    ["the plugin manifest, through the link and back up", "rules/up/../.claude-plugin/plugin.json"],
    ["the monitor binary, through the link and back up", "rules/up/../bin/monitor"],
    // `rules/gs` was planted to close the DANGLING-link route to the halt
    // record. This is the same record through the same link, one `..` on.
    ["the halt record, through the dangling link and back up", "rules/gs/../.guard-state/escalation.json"],
  ] as const;

  for (const [what, path] of reachable) {
    it(
      `denies a write to ${what} spelled through an alias in rules/`,
      () => {
        denyEach([path], editCall, {
          setup: plantAliases,
          reasonContains: "Protected path",
        });
      },
      CASE_TIMEOUT,
    );
  }

  it(
    "leaves the halt standing, because the record is no longer reachable",
    () => {
      // The Directive's criterion, falsified in practice before this fix: an
      // allowed write removed `escalation.json`, after which `loadEscalation()`
      // returned the empty state and `haltActive` was false.
      //
      // In a HALTED project the block may come from either gate, and that is
      // the claim here — nothing got through and the halt is intact. That the
      // path itself is closed is proved separately, on an unhalted project, by
      // the `rules/gs/escalation.json` row of the table above.
      //
      // The shell spelling of the same attack (`rm rules/gs/escalation.json`)
      // left with the mutation classifier. It is not unguarded: a shell that
      // reaches a protected path is measured after the call and put back.
      withProject(
        ({ root }) => {
          plantAliases(root);
          expect(
            runGuard(root, "Edit", { file_path: "rules/gs/escalation.json" }, FLAG_SET)
              .decision,
          ).toBe("block");
          expect(readEscalation(root)?.haltActive).toBe(true);
        },
        { escalation: { haltActive: true } },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "denies a dangling link, a link chain, an absolute link and a cycle",
    () => {
      // `realpath` answers none of these: it fails outright on the first three
      // and loops on the last. Each one is a way to make the guard read a
      // planted alias as an ordinary not-yet-created rule file.
      const plantLinks = (root: string): void => {
        symlinkSync("../agents/brand-new.md", resolve(root, "rules/new"));
        symlinkSync("b", resolve(root, "rules/a"));
        symlinkSync("../agents", resolve(root, "rules/b"));
        symlinkSync(resolve(root, "agents"), resolve(root, "rules/abs"));
        symlinkSync("loop", resolve(root, "rules/loop"));
      };

      denyEach(
        [
          "rules/new",
          "rules/a/coder.md",
          "rules/b/coder.md",
          "rules/abs/coder.md",
          "rules/loop",
          "rules/loop/x.md",
          // And each of them spelled with a `..`, which is the spelling that
          // erased the link from the string entirely. Every one of these was an
          // ALLOW while the six above denied.
          "rules/a/../agents/coder.md",
          "rules/b/../agents/coder.md",
          "rules/abs/../agents/coder.md",
          "rules/new/../coder.md",
          "rules/loop/../x.md",
        ],
        editCall,
        { setup: plantLinks },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "reads the spelling BEFORE it is relativised, so absolute is not a way in",
    () => {
      // Claude Code sends ABSOLUTE file paths, and `normalizeToRelative`
      // resolves one through `resolve` + `relative` — which collapses `..` a
      // step earlier than `collapseSegments` does. A check reading anything but
      // the raw tool input would close the relative spelling and leave the one
      // the tool actually sends wide open.
      //
      // The paths are built by CONCATENATION. `resolve()` here would collapse
      // the very thing under test, and the case would pass for no reason.
      withProject(({ root }) => {
        plantAliases(root);
        const res = runGuard(
          root,
          "Edit",
          { file_path: `${root}/rules/up/../agents/coder.md` },
          FLAG_SET,
        );
        expect(res.decision).toBe("block");
        expect(res.reason ?? "").not.toContain("[HALTED]");
      });

      // The control that keeps the case honest: an absolute spelling of a
      // genuine rule file still gets the grant.
      withProject(({ root }) => {
        expect(
          runGuard(root, "Edit", { file_path: `${root}/rules/x.md` }, FLAG_SET)
            .decision,
        ).toBeUndefined();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "refuses a `..` even where it would have stayed inside the rule directory",
    () => {
      // The cost of the boundary, asserted rather than left to be discovered.
      // `rules/a/../x.md` resolves to a rule file when `rules/a` is a
      // DIRECTORY, and to something else entirely when it is a symlink — and
      // the collapsed string cannot tell the two apart, because collapsing is
      // what removed the component that decides. So the whole spelling class is
      // refused. It costs nothing real: no rule-curation workflow needs `..`,
      // and every one of these files is writable by its ordinary name.
      denyEach(
        [
          "rules/retired/../x.md",
          "rules/a/../x.md",
          "rules/./a/../x.md",
          "rules/retired/../retired/old.md",
        ],
        editCall,
        { reasonContains: "Protected path" },
      );
    },
    CASE_TIMEOUT,
  );

  /**
   * Relocate an existing symlink into `rules/` with the verb named, using the
   * real command rather than a `symlinkSync` that only imitates its result.
   *
   * `ln` is the one row `VerbSpec.exemptible` marks false, and its docstring
   * states the bound honestly: `mv` and `cp -P` can relocate an EXISTING link
   * into the rule directory, and they must stay exemptible because
   * `mv rules/x.md rules/retired/` is the flag's headline use. That bound was
   * asserted in prose and never exercised — so the plant was allowed, the
   * predicate was supposed to make it harmless, and it did not.
   */
  const plantVia = (plant: "mv" | "cp -P") => (root: string): void => {
    mkdirSync(resolve(root, "stage"), { recursive: true });
    symlinkSync("../agents", resolve(root, "stage/link"));
    const [bin, ...flags] = plant.split(" ");
    const run = spawnSync(bin, [...flags, "stage/link", "rules/link"], {
      cwd: root,
      encoding: "utf-8",
    });
    if (run.status !== 0) {
      throw new Error(`${plant} plant failed: ${run.stderr}`);
    }
    if (!lstatSync(resolve(root, "rules/link")).isSymbolicLink()) {
      throw new Error(`${plant} did not leave a symlink at rules/link`);
    }
  };

  for (const plant of ["mv", "cp -P"] as const) {
    it(
      `allows \`${plant}\` to plant an alias, and denies every write through it`,
      () => {
        // The allow is not the bug and closing it would break the headline use;
        // what has to hold is that the plant buys nothing.
        withProject(({ root }) => {
          mkdirSync(resolve(root, "stage"), { recursive: true });
          symlinkSync("../agents", resolve(root, "stage/link"));
          expect(
            runBash(root, `${plant} stage/link rules/link`, FLAG_SET).decision,
            plant,
          ).toBeUndefined();
        });

        denyEach(
          [
            "rules/link/coder.md",
            "rules/link/../agents/coder.md",
            "rules/link/../hooks/config.json",
            "rules/link/../fusion-workbench/.guard-state/escalation.json",
          ],
          editCall,
          { setup: plantVia(plant), reasonContains: "Protected path" },
        );
      },
      CASE_TIMEOUT,
    );
  }

  it(
    "never writes an advisory naming a file the write does not reach",
    () => {
      // The one audit trail the flag has. The advisory's `file` field carries
      // the COLLAPSED path, and the collapse is exactly what made the grant
      // wrong: before this fix `Edit rules/up/../agents/coder.md` was ALLOWED
      // and recorded
      //   {"event":"guard_advisory","file":"rules/agents/coder.md", …}
      // — a file that does not exist and was never written — while the write it
      // authorised removed `agents/coder.md`. A reader of events.jsonl, or of
      // the monitor, saw a routine rule-file edit.
      //
      // Two halves, and both are needed. A refused grant must leave NO advisory
      // at all, and a granted one must name a path that really does reach the
      // file, which is asserted through the filesystem rather than by string
      // equality — a grant through a link that stays inside the rule directory
      // legitimately names a different string for the same file.
      withProject(({ root }) => {
        plantAliases(root);
        const res = runGuard(
          root,
          "Edit",
          { file_path: "rules/up/../agents/coder.md" },
          FLAG_SET,
        );
        expect(res.decision).toBe("block");
        const events = readEvents(root);
        expect(events.map((e) => e.event)).toEqual(["guard_block"]);
        // No advisory at all — the flag exercised no permission here.
        //
        // Scoped to the advisory deliberately. The guard_block event DOES carry
        // `rules/agents/coder.md`, the collapsed spelling, which is also not the
        // file the write would have reached (`agents/coder.md`). That is the
        // protection side's long-standing lexical naming — a text classifier
        // names the target the text names — and it is a diagnostic imprecision
        // on a DENY, not a grant describing a write that happened.
        expect(
          events.filter((e) => e.event === "guard_advisory").map((e) => e.file),
        ).toEqual([]);
      });

      for (const spelled of [
        "rules/x.md",
        "rules/./x.md",
        "rules/retired/old.md",
        // Through an alias and back INTO the rule directory: granted, and the
        // advisory names a different STRING for the same file. This is the row
        // that makes the assertion filesystem-based rather than textual.
        "rules/up/rules/x.md",
      ]) {
        withProject(({ root }) => {
          plantAliases(root);
          const res = runGuard(root, "Edit", { file_path: spelled }, FLAG_SET);
          expect(res.decision, spelled).toBeUndefined();

          const advisory = readEvents(root).find(
            (e) => e.event === "guard_advisory",
          );
          expect(advisory?.file, spelled).toBeDefined();
          expect(realLocation(root, advisory!.file!), spelled).toBe(
            realLocation(root, spelled),
          );
          expect(advisory!.file!, spelled).not.toContain("..");
        });
      }
    },
    CASE_TIMEOUT,
  );

  it(
    "still allows every legitimate rule write, which is what the flag is for",
    () => {
      // The false-positive side. A gate that closed the attack by refusing
      // everything would pass every case above and be useless.
      withProject(({ root }) => {
        plantAliases(root);
        for (const path of [
          "rules/x.md",
          "rules/brand-new.md",
          "rules/retired/x.md",
          "rules/a/b/deep-new.md",
          ".claude/rules/local.md",
          // Through the alias and back INTO the rule directory: it resolves to
          // a rule file, so it is one.
          "rules/up/rules/x.md",
        ]) {
          expect(
            runGuard(root, "Edit", { file_path: path }, FLAG_SET).decision,
            path,
          ).toBeUndefined();
        }
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "grants a rule directory that is ITSELF a symlink to a shared tree",
    () => {
      // Gate 2 compares against the RESOLVED rule directory rather than
      // requiring the target to stay under the project root, so a project that
      // shares its rules across repositories still works.
      withProject(({ root }) => {
        const shared = resolve(root, "..", "shared-rules");
        mkdirSync(shared, { recursive: true });
        writeFileSync(resolve(shared, "x.md"), "# shared\n", "utf-8");
        rmSync(resolve(root, "rules"), { recursive: true, force: true });
        symlinkSync(shared, resolve(root, "rules"));

        expect(
          runGuard(root, "Edit", { file_path: "rules/x.md" }, FLAG_SET).decision,
        ).toBeUndefined();
        expect(
          runGuard(root, "Edit", { file_path: "rules/x.md" }).decision,
        ).toBe("block");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "denies all of it with the flag UNSET too, so no deny is the flag not applying",
    () => {
      denyEach(
        ["rules/up/agents/coder.md", "rules/copy", "rules/x.md"],
        editCallNoFlag,
        { setup: plantAliases },
      );
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------

describe("the protected list is matched on a collapsed spelling (finding 2)", () => {
  // Pre-existing at HEAD and needing no flag: `matchesAny` compiles a glob to a
  // regex over the path's TEXT, and `normalizeToRelative` returns a relative
  // path untouched. So `Edit agents/coder.md` denied while `Edit
  // ./agents/coder.md` allowed and wrote the same file — the entire protected
  // list bypassable with a two-character prefix.
  //
  // `runGuard` is used directly rather than `runWrite`, so nothing normalises
  // on the way in.
  const bypasses = [
    "./agents/coder.md",
    "x/../agents/coder.md",
    ".//agents/coder.md",
    "./x/./../agents/coder.md",
    "a/b/../../agents/coder.md",
    "./hooks/config.json",
    "./hooks/hooks.json",
    "./.claude-plugin/plugin.json",
    "./settings.json",
    "./bin/monitor",
    "rules/retired/../../agents/coder.md",
  ];

  for (const path of bypasses) {
    it(
      `denies the protected file spelled ${JSON.stringify(path)}`,
      () => {
        withProject(({ root }) => {
          const res = runGuard(root, "Edit", { file_path: path });
          expect(res.decision).toBe("block");
          expect(res.reason).toContain("Protected path");
          // The reason names the collapsed path, which is the file the write
          // would actually have reached.
          expect(res.reason).not.toContain("..");
        });
      },
      CASE_TIMEOUT,
    );
  }

  it(
    "does not let the flag turn any of those spellings into a grant",
    () => {
      // The mirror. Collapsing widens the protected set and NARROWS the exempt
      // set, and both directions have to hold at once.
      denyEach(
        [
          "./agents/coder.md",
          "x/../agents/coder.md",
          "rules/../agents/coder.md",
          "./rules/../agents/coder.md",
          "rules/./../agents/coder.md",
          "rules/a/b/../../../agents/coder.md",
        ],
        editCall,
        { reasonContains: "Protected path" },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "still allows unprotected files under the same spellings",
    () => {
      // The collapse must not turn ordinary work into denials.
      withProject(({ root }) => {
        for (const path of [
          "notes.txt",
          "./notes.txt",
          "./build/out.js",
          "./docs/x.md",
          "x/../notes.txt",
          "rules-draft/x.md",
        ]) {
          expect(
            runGuard(root, "Edit", { file_path: path }).decision,
            path,
          ).toBeUndefined();
        }
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "keeps the trailing-separator denials the collapse could have lost",
    () => {
      // A trailing separator WIDENS whatever set it is matched against:
      // `rules/**` compiles to `^rules/.*$`, whose `.*` matches the empty
      // string, so `agents/` matches while `agents` does not. Stripping it here
      // — as the exemption's own canonicalisation does, correctly, on the grant
      // side — would have turned four denials into allows.
      denyEach(["agents/", "rules/", "./rules/", "rules//"], editCall, {
        reasonContains: "Protected path",
      });
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// The halted guard used to block shell mutations too (finding 3).
//
// `isHalted` was once consulted on the write-tool path only, so a halted guard
// blocked `Edit` and allowed every `mv`, `rm` and `sed -i`. This block closed
// that, and seven cases pinned it: every recognised mutation denied under a
// halt, reads still allowed, the halt not counted as a fresh violation, no
// exemption advisory for a mutation it halted.
//
// All seven are gone, and not because the halt weakened. The halt asked
// `mutation.mutates` — "does this command write a file at all?" — which is the
// same question the retired protected-path classifier asked, in small, and just
// as undecidable from the command text. With the classifier the halt lost its
// reach into the shell. The user confirmed that cost explicitly on 260807-0945
// (`decisions/260807-1026_*_verlust-des-bash-halts-auf-der-shell.md`): under a
// halt `rm notes.txt` now runs.
//
// What replaced it is not a weaker halt but a different mechanism. A protected
// path a shell reaches is measured after the call and written back, halt or no
// halt (`protected-snapshot-integration.test.ts`). The halt itself still blocks
// all four write tools, which is asserted in `guard-halt-event.test.ts`. The
// git branch policy was the shell's last deny and outlived the classifier by
// two days; it is deleted too, so nothing an agent types into a shell is read
// by the guard at all.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Turn 3 — a refusal that fails safe can still fail the user.
//
// Two findings, one mechanism. `260802-2332`: two ordinary rule files hard-
// linked to each other are both refused, permanently, and the deny is
// byte-identical to the deny with the flag UNSET — so the flag reads as broken.
// `260803-1252`: a gate-0 deny names the COLLAPSED path, which for
// `rules/retired/../x.md` is `rules/x.md`, a file the same flag does let the
// agent write. Both leave an agent with a deny it cannot explain, and the
// documented response to that is rephrasing, which is the failure
// `rules/protected-path-discipline.md` exists to prevent.
//
// The verdict is unchanged in every case below. Only the message is new.
// ---------------------------------------------------------------------------

/** The write-tool deny, exactly as it read before any note was appended. */
const PLAIN_DENY = (path: string): string =>
  `Protected path: ${path} cannot be modified directly. This path is under compliance guard protection.`;

/** Two ORDINARY rule files sharing one inode. Nothing protected is aliased. */
function hardLinkTwoRuleFiles(root: string): void {
  linkSync(resolve(root, "rules/x.md"), resolve(root, "rules/y.md"));
}

describe("a refused grant says which gate refused it (T3-2)", () => {
  it(
    "names the hard link that no earlier message mentioned",
    () => {
      withProject(({ root }) => {
        hardLinkTwoRuleFiles(root);
        const res = runWrite(root, "rules/x.md", "Edit", FLAG_SET);

        expect(res.decision).toBe("block");
        expect(res.reason).toContain("FUSION_ALLOW_RULES_WRITE");
        expect(res.reason).toContain("hard link");
        // Not a spelling problem, so the message must not read as one.
        expect(res.reason).toContain("ask the user");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "leaves the flag-UNSET deny exactly as it was",
    () => {
      // The half that makes the note worth having: with the flag unset there is
      // no grant to explain, and the message is the one it has always been.
      withProject(({ root }) => {
        hardLinkTwoRuleFiles(root);
        const res = runWrite(root, "rules/x.md");

        expect(res.decision).toBe("block");
        expect(res.reason).toBe(PLAIN_DENY("rules/x.md"));
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "keeps the accepted cost visible: two hard-linked RULE files are both refused",
    () => {
      // The behaviour is deliberate — a grant read off a path is sound only
      // while the path names one file — and it costs the flag's headline use on
      // a project whose files arrived through `rsync --link-dest`, `cp -al` or
      // `git clone --local`. Recorded here as a decision rather than left to be
      // discovered, per the finding's "test coverage this needs".
      denyEach(
        ["rules/x.md", "rules/y.md"],
        (root, path) => runWrite(root, path, "Edit", FLAG_SET),
        { setup: hardLinkTwoRuleFiles, reasonContains: "hard link" },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "names the `..` spelling instead of a file the flag would have allowed",
    () => {
      // `rules/retired/../x.md` collapses to `rules/x.md` — writable under that
      // name with the same flag. The deny still names the collapsed path,
      // because that is what the protection side matched, but it no longer
      // stops there.
      withProject(({ root }) => {
        const res = runWrite(root, "rules/retired/../x.md", "Edit", FLAG_SET);

        expect(res.decision).toBe("block");
        expect(res.reason).toContain("FUSION_ALLOW_RULES_WRITE");
        expect(res.reason).toContain("`..`");
        expect(res.reason).toContain("without a `..`");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "explains a rule path that resolves out of the rule directory",
    () => {
      denyEach(["rules/up/agents/coder.md"], editCall, {
        setup: plantAliases,
        reasonContains: "outside the rule directories",
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "says nothing about the exemption for a path the flag was never about",
    () => {
      // The note must not advertise a grant that does not apply. `agents/coder
      // .md` is not a rule path with the flag set or unset, and both spellings
      // get the message they always got — including the `..` spelling, whose
      // gate-0 refusal would be true here and useless.
      withProject(({ root }) => {
        expect(runWrite(root, "agents/coder.md", "Edit", FLAG_SET).reason).toBe(
          PLAIN_DENY("agents/coder.md"),
        );
      });
      withProject(({ root }) => {
        expect(
          runWrite(root, "x/../agents/coder.md", "Edit", FLAG_SET).reason,
        ).toBe(PLAIN_DENY("agents/coder.md"));
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "puts the cause in the escalation record, not only in the reply",
    () => {
      // The reason string is what `recordBlock` stores, so a user reading
      // `escalation.json` or the monitor's warnings sees the same cause the
      // agent saw.
      withProject(({ root }) => {
        hardLinkTwoRuleFiles(root);
        runWrite(root, "rules/x.md", "Edit", FLAG_SET);

        const state = readEscalation(root);
        expect(state?.recentEvents[0]?.trigger).toBe("protected_path");
        expect(state?.recentEvents[0]?.message).toContain("hard link");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "still grants the unaliased neighbours, so the note is not a new refusal",
    () => {
      withProject(({ root }) => {
        hardLinkTwoRuleFiles(root);
        // `rules/retired/.keep` and `.claude/rules/local.md` share no inode.
        expect(runWrite(root, ".claude/rules/local.md", "Edit", FLAG_SET).decision)
          .toBeUndefined();
        expect(runWrite(root, "rules/retired/.keep", "Edit", FLAG_SET).decision)
          .toBeUndefined();
      });
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// The C5b project configuration — plan step 6.
//
// Every case below runs against a THROWAWAY project root, through a real guard
// subprocess. That is not a stylistic choice inherited from the cases above: it
// is the only way these can be checked at all. The write guard stands down in
// this repository, so a `fusion-guard.json` placed here and edited by hand
// would be honoured by nothing and would report a pass for a check that never
// ran. The Circle's activation record named that as the most likely way this
// work ships broken.
//
// `projectConfig()` writes the file into the fixture. Nothing here creates a
// `fusion-guard.json` at the repository root, which belongs to step 7.
// ---------------------------------------------------------------------------

/** A project whose `fusion-guard.json` holds `value` (object or raw text). */
const withConfiguredProject = <T,>(
  value: object | string,
  fn: (project: { root: string }) => T,
): T =>
  withProject(fn, { files: { "fusion-guard.json": projectConfig(value) } });

describe("the self-protection floor, through the guard", () => {
  it(
    "blocks an Edit to fusion-guard.json in a project that has one",
    () => {
      // The file does NOT list itself here. That is the case the floor exists
      // for: without it, one edit unprotects the guard's own configuration and
      // every later edit is unguarded.
      withConfiguredProject({ escalation: { blocksBeforeHalt: 3 } }, ({ root }) => {
        const res = runWrite(root, "fusion-guard.json");

        expect(res.decision).toBe("block");
        expect(res.reason).toContain("Protected path");
        expect(res.reason).toContain("fusion-guard.json");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "blocks it just the same when the file DOES list itself",
    () => {
      withConfiguredProject(
        { guard: { protectedPaths: ["fusion-guard.json"] } },
        ({ root }) => {
          expect(runWrite(root, "fusion-guard.json").decision).toBe("block");
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "blocks it even when the project's own list is empty",
    () => {
      // The floor is a floor: it does not depend on the project agreeing.
      withConfiguredProject({ guard: { protectedPaths: [] } }, ({ root }) => {
        expect(runWrite(root, "fusion-guard.json").decision).toBe("block");
        // …and the empty list really did take effect, so the case above is
        // not passing because the plugin's list was still in force.
        expect(runWrite(root, "agents/coder.md").decision).toBeUndefined();
      });
    },
    CASE_TIMEOUT,
  );

  // A case here used to assert `rm fusion-guard.json` denied on the shell,
  // "which is what makes the floor non-evadable". The floor is still not
  // evadable through a shell, but the mechanism changed and the assertion could
  // not follow it: PreToolUse no longer reads a command for the paths it might
  // write, so the `rm` runs — and the measurement pair then compares the file's
  // fingerprint and writes it back, because the floor puts `fusion-guard.json`
  // on the watched list. That is a POST-call property and it is asserted in
  // `protected-snapshot-integration.test.ts`, where both hooks run around a real
  // effect. Asserting a PreToolUse deny for it here would assert a mechanism
  // that no longer carries the property.

  it(
    "does NOT block creating it when the project has none — the seeding case",
    () => {
      // `/fusion:setup` (step 8) copies the template in. An unconditional floor
      // would deny that write and the file could never be created by the
      // mechanism meant to create it. Decided at the plan gate, decision
      // 260802-1912 option 1.
      withProject(({ root }) => {
        expect(runWrite(root, "fusion-guard.json", "Write").decision)
          .toBeUndefined();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "is not reachable through FUSION_ALLOW_RULES_WRITE",
    () => {
      // The flag exempts the project's rule directories and nothing else.
      // `fusion-guard.json` is not one of them, and a route from the flag to
      // the guard's own configuration would be the flag turning the guard off.
      withConfiguredProject({ escalation: { blocksBeforeHalt: 3 } }, ({ root }) => {
        expect(runWrite(root, "fusion-guard.json", "Edit", FLAG_SET).decision)
          .toBe("block");
      });
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// The floor from a SUBDIRECTORY — issue 260804-1604, plan Step 1.
//
// `findWorkbenchRoot` walks UP from the working directory, so the file the
// loader reads may sit above where the guard is running. Every protected pattern
// is matched against a path relativised to the WORKING directory, so the bare
// `fusion-guard.json` pattern defended `<cwd>/fusion-guard.json` — a file that
// need not exist — while the file governing the guard sat out of reach. All four
// writes to it were allowed, on both surfaces, with no flag.
//
// Every case below runs the guard with `cwd` one directory BELOW the project
// root, which is the whole point: the same cases at the root passed before the
// defect and pass after it. `CONTROL` is the row that proves the root file was
// loaded at all — without it a deny here could mean the project layer was never
// read, and the case would pass for the wrong reason.
// ---------------------------------------------------------------------------

describe("the self-protection floor reached from a subdirectory", () => {
  /**
   * A configured project plus a `sub/` the guard can be run from.
   *
   * `sub` is handed to the callback rather than derived at each call site, so a
   * case cannot accidentally ask the question from the root — where every row
   * below passed before this step and proves nothing.
   */
  const withSubdirectory = <T,>(
    value: object,
    fn: (p: { root: string; sub: string }) => T,
  ): T =>
    withProject(
      ({ root }) => fn({ root, sub: resolve(root, "sub") }),
      {
        files: {
          "fusion-guard.json": projectConfig(value),
          "sub/.keep": "",
          "secret/a": "a secret\n",
        },
      },
    );

  /** A project layer that protects something the plugin's list does not. */
  const NARROWED = { guard: { protectedPaths: ["secret/**"] } };

  it(
    "CONTROL: the root's configuration really is in force down here",
    () => {
      // The row `260804-1604` calls the point of its own measurement. A deny in
      // the four cases below means nothing unless this one denies too: it is the
      // proof that `findWorkbenchRoot` walked up, found the file and applied it.
      withSubdirectory(NARROWED, ({ sub }) => {
        expect(runGuard(sub, "Edit", { file_path: "secret/a" }).decision).toBe(
          "block",
        );
        // And the narrowing took effect, so the list in force is the project's.
        expect(
          runGuard(sub, "Edit", { file_path: "rules/x.md" }).decision,
        ).toBeUndefined();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "denies Edit ../fusion-guard.json",
    () => {
      withSubdirectory(NARROWED, ({ sub }) => {
        const res = runGuard(sub, "Edit", {
          file_path: "../fusion-guard.json",
        });
        expect(res.decision).toBe("block");
        expect(res.reason).toContain("Protected path");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "denies Edit <abs>/fusion-guard.json",
    () => {
      withSubdirectory(NARROWED, ({ root, sub }) => {
        const res = runGuard(sub, "Edit", {
          file_path: resolve(root, "fusion-guard.json"),
        });
        expect(res.decision).toBe("block");
        expect(res.reason).toContain("Protected path");
      });
    },
    CASE_TIMEOUT,
  );

  // The four shell spellings of the same floor — `rm ../fusion-guard.json`,
  // `cd .. && rm fusion-guard.json`, the absolute form, and `rm -rf ..` on the
  // ancestor pass — were asserted here and are gone with the mutation
  // classifier. The floor still holds against a shell: the file is on the
  // measurement's watched list, so a shell that removes it has it written back
  // after the call (`protected-snapshot-integration.test.ts`). What cannot be
  // asserted any more is a PreToolUse verdict, because there is none.

  it(
    "denies a protected path reached by walking OUT of the root and back in",
    () => {
      // Not the floor, and a fix rather than a cost — so it is asserted from the
      // ROOT, where the guard normally runs. `../<root>/secret/a` names a
      // protected file and used to allow, because its TEXT began with `..` and
      // no pattern in the list can. Resolving first is what closes it.
      withSubdirectory(NARROWED, ({ root }) => {
        const back = `../${root.split("/").pop()}`;
        expect(
          runGuard(root, "Edit", { file_path: `${back}/secret/a` }).decision,
        ).toBe("block");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "STATED COST: a protected path ABOVE the working directory still allows",
    () => {
      // The bound on what this step fixes, and it is deliberate. Only the floor
      // gained an absolute spelling; `secret/**` and `rules/**` are
      // project-relative patterns matched against a path relativised to the
      // WORKING directory, so from `sub/` they name `sub/secret/` and
      // `sub/rules/` — which is the reading `260804-1604` calls arguably correct
      // for those patterns and wrong only for the floor. Changing it is the
      // issue's suggested direction 2, which it says not to take in this Circle.
      withSubdirectory(NARROWED, ({ sub }) => {
        expect(
          runGuard(sub, "Edit", { file_path: "../secret/a" }).decision,
        ).toBeUndefined();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "leaves an ordinary write in the subdirectory alone",
    () => {
      // The bound. Nothing about running from a subdirectory makes the guard
      // stricter about paths that are not the configuration file.
      withSubdirectory(NARROWED, ({ sub }) => {
        expect(
          runGuard(sub, "Edit", { file_path: "notes.txt" }).decision,
        ).toBeUndefined();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "leaves the /fusion:setup Step 0f block working, run twice",
    () => {
      // The plan's own falsification test for this step: the seeding block was
      // reshaped around the floor in the predecessor plan, and it is the fastest
      // signal that the floor moved. Both commands are put through the real
      // guard AND through a real shell, because a verdict that says "allow"
      // about a command that does not do what the skill claims is worth nothing.
      withProject(({ root }) => {
        const probe =
          '[ -f ./fusion-guard.json ] && echo "fusion-guard.json present" || echo "fusion-guard.json absent"';
        const copy = `[ -f ./fusion-guard.json ] || { cp "${resolve(REPO_ROOT, "templates/fusion-guard.json")}" ./fusion-guard.json && echo copied; }`;
        const sh = (cmd: string): string =>
          spawnSync("bash", ["-c", cmd], {
            cwd: root,
            encoding: "utf-8",
          }).stdout.trim();

        // FIRST RUN — the file is absent, so the floor is not in force.
        expect(runBash(root, probe).decision).toBeUndefined();
        expect(sh(probe)).toBe("fusion-guard.json absent");
        expect(runBash(root, copy).decision).toBeUndefined();
        expect(sh(copy)).toBe("copied");
        expect(existsSync(resolve(root, "fusion-guard.json"))).toBe(true);

        // SECOND RUN — the probe still allows and now reports `present`, which
        // is what stops the agent running the copy a second time.
        expect(runBash(root, probe).decision).toBeUndefined();
        expect(sh(probe)).toBe("fusion-guard.json present");

        // The skill's own `[ -f ] || cp` guard is what stops the second copy:
        // the shell short-circuits and writes nothing. A line here used to
        // assert that the guard ALSO denied the second copy at PreToolUse; it
        // does not, because no shell command is read for the paths it might
        // write any more. The file is still not overwritable from a shell —
        // it is on the measurement's watched list and gets written back — and
        // that is asserted where both hooks run, in
        // `protected-snapshot-integration.test.ts`.
        expect(sh(copy)).toBe("");
        expect(
          readFileSync(resolve(root, "fusion-guard.json"), "utf-8"),
        ).toBe(
          readFileSync(resolve(REPO_ROOT, "templates/fusion-guard.json"), "utf-8"),
        );
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "does not invent a floor before the file exists, from a subdirectory either",
    () => {
      // Decision 260802-1912 in the shape this step could most easily have
      // reversed by accident: an absolute floor computed from the project root
      // regardless of whether the file is there would deny the seeding write
      // that `/fusion:setup` Step 0f makes, once per session, forever.
      withProject(
        ({ root }) => {
          const sub = resolve(root, "sub");
          expect(
            runGuard(sub, "Write", { file_path: "../fusion-guard.json" })
              .decision,
          ).toBeUndefined();
          expect(
            runGuard(sub, "Write", {
              file_path: resolve(root, "fusion-guard.json"),
            }).decision,
          ).toBeUndefined();
        },
        { files: { "sub/.keep": "" } },
      );
    },
    CASE_TIMEOUT,
  );
});

describe("a project's own protectedPaths replace the plugin's", () => {
  it(
    "protects what the project declared and stops protecting what it dropped",
    () => {
      withConfiguredProject(
        { guard: { protectedPaths: ["secret/**"] } },
        ({ root }) => {
          // Declared: denied.
          expect(runWrite(root, "secret/a").decision).toBe("block");
          // Dropped: allowed. This is the direction a union could not express,
          // and the reason the merge is per top-level key.
          expect(runWrite(root, "rules/x.md").decision).toBeUndefined();
          expect(runWrite(root, "agents/coder.md").decision).toBeUndefined();
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "reaches every write tool, not only Edit",
    () => {
      // One list, one surface now. The shell half of this case — a project list
      // honoured by `Edit` but not by `rm` — was asserted against the mutation
      // classifier; the list reaches the shell through the measurement instead,
      // which reads the same `guard.protectedPaths`.
      withConfiguredProject(
        { guard: { protectedPaths: ["secret/**"] } },
        ({ root }) => {
          for (const tool of ["Write", "Edit", "MultiEdit", "NotebookEdit"]) {
            expect(runWrite(root, "secret/a", tool).decision, tool).toBe("block");
          }
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "a project declaring only escalation keeps the plugin's protected list",
    () => {
      // Two properties in one project, because they are the same mechanism:
      // the `escalation` key came from the project, and `guard` — untouched by
      // the project — came from the plugin.
      withConfiguredProject(
        { escalation: { blocksBeforeHalt: 2 } },
        ({ root }) => {
          expect(runWrite(root, "rules/x.md").decision).toBe("block");
          const second = runWrite(root, "agents/coder.md");

          expect(second.decision).toBe("block");
          // Halted on the SECOND block, not the plugin's third: the project's
          // threshold is live.
          const state = readEscalation(root);
          expect(state?.haltActive).toBe(true);
          expect(readEvents(root).map((e) => e.event)).toEqual([
            "guard_block",
            "guard_halt",
          ]);
        },
      );
    },
    CASE_TIMEOUT,
  );
});

describe("an unparseable project configuration is reported, not swallowed", () => {
  it(
    "emits one advisory and still enforces the plugin's list",
    () => {
      withConfiguredProject("{ this is not json ", ({ root }) => {
        const res = runWrite(root, "rules/x.md");

        // Fell back to the plugin's list rather than failing open.
        expect(res.decision).toBe("block");

        const events = readEvents(root);
        const advisories = events.filter((e) => e.event === "guard_advisory");
        expect(advisories).toHaveLength(1);
        expect(advisories[0]?.detail).toContain("fusion-guard.json");
        expect(advisories[0]?.detail).toContain("not valid JSON");
        // A diagnostic is not a violation: it records no block and moves no
        // counter of its own. The one block below is the protected-path deny.
        const state = readEscalation(root);
        expect(state?.consecutiveBlocks).toBe(1);
        expect(
          (state?.recentEvents ?? []).filter((e) => e.level === "clear"),
        ).toHaveLength(0);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "reports it on the Bash surface too — the stated cost, pinned",
    () => {
      // A deliberate departure from the Bash allow path's zero-side-effect
      // property, and the reason is that silence is the failure the spec
      // rejects. Pinned here so it is a known cost rather than a discovery.
      withConfiguredProject("nope", ({ root }) => {
        expect(runBash(root, "ls -la").decision).toBeUndefined();

        const events = readEvents(root);
        expect(events.map((e) => e.event)).toEqual(["guard_advisory"]);
        expect(events[0]?.detail).toContain("fusion-guard.json");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "leaves an innocuous Bash call in a VALID-config project writing nothing",
    () => {
      // The settled property (issues 260707-0750 and 260707-0751), pinned
      // where it actually applies. The case above bounds the departure; this
      // one bounds the bound.
      //
      // "Writing nothing" names the counter and the event log, not the state
      // DIRECTORY. It used to name the directory, which was the strongest
      // available spelling and is now simply false: the PreToolUse hook drops a
      // fingerprint of the protected paths into
      // `.guard-state/protected-snapshot.json` on every guarded call, so the
      // directory exists after the first `ls -la` while both files the issues
      // are about stay untouched.
      withConfiguredProject(
        { guard: { protectedPaths: ["secret/**"] } },
        ({ root }) => {
          expect(runBash(root, "ls -la").decision).toBeUndefined();
          expect(readEscalation(root)).toBeNull();
          expect(readEvents(root)).toEqual([]);
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "leaves an innocuous Bash call in a NO-config project writing nothing",
    () => {
      // The state of every project on this plugin today. If step 6 had made
      // the loader emit anything on a clean load, this is where it would show.
      withProject(({ root }) => {
        expect(runBash(root, "ls -la").decision).toBeUndefined();
        expect(readEscalation(root)).toBeNull();
        expect(readEvents(root)).toEqual([]);
      });
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// The boundary of the project layer — plan Step 2 of the C5b remediation.
//
// The block's title used to be "what a project configuration can CURRENTLY
// reach — measured, not endorsed", and every case in it pinned a reach nobody
// had chosen. Three of those reaches are now closed by decisions 260804-1630
// and 260804-1631, so the block holds both halves and the title says so. The
// cases that still only MEASURE keep the `MEASURES:` prefix and their citation
// of the record that owns the question.
//
// Every row below is a verdict from a real guard subprocess against a throwaway
// project root. A loader that returns a good list proves nothing about what the
// guard denies — that is the vacuity trap this whole file exists to close, and
// the reason the plan requires a mutation to break at least one of these.
//
// One thing the harness asserts on this block's behalf: `runGuard` throws when
// the guard prints `[guard] Error:`, so the two wrong-type rows that used to
// crash the guard into its fail-open branch cannot pass here quietly. They
// would fail the case, not allow the write.
// ---------------------------------------------------------------------------

describe("what a project configuration can and cannot reach — measured", () => {
  it(
    "MEASURES: in a project that has never been seeded, one write narrows the protected list",
    () => {
      // The residual decision 260802-1912 accepted, measured to its end rather
      // than restated: an agent may create a `fusion-guard.json` that narrows
      // `protectedPaths`, and the narrowing is in force from the very next tool
      // call.
      //
      // The target used to be `fusion-workbench/.guard-state/escalation.json`,
      // because the narrowing also dropped the guard's own state directory and
      // reached the escalation machinery. That entry left `protectedPaths` in
      // this Circle's first step — the measurement writes its own fingerprint,
      // events and counter there, so watching it would make every tool call
      // report its own bookkeeping — and the state directory is no longer
      // protected for anyone. The residual itself is unchanged, so the case is
      // measured on an ordinary protected path instead.
      withProject(({ root }) => {
        // Before: the plugin's list is in force.
        expect(runWrite(root, "agents/coder.md").decision).toBe("block");

        // One allowed write, because the floor is not yet in force.
        expect(runWrite(root, "fusion-guard.json", "Write").decision)
          .toBeUndefined();
        writeFileSync(
          resolve(root, "fusion-guard.json"),
          projectConfig({ guard: { protectedPaths: [] } }),
          "utf-8",
        );

        // After: from the very next tool call.
        expect(runWrite(root, "agents/coder.md").decision).toBeUndefined();

        // The floor did close behind it, which is the half of the decision
        // that holds: the narrowing file cannot now be revised or removed.
        expect(runWrite(root, "fusion-guard.json").decision).toBe("block");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "MEASURES: a HALT still holds — the residual above does not open that door",
    () => {
      // Worth pinning next to the case above so the residual is not read as
      // wider than it is. CHECK 1 is above CHECK 2 on the write path, so a
      // halted guard blocks the narrowing write itself.
      //
      // The shell spelling (`echo '{}' > fusion-guard.json`) was asserted here
      // too, on the Bash halt, which is gone. On the shell the file is defended
      // by the measurement rather than by the halt.
      withProject(
        ({ root }) => {
          expect(runWrite(root, "fusion-guard.json", "Write").decision).toBe(
            "block",
          );
        },
        { escalation: { haltActive: true, consecutiveBlocks: 3 } },
      );
    },
    CASE_TIMEOUT,
  );

  // -------------------------------------------------------------------------
  // Issue 260804-1601 — a partial `guard` object used to empty the list.
  //
  // Three ordinary intentions, each of which removed all nine protected
  // patterns on both surfaces and emitted `guard_allow`, the event meaning
  // nothing unusual happened. The set is open: the rule is "a key the project
  // omits inherits", and these are three of the infinitely many objects that
  // omit `protectedPaths`.
  // -------------------------------------------------------------------------

  const partialGuardObjects: [string, object][] = [
    ["writing down that the guard is on", { guard: { enabled: true } }],
    [
      "raising the sensitivity",
      { guard: { defaultSensitivity: "high" } },
    ],
    [
      "adding one category",
      { guard: { categoryPaths: { api: ["src/api/**"] } } },
    ],
  ];

  for (const [intention, config] of partialGuardObjects) {
    it(
      `keeps every protected pattern when a project is ${intention}`,
      () => {
        withConfiguredProject(config, ({ root }) => {
          const first = runWrite(root, "agents/coder.md");
          expect(first.decision).toBe("block");
          expect(first.reason).toContain("Protected path");

          // The other rows of the measurement table. Only the verdict is
          // asserted from here on: the third block trips the halt, after which
          // the REASON is the halt's rather than the protected path's, and a
          // case that asserted otherwise would be asserting the escalation
          // threshold instead of the merge.
          //
          // Two shell rows left the table, and one of them is worth naming:
          // `rm -rf fusion-workbench/.guard-state` read as a protection check
          // and was neither. It stood fourth, by which point the halt was
          // already active, so it blocked on the halt — measured against the
          // baseline classifier, the path was not protected by the ancestor
          // pass at all. The other, `rm -rf agents`, was a real ancestor deny
          // and has no PreToolUse verdict left to assert.
          expect(runWrite(root, "rules/x.md").decision).toBe("block");
          expect(runWrite(root, ".claude/rules/local.md").decision).toBe("block");
          expect(runWrite(root, "hooks/config.json").decision).toBe("block");
          expect(runWrite(root, "fusion-guard.json").decision).toBe("block");
        });
      },
      CASE_TIMEOUT,
    );
  }

  it(
    "still lets a project narrow its list on purpose — the half a union could not express",
    () => {
      // The falsifier for the case above: if the leaf walk swallowed a DECLARED
      // value, this would deny and deliberate narrowing would be gone with it.
      withConfiguredProject({ guard: { protectedPaths: ["secret/**"] } }, ({ root }) => {
        expect(runWrite(root, "secret/a").decision).toBe("block");
        expect(runWrite(root, "agents/coder.md").decision).toBeUndefined();
        expect(runWrite(root, "rules/x.md").decision).toBeUndefined();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "an EMPTY list declared on purpose really is empty",
    () => {
      withConfiguredProject({ guard: { protectedPaths: [] } }, ({ root }) => {
        expect(runWrite(root, "agents/coder.md").decision).toBeUndefined();
        expect(runWrite(root, "rules/x.md").decision).toBeUndefined();
        // The floor is not part of the declaration and does not go with it.
        expect(runWrite(root, "fusion-guard.json").decision).toBe("block");
      });
    },
    CASE_TIMEOUT,
  );

  // -------------------------------------------------------------------------
  // Issue 260804-1602 — `guard.enabled` from a project.
  //
  // The key sits above every check in guard.ts, so each surface it used to
  // disable gets its own assertion. Two git rows stood here until the branch
  // policy was deleted; what they guarded — that a project cannot switch off a
  // check by declaring a key — is unchanged and is asserted on the surfaces
  // that are left.
  // -------------------------------------------------------------------------

  const GUARD_OFF = { guard: { enabled: false } };

  it(
    "ignores guard.enabled: false and keeps denying on the write surface",
    () => {
      withConfiguredProject(GUARD_OFF, ({ root }) => {
        expect(runWrite(root, "agents/coder.md").decision).toBe("block");
        expect(runWrite(root, "hooks/config.json").decision).toBe("block");
        expect(runWrite(root, "fusion-guard.json").decision).toBe("block");
      });
    },
    CASE_TIMEOUT,
  );


  it(
    "ignores it against an ALREADY ACTIVE halt",
    () => {
      // The accurate statement of the old residual was narrow: an agent that
      // wrote the off-switch BEFORE it earned a halt was immune to halts from
      // then on, and the write cost it one allowed tool call in any project
      // whose `fusion-guard.json` did not yet exist.
      withProject(
        ({ root }) => {
          expect(runWrite(root, "agents/coder.md").decision).toBe("block");
          expect(runWrite(root, "notes.txt").reason).toContain("[HALTED]");
        },
        {
          files: { "fusion-guard.json": projectConfig(GUARD_OFF) },
          escalation: { haltActive: true, consecutiveBlocks: 3 },
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "reports the ignored key, once, naming it — decision 260804-1631",
    () => {
      // Not optional, and not cosmetic. The record calls the diagnostic the only
      // thing standing between this answer and a silently inert key: a project
      // owner who writes `"enabled": false`, sees nothing change and hears
      // nothing concludes the file is not being read at all.
      withConfiguredProject(GUARD_OFF, ({ root }) => {
        expect(runWrite(root, "notes.txt").decision).toBeUndefined();

        const advisories = readEvents(root).filter(
          (e) => e.event === "guard_advisory",
        );
        expect(advisories).toHaveLength(1);
        expect(advisories[0]?.detail).toContain("guard.enabled");
        expect(advisories[0]?.detail).toContain("cannot be set by a project");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "STATED COST: that advisory repeats on every guarded call until the line is removed",
    () => {
      // The surviving failure mode, pinned rather than discovered. `diagnostics`
      // emits one `guard_advisory` per entry per guarded tool call, so a project
      // that leaves the key in its file meets this on every call. An advisory
      // that repeats forever trains its reader to dismiss advisories.
      withConfiguredProject(GUARD_OFF, ({ root }) => {
        runWrite(root, "notes.txt");
        runBash(root, "ls -la");
        runWrite(root, "notes.txt");

        expect(
          readEvents(root).filter((e) => e.event === "guard_advisory"),
        ).toHaveLength(3);
      });
    },
    CASE_TIMEOUT,
  );

  // -------------------------------------------------------------------------
  // Issue 260804-1603 — a wrong-typed value.
  //
  // Two failures in one table. The first three rows crashed the guard and it
  // ALLOWED, on every tool call, for as long as the file stayed that way. The
  // fourth never crashed: `"rules/**"` spread into eight single characters, the
  // effective list matched nothing, and the guard emitted `guard_allow`. That
  // is the most likely typo of the four and the one with no signal at all.
  // -------------------------------------------------------------------------

  const wrongTypes: [string, object][] = [
    ["a number", { guard: { protectedPaths: 123 } }],
    ["an object", { guard: { protectedPaths: { a: "rules/**" } } }],
    ["an array of numbers", { guard: { protectedPaths: [42] } }],
    ["a bare string", { guard: { protectedPaths: "rules/**" } }],
  ];

  for (const [label, config] of wrongTypes) {
    it(
      `drops protectedPaths given ${label}, inherits, and says which key`,
      () => {
        withConfiguredProject(config, ({ root }) => {
          expect(runWrite(root, "agents/coder.md").decision).toBe("block");
          expect(runWrite(root, "rules/x.md").decision).toBe("block");
          expect(runWrite(root, "fusion-guard.json").decision).toBe("block");

          const advisories = readEvents(root).filter(
            (e) => e.event === "guard_advisory",
          );
          expect(advisories.length).toBeGreaterThan(0);
          expect(advisories[0]?.detail).toContain("guard.protectedPaths");
          // No `guard_error`: the crash rows are dropped before anything
          // spreads or folds them. The harness would have thrown anyway.
          expect(readEvents(root).some((e) => e.event === "guard_error")).toBe(
            false,
          );
        });
      },
      CASE_TIMEOUT,
    );
  }

  // -------------------------------------------------------------------------
  // Issue 260804-1606 — `blocksBeforeHalt: 0`.
  // -------------------------------------------------------------------------

  it(
    "drops blocksBeforeHalt: 0 and halts on the plugin's third block instead of the first",
    () => {
      withConfiguredProject({ escalation: { blocksBeforeHalt: 0 } }, ({ root }) => {
        expect(runWrite(root, "rules/x.md").decision).toBe("block");

        // Before: one block halted the session, and the halt message said
        // "after repeated violations" when there had been one.
        const afterOne = readEscalation(root);
        expect(afterOne?.consecutiveBlocks).toBe(1);
        expect(afterOne?.haltActive).toBe(false);

        expect(runWrite(root, "agents/coder.md").decision).toBe("block");
        expect(readEscalation(root)?.haltActive).toBe(false);
        expect(runWrite(root, ".claude/rules/local.md").decision).toBe("block");
        expect(readEscalation(root)?.haltActive).toBe(true);

        const advisories = readEvents(root).filter(
          (e) => e.event === "guard_advisory",
        );
        expect(advisories[0]?.detail).toContain("escalation.blocksBeforeHalt");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "leaves a project's own VALID threshold alone",
    () => {
      // The bound on the case above: validation drops what it cannot use and
      // nothing else. A project that means 2 gets 2.
      withConfiguredProject({ escalation: { blocksBeforeHalt: 2 } }, ({ root }) => {
        expect(runWrite(root, "rules/x.md").decision).toBe("block");
        expect(runWrite(root, "agents/coder.md").decision).toBe("block");

        expect(readEscalation(root)?.haltActive).toBe(true);
        expect(
          readEvents(root).some((e) => e.event === "guard_advisory"),
        ).toBe(false);
      });
    },
    CASE_TIMEOUT,
  );
});

describe("the project configuration in the plugin's own repo", () => {
  it(
    "does not protect its own fusion-guard.json there — the write guard stands down",
    () => {
      // Criterion 12 asks for identical behaviour in both places OR a stated
      // difference. This is the difference, and it is the pre-existing one:
      // the whole write guard stands down in the plugin's source tree, so the
      // floor stands down with it. Asserted from both sides in one case so the
      // boundary is visible rather than inferred — the SAME configuration
      // blocks in a consuming project and allows here.
      const cfg = { escalation: { blocksBeforeHalt: 3 } };

      withProject(
        ({ root }) => expect(runWrite(root, "fusion-guard.json").decision).toBe("block"),
        { files: { "fusion-guard.json": projectConfig(cfg) } },
      );
      withPluginProject(
        ({ root }) =>
          expect(runWrite(root, "fusion-guard.json").decision).toBeUndefined(),
        { files: { "fusion-guard.json": projectConfig(cfg) } },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "still REPORTS a broken configuration there, because the load is not stood down",
    () => {
      // The config load sits above the self-detect gate, and deliberately: a
      // project that cannot be told its guard configuration is broken has no
      // way to find out, and silence here is exactly the fallback the spec
      // rejects. That the write guard then stands down does not make the load
      // pointless — it makes the diagnostic the only thing the load still owes
      // the user in this one repository.
      withPluginProject(
        ({ root }) => {
          expect(runWrite(root, "rules/x.md").decision).toBeUndefined();

          const advisories = readEvents(root).filter(
            (e) => e.event === "guard_advisory",
          );
          expect(advisories).toHaveLength(1);
          expect(advisories[0]?.detail).toContain("fusion-guard.json");
        },
        { files: { "fusion-guard.json": projectConfig("not json at all") } },
      );
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// A project's own declared entry outranks FUSION_ALLOW_RULES_WRITE.
//
// Decision `260803-1314`, answered option 2 at the plan gate on 2026-08-04;
// plan Step 4. The block this replaces was labelled `MEASURES:` and pinned the
// opposite behaviour on purpose, citing the record and disclaiming endorsement,
// so that it would fail the day the decision landed. It did.
//
// Every row here is a real guard subprocess against a throwaway project root.
// The unit matrices in `rules-write-exemption.test.ts` cover the predicate; what
// these cases add is that the predicate's answer reaches a verdict.
//
// They used to add it on both surfaces. The shell half is not lost, it moved:
// `isObservedRulePath` asks the same module the same question of a path the
// measurement saw change, and its cases live in
// `protected-snapshot-integration.test.ts`.
// ---------------------------------------------------------------------------

describe("a project's own protected entry outranks the rules-write flag", () => {
  /** The record's own example: one immutable subtree inside `rules/`. */
  const IMMUTABLE = { guard: { protectedPaths: ["rules/immutable/**"] } };

  const withImmutable = <T,>(fn: (p: { root: string }) => T): T =>
    withProject(fn, {
      files: {
        "fusion-guard.json": projectConfig(IMMUTABLE),
        "rules/immutable/x.md": "# a rule the project froze\n",
      },
    });

  it(
    "denies the write the flag used to allow, on the write-tool path",
    () => {
      withImmutable(({ root }) => {
        // Protected either way…
        expect(runWrite(root, "rules/immutable/x.md").decision).toBe("block");
        // …and the flag no longer lifts it. This is the row that flipped.
        const res = runWrite(root, "rules/immutable/x.md", "Edit", FLAG_SET);
        expect(res.decision).toBe("block");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "denies it through every write tool, in every shape a curator would reach for",
    () => {
      // The shell shapes (`rm`, `mv`, `rm -rf` on the directory,
      // `echo x >`) were asserted here against the mutation classifier and have
      // no PreToolUse verdict left. The subtraction reaches the shell through
      // the measurement, which asks the same module the same question about a
      // path that has actually changed (`isObservedRulePath`).
      withImmutable(({ root }) => {
        for (const tool of ["Write", "Edit", "MultiEdit", "NotebookEdit"]) {
          expect(
            runWrite(root, "rules/immutable/x.md", tool, FLAG_SET).decision,
            tool,
          ).toBe("block");
        }
        // The directory itself, which is the case the trailing-separator retry
        // in `projectProtectedMatch` exists for.
        expect(
          runWrite(root, "rules/immutable/", "Edit", FLAG_SET).decision,
        ).toBe("block");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "names the project's own entry in the deny, so it does not read as a broken flag",
    () => {
      // The obligation the decision record states in its own words: a curator
      // meeting this deny needs a reason naming the project's own entry.
      withImmutable(({ root }) => {
        const res = runWrite(root, "rules/immutable/x.md", "Edit", FLAG_SET);

        expect(res.reason).toContain("Protected path");
        expect(res.reason).toContain("FUSION_ALLOW_RULES_WRITE");
        expect(res.reason).toContain("rules/immutable/**");
        expect(res.reason).toContain("fusion-guard.json");
        // And it does not read as "spell it differently".
        expect(res.reason).toContain("ask the user");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "leaves the flag's headline use working in the same project",
    () => {
      // "The two default rule patterns keep working exactly as they do now" —
      // the record's own sentence. A project that carves out a subtree keeps
      // the flag for everything else, or option 2 is option 3 by accident.
      //
      // NOTE the project declared ONLY `rules/immutable/**`, so `rules/x.md` is
      // not protected at all here and the exemption is never consulted about it.
      // The row that proves the grant still works is the one where the plugin's
      // `rules/**` is also in force — the next case.
      withImmutable(({ root }) => {
        expect(
          runWrite(root, "rules/retired/x.md", "Edit", FLAG_SET).decision,
        ).toBeUndefined();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "STATED COST: a project that copies rules/** into its own file loses the flag",
    () => {
      // The sharp edge of the rule, and the shape a project would plausibly
      // write: fusion's own list, plus one entry of its own. There is no
      // exception for a declared entry that happens to equal one of fusion's, so
      // the whole rule directory stops being exempt — including
      // `rules/retired/`, which is where the flag's headline use writes.
      //
      // It follows from the decision rather than being a surprise on top of it:
      // the flag reaches a path only while the list protecting that path is
      // fusion's. Step 7 owes this a sentence, or a project meets a deny it
      // reads as the flag being broken.
      withProject(
        ({ root }) => {
          expect(runWrite(root, "rules/x.md", "Edit", FLAG_SET).decision).toBe(
            "block",
          );
          // Including `rules/retired/`, which is where the flag's headline use
          // writes.
          expect(
            runWrite(root, "rules/retired/x.md", "Edit", FLAG_SET).decision,
          ).toBe("block");
          expect(
            runWrite(root, "rules/immutable/x.md", "Edit", FLAG_SET).decision,
          ).toBe("block");
          // `agents/**` is on the same declared list and was never exempt, so
          // nothing about it changed.
          expect(runWrite(root, "agents/coder.md").decision).toBe("block");
        },
        {
          files: {
            "fusion-guard.json": projectConfig({
              guard: {
                protectedPaths: ["agents/**", "rules/**", "rules/immutable/**"],
              },
            }),
            "rules/immutable/x.md": "# frozen\n",
          },
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "HALF 2: a project that declares NOTHING gets the exemption unchanged",
    () => {
      // The trap, measured rather than reasoned about. This project's effective
      // `protectedPaths` is the plugin's own list, `rules/**` among them,
      // inherited because the file omits the key. If the subtraction ever read
      // the effective list instead of the declared one, every row here flips to
      // `block` and the flag is dead in every project on earth.
      withConfiguredProject({ escalation: { blocksBeforeHalt: 3 } }, ({ root }) => {
        expect(runWrite(root, "rules/x.md").decision).toBe("block");
        expect(
          runWrite(root, "rules/x.md", "Edit", FLAG_SET).decision,
        ).toBeUndefined();
        expect(
          runWrite(root, "rules/retired/x.md", "Edit", FLAG_SET).decision,
        ).toBeUndefined();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "HALF 2 again, for a project with no fusion-guard.json at all",
    () => {
      // The state of every project on this plugin today.
      withProject(({ root }) => {
        expect(runWrite(root, "rules/x.md").decision).toBe("block");
        expect(
          runWrite(root, "rules/x.md", "Edit", FLAG_SET).decision,
        ).toBeUndefined();
        expect(
          runWrite(root, "rules/retired/x.md", "Edit", FLAG_SET).decision,
        ).toBeUndefined();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "HALF 2 for a project that declared some OTHER key",
    () => {
      // The commonest real `fusion-guard.json`: it configures a threshold and
      // says nothing about paths. Provenance read as "did the project supply a
      // guard object" rather than "did it supply this leaf" would kill the flag
      // here, and nothing else in the suite would say so.
      withConfiguredProject(
        { guard: { defaultSensitivity: "high" } },
        ({ root }) => {
          expect(
            runWrite(root, "rules/x.md", "Edit", FLAG_SET).decision,
          ).toBeUndefined();
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "a declared entry outside the rule directories changes nothing about the flag",
    () => {
      withProject(
        ({ root }) => {
          expect(runWrite(root, "secret/a").decision).toBe("block");
          // `rules/**` is not on this project's list at all, so nothing under
          // `rules/` is protected and the exemption is never asked.
          expect(runWrite(root, "rules/x.md").decision).toBeUndefined();
        },
        {
          files: {
            "fusion-guard.json": projectConfig({
              guard: { protectedPaths: ["secret/**"] },
            }),
            "secret/a": "a secret\n",
          },
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "does not lift a HALT, any more than the flag itself does",
    () => {
      // Gate 1b narrows a grant; it cannot widen one. CHECK 1 is still above
      // CHECK 2 on the write path.
      withProject(
        ({ root }) => {
          expect(
            runWrite(root, "rules/immutable/x.md", "Edit", FLAG_SET).decision,
          ).toBe("block");
          expect(
            runWrite(root, "rules/immutable/x.md", "Edit", FLAG_SET).reason,
          ).toContain("[HALTED]");
        },
        {
          files: {
            "fusion-guard.json": projectConfig(IMMUTABLE),
            "rules/immutable/x.md": "# frozen\n",
          },
          escalation: { haltActive: true, consecutiveBlocks: 3 },
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "does not change what a project WITHOUT the flag set sees",
    () => {
      // The deny is the same deny it has always been when the flag is unset:
      // no exemption note, because there is no grant to explain.
      withImmutable(({ root }) => {
        const res = runWrite(root, "rules/immutable/x.md");
        expect(res.decision).toBe("block");
        expect(res.reason).not.toContain("FUSION_ALLOW_RULES_WRITE");
      });
    },
    CASE_TIMEOUT,
  );
});
