# coder — Turn 2: Rebalance re-entry opens at Gate 1; stub cites by starred path

**Date:** 260827-2105-coder-turn-2-rebalance-re-entry-and-stub-citation.md
**Agent:** coder
**Circle:** 260826-1613-cardinality-answered-cut-once-nineteen-cleared
**Status:** Complete

## Implemented

1. `rules/orchestrator-rebalance.md` `#### Rebalance bounding`: the re-entry rule now opens every re-entry (Revise Artifact Turn, `paused_at_task` resume, re-run Phase-3 verdict, Revise Directive through Step 0b.1) at Gate 1; Gate 2 is reached from Keep it only. Cites `rules/critical-stance.md` §4. The "both claims" residual sentence now points at the first sentence of the paragraph. 17 174 -> 17 198 bytes.
2. `agents/orchestrator.md` `### Rebalance Gate`: decision cited by starred path; "every re-entry opens at Gate 1" appended to the reachability sentence. 148 559 -> 148 749 bytes (+190).

Closed `260827-2042_*_the-rebalance-re-entry-opens-at-gate-2…` and `260827-2042_*_the-orchestrators-rebalance-stub-cites-a-decision-stamp…` (`_p_` -> `_c_`, `Resolved:` appended).

## Verification

`cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts lib/__tests__/reference-resolution-lint.test.ts` — exit 1. Two failures, both in `reference-resolution-lint`: the BASELINE pin (received paths 1508 / anchors 212 against 1506 / 212) and an unclassified `$SRC` root in `skills/archive/SKILL.md:195`, an uncommitted edit that is not mine. Single-file revert: reverting `rules/orchestrator-rebalance.md` alone gives 1507, reverting `agents/orchestrator.md` alone gives 1508; my delta is paths +1, anchors 0. BASELINE and `surface-growth.golden` untouched per dispatch.
