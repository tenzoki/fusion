The control-file predicate test no longer sees what the codec admits
---
`hooks/lib/__tests__/fusion-stores.test.ts` (lines 28 to 33) holds the hooks copy of `isControlFile` equal to the codec's by comparing the string literals on the codec's `export const isControlFile = …` line. Since plan step 3 the codec admits `campaign.json` through the constant `CAMPAIGN_FILE` (`codec/src/store.ts`, lines 323 and 460), which that comparison does not see. The test stays green while the two predicates differ: the codec's admits `campaign.json`, the hooks copy in `hooks/lib/stores.ts` does not.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence.** Reported by the code-implementer on plan step 3; the orchestrator read the three cited places. `cd hooks && npm test` is green at the step-3 tree (1 255 passed), which is the fault: the gate that exists to catch this divergence did not move. The comment on `CAMPAIGN_RECORD` in `hooks/lib/stores.ts` describes the hooks copy only.

**Acceptance.** The test fails when the codec's predicate admits a name the hooks copy refuses (resolved constants included), and the two predicates agree on `campaign.json`, whichever way that is decided: the hooks copy admits it, or the difference is stated and held by the test as intended.

**Cross-references:** `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md` (steps 2 and 3)

---
Resolved: the difference is intended and is now held. The hooks' `isControlFile` in `hooks/lib/stores.ts` names the control half of a pair and a campaign has no narrative; the function's comment says so and names the test, and no behaviour of `stores.ts` changed. `hooks/lib/__tests__/fusion-stores.test.ts` reads both predicate lines term by term, resolves each constant to its string in its own file (`CAMPAIGN_FILE` and `EVIDENCE_SUFFIX` on the codec's side), and holds the codec's names equal to the hooks' names plus `CAMPAIGN_RECORD`; a term of another shape, or a constant that resolves to no string, throws instead of being skipped. Its sensitivity case adds one further name to the codec's line, as a literal and behind a constant, and the comparison fails each time. `isControlFile` is held `false` for `campaign.json`.
