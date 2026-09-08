# Coder — resolving the merge's three measurement records

**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <kai@qantr.com>
**Circle:** `260907-0829-message-between-checkouts-read-before-pull`
**Merge:** `git merge origin/main`, base `abcaa823`, ours `9b61a9a4`, theirs `43fe1bc1`

## Task

Resolve the three conflicts an in-flight merge left standing, and get `hooks` green.
All three are records of a measurement, so none was resolved by choosing a side.

- `hooks/lib/__tests__/fixtures/rules-emission.golden`
- `hooks/lib/__tests__/fixtures/surface-growth.golden`
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` (the `BASELINE` pin)

## What was read first

`hooks/lib/__tests__/helpers/growth-bound.ts`, `## Re-baselining: the three events at
which a baseline moves`. The third event is a merge, and it is conditional in two ways
this resolution had to check rather than assume: it applies only to a bound that is
**over**, and only when **each parent was inside its own bound at its own head**. On the
merged tree no bound is over, so the event was not reached and **no growth baseline
moved**. Nothing in the file contradicted the dispatch.

## Method

1. The two goldens were regenerated on the merged tree with their own documented
   failing-on-purpose runs (`UPDATE_SURFACE_GOLDEN=1`, `UPDATE_RULES_GOLDEN=1`), then
   re-run without the flag and read against both parents. Neither was hand-edited.
   Each came out the **exact union** of the two parents' diffs, with no third change.
2. The `BASELINE` pin was resolved by leaving this checkout's figure in place and
   running the assertion once so it reported its received counts on the merged tree.
   The merged figure is that measurement: **paths 1691, anchors 237, stampBare 14**.
3. One merge re-approval entry was written. Both parents' entries stand below it,
   unedited; the chain they shared below the 2026-09-06 v10.24 entry appears once.

## The counts

| | base `abcaa823` | this checkout | concurrent checkout | merged (measured) |
|---|---|---|---|---|
| paths | 1646 | 1686 (+40) | 1651 (+5) | **1691** |
| anchors | 227 | 233 (+6) | 231 (+4) | **237** |
| stampBare | 14 | 14 | 14 | **14** |

The merged figure **equals the sum of the two moves**, and that was checked against the
measurement rather than substituted for it: 1646 + 40 + 5 = 1691, 227 + 6 + 4 = 237.
The equality was not free — both lines edit `skills/setup/SKILL.md`, so a citation one
side added could have stopped resolving under a file the other side moved.

## The four bound measurements on the merged tree — all inside

| surface | measured | budget | free |
|---|---|---|---|
| always-on rule core | 73 317 bytes | 77 498 | 4 181 |
| `agents/*.md` | 414 334 bytes | 417 843 | 3 509 |
| `skills/*/SKILL.md` | 259 495 bytes | 260 614 | 1 119 |
| hook tests | 22 014 lines | 23 266 | 1 252 |

Parent figures, recorded for a later merge that may need them (core / agents / skills /
hook tests): this checkout 73 317 / 413 225 / 259 060 / 22 014; the concurrent checkout
73 000 / 414 334 / 247 918 / 21 748. Each parent was inside its own bound.

The non-failing role budget reports two roles over on `rules/circle-records.md`
(playmaker, shaper). That report arrived with the concurrent line and was left standing:
a cut is not a merge resolution's to choose.

## Not folded in

The stale doc-comment citation in `rules-emission-golden.test.ts` ("the two events"
where the helper defines three), filed as
`260908-0104_*_a-doc-comment-cites-two-re-baselining-events-while-the-helper-defines-three.md`.
Left untouched so the resolution contains the merge and nothing else.

## Line counts

`reference-resolution-lint.test.ts` stands at 1005 lines, as at both parents' heads —
the `BASELINE` line is rewritten in place. `rules-emission-golden.test.ts` is untouched
at its pinned 1154.

## Verification

`cd hooks && npm test` — exit 0. 53 test files, 924 tests, all passed, first run.
The load-sensitive harness failures recorded in the two open defect records were not met.

## Files changed

- `/Users/k1/Projects/productive/fusion-news/hooks/lib/__tests__/fixtures/rules-emission.golden`
- `/Users/k1/Projects/productive/fusion-news/hooks/lib/__tests__/fixtures/surface-growth.golden`
- `/Users/k1/Projects/productive/fusion-news/hooks/lib/__tests__/reference-resolution-lint.test.ts`

The three were staged (`git add`, under `bin/fusion-commit-lock`) to mark the conflicts
resolved. Nothing was committed; the merge commit is the user's.
