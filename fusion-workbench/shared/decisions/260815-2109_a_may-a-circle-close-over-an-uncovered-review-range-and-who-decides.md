# May a Circle close over an uncovered review range, and who decides?

---
**Domain:** code
**Status:** answered
**Filed by:** reconciler
**Cross-references:** `260815-1455_*_turn-3s-reviewers-were-dispatched-on-four-of-the-seven-uncovered-commits-for-the-third-turn-running.md`, `260814-2017_*_turn-5-edited-three-shipped-surfaces-including-an-always-on-rule-file-and-no-review-pass-ever-opened-them.md`, `260814-2153_*_the-commit-that-closes-the-last-reviews-own-high-finding-is-the-one-commit-no-review-opens.md`, `260814-2033_*_a-resume-that-re-enters-at-phase-3-never-asks-whether-the-turn-it-skips-past-was-reviewed.md`, `260814-2306-orchestrator-session.md` (three `## Coherence` sections)

---

## Question

`bin/fusion-review-coverage` returns `verdict=uncovered` and its own header states that it
reports and is **not** a release gate — "whether a release may go out over an uncovered range
is an unfiled decision this program does not pre-empt". That sentence has been true since the
helper shipped, and the decision it names is still unfiled. Meanwhile the condition it
describes is no longer occasional: Circle `260815-0007` closes with `commits=35 reviews=9
unusable=1 uncovered=9`, and it is at least the fifth consecutive Turn or Circle whose review
range and commit range disagree.

The question must be settled now because it has started to distort the Coherence verdict.
Three verdicts in one session have had to decide, ad hoc and without a rule, whether an
uncovered range flags the `Artifact↔Grounding` edge. Two said yes and one said no, on
reasoning that was defensible each time and inconsistent across the three. A verdict that
turns on the reconciler's mood is not a measurement, and the reconciler cannot fix that from
inside its own prompt — the rule has to exist outside it.

The immediate instance sharpens it. Of the nine uncovered commits, four touch no shipped file
at all and five do, including `0609945`, which arms a failing growth cap over three surfaces
and adds two test files and a helper to a Circle whose Directive is removing mechanism. The
user declined the review dispatch deliberately. Nothing about that choice was wrong; there is
simply no recorded rule saying what it costs.

## Options

1. **Coverage is advisory; the closure note carries the gap as a named residual.** The
   reconciler reports `uncovered` with the commit list and the shipped-file split, the Circle
   closes `_c_` if nothing else flags, and the note names what no reviewer opened.
   - Pros: matches what the helper's own header already says. Keeps the verdict a measurement
     of coherence rather than of process compliance. Costs nothing to adopt — it is current
     behaviour, written down.
   - Cons: a High-severity defect can ship unexamined and the record will say the Circle closed
     coherent. Puts the whole weight on whoever writes the closure note.

2. **Coverage gates `_c_` but not `_b_`.** A Circle may not close `closed-coherent` over an
   uncovered range touching shipped files; it may close `bounded` with the gap stated.
   - Pros: makes the two closure markers mean different things about assurance, which is
     roughly what a reader already assumes. Preserves an exit that does not require the review.
   - Cons: pushes Circles toward `_b_` for a process gap rather than for an unreachable
     Directive, which is what `_b_` currently means. Devalues the marker.

3. **Only shipped-file commits count; workbench-only commits are covered by construction.** The
   helper's `uncovered` set is filtered to commits touching at least one non-workbench path, and
   that filtered count is what any rule reads.
   - Pros: removes the noise that makes the current number easy to dismiss — four of this
     Circle's nine uncovered commits are tracking-file writes a reviewer has nothing to open in.
     A smaller, honest number is more likely to be acted on than a larger padded one.
   - Cons: a change to `bin/fusion-review-coverage`, therefore to a shipped mechanism, one
     commit after a cap was armed to slow exactly that. Does not by itself say what the
     filtered number gates.

4. **The user decides at the gate, and the decision is recorded per Circle.** The reconciler
   surfaces the uncovered set at the Rebalance gate as an explicit option ("accept the coverage
   gap"), and the accepted gap is written into the Circle record.
   - Pros: keeps the judgement where the authority is. Produces a per-Circle audit trail
     instead of a standing policy that will not fit every case.
   - Cons: adds a fifth option to a gate that already carries four. The user has already
     answered this implicitly in this Circle by stopping the dispatch; formalising it may just
     re-ask a question they consider settled.

## Constraints

- Whatever is chosen must be readable by the reconciler without new judgement — the failure
  this record exists to stop is the verdict varying on the same evidence.
- It must not require a review pass the user has declined. The user's authority to skip a
  review is not in question here; only what the skip costs the record.
- Options 1 and 4 are compatible with each other. Option 3 is compatible with all of 1, 2 and 4
  and settles a different half of the question.
- Any change to `bin/fusion-review-coverage` (option 3) is a shipped-surface change and is
  charged against the growth bound armed at `0609945`.

## Recommendation

**Options 3 and 1 together**, at moderate confidence.

Option 3 first, because the current number is not honest enough to build a rule on. Nine
uncovered commits sounds like a large gap; five of them touch shipped files and four are
tracking writes with nothing in them for a reviewer to read. Any policy written against the
unfiltered number will be argued with every time it fires, and will lose.

Then option 1, because it is what the helper already promises and because the alternative
readings both cost more than the problem. Option 2 spends the `_b_` marker on a process gap.
Option 4 adds a gate branch to buy an answer the user gives by their behaviour anyway.

Stated against my own interest: I raised this edge in two verdicts and am now recommending the
option that stops it from blocking. The reason is not that the gap is small — it grew from six
commits to nine while I was recommending it be closed — but that "unreviewed" and "unexamined"
have come apart in this Circle. `0609945` was never opened by a reviewer and has four defect
records filed against it by reconciliation, one High, each with reproduction steps. A rule that
had blocked closure for want of a review file would have blocked it over the one commit in the
session that received the most scrutiny. That is the case option 1 handles correctly and the
others do not.

Low confidence on one point, flagged rather than buried: I have not measured whether
reconciliation reliably substitutes for review, and one Circle is not evidence that it does.
If the next two Circles close over uncovered ranges and reconciliation finds nothing in them,
that is evidence against this recommendation and the question should be re-opened.


## Re-measurement asked for by this record — data point 2 of 2

This record's closing paragraph asked to be re-opened if the next two Circles closed over uncovered
ranges and reconciliation found nothing in them. Recorded here so the re-measurement has both
points to read.

**Circle 2 of 2: `260816-1741-guard-becomes-observation-only`, closed 2026-08-17.** It did close
over an uncovered range, twice: `uncovered=9` at the first Phase-3 pass, and `uncovered=3` at the
second after `70f17da` opened the twelve commits no review had. Reconciliation did **not** find
nothing. The first pass found four stale plan markers, a stale plan status, three issues open
against work already done, and two defects nobody had filed. The second pass found that one clause
of the Circle's own Directive was unmet at the shipped release, that a defect had been filed twice
across two stores without the earlier record being found, and a new stale citation in shipped test
source created by the first pass's own rename.

So the evidence stands **in favour** of the answer as given: reconciliation caught, in both Circles,
things a review pass would have been dispatched to catch. Two caveats belong with it rather than
after it. Reconciliation runs at Phase 3, after the commits and in this Circle after the tag, so it
substitutes for review in *finding* and not in *preventing* — the v10.0.0 tag went out over the
uncovered range and the findings shaped v10.0.1 instead. And the two passes are not independent
evidence: the second pass found a defect the first pass created.

**Option 3 is still unimplemented.** `bin/fusion-review-coverage` returns the unfiltered count, so
both passes split it by hand. The record's own prediction that an unfiltered number "will be argued
with every time it fires" held on both.

---
Answered: 260816-1500-orchestrator-session.md `## Decisions answered by the user` — options 3 then 1: filter the uncovered set to commits touching shipped files, keep coverage advisory with the gap named in the closure note. User answered inline 2026-08-16.
Implemented:
Deferred:
Superseded by:
Retired:

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`). Answer recorded, not yet realised — marker stays `_a_`. Option 1 (advisory coverage, gap named in the closure note) is the standing behaviour and was followed at the v10 close. Option 3, filtering the uncovered set to commits touching shipped files, is absent: `hooks/lib/review-coverage.ts` filters the uncovered set only by coverage (`:612`) and mentions no shipped-file predicate anywhere.

---
**Reconciliation 260819-1400 (reconciler, domain `code`, HEAD `e435f03` / `v10.3.0`) — marker
unchanged at `_a_`; option 1 is in force, option 3 is still absent, and `hooks/lib/review-coverage.ts`
has been edited since the last check without acquiring it.**

Re-verified at HEAD rather than inherited from the 260817-1836 note, because `hooks/lib/review-coverage.ts`
is one of the files `2552586..HEAD` touched. It still filters the uncovered set by coverage alone —
`const uncovered = commits.filter((c) => !covered.has(c.full))` at `:612` — and no predicate anywhere
in the module distinguishes a commit touching a shipped file from one touching only
`fusion-workbench/`. `grep -n 'shipped\|non-workbench'` over the file returns nothing.

So the unfiltered number is what every consumer of this helper still reads, and the record's own
prediction about it has now held on four consecutive passes: an unfiltered count "will be argued with
every time it fires". Two of those arguments are recorded in this record's own body.

**What binds a deep change.** A Circle may close over an uncovered review range — that is settled, and
`bin/fusion-review-coverage` reports and never blocks. What is not settled is the number a closure
note quotes: it includes tracking-file commits a reviewer has nothing to open in, so any rule, gate or
prose written against it inherits the padding the answer chose to remove and has not. A deep change
that produces many workbench-only commits will inflate that count in exactly the way option 3 was
answered to prevent.

---
**Reconciliation 260823-1446 (reconciler, domain `code`, range `3ee8eaf..7cd79f1`) — marker unchanged at
`_a_`. Option 1 is in force and was applied; option 3 is still absent from the helper, now across four
consecutive checks.**

`hooks/lib/review-coverage.ts` contains no occurrence of `shipped` in any casing, so the uncovered set is
still filtered by coverage alone. The shipped-file split the answer calls for was therefore performed by
hand in this pass, which is what option 3 exists to stop being a hand operation.

Measured at HEAD: `commits=19 reviews=3 unusable=0 uncovered=2 verdict=uncovered`. Split by hand —
`1544224` touches only `fusion-workbench/` (the Turn 3 review file and the seven records it filed) and
drops out of the filtered set; `7cd79f1` touches `rules/circle-records.md`,
`hooks/lib/__tests__/workbench-citation-lint.test.ts`, `hooks/lib/__tests__/reference-resolution-lint.test.ts`
and two goldens, and stands. One uncovered shipped commit, in the commit that lands the repairs the Turn 3
review itself ordered.

**That shape is this record's own cross-referenced case, met again.**
`260814-2153_*_the-commit-that-closes-the-last-reviews-own-high-finding-is-the-one-commit-no-review-opens.md`
names exactly it: the commit that discharges a review's findings is the one commit no review opens, because
the review that would cover it is the one that ordered the work. Nothing here is new evidence for a
different answer; it is a fourth data point for the one already given.

**Applied as answered, and stated so the next pass does not re-derive it.** Coverage is advisory, so the
uncovered shipped commit does **not** flag the Artifact↔Grounding edge of this session's Coherence verdict.
It is carried as a named residual for the Circle's `## Closure note`, which is what option 1 prescribes.
This is the fourth consecutive verdict computed under this rule and the fourth to reach the same reading,
which is the consistency the record was filed to buy.

---
**Reconciliation 260824-1637** (reconciler, domain `code`, Phase 3 of session `260824-0539`, HEAD `cf7a5b0`; log `260824-1637-reconciliation.md`) — marker unchanged at `_a_`. **Fifth consecutive check; option 1 applied again, option 3 still absent from the helper.** `grep -in 'shipped' hooks/lib/review-coverage.ts` returns nothing, so the uncovered set is still filtered by coverage alone and the shipped-file split was again performed by hand.

Measured over `e209011..cf7a5b0`: `commits=18 reviews=2 unusable=0 uncovered=1 verdict=uncovered`. Split by hand — `cf7a5b0` touches four files, all under `fusion-workbench/` (the second review file and the three records it filed), so the filtered set is **empty**. There is no uncovered shipped commit in this Circle at all, which is the first time in the five checks that the hand split has emptied the set.

**Applied as answered.** Coverage is advisory, so the uncovered commit does not flag the Artifact↔Grounding edge of this session's Coherence verdict, and it is carried as a named residual for the Circle's `## Closure note`.

**One new consequence this record did not predict, and it is filed.** The Circle's plan wrote a release precondition in the letter of `uncovered=0`, which this record answered eight days earlier is advisory; and the review commit's own message quoted `uncovered=0 verdict=covered`, true when measured and false the moment the commit landed. Record: `260824-1637_*_the-circles-release-precondition-is-written-against-a-measurement-that-cannot-read-zero-at-closure.md`. Separately, `agents/orchestrator.md` Step 3c still tells every session that this decision is unfiled, eight days after it was answered; filed as `260824-1637_*_an-always-loaded-prompt-states-that-the-uncovered-range-decision-is-unfiled-eight-days-after-it-was-answered.md`.
