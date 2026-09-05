# The merge puts two surface-growth budgets over, while neither line was over on its own

---
`surface-growth-bound.test.ts` fails on the merged tree for `skills` (175 bytes) and `hook-tests`
(391 lines). Both budgets held on each of the two merged lines separately. The bound measures a
surface's rate of addition against one baseline, and a merge adds two lines' growth to it at once,
so two independently-in-budget histories can join into one that is not.
---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## Measured

At `420b022b`, `cd hooks && npm test` — exit 1, 2 of 864 failing, both in
`surface-growth-bound.test.ts`. The other 862 pass.

| surface | budget | merge base `cda72f71` | this line `18bb1f93` | the other `7f9f2f4d` | merged |
|---|---|---|---|---|---|
| `skills/*/SKILL.md`, bytes | 240 439 | 239 833 | 240 410 | 240 037 | 240 614 |
| `hooks/lib/__tests__/**.ts`, lines | 20 375 | 19 876 | 20 374 | 20 266 | 20 766 |

The merged figure is the base plus both deltas in each row, to within the two lines the pin log's
own conflict resolution added. `skills` had 29 bytes of head-room left on this line and 402 on the
other; `hook-tests` had 1 line and 109.

## Why nothing was widened here

`helpers/growth-bound.ts` `## Re-baselining: the two events at which a baseline moves` allows a
baseline to move after a cut or at an arming, and a merge is neither. The one cut the instrument
itself sanctions for this surface — rolling the older `BASELINE` re-approval entries out of
`reference-resolution-lint.test.ts` into a workbench analysis — frees at most 7 lines against the
391 owed, so it does not reach.

## The acceptance test

A cut in `skills/*/SKILL.md` of at least 175 bytes and in `hooks/lib/__tests__/**.ts` of at least
391 lines, after which `cd hooks && npm test` exits 0 with the baselines untouched. They are two
budgets, so the two cuts are independent and neither pays for the other.

Filed as one record because the cause is one event and the remedy is one act of cutting; the two
figures and their two acceptance conditions are stated separately above.

## The question this leaves open

Whether a bound whose subject is a rate of addition should be evaluated against a merge at all is
not answered here, and is not this record's to answer. What is measured is that it currently is,
and that the failure names no edit anybody made.

---
Resolved: 260905-1839-coder-the-third-re-baselining-event-and-the-fence-correction.md `## What changed` — the question this record left open was answered as a third re-baselining event (`260905-1810_*_does-a-growth-bound-re-baseline-after-a-merge-of-two-lines-that-were-each-inside-it.md`, option 2), so no cut was owed and this record's acceptance test does not apply. `SKILL_BASELINE` and `TEST_LINE_BASELINE` moved to the merged tree's per-file figures, with the merge commit, both parent figures and the parents-inside check written into `hooks/lib/__tests__/surface-growth-bound.test.ts` `## The merge re-baseline, 2026-09-05`. All four figures per surface were re-measured off `git` and match the table above.
