# Portfolio

**Generated:** 260822-2104 (by playmaker session 260822-2104-playmaker-direct-dispatch)
**Domain bias:** code
**git HEAD at run:** `d2b374e`

**This run holds no user confirmation.** It was dispatched directly with a `**Domain:**` line and no
`**Confirmed operations:**` block, so it ranked, regenerated this file, and checked whether either
live backlog marker needed moving. It split, merged, closed and deferred nothing. One deferral is
proposed below and waits on the user, unchanged from the previous run.

**Every path in this file carries `_*_` where a state marker would stand.** The rule is
`rules/circle-records.md` `### Citation form in the portfolio`, and the previous generation broke it
in one place: an activation-proposal sentence spelled `_a_`, the Circle was activated twelve minutes
later, and the citation resolved to nothing. That is filed as
`shared/issues/260822-2050_*_the-portfolio-generator-spelled-a-marker-again-and-the-citation-died-at-the-next-transition.md`
and appears under Warnings below. It stays open: it is about the generator, not about this file.

## Active (_t_)

**`260822-1921-measure-what-two-checkouts-share`**, record
`circles/260822-1921-measure-what-two-checkouts-share/_*_circle.md`.

*What two checkouts of one project actually share, measured rather than assumed.*

The user activated it through the explicit form of `/fusion:next` after the previous run recommended
it, and `.active-circle` names the directory. The record's `## Turn log` is empty, so no Turn has run
yet. Its head fields both read `(none yet)`, which is a known inconsistency rather than a gap in the
Circle: see the head-fields warning below. The only history the Circle holds so far is the shaping
pass that created it,
`circles/260822-1921-measure-what-two-checkouts-share/history/260822-1921-shaper-measure-what-two-checkouts-share.md`.

What it runs on is cited in its own `## Grounding snapshot` rather than in the head field: capability
`### C1` of `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`. Closure is an
analyst report plus an addendum to
`shared/decisions/260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md`,
whose closing paragraph today records the multi-user arrangement as chosen but not proven.

## Anticipated (_a_) — ranked

**(none).** The workbench holds no anticipated Circle. The one that stood here last run is the active
Circle above, and activating it emptied the section. No activation proposal was written this run,
because there is nothing to propose and no Circle record needed a write of any kind.

Three anticipated Circles could exist and do not. C2, C3 and C4 of the same specification are still
prose only, which is the `spec-circles-unfiled` warning below. Filing one is `/fusion:direct`, and it
is the user's act.

## Backlog — ranked

**Recommended to shape: `shared/backlog/260814-1733_*_bounded-executor-dispatches.md` — the only live
idea that needs no user act before it can be shaped.**

    /fusion:direct shared/backlog/260814-1733_*_bounded-executor-dispatches.md

**Live and ranked (2).** Both markers already match this run's ranking, so no rename was made. The
ranking is unchanged from 260822-2040, and so is the single proposal under it.

1. **`shared/backlog/260814-1733_*_bounded-executor-dispatches.md`** (recommended, marker `_p_`).
   Bound how long an executor runs before returning to the orchestrator. One idea, promotable whole.
   Its evidence is on disk and already sized:
   `shared/analyses/260812-0303-simplify-speed-and-why-rules-do-not-hold.md` adopts the
   bounded-dispatch half of the user's filed proposal at roughly a fourfold saving in re-sent tokens,
   and refutes the re-injection half by finding that the rules were never in force rather than that
   they decayed over a long dispatch. Shaping it means putting a Directive narrower than the filed
   wording to the user and getting agreement on the narrowing, which is the conversation
   `/fusion:direct` holds. Nothing is proposed for this entry.

2. **`shared/backlog/260814-1733_*_attach-the-rule-to-the-act.md`** (open, marker `_o_`). A rule lands
   with an executable check or it does not land. One idea, second on shapeability rather than on
   merit. The obstruction is unchanged and was re-verified on disk this run: the decision the entry
   depends on,
   `shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`,
   carries the deferred marker and waits on
   `shared/issues/260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`,
   which is still open. Reviving a deferred decision is the user's act and has to precede shaping.

   Proposed, not performed:

       defer shared/backlog/260814-1733_*_attach-the-rule-to-the-act.md until shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md is revived

   The case for it is that the entry has stood second across ten consecutive refreshes on an
   obstruction no ranking pass can clear, and a deferral would say that plainly instead of implying
   the entry is merely runner-up. The case against it is that the idea is live and the blockage is
   one user act wide. The user has still not been asked: the explicit form of `/fusion:next` skips
   the backlog relay by design, so the activation that ran between the two portfolio generations
   carried no question about this entry. This run holds no confirmation for the operation, so the
   entry stays open and the proposal carries forward verbatim.

## Recently closed (_c_ / _b_)

1. **`260821-1042-reply-bounded-whole-question-answered`** (`_c_`). Closed coherent on 2026-08-22
   after seven Turns across two sessions; the final reconciliation returned `review-needed` on the
   Circle's account of itself rather than on its work, and prescribed four writes that were made
   before the closure note.
2. **`260820-2051-style-rules-arrive-and-get-measured`** (`_b_`). Bounded Closure on 260821. Three of
   four Directive outcomes reached, including a fall in the always-on rule corpus from 171 prose
   em-dashes over 13 018 words to 8 over 13 292. The fourth needs a post-repair measurement window
   that could not open while that Circle was the only active one, so the Artifact is the
   pre-registration: a threshold of 5.0 per 1000 fixed before the first repair commit.
3. **`260819-1645-four-constraints-on-deep-change`** (`_c_`). Closed coherent on 2026-08-20, verdict
   `coherent` with no Rebalance. Five constraints delivered, each verified against the tree rather
   than against its own account.
4. **`260816-1741-guard-becomes-observation-only`** (`_b_`). Bounded Closure on 2026-08-17, chosen at
   the second Rebalance gate on the reconciler's recommendation. The guard decides nothing and the
   configuration loader is down to one leaf, but one Directive clause on shipped agent text was
   deliberately left unmet and scoped out of v10.0.1.
5. **`260815-0007-remove-eight-mechanisms-and-cap-growth`** (`_c_`). Closed coherent at 260815-2115
   after a Rebalance gate at which the user revised the Grounding. Eight mechanisms left the shipped
   plugin, plus `conceptrev` as a ninth, across 36 commits.

## Archived (_s_ / _d_)

- **`260804-1205-shell-reachability-model`** (`_s_`). Superseded on 260807-0923 by
  `circles/260807-0923-guard-misst-statt-orakelt/`. Not closed and not bounded: the user changed the
  mechanism from predicting which file a shell command would write to measuring afterwards which one
  had changed, which removed this Directive's subject.

No Circle carries `_d_`.

## Warnings

**`portfolio-citation-regression`.** The 260822-2040 generation of this file spelled a state marker in
one path, in the sentence reporting where the activation proposal had been appended. The Circle was
activated twelve minutes later, the record moved from `_a_circle.md` to `_t_circle.md`, and the
citation died. `workbench-citation-lint` recomputes from the tree on every run and carries no
baseline, so it blocked every commit until this regeneration. Filed as
`shared/issues/260822-2050_*_the-portfolio-generator-spelled-a-marker-again-and-the-citation-died-at-the-next-transition.md`,
which names the closed predecessor and says that hand-correcting this file is not the fix, because
the next generation overwrites the correction. The record stays open: it is addressed to the
generator, and one clean regeneration is not evidence that the branch which produced the fault has
changed.

**`activation-head-fields-inconsistent`.** The active Circle's `**Active spec/plan:**` and
`**Active session history:**` both read `(none yet)` while its `## Grounding snapshot` cites the
specification it runs on by path. The cause is that the two sanctioned activation performers disagree
about the head fields: the orchestrator fills the spec field when it knows the file, and
`/fusion:next` leaves it exactly as it stands because a skill has no way to identify the right one.
This Circle went through the skill. Filed as
`shared/issues/260822-2045_*_a-circles-head-fields-end-up-in-different-states-depending-on-which-of-the-two-activation-routes-ran.md`.
It costs this portfolio a field it would otherwise render, and it costs a reader the ability to tell
"no spec exists" from "activated by the skill".

**`spec-circles-unfiled`.** Three of the five Circles in
`shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` still exist only as prose.
C1 is now the active Circle, which answers one quarter of the first fix direction in
`shared/issues/260822-1556_*_the-spec-names-five-circles-and-the-workbench-holds-none-of-them-so-c0-closed-with-nothing-to-transition.md`.
C2 (what travels between checkouts), C3 (attribution) and C4 (presence) have no Circle record, so
this portfolio cannot rank them and the issue stays open. That is why the anticipated section is
empty rather than merely short. The issue's second fix direction, amending the specification to drop
the Circle vocabulary, remains available and is a different answer rather than a lesser one. C0 stays
unrecorded either way: it ran to completion with no Circle directory.

**`dead-citation-in-live-store`.** The file `shared/backlog/260811-0826_*_observations.md`, the closed
entry the two live backlog entries were split out of, names a third sibling in its own split note
that no longer resolves under `shared/backlog/`. The archive sweep in commit `e59dea2` moved it out
of the live store. The entry is closed and is history, so nothing depends on the citation; repairing
it means correcting the path to the archived copy, per the archival case in
`rules/circle-records.md`.

**`open-issue-volume`.** The shared issue store holds 119 open defect records against 149 closed, 23
of them filed on 2026-08-22 alone, two of those in the hour before this run. No Circle is scoped to
work them, and the active Circle produces a report rather than a repair. This is stated as portfolio
context, not as a recommendation: whether that volume warrants a Circle of its own is the user's
call, and filing one is not this agent's act.

**`deferred-decision-blocks-a-backlog-entry`.** The second-ranked backlog entry cannot be shaped
until
`shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`
is revived from the deferred state, which only the user can do. See the proposed deferral above.

No dependency cycle was detected: one non-terminal Circle exists and its `## Dependencies` section
names no Circle. No parent-Grounding-stale condition was detected: neither bounded Circle is cited by
the Grounding snapshot of the active Circle. The pointer is consistent: `.active-circle` names
`260822-1921-measure-what-two-checkouts-share`, that directory exists, its record carries `_t_`, and
no second record carries `_t_`.
