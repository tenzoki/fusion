# Portfolio

**Generated:** 260820-1126 (by playmaker session 260820-1126-playmaker-direct-dispatch)
**Domain bias:** code
**git HEAD at run:** `ac01c90` (working tree ahead of it; see the last warning)

**This run holds no user confirmation.** It was dispatched with a domain line and nothing else: no
confirmed-operations block on the prompt, and no channel through which to put a question. Its mandate
is the narrow one, which is to rank, regenerate this file in full, and rename backlog markers where
the ranking calls for it. It performed no split, merge, close or deferral. Every figure below was
measured against disk on this run, and nothing is carried forward from the previous portfolio without
being re-checked.

**The headline: the portfolio has no candidate.** All twelve Circles in the live store carry a
terminal marker. `260819-1645-four-constraints-on-deep-change`, which the previous refresh
recommended, was activated, ran two Turns and closed coherent this morning. Nothing is anticipated,
nothing is active, and the only forward move on the board is the backlog.

**The most useful thing this run found is small and precise.** One open defect,
`shared/issues/260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`,
is the last of three records a deferred decision named as its condition. The other two are settled.
Clearing it puts the best-supported idea in the backlog back within reach of being shaped. See
**The deferral that is two thirds cleared** under `## Warnings`.

## Active (_t_)

**(none).** `.active-circle` is absent and no Circle record carries the active marker. The two agree,
so no pointer warning is raised. This is the normal state after a closure.

The last active Circle was `260819-1645-four-constraints-on-deep-change`, closed coherent this
morning at 2026-08-20. Its record cites the reconciliation at
`circles/260819-1645-four-constraints-on-deep-change/history/260820-0830-reconciliation.md`.

## Anticipated (_a_) — ranked

**(none).** No Circle record carries the anticipated marker, so there is no `Recommended next:` line
and no activation proposal was written to any record on this run.

**The store emptied by being worked rather than by being cleared.** All twelve live Circle
directories hold a record at `_c_`, `_b_` or `_s_`. The previous refresh held exactly one candidate,
recommended it, and the user activated it the same evening; two Turns later it closed coherent. An
empty anticipated section after that sequence is the portfolio working, not a gap in it.

**What refills it.** Either the user shapes a backlog entry into a new anticipated Circle, which is
what `## Backlog — ranked` below recommends, or they file a Directive directly with
`/fusion:direct <draft>`. This agent does neither: it ranks what exists and proposes, and creating a
Circle is the shaper's act on the user's word.

## Backlog — ranked

**Recommended to shape: `shared/backlog/260814-1733_*_bounded-executor-dispatches.md` — the only live
idea that can be shaped today without a user act first.**

    /fusion:direct shared/backlog/260814-1733_*_bounded-executor-dispatches.md

**Read this as the whole of the forward path this run can offer, not as a secondary suggestion.** At
the previous refresh the backlog stood behind a ready anticipated Circle and the two were in
sequence. That Circle has closed, so the backlog is now the only place a next unit of work can come
from.

**Live and ranked (2).** Ranking recomputed on this run against the code-domain bias, which prefers
an idea whose cited evidence is already on disk and whose dependencies are clear over one that must
wait on an unresolved record.

1. **`shared/backlog/260814-1733_*_bounded-executor-dispatches.md`** (recommended, `_p_`) — bound how
   long an executor runs before returning to the orchestrator. Its evidence is on disk and already
   sized. `shared/analyses/260812-0303-simplify-speed-and-why-rules-do-not-hold.md` adopts the
   bounded-dispatch half of the user's filed proposal on cost grounds, at roughly a fourfold saving
   in re-sent tokens, and refutes the re-injection half by finding that the rules did not decay over
   a long dispatch but were never in force to begin with. That split is what makes the entry ready
   rather than raw. Shaping it means putting a Directive narrower than the filed wording to the user
   and getting agreement on the narrowing, which is the conversation `/fusion:direct` exists to hold.
   Its companion record,
   `shared/issues/260812-0253_*_rules-lose-their-effect-during-a-long-dispatch.md`, is open and is
   context for the Directive rather than a gate on it.

   **The session that just closed is a fifth data point for this entry, and it cuts both ways.** Turn
   1 of `260819-1645-four-constraints-on-deep-change` ran fourteen executor tasks over nine plan
   steps, and its own closing observation was that six of thirteen review findings were the Circle's
   own stale tracking. Long dispatches did produce drift. Against that, the same session's five gates
   each held, so the evidence does not support a claim that length alone is the mechanism. The
   entry's rank is unchanged and its Directive still needs narrowing before it is planned.

   *Nothing is proposed for this entry.* It states one idea, can be promoted whole, and already
   carries the marker this run's ranking gives it.

2. **`shared/backlog/260814-1733_*_attach-the-rule-to-the-act.md`** (open, `_o_`) — a rule lands with
   an executable check or it does not land. Second **on shapeability, not on merit**, and the gap is
   unchanged across five consecutive refreshes: on the evidence this is the best-supported idea in
   the store, and it still cannot be shaped today.

   *The obstruction, re-verified on disk this run, and it has moved for the first time.* The decision
   this entry depends on,
   `shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`,
   carries the deferred marker. Its deferral names three records as the condition for reviving it,
   and two of the three are now settled: `260810-0502` was closed and has since been archived,
   `260810-0503` is closed, and only
   `shared/issues/260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`
   is still open. Reviving a deferred decision remains the user's own act, so the entry stays at
   `_o_`, but the distance to that act is now one Low-severity defect in two test negative controls
   rather than three open records.

   *The Circle that closed this morning is the strongest evidence yet for the idea, and it is
   evidence on the exact question the deferral asked.* The deferred record asks whether this project
   can tell a real gate from a decorative one, having produced four lints in one Turn and got two
   right. `260819-1645-four-constraints-on-deep-change` built five gates and demonstrated each of
   them failing before accepting it: the artifact comparison reddened while the toolchain case stayed
   green, removing the notebook branch reddened exactly one assertion at the expected line, an
   unclosed fence exposed two further doors, a broken marker named its file, line, token and remedy,
   and a frozen copy tree entered a gate it should never have entered. Demonstrated failure is
   precisely the negative control whose absence made the two 260810 lints decorative.

   *Nothing is proposed for this entry either.* It states one idea, so no split applies. Both live
   entries cite the same rules-decay analysis but remain distinct Directives, one bounding dispatch
   length and the other binding a rule to an executable check, so a merge would consolidate two ideas
   into one and lose one of them. The idea is live, so a close is wrong. Deferring it would cost the
   user two later acts, reviving the decision and then reviving the entry by hand, where leaving it
   open costs one.

**Proposed and not performed (0).** This run proposes no split, merge, close or deferral, for the
reasons stated per entry rather than left to be inferred.

**Performed this run: nothing.** Both live entries already carry the markers this run's ranking gives
them, so the autonomous rename between open and recommended had nothing to do. No entry was created,
split, merged, closed or deferred.

**The store also holds one closed entry**,
`shared/backlog/260811-0826_*_observations.md`, the user's hand-written dump of about a dozen ideas.
It was split on 260814-1733 into three entries and retired. Two of those three are the live entries
above; the third became Circle `260815-0007-remove-eight-mechanisms-and-cap-growth` and closed. Its
body carries four dangling citations, two of them written by a previous run of this agent, which is
reported under `## Warnings`.

## Recently closed (_c_ / _b_)

1. **`260819-1645-four-constraints-on-deep-change`** (`_c_`, closed 2026-08-20) — five constraints
   delivered and each verified against the tree rather than against its own account: the committed
   `hooks/dist` is asserted to be the compilation of the committed source against a pinned compiler,
   all four write tools reach an integration case, the orchestrator states the whole-tree git
   prohibition at every executor dispatch, the workbench's own citations are repaired and held by a
   blocking gate, and deliberate deletion has the annotation form its decision had waited on since 5
   August. The closure note is candid about two shortfalls, one of which is that the Circle's own
   plan does not carry the stopping section made mandatory two days earlier.
2. **`260816-1741-guard-becomes-observation-only`** (`_b_`, bounded 2026-08-17) — the compliance
   guard decides nothing: no verdict is reached on any path, and the decision-governed check, the
   halt, the block counter, the escalation module and the halt-clearing script are gone. Bounded
   rather than coherent on one unmet Directive clause, scoped out by the user. Read the caveat under
   `## Warnings`: this closure is the case the marker vocabulary has no word for.
3. **`260815-0007-remove-eight-mechanisms-and-cap-growth`** (`_c_`, closed 260815-2115) — nine
   mechanisms left the shipped plugin and a failing growth cap now covers `agents/`, `skills/` and
   the hook test lines. Four of the Circle's own Grounding claims did not survive its closing
   measurement, which the closure note records as the measurement working rather than failing.
4. **`260801-1244-curator`** (`_c_`, closed 260814-2200) — the curator reconciles the three normative
   surfaces and was proved on fusion's own conventions file. Twenty-nine commits over six Turns,
   coherent at the third reconciliation pass.
5. **`260813-0858-playmaker-maintains-backlog-store`** (`_c_`, closed 260813-1618) — the playmaker
   maintains the backlog store it is charged with. Closed after the user took the reconciler's
   `review-needed` recommendation to revise the Artifact.

The live store holds twelve Circle directories, unchanged in count since the previous refresh.
Archived Circles are deliberately absent from every section of this file, because nothing in the
archive store is a portfolio item.

## Archived (_s_ / _d_)

- **`260804-1205-shell-reachability-model`** (`_s_`, superseded 260807-0923) — superseded by
  `circles/260807-0923-guard-misst-statt-orakelt/`, and neither closed nor bounded. The user replaced
  the mechanism rather than judging the Directive reached or unreachable.

No Circle carries the deferred marker.

## Warnings

**Pointer state: clean.** `.active-circle` is absent and no Circle record carries the active marker.
None of `STALE-POINTER`, `POINTER-MISMATCH`, `MISSING-POINTER` or `MULTIPLE-ACTIVE` applies.

**Dependency cycles: none, on a graph with no nodes.** The graph is built from the `## Dependencies`
sections of non-terminal Circles, and there are none. The check ran and had nothing to examine, which
is a weaker result than the previous refresh, where one real node was tested. No `## Dependency
warning` section was appended to any record.

**Bounded-Closure propagation: no flag raised, and the reason is the empty store rather than a clean
reading.** `260816-1741-guard-becomes-observation-only` still carries the Bounded-Closure marker, but
the propagation check scans non-terminal Circles for citations of it, and there are none. The flag
raised at the previous refresh stands on the record of
`260819-1645-four-constraints-on-deep-change`, which has since closed coherent, so it is history now
rather than a live condition.

**The deferral that is two thirds cleared, and it is this run's most actionable finding.**
`shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`
was deferred on 260811 until three lint records were settled. Two now are.
`shared/issues/260810-0502_*` was closed and archived; `shared/issues/260810-0503_*` is closed;
`shared/issues/260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`
is open at Low severity and names two negative controls in
`hooks/lib/__tests__/queue-ground-lint.test.ts` that assert against a string they built rather than
calling the production helper. Settling it satisfies the deferral's stated condition, after which
reviving the decision is the user's act and unblocks the second backlog entry. Neither the settling
nor the revival is this agent's write.

**The next archive pass can turn a blocking gate red, and the mechanism that would prevent it is an
open defect.** The Circle that closed this morning armed
`hooks/lib/__tests__/workbench-citation-lint.test.ts` over a corpus of live Circle records, open
issues, live decisions, live plans and this file, excluding `archive/` and two frozen stores. It is
green as of this run, verified by executing it, and it carries no baseline and no approvable number
by design. Archiving moves a record out of the corpus while every citation of it stays behind, and
`shared/issues/260819-1511_*_the-archive-citation-filter-reads-shipped-text-and-never-the-workbench-so-archiving-dangles-citations-invisibly.md`
records that the archive step's filter reads shipped text and never the workbench. The 2026-08-17
archive pass produced six dangling citations by exactly that route when the consequence was only a
count. The consequence now is a failing suite whose failure text will not name archiving as the
cause. A second gate is exposed the same way:
`shared/issues/260816-0725_*_the-citation-gates-new-exact-count-pin-is-coupled-to-workbench-contents-so-the-archive-step-can-turn-it-red.md`
records an exact-equality baseline in the reference lint whose failure message tells the reader to
re-approve the number, which is the wrong response when a housekeeping step moved a file.

**Four dangling citations sit in the backlog store, and a previous run of this agent wrote two of
them.** Measured on this run with `hooks/lib/__tests__/helpers/citation-scan.ts` over
`shared/backlog/`: three files, twenty tokens, nine resolved, four dangling, five undecidable, two
exempt. All four dangling tokens are in the closed entry
`shared/backlog/260811-0826_*_observations.md`. Two came from the user's original dump. The other two
are in the split note a playmaker run appended on 260814-1733, which spells the marker out and so
died at each target's next transition: one target moved from `_o_` to `_p_` in this same store, the
other was promoted, closed and archived. The citation-form rule in `rules/circle-records.md`
`### Citation form in the portfolio` states exactly this failure, and it binds `portfolio.md` alone,
so nothing bound the split note. That is the second backlog entry's own thesis reproduced inside the
store this agent maintains. Repairing a closed entry's body is not one of this agent's operations, so
the finding is surfaced and nothing was written.

**The backlog store sits outside the citation gate's corpus on an open question.** The gate's own
source states it:
`hooks/lib/__tests__/workbench-citation-lint.test.ts:144` records that whether an `_o_` or `_p_`
backlog entry belongs in the corpus is a separate question, asked by
`circles/260819-1645-four-constraints-on-deep-change/issues/260820-0906_*_the-citation-gates-corpus-has-no-planning-clause-so-an-open-plan-is-a-live-surface-outside-the-gate.md`
and deliberately not answered there, because widening a blocking gate's corpus was left to the user.
The two live entries carry zero dangling citations today, so the question is latent rather than
urgent.

**The Circle record that closed this morning carries two `## Turn log` headings, and this agent's
appends are between them.** `circles/260819-1645-four-constraints-on-deep-change/_*_circle.md` has
the heading at line 127 with no content, then `## Activation proposal` and `## Parent grounding
stale` appended by the previous playmaker run, then a second `## Turn log` at line 209 carrying both
Turns, then `## Closure note`. Appending to the end of a record whose template sections are still
empty puts those sections above later writes and duplicates the heading. The record is terminal and
is history now, so nothing is edited. The interaction is worth recording because it will recur on
every Circle this agent proposes for activation.

**Three open decisions stand in the stores of terminal Circles, and for the first time not one of
them has a carrier.** The shared decision store holds none open. All three sit under Circles that are
finished, so no session will reach them:

- `circles/260801-1244-curator/decisions/260814-1915_*_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md`
  gates three open defects in its own Circle as their stated closing condition, so leaving it
  unanswered holds four records rather than one.
- `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-2056_*_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md`
- `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-1845_*_does-analyst-get-a-project-local-rule-pattern-now-that-the-investigator-fold-orphaned-one.md`

**Open defect volume, measured this run: 153, against 152 at the previous refresh.** Ninety-five are
open in `shared/issues/` against 134 closed, and 58 across all Circle issue stores against 289
closed. The Circle that ran overnight filed fourteen findings of its own and closed twelve, and
closed ten further defects across the workbench, so the near-flat total conceals substantial
movement. The judgement of the 2026-08-19 reconciliation passes still holds on the remainder: the
Circle-store records are not stale, they reproduce as filed, and the reason they sit unworked is that
they are filed under Circles that are finished. The problem is placement, not truth.

**Two records stay open inside the Circle that just closed, neither for want of effort.**
`circles/260819-1645-four-constraints-on-deep-change/issues/260819-2250_*_a-decision-records-cross-reference-names-a-defect-record-that-was-never-filed-and-the-intended-target-is-not-recoverable.md`
names a cross-reference whose intended target is not recoverable; both dead pointers are neutralised
and no citation in the workbench names it any more.
`circles/260819-1645-four-constraints-on-deep-change/issues/260820-0906_*_the-deletion-annotation-form-was-not-applied-to-the-surviving-reference-of-the-circle-it-uses-as-its-worked-example.md`
needs a convention nobody has chosen, because two tokens on it name files in another repository.

**The bounded Circle's unmet Directive clause still has nothing carrying it forward, and it is now
five days old.**
`circles/260816-1741-guard-becomes-observation-only/issues/260817-1505_*_the-curator-and-its-skill-still-say-a-projects-guard-configuration-can-deny-a-write.md`
records that `agents/curator.md` and `skills/curate/SKILL.md` still describe a write denied by a
project's guard configuration, which no shipped code can do. It sits in the issue store of a terminal
Circle, where nothing routes it to a session. Whether it becomes a Circle, a task batch, or is left
standing is the user's call.

**The bounded closure's own marker overstates what happened, and the defect is filed.** The
Bounded-Closure marker is defined as "Directive judged not reachable"; that closure note says the
opposite, that the Directive was reachable and one clause deliberately not reached, with the rest
verified against the tree. The gap is filed as
`shared/issues/260817-1613_*_the-reconcilers-verdict-vocabulary-has-no-case-for-a-directive-that-is-reachable-but-deliberately-not-reached.md`.
It is raised here because this file renders that marker, and the entry under `## Recently closed`
would otherwise mislead.

**Four records touching this agent's own surfaces remain open.** Three are in the Circle that built
the backlog mandate, `260813-0858-playmaker-maintains-backlog-store`:

- `.../issues/260813-1545_*_the-split-line-form-cannot-express-a-partial-split-which-is-the-only-case-the-store-actually-holds.md`
  is inert this run, since no split is proposed, and would bind the next run that proposes one.
- `.../issues/260813-1545_*_the-phase-4-mandate-is-stated-a-third-time-in-the-prompt-and-the-new-lint-holds-only-two-of-the-three.md`
- `.../issues/260813-1545_*_the-relay-reads-its-operation-lines-out-of-report-prose-when-it-already-holds-the-fixed-form-portfolio.md`

The fourth is the presentational half of the command collapse,
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1633_*_eight-shipped-surfaces-still-present-the-three-demoted-skill-names-as-user-commands.md`,
one row of whose table is `agents/playmaker.md`.

**The closure this file reports is not in any commit, and every figure above was read from the
working tree.** At HEAD `ac01c90` the Circle record still carries the active marker and seven of its
issues still carry the open marker. The working tree carries the renames: `_t_circle.md` to
`_c_circle.md`, and seven issues from `_o_` to `_c_`. Nothing is wrong with the renames, and this
agent does not stage or commit. The consequence worth knowing is that a reader who checks out
`ac01c90` will find a portfolio reporting a closure the tree does not show, and that
`bin/fusion-staging-drift` will name these eight paths until something commits them.
