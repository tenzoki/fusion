The repair kill test omits the reviewer and auditor compose and the page boundaries
---
`TestKillAtEveryPersistedBoundaryThenResumeRunsNoModel` lists sixteen kill points. It kills after the explorer's and the implementer's `host.role.compose.v1` receipts, but not after the reviewer's (`run-review-0`) or the auditor's (`run-audit`), and not after a `page:<handle>:<offset>` read of the multi-page record. The test name, plan step 18 ("a kill at each persisted step boundary") and `adapters/prior/README.md` ("a kill at each of sixteen persisted boundaries from the explorer's compose to the workbench close") claim more than the list covers.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261014-0830-reviewer-closing-pass-over-the-prior-module-bundle-package.md`

Evidence:

- `adapters/prior/fusionmodule/conformance/repair_test.go:560-577`: the `boundaries` slice; `api.RoleComposeCapability` appears for `run-explore` and `run-impl-0` only; no `page:` slot.
- `adapters/prior/README.md:253-256`.

Fix direction: add `{"after the reviewer was composed", api.RoleComposeCapability, "run-review-0"}`, `{"after the auditor was composed", api.RoleComposeCapability, "run-audit"}` and one page boundary of the record read; or narrow the README and the test name to the boundaries listed.

Acceptance: `FUSION_BUNDLE_DIR=<fresh build> adapters/prior/stage.sh test` green with the added sub-tests, each resuming to the clean run's envelope bytes with no further model call; or the README sentence and test name match the list.
