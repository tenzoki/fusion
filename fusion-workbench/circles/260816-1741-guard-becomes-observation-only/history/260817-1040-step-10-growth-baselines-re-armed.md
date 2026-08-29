# Step 10 — the growth baselines are re-armed

**Agent:** coder
**Date:** 2026-08-17
**Circle:** `260816-1741-guard-becomes-observation-only`
**Plan:** `260816-1915_*_the-compliance-guard-becomes-observation-only.md`, step 10
**Status:** Complete

## What was asked

Re-arm the growth baselines after this Circle's cut. The plan and the dispatch both said all
three surfaces in `hooks/lib/__tests__/surface-growth-bound.test.ts` shrink, and both asked for
the per-file sizes to be copied out of the regenerated golden into all three baseline maps.

## What was measured, and what it changed

Off `git`, at the commit before this Circle's first (`3d41d4a`) and at its last (`5763550`):

| Surface | `3d41d4a` | `5763550` | This Circle |
|---|---|---|---|
| `agents/*.md` | 405 229 | 405 031 | −198 bytes |
| `skills/*/SKILL.md` | 226 897 | 229 784 | **+2 887 bytes** |
| hook tests | 20 046 | 17 821 | −2 225 lines |

Only the hook-test surface was cut. `skills/` grew, and `agents/` fell by 0.05 %. Against the
2026-08-15 arming baseline the three stand at +5 188, +9 345 and −369, so `agents/` and
`skills/` were already 29 % and 47 % into their own head-room before this step ran, most of it
accumulated between the arming (`0609945`) and this Circle's start.

**So one map moved and two did not.** Copying the `agents/` and `skills/` totals in, as step 10
reads literally, would absolve 14 533 bytes of growth on the strength of a 198-byte cut — the
silent raise `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining` exists to refuse,
and the same argument the dispatch itself used to keep `rules-emission-golden.test.ts` out of
this step. Both surfaces pass their bounds untouched, and leaving them keeps their growth
visible in the next failure text instead of absorbing it. Filed as
`260817-1032_*_two-of-the-three-bounded-surfaces-grew-through-this-circle-so-only-the-hook-tests-baseline-moves.md`.

## Changes

- `hooks/lib/__tests__/surface-growth-bound.test.ts`
  - New header section `## The cleanup re-baseline, 2026-08-17 — the hook tests, and them alone`.
    It names the cut (Circle `260816-1741-guard-becomes-observation-only`, `3d41d4a..5763550`, what was removed), gives the
    three-surface measurement, states why two maps did not move, and writes down what the
    re-baseline absolves as text, per the helper's rule that the absolution survive the numbers.
  - `TEST_LINE_BASELINE` re-armed: five entries dropped for files deleted in `1d1d3a3`
    (`clear-halt-concurrent-halt`, `escalation`, `guard-escalation-shape`, `guard-halt-event`)
    and in `3c2e1c6` (`project-relative`), 1 263 lines; the 39 survivors taken at their post-cut
    sizes. Total 17 875.
  - `AGENT_BASELINE` and `SKILL_BASELINE` untouched.
- `hooks/lib/__tests__/fixtures/surface-growth.golden` — regenerated with
  `UPDATE_SURFACE_GOLDEN=1`, diff read before anything was copied.

## Head-room, before and after

| Surface | Floor before | Floor after | Head-room used before | after |
|---|---|---|---|---|
| `agents/` | 399 843 | 399 843 (unchanged) | 5 188 of 18 000 (29 %) | 5 188 of 18 000 (29 %) |
| `skills/` | 220 439 | 220 439 (unchanged) | 9 345 of 20 000 (47 %) | 9 345 of 20 000 (47 %) |
| hook tests | 18 190 | 17 875 | none (−369 under) | none (0 of 2 500) |

The hook-test surface ends with **less** room than it had: the −369 lying under the old baseline
is not banked as head-room, and the next 2 500 lines are measured from the lower floor. The
54 lines this step's own header section added to the file are inside the new baseline, on the
precedent the 2026-08-15 arming set, and are named in the header as part of what it absolves.

## Verification

`cd hooks && npm test` — exit 0. 35 files, 653 tests, all passing. First green suite of this
Circle.

`rules-emission-golden.test.ts` was not opened.
