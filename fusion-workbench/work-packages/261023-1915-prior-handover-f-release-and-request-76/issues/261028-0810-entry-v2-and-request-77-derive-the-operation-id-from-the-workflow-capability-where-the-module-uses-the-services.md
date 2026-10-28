entry.v2 and request 77 derive the operation id from the workflow capability, where the module and Prior use the invoked service's
---
`catalog/workflows/entry.v2.json` (frozen, `6ba29c8b…`), `compose` step, `input_from.host_services.operation_id`, says the id is `"repair:"` + sha256 of `capability + "\n" + workflow_id + "\n" + slot` "with capability fusion.entry.v2". Request 77 repeats it (`codec/fixtures/prior/REQUESTS.md`, request 77, `` ### `fusion.entry.v2` and `host.entry.integrate.v1` ``, "The common contract, as `entry.v2` states it"). The module computes it with the invoked host service's capability (`host.role.compose.v1`, `host.workspace.v1`, `host.entry.integrate.v1`, `host.workbench.v1`), and so does Prior.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** data-implementer
**Cross-references:** 261028-0810-reviewer-closing-review-of-prior-handover-f-13-4-1-and-request-77.md; 261027-2337-entry-v2-workbench-step-reads-a-control-record-the-integration-deleted.md and 261027-2337-entry-v2-receipt-check-and-name-status-pattern-admit-dot-dot-path-segments.md (the two v2 defects request 77 question 12 already carries into a v3)

**Evidence.**
- Module: `adapters/prior/fusionmodule/internal/hostsvc/hostsvc.go` `call`: `api.RepairOperationID(capability, c.WorkflowID, slot)`, where `capability` is the service the method calls (`Compose` passes `api.RoleComposeCapability`, `EntryIntegrate` passes `EntryIntegrateCapability`, the reads pass `api.WorkbenchCapability`).
- Test that holds it: `internal/hostsvc/hostsvc_test.go` `TestEveryRequestIsClosedUnderItsSlot` asserts `sent.OperationID == api.RepairOperationID(sent.Capability, workflowID, tc.slot)`; `internal/hostsvc/entry_test.go` `TestEntryIntegrateSendsTheRunUnderSlotIntegration` uses `api.RepairOperationID(EntryIntegrateCapability, …)`.
- Fake host: `internal/fixture/entry.go` `decodeProposedEntryCall` checks `inv.OperationID != api.RepairOperationID(inv.Capability, …)`.
- Prior at `187df6f`: `moduleapi/v1/repair_wire.go:141` checks `RepairOperationID(inv.Capability, call.WorkflowID, slot)`; `internal/fusionhost/repair_integration.go:180` derives `RepairOperationID(api.IntegrateCapability, …)`. Answer 69 (`Prior: docs/design/fusion-repair-contract-prior-response.md:84-90`) says only "capability", beside "the existing role operation ID remains `capability + ":" + run_id`", where capability is the service's.
- Origin: withdrawn `workflows/entry.v1.json` at `ca9eb60d` said "derived with capability fusion.entry.v1"; `workflows/repair.v1.json` at `v13.1.0` said "capability" with no gloss. The gloss came in with entry v1 and was carried into v2 and request 77.

A Prior implementer who follows the frozen text derives a different id than the module sends, and the host's admission check refuses every request-69 call and the integrate call.

**Fix direction.** In the v3 that request 77 question 12 already promises, state the capability as the invoked host service's, as answer 69 does. Whether request 77 gets an appended correction line before Prior answers (the file is append-only; no line above is edited) is the user's ruling. The v2 bytes do not change.

**Acceptance.**
- The v3 workflow's `operation_id` text names the invoked host service's capability and no workflow capability.
- `REQUESTS.md` carries, appended after request 77 or in the request that delivers the v3, a line telling Prior the v2 gloss is wrong, before any answer to 77 is recorded as accepted.
- `cd catalog && npm test` exits 0, and `git diff --exit-code -- catalog/workflows/entry.v2.json` exits 0.
