# Add the missing attribution comment above BASELINE

**Status:** Complete
**Agent:** coder
**Date:** 260821-1505-attribution-comment-for-the-paths-re-approval.md

## What this was

The re-approval logged in `260821-1455-re-approve-two-text-gate-baselines.md`
moved `BASELINE.paths` from 1255 to 1257 in
`hooks/lib/__tests__/reference-resolution-lint.test.ts` and deliberately left the
file's own convention unmet: each re-approval carries a comment above `BASELINE`
naming the edit, the old and new numbers, and how the movement was attributed.
That log's closing section asked for the comment to be added before the change is
committed. This task added it and nothing else in that file.

## The comment

Eleven lines, immediately above `const BASELINE`, matching the two most recent
sibling entries in shape and line width. It records four things:

- The move: `paths` 1255 to 1257, with `anchors: 162` and `records: 115` unchanged
  because the new sentence names no heading and no record.
- The cause: the curator's applied entry L01 rewrote the `docs/` row in
  `CLAUDE.md`, and the replacement sentence cites `docs/upgrading-to-v10-3.md` and
  `docs/upgrading-to-v10-4.md` where the sentence it replaced cited no path at all.
  The row's earlier spelling, a bare filename with no directory, is not a
  plugin-tree path. Both files exist on disk.
- The attribution method, stated as the departure it is: read off the diff, not
  the revert-and-remeasure the surrounding comments describe. All three files the
  curator entry touched carried uncommitted changes belonging to another party, so
  restoring one to HEAD was never available and no per-file measurement was taken.
- The other seven changed lines, in one clause: net zero in every class.

## The second gate, and the one file outside the stated scope

Adding eleven lines to a test file turned
`hooks/lib/__tests__/surface-growth-bound.test.ts` red. That gate pins a
per-file line-count golden for the hook test suite, and its failure text names
regeneration as the expected response to a deliberate change. Regenerated with
`UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts`,
which rewrites the fixture and then fails on purpose so the flag cannot be left on
in a green run. The resulting diff in
`hooks/lib/__tests__/fixtures/surface-growth.golden` is exactly two lines, the
file's own entry (1411 to 1422) and the surface total (20343 to 20354).

**This is a departure from the dispatch, which scoped the change to one file.**
The two instructions could not both be honoured: any line added to the test file
moves the golden, and the suite cannot be green while the golden disagrees with the
tree. The fixture is machine-written and the regeneration moves no baseline, so the
`hook-tests` growth bound still applies and still passed on its own assertion. If
the departure is unwanted, reverting that one fixture file is enough to undo it.

`BASELINE`'s values, the assertion, `BASELINE_MESSAGE` and every other file are
untouched.

## Verification

`npm test` from `hooks/`, exit 0. 40 test files, 718 tests, all passing, including
both gates this change touched:

```
✓ lib/__tests__/reference-resolution-lint.test.ts (37 tests)
✓ lib/__tests__/surface-growth-bound.test.ts (12 tests)
```

The suite was also run before the edit and was green at the same numbers, so the
growth-golden failure is attributable to this change alone. The run reported here
is the one taken after this history file was written, because the citation gate
scans the workbench.

## Files changed

- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/reference-resolution-lint.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/surface-growth.golden`

No whole-tree git command was run. Nothing was staged and nothing was committed.
The uncommitted changes belonging to other parties are untouched and still present.
