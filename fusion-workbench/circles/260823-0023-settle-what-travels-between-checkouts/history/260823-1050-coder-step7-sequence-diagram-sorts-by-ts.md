# Coder — C2 step 7: the Phase-4 sequence diagram sorts by `ts`

**Date:** 2026-08-23
**Status:** Complete
**Plan:** `circles/260823-0023-settle-what-travels-between-checkouts/planning/260823-0800_*_c2-what-travels-between-checkouts-is-settled.md`, step 7
**Agent:** coder

## What changed

Two sites in `agents/orchestrator.md`, per the step's own split between the instruction and the format contract.

1. The Phase 4 `### Sequence Diagram` step (found at line 876; the plan's number held). It now reads the event log, sorts the lines by their `ts` field, and builds the diagram from the sorted events.
2. The Observability section's `### 3. Post-Session Sequence Diagram`, first bullet of `**Rules for the diagram:**`. It requires the same sort and carries the reason in one clause: after a union merge the log is no longer chronological, so a positional read produces a diagram that is wrong rather than untidy. It also states that `ts` is fixed-width `%Y-%m-%dT%H:%M:%S`, so a lexicographic sort of the field is a chronological sort and no date parsing is needed. The format's missing `Z` designator therefore costs this consumer nothing, unlike the `new Date()` consumers `CLAUDE.md` records.

The Turn count was left untouched. `agents/orchestrator.md:91`'s `grep -c` over `turn_start` is order-independent, and the defect that governs it is assigned to C4.

## Measurement

`agents/` head-room after the edit: **14 787 bytes** of the 18 000 (total 403 056 against a floor of 399 843, so 3 213 bytes of recorded growth). The edit cost 392 bytes against the 15 179 that stood at `cc5abd7`.

## One file outside the named one

`hooks/lib/__tests__/fixtures/surface-growth.golden` moved, because `surface-growth-bound.test.ts` holds the golden in exact equality with live measurement and a byte change to any bounded surface reddens it. Regenerated with `UPDATE_SURFACE_GOLDEN=1`, which the test's own header prescribes; the diff is two lines, `orchestrator.md 151733 → 152125` and `total 402664 → 403056`. No baseline moved, so the bound still applies at its original figure — the golden records the growth rather than absolving it.

## Verification

`cd hooks && npm test` — exit 0. 41 files, 724 tests, all passing.
