entry.v2 receipt check and name-status pattern admit dot-dot path segments
---
Plan step 4 asks that every `changes` and `delta` item of the integrate answer be in name-status form "with a valid relative path". `catalog/schemas/entry-result.v2.json` `$defs/name_status` and the module's identical `nameStatus` (`adapters/prior/fusionmodule/internal/entry/entry.go:465`) refuse only an empty path, an absolute path, a tab and a newline. `M\ta/../../x` passes both and would be copied into the envelope as an integrated change. `controlRecords` re-checks with `fs.ValidPath`, so no read escapes.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** data-implementer (`entry-result.v2.json`, its `FROZEN` line, `catalog/testdata/entry-schema-cases.v2.json`), then code-implementer (`entry.go`, `entry_test.go`)
**Cross-references:** 261027-2337-reviewer-13-4-1-pre-release-steps-2-to-7.md (finding 5), 261027-2337-entry-v2-workbench-step-reads-a-control-record-the-integration-deleted.md (same timing ruling)

Needs the same timing ruling as the workbench-step issue: correct the frozen v2 schema before its first build, or carry the gap to a v3.

Fix: the pattern also refuses a path with an empty, `.` or `..` segment, in the schema and in the module together. `TestTheNameStatusCheckIsTheSchemasPattern` keeps the two equal.

Acceptance: invalid rows `M\ta/../b`, `M\t../a` and `R100\ta\t./b` in `entry-schema-cases.v2.json` pass under ajv and under the Go validator. The same lines are false in `TestTheNameStatusCheckIsTheSchemasPattern`. `FUSION-CATALOG` and `FUSION-MODULE` exit 0.
