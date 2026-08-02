import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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
