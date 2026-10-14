# Closing review: fusion as an external Prior module bundle (v13.1.0)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `9ac8222c..60141589`
**Not-opened:** `fusion-workbench/orchestrator-events.jsonl`, the work package `260928-1338-json-control-data-and-markdown-artefacts` (its whole directory), `fusion-workbench/work-packages/261008-1215-fusion-as-an-external-prior-module-bundle/analyses/`, `261009-1024-fusion-is-the-one-source-of-role-texts-and-workflow-rules-for-both-hosts.md`, `261010-1235-how-is-the-host-neutral-role-text-the-source-of-both-the-claude-agents-and-the-prior-profiles.md`, `261010-1235-in-which-language-is-the-prior-module-executable-built-and-how-does-it-consume-priors-module-api.md`, `fusion-workbench/work-packages/261008-1215-fusion-as-an-external-prior-module-bundle/discussions/`, `261008-1215-fusion-as-an-external-prior-module-bundle.md`, `codec/fixtures/`, `codec/dist/fusion-record.js`, `hooks/dist/`, `codec/src/__tests__/`, `hooks/lib/__tests__/`, `codec/contract/prior-mapping.json`, `codec/schemas/common.schema.json`, `codec/schemas/protocol.schema.json`, `adapters/prior/fusionmodule/conformance/explorer_test.go`, `adapters/prior/fusionmodule/conformance/host_test.go`, `adapters/prior/fusionmodule/internal/explorer/explorer_test.go`, `adapters/prior/fusionmodule/internal/fixture/fixture.go`, `adapters/prior/fusionmodule/internal/fixture/sha.go`, `adapters/prior/fusionmodule/internal/hostsvc/hostsvc_test.go`, `adapters/prior/fusionmodule/internal/repair/repair_test.go`, `adapters/prior/fusionmodule/internal/steps/role_test.go`, `adapters/prior/fusionmodule/internal/steps/strictjson_test.go`, `adapters/prior/fusionmodule/cmd/fusion-module/main_test.go`, `adapters/prior/testdata/`, `catalog/package-lock.json`, `catalog/tsconfig.json`, `catalog/vitest.config.mjs`, `catalog/schemas/catalog.schema.json`, `catalog/schemas/profile.schema.json`, `catalog/schemas/explorer-envelope.v1.json`, `catalog/schemas/explorer-request.v1.json`, `catalog/schemas/explorer-result.v1.json`, `catalog/profiles/*/parts/*-neutral.md`, `catalog/profiles/*/parts/*-claude.md`, `catalog/profiles/explorer/parts/`
**Review domain:** both. Code: `adapters/prior/`, `catalog/src/`, the build and staging scripts. Ontology and structured data: `catalog/catalog.json`, `catalog/workflows/*.json`, `catalog/schemas/*`, the Prior overlays under `catalog/profiles/*/parts`.
**Work package:** `261008-1215-fusion-as-an-external-prior-module-bundle`
**Plan:** `261010-1235-plan-fusion-prior-module-bundle-explorer-then-four-role-repair.md`, all 25 steps done. `v13.1.0` is at `c8d5a6f1`, HEAD at `60141589`.
**Cross-references:** `261010-1046-reviewer-closing-pass-over-the-uncovered-fj00-to-fj05-commits.md` (the `**Not-opened:**` list carried from there), `261012-2126-candidate-c-verification.md`

Coverage notes on the header:

- **Read in part only, and counted as opened:**
  - `codec/fixtures/prior/REQUESTS.md`, which is under `codec/fixtures/` in the list above: lines 4522-4596 (answer 69 and the head of request 70) and grep hits for `reconciled`.
  - `adapters/prior/fusionmodule/conformance/repair_test.go`: lines 540-772.
  - `adapters/prior/fusionmodule/internal/steps/bundle_test.go`: lines 95-140.
  - `adapters/prior/fusionmodule/internal/steps/schema_test.go`: lines 121-165.
  - `adapters/prior/fusionmodule/internal/fixture/repair.go`: lines 427-556, plus grep.
  - `install.sh`: lines 78-89 and the range diff.
  - `README-agents.md` and `hooks/lib/__tests__/reference-resolution-lint.test.ts`: the range diff.
  - `catalog/schemas/implementer-request.v1.json`, `review-request.v1.json`, `explorer-role-input.v1.json`: key sets only.
- **Opened through a delegated read-only pass**, whose findings are marked as such below; the reviewer re-read the lines each verified finding cites:
  - `codec/src/prior/{blocks,campaign,candidates,common,packages,types,gojson}.ts`
  - `codec/schemas/{record,package,evidence,workbench,campaign,migration-plan,migration-proposal,migration-receipt}.schema.json`
  - `codec/contract/dependencies.json`
  - `hooks/lib/work-graph.ts`, `hooks/scope.ts`
  - `bin/fusion-citation-sweep`
  - `skills/{wp-order,migrate,setup}/SKILL.md`
- **The tail of the range.** `ccc181b5`, `94affe7b` and `4eb4380a`, the tail of the 13.0.0 package, touch only `fusion-workbench/`. They are covered by the workbench entries above.

## Summary

The package delivered what its brief asked for. The Claude render of the three converted prompts is byte-equal to `agents/`: `cd catalog && npx vitest run` passed 35 of 35 tests at HEAD. Every `FROZEN` line matches its file (`shasum -a 256 -c`). `install.sh`'s copy loop names neither `catalog/` nor `adapters/`. The Prior overlays agree with answer 69 on the points checked: tools, `process.check`, the read-only principals, `writes_workbench.prior` false, and the exclusive verification forms.

The adapter has one contract gap: a close answering `reconciled: false` is reported as `completed`. The build identity has one latent reproducibility hole. Several Low defects concern robustness, test coverage and documentation. The carried 13.0.0 list yielded one High defect, a broken `/fusion:migrate` Step 6 flow, and four Medium ones.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 5 |
| Low | 7 (six issues, one decision) |

Verdict: **revise**. No finding touches the bundle Prior accepted at answer 70, and none blocks the release that stands. The findings ask for fixes in this package's code and in carried 13.0.0 code. Whether those fixes land under this package or a follow-up one is the user's call.

## Findings by theme

### A. The repair adapter against the frozen contract

**A1. Medium: a close with `reconciled: false` is reported as `completed`.** `adapters/prior/fusionmodule/internal/repair/repair.go:613-621` checks only that the closure decodes. `hostsvc.go:401-410` decodes `Reconciled` and never reads it. The schema admits the case (`catalog/schemas/repair-result.v1.json:295-298`; confirmed with ajv). Answer 69 defines `reconciled` as true only when post-image, receipts, journal and commit agree, and request 70 expects it true. No branch of the close-to-status split covers `false`. Tests cover only `true` (`internal/fixture/repair.go:747`, `internal/hostsvc/hostsvc_test.go:224`). Fix: map it to `recovery-required`; no frozen schema needs to change. Issue: `261014-0830-the-repair-module-answers-completed-on-a-close-whose-reconciled-is-false.md`.

The rest of the contract checked out against the code:

- Closed envelopes: `hostsvc.closedObject` requires exact member sets.
- The three exclusive verification forms: the schema `oneOf` branches with `false` properties, verified with ajv.
- `stopped_at` `close`: the escalations map sends `record-conflict` there, at `repair.go:78-82`.
- `host_evidence` is answered or settled only, one per run, in order, or null: SDK `role_wire.go` at `10ad78b` refuses a result on `accepted`.
- The 13-field integration and 11-field snapshot: `hostsvc.IntegrationFields` and `SnapshotFields`.
- The attempt map: refused before any role call, at `repair.go:314-362`.
- Composition: frozen-input verification at `repair.go:767-791`.

**A2. Low: a zero-length page loops forever.** `hostsvc.go:461` admits `page_bytes` 0. `:473` lets `next_offset == offset` pass, and `:421-432` re-requests the same slot with no progress check. Issue: `261014-0830-the-workbench-page-assembler-accepts-a-zero-length-page-and-loops-on-it.md`.

**A3. Low, cross-cutting between the two workflows: the explorer sends `audit_ref` to a run it started.** `explorer.go:252` passes `audit_ref` to `steps.Execute`, which sends it on the completion after its own run (`role.go:62-76`). Repair consumes it only for a run first read at `answered` (`repair.go:733-751`), which is the 69.3 rule. Issue: `261014-0830-the-explorer-sends-the-recovery-audit-ref-to-a-run-it-started-itself.md`.

### B. Build reproducibility and release identity

**B1. Medium: the identity hashes ignored files.** `cmd/fusion-bundle/main.go:269,464-497` inventories every file under `fusionmodule/` and `launcher/`. `build.sh:66`'s dirty check never sees ignored files, such as `.DS_Store` (`.gitignore:133`) or `*.swp` (`:139`). The defect is latent, since step 24's rebuild matched. Issue: `261014-0830-the-bundle-build-identity-hashes-git-ignored-files-the-dirty-check-cannot-see.md`.

**B2. Low, as a decision: a shipped change after the tag without a version bump.** `60141589` edits `skills/help/SKILL.md` after `v13.1.0` and leaves `plugin.json` at 13.1.0, against `CLAUDE.md`'s "Bump version on every change". `main` and the tag now differ under one version. A bundle built at `main` would be a second `fusion` 13.1.0 with another digest, and nothing refuses that build. Decision: `261014-0830-does-a-shipped-file-change-after-a-release-tag-take-a-version-bump-when-the-bump-changes-the-prior-bundle-digest.md`.

### C. Test coverage and documentation of the adapter

**C1. Low: the kill test omits boundaries its name claims.** `conformance/repair_test.go:560-577` has no reviewer or auditor compose boundary and no page boundary. Its name, plan step 18 and `adapters/prior/README.md:253-256` claim every persisted boundary. Issue: `261014-0830-the-repair-kill-test-omits-the-reviewer-and-auditor-compose-and-the-page-boundaries.md`.

**C2. Low: the Go validator is checked against the explorer schemas only.** `schema.go:13-23` claims agreement with the host's validator. `schema_test.go:121-165` exercises the explorer schemas only, and no test in either language holds a negative repair-schema case. Issue: `261014-0830-the-go-schema-validator-is-checked-against-the-explorer-schemas-only.md`.

**C3. Low: the adapter README is stale in places.**
- The header names answer 67 and `external_explorer.go` only (`adapters/prior/README.md:10-14`).
- The Testing bullets still describe the explorer-only catalog (`:202-206`).
- `PRIOR_REPO` defaults to a personal path (`build.sh:39`, `stage.sh:30`).

Issue: `261014-0830-the-adapter-readme-describes-the-step-7-explorer-only-state-in-places.md`.

### D. Data: catalog, workflows, overlays

No finding. Checked:

- `catalog.json` ids and aliases against `steps.LoadCatalog`.
- The rendered `profiles/*.json` key sets and ceilings: `code-implementer` `process` is read as `process.check` in `03-prior.md` item 3 and `19-prior.md`, per 69.6(4); `state-auditor` has `runtime-inspect` and `git-inspect`, per 69.4.
- The three repair roles' `*-prior.md` overlays against answer 69's per-service text.
- `repair.v1.json` step list against `repair.go`'s `expected` table.
- The four role-input key sets against the Go task structs.

### E. Carried 13.0.0 files, from the delegated pass

**E1. High: `/fusion:migrate` Step 6 cannot write.** It runs the sweep's `--write` on a tree holding the staged renames, and the sweep's guard refuses that with exit 4 (`hooks/citation-sweep.ts:616-646,921-927`). The skill never handles exit 4, and a `FOUND=0` re-run skips Step 6. The guard was verified; that the staged renames trip it is inference. Issue: `261014-0830-migrate-step-6-runs-the-citation-sweep-write-on-a-tree-its-own-guard-refuses.md`.

**E2. Medium: dependency evaluation.**
- One dangling evidence binding fails a `succeeded` edge (`ops.ts:2327-2337` with `transitions.ts:300-303`).
- Targets are read unvalidated (`ops.ts:2340-2350`).
- Cycle entries are dropped by the work graph (`work-graph.ts:457`).

All three verified. Issue: `261014-0830-dependency-evaluation-fails-an-edge-on-one-dangling-evidence-binding-and-reads-unvalidated-targets.md`.

**E3. Medium: the Prior importers.** They are weaker than their schemas and have no production caller. The hash helpers are called only from tests (verified by grep). The schema-rule gaps are as the delegated pass reported them. Issue: `261014-0830-the-prior-importers-accept-input-their-schemas-refuse-and-check-no-revision-hash.md`.

**E4. Medium: skill text against helper behaviour.** The migrate repair's `ask=` line lacks the offered person (verified, `hooks/migrate.ts:582`). Tracked-only folding moves untracked children. Setup's exit-6 message and its marker fallback misdescribe the helpers. Issue: `261014-0830-migrate-and-setup-skills-name-helper-output-and-exit-paths-the-helpers-do-not-provide.md`.

**E5. Low: three small checking gaps.** The sweep double-counts explicit paths, `gojson` checks are looser than its doc says, and migrate repair maps every exception to exit 9. None re-read by the reviewer. Issue: `261014-0830-citation-sweep-gojson-and-migrate-repair-carry-three-small-checking-gaps.md`.

The delegated pass found no defect in `codec/src/prior/types.ts`, `blocks.ts`, `hooks/scope.ts`, `bin/fusion-citation-sweep`, `skills/wp-order/SKILL.md`, or the evidence, workbench and three migration schemas.

## Cross-cutting observations

1. **Partial case splits at the host boundary.** A1 (`reconciled`), A2 (page progress) and E2 (dangling bindings) are one pattern: a value the contract admits, with no branch for it.
2. **Claims that outrun the checks.** C1, C2, C3, E3, and the description overstatements under E2 all claim more coverage or enforcement than the code holds.
3. **The two workflows diverge on one rule** (A3). A shared executor in `internal/steps` would make the explorer and repair agree by construction.
4. **Identity is bound to the whole revision** (B1, B2). The bundle digest moves with any commit and with ignored files. Two release surfaces now hang off one revision, so the version rule needs a decision.

## Recommended sequencing

- **Before the next `/fusion:migrate` user run:** E1.
- **Before the next Prior bundle (13.1.1 or later):** A1, B1, A2 and A3, all of which change the binaries and therefore the digest. Settle B2 first, since it decides which version that bundle carries.
- **Cleanup, any time:** C1, C2, C3, E2 to E5.
