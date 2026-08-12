/**
 * A shape-valid `churn.json` used to swallow the tracker's reply.
 * (`cross-file.json` carried the identical defect and the identical coverage
 * here until the ping-back tracker was removed with decision `260809-2004`.)
 *
 * ## The mechanism, in the order it runs
 *
 * `tracker.ts` produces its reply first and tracks churn afterwards. Both state
 * loads used to cast the parsed JSON with `as` inside a `try/catch` that handles
 * a MISSING file and UNPARSEABLE text — and nothing else. A file that parses to
 * a valid JSON value of the wrong shape (`{}` is enough) passed that catch and
 * threw on the next field access, inside the churn half. The throw reached the
 * top-level handler, which calls `respond()` with NO argument, so the reply went
 * out empty. Both state loads: `churn.json` is the one that survives.
 *
 * What that costs is precise. Whatever the measurements before it had to say
 * was lost — and every one of them is a sentence the model would otherwise have
 * acted on. The state file was never repaired either, because the save sits
 * after the throw, so every later tool call in that project repeated it (issue
 * `260809-1101`).
 *
 * ## Which reply the rows use as their probe, and why it changed
 *
 * The subject of this file is the CHURN LOAD, not whatever the reply happens to
 * say. Every row needs the tracker to have SOMETHING to report, so that "the
 * reply survived the churn half" is observable at all; which report it is was
 * never the subject.
 *
 * It used to be the protected-path halt sentence, because that was the reply
 * nearest to hand. The plan that removes the protected-path half therefore had
 * to re-point it, and named two candidates: session-state drift first, review
 * coverage as the fallback if drift proved awkward to trigger inside the
 * harness.
 *
 * **State drift was chosen — the plan's first choice — and it was not awkward.**
 * The reason is worth recording rather than re-derived: of the three surviving
 * tracker reports it is the only one that fires on EVERY guarded tool call.
 * Review coverage fires only when the tool's own payload is a `.md` file under a
 * `reviews/` store AND a session window exists to measure against; staging drift
 * fires only when HEAD moved since the previous call. Both would have coupled
 * these rows to a second trigger that has nothing to do with `churn.json`, and
 * the payload constraint in particular would have forced every case to write a
 * review file instead of the ordinary `notes.txt` edit the defect was measured
 * on. Drift needs no such coupling: it needs a git repository, a six-line
 * `agentstate.yaml` and three commits, after which every tool call in the
 * project reports the same divergence.
 *
 * The fixture itself is `freezeCommitCount` in helpers/guard-harness.ts, which
 * carries the rest of that reasoning and is shared with the one other suite
 * re-pointed the same way. It is deliberately MINIMAL rather than the full state
 * file the orchestrator writes: `measureStateDrift` reports each row it cannot
 * decide as `unchecked` and omits it from the sentence, so the two fields that
 * produce the `progress.commits` row are all either suite needs.
 *
 * ## Why every case here uses a write tool
 *
 * The churn half returns immediately for `Bash`, so a malformed state file is
 * never even read on that surface. The write tools are where the load happens
 * and therefore where the reply could be lost.
 *
 * ## What proves the fix rather than the absence of the bug
 *
 * `runTracker` throws when the tracker prints `[tracker] Error:`, which is the
 * fail-open path this defect took, so a regression fails here loudly. On top of
 * that each case asserts the sentence itself reached stdout, and the last case
 * asserts that a well-formed state file is still carried forward — a coercion
 * that emptied everything would satisfy all the malformed rows while silently
 * resetting a project's counters on load.
 */

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CASE_TIMEOUT,
  DRIFT_SENTENCE_MARKERS,
  freezeCommitCount,
  readEvents,
  runToolCall,
  withProject,
  type Project,
} from "./helpers/guard-harness.js";

const CHURN_FILE = "fusion-workbench/.guard-state/churn.json";

/** The file the tool call names. Unremarkable, and that is the point. */
const PAYLOAD = "notes.txt";

/** The context sentence the tracker handed back to the model, or "". */
function context(post: { hookSpecificOutput?: { additionalContext?: string } }): string {
  return post.hookSpecificOutput?.additionalContext ?? "";
}

/** Read back a state file as parsed JSON, or null when it is not there. */
function readState(root: string, rel: string): Record<string, unknown> | null {
  const abs = resolve(root, rel);
  if (!existsSync(abs)) return null;
  return JSON.parse(readFileSync(abs, "utf-8")) as Record<string, unknown>;
}

/* ------------------------------------------------------------------ *
 * The drift fixture
 * ------------------------------------------------------------------ */

/**
 * A project whose bookkeeping has drifted, with `churn.json` seeded verbatim.
 *
 * `git: true` is not optional here: the drift is measured against the git
 * history, which is one of the two records the check reads.
 */
function withDrift<T>(churn: string, fn: (project: Project) => T): T {
  return withProject(
    (project) => {
      freezeCommitCount(project.root);
      return fn(project);
    },
    { git: true, files: { [CHURN_FILE]: churn } },
  );
}

/** One ordinary Edit on `notes.txt`. Returns the tracker's reply. */
function ordinaryEdit(root: string): string {
  const { post } = runToolCall(
    root,
    "Edit",
    { file_path: resolve(root, PAYLOAD) },
    () => writeFileSync(resolve(root, PAYLOAD), "edited\n", "utf-8"),
  );
  return context(post);
}

/** Everything the lost sentence carried, asserted as one. */
function expectTheDriftSentence(text: string): void {
  for (const marker of DRIFT_SENTENCE_MARKERS) expect(text).toContain(marker);
}

const MALFORMED_ROWS: [string, string][] = [
  ["{} — the shape the issue was measured with", "{}"],
  ["a state object with no files map at all", '{"sessionStart":"2026-08-09T09:00:00.000Z"}'],
  ["files as an array rather than a map", '{"files":[]}'],
  ["null — valid JSON with no properties to read", "null"],
  ["truncated JSON — one of the two rows the old catch did handle", '{"files": {'],
  ["an empty file — the other row the old catch did handle", ""],
];

describe("a malformed churn.json no longer swallows the tracker's reply", () => {
  for (const [name, content] of MALFORMED_ROWS) {
    it(
      `reports the state drift with churn.json = ${name}`,
      () => {
        withDrift(content, ({ root }) => {
          expectTheDriftSentence(ordinaryEdit(root));
        });
      },
      CASE_TIMEOUT,
    );
  }
});

describe("the malformed file is repaired, not just survived", () => {
  it(
    "still reports the drift, and repairs the file instead of failing again",
    () => {
      withDrift("{}", ({ root }) => {
        expectTheDriftSentence(ordinaryEdit(root));

        // The second amplifier in the issue: nothing repaired the file,
        // because the save sits after the throw, so every later tool call in
        // the project took the same path until a human deleted it. It now
        // comes back as a state the next load can read.
        const churn = readState(root, CHURN_FILE);
        expect(churn?.files).toMatchObject({ [PAYLOAD]: expect.anything() });
        expect(typeof churn?.sessionStart).toBe("string");

        // And nothing took the fail-open path on the way. `runTracker` throws
        // on the stderr line; this asserts the event the handler emits, which
        // is what a reader of the log would have seen.
        expect(readEvents(root).map((e) => e.event)).not.toContain("guard_error");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "records the churn of an ordinary write with nothing to report",
    () => {
      // The same malformed file in a project with no drift, so the repair is
      // shown to be the load's doing and not something a report arranged.
      withProject(
        ({ root }) => {
          expect(ordinaryEdit(root)).toBe("");
          expect(readState(root, CHURN_FILE)?.files).toMatchObject({
            [PAYLOAD]: { totalChanges: 1 },
          });
        },
        { files: { [CHURN_FILE]: "{}" } },
      );
    },
    CASE_TIMEOUT,
  );
});

describe("a well-formed state file is carried forward, not emptied", () => {
  it(
    "keeps the churn counters a previous session accumulated",
    () => {
      withProject(
        ({ root }) => {
          ordinaryEdit(root);
          const files = readState(root, CHURN_FILE)?.files as Record<
            string,
            { totalChanges: number }
          >;
          expect(files[PAYLOAD].totalChanges).toBe(5);
        },
        {
          files: {
            [CHURN_FILE]: JSON.stringify({
              files: {
                [PAYLOAD]: {
                  totalChanges: 4,
                  changesThisSession: 4,
                  lastChange: "2026-08-09T10:00:00.000Z",
                  thrashingScore: 5,
                },
              },
              sessionStart: new Date().toISOString(),
            }),
          },
        },
      );
    },
    CASE_TIMEOUT,
  );
});
