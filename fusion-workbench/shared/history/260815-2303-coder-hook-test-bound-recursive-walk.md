# Coder — the hook-test bound walks its own tree

**Stamp:** 260815-2303
**Agent:** coder
**Status:** Complete
**Source record:** `260815-1935_*_the-hook-test-growth-bound-reads-two-directories-and-a-test-file-in-a-third-runs-unbounded.md`
**Files changed:** `hooks/lib/__tests__/surface-growth-bound.test.ts`, `README-hooks.md`

## What the defect was

The `hook-tests` surface collected its file list with two non-recursive `readdirSync` calls
— `__tests__/` and a hard-coded `helpers` — while vitest loads the tree recursively. A
`.ts` test file one level deeper ran on every suite invocation and was measured by nothing,
so the surface whose whole point is bounding the growth of the test suite was blind to the
cheapest way to grow it. The issue demonstrated it with 3 002 lines against a head-room of
2 500, all twelve bound assertions green.

## What changed

1. `hooks/lib/__tests__/surface-growth-bound.test.ts`, the `hook-tests` `files()` — one
   `readdirSync(here, { recursive: true })` filtered to `.ts`, replacing the two reads. The
   `helpers` literal is gone, so the reader no longer carries the written-down list its own
   doc comment says it exists to refuse. Node's recursive read returns directory entries
   too; the `.ts` filter drops them, and `fixtures/` holds no `.ts` today.
2. `README-hooks.md:394`, `## What no bound covers` — the coverage sentence said the
   surface counts the suite's `.ts` files "`hooks/lib/__tests__/helpers` included", which
   described the two-directory reader and left a subdirectory of the suite on neither side
   of the enumeration. It now names the recursive walk.

The edit is **line-neutral by construction**: nine lines out, nine lines in (five of code,
four of comment recording why the walk is recursive). That is not incidental. The surface
measures this file, and the golden fixture records its size at 576 lines — a net change
here would have forced a golden regeneration, which is a third file and outside this task's
file set. Holding the count fixed keeps the measured figure identical and no baseline moved.

## Verification

`cd hooks && npm test` — exit 0, run in a detached `git worktree` at `d33cd22` carrying
only these two files, because the main tree holds a concurrent executor's edit to
`agents/orchestrator.md` (−1 byte) whose golden has not been regenerated, and that
unrelated mismatch fails the `agents` surface in the main tree.

Two properties checked beyond the suite passing:

- **Recursion.** A one-line `.ts` file placed at `__tests__/unit/probe.ts` in that worktree
  made the golden assertion report `unit/probe.ts 1` and a total of `19454`. The old reader
  saw nothing there. Probe removed.
- **No movement today.** Without the probe the `hook-tests` total measures `19453`, the
  figure at the 2026-08-15 arming, and the golden block matches byte for byte.
