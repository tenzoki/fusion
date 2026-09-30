The codec's `reconcile` grows with the square of the record count and outlasts the client's timeout from about 1 200 records
---
An unscoped `reconcile` resolves each record reference by reading and parsing every control file in the workbench, so its body is quadratic in the record count. Measured 2026-09-30 on an M2 Max through the committed bundle, empty environment, nobody holding the lock: 2.1 s at 200 records, 11.8 s at 500, 47.1 s at 1 000, 310 s at 2 500. The record client's 70 s timeout (`hooks/lib/record-client.ts` `DEFAULT_TIMEOUT_MS`) is passed from about 1 200 records, so `lib/scope.ts`, `lib/work-graph.ts` and `lib/record-index.ts`, which each send it unscoped, answer `unanswered/timeout` on a workbench of the size request 31 of `codec/fixtures/prior/REQUESTS.md` expects after migration.
---
**Filed by:** code-implementer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260930-1446_*_the-record-clients-timeout-margin-over-the-codecs-lock-wait-is-neither-pinned-nor-sufficient-for-post-wait-work.md

Evidence:
- `codec/src/kernel.ts` `readContext`, `resolveRecordId`: a loop over `controlFiles(wb, wb.root)` with `strictParse(readFileSync(...))` per call. `codec/src/cli/ops.ts` `reconcile` calls `referenceEntry` for every reference site of every control file, and `evidenceEntries` and `edgeEntries` per package, each resolving through it.
- Fixture: 1 250 packages, each with one plan record adopted through `adopt-plan`, created through the codec's own `dispatch`; the 200, 500 and 1 000 record figures are subsets of it (whole package directories, no `.json-state/`). At 2 500 records `list` answers in 0.41 s and `validate` in 0.42 s, so the growth is `reconcile`'s alone.
- `create` resolves its new id through the same loop, which is why it takes 0.43 to 0.67 s at 2 500 records against 0.24 s for `transition`.

Acceptance: an unscoped `reconcile` over the 2 500-record fixture answers inside the client's `POST_WAIT_MARGIN_MS` (5 s), and its answer is byte-identical to today's. The fix is in the codec (an id index built once per read), so it is the Prior side's to rule on before the bundle moves.
