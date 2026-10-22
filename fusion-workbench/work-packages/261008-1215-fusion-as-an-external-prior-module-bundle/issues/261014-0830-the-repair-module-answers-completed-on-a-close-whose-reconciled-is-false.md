The repair module answers completed on a close whose reconciled is false
---
`fusion.repair.v1` returns `domain.status` `completed` for any completed `host.workbench.v1` close, whatever its `reconciled` member says. Answer 69 defines `reconciled` as "true only when post-image, codec receipts, host journal and integration commit agree" (`codec/fixtures/prior/REQUESTS.md` `### Prior's answer to 69 at a4f463f`, *Workbench*), and request 70 states fusion's own expectation as "the record closed ... with `reconciled` true" (`## Module bundle (request 70, the reviewed repair at C)`, question 70). A close that answers `reconciled: false` is a disagreement the envelope reports as success. The case split from the close answer to the envelope status is incomplete: no branch names `reconciled: false`.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261014-0830-reviewer-closing-pass-over-the-prior-module-bundle-package.md`

Evidence:

- `adapters/prior/fusionmodule/internal/repair/repair.go:613-621`: after `w.host.Close`, only `reply.Closure()` decoding is checked, then `w.closure = reply.Result; return nil, nil`, which `envelope(nil)` turns into `completed`.
- `adapters/prior/fusionmodule/internal/hostsvc/hostsvc.go:401-410`: `Closure()` checks the four members are present and the three strings non-empty; `Reconciled` is decoded and never read.
- `catalog/schemas/repair-result.v1.json:295-298` admits `reconciled: false` under `completed` (checked with ajv 2020: a completed envelope with `closure.reconciled` false validates). `catalog/workflows/repair.v1.json` close step, `answer.reconciled` and `then`, routes every completed close to `end: the envelope with status completed`.

Fix direction: map a completed close with `reconciled: false` to `recovery-required` (non-terminal, violation code such as `closure.unreconciled`), which needs no change to a frozen schema; confirm the reading with Prior in the next request, since the frozen workflow text does not state it. If Prior says a `reconciled: false` close can never be `completed`, record that answer and add the module check as a guard anyway.

Acceptance: a unit test in `internal/repair` whose fake close answers `{"record":…,"before":…,"after":…,"reconciled":false}` yields an envelope whose status is not `completed`; the existing `TestAcceptedFirstAttemptRunsToClose` stays green.

## Note, 2026-10-14

Correction of the closing review's commit message (edaf7f18), which said no finding touches the bundle Prior accepted: this defect is in the delivered repair module of v13.1.0 (digest 56ac4c57). Prior reports it does not void the acceptance: Prior's qualified close path answers a failed reconciliation with an error, never with a successful close carrying reconciled false, so the case was not reachable in the accepted run. The fix ships in a later bundle and needs Prior's acceptance then.

Resolved: 2026-10-22, plan step 1 of `261022-1611-plan-prior-bundle-closing-review-follow-ups.md`. `repair.go` close branch now splits on `Closure().Reconciled`: `true` stays `completed` with the closure in `result`; `false` ends `recovery-required` with violation `closure.unreconciled`, the host's closure kept in the violation detail because the frozen `repair-result.v1.json` admits only a null `result` there. New test `TestAnUnreconciledCloseIsRecoveryRequired` (`repair_test.go`) wraps the fake host so the completed close answers `reconciled: false`; `TestAcceptedFirstAttemptRunsToClose` green. No frozen schema or workflow byte changed (`shasum -a 256 -c schemas/FROZEN` exit 0). The reading still goes to Prior with request 74 (plan step 17).
