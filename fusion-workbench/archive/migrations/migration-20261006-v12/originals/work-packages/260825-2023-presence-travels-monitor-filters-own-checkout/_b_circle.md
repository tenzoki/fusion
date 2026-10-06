# Presence travels, and the monitor reads only its own checkout

---
**Domain:** code
**Filed by:** shaper (anticipated-circle mode), Kai Stalmann <ks@qantr.com>
**Claim:** Unclaimed
**Active spec/plan:** 260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md
**Active session history:** 260825-2123-orchestrator-session.md

---

## Directive

See `**Active spec/plan:**` above. The cited spec or plan states the Directive in force.

## Grounding snapshot

**This Circle is C4 of the multi-user specification**, `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` `### C4`, and it is the last of the five. C0 through C3 have run: the four bounded surfaces have head-room, the isolation premise is verified, the four-class state partition is settled with a union merge driver on the event log, and every record template now carries a person alongside the agent. The specification's own sequence diagram makes the dependency explicit, namely that C3 must exist first because presence needs an identity to attribute a line to.

**The identity mechanism already exists and is not re-decided here.** `bin/fusion-identity` prints `PERSON=` in git's own `Name <email>` form and `CHECKOUT=` as eight hex characters minted once into `fusion-workbench/.checkout-id`, with a six-code exit table that separates the two halves. The user answered the identity question on 260824 against the option set in `260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md`: attribution takes the git identity, and the claim takes the git identity plus the locally minted checkout identifier. The specification's own text still names `$USER` in one acceptance criterion and its Constraints section; that half is stale and the decision record overrides it. This Circle inherits the answered form and introduces no second identity source.

**The event log is the only file in the workbench that two checkouts both write.** `rules/workbench-tracking.md` classifies it as class R2 and declares a union merge driver for it, which `/fusion:setup` installs per checkout. The union merge is what makes presence travel at all, and it is also what broke the readers below, so the same commit that bought the transport created the work this Circle finishes.

**Two referred defects are this Circle's inputs and were both closed with the referral, not with a fix.** `260823-1302_*_the-monitor-attributes-a-merged-event-log-to-one-session-and-reports-another-checkouts-state.md` measured four false readings on the running dashboard after a real two-checkout merge: the status label read `Session complete` while the reading checkout was working, the ETA collapsed to a dash for as long as the other checkout's clock was ahead, the paired-duration average changed with the interleaving, and the last-N-events window held the other checkout's lines while the reading session's own running task fell outside it. That record also established, by measurement, that sorting by `ts` does not repair this and makes the status label worse: no ordering of lines that carry no session or checkout identity can separate one session from another. It named a fork, which the user has now answered by choosing the identity-on-the-line direction over reading live state from an untracked file. `260823-1110_*_the-merge-driver-unsorts-a-second-event-log-reader-whose-repair-direction-is-positional.md` carries the second half of the same finding, namely that a window depending on file order does not survive the merge.

**The Turn count is the third referred input.** `260822-1136_*_two-definitions-of-the-turn-count-disagree-and-the-resume-snippet-counts-every-session-in-the-log.md` records two definitions of one figure inside `agents/orchestrator.md`: the resume snippet counts every `turn_start` in the whole file, while the derivation table defines the same number as the events since this session's `session_start`. They already disagree on any project with more than one session, and several checkouts widen the gap. The session-scoped definition is the one documented twice and is the one that survives.

**The emit sites are few and are all in one prompt.** `agents/orchestrator.md` Setup step 8 appends `session_start` with a `history_file` field, which the prompt names as the session's identity in a log where a resume appends a second such line, and the Observability section fixes the event vocabulary and the single-`echo`-append convention. `session_end` is emitted at the clean-exit step. Adding two fields is an edit to that vocabulary and to those emit sites, not a new mechanism.

**The presence surfaces already exist and are advisory today.** `skills/setup/SKILL.md` Step 0c calls `bin/fusion-session-mark check`, which reads a marker file that never leaves the checkout and therefore sees only the same-checkout case. That check is unchanged by this Circle and keeps covering what it can see. `/fusion:next` has no presence step at all today; it renders the playmaker briefing and offers activation. Both are where a person decides whether to activate a Circle, which is why the user placed the report at both.

**What the user settled in two clarification rounds, and what each answer gives up.** The event line carries the person and the checkout immediately, with the SessionStart measurement still run and the session identifier added only if it succeeds, so the Circle does not stall behind a measurement whose outcome it does not need. The monitor is repaired here rather than referred onward, by filtering on the reading checkout. A line with no checkout identifier passes as this checkout's own, which keeps the dashboard fully populated against the existing log and accepts one cost, namely that another checkout's legacy lines already merged in will read as this checkout's. The presence window is seven days. The report appears in both `/fusion:setup` and `/fusion:next`. It names other people and further checkouts of the reading person, reported separately, in the shape "1 other person, 1 further own checkout".

## Dependencies

- `260824-0530-record-attribution-and-circle-claim` (C3). Supplies `bin/fusion-identity`, the person field on records, and the Circle claim field. Presence has nothing to attribute a line to without it.
- `260823-0023-settle-what-travels-between-checkouts` (C2). Supplies the four-class state partition, the union merge driver on the event log, and the two referred defects named in the Grounding snapshot above.
- `260822-1921-measure-what-two-checkouts-share` (C1). Verified the isolation premise the whole sequence rests on.

## Turn log

- Turn 1 (session 260825-2123-orchestrator-session.md): commits `73ca11c`..`b11bec6`; Coherence verdict not recorded, the session was interrupted before its Turn boundary; session history: `260825-2123-orchestrator-session.md`
- Turn 2 (session 260825-2123-orchestrator-session.md, resumed 260826-0447): commits `7ae6aae`..`8fb42ce`; Coherence verdict `ok`, three edges, Artifact↔Directive read as partially toward on two named counterexamples since removed; session history: same file
- Turn 3 (same session): commits `6deeb33`..`bb5d92f`; Coherence verdict `review-needed` at Phase 3, `revise Artifact` taken, then `review-needed` again at the confirmation pass with `revise Grounding` taken; session history: same file

**The Turn log was empty until closure and is written here in one act, from `fusion-workbench/orchestrator-events.jsonl` rather than from memory.** That is the failure `shared/issues/260801-2038_*` was filed on, met a seventh time by the Circle that spent three Turns on counts it also failed to keep. Nothing measures a frozen Turn log since the state-file counters were removed on 2026-08-15.

## Activation proposal (playmaker run 260825-2051-playmaker-direct-dispatch.md)

**Proposed for activation** as the next Circle, at the ranking made 260825-2051-playmaker-direct-dispatch.md. It is the only
anticipated record in the portfolio, and both Step-3 signals are clean rather than merely
uncontested.

**Dependencies: all closed.** The three Circles named in `## Dependencies` above each resolve to a
directory whose record carries `_c_`, so nothing this Circle rests on is still moving.

**Unresolved decisions cited in the Grounding snapshot: none.** Every record the snapshot cites
resolves against the live store. The identity question it inherits carries `_i_`, and the three
defect records it names as inputs carry `_c_`. The one citation carrying `_o_` is
`260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, the specification this
Circle is capability C4 of, and an open specification is the expected state for the last capability
of five rather than a blocker.

**What activation would inherit that is not clean, and it sits outside this Circle.** Twenty-three
open or answered decision records are stranded inside four terminal Circles, and nine open defect
records were filed into `shared/issues/` on 260825. None of them binds this Directive, and none is
in any agent's scan set while no Circle is active. Activating this Circle brings its own store into
scope and leaves the stranded ones where they are.

**Run identifier:** playmaker session `260825-2051-playmaker-direct-dispatch.md`, logged at
`260825-2051-playmaker-direct-dispatch.md`.

**No marker was renamed and `.active-circle` was not written.** The user commits this proposal via
`/fusion:next`, or the orchestrator does at a Phase 4 activation.

## Closure note

**Bounded Closure (`_b_`), and the Directive was reached.** The two are not in
tension and the marker needs the sentence: `_b_` is written because the
three-edge verdict did not pass and a Rebalance ran, not because the Directive
proved unreachable. All four of its clauses hold, verified at closure. Presence
is reported at `/fusion:setup` and `/fusion:next` over a seven-day window,
counting other people and further checkouts separately and stating that the
report covers only what this checkout has pulled. `bin/monitor` serves
`/api/dashboard` from this checkout's lines alone, measured against a seeded
workbench. The Turn count has one definition and one implementation,
`bin/fusion-events turns`, read by all five sites. And
`git ls-files fusion-workbench | awk -F/ 'NF==2'` returns the same three entries
it returned before the Circle, so nothing that stays in the checkout became
tracked.

All eleven plan steps are `[DONE]` and the plan is closed. All ten clauses of
`## Where this Circle stops` were put to the user at the Phase-4 gate and all ten
were answered *holds*. Session history:
`260825-2123-orchestrator-session.md`.

**The Bounded-Closure Artifact is a measurement the Directive did not ask for.**
Seven counts stated in this Circle's own prose about its own mechanism were false
at some later HEAD. Each was found by a pass that came after the one that missed
it; no gate found any. Two of the fixes wrote the next instance, one of them
being `6deeb33`, whose commit subject is *"the count of emit templates, of
Turn-count sites and of SessionStart commands is right in every place that states
it"* and which rewrote the line carrying the seventh without seeing it. One
instance sat in `rules/workbench-tracking.md`, the file this Circle designated as
the single authoring home for the repair, put there by step 9 of its own plan
counting the readers step 8 had just made four.

The seventh instance is what closes the argument. A sixth pass swept every count
word within 110 characters of the mechanism's vocabulary, 108 candidate lines
read one at a time, found nothing, and stated its own boundary honestly. The
seventh pass found an instance *inside* that declared scope: `A half that did not
resolve` for a set of three, two lines below a heading that states its
cardinality by naming its three members. A cardinality can be carried by `half`,
`pair`, `both`, `either` or by a bare enumeration, and a count-word sweep is
blind to all of it. So the pattern is not carelessness in one Circle and it is
not fixable by another pass: the eighth would find the eighth.

That is recorded as an open question rather than corrected an eighth time:
`260826-1252_*_how-does-this-project-keep-a-cardinality-stated-in-prose-true-when-seven-passes-could-not.md`,
four options, no recommendation, and the empty recommendation says why. The user
chose that route at the Rebalance gate over correcting the word.

**The session-identifier measurement, recorded because criterion 7 passes
vacuously otherwise.** It came back positive on all three questions: the
SessionStart payload carries a non-empty `session_id`, plain stdout from a
SessionStart hook reaches the model verbatim, and `session_id` is non-empty on
PreToolUse and PostToolUse. Both branches of step 11 were therefore taken. One
negative result stands inside that positive answer and must not be lost in it:
`hookSpecificOutput.systemMessage` reaches the user and never the model, so a
delivery built on it would emit correctly, log as a successful hook and put
nothing in front of the model. `hookSpecificOutput.additionalContext`, the
obvious clean implementation, was **not** measured and deliberately not used.

**Sixteen defect records stay open and are the follow-on Circle's inheritance.**
Five need hook-test lines the surface does not have; the growth bound stands at
20 349 of 20 375 and the analyst's reserve of further cut candidates is unspent.
Two await a user direction call (`260826-0154_*_the-reference-pin-shaped-a-comment-away-from-naming-a-path-and-the-vagueness-is-the-gates-doing.md`, `260826-0158_*_a-staging-list-built-by-a-shell-pipeline-over-git-status-is-the-directory-sweep-the-rule-forbids.md`). The rest are the
Turn 3 review's findings, the confirmation pass's seventh count, and the
resumption-conflation record. None falsifies a Directive clause, which is why
none blocked closure.

**Review coverage over `73ca11c..bb5d92f`:** 20 commits, 4 reviews. Every commit
that touched shipped code falls inside a review's declared range. The uncovered
remainder touches only `fusion-workbench/`, being three review filings, the plan
closure and this closure's own commits. No release tag was pushed over this
range, so criterion 10's precondition is discharged rather than deferred.
