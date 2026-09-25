# Analyst session: the C5 check of the re-sent-volume cost argument

**Date:** 2026-09-07 16:57
**Agent:** analyst
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>, checkout 5e8248d7
**Circle:** 260906-2258-bounded-executor-dispatches
**Dispatched by:** orchestrator, Step 1 of `260907-1450_*_plan-bounded-executor-dispatches.md`

## What was asked

Execute step 1 of the plan and nothing else: file the standalone re-derivation C5 requires, under its
nine acceptance criteria, taking no new measurement and rediscovering none of the three corrections
the Circle record already carries. Close with the verdict sentence in one of the two mandated forms.
The step gates every other step in the plan.

## What was done

Read the source analysis `260812-0303-simplify-speed-and-why-rules-do-not-hold.md` in full, the
`## Grounding snapshot` of `_t_circle.md`, C5 and `## Stops when` in the specification, step 1 of the
plan, the held decision
`260907-0820_*_is-a-token-side-measurement-of-the-splits-net-cost-worth-building.md`, and Findings 2
to 4 of the first planability check.

Re-derived the volume law from the source's own 800-tokens-per-call parameter: V(N) = 800·N(N−1)/2,
which reproduces 15 920 000 and 3 920 000 to the digit. Derived the exact split ratio k(N−1)/(N−k)
(4.061 at the worked example, not 4) and the absolute saving 400·N²(1−1/k), from which the
diminishing-returns result follows: the first split captures half of everything a split can save,
four dispatches three quarters, eight dispatches seven eighths. Neither result is in the source, the
specification or the record.

Took the API price ratios and the cacheability refutation from the first planability check's Finding
3 rather than re-verifying them, and worked out what follows for the law: caching reprices the volume
without changing it, so every ratio survives and the absolute saving shrinks by about an order of
magnitude. Named the three terms a split adds that the volume law has no term for, and stated the
structural consequence that a quadratic saving and a linear penalty must cross somewhere, with the
three inputs that would locate the crossing. Did not perform that break-even calculation: it is
option 3 of the open decision record.

No new measurement, no instrumentation, no before-and-after comparison. Every figure is either
arithmetic on a parameter already on file or a quotation from a filed document.

## What was found

The check passes all seven of C5's process criteria, and the verdict on the law is negative. The
volume arithmetic is exact and the 1/k dependence holds. The two clauses that carry the source's
cell from a token count to a cost saving are both false: "non-cacheable" is refuted at the API level,
and "handoff is measured at zero" is a minute figure standing in for a token cost, unsupported in the
argument's currency and not reproduced by the project's own later reading in its own currency. The
failure rests on determined findings, not on the undetermined net sign, which is recorded as
undetermined and passes.

Three refinements to filed documents, none of them a contradiction the record gets wrong:

- The first planability check's "the ratio is exactly k" is the approximation; the snapshot's
  "approximately k" is right.
- The snapshot's third paragraph states the 1.25x prefix write without its condition; the paragraph
  after it supplies the condition, so the record as a whole is right and that paragraph read alone is
  not.
- Of the three handoff-gap figures, the 39.2 percent of gaps past five minutes and the median price
  the cache question; the 97.7 percent of handoff minutes prices something else.

Two further findings: the measured handoff population is today's, not the continuation population the
mechanism would create; and C5 carries nine acceptance criteria while the plan's step 1 counts eight,
skipping the record-replacement criterion, which is already satisfied.

## Files written

- `260907-1657-c5-cost-argument-check.md` in this Circle's analysis store
- this history file

Nothing else was written. The specification, the plan and the Circle record were read only.

## Verification

The report's verdict sentence takes the second mandated form. `grep -c` over it: `ratio` 20, `1/k` 7,
`caching counter-effect` 2, `five minutes` 5, `five-minute` 2. `bin/fusion-prose-metric` reports 0
em-dashes over 4 131 prose words against a permitted 4. Tree read at HEAD `223f916a`, clean, one
commit ahead of origin. No file this check read moved during the run.
