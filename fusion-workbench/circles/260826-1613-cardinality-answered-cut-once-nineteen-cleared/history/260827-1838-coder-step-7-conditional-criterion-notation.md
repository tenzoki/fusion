# Coder: plan step 7 — a conditional criterion gets a home and a notation

**Date:** 2026-08-27 18:38
**Agent:** coder, Kai Stalmann <kai@qantr.com>
**Plan:** `circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/planning/260827-1756_*_repair-the-twenty-open-defect-records.md` step 7
**Decision:** `circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/decisions/260827-1756_*_how-does-a-checkbox-criterion-say-that-its-condition-never-arose.md`, option 2
**Status:** Complete

## What changed

- `agents/shaper.md`: spec template gains `## Stops when` between the capabilities and `## Constraints` (+177 bytes).
- `agents/planner.md`: the `## Where this Circle stops` placeholder gains one sentence naming where a measurement-conditional goes and the inline annotation (+212 bytes). The placeholder stays one angle-bracket span, so `plan-stopping-section-lint` still reads an unfilled copy as `placeholder`.
- `shared/planning/260822-1136_*` C1 criterion 7 and the C4 plan's stopping clause 7: inline `(condition did not arise: …)` clause, box left unticked.
- Record `shared/issues/260825-1250_*_a-conditional-acceptance-criterion-…` closed, `_o_` → `_c_` (the dispatch named it `_p_`; on disk it was `_o_`).
- Decision `_a_` → `_i_` with an `Implemented:` line citing the step.
- `hooks/lib/__tests__/fixtures/surface-growth.golden` regenerated per its header. The diff also carries `orchestrator.md 148245 → 148254`, a pre-existing uncommitted edit in the tree that is not this step's.

## Verification

`cd hooks && npx vitest run lib/__tests__/plan-stopping-section-lint.test.ts lib/__tests__/surface-growth-bound.test.ts lib/__tests__/workbench-citation-lint.test.ts` — exit 0 (33 tests).
