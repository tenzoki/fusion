# Closing review: Prior full-surface hand-over, package A (H1, H6, H7)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `97552507..d02e5cb8`
**Not-opened:** `adapters/prior/fusionmodule/cmd/fusion-module/main_test.go`, `adapters/prior/fusionmodule/internal/hostsvc/entry_test.go`, `adapters/prior/fusionmodule/internal/fixture/fixture.go`, `catalog/README.md`, `catalog/src/__tests__/schema-cases.test.ts`, `fusion-workbench/orchestrator-events.jsonl`, `261023-1846-prior-full-surface-handover-h1-to-h9.md`, `261023-1854-under-prior-do-the-hook-rows-keep-going-to-orchestrator-events-jsonl.md`, `261023-1854-plan-prior-full-surface-handover-h1-to-h9.record.json`, `261023-1915-prior-handover-b-agent-profiles.md`, `261023-1915-prior-handover-c-skill-profiles.md`, `261023-1915-prior-handover-e-bundle-payload.md`, `261023-1915-prior-handover-f-release-and-request-76.md` (the last seven are workbench records, cited storeless)
**Review domain:** code
**Verdict:** accept. The package meets its brief and plan steps 1-4, 16 and 17. Four findings (two Medium, two Low) are filed as issues; none blocks closing package A. Two of them should land before request 76 is written (step 25).

Partially opened: `adapters/prior/fusionmodule/internal/fixture/entry.go` (lines 175-474 read, the rest by grep), `catalog/src/__tests__/render.test.ts` (entry and workflow tests by grep, lines 515-560 read), `adapters/prior/README.md` (diff, first 150 lines).

## Summary

The v2 catalog, the `entry.v1` definition and its two schemas, and the module's interpreter do what the plan's Acceptance lines ask. All three check commands exit 0 at `d02e5cb8`. The 27 entries match the hand-over table row by row. The Carries/CheckRoleCalls extraction leaves repair's behaviour unchanged. The weak spots are in the entry interpreter's edges:
- a settled answer can force a permanent `recovery-required`;
- the frozen result schema describes two fields differently from what is produced;
- the oversize fallback drops a commit that stands;
- the definition-shape checks in Go are untested.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 2 |

## Verification run

- `cd .../fusion/catalog && npm ci && npm test`: 225 passed (schema-cases 135, frozen 9, render 81).
- `PRIOR_REPO=/Users/kai/Projects/productive/F09-Prior .../adapters/prior/stage.sh test`: clone at `08c57fb4`; every package `ok`.
- `.../adapters/prior/check-imports.sh`: `check-imports: ok`.
- `go test -coverprofile` on `internal/entry` in the staged clone: 82.0% (`Load` 69.0%, `verify` 69.2%, `encode` 58.3%).
- `catalog/testdata/catalog-decode-cases.v2.json` run through ajv against `catalog/schemas/catalog.schema.json`: 30 of 31 verdicts agree. The one that differs is "entry id twice", which JSON Schema cannot express.

## Acceptance lines, step by step

| Step | Acceptance | Met |
|---|---|---|
| 1 | Fixture tests pass; Go decoder accepts the same document and refuses one more or one fewer key | yes. 31 shared decode cases cover extra and missing keys at catalog, entry, arguments and argument level; both decoders run the table. |
| 2 | 27 entries; 14 asks / 2 dispatches / 11 plain; `FUSION-CATALOG` and `FUSION-MODULE` exit 0 | yes. `jq` over `catalog/catalog.json` matches the hand-over's `## The 27 entries` id, kind and class for every row. |
| 3 | Workflow validates; `frozen.test.ts` passes with 17 assets | yes. `FROZEN` holds 14 + 3 lines. |
| 4 | `FUSION-CATALOG` exits 0; shared entry case table | yes. 95 rows, run by ajv and by `steps.TestSharedSchemaCases`. |
| 16 | `FUSION-MODULE` and `CHECK-IMPORTS` exit 0 at the new pin with no source change | yes. `PRIOR_PIN` is `08c57fb4…`. |
| 17 | H7 line; one plain, one dispatches, one asks entry against the fake host; kill after each persisted boundary and resume reproduce the envelope with zero further role runs | yes, at unit level. `TestOneEntryPerClassRunsAgainstTheFakeHost` and `TestAKillAfterEachPersistedBoundaryResumesToTheSameEnvelope` assert byte-equal envelopes, `ModelCalls == 1`, an equal effect map and no repeated entry-service calls. |

## Departures, judged

- **7fed356a argument rows that differ from Prior's inventory**: sound. Each one is traced to a fusion source (roster or prompt) and listed for step 25.
- **a419215a `workflow_id` in entry-request**: sound. Repair has the same pair, and every request-69 call needs it.
- **a419215a no push step**: sound. No push service exists among the twelve, and the definition text says why.
- **a419215a workbench reads after integration**: correctly left to request 76.
- **6be14760 `protocol.json` not in the diff**: correctly reported. The stated diffstat matches.
- **d02e5cb8 fake host widens `api.DecodeRepairCall`** for entry composes and `record:<path>` slots: honest, and narrowly done (`decodeProposedRepairCall` falls back only where Prior's decoder refuses). It means H7's conformance holds against the fake only. Against Prior at the pin an entry compose is refused. Request 76 must carry this as a blocking item, not a footnote.
- **d02e5cb8 placeholder profiles in `fixture.EntryBundle`**: sound, because steps 6-15 have not run. On the live catalog every entry refuses as `entry.unsupported` (`TestLoadReadsTheDefinition` loads it).
- **d02e5cb8 subject `integration <id>`, `changes` = `changed_paths`**: sound as a stop-gap, but it contradicts the frozen schema's description. See finding M2.

## Findings by theme

### Answer handling in the entry interpreter

**M1. A settled answer of status `recovery-required` becomes a permanent `recovery-required` (Medium).**
- `adapters/prior/fusionmodule/internal/entry/entry.go` `role`: `if a.Ending == nil { return &outcome{status: "recovery-required", role: true}, nil }`.
- Under D5 the run's result schema is the envelope schema, and row `er-recovery-required` of `catalog/testdata/entry-schema-cases.v1.json` accepts this answer.
- `steps.Execute` reuses a settled run, so every recovery answers the same envelope. The schema's own description excludes "a fabricated answer" from this status.
- Untested.
- Fix: refuse it as `result.invalid` in the module.
- Issue: `261023-2154-entry-module-passes-a-settled-answer-of-status-recovery-required-through-as-recovery-required.md`.

**L1. The oversize replacement drops a standing commit (Low).**
- `entry.go` `encode` builds the replacement from `(&workflow{})`, so `commits` is `[]`.
- This is after `run` states "a later refusal keeps the commit".
- Untested.
- Issue: `261023-2154-entry-envelope-oversize-replacement-drops-the-commit-of-an-integration-that-stands.md`.

### The frozen proposal against what is produced

**M2. `entry-result.v1.json` describes `commits[].changes` and `questions` differently from the module and Prior (Medium).**
- `changes` is described as `"<status>\t<path>"` name-status. Prior's `internal/fusionhost/repair_snapshot.go` at `08c57fb` produces plain paths, the module copies them, and the test asserts plain paths. `adapters/prior/README.md` admits "not git's name-status form".
- `questions` is described as "read from the host's receipts … never composed by the model". The module copies them from the run's settled answer, and the fake host's model composes them (`internal/fixture/entry.go` `scripted`).
- The file is frozen and has not yet been offered to Prior, so the user chooses between re-freezing now and carrying both points in request 76.
- Issue: `261023-2154-frozen-entry-result-schema-describes-changes-and-questions-differently-from-what-the-module-and-prior-produce.md`.

### Tests that bite, and where they do not

What bites:
- the kill/resume test (byte-equal envelope, equal effect map, `ModelCalls == 1`, no repeated entry-service calls);
- the audit-reference test (exactly one `host.role.complete.v1=audit:recovery-1`);
- the accepted-run test (only reads after the seed);
- the pre-host refusal table (`len(h.host.Sent) == 0`);
- the shared decode and schema tables run on both sides;
- `TestCarries` and `TestCheckRoleCalls`.

**L2. `entry.Load` and the receipt cross-checks are untested (Low).** Every `ErrDefinition` return in `Load` is uncovered. So are three of four `verify` refusals, the `capture.invalid`, `integration.invalid` and `snapshot.invalid` checks, and three `role` branches. The TypeScript side tests the matching workflow shapes; Go does not.
- Issue: `261023-2154-entry-load-and-the-receipt-cross-checks-have-no-test-that-would-turn-red.md`.

### Repair behaviour after the shared refactor

No change found. `steps.Carries(parsed, taskBytes, "project_context", "output_contract")` is the removed `carries` with the two host members passed in. The one difference: a task that is not an object now returns an error where it used to panic, and the module never builds such a task. `steps.CheckRoleCalls` is the removed loop, with `json.Marshal` in place of `marshal`. `fixture.Host.settled` and `pageDescriptor` are moves with no change in behaviour. The repair suite is green.

## Cross-cutting observations

- **TS and Go agree on the shared tables, but not on duplicate keys.** `api.Decode` (Prior `moduleapi/v1/protocol.go` `Decode`) refuses a repeated key. `JSON.parse` in `render.ts` `loadCatalog` keeps the last one. A JSON table cannot express that case, so the claim in `catalog_test.go` and `render.ts` `checkCatalogDocument` that "the renderer and the module accept and refuse the same documents" is slightly too strong. In practice it is covered: `FUSION-MODULE` decodes the live catalog through `FUSION_CATALOG_DIR`. This predates the range; not filed.
- **Orchestrator's `requires` is under-declared for now.** `orchestrator` is class `asks` with `requires` `host.question.v1, host.exec.v1`, though its prompt dispatches agents. That follows the plan's interim rule for step 2. Step 15's invariant (requires equal to the services the prior parts name) will force `host.dispatch.v1` in once the orchestrator profile exists. Noted for package B and step 15; not a defect now.
- **Wrong row counts in a commit message.** `830ec97c` says 41 entry-request and 54 entry-result rows. The table holds 39 and 56 (95 in total, which matches). Not filed; commit messages are immutable.

## Recommended sequencing

1. Before step 25 (request 76): M2 (choose re-freeze or carry), and the `DecodeRepairCall` widening stated as a blocking item in the request.
2. With the next change to `internal/entry` (step 18 at the latest): M1, then L1 and L2.
3. Package A can close. No finding re-opens an Acceptance line.
