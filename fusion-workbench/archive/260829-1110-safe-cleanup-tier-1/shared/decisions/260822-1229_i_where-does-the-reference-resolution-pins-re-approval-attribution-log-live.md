# Where does the reference-resolution pin's re-approval attribution log live?

---
**Domain:** code
**Filed by:** analyst
**Cross-references:** `260822-1226-cut-ledger-for-three-bounded-surfaces.md` (the measurement that raises it); `260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md` step 2 and Gate A; `hooks/lib/__tests__/reference-resolution-lint.test.ts:493-913`; `260822-1154_*_does-the-hook-test-line-budget-cover-comment-prose.md` (the adjacent question about what the budget counts); `260821-2204_*_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md` (the measured instance); `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining` (the neighbouring convention that requires text to survive a number moving)

---

## Question

`hooks/lib/__tests__/reference-resolution-lint.test.ts` pins the number of references its three
classes resolve, in `const BASELINE` at line 914. Above that constant stands a chronological log of
every approval and re-approval since the pin was introduced: 26 entries, 2026-08-16 to 2026-08-22,
occupying lines 493 through 913 — **421 lines**, measured by
`awk 'NR>=493 && NR<=913' … | wc -l`. That is 2.1 per cent of the whole hook test surface and about
6 per cent of its comment mass.

The question has to be answered now because it is the only place the C0 Circle's hook-test target
can come from. Everything else that surface offers — factoring the four prompt-lint files onto one
helper, removing three restated paragraphs from `surface-growth-bound.test.ts`, one superseded
paragraph in `helpers/guard-harness.ts` — measures about 145 to 185 lines against a target of 500,
and even the minimum needed to land the Circle's own new test file (about 190) is not reached
without touching this log. So the Circle either takes a decision here or reports a shortfall.

This is **not** the question already filed as
`260822-1154_*_does-the-hook-test-line-budget-cover-comment-prose.md`. That one asks
whether a comment line should be charged to the budget at all, and cannot be answered without
recomputing a baseline. This one asks where one particular log belongs, and is answerable without
moving any baseline.

## Options

1. **It stays, in full, and the Circle reports the shortfall.** Nothing moves; the hook-test target
   is not met; the closure note names the surface and the gap.
   - Pros: the log is where the person re-approving the pin will be standing, which is the whole
     reason the convention was adopted. Costs nothing and risks nothing. It is also the position the
     neighbouring instrument takes for its own absolution text — `helpers/growth-bound.ts` requires
     the arming's text to survive **as text** rather than in `git`, and this log is the same shape.
   - Cons: the Circle stops short of a stated target on the one surface it identified as most at
     risk, and the pressure the log creates on every future re-approval is unchanged.
2. **Trim to the current entry, and move the historical entries to a workbench record cited from the
   file.** Keep the pin's rationale (lines 483-492) and the newest re-approval (911-913); move the
   other 25 entries into a record under `$OUT_ANALYSIS` or a Circle store, and replace them with one
   citation line.
   - Pros: recovers about **418 lines** — the whole of the surface's target on its own. The history
     survives as text, in the store this project says findings belong in, and the file still names
     where to read it. The convention that a re-approval is attributed is untouched: the next
     re-approver still writes a block, it just does not accumulate forever in a bounded file.
   - Cons: the attribution is no longer in front of the person editing `BASELINE`, which is the
     property that made the log trustworthy. It also relocates rather than removes: the bytes move
     to an unbounded surface, so the *maintenance* cost the line budget claims to measure falls only
     to the extent that nobody reads the record.
3. **Delete the historical entries outright, on the ground that `git` holds them.** Every block was
   committed in the same commit as the pin movement it explains — verified across all 26 by
   `git log --format='%h %ad %s' --date=short -L 914,914:hooks/lib/__tests__/reference-resolution-lint.test.ts`,
   which lists 26 commits, and `git log -p` recovers each block's text.
   - Pros: the largest single cut available, no relocation, no new record to maintain.
   - Cons: this project has twice written down that a finding living only in a log is a defect, and
     `git` is a log. `circles/260821-1042-…/260821-2204_*_…` was filed for exactly that. Taking
     this option would answer, by side effect and inside a cut-only Circle, a question about evidence
     that the project has not put to itself.
4. **Cap the log at the last N entries, keeping the shape and bounding the growth.** Say the last
   three; older entries roll into the record of option 2 as they age out.
   - Pros: bounded by construction rather than by repeated pruning — the same shape recommended for
     the `/fusion:help` upgrade section at Gate B of the same plan. Keeps attribution in front of the
     editor for recent moves, where it is most often wanted.
   - Cons: needs somebody to perform the roll, which is a maintenance step standing beside an action,
     and `agents/orchestrator.md` `## Circle head fields` records that this project has measured that
     shape being skipped six times in six sessions.

## Constraints

- No baseline map may move. `TEST_LINE_BASELINE` is byte-identical at closure under the plan's own
  stopping clauses, so no option here may be paired with a re-baseline.
- Whatever is kept must still let a reader answer, for the current `BASELINE`, what moved it and why.
  The pin's value rests on that (issue `260810-2149_*_a-coverage-floor-cannot-see-coverage-leave-and-the-approved-baseline-pin-is-the-general-answer.md`, cited in the file at line 484-492).
- `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining` governs the *arming and absolution*
  text of the four growth bounds and is untouched by any option here. This log is a different
  instrument's convention and must not be conflated with it.
- Any option that writes a workbench record puts that record inside the corpus of
  `hooks/lib/__tests__/workbench-citation-lint.test.ts`, which recomputes on every run and carries no
  approvable baseline. Its citations have to resolve on the day it lands.

## Recommendation

None, and the reason is that the four options differ on a value this analyst cannot read off a
measurement: how much this project wants an audit trail to sit in front of the thing it audits. The
measurement is settled — 421 lines, and no other route to the target exists on this surface. Option 2
is the only one that both meets the target and keeps the history as text; option 1 is the only one
that changes nothing and is a valid closure under the plan's own stopping clauses. Option 3 should
not be taken inside a cut-only Circle whatever its merits, because it decides an evidence question as
a by-product of a budget.

---
Answered: 260822-1009-orchestrator-session.md — user decision at Gate A of the C0
plan, 260822: **Option 2.** The pin's rationale and the newest re-approval stay in
`hooks/lib/__tests__/reference-resolution-lint.test.ts`; the other 25 entries move to a workbench
record, cited from the file by one line. The user took this over capping at the last N entries
(option 4, whose roll is a maintenance step standing beside an action, a shape this project has
measured being skipped six times in six sessions) and over leaving the log in place and reporting
the shortfall (option 1). Option 3, outright deletion on the ground that git holds the entries, was
put to the user together with this record's argument against it and was not taken.

The cost the user accepted, stated at the gate: the attribution no longer stands in front of the
person editing `BASELINE`, which is the property that made the log trustworthy, and the bytes are
relocated rather than removed.
Implemented: `hooks/lib/__tests__/reference-resolution-lint.test.ts:488-493` — option 2 applied at
step 2 of the C0 plan: the pin's rationale and the newest re-approval stay above `const BASELINE`,
entries 1 to 25 moved verbatim to
`260822-1318-reference-resolution-pin-re-approval-log-entries-1-to-25.md`, and a
six-line citation block names that record and instructs the next roll. The file fell 1431 -> 1014
lines; `TEST_LINE_BASELINE` did not move.
Deferred:
Superseded by:
Retired:
