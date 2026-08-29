# Coder: Bundle B step 16, the layout tree's consumer column

**Dispatch:** step 16 of `260827-1756_*_repair-the-twenty-open-defect-records.md`, record `260826-1332_*_the-layout-trees-consumer-column-omits-the-event-log-reader-this-circle-built.md`.
**HEAD at start:** 3cb2cba. **Status:** Complete.

## What changed

- `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`: `orchestrator-events.jsonl` row gains `bin/fusion-events (hooks/events-query.ts)`, `hooks/lib/orchestrator-events.ts`, `bin/fusion-commit-lock`; `agentstate.yaml` row gains `bin/fusion-session-domain`, `hooks/lib/orchestrator-events.ts` and the parenthetical names events-query; new `.cadence-anchors` row with `bin/fusion-cadence-anchor`. +250 bytes (49 851 -> 50 101), under the step's estimate.
- Column check: `grep -n 'fusion-workbench/' hooks/*.ts hooks/lib/*.ts bin/*`, with comment-only mentions set aside (bin/fusion-cadence-anchor's exclusion list names every root file but reads only its own; hooks/session-id.ts, guard.ts, events.ts, fail-open.ts mention paths in docstrings only). The four non-comment consumers not in the tree are listed above. bin/monitor was not re-audited: it builds paths from a `fusion-workbench/` root and its rows already name it.
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE`: 1477/207 -> 1508/208. Pre-edit reading of the dirty tree 1501/208; this step's single-file revert gives +7 paths, 0 anchors. Note on the line states the stale-at-HEAD +22/+1, playmaker's +2 and Bundle B's siblings' 0.
- `hooks/lib/__tests__/fixtures/rules-emission.golden` regenerated (`UPDATE_RULES_GOLDEN=1`); diff is the conventions size and the totals only.
- Issue renamed `_p_` -> `_c_` with a `Resolved:` note; plan step 16 marked `[DONE]`.

## Verification

`cd hooks && npx vitest run lib/__tests__/reference-resolution-lint.test.ts lib/__tests__/rules-emission-golden.test.ts lib/__tests__/workbench-citation-lint.test.ts` — exit 0 (62 passed).
