# The reference-resolution pin is re-approved for the new bounded-dispatch rule file

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

## What was asked

Re-approve the pinned reference count in `hooks/lib/__tests__/reference-resolution-lint.test.ts`
and rewrite the comment beside it, after step 5 of the plan
`260907-1450_*_plan-bounded-executor-dispatches.md` added `rules/bounded-dispatch.md`. One file
in scope, no other baseline, no whole-tree git command, no edit to the new rule file.

## What was done

`BASELINE` moved from `{ paths: 1713, anchors: 237, stampBare: 14 }` to
`{ paths: 1721, anchors: 242, stampBare: 14 }`. The assertion is unchanged: still an exact
equality on the same three counters, never widened into a floor or a range. The comment beside
it was rewritten **in place**, one line replacing one line, so the hook-test surface gained no
line; the previous approval's whole text was demoted to the `Previous:` tail the line already
carries, per the roll-never-drop rule in that block's header.

## What was verified

The movement was re-measured here rather than taken from the dispatch:

1. Gate on the working tree: received `{ paths: 1721, anchors: 242, stampBare: 14 }` against the
   pinned `1713/237/14`.
2. Single-file revert against the full tree: with `rules/bounded-dispatch.md` moved aside the
   gate resolves `1713/237/14` and passes; restoring it reproduces the received numbers. So the
   whole movement is that one file's, and no share is owed to the five changed workbench records
   in the same tree, which are outside this gate's scanned surface anyway.
3. The eight paths and five anchors were then enumerated against the file and match the measured
   deltas exactly: the rules helper, the file's own rooted self-citation, and the six unit-table
   rows, five of which put a heading beside the file they cite while the bugfixer row names a
   span of phases instead.
4. `stampBare` could not move: the file's only stamp-shaped token is the Circle directory name in
   its Provenance head field, which the grammar classifies as `stamp-name` and not as the bare
   kind this pin counts.
5. No growth baseline moved and none had to, measured: `rules-emission-golden.test.ts` and
   `surface-growth-bound.test.ts` both pass on this tree. The new rule file is a conditional
   emission and never part of the always-on floor, and at this tree `bin/fusion-rules` does not
   yet emit it to anybody, so neither golden carries it.

Verification: `cd hooks && npx vitest run lib/__tests__/reference-resolution-lint.test.ts` — exit 0
(38 tests passed). `cd hooks && npm test -- reference-resolution` — exit 0 (38 tests passed).

## Files changed

- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/reference-resolution-lint.test.ts`
