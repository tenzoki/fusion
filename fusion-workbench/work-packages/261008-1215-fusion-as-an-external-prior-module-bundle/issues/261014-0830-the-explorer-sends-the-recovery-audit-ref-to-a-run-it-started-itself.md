The explorer sends the recovery audit_ref to a run it started itself
---
The two workflows place the invocation's `audit_ref` differently. `fusion.repair.v1` sends it only to the completion of a run found at `answered` on the first read, and never to a run the invocation started (69.3: "the outer `audit_ref` must name that exact role in the host's recovery record, is sent only to its completion"). `fusion.explorer.v1` passes it to `steps.Execute`, which also sends it to the completion that follows its own `host.role.run.v1` on an `absent` run. With an overlay present and the run absent, the explorer hands a recovery reference to a fresh run.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261014-0830-reviewer-closing-pass-over-the-prior-module-bundle-package.md`

Evidence:

- `adapters/prior/fusionmodule/internal/explorer/explorer.go:252`: `steps.Execute(ctx, client, request, auditRef)`.
- `adapters/prior/fusionmodule/internal/steps/role.go:62-76`: on `absent`, run, read again, and on `answered` `client.CompleteRole(ctx, request, auditRef)` with the same reference.
- `adapters/prior/fusionmodule/internal/repair/repair.go:733-751`: reads first, consumes the reference only on `answered`, and calls `steps.Execute(ctx, w.client, request, "")` otherwise; its doc comment cites 69.3.
- `adapters/prior/README.md:166` documents the explorer behaviour ("calls `host.role.complete.v1` with the invocation's `audit_ref`") without the absent case.

inference: Prior's host refuses or ignores an `audit_ref` that names no recorded recovery, so the practical effect is a refusal on an inconsistent host state rather than a wrong completion; not verified against Prior's handler.

Fix direction: give the explorer the repair workflow's observe-first placement (one shared helper in `internal/steps`), so both workflows follow one rule. The explorer's binaries change, which changes the bundle digest: schedule it with the next bundle, not as a patch to the accepted one.

Acceptance: a test in `internal/explorer` with an invocation carrying `audit_ref` and a fake run at `absent` records no audit reference on the completion; the existing restart and audit cases stay green.
