# Shaper session: capturing C4 of the multi-user specification as an anticipated Circle

**Date:** 2026-08-25
**Agent:** shaper (anticipated-circle mode)
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Result:** `circles/260825-2023-presence-travels-monitor-filters-own-checkout/_a_circle.md`

## The draft

"Fähigkeit C4 der Multi-User-Spezifikation als Circle anlegen", dispatched through `/fusion:direct`. The draft named a capability in an existing specification rather than a fresh idea, so the shaping work was to read what C4 already commits to, find where it is under-specified, and put those gaps to the user.

## What was read

`shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, principally `### C4` and its Reconciliation Log; the two referred defects from C2, `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1302_*_the-monitor-attributes-a-merged-event-log-to-one-session-and-reports-another-checkouts-state.md` and `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1110_*_the-merge-driver-unsorts-a-second-event-log-reader-whose-repair-direction-is-positional.md`; the referred Turn-count defect `shared/issues/260822-1136_*_two-definitions-of-the-turn-count-disagree-and-the-resume-snippet-counts-every-session-in-the-log.md`; the answered identity decision `shared/decisions/260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md`; the header of `bin/fusion-identity`; the event emit sites and Observability section of `agents/orchestrator.md`; `skills/setup/SKILL.md` Step 0c; and `bin/monitor`'s session-boundary and ETA logic.

## The gaps that were put to the user, and what was decided

Two rounds, six questions, all six answered.

**Round 1.** The specification made the person on the event line conditional on nothing but made the session identifier conditional on a measurement, and it left three surfaces open. The user chose: person and checkout identifier go on the line immediately, the measurement still runs, and the session identifier joins them only if it succeeds; this Circle repairs the monitor rather than referring it onward, by filtering on the reading checkout; the presence window is seven days; the report appears in both `/fusion:setup` and `/fusion:next`, because both are where activating a Circle is decided.

**Round 2.** Two consequences of the first round needed their own answer. Event lines already in the log carry no checkout identifier, and the monitor has to do something with them: the user chose to pass them through as this checkout's own, keeping the dashboard fully populated and accepting that another checkout's legacy lines already merged in will read as this one's. And the presence report has two possible subjects, since the checkout identifier distinguishes one person's two checkouts as well as two people: the user chose both, reported separately, in the shape "1 other person, 1 further own checkout".

## One correction carried into the Grounding snapshot

The specification's C4 and its Constraints still name `$USER` as the attribution source. That is stale: the user answered the identity question on 260824 in favour of the git identity read from `bin/fusion-identity`, with a locally minted checkout identifier beside it for the claim. The specification's own Reconciliation Log records the staleness for C3's criterion; the Circle record states it once more so the planner does not read the older form as binding.

## What was not decided, and why no record was filed

Nothing was deferred. Every question raised in the two rounds was answered in the round it was asked, so no decision record belongs to this run. Whether the presence report merely informs or also gates activation was left to the existing mechanism rather than re-opened: C3 already ships the claim field, and `/fusion:next` already refuses a Circle claimed by somebody else, so presence is the softer signal beside a gate that exists.

## Next step

Activation is the user's separate act, through `/fusion:next`. No planner was dispatched and no Turn loop was entered.
