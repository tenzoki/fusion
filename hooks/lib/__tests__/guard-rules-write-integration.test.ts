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
