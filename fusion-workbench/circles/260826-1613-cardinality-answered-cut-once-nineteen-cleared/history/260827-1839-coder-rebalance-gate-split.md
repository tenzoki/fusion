# Coder: plan step 9, split the Rebalance gate under the three-option cap

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Plan:** `circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/planning/260827-1756_p_repair-the-twenty-open-defect-records.md` step 9
**Decision:** `circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/decisions/260827-1756_*_how-does-the-rebalance-gate-present-four-moves-under-a-three-option-cap.md` (option 2)

## What changed

- `rules/orchestrator-rebalance.md` `### Rebalance Gate`: one four-option gate became Gate 1 (Revise Directive, Accept Bounded Closure, Keep it) and Gate 2 on Keep it (Revise Artifact, Revise Grounding). Every option keeps its mechanics and gained a foreclosure line. A sentence says a reconciler recommendation is mapped onto the gates, never used to hide a branch. `#### Rebalance bounding` names Gate 2 as the re-entry point and Gate 1 as where a fresh Directive-questioning verdict or a Revise Directive re-entry lands.
- `agents/orchestrator.md`: the `### Rebalance Gate` stub now describes the two gates (+132 bytes); the Phase-2 Rebalance paragraph says "moves" rather than "choices". `four explicit options` occurs 0 times in either file.
- `rules/user-facing-output.md` untouched.
- Record `shared/issues/260825-1259_*` closed with `Resolved:` and renamed `_o_`→`_c_` (the dispatch named it `_p_`; it carried `_o_` on disk). Decision renamed `_a_`→`_i_`; its `Implemented:` line cites the plan step, not a hash, because the orchestrator commits after this dispatch.
- Golden regenerated: only `orchestrator.md 148254→148386`, `total 406118→406250`. No other agent file had moved at regeneration time.

## Verification

`cd hooks && npx vitest run lib/__tests__/surface-growth-bound.test.ts lib/__tests__/workbench-citation-lint.test.ts` exit 0 (22 passed). `grep -c "four explicit options" agents/orchestrator.md rules/orchestrator-rebalance.md` returns 0 for both.

## Residual

`shared/history/260825-1453-curator-run.md:209` cites the closed record as `260825-1259_o_*`; the citation lint passed with it, so it was left alone.
