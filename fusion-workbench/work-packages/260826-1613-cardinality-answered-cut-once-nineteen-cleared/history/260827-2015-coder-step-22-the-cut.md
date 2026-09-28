# Coder session: plan step 22, the one measured cut

**Date:** 2026-08-27 20:15
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Plan:** `260827-1756_*_repair-the-twenty-open-defect-records.md`, step 22
**Analysis:** `260827-1843-cut-candidates-for-skills-and-the-hook-tests.md`, sections 4 to 6
**Status:** Complete

## What was done

- `skills/`: S1 to S5, as approved. Step 1 of `skills/setup/SKILL.md` is the STOP line and a pointer to `$FUSION_SRC/rules/orchestrator-resume.md`; Step 0e keeps its eight cases, the precedence and the one-question rule, and its three bash blocks became one prelude plus a classification block plus one replace-or-stamp block with `MODE`; the two `$FUSION_SRC` paragraphs keep the read/run split and cite decisions `260820-2324` and `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md` instead of narrating them. `skills/archive/SKILL.md` keeps the destination path, the rolled-not-selected sentence and both citations under *Rolling the guard event log*, and the "empty derivation is an error" rule under `shared_of`.
- Hook tests: R1 (three `growth()` cases duplicated in `surface-growth-bound.test.ts`), R4 (the duplicated `OUT_MEMO` case), N1 to N8 header shrinks with the keeps the analysis names (N1 points at `helpers/guard-harness.ts` `openCoverageGap`; N7 keeps "WHY CASE 5 EXISTS" whole). No assertion beyond R1 and R4 moved; the movement and arming logs, `legacy-halt-clearing.test.ts` and `hook-fail-open.test.ts` were not touched.
- Bookkeeping: `fixtures/surface-growth.golden` regenerated (`UPDATE_SURFACE_GOLDEN=1`, then run without); no baseline map moved; `reference-resolution-lint.test.ts` `BASELINE` re-approved 1513 -> 1504 paths, anchors unmoved at 210, shares measured by single-file revert (setup -8, archive -1, hook tests 0). Plan step 22 marked `[DONE]`.

## Measured (gate readers' arithmetic, `helpers/growth-bound.ts`)

| Surface | Before | After | Freed | Free now |
|---|---|---|---|---|
| `skills/` (bytes; budget 240 439) | 240 351 | 233 738 | 6 613 | 6 701 |
| hook tests (lines; budget 20 375) | 20 374 | 20 135 | 239 | 240 |

Against the analysis: `skills/` clears the drafted need of 5 986 but lands 387 short of the 7 000 margin it recommended; the keeps it names bound the cut, and S6 to S8 were not approved. The hook tests freed 239 of the ~249 the ten approved candidates were estimated at; the "290+" figure belonged to a group that also held N10, N12 and N14, which were not in the dispatch.

## Verification

`cd hooks && npx vitest run` — 44 files, 773 tests, exit 0.
