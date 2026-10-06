/**
 * Plan size — the ceiling from `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` `### C5`,
 * reported and never enforced.
 *
 * ## What this measures and why the measurement exists
 *
 * The spec that removed the per-commit filing obligation kept one bound on what
 * may still be written: a plan is the fattest artefact in the store a dispatch
 * is pointed at, and no other record kind has that property. A plan that needs
 * more room than the ceiling is two plans.
 *
 * ## What it does NOT do, and that half is the ruling
 *
 * The ceiling is carried in **no exit code**, this module is wired into **no
 * check and no pipeline**, and nothing here rewrites, splits or refuses a plan.
 * That was ruled at the user's approval, in
 * `260909-1700_*_does-the-plan-size-ceiling-fail-hard-or-only-report.md`
 * (option 1, report only): no plan has a measured reader, so a hard bound here
 * would be the first in that cut enforced without one, which is the shape the
 * spec refuses everywhere else. It joins `bin/fusion-staging-drift`,
 * `bin/fusion-review-coverage` and `bin/fusion-citation-check`, none of which
 * has been promoted to a check, and it carries their stdout-verdict rule: the
 * result is a line of output, where a reader can see which row produced it.
 *
 * ## The ceiling is chosen, not measured, and it says so
 *
 * `DEFAULT_CEILING` is a policy value. It is **not** a threshold read off a
 * measurement of readers, because no such measurement exists — the decision
 * above says so in as many words. What it was chosen against is only this: a
 * ceiling above every plan in the corpus prints the same result forever and
 * tells a reader nothing, so it sits below the corpus fusion itself was
 * carrying when the helper was written. `--ceiling <bytes>` re-reads the same
 * corpus at any other number, which is what makes a wrong choice cost a line of
 * stdout rather than an argument with this file.
 *
 * ## The corpus is the record index's
 *
 * The live plans, requirements-designer specs excluded. The caller asks the
 * gate first (`lib/record-index.ts`) and hands this module the index:
 * `measurePlanSizes` weighs every plan record whose `live` is true, at its
 * narrative. A marker in the narrative's name is history and decides nothing
 * (section 4.4 of Prior's spec): a live record named `_c_` is measured, a
 * closed one named `_o_` is not. A plan control file that did not read is
 * counted and named, never dropped, since whether it is live is exactly what
 * could not be read. The marker reader that judged a legacy workbench by
 * `_o_`/`_p_` went at FJ03d step 8, when the caller began refusing one.
 *
 * `isSpec` reads the narrative's name and first line, no control field.
 *
 * `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` takes its corpus
 * from this function over fusion's own workbench, so the lint and the shipped
 * helper read one definition of a live plan.
 */
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { namesOf, RECORD_CONTROL_SUFFIX } from "./stores.js";
/**
 * The ceiling, in bytes. Chosen, not measured — see the header. Below every
 * plan but one in the corpus fusion carried on 2026-09-10, so the result says
 * something on the day it lands.
 */
export const DEFAULT_CEILING = 40000;
/**
 * A requirements-designer spec rather than an implementation-planner plan, by the requirements-designer's own two template
 * signatures (the `spec-` topic prefix and the `# Spec:` H1), either sufficient.
 * A spec is not a plan and the ceiling is not about it.
 */
export function isSpec(base, firstLine) {
    // the stamp with a marker, or the marker-free `YYMMDD-HHMM-` a JSON narrative carries
    const topic = base.replace(/^\d{6}-\d{4}(?:_[a-z]_|-)/, "");
    return topic.startsWith("spec-") || /^#\s+Spec:/.test(firstLine);
}
/**
 * Weigh `rels` (workbench-relative live plan narratives) against `ceiling`.
 *
 * Rows come back largest first, so the reader meets the plan the result is
 * about before the ones it is not. A file that cannot be read is skipped rather
 * than counted as zero: a zero would report a plan as comfortably under a
 * ceiling nobody measured it against.
 */
function weigh(wb, rels, ceiling) {
    const rows = [];
    let skippedSpecs = 0;
    for (const rel of rels) {
        const abs = join(wb, rel);
        let bytes;
        let firstLine;
        try {
            bytes = statSync(abs).size;
            firstLine = readFileSync(abs, "utf-8").split("\n")[0] ?? "";
        }
        catch {
            continue;
        }
        if (isSpec(rel.slice(rel.lastIndexOf("/") + 1), firstLine)) {
            skippedSpecs += 1;
            continue;
        }
        rows.push({ rel, bytes, over: bytes > ceiling });
    }
    rows.sort((a, b) => b.bytes - a.bytes || a.rel.localeCompare(b.rel));
    const verdict = rows.length === 0 ? "empty" : rows.some((r) => r.over) ? "over" : "under";
    return { ceiling, rows, skippedSpecs, verdict };
}
/**
 * The corpus: every plan record of `index` whose `live` is true, at its
 * narrative, against `ceiling`. Plan control files in `index.unreadable` come
 * back named, since their liveness is what did not read.
 */
export function measurePlanSizes(root, index, ceiling = DEFAULT_CEILING) {
    const rels = [...index.byControl.values()]
        .filter((e) => e.kind === "plan" && e.live && e.narrative !== null)
        .map((e) => e.narrative);
    const plansStores = namesOf("plans");
    const unreadable = index.unreadable
        .filter((u) => u.path.endsWith(RECORD_CONTROL_SUFFIX) && plansStores.includes(u.path.split("/").at(-2) ?? ""))
        .map((u) => ({ path: u.path, problem: `${u.problem.class}/${u.problem.reason}` }));
    return { ...weigh(join(root, "fusion-workbench"), rels, ceiling), unreadable };
}
/**
 * One output line per plan: the class, the size, the path, and — for a row over
 * the ceiling — what it would take to get under it. Naming the excess rather
 * than a percentage is deliberate: "split 17 891 bytes out of this" is an
 * instruction, and "144% of ceiling" is a figure to convert first.
 */
export function renderPlanRow(row, ceiling) {
    const klass = row.over ? "over " : "under";
    const tail = row.over ? `  (${row.bytes - ceiling} over — a plan that needs more room is two plans)` : "";
    return `  ${klass}  ${String(row.bytes).padStart(7)}  ${row.rel}${tail}`;
}
