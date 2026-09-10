/**
 * The plan-size check, printed for a human or an agent to read.
 *
 * The computation is `lib/plan-size.ts`, and this is its only caller — no hook
 * runs it, no test gates on it, no pipeline step invokes it. Read that module's
 * header for the ceiling's provenance and for why it is carried in no exit code.
 *
 * Output, one `KEY=value` per line in the shape `bin/fusion-staging-drift` and
 * `bin/fusion-review-coverage` use, then one line per live plan, largest first:
 *
 *   anchor=workbench-root
 *   ceiling=40000
 *   plans=4
 *   over=3
 *   largest=57891
 *   total=195402
 *   skipped-specs=4
 *   verdict=over
 *     over      57891  circles/<dir>/planning/…_p_….md  (17891 over — …)
 *     under     33472  shared/planning/…_o_….md
 *
 * ## Exit codes, and the one that is deliberately NOT here
 *
 *   0  the check ran. `verdict=` says what it found.
 *   1  usage error.
 *   2  no fusion workbench above the working directory; nothing to check.
 *
 * **A plan over the ceiling is not an error exit**, for the reason
 * `bin/fusion-review-coverage` gives at the same place: a check that hands its
 * verdict to an exit code teaches its reader to ignore that code. Here it is
 * also the user's ruling rather than a convention — see the library header.
 *
 * `verdict=empty` is a real answer and not a failure: a workbench with no live
 * plan has nothing over any ceiling, and it reaches exit 0 like the other two.
 */
import { measurePlanSizes, renderPlanRow, DEFAULT_CEILING } from "./lib/plan-size.js";
import { findWorkbenchRoot } from "./lib/workbench-root.js";
import { exitZeroOnStdoutEpipe } from "./lib/fail-open.js";
// The reader may close stdout first; see exitZeroOnStdoutEpipe.
exitZeroOnStdoutEpipe();
const USAGE = "usage: fusion-plan-size [--ceiling <bytes>]";
function main(argv) {
    let ceiling = DEFAULT_CEILING;
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === "--ceiling") {
            const raw = argv[i + 1];
            if (raw === undefined || !/^\d+$/.test(raw) || Number(raw) === 0) {
                process.stderr.write(`fusion-plan-size: --ceiling wants a positive whole number of bytes, got ${JSON.stringify(raw ?? "")}\n${USAGE}\n`);
                return 1;
            }
            ceiling = Number(raw);
            i += 1;
            continue;
        }
        process.stderr.write(`fusion-plan-size: unknown argument ${JSON.stringify(argv[i])}\n${USAGE}\n`);
        return 1;
    }
    const root = findWorkbenchRoot();
    if (root === null) {
        process.stderr.write("fusion-plan-size: no fusion workbench above the working directory — nothing to check.\n");
        return 2;
    }
    const report = measurePlanSizes(root, ceiling);
    const total = report.rows.reduce((n, r) => n + r.bytes, 0);
    const out = [
        "anchor=workbench-root",
        `ceiling=${report.ceiling}`,
        `plans=${report.rows.length}`,
        `over=${report.rows.filter((r) => r.over).length}`,
        `largest=${report.rows.length === 0 ? 0 : report.rows[0].bytes}`,
        `total=${total}`,
        `skipped-specs=${report.skippedSpecs}`,
        `verdict=${report.verdict}`,
    ];
    for (const r of report.rows)
        out.push(renderPlanRow(r, report.ceiling));
    process.stdout.write(out.join("\n") + "\n");
    return 0;
}
process.exitCode = main(process.argv.slice(2));
