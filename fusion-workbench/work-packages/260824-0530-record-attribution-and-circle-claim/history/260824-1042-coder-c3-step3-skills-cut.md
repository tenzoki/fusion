# Coder — C3 step 3: cut `skills/` to pay for steps 9 and 10

**Status:** Complete
**Task:** Plan step 3 of `260824-0613_*_c3-attribution-on-records-and-a-claim-on-the-circle.md`
**Executor:** coder

## What was measured before choosing

Every skill body against `SKILL_BASELINE` in `hooks/lib/__tests__/surface-growth-bound.test.ts`
(baseline total 220 439, head-room 20 000, budget 240 439; surface stood at 240 237, so 202 bytes
free). Per-file delta over baseline: `setup` +13 860, `help` +3 936, `direct` +1 450, `archive`
+1 149, `migrate` +374, `log-activity` +5, `commit` 0, and five bodies below their baseline
(`memo` -316, `curate` -274, `cadence` -262, `cleanup` -93, `next` -31). The growth is 70 per cent
one file, so the cut was taken entirely in `skills/setup/SKILL.md` and no other body was touched.

## Result

`skills/setup/SKILL.md` 49 245 → 44 324 bytes (-4 921). Surface 240 237 → 235 316. Head-room
5 123 bytes, against the 2 000 the step asked for and the 2 000 steps 9 and 10 together budget.

Twenty-two passages, each spent reasoning: an authoring home's own text restated under a citation
of it, the history of a fixed defect, an obituary for a removed mechanism, or a rationale for an
instruction that stands verbatim beside it. No instruction, condition, branch, bound, literal,
path or exit-code reading was removed.

## Gate-forced records

- `hooks/lib/__tests__/fixtures/surface-growth.golden` regenerated (`UPDATE_SURFACE_GOLDEN=1`).
  Regeneration moves no baseline.
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE` re-approved with an inline
  accounting block: paths 1295 → 1291, anchors 181 → 180, records 118 → 117.

**No growth-bound baseline moved.** `surface-growth-bound.test.ts` is untouched, which keeps
`260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md` open.

## One thing the next executor needs

The lint re-approval added 6 lines to the hook-test surface: 20 187 → 20 193 lines against a budget
of 20 375, so plan step 5's remaining head-room is **182 lines**, not 188. Its 180-line cap still
fits, with 2 lines of slack.

## Verification

`cd hooks && npm test` — exit 0 (41 files, 724 tests passed).
