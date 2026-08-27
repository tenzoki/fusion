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
 * Two groups, and each is a diagnostic scope:
 *
 *   - a configuration file that does not PARSE;
 *   - a retired top-level KEY inside the file that is read.
 *
 * A third scope, a retired FILE at the project root that is not read at all,
 * is a live diagnostic and the loudest of the three; it is asserted in
 * `config.test.ts`, and why its group is no longer duplicated here is below.
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
 * Two more went on 2026-08-26, to buy head room under the hook-test growth
 * bound. "A retired FILE is named, with the migration it needs" asserted the
 * migration advisory phrase by phrase, and `config.test.ts` holds every one of
 * those phrases, case for case, under the same describe title. The transport
 * claim that is this file's own — a loader diagnostic becomes a visible
 * `guard_advisory` from a real process — the two groups above still make twice.
 * "Harness capabilities the project-configuration cases depend on" asserted
 * `withProject`'s `files` merge and that the harness never seeds the retired
 * filename; add and merge hold by consequence, and the replace half is one
 * case in `guard-bash-integration.test.ts`. A dropped `files` option would leave
 * every case below with no configuration and an empty advisory list where each
 * asserts an exact one, and a seeded retired name would add one advisory to
 * every project in the suite, which `guard-bash-integration.test.ts` asserts
 * against with an exact single-element event list. The defect is
 * `circles/260816-1741-guard-becomes-observation-only/issues/260816-2122_*_step-9s-harness-reduction-deletes-four-fixtures-guard-bash-integration-still-imports.md`.
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
