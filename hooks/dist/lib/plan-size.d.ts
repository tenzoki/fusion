/**
 * Plan size — the ceiling from `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` `### C5`,
 * reported and never enforced.
 *
 * ## What this measures and why the measurement exists
 *
 * The spec that removed the per-commit filing obligation kept one bound on what
 * may still be written: a plan is the fattest artifact in the store a dispatch
 * is pointed at, and no other record kind has that property. A plan that needs
 * more room than the ceiling is two plans.
 *
 * ## What it does NOT do, and that half is the ruling
 *
 * The ceiling is carried in **no exit code**, this module is wired into **no
 * gate and no pipeline**, and nothing here rewrites, splits or refuses a plan.
 * That was ruled at the user gate, in
 * `260909-1700_*_does-the-plan-size-ceiling-fail-hard-or-only-report.md`
 * (option 1, report only): no plan has a measured reader, so a hard bound here
 * would be the first in that cut enforced without one, which is the shape the
 * spec refuses everywhere else. It joins `bin/fusion-staging-drift`,
 * `bin/fusion-review-coverage` and `bin/fusion-citation-check`, none of which
 * has been promoted to a gate, and it carries their stdout-verdict rule: the
 * verdict is a line of output, where a reader can see which row produced it.
 *
 * ## The ceiling is chosen, not measured, and it says so
 *
 * `DEFAULT_CEILING` is a policy value. It is **not** a threshold read off a
 * measurement of readers, because no such measurement exists — the decision
 * above says so in as many words. What it was chosen against is only this: a
 * ceiling above every plan in the corpus prints the same verdict forever and
 * tells a reader nothing, so it sits below the corpus fusion itself was
 * carrying when the helper was written. `--ceiling <bytes>` re-reads the same
 * corpus at any other number, which is what makes a wrong choice cost a line of
 * stdout rather than an argument with this file.
 *
 * ## The corpus, and a duplication this header owns rather than hides
 *
 * Live (`_o_`/`_p_`) plans in every planning store, shaper specs excluded. That
 * is the same corpus `hooks/lib/__tests__/plan-stopping-section-lint.test.ts`
 * builds for its own gate, and the two definitions are separate copies: that
 * one is test-scoped and this one ships, and folding either into the other
 * would move a green gate for a reason this step does not have. The residual is
 * recorded here rather than discovered later, the way `bin/fusion-prose-metric`
 * records its own fence-rule duplication.
 */
/**
 * The ceiling, in bytes. Chosen, not measured — see the header. Below every
 * plan but one in the corpus fusion carried on 2026-09-10, so the verdict says
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
    /** Live planning files excluded from `rows` because they are shaper specs. */
    skippedSpecs: number;
    /** `over` when at least one row is; `under` with a non-empty corpus; `empty` otherwise. */
    verdict: "over" | "under" | "empty";
}
/** `YYMMDD-HHMM_S_<topic>.md` — the marker letter, or null if the name is not of that shape. */
export declare function markerOf(base: string): string | null;
/**
 * A shaper spec rather than a planner plan, by the shaper's own two template
 * signatures (the `spec-` topic prefix and the `# Spec:` H1), either sufficient.
 * A spec is not a plan and the ceiling is not about it.
 */
export declare function isSpec(base: string, firstLine: string): boolean;
/** Every planning store under the workbench: each Circle's, plus the shared one. */
export declare function planningStores(root: string): string[];
/**
 * Measure the live plans under `root`'s workbench against `ceiling`.
 *
 * Rows come back largest first, so the reader meets the plan the verdict is
 * about before the ones it is not. A file that cannot be read is skipped rather
 * than counted as zero: a zero would report a plan as comfortably under a
 * ceiling nobody measured it against.
 */
export declare function measurePlanSizes(root: string, ceiling?: number): PlanSizeReport;
/**
 * One output line per plan: the class, the size, the path, and — for a row over
 * the ceiling — what it would take to get under it. Naming the excess rather
 * than a percentage is deliberate: "split 17 891 bytes out of this" is an
 * instruction, and "144% of ceiling" is a figure to convert first.
 */
export declare function renderPlanRow(row: PlanRow, ceiling: number): string;
