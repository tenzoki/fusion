/**
 * A project's `fusion.json` reaching the guard — end to end, through a real
 * subprocess.
 *
 * ## What this file is for
 *
 * The loader is the only thing the guard still consults, and its diagnostics are
 * the only thing the guard still has to say about a project's own configuration.
 * `config.test.ts` proves `loadConfig` returns the right object; this file proves
 * the hook turns each of its diagnostics into a `guard_advisory` a human can
 * actually see, on every guarded call, from a real process.
 *
 * Three groups, and each is a diagnostic scope:
 *
 *   - a configuration file that does not PARSE;
 *   - a retired top-level KEY inside the file that is read;
 *   - a retired FILE at the project root, which is not read at all.
 *
 * The third arrived on 2026-08-16 with the rename of `fusion-guard.json` to
 * `fusion.json`, and it is the loudest of the three by design: for a project
 * upgrading across that release the advisory IS the migration path
 * (decision `260816-1916`, option 1 — `/fusion:setup` deliberately makes no
 * offer).
 *
 * ## What left, and when
 *
 * Two groups went in step 9 of the observation-only plan, with their subjects.
 *
 * "What a project configuration can and cannot reach — measured" was seven cases
 * about `guard.enabled` and `escalation.blocksBeforeHalt`: whether a project
 * could switch the guard off, whether it could halt itself on the first block.
 * Both keys are retired, both mechanisms are gone, and the boundary they measured
 * has no two sides left — a project configuration reaches one integer now, and
 * `config.test.ts` measures what it does with it.
 *
 * "The project configuration in the plugin's own repo" asserted that the config
 * LOAD was not stood down where the verdict was. There is no stand-down and no
 * verdict, so the asymmetry it pinned has collapsed into the ordinary case that
 * every other case here already covers.
 *
 * ## Why every case is a subprocess against a throwaway root
 *
 * Not because of a stand-down — that went on 2026-08-16 — but because the loader
 * finds a project by walking up from the process's working directory. A
 * `fusion.json` placed in this repository and edited by hand would be read by
 * every case at once, and this repository's own configuration would be read by
 * every case that meant to have none.
 */

import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CASE_TIMEOUT,
  PROJECT_CONFIG,
  configFiles,
  guardStateWritten,
  readEvents,
  runBash,
  runWrite,
  withProject,
} from "./helpers/guard-harness.js";

/** The file the loader stopped reading on 2026-08-16, and still names. */
const RETIRED_CONFIG = "fusion-guard.json";

/** An ordinary write target, refused by nothing. */
const PAYLOAD = "notes.txt";

/** A project whose `fusion.json` holds `value` (object or raw text). */
const withConfiguredProject = <T,>(
  value: object | string,
  fn: (project: { root: string }) => T,
): T => withProject(fn, { files: configFiles(value) });

/** Every `guard_advisory` detail the hook wrote, in order. */
const advisories = (root: string): string[] =>
  readEvents(root)
    .filter((e) => e.event === "guard_advisory")
    .map((e) => e.detail ?? "");

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
          expect(readFileSync(resolve(root, PAYLOAD), "utf-8")).toBe("replaced\n");
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
            [PAYLOAD]: "replaced\n",
          },
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "writes the configuration file under the name the LOADER owns, parseable or deliberately not",
    () => {
      // `configFiles` keys on `PROJECT_CONFIG_FILENAME` imported from
      // `lib/config.ts`, so the harness cannot seed a name the loader has
      // retired. It did exactly that between the rename and step 9, and every
      // project in the suite silently gained an extra advisory per guarded call
      // (issue `260816-2122`). Asserted here rather than left to the import,
      // because the import is the fix and this is the check on it.
      expect(PROJECT_CONFIG).not.toBe(RETIRED_CONFIG);

      withConfiguredProject({ orchestrator: { maxTurns: 9 } }, ({ root }) => {
        const written = readFileSync(resolve(root, PROJECT_CONFIG), "utf-8");
        expect(JSON.parse(written)).toEqual({ orchestrator: { maxTurns: 9 } });
      });

      withConfiguredProject("{ not json", ({ root }) => {
        const written = readFileSync(resolve(root, PROJECT_CONFIG), "utf-8");
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
    "emits one advisory naming the file and the fault, and still allows",
    () => {
      // "Dropped" used to be asserted by its consequence at the verdict: the
      // governed write the project's own file would have refused went through,
      // because the file the decision was written in never parsed. There is no
      // verdict left to read that off, so what the case asserts is the two
      // things a project can still act on — WHICH file, and WHAT is wrong with
      // it — plus the fact that a diagnostic is not a decision.
      withConfiguredProject("{ this is not json ", ({ root }) => {
        expect(runWrite(root, resolve(root, PAYLOAD)).decision).toBeUndefined();

        const seen = advisories(root);
        expect(seen).toHaveLength(1);
        expect(seen[0]).toContain(PROJECT_CONFIG);
        expect(seen[0]).toContain("not valid JSON");
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
        expect(events[0]?.detail).toContain(PROJECT_CONFIG);
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
      withConfiguredProject({ orchestrator: { maxTurns: 9 } }, ({ root }) => {
        expect(runBash(root, "ls -la").decision).toBeUndefined();
        expect(guardStateWritten(root)).toBe(false);
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
        expect(guardStateWritten(root)).toBe(false);
      });
    },
    CASE_TIMEOUT,
  );
});

/* ------------------------------------------------------------------ *
 * A configuration that declares a retired key
 * ------------------------------------------------------------------ */

describe("a retired key reaches the user, on every guarded call", () => {
  it(
    "names the key and says what to do, without denying anything",
    () => {
      // What a project sees if it copies its old `fusion-guard.json` across
      // instead of starting from the seeded template: the file parses, every key
      // in it looks like a setting, and three of them mean nothing. This case
      // pins that the notice leaves the loader at all, as a `guard_advisory`
      // from a real subprocess, and that it is an advisory and not a verdict.
      //
      // `guard.protectedPaths` was the subject here until 2026-08-16; it sits
      // inside a retired CONTAINER now, so the container's own diagnostic names
      // it and the leaf-scoped table folded away.
      withConfiguredProject(
        { guard: { protectedPaths: ["agents/**"], enabled: false } },
        ({ root }) => {
          expect(runWrite(root, resolve(root, PAYLOAD)).decision).toBeUndefined();

          const seen = advisories(root);
          // ONE advisory for the container, not one per leaf inside it. A key
          // that no longer means anything has no leaves worth walking into.
          expect(seen).toHaveLength(1);
          expect(seen[0]).toContain('"guard"');
          expect(seen[0]).toContain("no longer exists");
          expect(seen[0]).toContain("Delete it");
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "names each retired container the file declares, and leaves the rest working",
    () => {
      // Three keys, three notices, and the one live leaf still resolved beside
      // them. A project reading "my configuration was dropped" would go and
      // rewrite settings that are being honoured.
      withConfiguredProject(
        {
          guard: { categoryPaths: {} },
          decisions: [{ id: "D-1", category: "api", statement: "…" }],
          escalation: { blocksBeforeHalt: 7 },
          orchestrator: { maxTurns: 9 },
        },
        ({ root }) => {
          expect(runWrite(root, resolve(root, PAYLOAD)).decision).toBeUndefined();

          const seen = advisories(root);
          expect(seen).toHaveLength(3);
          for (const key of ["guard", "decisions", "escalation"]) {
            expect(seen.some((d) => d.includes(`"${key}" no longer exists`))).toBe(
              true,
            );
          }
          for (const d of seen) {
            expect(d).toContain("the rest of this file is unaffected");
          }
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "repeats it on every guarded call, write tool and Bash alike",
    () => {
      // "Until the line comes out of the file" is the claim, and a diagnostic
      // that fired once per session would not carry it. Three guarded calls,
      // three advisories, one per call — Bash included, which is the same
      // deliberate departure from the zero-side-effect Bash path that an
      // unparseable file already makes.
      withConfiguredProject({ escalation: { blocksBeforeHalt: 3 } }, ({ root }) => {
        expect(runWrite(root, resolve(root, PAYLOAD)).decision).toBeUndefined();
        expect(runBash(root, "ls -la").decision).toBeUndefined();
        expect(runWrite(root, resolve(root, PAYLOAD), "Write").decision).toBeUndefined();

        const seen = advisories(root);
        expect(seen).toHaveLength(3);
        for (const d of seen) {
          expect(d).toContain('"escalation" no longer exists');
        }
      });
    },
    CASE_TIMEOUT,
  );
});

/* ------------------------------------------------------------------ *
 * A retired FILE at the project root
 * ------------------------------------------------------------------ */

// ---------------------------------------------------------------------------
// The scope above the two groups above, added 2026-08-16 with the rename of
// `fusion-guard.json` to `fusion.json`.
//
// It is the loudest thing the loader does, and deliberately: this advisory is
// the WHOLE migration path a consuming project gets. `/fusion:setup` was the
// alternative and the user chose against it (decision `260816-1916`, option 1),
// on the ground that this channel runs on every guarded tool call while Setup
// runs once per session and only for a project that runs Setup at all.
//
// The failure it exists to prevent is silent and specific: a project that
// carried `{"orchestrator":{"maxTurns":12}}` in the old file and does nothing
// drops to fusion's built-in default without a word. So the text has to name the
// key, name the destination and say to copy before deleting — which is what the
// first case asserts, phrase by phrase, rather than by substring on the filename.
// ---------------------------------------------------------------------------

describe("a retired FILE is named, with the migration it needs", () => {
  it(
    "names the file, the key to copy, the destination and the order",
    () => {
      withProject(
        ({ root }) => {
          expect(runWrite(root, resolve(root, PAYLOAD)).decision).toBeUndefined();

          const seen = advisories(root);
          expect(seen).toHaveLength(1);
          const [detail] = seen;

          // The file, by absolute path: a project may have several roots open.
          expect(detail).toContain(resolve(root, RETIRED_CONFIG));
          expect(detail).toContain("is no longer read");
          // The setting that survives the move, and where it goes. Without both
          // of these the advisory is a "this file moved" notice, and the budget
          // is lost silently — which is the one loss this whole channel exists
          // to prevent.
          expect(detail).toContain("orchestrator.maxTurns");
          expect(detail).toContain(PROJECT_CONFIG);
          // The ORDER. Deleting first loses the value the sentence just told
          // the reader to keep.
          expect(detail).toContain("first");
          expect(detail).toContain("Then delete this file");
        },
        { files: { [RETIRED_CONFIG]: '{"orchestrator": {"maxTurns": 12}}\n' } },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "says it even when the file is not valid JSON, because it is never read",
    () => {
      // `existsSync` is the whole check. The file is not parsed, and a loader
      // that parsed it in order to decide what to say about not reading it would
      // be the contradiction it is. So a project whose leftover file is broken
      // gets the same one notice as a project whose leftover file is perfect —
      // and exactly one, not one for the retired file plus one for a parse
      // failure it never attempted.
      withProject(
        ({ root }) => {
          expect(runWrite(root, resolve(root, PAYLOAD)).decision).toBeUndefined();

          const seen = advisories(root);
          expect(seen).toHaveLength(1);
          expect(seen[0]).toContain(RETIRED_CONFIG);
        },
        { files: { [RETIRED_CONFIG]: "{ not json at all" } },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "is reported ahead of a complaint about the file that IS read",
    () => {
      // Ordering, asserted rather than assumed. A file that is not read AT ALL
      // is the most upstream thing a reader can be wrong about; a dropped key
      // inside the file that is read is a finer complaint and reads after it. A
      // project meeting both at once is exactly the project mid-migration.
      withProject(
        ({ root }) => {
          expect(runWrite(root, resolve(root, PAYLOAD)).decision).toBeUndefined();

          const seen = advisories(root);
          expect(seen).toHaveLength(2);
          expect(seen[0]).toContain(RETIRED_CONFIG);
          expect(seen[1]).toContain("orchestrator.maxTurns");
          expect(seen[1]).toContain("a whole number of 1 or more");
        },
        {
          files: {
            [RETIRED_CONFIG]: '{"orchestrator": {"maxTurns": 12}}\n',
            ...configFiles({ orchestrator: { maxTurns: 0 } }),
          },
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "says nothing to a project that never had one",
    () => {
      // The ordinary project, which is every project fusion sets up from here
      // on. An advisory here would reach all of them, forever.
      withConfiguredProject({ orchestrator: { maxTurns: 9 } }, ({ root }) => {
        expect(runWrite(root, resolve(root, PAYLOAD)).decision).toBeUndefined();
        expect(advisories(root)).toEqual([]);
      });
    },
    CASE_TIMEOUT,
  );
});
