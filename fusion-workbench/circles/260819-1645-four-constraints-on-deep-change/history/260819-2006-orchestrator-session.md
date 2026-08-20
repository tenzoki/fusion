# Orchestrator Session — 260819-2006

**Directive:** See the Circle record's `## Directive` — four ways a deep change to fusion can go wrong unobserved are closed after this Circle.
**Circle:** 260819-1645-four-constraints-on-deep-change
**Mode:** plan (to be produced)
**Status:** In progress

## Setup snapshot

| Item | Value |
|---|---|
| git HEAD at start | b91c01c |
| Turn budget | 12 |
| Domain | code |
| Active Circle | 260819-1645-four-constraints-on-deep-change (activated this session) |
| Open decisions in scope | 1 in the Circle (`260819-1645_o_what-defines-the-citation-gates-corpus…`), 0 open in shared |
| Head-room | `agents/` ~3 300 of 18 000; hook-test surface green |

## Turns

(none yet)

## Coherence

<!-- RECONCILER-OWNED -->

**Verdict:** coherent

Computed 260820-0830 by the reconciler (domain `code`) at HEAD `04db0b0`, over the Circle range
`b91c01c..04db0b0`. Full evidence in
`circles/260819-1645-four-constraints-on-deep-change/history/260820-0830-reconciliation.md`.

**Edges**

- **Artifact↔Grounding — holds.** All five delivery claims verified against the tree rather than
  against their own reports, and none was found false: the compiler is pinned at
  `hooks/package.json:17`, the artifact gate is green and was independently re-derived here from a
  `git archive` of HEAD with a working negative control; all four write tools reach the hook and
  each asserts the trace row's `tool`; the git prohibition sits at `agents/orchestrator.md:522` at a
  measured 395 bytes of the 600 allowed; the citation gate reports **0 violations over 195 corpus
  files**; the deletion form is at `rules/circle-records.md:67`. Six gates re-run, all green. Drift:
  three new defects filed (two structural and latent, one bookkeeping) and one closure that stopped
  one item short of its own fix direction, repaired by this pass. Thirteen defects open in this
  Circle's store, none High, **none of them in a delivered mechanism** — eight are prose accuracy,
  five are gaps around the edges of work that functions.
- **Artifact↔Directive — commits move toward the Directive, with one clause weaker than it reads.**
  All eleven commits advance it and none is orthogonal or away: `ad7ffed` lands constraints 1, 2, 3
  and the deletion form; `4aae336` through `0d4e0f2` are the citation repair, each fixing a class
  the previous one made visible; `bbfc912` arms the gate; `04db0b0` is the tracking catch-up the
  review asked for. On the Directive's two clauses — **the first is met in full** (zero dangling
  citations across every surface the Directive names), **the second is met as scoped and partially
  met as a general claim.** The gate holds exactly the set the user enumerated at shaping: the
  Circle records, `portfolio.md`, the open issues and the live decisions. Two classes sit outside
  it. A record leaves the corpus when it reaches a terminal state carrying whatever citations it
  holds — measured inside this Circle at three real tokens, and this pass found that one of them is
  the deletion form's own worked subject. And the predicate has no `planning/` clause, so the next
  open plan will be a live surface no gate reads; today that class is empty (0 open plans, 24 closed
  ones carrying 170 violations between them), which is why it is latent.
- **Grounding↔Directive — 18 live decisions, 0 conflicting.** No live decision remains in this
  Circle; both it produced reached `_i_`. All 18 `_o_`/`_a_` records sit in `shared/`, and the two
  that bear directly on this Directive agree with it.
  `shared/decisions/260816-0711_*_is-count-pinning-the-convention-for-every-gate-that-reports-what-it-examined.md`
  answered that probe-assertion is the convention and count-pinning the fallback; the new gate
  asserts zero violations recomputed on every run with no pin of any kind, which makes it the first
  gate built since that answer to follow it. Neither the gate nor the record cites the other, so the
  convention is still written down nowhere and the record correctly stays `_a_`.
  `shared/decisions/260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md`
  answered option 1 — the gate is the answer, and the cost lands on whoever meets the red suite. The
  new gate is that shape on a second surface, and the corpus decision re-accepted the same cost in
  almost the same words one Circle later. Its phrase "the reference lint remains the whole
  mechanism" is now literally out of date, which is prose ageing rather than a decision in conflict.

**Rebalance recommendation:** none.

No edge asks for a revision. The Directive is right and was reached; the Grounding's measured figures
were re-measured by the plan and again by this pass and they reproduce; the Artifact does what both
said it would. What is left is thirteen filed defects and two named residuals, which is what an issue
store is for. Convening a Rebalance over them would revise nothing.

**Two things the closure note must carry.**

1. **The range is not fully covered by review.** `bin/fusion-review-coverage` over `b91c01c..HEAD`
   reports `commits=11`, `reviews=1`, `uncovered=1`, `verdict=uncovered`. The uncovered commit is
   `04db0b0`, and it touches `fusion-workbench/` only. Under the standing answer to
   `shared/decisions/260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`
   coverage is advisory and the gap is named at closure; under that record's other answered option,
   recorded and unrealised, a commit touching no shipped file would not count as uncovered at all.
   This does not block closure. It has to be written down.
2. **The gate caught this reconciliation.** Three defect records written by this pass entered the
   corpus on save and the gate went red on four citations inside them. All four were verbatim
   quotations of the dead tokens under discussion; all four were fenced per
   `rules/fusion-workbench-conventions.md:355`, and nothing was exempted or allowlisted. It is the
   second live catch since arming and the first on a party other than the orchestrator, which is
   direct evidence for the Directive's second clause on the surfaces it does reach.

**`## Turn log` and `## Turns` are empty and that is not drift.** Phase 4 has not run, and both are
written at the Turn boundary. The Circle record's head fields and its `## Directive` pointer literal
were checked against `rules/circle-records.md` and are correct as they stand.
