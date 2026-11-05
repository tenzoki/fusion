The module and its test call the R and C rule Prior's, though Prior's selection ignores those lines
---
`controlRecords` matches Prior's `entryControlRecords` on `A`, `D`, `M` and `T`. On `R` and `C` lines the two differ, unreachably on Prior, while the test comment names its rows as Prior's cases. Severity: Low; request 78 must not state the rule as Prior's for those lines.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** 261105-1023-plan-fusion-13-4-2-corrected-candidate.md; 261105-1023-does-entry-v3-keep-or-drop-the-c-and-r-name-status-branch.md

**Evidence.** Both functions copied into a scratch program and run:

| Lines | Module | Prior |
|---|---|---|
| `R100 old new` | `new` | none |
| `M old`, `R100 old new` | `new` | `old` |
| `C75 old new` | `new` | none |

- 500 000 random `A`, `D`, `M`, `T` streams gave no difference.
- Prior's `strings.Cut(line, "\t")` leaves `old\tnew` as the path, and `EntryRelativePath` refuses a tab, so such a line selects nothing.
- It cannot reach the module from Prior: `entryNameStatus` admits only `A`, `D`, `M` and `T`, and `entry_workspace.go:1286` reads with `--no-renames`. No run-time defect at `52a2703`.
- `internal/entry/entry_test.go`, above `TestControlRecordsAreTheCodecsNamesByLastStatus`: "The rows are D-F1's and the cases of Prior's entryControlRecord and entryControlRecords at 52a2703". The rename and copy rows are not; they state v2's schema and the plan's rule.
- `internal/entry/entry.go`, the `controlRecords` comment, and `adapters/prior/README.md` `### The entry workflow` put the `R` clause directly after "as Prior's read admission selects".

**Fix direction.** Say in the comment and the README that the `R` and `C` treatment is the module's reading of v2's `name_status`, which Prior never emits and its own selection would not read. Mark those test rows the same way. Request 78's `D-F1 and the last status` part says the same.

**Acceptance.** No text in the module, its test or the adapter README attributes the `R` or `C` treatment to Prior. Request 78 states the difference.
