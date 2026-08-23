/**
 * The staging-drift check, printed for a human or an agent to read.
 *
 * The computation is `lib/staging-drift.ts`; this is one of its two callers.
 * The other is `hooks/tracker.ts`, the PostToolUse hook, which runs it unasked
 * on the tool call that moved HEAD. Read that module's header for the defect
 * (issue `260811-0114`) and for why the trigger is a measured HEAD rather than
 * a `Bash` command's text.
 *
 * Called through `bin/fusion-staging-drift` by `agents/orchestrator.md` at
 * Phase 1 (after a queue rebuild is committed), at Step 3e in the same command
 * as the `turn_end` emission, and at Cleanup — plus anyone at a terminal who
 * wants to know what the workbench is holding that no commit carries.
 *
 * Output, one `KEY=value` per line in the shape `bin/fusion-review-coverage`
 * uses, then one line per entry:
 *
 *   anchor=workbench-root
 *   head=5ef92eb
 *   rows=4
 *   unstaged=2
 *   verdict=unstaged
 *     record          M circles/<dir>/_t_circle.md  UNSTAGED  (a Circle record)
 *     record         ?? shared/history/260810-1723-tasklist-update.md  UNSTAGED  (…)
 *     in-flight       M orchestrator-events.jsonl  (append-only — …)
 *     unclassified   ?? stilwerk/chat-voice-de.yaml  (not a record store …)
 *
 * **Every entry is printed, in all four classes.** The Turn-boundary read is
 * deliberate, and a deliberate read should be complete: a file this check is
 * silent about is a file the reader has to discover some other way, which is
 * the shape of the defect it answers. Only `record` and `commit-message` rows
 * carry `UNSTAGED` and only those reach `verdict=`, so a complete listing costs
 * the reader nothing in false alarms.
 *
 * ## Exit codes, and the one that is deliberately NOT here
 *
 *   0  the check ran. `verdict=` says what it found.
 *   1  usage error.
 *   2  no fusion workbench above the working directory; nothing to check.
 *
 * **Finding an unstaged record is not an error exit**, for the reason
 * `bin/fusion-review-coverage` gives at the same place (issue `260810-0710`): a
 * check that hands its verdict to an exit code teaches its reader to ignore
 * that code, and a Turn that legitimately ends with a record still in flight
 * would then be reporting failure where nothing is wrong. The verdict is a line
 * of output, where a reader can see which row produced it.
 */

import {
  currentHead,
  measureStagingDrift,
  renderStagingRow,
} from "./lib/staging-drift.js";
import { findWorkbenchRoot } from "./lib/workbench-root.js";

const USAGE = "usage: fusion-staging-drift";

function main(argv: string[]): number {
  if (argv.length > 0) {
    process.stderr.write(
      `fusion-staging-drift: unknown argument ${JSON.stringify(argv[0])}\n${USAGE}\n`,
    );
    return 1;
  }

  const root = findWorkbenchRoot();
  if (root === null) {
    process.stderr.write(
      "fusion-staging-drift: no fusion workbench above the working directory — nothing to check.\n",
    );
    return 2;
  }

  const report = measureStagingDrift(root);

  const out: string[] = ["anchor=workbench-root"];

  if (report.why !== "") {
    out.push("rows=0", "unstaged=0", "verdict=unchecked", `why=${report.why}`);
    process.stdout.write(out.join("\n") + "\n");
    return 0;
  }

  const head = currentHead(root);
  out.push(
    `head=${head === "" ? "(none)" : head.slice(0, 7)}`,
    `rows=${report.rows.length}`,
    `unstaged=${report.faults.length}`,
    `verdict=${report.faults.length > 0 ? "unstaged" : "clean"}`,
  );
  for (const r of report.rows) out.push(renderStagingRow(r));
  process.stdout.write(out.join("\n") + "\n");
  return 0;
}

process.exitCode = main(process.argv.slice(2));
