# Classify `.fusion-setup` and close the tracked-workbench section's scope

**Agent:** coder
**Date:** 2026-08-15
**Status:** Complete
**Sources:** `shared/issues/260812-0758_c_fusion-setup-is-gitignored-in-a-consumer-…md`,
`shared/issues/260810-0504_c_the-tracked-workbench-section-re-enumerates-a-closed-list-…md`

## What was wrong

`rules/fusion-workbench-conventions.md` `### Which of them a tracked workbench tracks` split the
root-anchored surfaces into records and live state and left `.fusion-setup` in neither. Two records
describe that gap from opposite sides: one from a consumer where the marker was gitignored and fusion
was therefore silently inert after a clone, one from a review noting the split was neither disjoint-
and-complete nor scoped.

## What changed

One file, two sentences, +366 bytes.

1. **Scope, declared by exclusion.** The section now says it ranges over *every root entry outside
   the artifact directories* (`circles/`, `shared/`, `archive/`, `stilwerk/`, which are simply
   tracked). It previously said "the root-anchored surfaces", which was already false of its own
   membership: `portfolio.md`, `monitor` and `.active-circle` sit above the root-anchored block in
   the tree and were classified all the same. Exclusion rather than enumeration is what keeps this
   from being a second copy of the tree's closed list — the defect the second record filed.
2. **`.fusion-setup` classified as a record**, with the consequence of the other choice stated in the
   same bullet: it is the marker every agent and hook walks up to find, so a clone without it halts
   every agent at Setup and silences every hook — set up in appearance, inert in fact.

Membership now matches scope exactly: records are `orchestrator-events.jsonl`,
`.guard-state/events.jsonl`, `portfolio.md`, `.fusion-setup`; live state is `agentstate.yaml`,
`orchestrator-live.md`, the rest of `.guard-state/`, `.commit-lock/`, `.session-marker`,
`.active-circle` and `monitor`. Ten root entries, two groups, no overlap and no remainder.

## Not done, deliberately

The second record's fix directions 2 (move the section to `rules/workbench-stash-and-lock.md`) and 3
(add the two Plane runtime files) are moot: that rule file no longer exists and the Plane mirror was
removed on 2026-08-15. Its part 3 — that this section is emitted to sixteen agents that never consume
it — stands unaddressed. The consumer project's own `.gitignore` line is that project's to fix.

## Verification

`cd hooks && npm test` — exit 0, 751 passed, run in a detached worktree carrying only this patch.

The one deliberate side effect: `hooks/lib/__tests__/fixtures/rules-emission.golden` was regenerated
(`UPDATE_RULES_GOLDEN=1`), because it pins the per-file byte sizes of exactly this file. The diff is
this file's size and the fifteen agent totals, each +366, and nothing else. No baseline moved, so the
growth bound was not cleared — it absorbed 366 of its head-room.

One flake seen and dismissed: `fusion-commit-lock.test.ts`'s reaped-creator case timed out at 30 s
under full-suite parallel load and passes in 3.7 s alone, and again in the full re-run.
