# Two generated artefacts re-derived on the merged tree

**Agent:** coder
**Date:** 2026-09-08
**Status:** Complete

## Task

After a rebase that replayed this checkout's twenty commits onto another checkout's
sixteen, two generated artefacts described neither side's tree: the surface-growth golden
and the reference-resolution pin. Both were re-derived here. No baseline moved and no
other file was touched.

## What changed

**`hooks/lib/__tests__/fixtures/surface-growth.golden`** — regenerated with the command in
`surface-growth-bound.test.ts`'s own header (`UPDATE_SURFACE_GOLDEN=1`), which fails on
purpose, then re-run without the flag. The whole diff is the `skills` block: eight bodies
smaller (archive, cleanup, curate, direct, help, migrate, next, setup), one added
(`post/SKILL.md`, 7 347 bytes), total 259 712 -> 259 732. The `agents` and `hook-tests`
blocks were byte-identical to the merged tree already and did not move.

**`hooks/lib/__tests__/reference-resolution-lint.test.ts`** — `BASELINE` re-approved from
`{ paths: 1727, anchors: 245, stampBare: 14 }` to `{ paths: 1721, anchors: 253,
stampBare: 14 }`, the comment beside it rewritten in place with no line added and the
previous approvals carried into the `Previous:` tail.

## Attribution, and its bound

The attribution is **not** a single-file revert, because the movement belongs to no edit:
it is the difference between two histories that were never measured together, and neither
tree the two pinned numbers were approved on still exists. What was checked instead:

1. Every other case in the gate file passes, so each reference in the merged tree
   resolves — the corpus changed, not its correctness.
2. The other checkout's sixteen commits touch fifteen files, thirteen inside the gate's
   scanned surface.
3. A re-count of the class-(b) adjacency form across those files, merge base to merged
   tree, gives exactly +8 (new skill body +5, newer doc +2, archive skill +2, CLAUDE.md
   +1, portfolio skill -1, setup skill -1) — exactly the 245 -> 253 movement.
4. The same recount over the path shape reads -5 against the gate's -6, and is recorded
   as indicative rather than decisive: a grep applies none of the gate's exemptions.

## Head-room, checked and reported

`cat agents/*.md | wc -c` = **417 145**. `AGENT_BASELINE` sums to 399 843, `AGENT_HEAD_ROOM`
is 18 000, so 417 843 is allowed and **698 bytes** of head-room remain. Unmoved from the
figure the dispatch carried. For completeness: skills 259 732 against 260 614 allowed
(882 bytes); hook tests 22 533 lines against 23 266 allowed (733 lines).

## Verification

- `cd hooks && npm test -- surface-growth` — exit 0
- `cd hooks && npm test -- reference-resolution` — exit 0
- `cd hooks && npm test` — exit 0, 55 files / 948 tests, no failures
- `bin/fusion-citation-sweep --dry-run` — exit 0, `rewrites=0`

The three intermittent harness-spawning tests named in the dispatch (`staging-drift`,
`fusion-commit-lock`, `guard-state-shape`) all passed in this run.
