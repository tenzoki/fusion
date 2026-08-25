# Presence travels, and the monitor reads only its own checkout

---
**Domain:** code
**Filed by:** shaper (anticipated-circle mode), Kai Stalmann <ks@qantr.com>
**Claim:** Claimed 260825-2122: Kai Stalmann <ks@qantr.com>, checkout 5e8248d7.
**Active spec/plan:** circles/260825-2023-presence-travels-monitor-filters-own-checkout/planning/260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md
**Active session history:** circles/260825-2023-presence-travels-monitor-filters-own-checkout/history/260825-2123-orchestrator-session.md

---

## Directive

See `**Active spec/plan:**` above. The cited spec or plan states the Directive in force.

## Grounding snapshot

**This Circle is C4 of the multi-user specification**, `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` `### C4`, and it is the last of the five. C0 through C3 have run: the four bounded surfaces have head-room, the isolation premise is verified, the four-class state partition is settled with a union merge driver on the event log, and every record template now carries a person alongside the agent. The specification's own sequence diagram makes the dependency explicit, namely that C3 must exist first because presence needs an identity to attribute a line to.

**The identity mechanism already exists and is not re-decided here.** `bin/fusion-identity` prints `PERSON=` in git's own `Name <email>` form and `CHECKOUT=` as eight hex characters minted once into `fusion-workbench/.checkout-id`, with a six-code exit table that separates the two halves. The user answered the identity question on 260824 against the option set in `shared/decisions/260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md`: attribution takes the git identity, and the claim takes the git identity plus the locally minted checkout identifier. The specification's own text still names `$USER` in one acceptance criterion and its Constraints section; that half is stale and the decision record overrides it. This Circle inherits the answered form and introduces no second identity source.

**The event log is the only file in the workbench that two checkouts both write.** `rules/workbench-tracking.md` classifies it as class R2 and declares a union merge driver for it, which `/fusion:setup` installs per checkout. The union merge is what makes presence travel at all, and it is also what broke the readers below, so the same commit that bought the transport created the work this Circle finishes.

**Two referred defects are this Circle's inputs and were both closed with the referral, not with a fix.** `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1302_*_the-monitor-attributes-a-merged-event-log-to-one-session-and-reports-another-checkouts-state.md` measured four false readings on the running dashboard after a real two-checkout merge: the status label read `Session complete` while the reading checkout was working, the ETA collapsed to a dash for as long as the other checkout's clock was ahead, the paired-duration average changed with the interleaving, and the last-N-events window held the other checkout's lines while the reading session's own running task fell outside it. That record also established, by measurement, that sorting by `ts` does not repair this and makes the status label worse: no ordering of lines that carry no session or checkout identity can separate one session from another. It named a fork, which the user has now answered by choosing the identity-on-the-line direction over reading live state from an untracked file. `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1110_*_the-merge-driver-unsorts-a-second-event-log-reader-whose-repair-direction-is-positional.md` carries the second half of the same finding, namely that a window depending on file order does not survive the merge.

**The Turn count is the third referred input.** `shared/issues/260822-1136_*_two-definitions-of-the-turn-count-disagree-and-the-resume-snippet-counts-every-session-in-the-log.md` records two definitions of one figure inside `agents/orchestrator.md`: the resume snippet counts every `turn_start` in the whole file, while the derivation table defines the same number as the events since this session's `session_start`. They already disagree on any project with more than one session, and several checkouts widen the gap. The session-scoped definition is the one documented twice and is the one that survives.

**The emit sites are few and are all in one prompt.** `agents/orchestrator.md` Setup step 8 appends `session_start` with a `history_file` field, which the prompt names as the session's identity in a log where a resume appends a second such line, and the Observability section fixes the event vocabulary and the single-`echo`-append convention. `session_end` is emitted at the clean-exit step. Adding two fields is an edit to that vocabulary and to those emit sites, not a new mechanism.

**The presence surfaces already exist and are advisory today.** `skills/setup/SKILL.md` Step 0c calls `bin/fusion-session-mark check`, which reads a marker file that never leaves the checkout and therefore sees only the same-checkout case. That check is unchanged by this Circle and keeps covering what it can see. `/fusion:next` has no presence step at all today; it renders the playmaker briefing and offers activation. Both are where a person decides whether to activate a Circle, which is why the user placed the report at both.

**What the user settled in two clarification rounds, and what each answer gives up.** The event line carries the person and the checkout immediately, with the SessionStart measurement still run and the session identifier added only if it succeeds, so the Circle does not stall behind a measurement whose outcome it does not need. The monitor is repaired here rather than referred onward, by filtering on the reading checkout. A line with no checkout identifier passes as this checkout's own, which keeps the dashboard fully populated against the existing log and accepts one cost, namely that another checkout's legacy lines already merged in will read as this checkout's. The presence window is seven days. The report appears in both `/fusion:setup` and `/fusion:next`. It names other people and further checkouts of the reading person, reported separately, in the shape "1 other person, 1 further own checkout".

## Dependencies

- `260824-0530-record-attribution-and-circle-claim` (C3). Supplies `bin/fusion-identity`, the person field on records, and the Circle claim field. Presence has nothing to attribute a line to without it.
- `260823-0023-settle-what-travels-between-checkouts` (C2). Supplies the four-class state partition, the union merge driver on the event log, and the two referred defects named in the Grounding snapshot above.
- `260822-1921-measure-what-two-checkouts-share` (C1). Verified the isolation premise the whole sequence rests on.

## Turn log

## Activation proposal (playmaker run 260825-2051)

**Proposed for activation** as the next Circle, at the ranking made 260825-2051. It is the only
anticipated record in the portfolio, and both Step-3 signals are clean rather than merely
uncontested.

**Dependencies: all closed.** The three Circles named in `## Dependencies` above each resolve to a
directory whose record carries `_c_`, so nothing this Circle rests on is still moving.

**Unresolved decisions cited in the Grounding snapshot: none.** Every record the snapshot cites
resolves against the live store. The identity question it inherits carries `_i_`, and the three
defect records it names as inputs carry `_c_`. The one citation carrying `_o_` is
`shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, the specification this
Circle is capability C4 of, and an open specification is the expected state for the last capability
of five rather than a blocker.

**What activation would inherit that is not clean, and it sits outside this Circle.** Twenty-three
open or answered decision records are stranded inside four terminal Circles, and nine open defect
records were filed into `shared/issues/` on 260825. None of them binds this Directive, and none is
in any agent's scan set while no Circle is active. Activating this Circle brings its own store into
scope and leaves the stranded ones where they are.

**Run identifier:** playmaker session `260825-2051`, logged at
`shared/history/260825-2051-playmaker-direct-dispatch.md`.

**No marker was renamed and `.active-circle` was not written.** The user commits this proposal via
`/fusion:next`, or the orchestrator does at a Phase 4 activation.
