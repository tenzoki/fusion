# Which other-kind hits reach Prior as "another record type" at the FJ03d hand-over?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261005-1016-fj03d-step10-classification-re-run-at-the-side-branch-head.md, 261005-0856_*_fj03d-step10-class-reading-for-borderline-hits.md, 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

---

## Question

Step 10 classed 137 hits as other kind at `fj03d` `29dac3c5`: `codec-contract` 93, `history` 18, `homonym` 9, `analysis-head` 7, `jargon-example` 6, `kept-gate-string` 4. Prior's §7 names its third class "nachweislich anderer Record-Typ". The user's ruling of 2026-10-05 already takes the 19 hits without control grammar (homonym, jargon example, kept gate string) out of that description. Of the remaining 118, only the 7 `analysis-head` hits are another record type in the strict sense. Step 17 writes the hand-over section, so the answer is needed before step 17 is dispatched and not earlier.

## Options

1. **Hand over 118 as "anderer Record-Typ", as the plan's gloss has it** — the gloss of other kind names history and the codec's own contract.
   - Pros: no further change to the plan; matches step 2's reading.
   - Cons: 111 of the 118 are described by a term that is not literally true of them.
2. **Hand over 7 as "anderer Record-Typ" and name `codec-contract` and `history` apart, like the 19** — the section states each basis count under its own description.
   - Pros: every count carries a true description; the report already gives both counts.
   - Cons: Prior's three-class sentence is answered with more than three figures, which Prior may or may not accept as meeting §7.

## Constraints

The per-basis counts go to Prior in either case (plan step 17, as amended 2026-10-05). No hit may be reported as another record type when the control grammar is absent from it.

---
Answered: 261007-0707-other-kind-hits-prior-record-type.md `## Recommendation` — two rulings of 2026-10-07: (i) `codec/` is read per line under rulings (a) to (d) like every other directory: 36 `migrate` hits to class 2, 14 `name-grammar` and 41 `json` to class 1, 2 homonyms apart, so no codec hit stays under "anderer Record-Typ"; (ii) the 16 `history` lines are stated apart with their reason, never as another record type. Class 3 holds the 7 `analysis-head` hits; the fold re-takes as 233 / 155 / 7 / 38 apart over 433; ruled by user, Kai Stalmann <ks@qantr.com>.

Implemented: `e7695d9c`, `codec/fixtures/prior/REQUESTS.md` `### The classification (step 10, at fj03d 29dac3c5)` folds the hits 233 / 155 / 7 / 38 as the answer rules; Prior accepted the fold at Prior `7da6690`.
