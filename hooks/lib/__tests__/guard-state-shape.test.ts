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
 * What that costs is precise: whatever the measurements before it had to say was
 * lost, and the state file was never repaired either, because the save sits after
 * the throw — so every later tool call in that project repeated it (issue
 * `260809-1101`). The fix is `lib/guard-state-file.ts`'s coercion seam, whose own
 * header carries the argument.
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
 * Required rather than chosen: the coverage trigger fires only for a write tool
 * whose payload names a `.md` file under a `reviews/` store — and the defect was
 * measured on a write tool anyway.
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
 * ## The second subject: the dispatch gate, and what `.guard-state/` says about it
 *
 * The last describe block is about a different mechanism and belongs here for
 * the same reason the rows above do — its subject is what a hook writes when a
 * state file is NOT there. `lib/orchestrator-events.ts` used to gate every
 * machine dispatch row on `fusion-workbench/agentstate.yaml` existing, which
 * made the gate orchestrator-scoped; it is now that file OR a session identifier
 * on the payload, which makes it project-scoped, and the file arm is kept so the
 * widening removed nothing.
 *
 * What makes these cases `.guard-state/` cases rather than event-log cases is
 * the second half of the change. A payload with no identifier is no longer a
 * bare `return`: it earns one `guard_advisory` in `.guard-state/events.jsonl`,
 * and every case below reads BOTH logs, because a case reading only the event
 * log cannot tell a row that was written from a row that was dropped in silence
 * — which is the failure mode that let the model-written rows stand on zero
 * session identifiers for a whole release.
 */

import { describe, expect, it } from "vitest";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  CASE_TIMEOUT,
  COVERAGE_SENTENCE_MARKERS,
  REVIEW_PAYLOAD,
  guardStateEntries,
  openCoverageGap,
  openCoverageWindowWithNoGap,
  openOrchestratorSession,
  readEvents,
  readOrchestratorEvents,
  runDispatch,
  runToolCall,
  withProject,
  type Project,
} from "./helpers/guard-harness.js";
import { ABSENT_SESSION_ID_ADVISORY } from "../orchestrator-events.js";

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
 * The dispatch gate — see the second subject in this file's header
 * ------------------------------------------------------------------ */

const AGENTSTATE = "fusion-workbench/agentstate.yaml";

/** One dispatch payload's worth of fields, so every case names the same row. */
const DISPATCH = {
  toolUseId: "toolu_01B2gate",
  subagentType: "fusion:coder",
  description: "generalise the gate",
} as const;

/** The `task_start` rows in the workbench-root event log. */
function dispatchRows(root: string): Record<string, unknown>[] {
  return readOrchestratorEvents(root).filter((r) => r.event === "task_start");
}

/** The advisories in `.guard-state/events.jsonl` about an absent identifier. */
function absentIdAdvisories(root: string): string[] {
  return readEvents(root)
    .filter((e) => e.event === "guard_advisory")
    .map((e) => e.detail ?? "")
    .filter((detail) => detail.includes(ABSENT_SESSION_ID_ADVISORY));
}

describe("the dispatch row is gated on a session, not on agentstate.yaml", () => {
  it(
    "writes the row with NO agentstate.yaml, on the payload's session identifier",
    () => {
      withProject(({ root }) => {
        expect(existsSync(resolve(root, AGENTSTATE))).toBe(false);
        runDispatch(root, { ...DISPATCH, sessionId: "sid-project-scoped" });

        const rows = dispatchRows(root);
        expect(rows, "the widened gate admitted nothing").toHaveLength(1);
        expect(rows[0]).toMatchObject({
          event: "task_start",
          task: DISPATCH.toolUseId,
          agent: "coder",
          session_id: "sid-project-scoped",
          detail: DISPATCH.description,
        });

        // What the ordinary dispatch path writes under `.guard-state/` is the
        // byte measurement's two memo files and NOTHING else — in particular no
        // `events.jsonl`, which is the advisory an absent identifier earns and
        // this payload carried one. The exact set is the discrimination; the
        // directory's absence stopped being one when the measurement landed
        // (`lib/dispatch-bytes.ts`).
        expect(guardStateEntries(root).filter((f) => f !== "rule-sizes.json" && f !== "byte-baseline.json")).toEqual([]);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "still writes the row on agentstate.yaml alone, which is what it always did",
    () => {
      // The regression half. The widening added a term and removed none, so a
      // payload the OLD gate admitted must still be admitted — and this is the
      // case that fails if a future edit turns the disjunction into the new
      // term standing on its own.
      withProject(({ root }) => {
        openOrchestratorSession(root);
        runDispatch(root, { ...DISPATCH, sessionId: "sid-in-flight" });
        expect(dispatchRows(root)).toHaveLength(1);
        expect(absentIdAdvisories(root)).toEqual([]);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "writes the row with session_id ABSENT when only agentstate.yaml admits it",
    () => {
      withProject(({ root }) => {
        openOrchestratorSession(root);
        runDispatch(root, DISPATCH);

        const rows = dispatchRows(root);
        expect(rows).toHaveLength(1);
        expect(Object.keys(rows[0]), "session_id was written empty").not.toContain("session_id");
        expect(rows[0]).toMatchObject({ task: DISPATCH.toolUseId, agent: "coder" });

        // Absent, and SAID so. The row on its own cannot distinguish a payload
        // that carried no identifier from a schema that never had the field.
        const advisories = absentIdAdvisories(root);
        expect(advisories, "the absent identifier went unreported").toHaveLength(1);
        expect(advisories[0]).toContain("session_id absent");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "reports rather than drops when NEITHER arm of the gate holds",
    () => {
      withProject(({ root }) => {
        expect(existsSync(resolve(root, AGENTSTATE))).toBe(false);
        runDispatch(root, DISPATCH);

        // No row: neither term is satisfied, so nothing scopes it.
        expect(readOrchestratorEvents(root)).toEqual([]);

        // But not a silent drop. Exactly one advisory, naming the condition and
        // saying that no row was written — which is the whole difference
        // between this and the bare `return` it replaced.
        const advisories = absentIdAdvisories(root);
        expect(advisories, "the dropped row was never reported").toHaveLength(1);
        expect(advisories[0]).toContain("no task_start row is written");
      });
    },
    CASE_TIMEOUT,
  );
});
