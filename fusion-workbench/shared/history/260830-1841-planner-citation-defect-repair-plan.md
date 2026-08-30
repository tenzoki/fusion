# Planner run: the citation mechanism's four defects, the tripwire, and the consumer report

**Date:** 2026-08-30
**Agent:** planner
**Status:** Complete
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Circle:** none active; everything written to the shared stores
**HEAD at start:** `cda72f71`

## What was planned

An implementation plan for four verified defects in fusion's citation mechanism, reported by the consuming project `unite-co-creator` and reproduced by the orchestrator before dispatch, plus the missing tripwire and the report the consumer is owed.

Plan: `260830-1841_*_citation-mechanism-four-defect-repair.md`. Seven steps, five to `coder` and two to `analyst`, each with its own commit and its own acceptance command.

## What was verified rather than taken on report

Every claim in the dispatch was re-run against `cda72f71` with the compiled scanner and the shipped helpers, and three findings go beyond what was reported.

1. **The missing left anchor is not one pattern but three.** `REC_RE`, `CIRCLE_RE` and `CIRCLE_REC_RE` all lack the lookbehind that `BARE_RE` and `STAMP_RE` carry, so `mycircles/<dir>` and `vendor/circles/<dir>/_t_circle.md` corrupt in exactly the way the dispatch showed for `myplanning/`. The repair is one rule applied three times.
2. **The bare-Circle-directory shape produces two overlapping hits today**, a `record` at the store segment and a `stamp-name` at column 0 that resolves. So refusing that shape outright, which both candidate boundaries in the dispatch do, would leave the checker reporting a resolving token for part of a citation it no longer reads whole.
3. **The frozen-store widening does not flip fusion's own verdict and does not move `rewrites=0`.** Measured over this repository's workbench: narrow 1694 files / 246 dangling, wide 2299 files / 311 dangling, `store-prefixed=0` in both. The two sites the rooting enumeration newly reaches are already exempt, one fenced and one by the `glob` rule, so the sweep's release gate reading is unchanged.

Also measured, because two plan steps turn on them: the hook-test surface has **448 lines of head-room left** (19 927 measured against a 17 875 floor, 2500 of head-room), and `bin/fusion-citation-sweep --dry-run` reads `rewrites=0` with `residual=2783`.

## Decision records filed

Four, all `_o_` in the shared decision store, cited from the plan's Open Questions rather than held inside it:

- `260830-1841_*_where-may-a-store-prefixed-citation-begin-and-which-rooting-forms-does-the-grammar-name.md`, the load-bearing question the plan's Decidability line names. Three options, and the recommendation is the lookbehind plus a closed rooting enumeration.
- `260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md`, the asymmetry `/fusion:migrate` leaves behind. Four options, no recommendation; it asks for a measurement first.
- `260830-1843_*_how-does-the-commit-lock-stop-leaving-the-tree-it-just-committed-dirty.md`. Four options, and the recommendation is to narrow the sweep's guard rather than touch the lock, because the other three each trade away a property `rules/commit-lock.md` mandates.
- `260830-1844_*_does-the-citation-helper-read-non-markdown-surfaces-with-the-stamp-as-the-anchor.md`, the consuming project's blocked question, roughly 950 citations on code surfaces.

## Issue filed

`260830-1845_*_staging-drift-does-not-name-asset-provenance-as-live-state-while-its-sibling-marker-is.md`. Found while weighing the commit-lock options: `LIVE_STATE` in `hooks/lib/staging-drift.ts` names `.fusion-setup` but not `.asset-provenance`, though `rules/workbench-tracking.md` places both in class R3 with one reason. Filed rather than folded into the plan; the consequence is mild, since `unclassified` is never a fault.

## Verification

- `bin/fusion-citation-sweep --dry-run` reads `rewrites=0` with every new record in the tree.
- `bin/fusion-citation-check` reads `dangling=246 store-prefixed=0`, the same as before this run.
- `npx vitest run lib/__tests__/plan-stopping-section-lint.test.ts lib/__tests__/workbench-citation-lint.test.ts` passes, 24 tests.
- `bin/fusion-prose-metric` reads `ok` on the plan and on all five new records.

Nothing was implemented. No agent was dispatched.
