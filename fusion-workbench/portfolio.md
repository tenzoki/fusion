# Portfolio

**Generated:** 260822-2253 (by playmaker session 260822-2253-playmaker-orchestrator-phase4)
**Domain bias:** code
**git HEAD at run:** `4aaabc3`

**This run holds no user confirmation.** It is a Phase-4 dispatch from the orchestrator after a
`_t_` → `_c_` transition, so there is no user in the loop. It ranked, regenerated this file, and
checked whether either live backlog marker needed moving. It split, merged, closed and deferred
nothing. One deferral is proposed below and waits on the user, unchanged from the previous two runs.

**No Circle record was written this run.** There is no anticipated Circle to propose for activation,
no non-terminal Circle to carry a dependency warning, and no non-terminal Circle whose Grounding
cites a bounded one. Every Circle in the workbench is terminal, and a terminal record is history.

**Every path in this file carries `_*_` where a state marker would stand**, per
`rules/circle-records.md` `### Citation form in the portfolio`. A marker that is being *named* keeps
its letter: the heading `## Recently closed (_c_ / _b_)` below, and the `_t_` → `_c_` transition this
run followed, are statements about markers rather than pointers to files.

## Active (_t_)

**(none).** The workbench has no active Circle, and `.active-circle` is absent. That is the normal
post-closure state, not a fault: `260822-1921-measure-what-two-checkouts-share` closed coherent
minutes before this run and the orchestrator deleted the pointer with the rename. No warning is
raised for it.

## Anticipated (_a_) — ranked

**(none) — and the empty section understates the position.** No Circle record in the workbench
carries `_a_`, so there is nothing to rank and no activation proposal was written. But "nothing is
planned" and "nothing is captured" are different states, and this is the second.

Three capabilities are specified and uncaptured. `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`
defines five, of which C0 and C1 are delivered — C0 without ever having a Circle directory, C1 as the
Circle that just closed. The remaining three exist only as prose in that specification:

- **C2 — what travels between checkouts is settled, and `portfolio.md` stops travelling** (spec `### C2`).
  It is the natural successor: the Circle that just closed produced both of its open records as
  declared inputs to C2, and its measurement is what C2 would build the state partition on.
- **C3 — every record says who wrote it, and a Circle says who is running it** (spec `### C3`).
- **C4 — presence travels, after the fact** (spec `### C4`).

None of the three has a Circle record, so this portfolio cannot rank them, cannot recommend one, and
cannot tell you which is readiest. Filing one is `/fusion:direct`, and it is the user's act. The gap
is filed as `shared/issues/260822-1556_*_the-spec-names-five-circles-and-the-workbench-holds-none-of-them-so-c0-closed-with-nothing-to-transition.md`,
whose second fix direction — amending the specification to drop the Circle vocabulary — is a
different answer to the same gap rather than a lesser one.

**Two records the closed Circle left open are inputs to C2, not loose ends.** Both live inside the
Circle that produced them and are cited by its `## Closure note`:

- `circles/260822-1921-measure-what-two-checkouts-share/decisions/260822-2219_*_what-does-a-second-checkout-do-with-a-circle-record-marked-active-that-it-never-activated.md`
  asks a question the chosen multi-user arrangement did not previously have.
- `circles/260822-1921-measure-what-two-checkouts-share/issues/260822-2219_*_the-tracked-setup-marker-is-rewritten-by-every-setup-and-carries-the-checkouts-absolute-path.md`
  records that one member of the specification's class R3 does not survive measurement.

They are not defects awaiting a fix pass. Whoever shapes C2 reads them first.

## Backlog — ranked

**Recommended to shape: `shared/backlog/260814-1733_*_bounded-executor-dispatches.md` — the only live
idea that needs no user act before it can be shaped.**

    /fusion:direct shared/backlog/260814-1733_*_bounded-executor-dispatches.md

**Live and ranked (2).** Both markers already match this run's ranking, so no rename was made. The
ranking is unchanged from 260822-2104, and so is the single proposal under it.

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

   The case for it is that the entry has stood second across eleven consecutive refreshes on an
   obstruction no ranking pass can clear, and a deferral would say that plainly instead of implying
   the entry is merely runner-up. The case against it is that the idea is live and the blockage is
   one user act wide. This is a Phase-4 dispatch and holds no confirmation, so the entry stays open
   and the proposal carries forward verbatim. The next interactive `/fusion:next` is where the user
   meets it.

## Recently closed (_c_ / _b_)

1. **`260822-1921-measure-what-two-checkouts-share`** (`_c_`). Closed coherent on 260822 after one
   Turn, two tasks, commits `f90de0c`..`b938f68`. Two checkouts of one project do get isolated
   workbench state, in both arrangements the user intends to use, on the precondition that each tree
   carries its own `.fusion-setup`. Sharing is only ever the upward walk of `bin/fusion-workbench-root`,
   never a shared file — a sharper result than the Directive asked for. The nested placement fails,
   and closes as a recorded bound rather than an open defect.
2. **`260821-1042-reply-bounded-whole-question-answered`** (`_c_`). Closed coherent on 2026-08-22
   after seven Turns across two sessions; the final reconciliation returned `review-needed` on the
   Circle's account of itself rather than on its work, and prescribed four writes that were made
   before the closure note.
3. **`260820-2051-style-rules-arrive-and-get-measured`** (`_b_`). Bounded Closure on 260821. Three of
   four Directive outcomes reached, including a fall in the always-on rule corpus from 171 prose
   em-dashes over 13 018 words to 8 over 13 292. The fourth needs a post-repair measurement window
   that could not open while that Circle was the only active one, so the Artifact is the
   pre-registration: a threshold of 5.0 per 1000 fixed before the first repair commit.
4. **`260819-1645-four-constraints-on-deep-change`** (`_c_`). Closed coherent on 2026-08-20, verdict
   `coherent` with no Rebalance. Five constraints delivered, each verified against the tree rather
   than against its own account.
5. **`260816-1741-guard-becomes-observation-only`** (`_b_`). Bounded Closure on 2026-08-17, chosen at
   the second Rebalance gate on the reconciler's recommendation. The guard decides nothing and the
   configuration loader is down to one leaf, but one Directive clause on shipped agent text was
   deliberately left unmet and scoped out of v10.0.1.

## Archived (_s_ / _d_)

- **`260804-1205-shell-reachability-model`** (`_s_`). Superseded on 260807-0923 by
  `circles/260807-0923-guard-misst-statt-orakelt/`. Not closed and not bounded: the user changed the
  mechanism from predicting which file a shell command would write to measuring afterwards which one
  had changed, which removed this Directive's subject.

No Circle carries `_d_`.

## Warnings

**`spec-circles-unfiled`.** Three of the five capabilities in
`shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` still exist only as prose,
and with C1 closed the workbench now holds no Circle record at all — anticipated or active. That is
why the anticipated section above is empty rather than merely short, and it is the reason a portfolio
refresh can no longer tell you what comes next. Filed as
`shared/issues/260822-1556_*_the-spec-names-five-circles-and-the-workbench-holds-none-of-them-so-c0-closed-with-nothing-to-transition.md`;
its first fix direction is to file the remaining capabilities as anticipated records, and one quarter
of it was answered by C1 becoming a Circle. C0 stays unrecorded either way: it ran to completion with
no Circle directory.

**`portfolio-citation-regression`.** Still open, and this run does not close it. The 260822-2040
generation of this file spelled a state marker in one path; the Circle transitioned twelve minutes
later and the citation died. Filed as
`shared/issues/260822-2050_*_the-portfolio-generator-spelled-a-marker-again-and-the-citation-died-at-the-next-transition.md`.
Its second consideration measured why nothing else catches this class: the citation gate's pattern
wants a stamp immediately before the marker, and a Circle record carries its stamp one path segment
earlier, so a `circles/<dir>/_a_circle.md` pointer is invisible to it. Two clean generations are not
evidence that the branch which produced the fault has changed. The record is addressed to the
generator, not to this file.

**`activation-head-fields-inconsistent`.** Still open, and its subject has moved from a live Circle to
a closed record. `circles/260822-1921-measure-what-two-checkouts-share/_*_circle.md` carries
`**Active spec/plan:** (none yet)` while its `## Grounding snapshot` cites by path the specification
it ran on. The cause is that the two sanctioned activation routes disagree: the orchestrator fills the
field when it knows the file, and `/fusion:next` leaves it as it stands because a skill cannot
identify the right one. This Circle went through the skill. Filed as
`shared/issues/260822-2045_*_a-circles-head-fields-end-up-in-different-states-depending-on-which-of-the-two-activation-routes-ran.md`.
The record is now terminal and is history, so the field is not correctable here; what the defect costs
from now on is every future activation through the skill.

**`session-bookkeeping-froze-again`.** New since the previous refresh, and it is portfolio-relevant
because it is about the durable record of the Circle this run just filed as closed. The reconciler
found `agentstate.yaml`, `orchestrator-live.md`, the Circle's `## Turn log` and the session history
all describing the state before Turn 1, while that Turn ran two tasks to completion. The Turn log and
the closure note were written before the rename, so the Circle's own record is now complete; the
workbench-root surfaces are the ones that stayed frozen. This is the fifth instance, and the
detection that closed the first was deleted on 2026-08-15, so nothing measures the condition any
more. Filed as
`shared/issues/260822-2236_*_the-four-session-bookkeeping-surfaces-froze-again-and-the-detection-that-closed-the-first-record-has-been-removed.md`.

**`dead-citation-in-live-store`.** Unchanged. The file `shared/backlog/260811-0826_*_observations.md`,
the closed entry the two live backlog entries were split out of, names a third sibling in its own
split note — the radical-simplification entry — that no longer resolves under `shared/backlog/`; an
archive sweep moved it out of the live store. The entry is closed and is
history, so nothing depends on the citation; repairing it means correcting the path to the archived
copy, per the archival case in `rules/circle-records.md`.

**`open-issue-volume`.** The shared issue store holds 120 open defect records against 149 closed, 24
of them filed on 2026-08-22 alone. With C1 closed, no Circle is scoped to work any of them. This is
stated as portfolio context, not as a recommendation: whether that volume warrants a Circle of its
own is the user's call, and filing one is not this agent's act.

**`deferred-decision-blocks-a-backlog-entry`.** The second-ranked backlog entry cannot be shaped until
`shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`
is revived from the deferred state, which only the user can do. See the proposed deferral above.

**No pointer warning.** `.active-circle` is absent and no Circle record carries `_t_`, which is the
normal post-closure state. `STALE-POINTER`, `POINTER-MISMATCH`, `MISSING-POINTER` and
`MULTIPLE-ACTIVE` all fail to apply.

**No dependency cycle, and none is currently detectable.** The graph is built from non-terminal
Circles only, and every one of the fifteen Circle records in the workbench is terminal. The graph has
no nodes, so the absence of a cycle this run is a statement about an empty graph rather than about
the dependencies anybody wrote.

**No parent-Grounding-stale condition.** The same emptiness: the two bounded Circles
(`260820-2051-style-rules-arrive-and-get-measured`, `260816-1741-guard-becomes-observation-only`) have
no non-terminal Circle that could cite them.
