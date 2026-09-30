Scope resolves a package the codec's own validation refuses, while the order reader names the same record unreadable
---
`hooks/lib/scope.ts` takes a package row as readable when `list` carries no `problem`, but `list` and `show` never schema-check (`codec/src/store.ts` `readPair` only strict-parses and reads `schema`/`kind`). So a claimed package whose control file is schema-invalid, whose narrative is missing, or whose `status` is outside the five values is resolved or skipped silently, where the plan's contract calls it an unreadable package and exit 3. `hooks/lib/work-graph.ts` reads the same records through `reconcile` `records` and moves them to `unreadable`, so the two readers disagree on one record.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** High
**Cross-references:** 260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md, 260930-1446-reviewer-fj02b-and-fj03a-record-client-scope-and-order.md

Evidence (reproduced 2026-09-30 on a scratch workbench written by the committed bundle, one package claimed for `a1b2c3d4`, then `node hooks/dist/scope.js claimed <wb> a1b2c3d4`):

- An extra top-level field in `package.json` (`validate`: `schema-invalid/schema`, additionalProperties): exit 0, both `PACKAGE=` and `CONTAINER=` printed, naming the scratch package `260930-1000-a` under the container store.
- The narrative deleted (`validate`: `unresolved-reference/narrative-missing`): exit 0, the same two lines, `PACKAGE=` naming a file that does not exist. `hooks/lib/scope.ts` `held` checks `narrative === null` only, never `narrative.sha256 === null`.
- Same store, `node hooks/dist/order.js`: `unreadable=260930-1000-a: unresolved-reference/narrative-missing`, the package absent from the rows.
- By reading: `hooks/lib/scope.ts` `listClaimed` does `if (row.status !== "claimed") continue;`, so a row with `status` `"Claimed"` or any value outside the five is skipped as unclaimed. `hooks/lib/work-graph.ts` `readWorkGraph` names such a row `status-unreadable`. A hand-resolved merge that damages `status` on this checkout's package therefore answers `none`, exit 0, and `bin/fusion-paths` resolves into `shared/`: the silent fall back spec section 7 row 1 forbids.

Contract: the plan's `## Decidability` ("the claimed set is determined exactly when every package row reads"), `## Testing Strategy` ("'fehlende Gegenstücke' and 'Schema-Mismatch' as a reader meets them (step 3, the unreadable package)"). The step 3 test for the unreadable package uses conflict markers only (`hooks/lib/__tests__/fusion-claimed-package.test.ts`, "exit 3, naming the record, when a package does not read"), which strict parsing catches; no test has a schema-invalid or narrative-less package.

Fix direction: one criterion for "a package row reads", shared by both readers. Either scope asks the codec's findings for the package rows (`validate` without a record, or `reconcile` `records`, as the order reader does) and treats any finding on a package row as `unreadable-package`, or the Prior side adds a validity flag to `list` rows (a request, since the bundle does not move in FJ03a). A status outside the five is `unreadable-package` in scope as it is in order.

Acceptance: `bin/fusion-claimed-package` exits 3 with nothing on stdout and the record named on stderr for (a) a claimed package with a schema finding, (b) a claimed package whose narrative is missing, (c) a package row whose `status` is outside the five values; each case red against the current `hooks/lib/scope.ts`. Order and scope classify the same fixture's package the same way.

---
Resolved: `hooks/lib/scope.ts` `claimedBy` now sends `validate` beside `list` and stops, exit 3 `unreadable-package`, on any package row that does not read by `hooks/lib/codec-read.ts` `unreadRow`: a `problem`, a finding of the codec's validation, no id, a status outside the five. `isPackage` judges the named record by the same criterion. `hooks/lib/work-graph.ts` judges every package row by that one function against `reconcile`'s findings, so scope and order classify one record alike. Cases (a) to (c) and conflict markers are one `it.each` in `hooks/lib/__tests__/fusion-claimed-package.test.ts`, red against the old reader (exit 0 with `PACKAGE=`, or exit 0 silent for the status) and green after.
