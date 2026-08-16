The Circle's Grounding lists `guard-state-shape.test.ts` among the test files whose subject is being removed, and its subject survives

---

`circles/260816-1741-guard-becomes-observation-only/_t_circle.md` `### The code sites, measured` lists six test files "whose subject is being removed" and names `guard-state-shape.test.ts` among them. Its subject is the state-load coercion seam in `hooks/lib/guard-state-file.ts`, which this Circle does not touch and which keeps two callers after the removal (`hooks/lib/review-coverage.ts:730` and `hooks/lib/staging-drift.ts:557`).

The file's own header says so and says why the confusion is easy to make: the state file its rows seed has moved three times, from `churn.json` to `state-drift.json` to `review-coverage.json`, each time because the mechanism it had borrowed from was removed (`guard-state-shape.test.ts:21-32`). The current seed is `review-coverage.json` (`:99`), not `escalation.json`. Nothing in the file mentions the halt or the block counter.

---

Deleting it would have removed the only executable coverage of the seam that turns a shape-valid but wrong state file into the empty state instead of a thrown field access, which is the defect measured in issue `260809-1101`: the tracker's reply reached stdout empty and every later tool call in that project repeated it.

The plan for this Circle, `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_o_the-compliance-guard-becomes-observation-only.md` step 9, keeps the file and states the correction in its `## Current State`. This record exists so the Grounding's own claim is corrected rather than only worked around, and so a later reader of the Circle record does not act on the list as written.

The other five names on that list were checked against HEAD and hold: `escalation.test.ts`, `guard-escalation-shape.test.ts`, `guard-halt-event.test.ts`, `clear-halt-concurrent-halt.test.ts` and `legacy-halt-clearing.test.ts` are each about the halt, the counter or the clearing script. The Grounding is right about the last of them being sequenced rather than deleted on sight.
