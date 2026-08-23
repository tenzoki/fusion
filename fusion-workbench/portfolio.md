# Portfolio

**Generated:** 260823-0423 (by playmaker session 260823-0423-playmaker-direct-dispatch)
**Domain bias:** code
**git HEAD at run:** `fff1291`

**This run holds no user confirmation.** It was dispatched directly and has no channel to put a
question to the user, so it holds no confirmation for any of the four confirm-gated backlog
operations. It ranked, regenerated this file, wrote one activation proposal, and checked whether
either live backlog marker needed moving. It split, merged, closed and deferred nothing. One
deferral is proposed below and still waits on the user.

**One Circle record was written this run**, by append:
`circles/260823-0023-settle-what-travels-between-checkouts/_*_circle.md` now carries an
`## Activation proposal`. No marker was renamed and `.active-circle` was not written.

**Every path in this file carries `_*_` where a state marker would stand**, per
`rules/circle-records.md` `### Citation form in the portfolio`. A marker that is being *named* keeps
its letter: the heading `## Recently closed (_c_ / _b_)` below, and the `_a_` → `_t_` transition the
proposal above would begin, are statements about markers rather than pointers to files.

## Active (_t_)

**(none).** No Circle record carries `_t_` and `.active-circle` is absent. That is the normal state
between Circles, not a fault, and it is what the activation proposal below exists to end.

## Anticipated (_a_) — ranked

**Recommended next: `260823-0023-settle-what-travels-between-checkouts` — every input it rests on is
answered and on disk, and nothing else is waiting.**

1. **`260823-0023-settle-what-travels-between-checkouts`** (rank 1 of 1, record
   `circles/260823-0023-settle-what-travels-between-checkouts/_*_circle.md`).

   *What travels between checkouts is settled, and the one file two people both write merges without
   a hand on it.* It is capability C2 of
   `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, captured through
   `/fusion:direct` with six user answers already recorded in its `## Grounding snapshot`.

   It would rank first even against company, and the reason is that it carries no open question. The
   two decisions its Grounding rests on were both answered after the record was written and both
   carry the answered marker on disk today:
   `shared/decisions/260822-1136_*_how-does-the-tracked-event-log-behave-when-two-checkouts-both-appended-to-it.md`
   chose the union merge driver, and
   `circles/260822-1921-measure-what-two-checkouts-share/decisions/260822-2219_*_what-does-a-second-checkout-do-with-a-circle-record-marked-active-that-it-never-activated.md`
   chose the reporting gate. Neither blocks it. The one open decision the Grounding names,
   `shared/decisions/260822-1556_*_does-the-record-filename-convention-hold-when-several-checkouts-file-into-one-store.md`,
   is named as held out of this Circle by the user at the shaping gate and placed before C3 — a
   boundary statement, not an obstruction, and it is the difference between a Circle that is blocked
   and one whose scope somebody drew. Its single dependency,
   `260822-1921-measure-what-two-checkouts-share`, is closed coherent, so the dependencies-closed
   flag is clear. The evidence it builds on is measurement rather than argument: the merge case was
   run end to end in
   `circles/260822-1921-measure-what-two-checkouts-share/analyses/260822-2219-what-two-checkouts-of-one-project-actually-share.md`,
   with both the benefit and the cost confirmed. It is ready to activate as it stands.

   Dependencies: one, closed. Open decisions cited: none blocking, one deliberately excluded.

**Two of the five specified capabilities are still uncaptured**, and that is a correction to what
this file said yesterday rather than a repetition of it. C0 and C1 are delivered, C2 is the record
above, and C3 and C4 exist only as prose in the specification (`### C3`, `### C4`). Filing one is
`/fusion:direct`, and it is the user's act. See `spec-circles-unfiled` under `## Warnings`.

## Backlog — ranked

**Recommended to shape: `shared/backlog/260814-1733_*_bounded-executor-dispatches.md` — the only live
idea that needs no user act before it can be shaped.**

    /fusion:direct shared/backlog/260814-1733_*_bounded-executor-dispatches.md

**Live and ranked (2).** Both markers already match this run's ranking, so no rename was made. The
ranking is unchanged from 260822-2253, and so is the single proposal under it.

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

   The case for it is that the entry has stood second across twelve consecutive refreshes on an
   obstruction no ranking pass can clear, and a deferral would say that plainly instead of implying
   the entry is merely runner-up. The case against it is that the idea is live and the blockage is
   one user act wide. This run holds no confirmation, so the entry stays open and the proposal
   carries forward verbatim. An interactive `/fusion:next` is where the user meets it.

## Recently closed (_c_ / _b_)

1. **`260822-1921-measure-what-two-checkouts-share`** (`_c_`). Closed coherent on 260822 after one
   Turn, two tasks, commits `f90de0c`..`b938f68`. Two checkouts of one project do get isolated
   workbench state, in both arrangements the user intends to use, on the precondition that each tree
   carries its own `.fusion-setup`. Sharing is only ever the upward walk of
   `bin/fusion-workbench-root`, never a shared file — a sharper result than the Directive asked for.
   Both questions it left open have since been answered and are inputs to the anticipated Circle
   above.
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

**`spec-circles-unfiled` — corrected, and it is now smaller than it was.** Two of the five
capabilities in `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` exist only
as prose: C3 (`### C3`, every record says who wrote it) and C4 (`### C4`, presence travels after the
fact). This file recorded three yesterday; C2 has since been captured as
`circles/260823-0023-settle-what-travels-between-checkouts/_*_circle.md`, so the count moved and the
consequence moved with it. A portfolio refresh can tell you what comes next again. Filed as
`shared/issues/260822-1556_*_the-spec-names-five-circles-and-the-workbench-holds-none-of-them-so-c0-closed-with-nothing-to-transition.md`,
whose first fix direction is exactly what happened here, applied once more. C0 stays unrecorded
either way: it ran to completion with no Circle directory.

**`activation-head-fields-inconsistent` — re-read this run, and correctable again rather than
historical.** Yesterday its subject had become a terminal record and the warning could only state
what the defect would cost future activations. The new anticipated Circle puts the same field back
in play. `circles/260823-0023-settle-what-travels-between-checkouts/_*_circle.md` carries
`**Active spec/plan:** (none yet)` while its `## Grounding snapshot` cites the specification it runs
on by path — which is correct for an anticipated record and stops being correct the moment somebody
activates it. Which of the two sanctioned routes performs that activation decides whether the field
is written, and, through `rules/circle-records.md`
`### The Directive is a pointer once a spec exists`, whether the record's `## Directive` prose swaps
to the pointer literal or stands as a second copy of a Directive the spec also states. The choice is
live and it is one act away. Filed as
`shared/issues/260822-2045_*_a-circles-head-fields-end-up-in-different-states-depending-on-which-of-the-two-activation-routes-ran.md`;
the activation proposal on the record repeats the caution where whoever activates will see it.

**`portfolio-citation-regression`.** Still open, and this run does not close it. The 260822-2040
generation of this file spelled a state marker in one path; the Circle transitioned twelve minutes
later and the citation died. Filed as
`shared/issues/260822-2050_*_the-portfolio-generator-spelled-a-marker-again-and-the-citation-died-at-the-next-transition.md`.
Its second consideration measured why nothing else catches this class: the citation gate's pattern
wants a stamp immediately before the marker, and a Circle record carries its stamp one path segment
earlier, so a `circles/<dir>/<record>` pointer is invisible to it. This run emitted four such
pointers, all starred. Three clean generations are not evidence that the branch which produced the
fault has changed. The record is addressed to the generator, not to this file.

**`session-bookkeeping-froze-again`.** Unchanged and still open. The reconciler found
`agentstate.yaml`, `orchestrator-live.md`, the closed Circle's `## Turn log` and the session history
all describing the state before Turn 1, while that Turn ran two tasks to completion. This is the
fifth instance, and the detection that closed the first was deleted on 2026-08-15, so nothing
measures the condition any more. Filed as
`shared/issues/260822-2236_*_the-four-session-bookkeeping-surfaces-froze-again-and-the-detection-that-closed-the-first-record-has-been-removed.md`.
It is portfolio-relevant again for a forward reason rather than a backward one: the Circle above is
about to become the next Turn's subject.

**`dead-citation-in-live-store`.** Unchanged. The file `shared/backlog/260811-0826_*_observations.md`,
the closed entry the two live backlog entries were split out of, names a third sibling in its own
split note — the radical-simplification entry — that no longer resolves under `shared/backlog/`; an
archive sweep moved it out of the live store. The entry is closed and is history, so nothing depends
on the citation; repairing it means correcting the path to the archived copy, per the archival case
in `rules/circle-records.md`.

**`open-issue-volume`.** The shared issue store holds 120 open defect records against 149 closed,
counts unchanged since the previous refresh. Two of the open ones close with the anticipated Circle
above, by its own Grounding. The rest are not scoped to any Circle. This is stated as portfolio
context, not as a recommendation: whether that volume warrants a Circle of its own is the user's
call, and filing one is not this agent's act.

**`deferred-decision-blocks-a-backlog-entry`.** The second-ranked backlog entry cannot be shaped
until
`shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`
is revived from the deferred state, which only the user can do. See the proposed deferral above.

**No pointer warning.** `.active-circle` is absent and no Circle record carries `_t_`, which is the
normal state between Circles. `STALE-POINTER`, `POINTER-MISMATCH`, `MISSING-POINTER` and
`MULTIPLE-ACTIVE` all fail to apply.

**No dependency cycle.** The graph is built from non-terminal Circles only, and there is now exactly
one: `260823-0023-settle-what-travels-between-checkouts`. Its one dependency edge points at a closed
Circle, which is outside the node set, so the graph has one node and no edges. A single node cannot
close a cycle. Unlike the previous two refreshes, this is a statement about a graph that has
something in it.

**No parent-Grounding-stale condition.** The one non-terminal Circle's `## Grounding snapshot` cites
neither bounded Circle — not `260820-2051-style-rules-arrive-and-get-measured`, not
`260816-1741-guard-becomes-observation-only` — and names no Artifact from either closure note.
Checked directly against the record this run rather than inferred from an empty set.
