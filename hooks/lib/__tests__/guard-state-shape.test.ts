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
 * ## Which state file the rows seed
 *
 * The subject is the STATE LOAD, not any one file. The seeded file has moved
 * three times as the mechanism it borrowed from was removed, and is
 * `review-coverage.json` now; the doc comment on `openCoverageGap` in
 * helpers/guard-harness.ts carries the three re-pointings and why coverage,
 * not staging drift, is the one a malformed throttle can be seeded into.
 * ## Why every case here uses a write tool
 *
 * Now it is required rather than chosen: the coverage trigger fires only for a
 * write tool whose payload names a `.md` file under a `reviews/` store. It was
 * a choice under the two previous probes, and the reason it was made is the
 * reason it is comfortable now — the defect was measured on a write tool.
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
 *
 * ## A second subject, and it is here by dispatch rather than by fit
 *
 * The last block asserts that every row landing in `.guard-state/events.jsonl`
 * names the Claude Code session that produced it. That is the shape of the log
 * rather than the shape of a state load, and its natural home is
 * `guard-bash-integration.test.ts`, beside the `tool` and `file` assertions on
 * the same row. It sits here because step 11 of the C4 plan named this file as
 * the one test file it may touch. The move is filed as its own defect.
 */

import { describe, expect, it } from "vitest";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  CASE_TIMEOUT,
  COVERAGE_SENTENCE_MARKERS,
  REVIEW_PAYLOAD,
  openCoverageGap,
  openCoverageWindowWithNoGap,
  readEvents,
  runToolCall,
  withProject,
  type Project,
} from "./helpers/guard-harness.js";

const THROTTLE_FILE = "fusion-workbench/.guard-state/review-coverage.json";

/** The file the tool call names — a review landing, which is the trigger. */
const PAYLOAD = REVIEW_PAYLOAD;

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
 * The coverage fixture
 * ------------------------------------------------------------------ */

/**
 * A project with an uncovered commit range, with the throttle record seeded
 * verbatim.
 *
 * `git: true` is not optional here: the range is `git rev-list` over the
 * session anchor, and without a repository the report comes back with a `why`
 * and the tracker returns before the load these rows are about.
 */
function withGap<T>(throttle: string, fn: (project: Project) => T): T {
  return withProject(
    (project) => {
      openCoverageGap(project.root);
      return fn(project);
    },
    { git: true, files: { [THROTTLE_FILE]: throttle } },
  );
}

/** One review file landing. Returns the tracker's reply. */
function reviewLands(root: string): string {
  const abs = resolve(root, PAYLOAD);
  const { post } = runToolCall(
    root,
    "Write",
    { file_path: abs },
    () => {
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, "# review\n", "utf-8");
    },
  );
  return context(post);
}

/** Everything the lost sentence carried, asserted as one. */
function expectTheCoverageSentence(text: string): void {
  for (const marker of COVERAGE_SENTENCE_MARKERS) expect(text).toContain(marker);
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
      `reports the coverage gap with review-coverage.json = ${name}`,
      () => {
        withGap(content, ({ root }) => {
          expectTheCoverageSentence(reviewLands(root));
        });
      },
      CASE_TIMEOUT,
    );
  }
});

describe("the malformed file is repaired, not just survived", () => {
  it(
    "still reports the gap, and repairs the file instead of failing again",
    () => {
      withGap("{}", ({ root }) => {
        expectTheCoverageSentence(reviewLands(root));

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
    "costs nothing on a review landing with nothing to report",
    () => {
      // The same malformed file in a project whose range is fully covered
      // because it is EMPTY — the anchor is HEAD. That distinction is what
      // makes the case worth anything: a project with no `agentstate.yaml` at
      // all returns on the measurement's `why` branch, which sits BEFORE the
      // load, and would assert nothing about the load. With a window and no
      // gap, the load runs, still must not throw, and the honest reading of a
      // malformed throttle is "never reported" — which equals the empty
      // signature a fully covered range produces, so the measurement returns
      // before it writes. The file is therefore left exactly as it was, and
      // that is the assertion: the repair above is a repair the REPORT
      // performs, not something the load does on its own.
      withProject(
        ({ root }) => {
          openCoverageWindowWithNoGap(root);
          expect(reviewLands(root)).toBe("");
          expect(readState(root, THROTTLE_FILE)).toEqual({});
          expect(readEvents(root).map((e) => e.event)).not.toContain("guard_error");
        },
        { git: true, files: { [THROTTLE_FILE]: "{}" } },
      );
    },
    CASE_TIMEOUT,
  );
});

describe("a well-formed state file is carried forward, not emptied", () => {
  it(
    "reads back the signature the previous call wrote and stays quiet",
    () => {
      withGap("{}", ({ root }) => {
        // The first call has nothing to compare against and speaks.
        expectTheCoverageSentence(reviewLands(root));
        const first = readState(root, THROTTLE_FILE)?.reported;

        // The second call loads what the first wrote. A coercion that emptied a
        // well-formed file would make this speak again — and a message on every
        // review landing is the failure the throttle exists to prevent.
        expect(reviewLands(root)).toBe("");
        expect(readState(root, THROTTLE_FILE)?.reported).toBe(first);
      });
    },
    CASE_TIMEOUT,
  );
});

/* ------------------------------------------------------------------ *
 * The session identifier on the rows themselves
 * ------------------------------------------------------------------ */

describe("every guard-log row names the Claude Code session that wrote it", () => {
  it(
    "carries the payload's session_id on the guard's row and on the tracker's",
    () => {
      // One tool call writes one row from each hook — `guard_allow` from the
      // PreToolUse side, `review_coverage` from the PostToolUse side — and the
      // two go through one seam in `lib/events.ts`. Asserting both is what stops
      // a fix that wires only the hook somebody happened to be reading.
      //
      // The value is the harness's own `session_id`; Claude Code sends a UUID,
      // measured non-empty on both hooks in the analysis this step acted on.
      withGap("{}", ({ root }) => {
        expectTheCoverageSentence(reviewLands(root));

        const rows = readEvents(root) as { event: string; session_id?: string }[];
        expect(rows.map((r) => r.event)).toEqual(["guard_allow", "review_coverage"]);
        for (const row of rows) expect(row.session_id).toBe("guard-harness");
      });
    },
    CASE_TIMEOUT,
  );
});
