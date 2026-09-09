# Which quantity does the head list protect: a gate's evaluation rate, or its rate of returning to the user?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260909-2215-gate-firing-read-before-the-cut.md `### What a `coherence_review` row does and does not say`; 260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md step A1; 260909-2215_*_step-a1s-denominator-names-a-field-eleven-rows-carry-and-the-plans-own-figure-uses-ninety-four.md

---

## Question

Step A1 protects from deletion any gate whose firing rate exceeds half its population, under the
label **returns to the user**. The criterion and the label measure different quantities, and on the
per-Turn Coherence gate they differ by about a factor of eleven. A `coherence_review` row records
that the gate was **evaluated**; the rows that record it **stopping and asking** are the verdict
`review-needed` and the Rebalance rows that verdict feeds. Which quantity the protection attaches to
decides whether that gate survives step C1, so the question has to be answered before C1 is drafted.

## Options

1. **Evaluation rate** — the criterion as written. The Coherence gate is protected (92.6 % in
   fusion, above half in all three measured projects) and C1 may not delete it.
   - Pros: mechanical, reads one row kind, needs no verdict field.
   - Cons: protects a gate on the strength of it running, not on it being useful. Most evaluations
     returned `ok` and cost the user nothing to skip.
2. **Rate of returning to the user** — the label as written. The Coherence gate is not protected
   under any denominator: 8 `review-needed` verdicts against 169 Turns is 4.7 %, and 8 of the 32
   rows whose verdict is readable is 25 %.
   - Pros: measures what a gate costs and gives the user, which is what the cut is about.
   - Cons: the verdict field is readable on only 32 of 87 rows, so the true rate is bounded rather
     than known, and the analysis marks the direction of that bias as inference.
3. **Both, protecting on either** — a gate survives if it clears half on either quantity.
   - Pros: never deletes a gate that any reading defends.
   - Cons: protects nearly everything the cut was meant to reach, which is close to abandoning it.

## Constraints

The answer binds step C1 and nothing earlier; steps A1 to A3 are committed and are not reopened.
Whichever quantity is chosen, the denominator ambiguity filed as
`260909-2215_*_step-a1s-denominator-names-a-field-eleven-rows-carry-and-the-plans-own-figure-uses-ninety-four.md`
still has to be settled, because it moves every rate by about 8.5.

## Recommendation

None from the orchestrator. The analysis states both facts and declines to resolve them, on the
ground that the choice is the user's; this record carries that choice rather than pre-empting it.
