# Portfolio

**Generated:** 260817-1643 (by playmaker session 260817-1643-playmaker-orchestrator-phase4)
**Domain bias:** code
**git HEAD at run:** `5e7bdc1`

**This run holds no user confirmation.** It was dispatched by the orchestrator at Phase 4 after a
Circle transition, with no user in the loop. Its mandate is to rank, to regenerate this file in
full, and to rename backlog markers where the ranking calls for it. It performed no split, merge,
close or deferral, and it proposes none. Every figure below was measured against disk on this run;
nothing is carried forward from the previous portfolio.

**The headline: the portfolio is empty of candidates for the first time since 260815-2115.**
`260816-1741-guard-becomes-observation-only` reached Bounded Closure and was the only non-terminal
Circle in the store. All sixteen Circle directories now carry a terminal marker. There is nothing to
activate, and the forward move is to shape the backlog's top entry into a new Circle. That entry is
`shared/backlog/260814-1733_*_bounded-executor-dispatches.md`, and the sequencing caveat the previous
two portfolios attached to it has lapsed: it competed with a ready anticipated Circle then, and it
competes with nothing now.

## Active (_t_)

**(none).** `.active-circle` is absent and no Circle record carries the active marker. The two agree,
so no pointer warning is raised. This is the normal state immediately after a closure.

The closure that produced it is `260816-1741-guard-becomes-observation-only`, bounded at 260817-1639,
now the first entry under `## Recently closed`.

## Anticipated (_a_) — ranked

**(none).**

**Recommended next: (none).** No Circle record carries the anticipated marker, so there is no
activation candidate and no activation proposal was appended to any record this run. The ranking
heuristic ran against an empty candidate set rather than against a set it scored badly.

This is a state to read rather than a defect to correct. Sixteen Circle directories stand under
`circles/`, and every one of them is terminal: thirteen closed-coherent, two bounded, one superseded.
The store holds no work in preparation. The next Circle comes from the backlog section below, through
`/fusion:direct`, which is the path this portfolio recommends.

## Backlog — ranked

**Recommended to shape: `shared/backlog/260814-1733_*_bounded-executor-dispatches.md` — the only live
idea whose path is clear of a user act it cannot perform itself, and now the portfolio's only forward
move.**

    /fusion:direct shared/backlog/260814-1733_*_bounded-executor-dispatches.md

**Why this run drops the sequencing caveat the previous one attached.** The portfolio of 260816-1822
carried the same recommendation with a warning against acting on it: an anticipated Circle was
standing and ready, and shaping a second one would have produced a competitor for the single
orchestrator slot rather than a second track. That Circle has since been activated, run to Bounded
Closure and retired. The slot is empty, so the entry's readiness and the portfolio's need now point
the same way.

**Live and ranked (2).** Ranking recomputed this run against the code-domain bias, which prefers an
idea whose cited evidence is already on disk and whose dependencies are clear over one that must wait
on an unresolved record.

1. **`shared/backlog/260814-1733_*_bounded-executor-dispatches.md`** (recommended, `_p_`) — bound how
   long an executor runs before returning to the orchestrator. Its evidence is on disk and already
   sized. `shared/analyses/260812-0303-simplify-speed-and-why-rules-do-not-hold.md` adopts the
   bounded-dispatch half of the user's filed proposal on cost grounds, at roughly a fourfold saving
   in re-sent tokens, and refutes the re-injection half by finding that the rules did not decay over
   a long dispatch but were never in force to begin with. That split is what makes the entry ready
   rather than raw: shaping it means putting a Directive narrower than the filed wording to the user
   and getting agreement on the narrowing, which is the conversation `/fusion:direct` exists to hold.
   Its companion record, `shared/issues/260812-0253_*_rules-lose-their-effect-during-a-long-dispatch.md`,
   is open and is context for the Directive rather than a gate on it.

   *One note for whoever shapes it.* The Circle that just closed produced a third piece of evidence
   for the same underlying problem. Its Bounded-Closure Artifact records that an agent's staged git
   index is inherited by whoever commits next, filed independently twice as
   `shared/issues/260816-0105_*_a-sub-agents-staged-rename-is-absorbed-by-the-orchestrators-next-commit-and-the-staging-list-cannot-prevent-it.md`
   and `circles/260816-1741-guard-becomes-observation-only/issues/260817-1502_*_a-sub-agent-left-renames-staged-and-the-orchestrators-next-commit-absorbed-them.md`.
   Whether a boundary on dispatch length is the right frame for that defect is a shaping question,
   not a ranking one, and this run does not answer it.

2. **`shared/backlog/260814-1733_*_attach-the-rule-to-the-act.md`** (open, `_o_`) — a rule lands with
   an executable check or it does not land. Second **on shapeability, not on merit**, and the gap is
   unchanged across three consecutive refreshes: on the evidence this is the best-supported idea in
   the store, and it still cannot be shaped today.

   *The obstruction, re-verified on disk this run.* The decision it depends on,
   `shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`,
   carries the deferred marker. Reviving a deferred decision is the user's own act, and the entry's
   own text says the revival has to precede shaping it.

   *The Circle that just closed strengthened the idea again.* Its first Bounded-Closure learning is
   that a mechanism's removal outruns its description: six shipped surfaces went on describing a
   deciding guard after the code stopped deciding, two of them surviving a curator pass, a review and
   a release, because the lint that should catch it cannot read prose. That is the same shape as this
   entry's thesis, measured on a fourth independent case. The entry's rank does not move, because
   rank here is shapeability and the obstruction is untouched.

**Proposed and not performed (0).** This run proposes no split, merge, close or deferral, for reasons
it states rather than leaves to be inferred. Each live entry states one idea and can be promoted
whole, so neither needs splitting. The two cite the same rules-decay analysis and remain distinct
ideas, one bounding dispatch length and the other binding a rule to an executable check, so a merge
would consolidate two Directives into one and lose one of them. Both ideas are live, so neither is a
close, and deferring the second would cost the user two later acts where leaving it open costs one.

**Performed this run: nothing.** Both live entries already carry the markers this run's ranking gives
them, so even the autonomous rename had nothing to do. No entry was created, split, merged, closed or
deferred.

## Recently closed (_c_ / _b_)

1. **`260816-1741-guard-becomes-observation-only`** (`_b_`, bounded 260817-1639) — the compliance
   guard decides nothing: no verdict is reached on any path, the decision-governed check, the halt,
   the block counter, the escalation module and the halt-clearing script are gone, and v10.0.0 and
   v10.0.1 shipped. Bounded rather than coherent on one unmet Directive clause, scoped out by the
   user. Read the caveat under `## Warnings`: this closure is the case the marker vocabulary has no
   word for.
2. **`260815-0007-remove-eight-mechanisms-and-cap-growth`** (`_c_`, closed 260815-2115) — nine
   mechanisms left the shipped plugin and a failing growth cap now covers `agents/`, `skills/` and the
   hook test lines; four of the Circle's own Grounding claims did not survive its closing measurement,
   which the Closure note records as the measurement working rather than failing.
3. **`260801-1244-curator`** (`_c_`, closed 260814-2200) — the curator reconciles the three normative
   surfaces and was proved on fusion's own conventions file; 29 commits over six Turns, coherent at
   the third reconciliation pass.
4. **`260813-0910-documentation-matches-shipped-plugin`** (`_b_`, closed 260813-2332) — Bounded
   Closure chosen by the user at the Rebalance gate with the Turn budget spent at 5 of 5; nine of ten
   plan steps landed and the remaining work was judged a fresh unit rather than a correction. Its
   unreached step has since been settled, which is a change from the previous three portfolios.
5. **`260813-0858-playmaker-maintains-backlog-store`** (`_c_`, closed 260813-1618) — the playmaker
   maintains the backlog store it is charged with; closed after the user took the reconciler's
   `review-needed` recommendation to revise the Artifact.

## Archived (_s_ / _d_)

- **`260804-1205-shell-reachability-model`** (`_s_`, superseded 260807-0923) — superseded by
  `circles/260807-0923-guard-misst-statt-orakelt/`, not closed and not bounded: the user replaced the
  mechanism rather than judging the Directive reached or unreachable. Its lineage runs on into the
  Circle that closed today, which removed the last of what the measurement approach replaced.

No Circle carries the deferred marker.

## Warnings

**Pointer state: clean.** `.active-circle` is absent and no Circle record carries the active marker.
That raises none of `STALE-POINTER`, `POINTER-MISMATCH`, `MISSING-POINTER` or `MULTIPLE-ACTIVE`.

**Dependency cycles: not evaluable, on an empty node set.** The graph is built from the
`## Dependencies` sections of non-terminal Circles, and there are none. No edge exists to close a
cycle and no `## Dependency warning` section was appended to any Circle record. The previous refresh
could run this check against one real node; this one cannot, and says so rather than reporting a
clean result it did not earn.

**Bounded-Closure propagation: nothing to propagate, and this is the reason rather than an
absence.** `260816-1741-guard-becomes-observation-only` reached Bounded Closure, which is the trigger
for marking a parent Circle's Grounding stale. The check scans non-terminal Circles for a citation of
the bounded child's directory name or of the Artifact its Closure note names. No non-terminal Circle
exists, so the scan had nothing to examine. No `## Parent grounding stale` section was appended and no
`parent-grounding-stale` event was logged. **The check will need re-running the moment a new Circle is
shaped that cites this one** — and the backlog's top entry is exactly such a candidate, since its
shaping note above already draws on the closed Circle's Artifact. Shaping it does not create a
staleness condition by itself; citing a bounded Circle in a new Grounding is ordinary and correct. The
condition arises only if that Grounding assumes the bounded Directive was delivered in full, which it
was not.

**The unmet Directive clause has nothing carrying it forward.** The Closure note states that one
clause was deliberately not reached: shipped agent text at `agents/curator.md:212` and
`skills/curate/SKILL.md:110` still describes a write denied by a project's guard configuration, which
no shipped code can now do. It is filed as
`circles/260816-1741-guard-becomes-observation-only/issues/260817-1505_*_the-curator-and-its-skill-still-say-a-projects-guard-configuration-can-deny-a-write.md`
and the user scoped it out of v10.0.1 knowingly. It sits in the issue store of a terminal Circle,
where nothing routes it to a session. Two shipped surfaces therefore state a property of fusion that
is false, and the portfolio holds no unit of work that will correct them. Whether that becomes a
Circle, a taskplanner batch, or is left standing is the user's call; filing and dispatching are not
this agent's acts.

**This closure's own marker overstates what happened, and the defect is filed.** `_b_` is defined as
"Directive judged not reachable". The Closure note says the opposite: the Directive was reachable and
deliberately not reached, one clause scoped out with the rest verified against the tree. A reader who
takes the marker at face value will conclude the work failed, when eighteen of eighteen plan tasks
verify, the test suite is green at 35 files and 653 tests, and two tagged releases shipped. The gap is
filed as
`shared/issues/260817-1613_*_the-reconcilers-verdict-vocabulary-has-no-case-for-a-directive-that-is-reachable-but-deliberately-not-reached.md`.
It is raised here because this portfolio is one of the surfaces that renders the marker, and the entry
under `## Recently closed` would otherwise mislead.

**Two defects stand open in the closed Circle's store beyond the six its Closure note enumerates.**
The note lists six that stay open by user decision. The store holds eight open records. The two
unlisted are
`circles/260816-1741-guard-becomes-observation-only/issues/260817-1417_*_one-commit-in-this-circles-range-is-written-in-german-while-the-artifact-language-is-en.md`
and
`circles/260816-1741-guard-becomes-observation-only/issues/260817-1502_*_a-sub-agent-left-renames-staged-and-the-orchestrators-next-commit-absorbed-them.md`.
The second is named elsewhere in the note, as the third Bounded-Closure learning, so its absence from
the enumerated six is plausibly deliberate. The first appears nowhere in the note. Neither is a
propagation this agent can perform; both are surfaced so the six-record figure is not read as the full
count.

**The previous portfolio's oldest standing warning is resolved.** For three consecutive refreshes this
section reported that `260813-0910-documentation-matches-shipped-plugin` had nothing carrying its
unreached step 10, the verification of `docs/plane-setup.md`. That record now carries the closed
marker. Nothing further is owed there.

**Seven decision records stand open across the workbench, two of them new from today's closure.** Two
sit in `shared/`:

- `shared/decisions/260816-1707_*_to-whom-is-the-new-workbench-tracking-rule-emitted-when-its-consumers-are-a-human-and-a-skill.md`
- `shared/decisions/260817-1613_*_does-a-plan-stated-precondition-get-any-mechanism-or-is-it-read-by-a-human-or-not-at-all.md`
  — new, and it is the second Bounded-Closure learning turned into a question. The plan named a review
  pass as a condition of the release tag; the tag went out over twelve unreviewed commits and no
  mechanism noticed.

Five sit in the stores of already-terminal Circles, where nothing is carrying them:

- `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-2056_*_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md`
- `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-1845_*_does-analyst-get-a-project-local-rule-pattern-now-that-the-investigator-fold-orphaned-one.md`
- `circles/260801-1244-curator/decisions/260814-1915_*_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md`
- `circles/260813-0910-documentation-matches-shipped-plugin/decisions/260813-1820_*_should-the-planner-accept-a-domain-parameter-that-three-documented-surfaces-already-promise.md`
- `circles/260813-0910-documentation-matches-shipped-plugin/decisions/260813-1820_*_how-fusion-s-own-documentation-treats-a-hand-measured-number-that-decays.md`

**The deferral chain blocking the second backlog entry still rests on a half-moot record.**
`shared/issues/260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`
is the last of the three records the deferred decision waits on, and it is still open. It describes
two defects in two files. `hooks/lib/__tests__/queue-ground-lint.test.ts`, which carries the first and
larger of them, no longer exists — verified by directory listing at HEAD this run; it went on
2026-08-15 with the persisted work queue. `hooks/lib/__tests__/executor-verification-report-lint.test.ts`,
which carries the second, is still present, so the record is not wholly moot and closing it is not
automatic. Resolving it and reviving
`shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`
would make `shared/backlog/260814-1733_*_attach-the-rule-to-the-act.md` the first entry in the backlog
ranking. Editing a defect record is not among this agent's operations, so the finding is surfaced and
nothing is written.

**Two records touching this agent's own surfaces remain open, unchanged from the previous refresh.**

- `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1633_*_eight-shipped-surfaces-still-present-the-three-demoted-skill-names-as-user-commands.md`
  — the presentational half of the command collapse. One row of its table is `agents/playmaker.md`.
- `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1247_*_a-backlog-entrys-related-line-points-at-a-marker-the-playmaker-has-since-moved.md`
  — a dangling citation inside the backlog store this agent maintains. Repairing an entry's body is not
  among the four maintenance operations, so it is surfaced and left.

**Open defect volume, measured this run.** 93 records are open in `shared/issues/` against 245 closed,
and 75 are open across all Circle issue stores against 292 closed: 168 open in total, up from 159 at
the previous refresh. The Circle that closed today contributed 8 of the new ones and closed 21. The
volume is raised as a portfolio condition and nothing is filed; the user decides whether any of it
becomes a Circle.
