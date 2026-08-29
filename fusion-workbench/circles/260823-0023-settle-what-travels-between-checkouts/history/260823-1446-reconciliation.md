# Reconciliation — C2, session-end pass

**Date:** 2026-08-23 14:46
**Agent:** reconciler
**Domain:** code
**Range:** `3ee8eaf..7cd79f1`, 19 commits, three Turns
**Circle:** `260823-0023-settle-what-travels-between-checkouts` (`_t_`)
**Verdict written to** `260823-0721-orchestrator-session.md` `## Coherence`: **review-needed**

## What was reviewed

| Store | Read | Updated |
|---|---|---|
| Plans (`$SCAN_PLANS`, both stores) | 2 | 2 |
| Defect records (`$SCAN_ISSUES`, both stores) | 27 in the Circle, 121 open in `shared/` listed by name | 2 annotated, 1 new filed |
| Decision records (`$SCAN_DECISIONS`, both stores) | 1 in the Circle, 63 in `shared/` | 1 annotated |
| Reviews (`$SCAN_REVIEWS`) | 3 | 1 annotated |
| Analyses | 1 | 0 |
| History | this Circle's 19 files, skimmed | 1 written (this file) |

No marker was moved in this pass. Every record that changed state did so during the session itself.

## Key findings

**1. The spec's C2 acceptance block was never ticked, and all seven criteria hold.**
`260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md:153-159` carried seven unticked
boxes for work that landed across the whole session, plus an unticked entry at `:242` for the decision
that blocks C2's close and now carries `_i_`. C0's and C1's blocks were ticked by earlier passes, so the
omission is C2's alone. Corrected, with each criterion opened at its own site rather than read off the
plan's `[DONE]` markers. This was the largest piece of stale tracking in the workbench.

**2. All nine plan steps are supported by the tree.** Verified individually; the table is in the plan's
own `## Reconciliation Log`. `cd hooks && npm test` at HEAD: 41 files, 724 tests, exit 0.

**3. Both decision records' `Implemented:` citations resolve.** `c9eba48` and `25f60eb` both exist and
both touch the files their notes name — `skills/setup/SKILL.md` in each case, plus
`rules/fusion-workbench-conventions.md` for the second, which is the writer-enumeration edit that record's
fourth constraint required.

**4. Twenty-two defect closures, nine sampled, all supported.** The sample was chosen to span every
commit that closed a record and both stores: `260816-1049_*_` and `260822-1028_*_the-gitignore-kept-list-names-three-tracked-records-and-the-rule-it-cites-names-four.md` (the two
the specification names, closed in `21ae170` and `00ce4f0`); `260823-0800_*_two-further-surfaces-…`
(`cc5abd7`); `260823-1110_*_the-untracked-portfolio-…` and `260823-1110_*_the-conditional-marker-write-…`
(the two release blockers, `e7454e3` and `d23c706`); `260823-1110_*_the-guard-event-log-falls-in-no-class-…`
(`18974bc`); `260823-1318_*_ten-record-citations-…` (`a2a18f9`); and `260823-1402_*_four-hard-marker-citations-…`
and `260823-1408_*_the-plan-field-now-carries-a-wildcard-…` (`7cd79f1`). Each note's central claim was
re-checked at its own site. Three checks worth naming: the `git ls-files` result and the `KEPT:` line
agree on the same three entries; the marker block at `skills/setup/SKILL.md:94` carries the
`[ -n "$V" ]` guard the note describes; and `rules/circle-records.md:274` holds the head-field citation
section the wildcard closure claims to have added.

**5. Review coverage is `uncovered`, not `covered`.** The dispatch's premise was measured before the last
two commits landed. At HEAD: `commits=19 reviews=3 unusable=0 uncovered=2 verdict=uncovered`. `1544224`
touches only `fusion-workbench/`; `7cd79f1` touches four shipped files including `rules/circle-records.md`,
which `bin/fusion-rules` emits to three roles. Under
`260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`
coverage is advisory, so this does not flag an edge — it is a residual for the closure note to name.

**6. Seven records stay open in the Circle, not four.** The dispatch named the Grounding claim, the C4
event-log reader, the monitor attribution and the shipped-check decision. Three more were filed by the
closing review at 14:03–14:06 and are exactly the ones it sequenced as time-bound:
`260823-1403_*_closing-a-circle-removes-its-open-records-from-every-agents-scan-set-and-no-closure-step-says-so.md` (closure strands the Circle's open records), `260823-1405_*_the-window-to-correct-the-groundings-false-claim-closes-with-the-circle-and-nothing-says-so.md` (the correction window
closes with the Circle), `260823-1406_*_step-0is-pointer-present-branch-reads-a-count-as-an-identity-and-a-stale-pointer-passes-both-checks.md` (Step 0i reads a count as an identity). Judgement on whether
"by intent" is honest for each is in the `## Coherence` section.

**7. The four session-bookkeeping surfaces froze again — sixth instance.** `agentstate.yaml`,
`orchestrator-live.md`, the Circle record's `## Turn log` and the session history file all describe a
state from Turn 2 or earlier, while `orchestrator-events.jsonl` is current and complete through Turn 3's
`turn_end`. The history file never received a Directive at all. Appended as measured evidence to
`260822-2236_*_the-four-session-bookkeeping-surfaces-froze-again-and-the-detection-that-closed-the-first-record-has-been-removed.md`
rather than filed again, per the duplicate rule. Three of the four are the orchestrator's Phase-4 writes
and are still reachable; the Turn-log entries for Turns 1 and 2 are the ones a later session cannot
reconstruct once the state file is deleted.

**8. The stranded-records figure was re-measured.** 75 open defect records across 10 non-active Circles,
which confirms the review's issue count exactly and corrects its Circle count. Open decisions are 12, not
19; the 19 is open plus answered, the active-Grounding filter, over four Circles. The gap is real either
way and is fusion-wide rather than this Circle's.

## New issue filed

- `260823-1446_*_the-rebalance-recommendation-maps-from-the-flagged-edge-and-has-no-case-for-a-grounding-that-states-a-false-fact.md`
  — the Rebalance recommendation keys on the flagged edge, and a Grounding that states a false fact about
  the world flags `Artifact↔Grounding`, which maps to `revise Artifact` when the correction is a Grounding
  edit. Filed to `shared/` under the Origin Rule: it is a fault in fusion's verdict mechanism, met beside
  this Directive rather than caused by it, and filing it into a Circle about to close would strand it on
  the spot.

## Misfiled — should be a decision

None found. The two candidates were checked and neither qualifies:
`260823-1403_*_closing-a-circle-removes-its-open-records-from-every-agents-scan-set-and-no-closure-step-says-so.md` and `260823-1406_*_step-0is-pointer-present-branch-reads-a-count-as-an-identity-and-a-stale-pointer-passes-both-checks.md` each state a defect with a fix direction rather than a choice point,
and the one genuine choice point the closing review found was already filed correctly as
`260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md`.

## Files changed by this pass

- `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` — eight boxes ticked, reconciliation entry appended
- `260823-0800_*_c2-what-travels-between-checkouts-is-settled.md` — `## Reconciliation Log` added
- `260822-2236_*_…` — sixth-instance measurement appended
- `260817-1836_*_…` — `Also seen:` line appended
- `260815-2109_*_…` — fourth-check evidence appended, marker unchanged
- `260823-1410-coderev-c2-turn-3.md` — annotated
- `260823-1446_*_…` — new
- `260823-0721-orchestrator-session.md` — `## Coherence` appended
