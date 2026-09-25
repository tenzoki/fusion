The Circle's Grounding lists `guard-state-shape.test.ts` among the test files whose subject is being removed, and its subject survives

---

`260816-1741-guard-becomes-observation-only` `### The code sites, measured` lists six test files "whose subject is being removed" and names `guard-state-shape.test.ts` among them. Its subject is the state-load coercion seam in `hooks/lib/guard-state-file.ts`, which this Circle does not touch and which keeps two callers after the removal (`hooks/lib/review-coverage.ts:730` and `hooks/lib/staging-drift.ts:557`).

The file's own header says so and says why the confusion is easy to make: the state file its rows seed has moved three times, from `churn.json` to `state-drift.json` to `review-coverage.json`, each time because the mechanism it had borrowed from was removed (`guard-state-shape.test.ts:21-32`). The current seed is `review-coverage.json` (`:99`), not `escalation.json`. Nothing in the file mentions the halt or the block counter.

---

Deleting it would have removed the only executable coverage of the seam that turns a shape-valid but wrong state file into the empty state instead of a thrown field access, which is the defect measured in issue `260809-1101`: the tracker's reply reached stdout empty and every later tool call in that project repeated it.

The plan for this Circle, `260816-1915_*_the-compliance-guard-becomes-observation-only.md` step 9, keeps the file and states the correction in its `## Current State`. This record exists so the Grounding's own claim is corrected rather than only worked around, and so a later reader of the Circle record does not act on the list as written.

The other five names on that list were checked against HEAD and hold: `escalation.test.ts`, `guard-escalation-shape.test.ts`, `guard-halt-event.test.ts`, `clear-halt-concurrent-halt.test.ts` and `legacy-halt-clearing.test.ts` are each about the halt, the counter or the clearing script. The Grounding is right about the last of them being sequenced rather than deleted on sight.

---
Acted on by step 9, 2026-08-16, and left OPEN, because only half of it is
discharged.

The half that is discharged: `guard-state-shape.test.ts` was not deleted, was not
edited, and is green after the whole test surface followed the removal. Its
subject is the state-load coercion seam in `lib/guard-state-file.ts`, which keeps
its two callers, and its rows still seed `review-coverage.json`.

The half that is not: the Grounding's own list still names the file. Correcting
it means editing `_t_circle.md`, which is outside the file set of step 9 and of
every remaining step in this plan. It belongs to whoever closes the Circle or to
the curator pass step 16 schedules.

One thing this record did not say, worth recording beside it: the coercion cases
in `guard-escalation-shape.test.ts` — "the two coercions that lean restrictive" —
read the same seam through `escalation.json` and were deleted with that file.
Nothing was lost, because `guard-state-shape.test.ts` covers the seam through the
state file that survives; the point is that the two files looked alike and only
one of them was about the counter.

History: `260816-2250-step-9-test-surface-follows-the-removal.md`.

---
Reconciliation 2026-08-17, Phase 3. **Left OPEN. The half this record itself named as
undischarged is still undischarged, and it is now due.**

Re-verified, not re-asserted. `hooks/lib/guard-state-file.ts` is present and keeps its two
callers; `hooks/lib/__tests__/guard-state-shape.test.ts` is present and green inside a suite of
35 files and 653 tests that passes whole. So the file was correctly kept and the correction this
record forced was correctly applied to the plan.

What has not moved: `_t_circle.md:101` still lists `guard-state-shape.test.ts` among the "Test
files whose subject is being removed". The Circle record is not the reconciler's to edit — it is
transitioned by the orchestrator, the playmaker or the shaper — so this stays open and is
surfaced to the closure step instead. It is one of two records whose remaining half is a
correction to this Circle's own Grounding, the other being
`260816-1917_*_the-groundings-text-surface-list-omits-three-surfaces-that-state-the-halt-as-live.md`.
**Both are due at the `_t_` → `_c_`/`_b_` transition**, because after it the record is history and
a closed Circle would carry two false statements about its own scope permanently.

---

**Resolved 2026-08-17, Turn 4.** The name is out of the list in `_t_circle.md:101`, and an
explanatory paragraph beneath it records that the file was measured and kept rather than
overlooked — `hooks/lib/guard-state-file.ts` keeps its two callers, `review-coverage.ts:118` and
`staging-drift.ts:128`, and `guard-state-shape.test.ts` is green at 9 of 9. Written by shaper in
portfolio-activation mode, dispatched at the Phase-3 Rebalance gate on the user's explicit naming
of that mode. Correction made before the `_t_` → `_c_` transition, which was the deadline: after it
the record is history.
