/**
 * The plan-size check, printed for a human or an agent to read.
 *
 * The computation is `lib/plan-size.ts`, and this is its only caller — no hook
 * runs it, no test gates on it, no pipeline step invokes it. Read that module's
 * header for the ceiling's provenance and for why it is carried in no exit code.
 *
 * ## The format, asked before anything is read
 *
 * The codec's gate, through `lib/record-index.ts`, decides whether anything is
 * read. On `json-control` a plan is live when its record says so, and a marker
 * in its name decides nothing; the first line of stdout names the format
 * (`format=`). A `legacy` workbench is refused by name and pointed at
 * `/fusion:migrate` (FJ03d step 8: the marker reader is gone, per section 9's
 * FJ03 row). Every answer but `json-control` (`legacy`, `unsupported`, a
 * refusal, `recovery-blocked` among them, or no answer) is exit 4 and never
 * `verdict=empty`: a workbench nobody read has no plans nobody measured.
 *
 * Output, one `KEY=value` per line in the shape `bin/fusion-staging-drift` and
 * `bin/fusion-review-coverage` use, then one line per live plan, largest first:
 *
 *   format=json-control
 *   anchor=workbench-root
 *   ceiling=40000
 *   plans=4
 *   over=3
 *   largest=57891
 *   total=195402
 *   skipped-specs=4
 *   unreadable=0
 *   verdict=over
 *     over      57891  work-packages/<dir>/plans/<stem>.md  (17891 over — …)
 *     under     33472  shared/plans/<stem>.md
 *     unreadable  <plan control file>  <class>/<reason>
 *
 * `unreadable=` counts the plan control files the codec could not read. Whether
 * such a plan is live is what did not read, so it is neither measured nor
 * dropped, and `verdict=` does not read the count.
 *
 * ## Exit codes, and the one that is deliberately NOT here
 *
 *   0  the check ran. `verdict=` says what it found.
 *   1  usage error.
 *   2  no fusion workbench above the working directory; nothing to check.
 *   3  the plugin itself could not run: the codec bundle is not installed, so
 *      nothing could be asked (the wrapper's own 3 covers the compiled hooks),
 *      or an internal error stopped this entry, named with its stack.
 *   4  the workbench was not read: `legacy` (refused by name, pointing at
 *      `/fusion:migrate`), unsupported, refused or unanswered. The cause is on
 *      stderr and NOTHING is on stdout.
 *
 * **A plan over the ceiling is not an error exit**, for the reason
 * `bin/fusion-review-coverage` gives at the same place: a check that hands its
 * result to an exit code teaches its reader to ignore that code. Here it is
 * also the user's ruling rather than a convention — see the library header.
 *
 * `verdict=empty` is a real answer and not a failure: a workbench with no live
 * plan has nothing over any ceiling, and it reaches exit 0 like the other two.
 */

import { join } from "node:path";
import { measurePlanSizes, renderPlanRow, DEFAULT_CEILING } from "./lib/plan-size.js";
import { bundleMissing, legacyLine, notReadLine, readRecordIndex } from "./lib/record-index.js";
import { findWorkbenchRoot } from "./lib/workbench-root.js";
import { exitZeroOnStdoutEpipe } from "./lib/fail-open.js";

// The reader may close stdout first; see exitZeroOnStdoutEpipe.
exitZeroOnStdoutEpipe();

const USAGE = "usage: fusion-plan-size [--ceiling <bytes>]";

function main(argv: string[]): number {
  let ceiling = DEFAULT_CEILING;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--ceiling") {
      const raw = argv[i + 1];
      if (raw === undefined || !/^\d+$/.test(raw) || Number(raw) === 0) {
        process.stderr.write(
          `fusion-plan-size: --ceiling wants a positive whole number of bytes, got ${JSON.stringify(raw ?? "")}\n${USAGE}\n`,
        );
        return 1;
      }
      ceiling = Number(raw);
      i += 1;
      continue;
    }
    process.stderr.write(
      `fusion-plan-size: unknown argument ${JSON.stringify(argv[i])}\n${USAGE}\n`,
    );
    return 1;
  }

  const root = findWorkbenchRoot();
  if (root === null) {
    process.stderr.write(
      "fusion-plan-size: no fusion workbench above the working directory — nothing to check.\n",
    );
    return 2;
  }

  // the format before anything else is read: see `## The format`
  const workbench = join(root, "fusion-workbench");
  const read = readRecordIndex(workbench);
  if (read.format === "legacy") {
    process.stderr.write(`fusion-plan-size: ${legacyLine(workbench)} Nothing was measured.\n`);
    return 4;
  }
  if (read.format === "unknown") {
    process.stderr.write(`fusion-plan-size: ${notReadLine(read.unread, workbench)} Nothing was measured.\n`);
    return bundleMissing(read.unread) ? 3 : 4;
  }
  const report = measurePlanSizes(root, read.index, ceiling);
  const total = report.rows.reduce((n, r) => n + r.bytes, 0);

  const out: string[] = [
    `format=${read.format}`,
    "anchor=workbench-root",
    `ceiling=${report.ceiling}`,
    `plans=${report.rows.length}`,
    `over=${report.rows.filter((r) => r.over).length}`,
    `largest=${report.rows.length === 0 ? 0 : report.rows[0].bytes}`,
    `total=${total}`,
    `skipped-specs=${report.skippedSpecs}`,
    `unreadable=${report.unreadable.length}`,
    `verdict=${report.verdict}`,
  ];
  for (const r of report.rows) out.push(renderPlanRow(r, report.ceiling));
  for (const u of report.unreadable) out.push(`  unreadable  ${u.path}  ${u.problem}`);

  process.stdout.write(out.join("\n") + "\n");
  return 0;
}

// An internal error is 3, "the plugin itself could not run", and never Node's
// own 1, which is the usage error here.
try {
  process.exitCode = main(process.argv.slice(2));
} catch (e) {
  process.stderr.write(`fusion-plan-size: an internal error stopped the check, a fusion bug or an incomplete install and not the workbench's. Nothing was measured.\n${e instanceof Error ? e.stack : String(e)}\n`);
  process.exitCode = 3;
}
