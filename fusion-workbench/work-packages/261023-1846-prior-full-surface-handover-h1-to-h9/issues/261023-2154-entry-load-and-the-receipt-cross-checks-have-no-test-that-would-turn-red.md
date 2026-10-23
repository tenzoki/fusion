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
