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
 * ## The corpus, per format, and a duplication this header owns rather than hides
 *
 * The live plans, requirements-designer specs excluded, and which plan is
 * live is the format's question. The caller asks the gate first
 * (`lib/record-index.ts`) and hands this module its answer:
 *
 *   `legacy`        `measurePlanSizes`: live (`_o_`/`_p_`) plans in every
 *                   planning store, read off the file name (`LIVE_MARKERS`).
 *   `json-control`  `measureJsonPlanSizes`: every plan record whose `live` is
 *                   true, measured at its narrative. A marker in the narrative's
 *                   name is history and decides nothing (section 4.4 of
 *                   Prior's spec): a live record named `_c_` is measured, a
 *                   closed one named `_o_` is not. A plan control file that did
 *                   not read is counted and named, never dropped, since
 *                   whether it is live is exactly what could not be read.
 *
 * `isSpec` reads the narrative's name and first line in both, no control field.
 *
 * The legacy corpus is the same one `hooks/lib/__tests__/plan-stopping-section-lint.test.ts`
 * builds for its own check, and the two definitions are separate copies: that
 * one is test-scoped and this one ships, and folding either into the other
 * would move a green check for a reason this step does not have. The residual is
 * recorded here rather than discovered later, the way `bin/fusion-prose-metric`
 * records its own fence-rule duplication.
 */
import type { RecordIndex } from "./record-index.js";
/**
 * The ceiling, in bytes. Chosen, not measured — see the header. Below every
 * plan but one in the corpus fusion carried on 2026-09-10, so the result says
 * something on the day it lands.
 */
export declare const DEFAULT_CEILING = 40000;
export interface PlanRow {
    /** Workbench-relative path. */
    rel: string;
    bytes: number;
    /** True when `bytes` exceeds the ceiling this run was given. */
    over: boolean;
}
export interface PlanSizeReport {
    ceiling: number;
    rows: PlanRow[];
    /** Live planning files excluded from `rows` because they are requirements-designer specs. */
    skippedSpecs: number;
    /** `over` when at least one row is; `under` with a non-empty corpus; `empty` otherwise. */
    verdict: "over" | "under" | "empty";
    /** `json-control` only: plan control files that did not read, each with the codec's finding. */
    unreadable?: Array<{
        path: string;
        problem: string;
    }>;
}
/** `YYMMDD-HHMM_S_<topic>.md` — the marker letter, or null if the name is not of that shape. */
export declare function markerOf(base: string): string | null;
/**
 * A requirements-designer spec rather than an implementation-planner plan, by the requirements-designer's own two template
 * signatures (the `spec-` topic prefix and the `# Spec:` H1), either sufficient.
 * A spec is not a plan and the ceiling is not about it.
 */
export declare function isSpec(base: string, firstLine: string): boolean;
/**
 * Every plans store under the workbench: each work package's, plus the shared
 * one, under either name during the window (`./stores.ts`).
 */
export declare function planningStores(root: string): string[];
/** The legacy reader: the live plans under `root`'s workbench by their file-name marker, against `ceiling`. */
export declare function measurePlanSizes(root: string, ceiling?: number): PlanSizeReport;
/**
 * The JSON reader: every plan record of `index` whose `live` is true, at its
 * narrative, against `ceiling`. Plan control files in `index.unreadable` come
 * back named, since their liveness is what did not read.
 */
export declare function measureJsonPlanSizes(root: string, index: RecordIndex, ceiling?: number): PlanSizeReport;
/**
 * One output line per plan: the class, the size, the path, and — for a row over
 * the ceiling — what it would take to get under it. Naming the excess rather
 * than a percentage is deliberate: "split 17 891 bytes out of this" is an
 * instruction, and "144% of ceiling" is a figure to convert first.
 */
export declare function renderPlanRow(row: PlanRow, ceiling: number): string;
