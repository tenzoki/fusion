The sweep's binding pass spawns one `show` per package and evidence row, for data the index already holds
---
On a JSON-controlled workbench, `bin/fusion-citation-sweep` sends one `show` for each package and evidence row (`boundFiles` in `hooks/citation-sweep.ts`, from `7c8a7dd1`) to build its `bound=` lines. It needs no Prior change to drop them, because both bindings follow from what the record index already has: the path grammar and the `reconcile` answer it already requests.
---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260930-1451_*_plan-fj03b-observers-checkers-citations-and-the-monitor-on-json.md (step 4 and step 8 notes), 260930-1640_*_the-layout-tree-the-tracking-rule-and-the-ignore-hints-name-no-json-surface-which-staging-drift-already-classifies.md, `codec/fixtures/prior/REQUESTS.md` `### No request for a binding field in \`list\`` (FJ03b hand-over)

**Defect.** The cost grows linearly with package and evidence rows, at one bundle spawn each. Every sweep run pays it, the dry run and the `--write --yes` run alike.

**Evidence:**

- Step 4's note: a dry run over 40 packages with one adopted plan each took 8.4 to 8.7 s over three runs. Of that, the 40 `show` calls took 7.3 s, about 180 ms per spawn, and `inspect`, `list` and `reconcile` about 190 ms each.
- Step 8's note: twenty `show` spawns of the bundle over a scratch copy of `codec/fixtures/workbench/`, with an empty environment, took 3.65 s, 182 ms each (Node 25.7.0).
- The evidence report binding is derivable from the path. The kernel refuses an evidence record whose `report.path` is not its neighbour `<stem>.md` (`unknown-scope/report-not-neighbour`, `codec/src/cli/ops.ts`), and `narrativeOf` in `hooks/lib/stores.ts` already maps `<stem>[.<n>].evidence.json` to that report.
- The active-document binding is in `reconcile`'s answer. `referenceSites` in `codec/src/cli/ops.ts` lists `/active_documents/<i>/ref` for every package. The recorded `codec/fixtures/protocol-session-fj02/15-reconcile.response.json` carries one such entry: `path` the fj02-session package's `package.json`, `at` `/active_documents/0/ref`, `status` `resolved`, and `target` the control path of that package's plan, `260929-0930-fj02-session-plan.record.json`. `hooks/lib/record-index.ts` sends that `reconcile` on every call, but keeps only the unresolved references.
- **What is lost.** The `<role>` of `bound=<file>  <role>:<control>` (`plan` or `spec`) is in neither `list` nor `reconcile`. It is also not recoverable from the plan record's `acceptance`, since `adopt-plan` sets `acceptance` naming the package under both roles (`codec/src/cli/ops.ts`, the `adopt-plan` block from line 1237). So without a `show` the line names the binding (for example `active_document` or the `at` pointer) instead of the role.

**Acceptance:**

- On `json-control` the sweep sends no `show`: `inspect`, `list` and `reconcile` through `readRecordIndex`, and nothing else. A test with a counting `ask` shows it.
- The `bound=` lines name the same files as at `7c8a7dd1`, over the step 4 fixture and the installed-copy case in `codec/src/__tests__/install.test.ts`. The role field either changes to the stated replacement, with the entry header saying so, or keeps `plan`/`spec` through some other answer already received.
- The 40-package dry run from step 4, re-measured, drops by roughly the `show` share (7.3 s), and the figure is written into the closing note.
- A resolved `/active_documents` reference whose target is outside the index still names no file, and an unresolved one prints no `bound=` line, as the header states today.
- Legacy output is unchanged, and so is the bundle digest.
