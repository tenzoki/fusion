/**
 * A project's `fusion-guard.json` reaching the guard — end to end, through a
 * real subprocess.
 *
 * ## Why this file exists separately
 *
 * It was carved out of `guard-rules-write-integration.test.ts`, whose subject
 * was the `FUSION_ALLOW_RULES_WRITE` exemption and the protected list it
 * softened. Four of that file's thirteen describes were about something else
 * that happens to live next door: whether the PROJECT LAYER of the
 * configuration is read at all, what it can and cannot reach once it is, and
 * what a broken one is told. The loader that answers those questions is staying;
 * the mechanism the rest of that file was about is not, so the two were
 * separated before the deletion rather than during it.
 *
 * ## What came, and what did not
 *
 * The cases here are the ones whose subject SURVIVES the removal of the
 * protected-path half. A case whose subject was the protected list itself — the
 * self-protection floor, a project narrowing or emptying the list, a wrong-typed
 * `protectedPaths` inherited past — had nothing to re-point and stayed behind to
 * be deleted with the mechanism. Where a case needed A DENY only in order to
 * observe something else, the deny is now the decision-governed one (CHECK 3),
 * armed from the throwaway project's own configuration; see `GOVERNED_PATH` in
 * helpers/guard-harness.ts for why that is a drop-in and why it cannot be
 * confused with a protected-path deny.
 *
 * Two cases were dropped rather than moved because re-pointing them would have
 * produced a duplicate of coverage that already exists elsewhere: a halted guard
 * blocking a write (`guard-halt-event.test.ts`, `legacy-halt-clearing.test.ts`)
 * and the write guard standing down in the plugin's own repository
 * (`guard-bash-integration.test.ts`, "self-detect stand-down"). What remains of
 * the plugin-repo describe is the half nothing else asserts: the configuration
 * LOAD is not stood down there, only the verdict is.
 *
 * ## Why every case is a subprocess against a throwaway root
 *
 * The write guard stands down in this repository, so a `fusion-guard.json`
 * placed here and edited by hand would be honoured by nothing and would report a
 * pass for a check that never ran. A loader unit test cannot close that gap
 * either: `config.test.ts` proves the loader returns the right object, and this
 * file proves the guard acts on it. The first three cases assert the harness
 * capabilities the rest depend on, because a capability nobody checks fails
 * later as a case that looks broken for an unrelated reason.
 */

import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CASE_TIMEOUT,
  GOVERNED_CONFIG,
  GOVERNED_DIR,
  GOVERNED_PATH,
  governedFiles,
  projectConfig,
  readEscalation,
  readEvents,
  runBash,
  runWrite,
  withGovernedProject,
  withPluginProject,
  withProject,
} from "./helpers/guard-harness.js";

/** A project whose `fusion-guard.json` holds `value` (object or raw text). */
const withConfiguredProject = <T,>(
  value: object | string,
  fn: (project: { root: string }) => T,
): T =>
  withProject(fn, { files: { "fusion-guard.json": projectConfig(value) } });

/**
 * `GOVERNED_CONFIG` with `extra` merged over it, one level deep on `guard`.
 *
 * The cases that vary one configuration key still need CHECK 3 armed, or they
 * have no verdict to observe. Spelling the merge once keeps "the governed keys
 * are still there" from being a thing each case has to remember.
 */
function governedPlus(extra: {
  guard?: Record<string, unknown>;
  escalation?: Record<string, unknown>;
}): object {
  return {
    ...GOVERNED_CONFIG,
    ...extra,
    guard: { ...GOVERNED_CONFIG.guard, ...(extra.guard ?? {}) },
  };
}

/** Three siblings under the one governing glob, for the threshold cases. */
const GOVERNED_SIBLINGS = [
  GOVERNED_PATH,
  `${GOVERNED_DIR}/model.ts`,
  `${GOVERNED_DIR}/client.ts`,
];

/* ------------------------------------------------------------------ *
 * The harness capabilities everything below depends on
 * ------------------------------------------------------------------ */

describe("harness capabilities the project-configuration cases depend on", () => {
  it(
    "places a caller-supplied file in the project, over the seeded set",
    () => {
      // Two properties in one case, because they are the same mechanism seen
      // from both sides: `files` ADDS a path that is not in SEED_FILES, and it
      // REPLACES one that is. Without the second, a case could not vary the
      // content of a seeded file and would have to work around the seed.
      withProject(
        ({ root }) => {
          expect(readFileSync(resolve(root, "src/extra.ts"), "utf-8")).toBe(
            "// added by the case\n",
          );
          expect(readFileSync(resolve(root, "notes.txt"), "utf-8")).toBe(
            "replaced\n",
          );
          // And the rest of the seed is still there, so `files` is a merge and
          // not a substitution — every case below relies on that.
          expect(existsSync(resolve(root, "skills/demo/SKILL.md"))).toBe(true);
          expect(existsSync(resolve(root, "build/out.js"))).toBe(true);
          expect(existsSync(resolve(root, "fusion-workbench/.fusion-setup"))).toBe(
            true,
          );
        },
        {
          files: {
            "src/extra.ts": "// added by the case\n",
            "notes.txt": "replaced\n",
          },
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "pre-seeds a halt the guard actually reads",
    () => {
      // Reaching halt through three real denials works but couples the case to
      // `escalation.blocksBeforeHalt`; seeding the state asserts the halt
      // itself.
      //
      // The target is `notes.txt`, which nothing else in the guard refuses. A
      // block on it can only come from the halt check, so this case cannot pass
      // for another reason by accident.
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
      // `projectConfig` is what every case below feeds the `files` map. An
      // object becomes JSON; a string is written verbatim, which is the only
      // way to hand the loader a file that does not parse.
      withConfiguredProject(GOVERNED_CONFIG, ({ root }) => {
        const written = readFileSync(resolve(root, "fusion-guard.json"), "utf-8");
        expect(JSON.parse(written)).toEqual(GOVERNED_CONFIG);
      });

      withConfiguredProject("{ not json", ({ root }) => {
        const written = readFileSync(resolve(root, "fusion-guard.json"), "utf-8");
        expect(written).toBe("{ not json");
        expect(() => JSON.parse(written)).toThrow();
      });
    },
    CASE_TIMEOUT,
  );
});

/* ------------------------------------------------------------------ *
 * A configuration that does not parse
 * ------------------------------------------------------------------ */

describe("an unparseable project configuration is reported, not swallowed", () => {
  it(
    "emits one advisory and drops the project layer rather than failing open",
    () => {
      // "Dropped" is asserted by its consequence at the verdict: the governed
      // write this project's own file would have refused is allowed, because
      // the file the decision was written in never parsed. That is the whole of
      // "fell back to the plugin layer" for a project layer that declared
      // everything.
      withGovernedProject(
        ({ root }) => {
          expect(runWrite(root, GOVERNED_PATH).decision).toBeUndefined();

          const advisories = readEvents(root).filter(
            (e) => e.event === "guard_advisory",
          );
          expect(advisories).toHaveLength(1);
          expect(advisories[0]?.detail).toContain("fusion-guard.json");
          expect(advisories[0]?.detail).toContain("not valid JSON");

          // A diagnostic is not a violation: it records no block and moves no
          // counter of its own.
          const state = readEscalation(root);
          expect(state?.consecutiveBlocks).toBe(0);
          expect(
            (state?.recentEvents ?? []).filter((e) => e.level === "clear"),
          ).toHaveLength(0);
        },
        { files: { "fusion-guard.json": projectConfig("{ this is not json ") } },
      );
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
      withConfiguredProject(GOVERNED_CONFIG, ({ root }) => {
        expect(runBash(root, "ls -la").decision).toBeUndefined();
        expect(readEscalation(root)).toBeNull();
        expect(readEvents(root)).toEqual([]);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "leaves an innocuous Bash call in a NO-config project writing nothing",
    () => {
      // The state of every project on this plugin today. If the loader ever
      // emitted anything on a clean load, this is where it would show.
      withProject(({ root }) => {
        expect(runBash(root, "ls -la").decision).toBeUndefined();
        expect(readEscalation(root)).toBeNull();
        expect(readEvents(root)).toEqual([]);
      });
    },
    CASE_TIMEOUT,
  );
});

/* ------------------------------------------------------------------ *
 * The boundary of the project layer
 * ------------------------------------------------------------------ */

// ---------------------------------------------------------------------------
// Every row below is a verdict from a real guard subprocess against a throwaway
// project root. A loader that returns a good value proves nothing about what the
// guard does with it — that is the vacuity trap this whole file exists to close.
//
// One thing the harness asserts on this block's behalf: `runGuard` throws when
// the guard prints `[guard] Error:`, so a configuration that crashed the guard
// into its fail-open branch cannot pass here quietly. It would fail the case,
// not allow the write.
// ---------------------------------------------------------------------------

describe("what a project configuration can and cannot reach — measured", () => {
  // -------------------------------------------------------------------------
  // Issue 260804-1602 — `guard.enabled` from a project.
  //
  // The key sits above every check in guard.ts, so each surface it used to
  // disable gets its own assertion. Two git rows stood here until the branch
  // policy was deleted; what they guarded — that a project cannot switch off a
  // check by declaring a key — is unchanged and is asserted on the surfaces
  // that are left.
  // -------------------------------------------------------------------------

  const GUARD_OFF = governedPlus({ guard: { enabled: false } });

  it(
    "ignores guard.enabled: false and keeps denying on the write surface",
    () => {
      withConfiguredProject(GUARD_OFF, ({ root }) => {
        expect(runWrite(root, GOVERNED_PATH).decision).toBe("block");
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
  // Issue 260804-1606 — `blocksBeforeHalt: 0`.
  // -------------------------------------------------------------------------

  it(
    "drops blocksBeforeHalt: 0 and halts on the plugin's third block instead of the first",
    () => {
      withConfiguredProject(
        governedPlus({ escalation: { blocksBeforeHalt: 0 } }),
        ({ root }) => {
          expect(runWrite(root, GOVERNED_SIBLINGS[0]).decision).toBe("block");

          // Before: one block halted the session, and the halt message said
          // "after repeated violations" when there had been one.
          const afterOne = readEscalation(root);
          expect(afterOne?.consecutiveBlocks).toBe(1);
          expect(afterOne?.haltActive).toBe(false);

          expect(runWrite(root, GOVERNED_SIBLINGS[1]).decision).toBe("block");
          expect(readEscalation(root)?.haltActive).toBe(false);
          expect(runWrite(root, GOVERNED_SIBLINGS[2]).decision).toBe("block");
          expect(readEscalation(root)?.haltActive).toBe(true);

          const advisories = readEvents(root).filter(
            (e) => e.event === "guard_advisory",
          );
          expect(advisories[0]?.detail).toContain("escalation.blocksBeforeHalt");
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "leaves a project's own VALID threshold alone",
    () => {
      // The bound on the case above: validation drops what it cannot use and
      // nothing else. A project that means 2 gets 2.
      withConfiguredProject(
        governedPlus({ escalation: { blocksBeforeHalt: 2 } }),
        ({ root }) => {
          expect(runWrite(root, GOVERNED_SIBLINGS[0]).decision).toBe("block");
          expect(runWrite(root, GOVERNED_SIBLINGS[1]).decision).toBe("block");

          expect(readEscalation(root)?.haltActive).toBe(true);
          expect(
            readEvents(root).some((e) => e.event === "guard_advisory"),
          ).toBe(false);
        },
      );
    },
    CASE_TIMEOUT,
  );
});

/* ------------------------------------------------------------------ *
 * The plugin's own repository
 * ------------------------------------------------------------------ */

describe("the project configuration in the plugin's own repo", () => {
  it(
    "still REPORTS a broken configuration there, because the load is not stood down",
    () => {
      // The config load sits above the self-detect gate, and deliberately: a
      // project that cannot be told its guard configuration is broken has no
      // way to find out, and silence here is exactly the fallback the spec
      // rejects. That the write guard then stands down does not make the load
      // pointless — it makes the diagnostic the only thing the load still owes
      // the user in this one repository.
      //
      // The verdict half of the stand-down is not asserted here. It is the
      // subject of `guard-bash-integration.test.ts`, "self-detect stand-down",
      // which drives the same boundary from both sides.
      withPluginProject(
        ({ root }) => {
          expect(runWrite(root, GOVERNED_PATH).decision).toBeUndefined();

          const advisories = readEvents(root).filter(
            (e) => e.event === "guard_advisory",
          );
          expect(advisories).toHaveLength(1);
          expect(advisories[0]?.detail).toContain("fusion-guard.json");
        },
        {
          files: governedFiles({
            "fusion-guard.json": projectConfig("not json at all"),
          }),
        },
      );
    },
    CASE_TIMEOUT,
  );
});
