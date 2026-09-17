# The CLAUDE.md cut banked 85 KB of slack into a bound whose header says head-room is zero

---

`hooks/lib/__tests__/fixtures/dispatch-path.baseline` charges `CLAUDE.md` to all eleven dispatch
paths at a row value of 93 432 bytes. `CLAUDE.md` measures 8 114 bytes today. Every row therefore
stands 85 318 bytes above what its path measures, on a bound whose own header states `HEAD-ROOM IS
ZERO. This is not a budget.` The instrument is green over a fleet that could absorb 78 022 bytes of
new always-on text without failing.

---
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260909-1633_*_the-zero-sum-bounds-baseline-is-armed-at-the-moment-that-absolves-the-cut-it-must-measure.md, 260916-1126_*_implementation-human-facing-docs-leave-claude-md.md, 260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md

## The measurement

Taken at `f0aa5b77` by running `bin/fusion-rules <agent>` from the repository root for each of the
eleven agents and summing the three components `dispatchComponents` sums
(`hooks/lib/__tests__/rules-emission-golden.test.ts` `## The dispatch-path bound`): the prompt, every
emitted rule path, and `CLAUDE.md`.

| path | total now | baseline row | distance |
|---|---|---|---|
| curator | 149 044 | 227 066 | 78 022 |
| reviewer | 110 237 | 189 012 | 78 775 |
| analyst | 119 922 | 198 789 | 78 867 |
| editor | 123 396 | 202 739 | 79 343 |
| planner | 123 014 | 202 428 | 79 414 |
| consultant | 118 035 | 197 679 | 79 644 |
| ontocoder | 106 474 | 191 869 | 85 395 |
| coder | 102 764 | 188 256 | 85 492 |
| reconciler | 116 741 | 206 384 | 89 643 |
| shaper | 131 744 | 250 768 | 119 024 |
| orchestrator | 208 910 | 380 065 | 171 155 |

The binding figure for a byte added to a rule file every agent loads is the minimum column, 78 022.

## Why this is a defect and not the bound working as designed

The fixture header already reasons about exactly this quantity and sizes it at 2 039 bytes: it
records that the `reviewer` row keeps the shared `CLAUDE.md` figure of 93 432 rather than the 91 393
then measured, and calls the difference `head-room in CLAUDE.md that all eleven rows have`. Holding a
shared component's row steady across a 2 039-byte drift is the argument the header makes. It is not
an argument for 85 318.

`README-hooks.md` `### Growth bounds on the shipped text` states the principle this crosses: `A cut
does not bank its own savings as head-room.` The user ruled the same point for the rate surfaces on
2026-09-11, that a piece of work which only cuts never re-baselines the surfaces it cut. The
CLAUDE.md reduction of 2026-09-16 was a cut, no baseline moved with it, and the effect is the mirror
image of the refused move: the floor stayed put while the measurement fell away from it, so the
surface gained room nobody decided to grant.

## The acceptance test

A change that adds N bytes to `rules/fusion-workbench-conventions.md`, which every one of the eleven
paths loads, turns `npx vitest run lib/__tests__/rules-emission-golden.test.ts` red for a value of N
that the project considers a real addition to what every dispatch reads. Today it stays green to
N = 78 022.

## What this does not decide

Whether the rows should be re-armed at the post-cut totals, and under which of the events in
`hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining` such a re-arming would sit, is a
choice with reasoning a later reader would otherwise re-derive. It belongs in a decision record, not
here. This record states only that the instrument currently measures nothing.
