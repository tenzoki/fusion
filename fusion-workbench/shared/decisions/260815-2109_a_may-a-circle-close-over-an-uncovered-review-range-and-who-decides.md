# May a Circle close over an uncovered review range, and who decides?

---
**Domain:** code
**Status:** answered
**Filed by:** reconciler
**Cross-references:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1455_c_turn-3s-reviewers-were-dispatched-on-four-of-the-seven-uncovered-commits-for-the-third-turn-running.md`, `shared/issues/260814-2017_c_turn-5-edited-three-shipped-surfaces-including-an-always-on-rule-file-and-no-review-pass-ever-opened-them.md`, `shared/issues/260814-2153_o_the-commit-that-closes-the-last-reviews-own-high-finding-is-the-one-commit-no-review-opens.md`, `shared/issues/260814-2033_o_a-resume-that-re-enters-at-phase-3-never-asks-whether-the-turn-it-skips-past-was-reviewed.md`, `shared/history/260814-2306-orchestrator-session.md` (three `## Coherence` sections)

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

---
Answered: shared/history/260816-1500-orchestrator-session.md `## Decisions answered by the user` — options 3 then 1: filter the uncovered set to commits touching shipped files, keep coverage advisory with the gap named in the closure note. User answered inline 2026-08-16.
Implemented:
Deferred:
Superseded by:
Retired:
