# Closing review: the prior-bundle closing-review follow-ups

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `11440a0a..59992f23`
**Not-opened:** none
**Review domain:** both (code and the codec's contract and schema texts)
**Work package:** `261022-1604-prior-bundle-closing-review-follow-ups`; plan `261022-1611-plan-prior-bundle-closing-review-follow-ups.md`
**Cross-references:** `261014-0830-reviewer-closing-pass-over-the-prior-module-bundle-package.md`, `261022-2143-three-pinned-codec-texts-still-say-proposed-mapping-or-every-cycle-after-step-13.md`, `261022-2143-migrate-skill-repair-apply-sentence-no-longer-tells-the-reader-to-stop-on-exit-6-or-9.md`, `261022-1712-catalog-render-test-no-longer-reproduces-agents-reviewer-md-since-91395e02.md`, `261022-1806-migrate-run-maps-every-ensurebackup-failure-to-exit-9-including-a-copy-io-error.md`

`11440a0a` is `bad32587^`. Three generated files were verified by rebuild rather than read, as dispatched: `codec/dist/fusion-record.js` and every file under `hooks/dist/` rebuild byte-identical from a `git archive` of `59992f23` (`npm ci && npm run build`; `cmp` and `diff -r` silent, bundle `sha256:d6fc9da0…`). `hooks/package-lock.json` was verified by `npm ci` exiting 0 in that clean export, not read line by line. Of `codec/fixtures/prior/REQUESTS.md` only the sections appended after the 72/73 hand-over (lines 5523 to 5793) were read.

## Summary

All twelve issues the plan names stand `closed`, each with a `Resolved:` line, and each fix does what its issue asked; I found no correctness defect in the changed code. Every suite is green at `59992f23` except catalog's render test, the already-filed `261022-1712-…`. Two Low follow-ups are filed: three pinned codec strings still overclaim after step 13, and the migrate skill's `repair --apply` sentence lost its "stop" on exits 6 and 9.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 2 filed, 1 observation not filed |

## Verification run

| Check | Result |
|---|---|
| `PRIOR_REPO=… adapters/prior/stage.sh test` (scratch export) | all packages `ok` |
| `adapters/prior/build.sh build <scratch>` from the repository | exit 0, clean revision (no `+dirty`) |
| `FUSION_BUNDLE_DIR=<scratch> stage.sh run -- go test -v -run TestKillAtEveryPersistedBoundary …/conformance/` | 19 of 19 sub-tests PASS, the three new ones among them by name |
| `FUSION_BUNDLE_DIR=<scratch> stage.sh test` | all packages `ok`, conformance included |
| `cd catalog && npx vitest run` (repository) | 72 of 73; the one red is `render.test.ts` reviewer, known issue `261022-1712-…` |
| `codec`: `npm run typecheck`; `CODEC_REQUIRE_GOLDENS=1 npm test` (git clone at `59992f23`) | exit 0; 1857 of 1857 |
| `hooks`: `npm ci && npm test` (same clone) | 1197 passed, 14 skipped, 0 failed |
| ajv over each negative row of `catalog/testdata/repair-schema-cases.v1.json` (scratch script, outside the tree) | every negative row fails on the keyword its name targets, none for an incidental reason |

A first codec and hooks run in a non-git `git archive` export failed 22 codec cases (`committed-bundle`, `install`, `round-trip-cli-takeover`), all on `git rev-parse HEAD` / `git cat-file` with no repository; the rerun in a `git clone --shared` checkout is the result above. The kill test needs a built bundle: without `FUSION_BUNDLE_DIR` the plain `stage.sh test` skips it.

## Stop conditions of the plan

1. **`cd catalog && shasum -a 256 -c schemas/FROZEN`**: passes, every line `OK`, exit 0.
2. **`git diff 11440a0a HEAD -- hooks/lib/__tests__/surface-growth-bound.test.ts hooks/lib/__tests__/rules-emission-golden.test.ts hooks/lib/__tests__/helpers/growth-bound.ts hooks/lib/__tests__/fixtures`** (`HEAD` read as `59992f23`): one file moves, `hooks/lib/__tests__/fixtures/surface-growth.golden`, 8 lines in, 8 out (`migrate/SKILL.md` 29377 to 29698, `setup/SKILL.md` 15553 to 16017, skills total 225511 to 226296; four hook-test line counts and their total 25569 to 25618). Nothing else in the set moved: no baseline, no head-room constant, no other fixture. The golden is not a baseline (`README-hooks.md` `### Growth bounds on the shipped text`: "Regenerating a golden records the movement and never clears a bound"), so the condition's intent holds; its letter ("prints nothing") does not, because the plan put the golden inside a set it required to be silent. A wording defect of a closing plan, not filed.
3. **`codec/fixtures`**: `git diff --stat 11440a0a 59992f23 -- codec/fixtures` names `codec/fixtures/prior/REQUESTS.md` alone, 271 insertions, 0 deletions; no line above the 72/73 hand-over changed.

## Per issue, against the plan step

| Issue (`261014-0830-…` unless noted) | Step, commit | Read against the acceptance |
|---|---|---|
| repair answers completed on an unreconciled close | 1, `04ea51ad` | `repair.go` `run`: `switch closure.Reconciled` (a `bool` in `hostsvc.Closure`), `false` is `refusal("recovery-required", "closure.unreconciled", …)` with the closure in the detail. The plan said "in the envelope"; the commit puts it in the violation detail because the frozen schema admits only a null result there, and says so. Test `TestAnUnreconciledCloseIsRecoveryRequired` asserts status, code, null result, detail and the evidence line. Prior accepted the reading (74(b)(1)). |
| page assembler loops on a zero-length page | 2, `67ee018c` | `hostsvc.go` `decodePage`: a non-null `next_offset` with `page_bytes == 0` is a violation, placed before the `next_offset == end` test, which a zero page would otherwise pass. The test caps host calls at two. |
| explorer sends `audit_ref` to its own run | 3, `3e8c212a` | `steps.Execute` decides `consumed` on the first read only, passes `""` to the completion of a run it started, and sets `AuditRefConsumed` on the refusal path and after the post-completion read. Repair's wrapper keeps only the clearing; the explorer needed no edit. The role table gained the absent-with-audit case and the refused-completion case now asserts the reference was consumed. |
| dependency evaluation | 4, 6, 13; `e46c6634`, `8481f3b9`, `e2312078` | `dependencySatisfied` `continue`s on a missing record; `edgeEntries` runs the shared `schemaFinding` before the condition. `readWorkGraph` turns each `cycle` entry into a reported cycle, failing as unparseable on one without ids; `orderOf` merges it unless one Tarjan component holds all its members. Tests cover both orders of the dangling and accepted bindings, the schema-invalid target, and a cycle through a `done` package printed by `bin/fusion-work-order`. |
| Prior importers | 5, 13; `695e1f84`, `e2312078` | `goShape` before mapping, `checkBlock` on every block against its `$defs` entry with the finding mapped back to a Go path, and the three hashes recomputed. `nonEmpty`/`emptyToNull` refuse a non-string. Four rules the mappers restated now live in the schemas alone. `codec/src/prior/` is outside the bundle, as the commit says. |
| three small checking gaps | 5, 7; `695e1f84`, `a740170a` | `GO_TIME` is `(\.\d{0,8}[1-9])?` and refuses `+00:00`; `goQuote` writes a lone surrogate as U+FFFD and `goMarshal` refuses one. The sweep's `admit` dedups explicit and declared paths through one real-path set. `BackupUnverified` is the only error `repair` maps to 9; any other is 3. `run()`'s mapping is the known `261022-1806-…`. |
| migrate and setup skills | 8, `77d9ed46` | Seventh `ask=` field from `offersFor` (the first-add person, never the running identity), asserted in `migrate.test.ts`. `fold_store` descends into a source directory with no destination in tracked-only git mode. Setup's `manifest-present` branch: per `hooks/lib/record-write.ts` `## Initialize, Setup's route to a new workbench` a manifest makes `inspect` `json-control`, which is `reused`, so "Setup run again reuses it" holds for the only way that reason is reached (a manifest written between `inspect` and `initialize`). The no-Node fallback writes only when no marker exists, otherwise substitutes `plugin_version` in place. |
| build identity hashes ignored files | 9, `c021b485` | `fusion_revision` adds `!!` lines under `fusionmodule/` and `launcher/` to the dirt and prints them with the refusal; both scripts exit 2 through `usage` with `PRIOR_REPO` unset. I did not create a `.DS_Store` in the tree to replay that acceptance (read-only); the code read is the evidence. |
| kill test boundaries | 10, `3d3f8482` | Three boundaries added, every run paged at 96 bytes, `pages < 2` guarded; 19 of 19 passed against a scratch bundle. |
| Go schema validator | 11, 12; `81225a5e`, `7bd21581` | 37 rows, all at the root pointer, both suites reject a non-root pointer. ajv and `CompileSchema` agree on all rows; `schema.go` unchanged. |
| hooks lock (`261012-2126-…`) | 14, `9384848f`, `4d6f3740` | Root `package-lock.json` rule gone, `codec/.gitignore` negation and false comment gone, three locks tracked, no fourth lock in the tree. |
| adapter README | 9, 15; `caee5f56` | Answers 67 and 69 named, `PRIOR_REPO` required, the 69.3 rule and the close branch stated, nineteen boundaries enumerated, "ten scripted hosts" matches the ten table rows; `### One invocation` exists; no `/Users/` and no "sixteen" left. |

Steps 16 and 17 (`a69220dc`, `9ec788e1`) and the out-of-plan `59992f23` are append-only to `REQUESTS.md`. Their digests agree with what I measured: the bundle at `59992f23` is `d6fc9da0…`, and the four codec-pin plus two fj01 paths request 74 names as moved are the ones the range touched. Prior's acceptance of 74(a) is recorded, so the plan's tag condition is met as recorded there.

## Findings

### F1 (Low, data) Three pinned codec strings still overclaim after step 13

Filed: `261022-2143-three-pinned-codec-texts-still-say-proposed-mapping-or-every-cycle-after-step-13.md`.

- `codec/contract/dependencies.json` `notes[2]`: "reconcile … reports every cycle through a package in its scope". `cyclesOf` in `codec/src/cli/ops.ts` reports one cycle per package not yet covered, and its own comment says "every package that lies on a cycle lies on a reported one". Edges A->B, B->C, C->A, A->C report A->B->C->A only. Request 74 quoted this sentence and Prior accepted it.
- `codec/schemas/campaign.schema.json` line 346, `$defs` formation package: "a proposal in codec/contract/prior-mapping.json".
- `codec/contract/prior-mapping.json` `state_mapping.description`: "Proposed correspondence …", with all seven rows `confirmed: true`.

All three are bytes Prior pins, so the fix rides the next codec revision (the re-pin request after 74), never one of its own. This settles the dispatch's "proposal" side note: it deserves an issue, together with the cycle overclaim, because step 13's purpose was exactly this class of text.

### F2 (Low, code) The migrate skill's `repair --apply` sentence lost "stop" on exits 6 and 9

Filed: `261022-2143-migrate-skill-repair-apply-sentence-no-longer-tells-the-reader-to-stop-on-exit-6-or-9.md`.

`a740170a` turned "…: report either and stop." into "…; exit 3 is any other fault, named on stderr: report it and stop." In `skills/migrate/SKILL.md` the instruction now binds to exit 3 alone. The exit-3 clause also omits that such an I/O error "may follow a write" (`hooks/migrate.ts` `repair`).

### O1 (Low, observation, not filed) `verdict=empty` beside a reported cycle

`hooks/lib/work-graph.ts` `orderOf` computes `nodes.length === 0 ? "empty" : cycles.length > 0 ? "cyclic" : …`. A cycle that runs only through terminal packages is now reported (step 6), but with no live node the verdict reads `empty` beside `cycles=1`. It matches the field's own doc ("`empty` when there are no nodes") and blocks no live work, so no issue; a reader of `bin/fusion-work-order` sees the cycle row either way.

## Side notes the dispatch asked about

- **gofmt.** `gofmt -l adapters/prior/fusionmodule` lists `internal/hostsvc/hostsvc_test.go` and `internal/repair/repair_test.go`, and it lists the same two at `11440a0a` (the hostsvc diff is 12 lines both before and after). The noise predates the range and is not in `conformance/repair_test.go`, which is clean. No issue: `stage.sh` runs `go vet`, not `gofmt`, and nothing in the range made it worse.
- **Known issues' location.** `261022-1712-…` and `261022-1806-…` are in this package's issue store (`261022-1604-…`), not in `261008-1215-…` as the dispatch put it. Not re-filed.

## Cross-cutting observations

- One shared executor replaced two copies (step 3), and one shared table holds two validators to one verdict (steps 11, 12). Both remove a divergence point rather than adding a branch beside it.
- The text corrections are where the residue sits. F1 and F2 are both prose describing code, edited in the same commits as the code, and in both the edit fixed the sentence it targeted and left a neighbour stale or broken. A grep for the old word across the pinned files (F1) and a re-read of the whole sentence (F2) would have caught each.

## Recommended sequencing

No release blocker in this range. F2 can ship with any fusion-only release. F1 waits for the next codec revision put to Prior and should be named in that request's delta. The two known issues (`261022-1712-…`, `261022-1806-…`) stay as filed.
