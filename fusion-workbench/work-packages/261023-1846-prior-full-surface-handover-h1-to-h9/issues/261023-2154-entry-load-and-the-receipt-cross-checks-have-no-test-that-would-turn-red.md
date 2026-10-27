entry.Load's definition checks and the run's receipt cross-checks have no test that would turn red
---
Every refusal in `entry.Load` and four of the module's own cross-checks on host receipts run under no test. Deleting any of them leaves `stage.sh test` green.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Severity:** Low. **Scope:** `adapters/prior/fusionmodule/internal/entry/entry_test.go`.

**Evidence.** Coverage of `internal/entry` at `d02e5cb8` is 82.0% (`go test -coverprofile` in the staged clone). The statements never executed include:

- `Load`, 69.0%: each `ErrDefinition` return. These are the step list, `revise_bound`, the twelve `requires`, the compose `slot`, the run's `role`/`forwarded`/`recovery_ref`, `role_state`, `envelope_schema`, and an entry requiring a service the definition does not. The catalog suite tests the matching shapes in TypeScript (`render.test.ts` "does not resolve against a workflow whose run step fixes its role, or names none"); the Go loader has no equivalent.
- `verify`, 69.2%: the run/profile mismatch, the role-input schema refusal and the `steps.Carries` refusal. Only the workflow_id case is driven (`TestAFrozenInputNamingAnotherWorkflowIsRefused`).
- `run`: `capture.invalid` (base revision differs from the workspace's), `integration.invalid`, `snapshot.invalid`.
- `role`: `frame.oversize` from `CheckRoleCalls`, a non-recovery host refusal from `Execute`, a non-settled terminal state.

**Fix direction.**
- A table test that loads the fixture bundle with `workflows/entry.v1.json` mutated, one row per `Load` refusal.
- Fake-host knobs (or a tampering caller like the existing `callerFunc`) for a capture base, an integration tree and a snapshot commit that differ from what the module expects.

**Acceptance.** Each statement listed above is covered, and each new test fails when the check it targets is removed. Coverage of `internal/entry` is reported in the commit message. `PRIOR_REPO=/Users/kai/Projects/productive/F09-Prior /Users/kai/Projects/productive/F04-FUSION/fusion/adapters/prior/stage.sh test` exits 0.
---
Resolved: Met against fusion.entry.v2 (plan 261027-1612-plan-fusion-13-4-1-entry-delivery-on-the-step-17-model.md, step 4), where `Load` and the receipt checks were rewritten. `adapters/prior/fusionmodule/internal/entry/entry_test.go`: `TestLoadRefusesEveryOtherShape` has one row per `Load` refusal of `entry.go` `Load` (step count and shape, a role step, `revise_bound`, the exact ten `requires` both ways, compose schema and slot, the run's role/run/role_input_schema/forwarded/recovery_ref, an unparsable run step, `role_state`, `result_schema`, the three `on_ending` routes, the integrate and workbench slots, `envelope_schema`, and a schema the payload lacks); `TestEveryReceiptCheckRefusesAnIntegrationThatIsNotTheRuns` has one row per check of `entry.go` `checkReceipt`, each edit breaking exactly one check; `TestAFrozenInputThatIsNotTheRunIsRefused` covers `verify`'s run/profile, schema, `steps.Carries` and workflow_id refusals; `TestTheRoleStepRefusesWhatItCannotRun` covers `role`'s `frame.oversize`, a non-recovery host refusal and a non-settled terminal state. The v1 checks the issue names (`capture.invalid`, `snapshot.invalid`, the v1 `integration.invalid`) left with the v1 interpreter. `Load`'s check that every entry's `requires` is among the definition's was removed, not tested: it is unreachable once `requires` must be exactly the ten, since `steps.LoadCatalog` admits only the three entry services in an entry's `requires`. A mutation run in a scratch clone removed each of the 30 checks in turn and every one turned its test red. Coverage of `internal/entry`: 92.1% of statements (was 82.0% at `d02e5cb8`). `PRIOR_REPO=/Users/kai/Projects/productive/F09-Prior /Users/kai/Projects/productive/F04-FUSION/fusion/adapters/prior/stage.sh test` exits 0.
