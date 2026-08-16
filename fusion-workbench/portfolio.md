# Portfolio

**Generated:** 260816-1822 (by playmaker session 260816-1822-playmaker-user-fusion-next)
**Domain bias:** code
**git HEAD at run:** `3d41d4a`

**This run holds no user confirmation.** It ranked, regenerated this file in full, and appended one
activation proposal to a Circle record. It performed no backlog write, because the two live entries
already carry the markers this run's ranking would give them, and it proposes no split, merge,
close or deferral. Every figure below was measured against disk on this run; nothing is carried
forward from the previous portfolio.

**The headline: the portfolio has a candidate again.** One Circle carries the anticipated marker,
`260816-1741-guard-becomes-observation-only`, shaped this afternoon. It scores clean on both halves
of the ranking heuristic, and the one question its own record named as blocking its plan was
answered by the user forty minutes before this run. Activating it is the forward move today, ahead
of shaping anything new out of the backlog.

## Active (_t_)

**(none).** `.active-circle` is absent and no Circle record carries the active marker. The two
agree, so no pointer warning is raised. An empty active slot with no pointer is the normal state
between Circles.

The most recent closure was `260815-0007-remove-eight-mechanisms-and-cap-growth`, coherent at
260815-2115, which is still the first entry under `## Recently closed`. Nothing has been active
since.

## Anticipated (_a_) — ranked

**Recommended next: `260816-1741-guard-becomes-observation-only` — zero open decisions in its
Grounding, every dependency closed, and the question that blocked its plan was answered at
260816-1742.**

1. **`260816-1741-guard-becomes-observation-only`** (rank 1 of 1) — *the compliance guard observes
   and never blocks.*

   The Directive removes the guard's last two deciding checks. The decision-governed check, the
   consecutive-block counter, the halt and the clearing script leave the shipped plugin, and the
   fusion-repository stand-down leaves with them, since with no verdict left there is nothing for
   it to stand down. The PreToolUse hook stays registered on the four write tools and on Bash,
   allows every call, and goes on writing its allow rows so the monitor keeps the write trace it
   renders today.

   It scores clean on both halves of the code-domain heuristic. Its Grounding snapshot cites four
   decision records and every one of them carries the answered marker, so the unresolved-decision
   count is zero. Its `## Dependencies` section names no blocking Circle and cites three closed
   ones as lineage, each of which this run resolved to an existing directory carrying the
   closed-coherent marker: `circles/260807-0923-guard-misst-statt-orakelt`,
   `circles/260801-1244-guard-bash-inspection` and
   `circles/260815-0007-remove-eight-mechanisms-and-cap-growth`. No partial-block flag is raised.

   **The timing is the strongest part of the case.** The record states in its own words that the
   plan cannot be written until the Turn-budget question is answered, because two of that
   question's five options delete `hooks/lib/config.ts`, `hooks/turn-budget.ts` and
   `bin/fusion-turn-budget` outright while three keep them in reduced form. The user answered it
   inline at 260816-1742 as option 1, a renamed project-root file, and
   `circles/260816-1741-guard-becomes-observation-only/decisions/260816-1742_*_where-does-the-orchestrators-turn-budget-live-once-the-guard-configuration-file-is-gone.md`
   now carries the answered marker. The single stated obstruction to planning is gone, and the
   answer narrows the removal rather than widening it.

   **Its measured Grounding claims were spot-checked on this run and hold.** `hooks/guard.ts:286-321`
   is the stand-down the record describes, `hooks/lib/escalation.ts` is 411 lines,
   `hooks/clear-halt.ts` 295 and `hooks/lib/config.ts` 742, and every file named in the record's
   code-site table exists at HEAD. One line of the Grounding has already gone stale; it is named
   under `## Warnings` and does not affect the ranking.

   The activation proposal is appended to
   `circles/260816-1741-guard-becomes-observation-only/_*_circle.md`.

## Backlog — ranked

**Recommended to shape: `shared/backlog/260814-1733_*_bounded-executor-dispatches.md` — the only
live idea whose path is clear of a user act it cannot perform itself.**

    /fusion:direct shared/backlog/260814-1733_*_bounded-executor-dispatches.md

**Read the sequencing note before acting on that line.** The recommendation above is the backlog's
own top entry, not this run's recommended next move. With an anticipated Circle now standing and
ready, shaping a second one adds a competitor for the same single slot rather than a second track,
because fusion runs one orchestrator against a project at a time. The ordering this run reads off
the portfolio is: activate `260816-1741-guard-becomes-observation-only` first, and shape the
backlog's top entry when the anticipated slot is next empty. The `/fusion:direct` line stands
because the entry is genuinely ready, not because today is the day to run it.

**Live and ranked (2).** Ranking recomputed this run against the code-domain bias, which prefers an
idea whose cited evidence is already on disk and whose dependencies are clear over one that must
wait on an unresolved record.

1. **`shared/backlog/260814-1733_*_bounded-executor-dispatches.md`** (recommended, `_p_`) — bound
   how long an executor runs before returning to the orchestrator. Its evidence is on disk and
   already sized: `shared/analyses/260812-0303-simplify-speed-and-why-rules-do-not-hold.md` adopts
   the bounded-dispatch half of the user's filed proposal on cost grounds at roughly a fourfold
   saving in re-sent tokens, and refutes the re-injection half by finding that the rules did not
   decay over a long dispatch but were never in force to begin with. That split is what makes the
   entry ready rather than raw: shaping it means putting a Directive narrower than the filed
   wording to the user and getting agreement on the narrowing, which is the conversation
   `/fusion:direct` exists to hold. Its companion record,
   `shared/issues/260812-0253_*_rules-lose-their-effect-during-a-long-dispatch.md`, is open and is
   context for the Directive rather than a gate on it.

2. **`shared/backlog/260814-1733_*_attach-the-rule-to-the-act.md`** (open, `_o_`) — a rule lands
   with an executable check or it does not land. Second **on shapeability, not on merit**, and that
   gap is unchanged from the previous run: on the evidence this is the best-supported idea in the
   store, and it still cannot be shaped today.

   *The obstruction, re-verified on disk this run.* The decision it depends on,
   `shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`,
   carries the deferred marker. Reviving a deferred decision is the user's own act, and the entry's
   own text says the revival has to precede shaping it.

   *The lever is now measurably shorter than the previous portfolio described it.* That deferral
   names its own re-open condition: three defect records settled. Two of the three closed on
   2026-08-10, namely `shared/issues/260810-0502_*_the-state-drift-lint-anchors-on-the-phrase-it-checks-and-one-negative-control-is-a-duplicate.md`
   and `shared/issues/260810-0503_*_the-domain-cascade-lint-is-defeated-by-a-decoy-branch-and-one-helper-has-no-negative-control.md`.
   One remains open,
   `shared/issues/260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`,
   at severity Low, and half of what it describes no longer exists. Details under `## Warnings`;
   the finding belongs there because acting on it means editing a defect record, which is not this
   agent's write.

**Proposed and not performed (0).** This run proposes no split, merge, close or deferral, for three
reasons it states rather than leaves to be inferred. Each live entry states one idea and can be
promoted whole, so neither needs splitting. The two cite the same rules-decay analysis and remain
distinct ideas, one bounding dispatch length and the other binding a rule to an executable check,
so a merge would consolidate two Directives into one and lose one of them. Both ideas are live, so
neither is a close. The previous run's withdrawal of the standing deferral proposal on the second
entry stands, and this run's finding about the shortened lever strengthens the reason for it:
deferring costs the user two later acts where leaving the entry open costs one.

**Performed this run: nothing.** Both live entries already carry the markers this run's ranking
gives them, so even the autonomous rename had nothing to do. No entry was created, split, merged,
closed or deferred.

## Recently closed (_c_ / _b_)

1. **`260815-0007-remove-eight-mechanisms-and-cap-growth`** (`_c_`, closed 260815-2115) — nine
   mechanisms left the shipped plugin and a failing growth cap now covers `agents/`, `skills/` and
   the hook test lines; four of the Circle's own Grounding claims did not survive its closing
   measurement, which the Closure note records as the measurement working rather than failing.
2. **`260801-1244-curator`** (`_c_`, closed 260814-2200) — the curator reconciles the three
   normative surfaces and was proved on fusion's own conventions file; 29 commits over six Turns.
3. **`260813-0910-documentation-matches-shipped-plugin`** (`_b_`, closed 260813) — Bounded Closure
   chosen by the user at the Rebalance gate with the Turn budget spent at 5 of 5; nine of ten plan
   steps landed and the remaining work was judged a fresh unit rather than a correction.
4. **`260813-0858-playmaker-maintains-backlog-store`** (`_c_`, closed 260813) — the playmaker
   maintains the backlog store it is charged with; closed after the user took the reconciler's
   `review-needed` recommendation to revise the Artifact.
5. **`260807-0923-guard-misst-statt-orakelt`** (`_c_`, closed 260807-1650) — the guard measures what
   changed instead of predicting what will change; the static classifier was removed outright. It
   is the direct lineage of the Circle recommended above, which finishes what it began.

## Archived (_s_ / _d_)

- **`260804-1205-shell-reachability-model`** (`_s_`, superseded 260807-0923) — superseded by
  `circles/260807-0923-guard-misst-statt-orakelt/`, not closed and not bounded: the user replaced
  the mechanism rather than judging the Directive reached or unreachable.

No Circle carries the deferred marker.

## Warnings

**Pointer state: clean.** `.active-circle` is absent and no Circle record carries the active marker.
That raises none of `STALE-POINTER`, `POINTER-MISMATCH`, `MISSING-POINTER` or `MULTIPLE-ACTIVE`.

**Dependency cycles: none, and the check had something to examine this time.** The graph is built
from the `## Dependencies` sections of non-terminal Circles. There is exactly one such Circle now,
and every Circle it names is terminal, so it contributes no edge into the non-terminal node set and
no cycle is reachable. No `## Dependency warning` section was appended to any Circle record. The
two previous refreshes could only report this check as not evaluable, on an empty node set; this
one ran it.

**Parent Grounding staleness: checked against a real node set, and nothing propagates.** One Circle
carries the Bounded-Closure marker, `260813-0910-documentation-matches-shipped-plugin`. The one
non-terminal Circle does not cite it, by directory name or by the Artifact its Closure note names,
so no `## Parent grounding stale` section was appended and no `parent-grounding-stale` event was
logged.

**That Bounded Closure still has nothing carrying its unreached work.** Its Closure note names step
10, the verification of `docs/plane-setup.md` against `bin/fusion-plane`, as never begun, and files
it as
`circles/260813-0910-documentation-matches-shipped-plugin/issues/260813-2305_*_the-directive-promises-plane-setup-verification-and-step-10-was-deferred-with-no-record.md`.
The Plane mirror left the plugin on 2026-08-15, after that note was written, so whether the promise
is still owed at all is a question for the user rather than a propagation this agent can perform.
It is raised here for the third consecutive refresh and nothing has moved it.

**One line of the recommended Circle's Grounding is already stale, and it is stale in the direction
that helps.** The record's `### Open decision this Circle carries` states that its Turn-budget
decision is unanswered and cites it with the open marker spelled out. The user answered it at
260816-1742 and the file now carries the answered marker. The Grounding therefore understates the
Circle's readiness rather than overstating it, which is why the ranking above is not affected.
Whoever activates this Circle updates that line as part of activation; appending a correction to
another agent's Grounding is not this agent's write.

**The deferral chain blocking the second backlog entry rests on a record that is half moot, and
this is new.** `shared/issues/260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`
is the last of the three records the deferred decision waits on. It describes two defects in two
files. `hooks/lib/__tests__/queue-ground-lint.test.ts`, which carries the first and larger of them,
no longer exists: it was removed on 2026-08-15 with the persisted work queue. Verified by
directory listing at HEAD. `hooks/lib/__tests__/executor-verification-report-lint.test.ts`, which
carries the second, is still present, so the record is not wholly moot and closing it is not
automatic. What this changes is the size of the lever: the last obstruction between the user and
the best-supported idea in the backlog store is one Low-severity record of which roughly half
describes a file that is gone. Resolving that record and reviving
`shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`
would make `shared/backlog/260814-1733_*_attach-the-rule-to-the-act.md` the first entry in the
backlog ranking. Editing a defect record is not among this agent's operations, so the finding is
surfaced and nothing is written.

**Six decision records stand open across the workbench and none of them blocks the recommended
Circle.** Each was checked against its Grounding snapshot on this run. One is in `shared/`,
`260816-1707_*_to-whom-is-the-new-workbench-tracking-rule-emitted-when-its-consumers-are-a-human-and-a-skill.md`,
and five sit in the stores of already-terminal Circles, where nothing is carrying them:

- `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-2056_*_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md`
- `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-1845_*_does-analyst-get-a-project-local-rule-pattern-now-that-the-investigator-fold-orphaned-one.md`
- `circles/260801-1244-curator/decisions/260814-1915_*_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md`
- `circles/260813-0910-documentation-matches-shipped-plugin/decisions/260813-1820_*_should-the-planner-accept-a-domain-parameter-that-three-documented-surfaces-already-promise.md`
- `circles/260813-0910-documentation-matches-shipped-plugin/decisions/260813-1820_*_how-fusion-s-own-documentation-treats-a-hand-measured-number-that-decays.md`

The previous portfolio flagged
`shared/decisions/260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`
as open; the user answered it on 2026-08-16 and it no longer appears here.

**Open defect volume, unchanged in shape and slightly larger in count.** 92 records are open in
`shared/issues/` against 243 closed, and 67 are open across all Circle issue stores against 271
closed. The largest single concentration is still the issue store of the Circle that closed on
2026-08-15. Two of those records are worth naming because they touch shipped surfaces:

- `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1633_*_eight-shipped-surfaces-still-present-the-three-demoted-skill-names-as-user-commands.md`
  (the presentational half of the command collapse). Still open, and one row of its table is
  `agents/playmaker.md`, which is this agent's own prompt.
- `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1247_*_a-backlog-entrys-related-line-points-at-a-marker-the-playmaker-has-since-moved.md`
  (a dangling citation inside the backlog store this agent maintains). Repairing an entry's body
  is not among the four operations available here, so it is surfaced and left, as it was on the
  previous run.

The volume is raised as a portfolio condition and nothing is filed. Filing is not this agent's act,
and the user decides whether any of it becomes a Circle, a taskplanner batch, or is left standing.

**The count contradiction the previous portfolio named is resolved in one direction and open in the
other.** The Closure note of `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/_*_circle.md`
says seven shipped surfaces still present a demoted skill name while the issue record says eight
and enumerates them. The enumerated count is the evidenced one and the issue record is still open,
so the contradiction is still readable in the two live records. The related growth-bound hole,
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1935_*_the-hook-test-growth-bound-reads-two-directories-and-a-test-file-in-a-third-runs-unbounded.md`,
has since been closed, so that residual is no longer standing.
