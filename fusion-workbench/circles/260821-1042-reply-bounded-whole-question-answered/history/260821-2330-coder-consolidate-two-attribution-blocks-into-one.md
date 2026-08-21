# Consolidate the two attribution blocks above BASELINE into one

**Status:** Complete
**Agent:** coder
**Circle:** 260821-1042-reply-bounded-whole-question-answered, Turn 3
**Date:** 2026-08-21

## What the task was

Give back as much as honestly possible of the ten hook-test lines this Circle spent on two attribution comment blocks above `BASELINE` in `hooks/lib/__tests__/reference-resolution-lint.test.ts`, without losing the attribution those blocks carry. Filed as `circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2204_o_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md`.

## What was changed

One file, `hooks/lib/__tests__/reference-resolution-lint.test.ts`, plus the regenerated golden. The ten comment lines at `:905-914` became six at `:905-910`. No `BASELINE` value, no assertion, no `BASELINE_MESSAGE`, and no baseline map moved. No test was added.

Confirmed first that the ten lines were the whole of this Circle's contribution to the surface: `git diff --numstat e764637 HEAD -- hooks/` lists three files and only this one is a `.ts` under `lib/__tests__`, at 11 insertions and 1 deletion. Nothing else was available to cut, and comments predating this Circle were left alone.

## What the consolidated note keeps and what it drops

Kept, because a future re-approver needs each of them: the date stamp, the file and the two sections edited, the Circle and the two steps, that both edits land in one commit, which token moved which class with the per-class before and after, that no other rewrite in either step carries a token, that no scanner, exemption or class changed, and how each step was attributed.

Dropped, because consolidation makes them duplicates: the second date stamp, the second naming of `rules/user-facing-output.md`, the second attribution sentence, and the two separate statements of which classes did not move, which became one triple.

One wording change is a correction rather than a cut. The two blocks described different attribution methods, a whole-file revert for step 2 and the removal of one sentence for step 3. The consolidated note says "Attributed per step by undoing that edit", which is true of both, where a single "reverting that file" would have been false of step 3.

Lines are packed to at most 117 columns, which is the widest comment line the file carried before this Circle (`:560`, 117). The two blocks removed ran to 123.

## Measurements

```
$ find hooks/lib/__tests__ -name '*.ts' | xargs cat | wc -l
20360
$ node -e '<sum TEST_LINE_BASELINE from surface-growth-bound.test.ts>'
17875           # + TEST_LINE_HEAD_ROOM 2500 = 20375 budget
```

Head-room 15, where it stood at 11 before this task and at 21 at HEAD `e764637`. Four of the ten lines recovered.

Five lines was tested and rejected. Reaching it costs either the "prefix-resolved" detail on the anchor delta, or the descriptor naming what `## Length` gained, or the attestation that no scanner, exemption or class changed. Each is a fact a re-approver would otherwise have to re-derive, so the note stops at six.

The remaining gap of six lines is the note itself and is not recoverable while the file's attribution convention holds: this Circle moved the pin, a pin move gets a written note, and only a note costing zero lines would satisfy the stopping criterion as written.

## Verification

```
$ cd hooks && npm test
Test Files  40 passed (40)
     Tests  718 passed (718)
exit 0
```

The first run failed as expected on `surface-growth-bound.test.ts` alone, because the golden still carried the old line count. Regenerated per the golden's own header with `UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts`, which rewrites the file and then fails on purpose. Its diff is two lines, the file entry `reference-resolution-lint.test.ts 1432` to `1428` and the surface `total 20364` to `20360`, and nothing else.

## Record updated

`circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2204_o_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md` carries an appended progress note and stays open (`_o_`). The head-room was not restored to the anchor's 21, so the record was not closed; what it now holds is the closure-note decision, whether to state 15 lines of head-room or to keep the criterion the Circle cannot meet.

Nothing was staged and nothing was committed.
