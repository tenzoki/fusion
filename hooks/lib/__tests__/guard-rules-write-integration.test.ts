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

        // The two branch variables keep the protection they already had.
        expect(childEnv()).not.toHaveProperty("FUSION_ALLOW_BRANCH_SWITCH");
        expect(childEnv()).not.toHaveProperty("FUSION_ALLOW_WORKTREE");

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
    "still blocks skills/** with the flag set",
    () => {
      withProject(({ root }) => {
        const res = runWrite(
          root,
          resolve(root, "skills/demo/SKILL.md"),
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
// The exemption on the Bash path — plan step 4.
//
// This is the step that makes the flag a control rather than a decoration. The
// write tools are the polite route to a rule file; `mv`, `rm`, `sed -i` and `>`
// reach the same file, and the predecessor Circle closed that route. A flag
// lifting only CHECK 2 would leave the door it guards standing open.
//
// The cases run against the same throwaway project root, so the mutation check
// actually runs (it stands down in a plugin root, exactly as the write tools
// do). Operands are RELATIVE here, unlike the write-tool cases above: a shell
// command names paths relative to the working directory, which is the project
// root, and `normalizeToRelative` leaves them untouched.
// ---------------------------------------------------------------------------

describe("FUSION_ALLOW_RULES_WRITE on the Bash path", () => {
  it(
    "blocks a shell move of a rule file into retired/ when the flag is unset",
    () => {
      // The control for the case below, and the deferred criterion's own
      // unset half (spec 260801-1122, line 316).
      withProject(({ root }) => {
        const res = runBash(root, "mv rules/x.md rules/retired/");

        expect(res.decision).toBe("block");
        expect(res.reason).toContain("rules/x.md");

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

  it(
    "allows the same move with the flag set, and records exactly one advisory",
    () => {
      // The deferred criterion's set half. Both operands are protected rule
      // paths and both are exempted, so the note names both — the source that
      // was removed and the directory it landed in.
      withProject(({ root }) => {
        const res = runBash(root, "mv rules/x.md rules/retired/", FLAG_SET);

        expect(res.decision).toBeUndefined();

        // EXACTLY ONE event, unlike the write-tool path: the Bash allow path
        // emits no guard_allow (260707-0751), so the advisory is the only line.
        const events = readEvents(root);
        expect(events.map((e) => e.event)).toEqual(["guard_advisory"]);
        expect(events[0]?.tool).toBe("Bash");
        expect(events[0]?.detail).toContain("FUSION_ALLOW_RULES_WRITE");
        expect(events[0]?.detail).toContain("rules/x.md");
        expect(events[0]?.detail).toContain("rules/retired/");
        // Two paths, so no single one is claimed in the file field.
        expect(events[0]?.file).toBeUndefined();

        const state = readEscalation(root);
        expect(state?.recentEvents).toHaveLength(1);
        expect(state?.recentEvents[0]?.level).toBe("clear");
        expect(state?.recentEvents[0]?.trigger).toBe("rules_write_exemption");
        expect(state?.recentEvents[0]?.message).toContain(
          "FUSION_ALLOW_RULES_WRITE",
        );
        expect(state?.recentEvents[0]?.toolName).toBe("Bash");
        expect(state?.recentEvents[0]?.filePath).toBeUndefined();
        // An exemption is not a block: the counter that drives the halt is
        // untouched, and no halt is entered.
        expect(state?.consecutiveBlocks).toBe(0);
        expect(state?.haltActive).toBe(false);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "still denies `rm -rf rules` with the flag set, in either spelling",
    () => {
      // The boundary Step 2 drew, and the asymmetry that enforces it. The
      // protected check RETRIES a directory operand with a trailing separator
      // (isProtected, bash-mutation-guard.ts:902), so `rules` matches
      // `rules/**` as `rules/` and denies in pass 1 — not, as the plan's line
      // 222 says, through the ancestor pass. The exemption predicate does the
      // opposite: it canonicalises the separator AWAY before matching, so
      // neither spelling is a rule FILE and neither is exempt. The flag permits
      // writing rule files; it does not permit destroying the rule directory.
      withProject(({ root }) => {
        const bare = runBash(root, "rm -rf rules", FLAG_SET);
        expect(bare.decision).toBe("block");
        expect(bare.reason).toContain("writes a protected path");
        expect(bare.reason).toContain("`rules`");

        const slash = runBash(root, "rm -rf rules/", FLAG_SET);
        expect(slash.decision).toBe("block");

        const state = readEscalation(root);
        expect(state?.consecutiveBlocks).toBe(2);
        expect(
          (state?.recentEvents ?? []).some(
            (e) => e.trigger === "rules_write_exemption",
          ),
        ).toBe(false);
        expect(readEvents(root).map((e) => e.event)).toEqual([
          "guard_block",
          "guard_block",
        ]);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "still denies a shell move of an agent file with the flag set",
    () => {
      withProject(({ root }) => {
        const res = runBash(root, "mv agents/coder.md /tmp/", FLAG_SET);

        expect(res.decision).toBe("block");
        expect(res.reason).toContain("agents/coder.md");

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

  it(
    "exempts a redirection into a rule file, and names it in the file field",
    () => {
      // Redirection is the third route to the same file, and it reaches the
      // classifier through a different collector than a verb's operands. One
      // exempted path this time, so the event carries it.
      withProject(({ root }) => {
        expect(runBash(root, "printf '' > rules/new.md").decision).toBe("block");

        const res = runBash(root, "printf '' > rules/new.md", FLAG_SET);
        expect(res.decision).toBeUndefined();

        const events = readEvents(root);
        expect(events.map((e) => e.event)).toEqual([
          "guard_block",
          "guard_advisory",
        ]);
        expect(events[1]?.file).toBe("rules/new.md");
        expect(events[1]?.detail).toContain("rules/new.md");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "allows a redirection into .claude/rules/, but NOT because of the flag",
    () => {
      // The plan names `printf '' > .claude/rules/local.md` as a flag-set allow
      // case. It does allow — and it allows with the flag UNSET too, because
      // `.claude/rules/**` is not on the shipped protectedPaths at all
      // (shared/issues/260801-1020_o_guard-protects-rules-but-not-claude-rules).
      // The exemption is only ever consulted for a path the protected list
      // already matched, so nothing is exempted and no advisory is written.
      // Asserted at the truth rather than at the plan's expectation, so this
      // case flips visibly when that issue closes.
      withProject(({ root }) => {
        expect(runBash(root, "printf '' > .claude/rules/local.md").decision)
          .toBeUndefined();
        expect(readEvents(root)).toEqual([]);

        const res = runBash(
          root,
          "printf '' > .claude/rules/local.md",
          FLAG_SET,
        );
        expect(res.decision).toBeUndefined();
        expect(readEvents(root)).toEqual([]);
        expect(readEscalation(root)).toBeNull();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "writes no note when the call denies, even though a path was exempted",
    () => {
      // The move is exempt; the delete is not. The whole call is blocked, so
      // NOTHING was let through and an advisory would claim a write that never
      // happened — the same reasoning that puts the git override note after the
      // mutation check rather than before it.
      withProject(({ root }) => {
        const res = runBash(
          root,
          "mv rules/x.md rules/retired/ && rm agents/coder.md",
          FLAG_SET,
        );

        expect(res.decision).toBe("block");
        expect(res.reason).toContain("agents/coder.md");
        expect(readEvents(root).map((e) => e.event)).toEqual(["guard_block"]);
        expect(readEscalation(root)?.recentEvents.map((e) => e.trigger)).toEqual(
          ["protected_path"],
        );
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "records both notes when one call uses both permissions",
    () => {
      // The reason the exemption note sits immediately before STEP 3 rather
      // than inside it: each note loads, pushes and saves, so the second load
      // reads what the first wrote and neither is lost.
      withProject(({ root }) => {
        const res = runBash(
          root,
          "git switch main && mv rules/x.md rules/retired/",
          { ...FLAG_SET, FUSION_ALLOW_BRANCH_SWITCH: "1" },
        );

        expect(res.decision).toBeUndefined();

        expect(readEvents(root).map((e) => e.event)).toEqual([
          "guard_advisory",
          "guard_advisory",
        ]);
        expect(readEscalation(root)?.recentEvents.map((e) => e.trigger)).toEqual(
          ["rules_write_exemption", "git_branch_switch_override"],
        );
      });
    },
    CASE_TIMEOUT,
  );

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

  it(
    "does not lift the branch policy, which the flag says nothing about",
    () => {
      // Each variable grants exactly one permission. This one is about writing
      // rule files.
      withProject(({ root }) => {
        const res = runBash(root, "git switch main", FLAG_SET);

        expect(res.decision).toBe("block");
        expect(res.reason).toContain("never switch git branches");
        expect(readEscalation(root)?.recentEvents.map((e) => e.trigger)).toEqual(
          ["git_branch_switch"],
        );
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
const bashCall = (root: string, command: string) => runBash(root, command, FLAG_SET);
const bashCallNoFlag = (root: string, command: string) => runBash(root, command);

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
    ["a skill body", "rules/up/skills/demo/SKILL.md"],
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
    ["a skill body, through the link and back up", "rules/up/../skills/demo/SKILL.md"],
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
    "denies the same paths through the shell, on the same reasoning",
    () => {
      denyEach(
        [
          "rm rules/up/hooks/config.json",
          "cp /dev/null rules/up/agents/coder.md",
          "rm rules/gs/escalation.json",
          "sed -i '' 's/a/b/' rules/copy",
          "echo x > rules/copy",
          "truncate -s 0 rules/up/settings.json",
          "rm -rf rules/up/agents",
          // The `..` spellings of the same links. `resolveTarget` runs
          // `path.normalize` on every operand, so the escape reached the
          // exemption predicate already collapsed here too — this surface was
          // not a second bug, it was the same one arriving by a second road.
          "rm rules/up/../hooks/config.json",
          "cp /dev/null rules/up/../agents/coder.md",
          "rm rules/gs/../.guard-state/escalation.json",
          "echo x > rules/up/../agents/coder.md",
          "truncate -s 0 rules/up/../settings.json",
          "rm -rf rules/up/../agents",
          "sed -i '' 's/a/b/' rules/up/../bin/monitor",
          // Through the tracked virtual `cd`, so the escape cannot be smuggled
          // in by moving the shell rather than the path.
          "cd rules && rm up/../agents/coder.md",
          "cd rules/retired && rm ../../agents/coder.md",
        ],
        bashCall,
        { setup: plantAliases },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "leaves the halt standing, because the record is no longer reachable",
    () => {
      // The Directive's criterion, falsified in practice before this fix: two
      // allowed Bash calls removed `escalation.json`, after which
      // `loadEscalation()` returned the empty state and `haltActive` was false.
      //
      // In a HALTED project the block may come from either gate, and that is
      // the claim here — nothing got through and the halt is intact. That the
      // path itself is closed is proved separately, on an unhalted project, by
      // the `rules/gs/escalation.json` row of the table above.
      withProject(
        ({ root }) => {
          plantAliases(root);
          expect(runBash(root, "rm rules/gs/escalation.json", FLAG_SET).decision).toBe(
            "block",
          );
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
    "refuses to CREATE an alias inside the rule directory",
    () => {
      // The second layer. `ln` is the one verb whose purpose is a second name,
      // and the flag's permission is writing rule files. This closes the direct
      // spelling; it does not close the class, because `mv` can relocate an
      // existing link and must stay exemptible — which is why the traverse is
      // what the cases above pin.
      denyEach(
        [
          "ln -s ../ rules/up",
          "ln -s ../fusion-workbench/.guard-state rules/gs",
          "ln hooks/config.json rules/copy",
          "sudo ln -s / rules/root",
          "ln -sf /dev/null rules/x.md",
          "cd rules && ln -s ../ up",
        ],
        bashCall,
        { reasonContains: "rules/" },
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

      // The same set through the shell.
      denyEach(
        [
          "rm rules/a/../agents/coder.md",
          "rm rules/b/../agents/coder.md",
          "rm rules/abs/../agents/coder.md",
          "echo x > rules/new/../coder.md",
          "rm rules/loop/../x.md",
        ],
        bashCall,
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
      // the tool actually sends wide open. The Bash classifier has the same
      // shape: `opts.normalize` runs on an absolute operand before its own
      // `path.normalize` does.
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

      withProject(({ root }) => {
        plantAliases(root);
        const res = runBash(root, `rm ${root}/rules/up/../agents/coder.md`, FLAG_SET);
        expect(res.decision).toBe("block");
        expect(res.reason ?? "").not.toContain("[HALTED]");
      });

      // The control that keeps the case honest: an absolute spelling of a
      // genuine rule file still gets the grant, on both surfaces.
      withProject(({ root }) => {
        expect(
          runGuard(root, "Edit", { file_path: `${root}/rules/x.md` }, FLAG_SET)
            .decision,
        ).toBeUndefined();
        expect(runBash(root, `rm ${root}/rules/x.md`, FLAG_SET).decision)
          .toBeUndefined();
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
      denyEach(
        ["rm rules/retired/../x.md", "cd rules/retired && rm ../x.md"],
        bashCall,
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

        denyEach(
          [
            "rm rules/link/coder.md",
            "rm rules/link/../agents/coder.md",
            "echo x > rules/link/../settings.json",
          ],
          bashCall,
          { setup: plantVia(plant) },
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

      withProject(({ root }) => {
        plantAliases(root);
        const res = runBash(root, "echo x > rules/up/../agents/coder.md", FLAG_SET);
        expect(res.decision).toBe("block");
        expect(readEvents(root).map((e) => e.event)).toEqual(["guard_block"]);
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
        for (const command of [
          "mv rules/x.md rules/retired/",
          "rm rules/x.md",
          "echo hi > rules/new.md",
          "sed -i '' 's/a/b/' rules/x.md",
          "cp /tmp/a rules/x.md",
        ]) {
          expect(runBash(root, command, FLAG_SET).decision, command).toBeUndefined();
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
      denyEach(["ln -s ../ rules/up", "rm rules/x.md"], bashCallNoFlag, {
        setup: plantAliases,
      });
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
    "./skills/demo/SKILL.md",
    "./.claude-plugin/plugin.json",
    "./settings.json",
    "./bin/monitor",
    "./fusion-workbench/.guard-state/escalation.json",
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
      denyEach(["agents/", "rules/", "./rules/", "skills/", "rules//"], editCall, {
        reasonContains: "Protected path",
      });
    },
    CASE_TIMEOUT,
  );
});

// ---------------------------------------------------------------------------

describe("a halted guard blocks shell mutations too (finding 3)", () => {
  // `isHalted` used to be consulted on the write-tool path only, so a halted
  // guard blocked `Edit` and allowed every `mv`, `rm` and `sed -i`. The surface
  // where the halt was absent is the surface an agent that has already been
  // denied three times would actually use.
  //
  // Every case sets the flag, so each also proves the flag is not the way out.

  const mutations = [
    "rm notes.txt",
    "mv notes.txt /tmp/",
    "sed -i '' 's/a/b/' notes.txt",
    "echo hi > notes.txt",
    "cp /tmp/a /tmp/b",
    "rm /tmp/scratch",
    "git clean -fdx build",
    "rm rules/x.md",
    "mv rules/x.md rules/retired/",
    "ls && rm /tmp/x",
  ];

  it(
    "blocks every recognised mutation, protected or not, flag or not",
    () => {
      withProject(
        ({ root }) => {
          for (const command of mutations) {
            const res = runBash(root, command, FLAG_SET);
            expect(res.decision, command).toBe("block");
            expect(res.reason, command).toContain("[HALTED]");
          }
        },
        { escalation: { haltActive: true } },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "still lets the agent read, so it can find out why it is halted",
    () => {
      // Blocking ALL Bash under a halt would stop an agent reading the
      // clear-halt instruction it has just been given, which protects nothing
      // extra and costs the way out.
      withProject(
        ({ root }) => {
          for (const command of [
            "ls -la",
            "git status",
            "cat notes.txt",
            "grep -r x .",
            "git log",
            "cat fusion-workbench/.guard-state/escalation.json",
          ]) {
            expect(runBash(root, command, FLAG_SET).decision, command).toBeUndefined();
          }
        },
        { escalation: { haltActive: true } },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "allows the same mutations when the guard is NOT halted",
    () => {
      // The control that makes the case above mean something.
      withProject(({ root }) => {
        for (const command of ["rm notes.txt", "echo hi > notes.txt", "cp /tmp/a /tmp/b"]) {
          expect(runBash(root, command, FLAG_SET).decision, command).toBeUndefined();
        }
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "does not count the halt as a fresh violation",
    () => {
      // Mirrors the write-tool halt, which emits and blocks without calling
      // recordBlock. A halt that incremented its own counter would inflate the
      // record of what the agent actually did.
      withProject(
        ({ root }) => {
          runBash(root, "rm notes.txt", FLAG_SET);
          const state = readEscalation(root);
          expect(state?.haltActive).toBe(true);
          expect(state?.consecutiveBlocks).toBe(0);
          expect(readEvents(root).map((e) => e.event)).toEqual(["guard_halt"]);
        },
        { escalation: { haltActive: true, consecutiveBlocks: 0 } },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "writes no exemption advisory for a mutation it halted",
    () => {
      // The halt is above the exemption, so nothing was let through and
      // nothing claims to have been.
      withProject(
        ({ root }) => {
          runBash(root, "mv rules/x.md rules/retired/", FLAG_SET);
          expect(
            readEscalation(root)?.recentEvents.some(
              (e) => e.trigger === "rules_write_exemption",
            ),
          ).toBe(false);
          expect(readEvents(root).map((e) => e.event)).toEqual(["guard_halt"]);
        },
        { escalation: { haltActive: true } },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "leaves the git branch policy to name its own denials",
    () => {
      // The branch policy runs above the mutation check and is not a write
      // concern, so a halted guard still reports a branch switch as one.
      withProject(
        ({ root }) => {
          const res = runBash(root, "git switch main", FLAG_SET);
          expect(res.decision).toBe("block");
          expect(res.reason).toContain("never switch git branches");
        },
        { escalation: { haltActive: true } },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "stands down in the plugin's own repo, on BOTH surfaces together",
    () => {
      // The write-tool path returns on the self-detect check before it reaches
      // CHECK 1, so the write halt already stood down here. The Bash halt sits
      // inside the same gate, so the two stand down together rather than one
      // surface halting while the other does not.
      withPluginProject(
        ({ root }) => {
          expect(runGuard(root, "Edit", { file_path: "agents/coder.md" }).decision)
            .toBeUndefined();
          expect(runBash(root, "rm rules/x.md").decision).toBeUndefined();
          // And the branch policy, which never stood down, still does not.
          expect(runBash(root, "git switch main").decision).toBe("block");
        },
        { escalation: { haltActive: true } },
      );
    },
    CASE_TIMEOUT,
  );
});
