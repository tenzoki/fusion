/**
 * A shape-valid `churn.json` used to swallow the protected-path halt message.
 * (`cross-file.json` carried the identical defect and the identical coverage
 * here until the ping-back tracker was removed with decision `260809-2004`.)
 *
 * ## The mechanism, in the order it runs
 *
 * `tracker.ts` measures the protected paths FIRST and tracks churn afterwards,
 * then writes one reply carrying whatever the measurement had to say. Both state
 * loads used to cast the parsed JSON with `as` inside a `try/catch` that handles
 * a MISSING file and UNPARSEABLE text — and nothing else. A file that parses to
 * a valid JSON value of the wrong shape (`{}` is enough) passed that catch and
 * threw on the next field access, inside the churn half. The throw reached the
 * top-level handler, which calls `respond()` with NO argument, so the reply went
 * out empty. Both state loads: `churn.json` is the one that survives.
 *
 * What that costs is precise. The revert and the halt had already landed and
 * persisted; the sentence naming the changed file and the command that clears
 * the halt is what was lost — the one thing
 * `rules/protected-path-discipline.md` promises the agent it will be told. The
 * state file was never repaired either, because the save sits after the throw,
 * so every later tool call in that project repeated it (issue `260809-1101`).
 *
 * ## Why every case here uses a write tool
 *
 * The churn half returns immediately for `Bash`, so a malformed state file is
 * never even read on that surface. The write tools are where the load happens
 * and therefore where the message could be lost. Each case edits an UNPROTECTED
 * path while a protected one changes inside the same window — a user saving a
 * rule file in their own editor, which is the case the measurement's own header
 * names — so the PreToolUse guard allows the call and the PostToolUse
 * measurement still has something to report.
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
  readEscalation,
  readEvents,
  runToolCall,
  withProject,
} from "./helpers/guard-harness.js";

const CHURN_FILE = "fusion-workbench/.guard-state/churn.json";

/** The unprotected file the tool call names. */
const PAYLOAD = "notes.txt";
/** The protected file that changes inside the same window. */
const PROTECTED = "rules/x.md";

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

/**
 * One Edit call on `notes.txt` during which `rules/x.md` also changes.
 *
 * Returns the tracker's reply. The effect runs between the two hooks, which is
 * the only placement that reproduces what the measurement measures.
 */
function editWhileARuleFileChanges(root: string): { context: string } {
  const { post } = runToolCall(
    root,
    "Edit",
    { file_path: resolve(root, PAYLOAD) },
    () => {
      writeFileSync(resolve(root, PAYLOAD), "edited\n", "utf-8");
      writeFileSync(resolve(root, PROTECTED), "# changed by someone\n", "utf-8");
    },
  );
  return { context: context(post) };
}

/** Everything the lost sentence carried, asserted as one. */
function expectTheHaltSentence(text: string): void {
  expect(text).toContain("a protected path changed during this tool call");
  expect(text).toContain(PROTECTED);
  expect(text).toContain("HALTED");
  expect(text).toContain("clear-halt.js");
}

const MALFORMED_ROWS: [string, string][] = [
  ["{} — the shape the issue was measured with", "{}"],
  ["a state object with no files map at all", '{"sessionStart":"2026-08-09T09:00:00.000Z"}'],
  ["files as an array rather than a map", '{"files":[]}'],
  ["null — valid JSON with no properties to read", "null"],
  ["truncated JSON — one of the two rows the old catch did handle", '{"files": {'],
  ["an empty file — the other row the old catch did handle", ""],
];

describe("a malformed churn.json no longer swallows the halt message", () => {
  for (const [name, content] of MALFORMED_ROWS) {
    it(
      `reports the protected-path halt with churn.json = ${name}`,
      () => {
        withProject(
          ({ root }) => {
            expectTheHaltSentence(editWhileARuleFileChanges(root).context);
            expect(readEscalation(root)?.haltActive).toBe(true);
          },
          { files: { [CHURN_FILE]: content } },
        );
      },
      CASE_TIMEOUT,
    );
  }
});

describe("the malformed file is repaired, not just survived", () => {
  it(
    "still reports the halt, and repairs the file instead of failing again",
    () => {
      withProject(
        ({ root }) => {
          expectTheHaltSentence(editWhileARuleFileChanges(root).context);

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
        },
        { files: { [CHURN_FILE]: "{}" } },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "records the churn of an ordinary write with no protected path involved",
    () => {
      // The same malformed file without the halt path, so the repair is shown
      // to be the load's doing and not something the measurement arranged.
      withProject(
        ({ root }) => {
          const { post } = runToolCall(
            root,
            "Edit",
            { file_path: resolve(root, PAYLOAD) },
            () => writeFileSync(resolve(root, PAYLOAD), "edited\n", "utf-8"),
          );
          expect(context(post)).toBe("");
          expect(readState(root, CHURN_FILE)?.files).toMatchObject({
            [PAYLOAD]: { totalChanges: 1 },
          });
          // The guard writes escalation.json on the allow path too, so the
          // assertion is on the flag rather than on the file's absence.
          expect(readEscalation(root)?.haltActive).toBe(false);
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
          runToolCall(
            root,
            "Edit",
            { file_path: resolve(root, PAYLOAD) },
            () => writeFileSync(resolve(root, PAYLOAD), "edited\n", "utf-8"),
          );
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
