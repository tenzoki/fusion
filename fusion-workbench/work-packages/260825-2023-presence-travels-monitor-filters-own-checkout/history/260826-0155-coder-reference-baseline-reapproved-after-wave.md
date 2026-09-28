# Reference-resolution baseline re-approved for the whole first wave

**Agent:** coder
**Claim:** Kai Stalmann <ks@qantr.com> / 5e8248d7
**Date:** 2026-08-26 01:55
**Status:** Complete

## Task

Move `BASELINE` in `hooks/lib/__tests__/reference-resolution-lint.test.ts` from
`{ paths: 1409, anchors: 195 }` to `{ paths: 1411, anchors: 195 }` and prepend a
re-approval note in the form the surrounding entries use, on the same line.

## What was measured

The gate was run before the edit and reported `{ paths: 1411, anchors: 195 }`
against the pinned `{ paths: 1409, anchors: 195 }`. That agrees with the
attribution in the dispatch, so nothing else in the tree had to have moved.

The wave's four shares, each taken by reverting one file at a time against the
rest of the dirty tree:

- `bin/fusion-events` + `hooks/events-query.ts` (Turn 1 review closures): +2 paths
- `rules/workbench-tracking.md` (step 9): +4 paths, +1 anchor
- `skills/setup/SKILL.md` (step 4): +1 path and +1 anchor, one rooted heading
- `bin/monitor` (step 7): 0, 7 tokens either way

1404 + 1 + 4 + 2 = 1411, and 193 + 1 + 1 = 195.

The 1409/195 that stood in the file was written mid-wave by the step-4 task over
a tree two siblings were still writing to. The new note says it supersedes that
reading rather than contradicting it.

## Changes

- `hooks/lib/__tests__/reference-resolution-lint.test.ts` — one line, line 479.
  The note is kept on that line because the hook-test line budget is at its bound.

## Verification

`cd hooks && npm test` — exit 0. 43 files, 760 tests, all passing.
