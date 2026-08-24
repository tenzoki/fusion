# Coder, plan step 8: `docs/`, `README*`, `CLAUDE.md`

**Status:** Complete
**Plan:** `circles/260824-1853-close-every-open-defect/planning/260824-1905_p_plan-close-every-open-defect.md` step 8, triage rows 14, 54, 56, 107, 110, 120, 129, 140, 160.

## What changed

- `CLAUDE.md`: Turn-budget row places the check-in at the start of a Turn (row 56); `docs/` row says `/fusion:help` carries the last three releases with a standing pointer to `docs/` (row 107); the doubled full stop in the Circles bullet is one (row 54); release step 0 gains the `bin/fusion-review-coverage --since <previous tag>` line, advisory per decision `260815-2109` (row 14); the between-releases paragraph states the two-session shape for a Circle that builds and proves an agent (row 129); a `rules/review-contract.md` Layout row, conditional emission to `coderev` and `ontorev` behind `IS_REVIEWER_AGENT` (row 120).
- `README-agents.md`: the Turn-budget paragraph places the check-in at the start of a Turn (row 56); the roster preamble names three multi-line values and bounds `**Initiated by:**` at the next `**<Keyword>:**` line or the end of the parameter block, and its row says so (row 140); "One side loop" (row 160; the `bin/fusion-rules` half of that record is step 7's).
- `docs/upgrading-to-v9.md`: the preamble splits four dead-file checks from the two silent behaviour changes, check 2 and check 3 (row 110).

## Measurement

`bin/fusion-prose-metric CLAUDE.md`: 126 em-dashes before, 126 after (words 9180 → 9498).

## Verification

`cd hooks && npm test` exit 1. Three files red. Two are not mine and were red for the parallel hook-test executor: `surface-growth-bound.test.ts` (hook-tests head-room) and `domain-cascade.test.ts`, which passes when run alone. One is caused by this step: `reference-resolution-lint.test.ts` pins the number of resolved path references at `paths: 1318`, and the citations added here move it to `1325`. Measured by restoring the three files to HEAD and re-running: 37/37 pass without them, so the +7 is entirely this step's. The test's own message says re-approving the baseline is the expected response, but that file is under `hooks/`, which another executor holds, so it is reported rather than edited: `BASELINE.paths` 1318 → 1325, anchors unchanged at 188.

The three named lints alone (`derivable-enumerations-lint`, `reference-resolution-lint`, `workbench-citation-lint`): 66 pass, 1 fail, the pinned-count assertion above.

## Records closed

Nine `_o_` → `_c_` renames, listed in the report.
