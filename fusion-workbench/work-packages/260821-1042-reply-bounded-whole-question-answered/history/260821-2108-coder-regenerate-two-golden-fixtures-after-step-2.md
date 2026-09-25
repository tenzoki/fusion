# Regenerate the two golden fixtures step 2 moved, so the suite is green at each step

**Date:** 2026-08-21
**Agent:** coder
**Status:** Complete
**Circle:** `260821-1042-reply-bounded-whole-question-answered`
**Plan step:** none. A deliberate departure from step 6 of `260821-1805_*_plan-reply-bounded-whole-question-answered.md`, decided by the user at a gate.
**Base commit:** `58aae9b`

## Why this ran outside the plan

The plan's Testing Strategy regenerates the rules golden once, at step 6, so that one number
movement reaches a reader instead of three. The user chose green-at-each-step instead, accepting
three fixture diffs rather than one, so that every commit is green and individually revertible.
This is the recorded reason, not a drift to be corrected back.

## What changed

Two fixture files, and nothing else.

1. `hooks/lib/__tests__/fixtures/rules-emission.golden`, regenerated with
   `cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts`.
   The run rewrites the fixture from live measurement and then fails on purpose, which is the
   documented behaviour and what forces the second run without the flag.
2. `hooks/lib/__tests__/fixtures/surface-growth.golden`, regenerated with
   `cd hooks && UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts`.
   Same deliberate failure, same second run.

Both commands come from the two tests' own headers, `## Updating the golden` in each.

## The diffs, read before they were accepted

**Rules golden**: 30 insertions, 30 deletions, two lines in each of the fifteen agent blocks.
`user-facing-output.md` moves 20 144 -> 20 787 in every block, and every block total rises by
exactly 643:

```
analyst, planner, taskplanner    99 900 -> 100 543
bugfixer, coder, coderev, consultant, curator, editor,
ontocoder, ontorev, reconciler   95 066 ->  95 709
orchestrator                    119 476 -> 120 119
playmaker                       113 813 -> 114 456
shaper                          118 647 -> 119 290
```

No filename entered or left any block, no block gained or lost a line, and the fixture header is
untouched. That is the shape the task named, and the diff contains nothing else.

**Surface golden**: one file entry and one surface total.

```
reference-resolution-lint.test.ts  1 422 -> 1 428
total                             20 354 -> 20 360
```

Nothing else in that fixture moved.

## The one figure that did not match what I was told

The task named the `hook-tests` surface as 20 354 -> 20 363 lines, `+9`. **The tree measures
`+6`, to 20 360.** Step 2's attribution comment is 6 lines and adds no blank neighbours:
`git diff` on `hooks/lib/__tests__/reference-resolution-lint.test.ts` is 7 insertions against 1
deletion, the deletion being the `BASELINE` line it replaces.

The error is in step 2's own history log
(`260821-2035-coder-close-the-three-routes-out-of-the-length-cap.md`, `## Measurements`),
which reports "20 354 -> **20 363 lines**, the six-line attribution comment plus its blank
neighbours". The comment is there and is six lines; the blank neighbours are not. The tree and
the regenerated golden agree at 20 360. **That log was left as written**, because this task's
scope is the two fixture files. Somebody should correct the number.

The rules-golden figure was checked the same way and does match: 20 144 -> 20 787 is +643.

## No baseline moved

`RULE_BASELINE` in `rules-emission-golden.test.ts`, the three baseline maps in
`surface-growth-bound.test.ts`, and `helpers/growth-bound.ts` are each byte-identical to `HEAD`,
checked with `diff <(git show HEAD:<path>) <path>` on all three files. A golden records what the
tree measures; a baseline records what the tree is allowed to measure from, and it moves only at
the two events authored in `helpers/growth-bound.ts`
`## Re-baselining: the two events at which a baseline moves`. Neither event happened here.

All four growth bounds passed before this task and pass after it. The always-on rule set stands
at 95 709 bytes against the 98 573 budget, 2 864 bytes of head-room, unchanged by a regeneration
that never touches the reference it is measured from.

## Verification

```
$ cd hooks && npm test
Test Files  40 passed (40)
      Tests  718 passed (718)
exit 0
```

Before the regeneration the same command was `2 failed | 38 passed (40)`, both failures the
golden-fixture mismatches this task closed.

## What this did not do

- `rules/user-facing-output.md` was not touched. Step 2's edits stand as written.
- No baseline map was edited.
- No whole-tree git command was run. The working tree's three uncommitted step-2 edits survive;
  every comparison used `git show HEAD:<path>`.
- Nothing was staged and nothing was committed.
