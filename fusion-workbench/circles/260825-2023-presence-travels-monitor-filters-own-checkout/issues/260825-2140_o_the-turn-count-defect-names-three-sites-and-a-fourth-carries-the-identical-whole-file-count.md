The Turn-count defect names three sites and a fourth carries the identical whole-file count

---
`shared/issues/260822-1136_*_two-definitions-of-the-turn-count-disagree-and-the-resume-snippet-counts-every-session-in-the-log.md`
declares `**Affects:** agents/orchestrator.md:91, :496, :1060` and was closed with
`Resolved: referred (C4)`. A fourth site carries the same `grep -c '"event":"turn_start"'` over
the whole file, in `skills/setup/SKILL.md` Step 1 sub-step 2, and no record names it. An executor
working from the referred record alone repairs three sites of four and leaves the interrupted-session
prompt of `/fusion:setup` reporting the project's lifetime Turn count as the interrupted session's.
---
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Severity:** Medium. The omitted site is the one a user meets through `/fusion:setup`, which is the
documented entry point for a session, so it is at least as reachable as the three that were named.
**Cross-references:**
`shared/issues/260822-1136_*_two-definitions-of-the-turn-count-disagree-and-the-resume-snippet-counts-every-session-in-the-log.md`
(the closed record whose stated reach is short);
`circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1110_*_the-merge-driver-unsorts-a-second-event-log-reader-whose-repair-direction-is-positional.md`
(the note that the proposed positional repair does not survive the union merge);
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/planning/260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`
step 5, which repairs all four sites through one implementation

## What was measured

Read at HEAD on 260825. Four sites carry or define the Turn count:

| Site | Form |
|---|---|
| `agents/orchestrator.md` Setup Step 1 sub-step 3 | `grep -c '"event":"turn_start"'` over the whole file |
| `agents/orchestrator.md` Phase 2 step 3 | prose: the `turn_start` events since this session's `session_start` |
| `agents/orchestrator.md` Persistent State File, derivation table | the same prose definition |
| `skills/setup/SKILL.md` Step 1 sub-step 2 | `grep -c '"event":"turn_start"'` over the whole file |

The fourth is byte-for-byte the same command as the first, down to the surrounding explanation of
why `grep -c` is captured into a variable rather than branched on. The referred record names three.

## Why the omission is worth a record of its own

The closed record's reasoning does not reach the fourth site, so this is not a `Revised by:` note on
it. `/fusion:setup` and `agents/orchestrator.md` are two renderings of one procedure, and a defect
found by reading one of them is filed against that one. Nothing in either file says the other carries
a copy, and nothing measures the pair. That is the property that let one rendering be repaired and
the other left, twice: the `session_start` emit is the same shape and is filed separately.

## Direction, not a prescription

Repairing the fourth site in isolation would produce a fourth definition. The plan cited above routes
all four through one implementation, `bin/fusion-events turns`, so the count has one definition that
is executable rather than four that are prose.
