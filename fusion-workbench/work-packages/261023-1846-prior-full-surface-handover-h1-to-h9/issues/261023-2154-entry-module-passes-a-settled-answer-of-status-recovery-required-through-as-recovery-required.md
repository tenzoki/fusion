The entry module passes a settled answer of status recovery-required through as recovery-required
---
A role run that settles with `{"status":"recovery-required","ending":null,...}` makes the module answer the invocation `recovery-required`. The run is settled, so no recovery can ever resolve it: every resume observes `settled` and answers the same envelope.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. **Scope:** `adapters/prior/fusionmodule/internal/entry/` only; repair and explorer unaffected.

**Evidence**

- `adapters/prior/fusionmodule/internal/entry/entry.go`, `func (w *workflow) role`: after the answer validates against `entry-result.v1.json`, `if a.Ending == nil { return &outcome{status: "recovery-required", role: true}, nil }`. `envelope` then copies status `recovery-required` and the answer's violations.
- Under D5 the run's result schema is the envelope schema, and it admits this answer: row `er-recovery-required` in `catalog/testdata/entry-schema-cases.v1.json` is `valid: true`.
- The same schema's description says recovery-required means "a role or host effect is unknown or in flight, never a fabricated answer". An answer the model settled is exactly that fabricated answer.
- `steps.Execute` reuses a settled run without a model call (`entry.go` package header, "a run at settled is reused"), so the host's recovery path, with or without `audit_ref`, gets the same `recovery-required` back every time.
- The branch has no test: coverage of `internal/entry` at `d02e5cb8` marks the `a.Ending == nil` return as never executed.

**Fix direction.** The module refuses a settled answer whose status is `recovery-required` (or whose `ending` is null) as `result.invalid`. The frozen schema stays as it is. Add a test with a scripted model returning the `er-recovery-required` instance.

**Acceptance.** A test in `internal/entry` drives a settled answer `{"status":"recovery-required","ending":null,...,"violations":[{"code":"x","detail":""}]}`. The envelope is `refused`, its code `result.invalid`, and capture is not called. `PRIOR_REPO=/Users/kai/Projects/productive/F09-Prior /Users/kai/Projects/productive/F04-FUSION/fusion/adapters/prior/stage.sh test` exits 0.
---
Resolved: Fixed on the fusion.entry.v2 path (plan 261027-1612-plan-fusion-13-4-1-entry-delivery-on-the-step-17-model.md, step 4). `adapters/prior/fusionmodule/internal/entry/entry.go` `role` now refuses a settled answer whose status is `recovery-required` or whose `ending` is null as `result.invalid`, before `w.answer` is kept, so no integration is called; the frozen schema is unchanged (row `er-recovery-required` of `catalog/testdata/entry-schema-cases.v2.json` stays valid). Test: `internal/entry/entry_test.go` `TestASettledAnswerOfStatusRecoveryRequiredIsRefused` drives the instance of the acceptance, asserts `refused`, `result.invalid`, no `host.entry.integrate.v1` call (capture no longer exists under v2), and that a resume answers the same refusal with one model call. The test turns red with the check removed (mutation run in a scratch clone). `PRIOR_REPO=/Users/kai/Projects/productive/F09-Prior /Users/kai/Projects/productive/F04-FUSION/fusion/adapters/prior/stage.sh test` exits 0.
