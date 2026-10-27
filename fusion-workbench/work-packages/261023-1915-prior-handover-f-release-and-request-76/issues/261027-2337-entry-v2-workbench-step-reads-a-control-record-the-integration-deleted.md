entry.v2 workbench step reads a control record the integration deleted
---
`catalog/workflows/entry.v2.json` (workbench step, `input_from.request.record`) reads "each workbench control path among the paths of commits[].changes and delta whose status is not D". `adapters/prior/fusionmodule/internal/entry/entry.go:513-535` `controlRecords` implements that literally. A path admitted by an earlier line is still read when a later line deletes it, for example a commit that changes the record and a delta that deletes it, or two commits that add it and then delete it. The read is refused, because the record is gone, and the envelope ends `refused` although the integration succeeded. No shipped `prior` text commits inside a run, so this is a contract gap and not a failure seen today.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** data-implementer (`entry.v2.json`, its `FROZEN` line), then code-implementer (`entry.go`, `entry_test.go`)
**Cross-references:** 261027-2337-reviewer-13-4-1-pre-release-steps-2-to-7.md (finding 4)

Needs the user's ruling on timing before any edit. Either correct `entry.v2.json` now, which is allowed only if the user rules that a frozen v2 asset may change before its first build. Or carry the gap as a request-77 question and fix it in a v3.

Fix: a control path is read when its **last** status, in commit order and then in the delta, is not `D`.

Acceptance: a test row in `TestControlRecordsAreTheWorkbenchJSONPathsNotDeleted` with `M` on a control path in a commit and `D` on the same path in the delta yields no read of that path, and turns red when the rule is reverted. The definition's sentence states the last-status rule. `FUSION-MODULE` and `FUSION-CATALOG` exit 0.
