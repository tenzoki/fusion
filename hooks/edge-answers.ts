/**
 * What prior policy-curator runs already asked the user about a work-item edge, printed
 * for `agents/policy-curator.md` `### The suppression read` to read instead of the
 * corpus.
 *
 * The computation is `lib/edge-answers.ts`, and this is its only caller — no
 * hook runs it, no test gates on it, no pipeline step invokes it. Read that
 * module's header for the corpus, the outcome parse and why the consequence
 * group is deliberately not a column.
 *
 * Output, one `KEY=value` per line, then one row per answered pair:
 *
 *   anchor=workbench-root
 *   run-files=15
 *   edge-entries=2
 *   pairs=2
 *   unreadable=0
 *   verdict=answers
 *   none        <dependent>.md -> <target>.md  into Cross-references
 *
 * The row is four fixed columns — the outcome value, the dependent, the target,
 * the field. `none` and `unreadable` are not outcome values: they say no answer
 * could be read, from an entry with no outcome row and from one whose row
 * carries no vocabulary word. `### The suppression read` decides what each of
 * the seven values does, and nothing here does.
 *
 * ## The `note=` line is mandatory whenever `unreadable=` is above zero
 *
 * The parse reads free-form prose and can come back with an entry it cannot
 * resolve to one value. That is a degradation which changed the answer, so it is
 * stated rather than hidden — the line kind `bin/fusion-work-order` and
 * `bin/fusion-forum` carry.
 *
 * ## Exit codes, and the one that is deliberately NOT here
 *
 *   0  the read ran. `verdict=` says what it found.
 *   1  usage error.
 *   2  no fusion workbench above the working directory; nothing to read.
 *
 * **No exit code carries the verdict**, the stdout-verdict rule
 * `bin/fusion-work-order`, `bin/fusion-plan-size`, `bin/fusion-review-coverage`,
 * `bin/fusion-staging-drift` and `bin/fusion-citation-check` all carry. An empty
 * corpus is an answer about the project — no edge was ever proposed — and a
 * broken install must never be reported as one; that is the wrapper's exit 3.
 */

import { computeEdgeAnswers, renderAnswerRow } from "./lib/edge-answers.js";
import { findWorkbenchRoot } from "./lib/workbench-root.js";
import { exitZeroOnStdoutEpipe } from "./lib/fail-open.js";

// The reader may close stdout first; see exitZeroOnStdoutEpipe.
exitZeroOnStdoutEpipe();

const USAGE = "usage: fusion-edge-answers";

/** The mandated caveat: the count, and what a reader must do with it. */
function caveat(n: number): string {
  const rows = n === 1 ? "1 pair carries" : `${n} pairs carry`;
  return (
    `note=${rows} an outcome row this program could not resolve to one value, ` +
    "and `unreadable` asserts no answer: treat those pairs as unanswered and " +
    "propose them again, which is the direction that loses nothing."
  );
}

function main(argv: string[]): number {
  if (argv.length > 0) {
    process.stderr.write(
      `fusion-edge-answers: unknown argument ${JSON.stringify(argv[0])}\n${USAGE}\n`,
    );
    return 1;
  }

  const root = findWorkbenchRoot();
  if (root === null) {
    process.stderr.write(
      "fusion-edge-answers: no fusion workbench above the working directory — nothing to read.\n",
    );
    return 2;
  }

  const report = computeEdgeAnswers(root);

  const out: string[] = [
    "anchor=workbench-root",
    `run-files=${report.runFiles}`,
    `edge-entries=${report.edgeEntries}`,
    `pairs=${report.rows.length}`,
    `unreadable=${report.unreadable}`,
    `verdict=${report.verdict}`,
  ];
  if (report.unreadable > 0) out.push(caveat(report.unreadable));
  for (const row of report.rows) out.push(renderAnswerRow(row));

  process.stdout.write(out.join("\n") + "\n");
  return 0;
}

process.exitCode = main(process.argv.slice(2));
