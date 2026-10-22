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

Resolved: 2026-10-22, step 10 of plan 261022-1611 (work package 261022-1604). `TestKillAtEveryPersistedBoundaryThenResumeRunsNoModel` now lists nineteen boundaries: the sixteen above plus "after the reviewer was composed" (`host.role.compose.v1`, `run-review-0`), "after a page of the record was read" (the workbench `page:<handle>:96` slot) and "after the auditor was composed" (`host.role.compose.v1`, `run-audit`). Every run in the test, the clean reference included, reads the record in 96-byte pages, and the test asserts the clean run made at least two page calls. Each sub-test resumes to the clean run's envelope bytes with the clean run's model count. No fixture change was needed, because `RepairHost.PageBytes` already pages the read. Verified on a fresh `build.sh build` into a scratch dir: `stage.sh test` exit 0, and `go test -v` lists all nineteen sub-tests as PASS. `adapters/prior/README.md` still says "sixteen" (lines 253-256); the README step of this plan corrects it.
