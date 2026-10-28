# Review: closing review of package F, fusion 13.4.1 and request 77

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `4e53b552..ea1e91b8`
**Not-opened:** `adapters/prior/fusionmodule/internal/entry/entry_test.go`, `fusion-workbench/.fusion-setup`, `114caf11.md`, `261023-1854-plan-prior-full-surface-handover-h1-to-h9.record.json`, `261025-1117-how-does-a-read-only-role-write-the-workbench-on-a-prior-entry-run.md`, `261025-1117-how-does-a-read-only-role-write-the-workbench-on-a-prior-entry-run.record.json`, `261025-1117-orchestrator-prior-parts-name-no-host-dispatch-v1-so-step-15-alone-cannot-pass-checkentries.record.json`, `261023-1915-prior-handover-e-bundle-payload.md`, `261023-1915-prior-handover-e-bundle-payload/package.json`, `261026-1006-request-76-has-no-record-of-four-payload-choices-step-19-made-beyond-the-plan.md`, `261026-1006-request-76-has-no-record-of-four-payload-choices-step-19-made-beyond-the-plan.record.json`, `261026-1006-the-hook-payload-readme-gives-an-order-that-never-reaches-the-staging-drift-the-conformance-test-requires.md`, `261026-1006-the-hook-payload-readme-gives-an-order-that-never-reaches-the-staging-drift-the-conformance-test-requires.record.json`, `261026-1006-reviewer-closing-review-of-prior-handover-e-bundle-payload.md`, `261026-1006-reviewer-closing-review-of-prior-handover-e-bundle-payload.evidence.json`, `261027-1612-does-the-module-keep-serving-fusion-entry-v1-beside-fusion-entry-v2.md`, `261027-1612-which-host-service-integrates-an-entry-run-under-the-step-17-model-and-what-does-it-replace.md`, `261027-1833-does-fusion-keep-the-repair-route-on-prior-beside-the-step-17-entry-model.md`, `261027-1833-how-does-a-frozen-catalog-asset-leave-the-tree-when-the-contract-it-serves-is-withdrawn.md`, `261027-2337-entry-v2-receipt-check-and-name-status-pattern-admit-dot-dot-path-segments.md`, `261027-2337-entry-v2-workbench-step-reads-a-control-record-the-integration-deleted.md`, `261027-2337-frozen-names-entry-request-v1-under-the-step-15-answer-69-comment-which-is-not-its-origin.md`, `261027-2337-orchestrator-failure-table-rows-revert-a-file-setup-listed-as-the-users-uncommitted-work.md`, `261027-2337-skill-news-prior-opening-says-the-seen-mark-does-not-outlive-the-run.md`
**Domain:** both (code: module, fake host, conformance and catalog tests, READMEs, release files; ontology side: catalog data, frozen and withdrawn assets, profiles, `prior` parts, request 77)
**Cross-references:** 261027-1612-plan-fusion-13-4-1-entry-delivery-on-the-step-17-model.md, 261027-2337-reviewer-13-4-1-pre-release-steps-2-to-7.md, 261027-1612-does-request-77-supersede-request-76-or-amend-it.md, 261027-2145-entry-delivery-model-statement-map.md

The dispatched scope is the 17 commits `bin/fusion-review-coverage --since 97552507` reported uncovered: `5bbbe40e` to `ab6e9032`, `347d31d0` to `ca9eb60d`, `f53b6502` to `cd4970b5`, `026c5af1`, `ba3d1d16`, `67cece9a`, `ce3719e1`, `ea1e91b8`. The range above also contains `d3d67be8` and `e9138b59` to `ccd676d2`, which are the prior pre-release review's range. Those were not re-reviewed; their files were read here only at HEAD, where they overlap the dispatched files. The Not-opened list covers the dispatched commits.

Files read in part: `conformance/entry_test.go` (lines 480 to 654 and the test list), `internal/fixture/fixture.go` (1 to 335), `cmd/fusion-bundle/main_test.go` (195 to 255 and the test list), `internal/hostsvc/hostsvc_test.go` (82 to 153), `conformance/host_test.go` (1 to 40), `catalog/src/__tests__/render.test.ts` (760 to 830, 980 to 1089), `adapters/prior/README.md` (headings, `### Conformance against a built bundle`, and a grep for v1 and repair terms), `README-agents.md` (`### The Prior module bundle`, the `4fc3fd1f` diff, and a grep), and request 76 in `REQUESTS.md` (the head, `### The bundle`, decisions and questions). `internal/entry/entry_test.go` was read for its test names only, so it is listed as not opened. The withdrawn files are absent at HEAD: `internal/repair/`, `internal/fixture/repair.go`, `conformance/repair_test.go`, `adapters/prior/testdata/repair-fixture/`, the nine repair assets, `workflows/entry.v1.json`, `schemas/entry-result.v1.json`, and both v1 schema-case tables. `git ls-files` lists nothing under the two deleted directories.

## Summary

The package did what its plan says. Request 77's bundle values equal the delivered bundle byte for byte. Its rulings are cited correctly. Its list of what it replaces matches decision E3 option 1. Every stopping condition holds, with one literal exception that the plan itself caused. One defect reached the frozen `entry.v2.json` and request 77: both say the operation id is derived from the workflow capability, while the module, its fake host and Prior derive it from the invoked service's. One shipped README still names `repair.v1.json` as a live workflow. Verdict: **revise**, because the first finding should reach Prior together with request 77.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 1 |

## What was verified, and how

**Request 77 against the delivered bundle.** In `/Users/kai/.local/share/prior/incoming/fusion/13.4.1/c61f9033…/`:

- `shasum -a 256` gives the tarball `fd1067ad…c5b0`, the sidecar `08849f4f…fce9` and `handover.json` `b8565000…adb6c`.
- `shasum -c` prints OK. The sizes are 27 915 264, 84 and 2 403 bytes, all mode 0444.
- `handover.json` has `bundle_digest` `sha256:c61f9033…a064f`, `fusion_revision` `ce3719e1…`, `prior_revision` `08c57fb4…`, `go1.26.0` and the three target hashes. Each equals request 77.
- The tarball has 1 616 entries: 1 581 at mode 0400 and 35 at 0500.
- `module.json` has 61 `data` files and the unchanged `lifecycle_hooks` (`d7f4d7ab…`).
- `workflows/` and `schemas/` hold exactly the eight assets `FROZEN` names.
- The packed `catalog.json` hashes to `54638b43…`, and so does `git show 67cece9a:catalog/catalog.json`.
- The packed `codec/dist/fusion-record.js` hashes to `b4047458…`.
- The 13.4.0 directory is unchanged: its tarball still hashes to `2006ab2c…`, as request 76 states.

**Request 77's git claims.**

- At `ce3719e1` the file has 6 330 lines and sha256 `e291b984…`.
- `ea1e91b8`'s parent is `ce3719e1`, and `ce3719e1`'s parent is `67cece9a`.
- `git diff --stat 67cece9a ce3719e1 -- . ':!fusion-workbench'` is empty.
- `git describe 67cece9a` prints `v13.3.9-42-g67cece9a`.
- `git diff --stat 308650e1 67cece9a`, with the workbench excluded, prints 190 files, +3 563 and −8 347. Under `catalog/profiles` it prints 129 files, +219 and −287.
- Between `aa4277d8` and `ce3719e1`, the only codec path that moved is `REQUESTS.md`.

**Conformance counts.** Request 77's per-package test counts equal the top-level `func Test` counts at HEAD. They are 8, 2, 16, 25, 14, 11 and 17. `cd catalog && npx vitest run` passes 250 of 250 tests. The Go suites and `BUNDLE-CONFORM` were not re-run.

**Rulings cited.** Both Prior records were read at `187df6f`, in the decisions of Prior's work package `foreign:F09-Prior:261021-2241-full-fusion-surface-on-prior`. `261024-0807` is answered with option 1, conditions (a) to (c), at Prior `3a225d2`. `261024-0900` is answered with option 1 at `e7c3033`. Request 77 states both commits and both options correctly, and condition (b) word for word. E4 is cited by basename. Request 77's Prior `path:line` citations were spot-checked at `187df6f`, and each points at the code it describes. The checked lines are `EW:193-199`, `:244-250`, `:1110-1111`, `:1117-1120`, `:1133-1136`, `:1158` and `:1165-1169`, `fusion_run.go:308`, `:337-350` and `:347`, `fusion_kept.go:226-227`, `repair_wire.go:16-21` and `:88`, `repair_catalog.go:33`, `workbench.go:21-22` and `repair_assembly.go:141`.

**Replace and stand list against E3 option 1.** Request 77 replaces each item E3 names, with the subsection it names:

- the bundle and 76.1 to 76.4;
- the entry assets, `### Host services required`, the H6 and H7 rows and 76.2's asset names;
- every repair statement: 76.2's "explorer and repair workflows resolve as at 70", the "6 repair cases", H3's repair text and H7's "beside the explorer and repair";
- D5 for the three profiles;
- decision 5 (`261024-2111`), now moot.

All four quoted phrases occur in request 76, at lines 6239, 6149, 6261 and 6265. The stand list holds what E3 lists: H1, H2, H4, H5, H8 and H9, the carry items, B2, decisions 1, 2, 4 and 6, and questions 1 to 19 except where 77 restates one. It adds `### The 27 entries` and `### The lifecycle_hooks declaration`, which E3 does not contradict. The stand list cites three items by number: decision 3 is D5, decision 5 is the workbench grant and decision 6 is the path-scoped grant. Each number matches request 76's own numbering. Request 77's question numbers 1 to 11 match the statement map's table. The 23 shipped "(request 77, question 5)" citations are the only request-77 citations in the `prior` parts.

**Plan stop conditions.**

| Condition | Result |
|---|---|
| `CODEC-PIN` | `b4047458…` at HEAD and in the 13.4.1 tarball; `git log aa4277d8..ce3719e1` over the codec paths is empty |
| No frozen file's bytes changed | `shasum -c` of `FROZEN`'s eight lines: all OK. `git log 3878bb36..HEAD` over the v2 assets, `entry-request.v1.json` and the explorer's five is empty. The six kept hashes equal `git show ca9eb60d:catalog/schemas/FROZEN`. Each `WITHDRAWN` hash equals `git show v13.1.0:` or `ca9eb60d:` of its path (five spot-checked, and the frozen suite checks all eleven) |
| `FROZEN` and `WITHDRAWN` sets | eight lines and eleven lines, as the plan lists them; request 77's withdrawn table equals `WITHDRAWN` line for line |
| Capabilities | `cmd/fusion-module/main_test.go` `TestWorkflowsRegisterEveryCapability` asserts exactly `fusion.explorer.v1` and `fusion.entry.v2`; the payload test refuses both retired capabilities |
| `PRIOR_PIN` | `08c57fb`; `git diff --stat 08c57fb 187df6f -- moduleapi go.mod go.sum schemas/module-api` and the same against Prior's head (`187df6f`) are empty |
| After C′ only `REQUESTS.md` and the workbench | `git diff --stat 67cece9a HEAD`: `REQUESTS.md` (+260, −0), `orchestrator-events.jsonl` and the plan record |
| `CLAUDE-DIST` | `README.md`, `skills/help/SKILL.md` and `hooks/lib/__tests__/fixtures/surface-growth.golden`; see the observations below |
| `REPAIR-TOKENS` | the same eleven hits the pre-release review accepted, no new one |
| Clean, non-dirty build | `fusion_revision` `ce3719e1…` with no `+dirty`, and the payload test refuses a dirty one |

**Release files.** `plugin.json` changes the version to 13.4.1. `install.sh` and `README.md` change the pin example to `tags/v13.4.1`. The 21-claude and 21-prior help paragraphs are relabelled "Coming from 13.0.0 to 13.4.0", as decision `261015-1559` option 2 asks, and `skills/help/SKILL.md` is their render. The golden moves `help/SKILL.md` from 16581 to 16791 bytes.

**Earlier commits in scope.** `347d31d0`, `2a35d604`, `1a7db7f8` and `4fc3fd1f` were read at HEAD in the files they touch. At HEAD, `catalog.json` has `explorer` as the one role supported on Prior. Of its 27 entries, 25 are supported, all but `commit` and `cleanup`. All 27 entry profiles name `schemas/entry-request.v1.json` and `schemas/entry-result.v2.json`, and `reviewer` keeps both aliases. The three former repair-role `profile.json` files differ from `ca9eb60d` exactly as request 77's table says. `fixture/journal.go`, `fixture/entry.go`, `steps/bundle_test.go`, `hostsvc/entry_test.go` and both `main_test.go` files hold no repair dependency. `catalog/README.md` agrees with the tree. The orchestrator parts 07, 17, 33, 54a and 63, and `skill-news` 01, carry the pre-release fixes. The 54a rows now name the Setup-listed files, and the "does not outlive" clause is gone.

## Findings by theme

### Theme A: the v2 contract text

**Finding 1, Medium: `entry.v2.json` and request 77 derive the operation id from the workflow capability, but the module and Prior use the invoked service's.**

The frozen definition says this in `catalog/workflows/entry.v2.json:17`:

```
"operation_id": "as answer 69 derives it (Prior's SDK api.RepairOperationID at the pin): \"repair:\" followed by the lowercase sha256 hex of the UTF-8 bytes of capability + \"\\n\" + workflow_id + \"\\n\" + slot, with capability fusion.entry.v2; …"
```

Request 77 repeats "with capability `fusion.entry.v2`", in `REQUESTS.md` at line 6501, under "The common contract, as `entry.v2` states it".

The code says otherwise. `internal/hostsvc/hostsvc.go` `call` builds `api.RepairOperationID(capability, c.WorkflowID, slot)` with the service it calls, which is `host.role.compose.v1`, `host.workspace.v1`, `host.entry.integrate.v1` or `host.workbench.v1`. `hostsvc_test.go` `TestEveryRequestIsClosedUnderItsSlot` asserts `RepairOperationID(sent.Capability, …)`. The fake host's `decodeProposedEntryCall` checks the same (`fixture/entry.go:511`). Prior agrees with the code: its SDK check is `RepairOperationID(inv.Capability, …)` (`moduleapi/v1/repair_wire.go:141` at `187df6f`), and its repair integration uses `api.IntegrateCapability` (`internal/fusionhost/repair_integration.go:180`). Answer 69 writes only "capability", next to a role id built as `capability + ":" + run_id`, where capability is the service's.

The gloss came from the withdrawn `entry.v1.json` at `ca9eb60d` ("derived with capability fusion.entry.v1"). `repair.v1.json` at `v13.1.0` had no gloss. So the error is carried, not new. It is new in `REQUESTS.md` itself, because request 76 pointed at `repair.v1.json` and did not restate the rule.

Effect: a Prior implementer who follows the frozen text derives ids the module never sends. Then every request-69 call and the integrate call fails Prior's admission check. Request 77 question 1 asks Prior to confirm the form, so the text is exactly what Prior will read.

Scope: `fusion.entry.v2`, both hosts' reading of it, and request 77. Fix: a v3 states the service capability. This joins the two defects of question 12. Separately, append one correction line to `REQUESTS.md` before the user reports request 77 to Prior. Appending is allowed after C′, and no line above it changes. Whether and when to append is the user's ruling. Issue filed: `261028-0810-entry-v2-and-request-77-derive-the-operation-id-from-the-workflow-capability-where-the-module-uses-the-services.md`.

### Theme B: shipped documentation

**Finding 2, Low: `README-agents.md`'s catalog row still names `repair.v1.json` as one of "the two workflow definitions".**

`README-agents.md:203`, `## Plugin structure`, the `catalog/` row, says: "`workflows/explorer.v1.json` and `workflows/repair.v1.json` are the two workflow definitions, `schemas/*.v1.json` the … schemas the bundle ships, and `schemas/FROZEN` … because Prior accepted those bytes."

At HEAD that sentence is wrong four ways. The workflows are `entry.v2.json` and `explorer.v1.json`. `repair.v1.json` is withdrawn. The bundle ships `entry-result.v2.json`. Three `FROZEN` lines are proposals that Prior has not accepted. The row also never mentions `WITHDRAWN`.

The row was already stale at 13.4.0: `a419215a` added `entry.v1.json`, and `4fc3fd1f` rewrote this row without correcting it. The same fact in `catalog/README.md` was filed and fixed (`261024-1005-catalog-readme-says-two-workflows-exist-and-its-layout-omits-the-schema-case-tables.md`), but this copy was not. The plan's `## Current State` said `README-agents.md` stays true, but it checked only line 29 and the bundle section. No lint resolves the path, because it is relative to `catalog/`.

Scope: the shipped README only, with no runtime effect. Fix: name the workflow set without a count, or point at `catalog/README.md` `## The frozen assets`. The file is shipped, so the fix waits for the tag or for 13.4.2. Issue filed: `261028-0810-readme-agents-catalog-row-still-names-repair-v1-as-one-of-the-two-workflow-definitions.md`.

## Observations, not filed

- **The plan contradicts itself on the golden.** Step 8's file list includes "the surface-growth golden the hooks suite regenerates". Its acceptance check and the stopping section both say `CLAUDE-DIST` lists only `skills/help/SKILL.md` and `README.md`, and that any other difference is a stop. `CLAUDE-DIST`'s path list includes `hooks`, so the golden appears, and the literal condition fails. The golden is a test fixture that moves only with the help text's byte count. `67cece9a`'s message names it. Nothing needs fixing in the tree. A later plan of this form should exclude the golden from `CLAUDE-DIST` or name it in the condition.
- **The pin example names a tag that does not exist yet.** `install.sh:29` reads "`FUSION_REF=tags/v13.4.1` for the current release", and `README.md` uses the same example. No `v13.4.1` tag exists, and none will until Prior answers. If Prior's answer forces 13.4.2, the example names a tag that never exists, as `tags/v13.4.0` did at `ca9eb60d`. "Not every release has a tag" was the accepted answer in `260910-2119_*_no-v10-release-was-ever-tagged-so-the-installers-own-rollback-example-names-a-ref-that-does-not-exist.md`, so this is not refiled.
- **Request 76's questions 14 and 15 still stand, worded against `entry.v1`.** Q14 names "the twelve services" and Q15 names `schemas/entry-result.v1.json`. Request 77 says what became of each: (c) in `### The rulings this carries` for Q14, and `### Closing-review fixes` for 15(a). The reader can resolve both, so no fix is asked.
- **Some test comments are scaffolding that is now history.** `render.test.ts` says "entry.v2 is written at plan step 3. Until then …", and the step-7 `describeLive` block says "red before that, by design". `conformance/host_test.go:3` and `:16` cite step numbers of an older plan. This is cleanup only.

## Cross-cutting observations

- **One fact, two copies, one corrected.** Finding 2 is the second time the workflow set has drifted in a README after `catalog/README.md` was fixed. Both copies also stated a count. `rules/critical-stance.md` §5 already names this cause, so the fix is to drop the count, not to add a check.
- **Contract glosses outlive the file they came from.** Finding 1's sentence was added to `entry.v1.json` as a paraphrase of answer 69, then copied into `entry.v2.json` and request 77 when v1 was withdrawn. A frozen paraphrase of a Prior rule should quote the rule, or cite it without restating.

## Recommended sequencing

1. **Before the user reports request 77 to Prior:** the user rules on finding 1's appended correction line. It is the only change this review asks for in the work as delivered, and appending moves no shipped byte and no digest.
2. **With the v3 that request 77 question 12 already promises:** finding 1's wording, beside the two `261027-2337` v2 issues.
3. **After the `v13.4.1` tag, or in 13.4.2:** finding 2.
4. The package can close once item 1 is ruled on. Every plan step is `done` and the plan record is `in_progress`, so the orchestrator moves it to `closed` at closure.
