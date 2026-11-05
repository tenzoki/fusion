The fake host admits a read of a record deleted later, so conformance cannot fail on last status
---
The fake host applies half of Prior's read admission: the predicate, not the last-status selection. D-F1's own class stays invisible to the conformance suite for last status. Severity: Low; the unit rows hold the rule.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** 261105-1023-plan-fusion-13-4-2-corrected-candidate.md; 261105-1012-the-13-4-1-module-reads-every-workbench-json-as-a-control-record.md; 261027-2337-entry-v2-workbench-step-reads-a-control-record-the-integration-deleted.md

**Evidence.**

- `adapters/prior/fusionmodule/internal/fixture/entry.go`, `integrate`: every line is built `"M\t"+p`, and every named path sets `h.integrated[p] = true`. No scripted run can produce a `D` line.
- `Prior: internal/fusionhost/entry_services.go` `read` admits only a record in `entryControlRecords`, which leaves out a last status of `D`.
- So a module that loses the last-status rule stays green in `conformance`, and only `TestControlRecordsAreTheCodecsNamesByLastStatus` turns red. The plan's acceptance for step 2 asks no more than that, so this is a limit of the plan's design and not a miss in the implementation. It is the same gap that let D-F1 through: the fake admitted what Prior refuses.

**Fix direction.** Let a script delete a path, emit its `D` line, and select by last status in the fake's read admission. Add a delivery case with `M` in a commit and `D` in the delta. The module's selection cannot be reused for that, or the two sides could not differ.

**Acceptance.** With the last-status rule removed from `controlRecords`, the new conformance case ends refused and turns red.
