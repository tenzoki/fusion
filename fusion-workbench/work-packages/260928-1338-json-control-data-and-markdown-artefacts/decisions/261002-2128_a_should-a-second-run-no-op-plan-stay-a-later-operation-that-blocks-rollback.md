# Should a second-run no-op `plan` stay a later operation that blocks every later rollback?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-1338-json-control-data-and-markdown-artefacts.md, 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md, 261002-1529_*_fj04-6a-addendum-departures-1-5.md

---

## Question

FJ04 step 6 found that a `plan` sent after activation (the second-run no-op) stores an answer under an id that is not scheduled. Under the addendum's single definition of a later operation (`codec/fixtures/prior/REQUESTS.md:1939`) that answer is a later operation, so every rollback after it refuses (`:1806`, "No operation is exempt by its name"). The no-op itself adds no refusal (`:1940`), but it ends the possibility of rolling back.

A consultant review (2026-10-02, chat only) read this as what Prior's text prescribes, not a defect: exemption by op name was withdrawn on purpose (C10 in the plan's discussion, plan line 227), and the exempt set is fixed at exactly three entries (`:1955`). The gap is that no text stated the consequence. Step 6 lands it as a stated limit: one sentence in the addendum's Refusals bullet and in `codec/README.md`, with hosts told to read state with `survey` rather than `plan` while a rollback may still be wanted.

Prior could not be asked while the user was away. This record holds the question for when contact resumes.

## Options

1. **Keep it as the stated limit.** No departure; refusing an extra case is stricter than section 8.4 (`:1417`).
   - Pros: no change to the fixed exempt set; nothing to ask Prior to ratify.
   - Cons: a careless `plan` after activation costs the rollback.
2. **Recognise a no-op answer by digest.** A stored answer whose request digest equals a rebuilt `plan` request (from the index's `proposal`, as `:1939` already does for the scheduled plan) and whose answer is the no-op shape is not a later operation.
   - Pros: rollback stays available after a harmless re-run.
   - Cons: a seventh departure; the exempt set grows with every repeated no-op; needs Prior's ruling.
3. **The no-op stores no answer.**
   - Pros: nothing to exempt.
   - Cons: breaks the replay rule (`:1415`) and `:1776`; a larger departure than option 2.

## Recommendation

Option 1 now, as landed by step 6; put option 2 to Prior when contact resumes. Advisory only.

## Status

2026-10-03: the user forwarded the question to Prior; the answer is pending. Step 6 landed option 1 as a stated limit meanwhile.

## Answer

Answered 2026-10-03 by the user (Kai Stalmann), in chat ("a1"), adopting Prior's ruling in Prior commit `d0fce6c`, `docs/design/fusion-fj04-noop-rollback-prior-response.md`: option 2 with digest-verified recognition. A successful, verified no-op of the same migration does not by itself prevent rollback. Its stored answer and replay behaviour are kept; answers are never deleted to make rollback possible (option 3 rejected).

The binding Prior specifies, in short: the no-op is recognised only when the stored answer is a successful `migration` result with `no_op: true` and matching operation and migration ids; its request digest matches a reconstructed `phase: plan` request under that operation id with the frozen index's exact proposal path and hash; its receipt path and hash and manifest revision match this migration's; and the codec produced it on its no-write second-run path. `later_operations` stays a diagnostic; the rollback audit's exception set grows by these proven no-ops. Each accepted no-op's operation id, request digest and stored-answer hash is frozen in the rollback binding at the first rollback intent; later chunks verify it. Ordinary work followed by a no-op still refuses. Required regression cases and the superseding of recorded session base A are listed in Prior's text, which governs. The change goes into the FJ04 candidate before its digest is frozen.
