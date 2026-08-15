/**
 * A shape-valid `.guard-state/` JSON file used to swallow the tracker's reply.
 *
 * ## The mechanism, in the order it runs
 *
 * `tracker.ts` loads state, produces its reply, and every state load on the way
 * used to cast the parsed JSON with `as` inside a `try/catch` that handles a
 * MISSING file and UNPARSEABLE text — and nothing else. A file that parses to a
 * valid JSON value of the wrong shape (`{}` is enough) passed that catch and
 * threw on the next field access. The throw reached the top-level handler, which
 * calls `respond()` with NO argument, so the reply went out empty.
 *
 * What that costs is precise. Whatever the measurements before it had to say was
 * lost — and every one of them is a sentence the model would otherwise have
 * acted on. The state file was never repaired either, because the save sits
 * after the throw, so every later tool call in that project repeated it (issue
 * `260809-1101`). The fix is `lib/guard-state-file.ts`'s coercion seam, which
 * every state file on the tracker's path goes through; its header carries the
 * argument.
 *
 * ## Which state file the rows seed, and why it has changed twice
 *
 * The subject of this file is the STATE LOAD, not any one file and not whatever
 * the reply happens to say. Every row needs the tracker to have SOMETHING to
 * report, so that "the reply survived the load" is observable at all.
 *
 * The reply was the protected-path halt sentence until 2026-08-12, and moved to
 * the session-state drift sentence when that half of the guard was removed. The
 * seeded file was `churn.json` until 2026-08-15, and moved to `state-drift.json`
 * when the churn heatmap was removed with the last state file the tracker loaded
 * outside its own measurements.
 *
 * `state-drift.json` is the right successor rather than the nearest one. It is
 * the throttle record `measureStateDriftForModel` reads on EVERY guarded tool
 * call, before it produces the sentence — so a load that threw would take the
 * sentence with it, which is exactly the shape the defect had. Review coverage
 * and staging drift have throttle records too, and both were declined for the
 * reason their triggers already state: coverage needs the payload to be a `.md`
 * file under a `reviews/` store with a session window to measure against, and
 * staging needs HEAD to have moved. Either would couple these rows to a second
 * trigger that has nothing to do with the load. Drift needs no such coupling: it
 * needs a git repository, a six-line `agentstate.yaml` and three commits, after
 * which every tool call in the project reports the same divergence.
 *
 * The fixture is `freezeCommitCount` in helpers/guard-harness.ts, which carries
 * the rest of that reasoning and is shared with the one other suite pointed the
 * same way. It is deliberately MINIMAL rather than the full state file the
 * orchestrator writes: `measureStateDrift` reports each row it cannot decide as
 * `unchecked` and omits it from the sentence, so the two fields that produce the
 * `progress.commits` row are all either suite needs.
 *
 * ## Why every case here uses a write tool
 *
 * Nothing here requires it of the drift measurement, which runs for `Bash` too.
 * The write tools are kept because the defect was measured on one, and because
 * an ordinary `notes.txt` edit is the plainest call that reaches the load.
 *
 * ## What proves the fix rather than the absence of the bug
 *
 * `runTracker` throws when the tracker prints `[tracker] Error:`, which is the
 * fail-open path this defect took, so a regression fails here loudly. On top of
 * that each malformed row asserts the sentence itself reached stdout, and the
 * last case asserts that a well-formed throttle is read back rather than
 * discarded — a coercion that emptied everything would satisfy all the malformed
 * rows while silently resetting the throttle on every load, and a throttle that
 * resets repeats its sentence on every tool call, which is the failure the
 * throttle exists to prevent.
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

const THROTTLE_FILE = "fusion-workbench/.guard-state/state-drift.json";

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
 * A project whose bookkeeping has drifted, with the throttle record seeded
 * verbatim.
 *
 * `git: true` is not optional here: the drift is measured against the git
 * history, which is one of the two records the check reads.
 */
function withDrift<T>(throttle: string, fn: (project: Project) => T): T {
  return withProject(
    (project) => {
      freezeCommitCount(project.root);
      return fn(project);
    },
    { git: true, files: { [THROTTLE_FILE]: throttle } },
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
  ["a state object with no reported field at all", '{"seen":"whatever"}'],
  ["reported as an array rather than a string", '{"reported":[]}'],
  ["null — valid JSON with no properties to read", "null"],
  ["truncated JSON — one of the two rows the old catch did handle", '{"reported": {'],
  ["an empty file — the other row the old catch did handle", ""],
];

describe("a malformed state file no longer swallows the tracker's reply", () => {
  for (const [name, content] of MALFORMED_ROWS) {
    it(
      `reports the state drift with state-drift.json = ${name}`,
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
        const throttle = readState(root, THROTTLE_FILE);
        expect(typeof throttle?.reported).toBe("string");
        expect(throttle?.reported).not.toBe("");

        // And nothing took the fail-open path on the way. `runTracker` throws
        // on the stderr line; this asserts the event the handler emits, which
        // is what a reader of the log would have seen.
        expect(readEvents(root).map((e) => e.event)).not.toContain("guard_error");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "costs nothing on an ordinary write with nothing to report",
    () => {
      // The same malformed file in a project with no drift. The load still runs
      // and still must not throw, and the honest reading of a malformed
      // throttle is "never reported" — which equals the empty signature a
      // project with nothing drifted produces, so the measurement returns before
      // it writes. The file is therefore left exactly as it was, and that is the
      // assertion: the repair above is a repair the REPORT performs, not
      // something the load does on its own.
      withProject(
        ({ root }) => {
          expect(ordinaryEdit(root)).toBe("");
          expect(readState(root, THROTTLE_FILE)).toEqual({});
          expect(readEvents(root).map((e) => e.event)).not.toContain("guard_error");
        },
        { files: { [THROTTLE_FILE]: "{}" } },
      );
    },
    CASE_TIMEOUT,
  );
});

describe("a well-formed state file is carried forward, not emptied", () => {
  it(
    "reads back the signature the previous call wrote and stays quiet",
    () => {
      withDrift("{}", ({ root }) => {
        // The first call has nothing to compare against and speaks.
        expectTheDriftSentence(ordinaryEdit(root));
        const first = readState(root, THROTTLE_FILE)?.reported;

        // The second call loads what the first wrote. A coercion that emptied a
        // well-formed file would make this speak again — and a message on every
        // tool call is the failure the throttle exists to prevent.
        expect(ordinaryEdit(root)).toBe("");
        expect(readState(root, THROTTLE_FILE)?.reported).toBe(first);
      });
    },
    CASE_TIMEOUT,
  );
});
