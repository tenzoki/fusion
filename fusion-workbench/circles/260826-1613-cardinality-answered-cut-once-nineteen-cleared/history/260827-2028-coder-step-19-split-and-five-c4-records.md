# coder — step 19 (split) and the five C4 hook-test records

**Filed by:** coder, Kai Stalmann <kai@qantr.com>
**Date:** 2026-08-27
**Status:** Complete

## Task

Spend the 240 hook-test lines the cut (`440cad5`) freed: the three `fusion-commit-lock` cases of step 19 (the seven dispatch cases deferred by the user's split at the gate), then the five C4 records in the order the analysis sized them.

## What landed

| Item | File | Lines |
|---|---|---|
| Step 19, three commit-lock cases | `hooks/lib/__tests__/fusion-commit-lock.test.ts` | +53 |
| Citation star at `hooks-wiring.test.ts:75` | `hooks/lib/__tests__/hooks-wiring.test.ts` | 0 |
| `260826-0847` move | `guard-state-shape.test.ts` -35, `guard-bash-integration.test.ts` +30 | -5 net |
| `260826-0848` fourth SessionStart command | `hooks/lib/__tests__/hooks-wiring.test.ts` | +23 |
| `260826-0906` harness replace | `guard-bash-integration.test.ts` +4, `guard-project-config-integration.test.ts` +1 | +5 |
| `260826-0906` events-query entry point | `hooks/lib/__tests__/fusion-events.test.ts` | +85 |
| `260826-0906` monitor whole-file parse | `hooks/lib/__tests__/monitor-warnings-panel.test.ts` | +17 |

Surface: 20 135 -> 20 313 lines of 20 375; **62 lines remain**. No baseline map, golden or `BASELINE` touched.

Records: the five C4 records closed (`Resolved:`, `_o_` -> `_c_`); `shared/issues/260827-0410_o_*` gained a dated split note and stays `_o_`; plan step 19 marked `[IN PROGRESS] (split: commit-lock cases landed; dispatch cases deferred)`.

## Verification

`cd hooks && npx vitest run` — two failures, both pre-existing in the dirty tree and neither mine: `surface-growth-bound` fails only on the golden's per-file sizes for `agents/orchestrator.md` and `agents/reconciler.md` (the bound cases pass; the orchestrator regenerates the golden), and `reference-resolution-lint`'s pin reads 1506/212 against 1504/210 with my seven test files reverted to HEAD as well (hook tests are `recordsOnly` for that gate; the drift belongs to the sibling agent edits).

One presence assertion (`other_checkouts=1`) was dropped during the work: the fixture's foreign line is a `turn_start`, and presence counts session starts, so the assertion proved nothing the case was about.
