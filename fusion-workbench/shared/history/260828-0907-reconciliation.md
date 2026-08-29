# Reconciliation — 260828-0907

**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Session:** `260828-0846-orchestrator-session.md`, Phase 3; domain `code`; no active Circle; range `65cf23be..ffc6ae88` (2 commits); Turn count 1 (`bin/fusion-events turns`, scope=checkout).
**Inventory bound:** `bin/fusion-cadence-anchor changed-files last_reconcile_commit` (anchor `36cd5744`) named 126 paths; all but nine are the tier-1 archive sweep of `56a47c40` (terminal `_c_`/`_i_`/`_s_` records, re-verified by marker, not reopened) or history files.

## Counts

- Plans reviewed 2, updated 0: `shared/planning/260822-1136_o_spec-*` (Partially Complete; last reconciled `c1ce7d39`, untouched since) and `circles/260826-1613-*/planning/260827-1756_p_*` (step 19 `[IN PROGRESS]`, log entry 260828-0044 current; `hooks/lib/__tests__/fusion-commit-lock.test.ts` still carries the landed cases, `shared/issues/260827-0410_o_*` still names the deferred ones). Both answers unchanged; nothing appended.
- Issues reviewed 6 live (`260827-0410_*_the-machine-written-event-rows-ship-with-wiring-asserts-only-because-the-hook-test-surface-is-full.md`, `260828-0044_o_`, `260828-0828_*_fusion-citation-bookkeeping-defect-report.md`, `260828-0853_*_setup-step-0j-misses-a-class-l-entry-that-is-untracked-but-not-ignored.md`, `260828-0900_*_twelve-shipped-lines-tell-a-consuming-agent-that-one-of-fusions-own-records-sits-in-its-scan-store.md`, `260828-0901_*_the-archive-safety-filter-greps-the-literal-basename-and-cannot-match-the-wildcard-citation-form-the-rule-mandates.md`), updated 4 (the session's four, evidence appended), renamed 0.
- Decisions reviewed 40 active (30 `_a_`, 10 `_o_`), updated 5 (`260828-0904_o_*`, searched-without-answer note), renamed 0.
- Reviews: none filed this session; none annotated.
- New issues filed: 1 (`shared/issues/260828-0907_o_the-scan-store-self-citation-count-is-sixteen-at-head-*`).

## Findings

- Directive clause 1 verified on disk: `.gitignore:91` excludes `fusion-workbench/.cadence-anchors`; `git check-ignore -v` resolves it; every other class L root entry named in `rules/workbench-tracking.md` is excluded (`.gitignore:81-97`). Commit `19b58eef`.
- Directive clause 2 verified: report carries `_o_` and a fence at lines 112-118 (`19b58eef`); analysis, two analyst issues, five decisions and the analyst history exist with the content the session log claims (`ffc6ae88`).
- Issue `260828-0853_*_setup-step-0j-misses-a-class-l-entry-that-is-untracked-but-not-ignored.md_*` claim verified: `skills/setup/SKILL.md:378` reports only tracked class L entries.
- Issue `260828-0901_*_the-archive-safety-filter-greps-the-literal-basename-and-cannot-match-the-wildcard-citation-form-the-rule-mandates.md_*` claim verified: `skills/archive/SKILL.md:199` greps the literal basename with `-F`.
- **Drift:** issue `260828-0900_*_twelve-shipped-lines-tell-a-consuming-agent-that-one-of-fusions-own-records-sits-in-its-scan-store.md_*` says twelve lines; sixteen stand at HEAD (`agents/orchestrator.md:435,511,516,550` unlisted), and its acceptance grep matches 14, missing two listed lines. Annotated on the issue and the five decisions; filed as `260828-0907_*`. The analysis's Instance 2 and Finding text carry the same figure; not edited (analysis descriptions are not mine to rewrite).
- Marked done that wasn't: none. Done but not marked: none.
- Misfiled, should be a decision: none.
- Cross-references worth the orchestrator's eye: decision `260828-0904_o_does-the-mandated-citation-form-*` names issue `260828-0901_*_the-archive-safety-filter-greps-the-literal-basename-and-cannot-match-the-wildcard-citation-form-the-rule-mandates.md_*` as the filter that must recognise whatever form is chosen; no plan step scopes either yet.
