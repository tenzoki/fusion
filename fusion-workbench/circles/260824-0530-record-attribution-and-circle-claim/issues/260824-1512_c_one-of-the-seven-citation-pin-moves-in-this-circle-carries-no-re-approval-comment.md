One of the seven citation-pin moves in this Circle carries no re-approval comment
---
`hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE` moved at every one of the eight commits in `e209011..9efe19f`. Six of those moves carry a `// Re-approved 2026-08-24 (C3 step N)` comment naming the delta and the tokens that produced it. The move at `3ba7a46` (plan steps 4 and 5, the `bin/fusion-identity` helper and its test) carries none, and it is the largest of them: paths 1291 -> 1303, anchors 180 -> 181, records 117 -> 119. Fifteen newly counted citation tokens are unaccounted for in the file's own record.
---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

Found at plan step 11 while checking the fourth acceptance clause, "no baseline map differs from `HEAD` before this Circle". The three growth-baseline maps in `hooks/lib/__tests__/surface-growth-bound.test.ts` and `RULE_BASELINE` in `hooks/lib/__tests__/rules-emission-golden.test.ts` are byte-identical across the range, so the clause holds. The citation pin is a different instrument and moved by design; the defect is in what the moves record, not that they happened.

The comment chain reads as continuous and is not: step 3's entry ends at `paths 1295 -> 1291`, and the next entry, step 6, opens at `paths 1303 -> 1304`. A later reader following the chain sees no gap, because nothing in the file says twelve path citations arrived between them.

What that costs is exactly what the comment convention buys. The pin is the one gate whose approval is a human judgement rather than a measurement, so the comment is the only evidence that a move was reviewed rather than fitted to a red run. For `3ba7a46` there is none, and reconstructing it now means re-scanning `bin/fusion-identity`, `hooks/lib/__tests__/fusion-identity.test.ts` and the two configuration files that commit touched.

Fix direction: append one `// Re-approved 2026-08-24 (C3 steps 4-5)` line in the file's established form, naming the delta above and the tokens behind it, placed between the step-3 and step-6 entries so the chain reads in order. No number changes; `npm test` is green at both the current pin and the current corpus.

Not fixed here: plan step 11 permits one file, the regenerated surface golden, and this is a different file.

---
**Reconciliation 260824-1637** (reconciler, domain `code`, Phase 3 of session `260824-0539`, HEAD `cf7a5b0`; log `circles/260824-0530-record-attribution-and-circle-claim/history/260824-1637-reconciliation.md`) — **STAYS `_o_`.** Re-checked at HEAD and unchanged. `grep -n 'Re-approved' hooks/lib/__tests__/reference-resolution-lint.test.ts` returns sixteen entries; the C3 chain runs step 3 at `:586`, then step 6 at `:592` opening on `paths 1303 -> 1304`. No entry names `3ba7a46` or plan steps 4 and 5, so the twelve-path gap the record measures is still unaccounted for in the file's own record. Two later re-approvals were added after this record was filed (step 10 at `:596` and the citation repairs at `:597`), and neither closes the gap.

---
Resolved: fixed — one `// Re-approved 2026-08-24 (C3 steps 4-5, 3ba7a46 …)` line stands between the step-3 and step-6 entries in `hooks/lib/__tests__/reference-resolution-lint.test.ts`, written after the fact from `git show 3ba7a46` and saying so, naming the 1291 -> 1303 / 180 -> 181 / 117 -> 119 delta and the sources behind it; no number moved for it; `grep -n "C3 steps 4-5" hooks/lib/__tests__/reference-resolution-lint.test.ts`
