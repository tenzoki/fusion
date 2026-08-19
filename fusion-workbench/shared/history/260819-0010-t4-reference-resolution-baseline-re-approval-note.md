# T4 — the re-approval note for the already-bumped reference-resolution baseline

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-19

## What was asked

`hooks/lib/__tests__/reference-resolution-lint.test.ts` carried a `BASELINE` already changed
in the working tree to `{ paths: 1152, anchors: 148, records: 101 }`, with no re-approval
comment above it. The file's own convention is a written note per re-approval, naming the
change, the per-file measurement and any interaction effect. Numbers were verified upstream
and were not to be touched.

## What was done

Added a 25-line re-approval block immediately above `const BASELINE`, following the register
and level of detail of the three blocks above it (the last of which ends `records did not
move.`, now false and the tail the new block follows). It records:

- the change: `### Which of them a tracked workbench tracks` moved out of
  `rules/fusion-workbench-conventions.md` into the new `rules/workbench-tracking.md`,
  realising decisions `260816-0711_*_...` and `260816-1707_*_...`;
- the movement, paths 1142 -> 1152 and records 97 -> 101, anchors unmoved, and how it was
  measured (detached worktree at HEAD `52b1d95`, five files' working-tree versions only,
  `agents/*.md` at HEAD so the concurrent prompt work contributes nothing);
- the five per-file contributions;
- that the paths contributions sum to +16 against an actual +10, the excess being interaction
  and not error — a revert also dangles the citations OF the reverted file, which is the
  effect the v10.2 block above already names;
- that two contributions are negative for the same reason seen from the other side: reverting
  the conventions file restores the old subsection with its `260811-1534_*_...` record
  citation (records 102), and reverting `skills/archive/SKILL.md` restores two citations of
  the old conventions anchor (anchors 150).

One correction to the dispatch's own wording, made deliberately rather than transcribed. The
dispatch attributed `hooks/lib/staging-drift.ts`'s zero contribution to its changed citations
repointing to a bare file path that was already a counted token. That reason is not the
operative one: `surface()` pushes every `hooks/lib/*.ts` with `recordsOnly: true`, so classes
(a) and (b) are never read there at all and that file could not have moved paths or anchors
whatever it cited. The note states the verified reason and keeps the repointing as the
description of the edit.

## Second file touched, outside the stated scope

The dispatch said to touch only the lint test. Adding 25 lines to it changed the `hook-tests`
surface inventory, so `hooks/lib/__tests__/fixtures/surface-growth.golden` had to be
regenerated with the mechanism's own documented command
(`UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts`) or the
suite stays red. The regeneration moved exactly two lines —
`reference-resolution-lint.test.ts 1050 -> 1075` and `total 18403 -> 18428` — verified against
a pre-regeneration copy, so no concurrent agent's work was captured in it. Regenerating the
golden moves no baseline and clears no bound; the `hook-tests` head-room assertion passes on
its own.

## Verification

`cd hooks && npx vitest run` — exit 0. 36 test files, 672 tests, all passing.

## Files changed

- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/reference-resolution-lint.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/surface-growth.golden`

Not committed, per the dispatch.
