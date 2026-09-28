# Requests to the Prior side from FJ00

**Written against:** fusion commit `e7c11fec` on branch `fj-json-workbench` (2026-09-28; the `codec/` tree is the one commit `c8992f13` landed), which read Prior at commit `12d8424`.
**Where the files are:** everything named here without a repository prefix lives under `codec/` in the fusion repository. Prior paths are marked `Prior:`.
**How to answer:** either edit the named fusion file, or write the ruling in a reply that names the fixture directory or the row; the fusion side applies a reply. Each request says which of the two it prefers.

FJ00 built the JSON schemas, the field-by-field mapping of Prior's three persisted aggregates (`candidates.Register`, `packages.Plan`, `campaign.State`) onto that contract, and a test set. Six things it cannot produce on its own are listed below, in the order they are needed.

## 1. Go-emitted goldens for the 13 round-trip cases under `codec/fixtures/prior/`

**Closes:** `_provenance` in every `codec/fixtures/prior/<aggregate>/<case>/prior.json`; the test gate `CODEC_REQUIRE_GOLDENS=1` in `codec/src/__tests__/prior-mapping.test.ts`.

A golden is the aggregate that Prior's own code builds in the named Go test, written by `encoding/json` from the Go value. Every `prior.json` today was derived by hand from the struct definitions and the test source, and says so: `"_provenance": "derived-from-source@12d8424"`. A hand-derived fixture can carry a `null` where Go writes `[]`, or a key order Go would not produce; the fusion side cannot tell.

| Case directory | Prior test |
|---|---|
| `register/duplicate-intake-and-source-change-require-requalification` | `Prior: modules/fusion/candidates/register_test.go` `TestDuplicateIntakeAndSourceChangeRequireRequalification` |
| `register/frozen-selection-replays-explanation-and-stale-prevents-admission` | same file, `TestFrozenSelectionReplaysExplanationAndStalePreventsAdmission` |
| `register/admission-persists-stable-item-and-current-attempt` | same file, `TestAdmissionPersistsStableItemAndCurrentAttempt` |
| `register/merge-chains-resolve-and-cycles-rollback` | same file, `TestMergeChainsResolveAndCyclesRollback` |
| `register/policy-records-every-exclusion-reason-and-closed-watermark` | same file, `TestPolicyRecordsEveryExclusionReasonAndClosedWatermark` |
| `plan/adaptive-formation-records-merge-split-and-deferral` | `Prior: modules/fusion/packages/packages_test.go` `TestAdaptiveFormationRecordsMergeSplitAndDeferral` |
| `plan/admission-crash-requires-observation-before-dispatch` | same file, `TestAdmissionCrashRequiresObservationBeforeDispatch` |
| `plan/dependency-cycle-is-deferred` | same file, `TestDependencyCycleIsDeferred` |
| `plan/failed-package-does-not-block-unrelated-package` | same file, `TestFailedPackageDoesNotBlockUnrelatedPackage` |
| `campaign/restart-cannot-reset-failures-reviews-or-resource-limits` | `Prior: modules/fusion/campaign/campaign_test.go` `TestRestartCannotResetFailuresReviewsOrResourceLimits` |
| `campaign/unknown-effect-and-baseline-deterioration-pause` | same file, `TestUnknownEffectAndBaselineDeteriorationPause` |
| `campaign/revocation-amendment-and-terminal-outcomes` | same file, `TestRevocationAmendmentAndTerminalOutcomes` |
| `campaign/discard-failed-and-cancelled-remain-distinct` | same file, `TestDiscardFailedAndCancelledRemainDistinct` |

What to emit, per case:

1. The aggregate as it stands at the end of the named test. If the current `prior.json` plainly matches an earlier point in the test, take that point instead and say so in `_provenance_note`.
2. The side inputs the test passed that the aggregate does not hold, under the key `_inputs`, marshalled by the same `encoding/json` call from the values the test used: `Policy` and `Snapshot` (the arguments of `Select`), `FormationPolicy` (the argument of `Form`), `CompletionEvidence` (the argument of `Finalize`), and `WorkItems` (the work item ids the test admitted, as a list of strings). Only the inputs the case used; the current files show which. The fusion test recomputes `SnapshotHash` from `_inputs.Snapshot` and `CharterHash` from `Charter`, so these must be the values that were hashed.
3. Three keys that are not Go fields, kept at the top of the file: `"_provenance": "go-golden@<Prior commit>"` (the fusion test accepts exactly `derived-from-source@<hex>` or `go-golden@<hex>`), `"_provenance_note"` (one sentence saying how the file was emitted), and `_inputs` as above. Everything else in the file is the Go value, key for key.

Whitespace does not matter: Prior stores the aggregates with `json.MarshalIndent(value, "", "  ")` (`Prior: modules/fusion/candidates/repository.go`, `packages/repository.go`, `campaign/repository.go`) and hashes them with `json.Marshal`, and the fusion test re-serialises before comparing. What matters is every value, the key order, and whether each empty collection is `null`, `[]` or `{}`.

Replace `prior.json` in the case directory; leave `fusion.json` alone, the fusion side regenerates it when the golden's values differ from the derived file. Preferred form: the edited files. Verification on the fusion side: `cd codec && CODEC_REQUIRE_GOLDENS=1 npm test` goes green only when all 13 files carry `go-golden@`.

On the shape of an emitter: a scratch Go program of about 150 lines exists on the fusion side (not in either repository) that reads a `prior.json`, drops the underscore keys, unmarshals the rest into Prior's structs, marshals it again with `encoding/json`, and recomputes `Revision`, `EvidenceHash`, `SnapshotHash` and `CharterHash` the way `registerRevision`, `planRevision`, `stateRevision`, `evidenceHash` and `charterHash` do. That proves the serialisation, not the scenario. A golden proper is written from inside the test, after its last step, by the same marshalling; a helper of a few lines in each `_test.go` file, or a `go run` program that replays the test's calls, is enough.

## 2. A ruling on every `confirmed: false` row in `codec/contract/prior-mapping.json`

**Closes:** the `confirmed` field of each of the 163 rows under `rows` and the 7 rows under `state_mapping.rows`. FJ04's migration refuses to run over an unconfirmed row, and never treats one as a default.

The request is a ruling per row, not a re-derivation: either `confirmed: true`, or a correction of the row's `fusion_path`, `type`, `null_vs_empty`, `revision_encoding` or `note`, with the reason in `note`. Preferred form: the edited file, or a reply listing `aggregate.prior_key` and the ruling.

**The seven `packages.Package.State` rows first.** The package itself is always kept verbatim under `campaign.formation.packages[]`; the row says which fusion package, if any, an importer creates in addition.

| `prior_value` | proposed `fusion_status` | proposed `outcome_class` | proposed note |
|---|---|---|---|
| `formed` | none | none | campaign formation only, no fusion package |
| `admitting` | none | none | campaign formation only, no fusion package |
| `admitted` | `open` | none | admitted but not started |
| `running` | `claimed` | none | needs a claim; checkout and person are not in the aggregate and must come from the migration plan, never be invented |
| `completed` | `done` | `completed` | without a bound evidence record the class is `legacy-completed` |
| `failed` | `dropped` | `failed` | `FailureReason` becomes the reason |
| `stale` | `paused` | none | reason `stale` |

Please also confirm that these seven values are the complete set a `Package.State` can hold at `12d8424`; an unknown value is refused at import, never reduced to `dropped`.

**Then the field rows, by aggregate.** Each row names the Go field (`prior_key`), the JSON path it lands on, the type there, and how an empty or zero value is treated (`null_vs_empty`, whose vocabulary the file's `conventions` block defines).

| Group | Structs (rows) | Rows to read with particular care |
|---|---|---|
| `candidates.*` (59) | `Source` (4), `Evidence` (2), `Candidate` (19), `Qualification` (6), `Disposition` (8), `Register` (7), `Predicate` (3), `Weight` (2), `Policy` (5), `Snapshot` (3) | `Register.Candidates` becomes one issue record per entry; `Candidate.Disposition` is split into `selection` and `admission`; `Candidate.ID` lands on `prior_id` and `Kind` on `item_kind`; `Statement` and `Purpose` land in `provenance.legacy_fields` (item 6); `Candidate.Version`, `Qualification.CandidateVersion` and `Disposition.CandidateVersion` refuse zero |
| `packages.*` (51) | `Candidate` (10), `FormationPolicy` (5), `Package` (13), `Deferred` (2), `Attempt` (4), `Admission` (6), `Plan` (11) | every Go map (`Plan.Candidates`, `Packages`, `Admissions`, `ActiveItems`) becomes an array of keyed entries sorted by key; `FormationPolicy.MaxRisk`, `MaxValidationCost`, `MaxSize` and `Attempt.Attempt` refuse zero; `Admission.Status` and `Package.State` are enums carried verbatim |
| `campaign.*` (53) | `Limits` (5), `Charter` (20), `Counters` (5), `Settlement` (4), `CompletionEvidence` (6), `State` (13) | `State.Charter` is hoisted to `campaign.charter`; `Charter.ItemKinds`, `CandidateSources` and `WorkflowTemplates` refuse nil and empty (`minItems 1`), the other lists accept both; `Limits.MaxAttempts`, `MaxConsecutiveFailures`, `MaxReviews` and `ResourceUnits` refuse zero; `State.State` and `RequestedOutcome` are enums carried verbatim |

Rows whose `null_vs_empty` is `nil-and-empty-to-[]` should be ruled on the corrected description in item 3c, not on the sentence the file carries today.

## 3. Four questions the spec leaves to Prior

**Closes:** the `_inputs` convention of item 1, the `nil-and-empty-to-[]` entry under `conventions.null_vs_empty` in `codec/contract/prior-mapping.json`, `provenance.legacy_fields.empty_collections` in every `fusion.json`, and the `WorkItemID` rule in `codec/src/prior/candidates.ts`. Preferred form: a reply.

**3a. Are `Policy`, `Snapshot`, `FormationPolicy` and `CompletionEvidence` persisted anywhere at `12d8424`?** The fusion side found them only as call inputs: `Select(ctx, registerID, snapshot Snapshot, policy Policy)` (`Prior: modules/fusion/candidates/register.go`), `Form(id, accepted string, candidates []Candidate, policy FormationPolicy)` (`packages/packages.go`), `Finalize(ctx, id string, evidence CompletionEvidence)` (`campaign/campaign.go`). Only `PolicyVersion`, `SnapshotHash`, `Plan.PolicyVersion` and the resulting `State` reach the aggregates, and no non-test file outside those three constructs the four types. That is why the fixtures carry them under `_inputs`, and why `register.policy`, `register.snapshot`, `formation.policy` and `state.completion_evidence` are `null` when a migration does not have them. If they are stored somewhere else (a collaboration state, a log, the `integration/` package), name the place and the fusion side reads them from there.

**3b. Do nil slices and maps reach disk as `null` or as `[]` / `{}`, aggregate by aggregate?** The fusion side found both forms in the code: `Open` creates `Candidates`, `Stable` and `Watermarks` as empty maps (`register.go`, `Register{ID: id, Candidates: map[string]Candidate{}, ...}`), `Form` creates `Candidates`, `Packages`, `Admissions` and `ActiveItems` as empty maps (`packages.go`), `Qualify` and `evaluate` create `Reasons` as `[]string{}` (`register.go`); whereas `Sessions`, `Runs`, `Candidate.Dependencies` and `Package.Dependencies` stay nil until something is appended and are written as `null`. `json.Unmarshal` keeps the difference on reload. Is the difference ever meaningful to Prior, or an accident of construction? Would Prior normalise it (which moves every stored revision), or is it stable at `12d8424`?

**3c. Is the `empty_collections` carry wanted?** Because both forms occur, the fusion import records under `provenance.legacy_fields.empty_collections` which collections were empty rather than `null`, and the export restores exactly that form, so the recomputed revision equals the stored one. The sentence in `prior-mapping.json` still says "export writes the Go nil form"; it is wrong and will be corrected to describe the carry (fusion issue `260928-1503_*_the-nil-and-empty-mapping-rule-says-export-writes-the-go-nil-form-and-that-cannot-round-trip.md`). The alternative is a round trip that is equal by value only, where nil and empty are the same and the revision may not match. Which do you want?

**3d. How is a `WorkItemID` resolved at migration?** `Disposition.WorkItemID` names a work item the register alone cannot resolve. The fusion side sees three candidates: `packages.Plan.ActiveItems` (item id to admission id), `packages.Attempt.ItemID` inside `Admission.Attempts`, or a store outside the three aggregates. Which one is authoritative, and what does an id that resolves nowhere mean (an admission crash before observation, or a corrupt register)? Today the import refuses such an id with `unresolved-reference` when the caller passes the set of known items, and carries it unchecked when it does not (`codec/src/prior/candidates.ts`).

## 4. A Go test on the Prior side over `codec/fixtures/manifest.json`

**Closes:** the FH01 acceptance sentence in `Prior: docs/design/fusion-dual-host-implementation-plan.md` (`### FH01`: "both adapters can validate the same fixture set; invalid fixtures are refused for named reasons"), and the open question in the FJ00 plan whether the Prior side accepts this manifest as the shared fixture index. Preferred form: the test in the Prior repository, plus a reply saying whether the fixture set is copied into Prior (stamped with the fusion commit) or read from a fusion checkout.

`manifest.json` is an array of 172 entries, one per file under `codec/fixtures/` except `prior/` and the two manifest files, validated by `codec/fixtures/manifest.schema.json`. Fields:

| Field | Meaning |
|---|---|
| `path` | the fixture, relative to `codec/fixtures/`, forward slashes, no leading slash |
| `schema` | the `$id` of the schema to validate against (`urn:fusion:schema:fusion.workbench/v1`, `fusion.package/v1`, `fusion.record/v1`, `fusion.campaign/v1`, `fusion.evidence/v1`, each with the same prefix), or the literal `bytes` for a fixture that exercises the strict reader only |
| `expect` | `valid` or `invalid` |
| `error_class` | `schema-invalid` or `unsupported-format`; present exactly when `expect` is `invalid`; `unsupported-format` is the outcome for a `$id` the validator does not know (one fixture names `fusion.workbench/v2`) |
| `reason` | for a `bytes` fixture that is invalid, the strict reader's reason: `bom`, `too-large`, `invalid-utf8`, `duplicate-key`, `non-finite`, `multiple-values`, `not-an-object` or `syntax`; on any other entry it is documentation only |
| `note` | documentation, never asserted |

Counts at `e7c11fec`: 34 valid, 138 invalid (137 `schema-invalid`, 1 `unsupported-format`); by schema, record 54, package 46, campaign 24, evidence 20, workbench 20, `bytes` 8. Nine files sit under `bytes/`; the ninth, `crlf-only.bin`, is a valid workbench manifest with CRLF line endings and is listed under the workbench schema.

What the test asserts: for every JSON fixture, `expect` and, when invalid, `error_class`, and nothing else; the fusion harness never asserts a schema keyword or a message, and a manifest `reason` on a JSON fixture is not an assertion. For the eight `bytes` fixtures, the reader's `reason` as well. The strict reader refuses, in this order: a byte order mark, more than 1 MiB (1 048 576 bytes), invalid UTF-8, a duplicate key at any depth, a non-finite number token, more than one top-level value, a top-level value that is not an object. `encoding/json` alone accepts a duplicate key (the last wins) and turns invalid UTF-8 into U+FFFD, so those two need a check of their own. The six schemas under `codec/schemas/` are JSON Schema draft 2020-12; every `$id` is `urn:fusion:schema:<namespace>` and cross-file `$ref`s use that URN, so all six are registered before any of them validates.

## 5. Three places where the spec and the fusion conventions disagree

**Closes:** for each, one row of `codec/contract/transitions.json` and the state enum in `codec/schemas/record.schema.json` on the fusion side, and the table in section 4.3 of `Prior: concept/fusion-json-workbench-spec.md` on the Prior side. The conventions cited are `rules/fusion-workbench-conventions.md` in the fusion repository, which the spec preserves by value. Preferred form: a reply per question.

**5a. Is `deferred → open` an edge on issues and plans?** Spec 4.3 maps the markers `_o_`, `_p_`, `_c_`, `_d_` onto `open`, `in_progress`, `closed`, `deferred` and says the import reads the existing transition rules per kind. The conventions (`## Terminal states are history`) make `_c_` and `_d_` terminal with no rename back: continuation is a new record citing the old one. Fusion's current reading: no such edge. `transitions.json` gives issues and plans five edges (`open → in_progress`, `open → closed`, `open → deferred`, `in_progress → closed`, `in_progress → deferred`) and makes `closed` and `deferred` terminal. If Prior needs a reopen (a deferred candidate selected again, say), say so; the answer changes `transitions.json` and `codec/src/__tests__/transitions.test.ts` here, and spec 4.3 there.

**5b. Which states does a discussion take?** Spec 4.3 gives discussions "the same four state values" as issues. The conventions (`## Filename Patterns`) give a discussion `_o_` and `_c_` only, and read an open one as interrupted, not pending. Fusion's current reading: `transitions.json` keeps the four values for imported records but allows the single edge `open → closed`; at FJ01 the enum should narrow to `open | closed`. The answer changes `record.schema.json`, `transitions.json`, the discussion fixtures under `codec/fixtures/valid/record/` and `invalid/record/` and `manifest.json` here, and the `discussion` row of spec 4.3 there.

**5c. What is the decision state behind `_d_`?** Spec 4.3 names it `dropped`. The conventions (`## State Markers — decisions`) name `_d_` Deferred: the user pushed the decision out, the record cites the deferral target and who ruled, and the state is terminal. Fusion's current reading: the schema and `transitions.json` carry the spec's `dropped` (edges `open → dropped`, `answered → dropped`), which is the wrong word, because `dropped` is also a package status and an outcome class and means something else there. The fusion side proposes `deferred` with a required target reference. The answer changes `record.schema.json`, `transitions.json`, `transitions.test.ts`, the decision fixtures and `manifest.json` here, and the `decision` row of spec 4.3 there.

## 6. Two open vocabularies and the place of `Statement` and `Purpose`, to co-decide at FJ01

**Closes:** `artefact_ref.kind` in `codec/schemas/common.schema.json`, `control.disposition.kind` for issues in `codec/schemas/record.schema.json`, and the two `candidates.Candidate` rows `Statement` and `Purpose` in `codec/contract/prior-mapping.json`. Both questions are filed as fusion decision records; cite them by these basenames. Preferred form: a reply, ahead of FJ01.

**6a. `260928-1420_*_which-closed-vocabularies-do-artefact-kind-and-issue-disposition-kind-take.md`.** Both fields are open lowercase tokens today, so they classify nothing. The record recommends closing `artefact_ref.kind` now from the artefact kinds fusion already names (`spec`, `plan`, `issue`, `decision`, `discussion`, `review`, `analysis`, `consultation`, `memo`, `forum`, `report`, `patch`, `log`, `other`), and closing an issue's `disposition.kind` once, with Prior, at FJ01, seeded from Prior's `Disposition.Outcome` set (`pending`, `selected`, `admitted`, `deferred`, `rejected`, `out_of_scope`, `merged`) and fusion's own resolution words (`fixed`, `duplicate`, `deferred`, `rejected`, `out-of-scope`, `merged`, `superseded`). Asked of Prior: which artefact kinds Prior's evidence and handover files need in the first list, and which disposition kinds Prior needs in the second. Any set adopted is additive-only afterwards.

**6b. `260928-1420_*_where-do-a-candidates-statement-and-purpose-live-after-import.md`.** The two prose fields belong in the issue's Markdown narrative under the spec's own principles; FJ00 also keeps them verbatim in `provenance.legacy_fields` so that the export reproduces Prior's bytes. The record recommends keeping that copy frozen at import for now, and asks Prior whether it can stop persisting the prose in the register and refer to the record instead, and when. A yes there removes the two rows from the mapping at FJ04 and the copy from provenance.

## FJ01

**Written against:** fusion commit `d9dff6ad` on branch `fj-json-workbench` (2026-09-28), which read Prior at commit `478ce21`. `codec/dist/fusion-record.js` at that commit is 440 232 bytes, `sha256:d9d0d440caeb7c311c1de942ca2471a3621dbcfb7d1bcefd6877c5922e4ff500`.

FJ01 turned the codec into one shipped file. `install.sh` now copies `codec/` into the install, and `codec/dist/fusion-record.js` is the one file an installed copy runs: plain `node`, no `node_modules`. `bin/fusion-record` is the Claude side's way in; the Prior side spawns the same file. The bundle reads one JSON request on stdin, writes one JSON response on stdout followed by a newline, and exits: 0 when a response was written, whatever its `ok`; 2 on a usage error; 3 when its inlined schemas do not load. Nothing is written to stderr except on 2 and 3. Four things are asked, in the order they are needed.

### 7. The Prior test adapter reads and updates the same record

**Closes:** the six pairs and `README.md` under `codec/fixtures/protocol-session/`, and the second half of FJ01's row in section 9 of `Prior: concept/fusion-json-workbench-spec.md` (read and updated from the Prior test adapter). Preferred form: the adapter and its test in the Prior repository, plus a reply carrying the revision and the record bytes from step 6 below.

What the adapter does, from an installed fusion copy:

1. Spawn `node <install>/codec/dist/fusion-record.js` with stdin and stdout pipes, one process per request. Take the executable digest of item 8 over the bundle file, not over `node`.
2. Copy `codec/fixtures/workbench/` to a fresh temporary directory, W, and use its absolute path.
3. Replay the six pairs in order, `01-show` to `06-validate`. In every `*.request.json`, replace the literal `<workbench>` with W before writing the bytes to stdin. In `06-validate.response.json`, the only answer that echoes the root, replace `<workbench>` with W before comparing.
4. Assert, per exchange, that stdout equals the recorded `*.response.json` byte for byte and that the exit code is 0. Two properties hold by design: `05-transition`'s stdout equals `02-transition`'s, because 05 repeats 02's `operation_id` and payload and receives the stored answer out of `W/.json-state/ops/`; and every revision in the six is the same on every machine, because a revision is `sha256:` over the stored bytes and the fixture bytes are fixed.
5. Perform one transition of the adapter's own: `transition` the same package from `claimed` to `paused`, with `expected_revision` set to the revision `03-show` returned, a fresh `operation_id`, an `actor` and a `reason`; expect `ok: true` and a new revision. `done` and `dropped` are the other two edges out of `claimed` in `codec/contract/transitions.json`; `done` needs an `outcome`. Note that FJ01's `transition` walks every package edge in that table, including `open -> claimed` and `claimed -> open`, which the table labels `claim` and `release`; those two become their own operations in FJ02.
6. Report the revision the adapter received and the bytes of `W/work-packages/260928-1200-parser-fix/package.json` after that write, so the fusion side can `show` them and compare.

Order matters: 02 writes what 03 reads and what 04 is refused against, and a copy on which 02 already ran answers 02 with the stored answer at once. Start from a fresh W for every run.

### 8. `node` on `PATH`, and the digest over the bundle

**Closes:** the sentence in the codec-port decision (`260928-1550_*_which-process-boundary-and-shipped-form-does-the-codec-take.md`, `## Recommendation`) that asks the Prior side to confirm both. Preferred form: a reply.

**8a.** Option 1 of that decision, ruled on 2026-09-28, means a Prior installation needs `node` (20 or later) wherever the Fusion module runs; Prior's core takes no Node requirement, only the module that spawns the codec does. Please confirm this is acceptable. If it is not, the protocol stays as it is and a per-platform single executable (option 2 of the decision) is a packaging change on the fusion side.

**8b.** What the fusion side sees in `Prior: internal/module/process.go` (lines 60 to 74 at `478ce21`): `StartProcess` opens `spec.Executable`, requires an absolute path to a regular file, hashes its bytes and compares `sha256:<hex>` with `spec.ExecutableDigest` before `exec.Command(spec.Executable, spec.Args...)`. Under option 1 the executable is the `node` binary and the bundle is an argument, so the check as written pins `node` and not the bundle. The bundle is a regular file whose first line is `#!/usr/bin/env node`, so it could be the executable itself; but `cmd.Env` holds only what the host lists, so `env` finds no `PATH` unless Prior passes one. Question: does the adapter take a second digest over `spec.Args[0]` beside the one over `node`, does Prior extend `ProcessSpec` with a digest over the bundle, or does it want the bundle to be the executable with a `PATH` entry in the explicit environment? The fusion side assumes none of the three.

### 9. The framing on the pipes from FJ02 on

**Closes:** the open question at the foot of the FJ01 plan (`260928-1550_*_plan-fj01-codec-port-bundle-wrapper-and-first-record-round-trip.md`, `## Open Questions`). Preferred form: a reply, ahead of FJ02.

FJ01 speaks one request, one response, then exit, and needs no framing. What the fusion side can see of Prior's alternative, in `Prior: moduleapi/v1/frame.go` and `protocol.go`: a frame is a 4-byte big-endian length followed by a JSON object with `schema_version`, `message_id`, `kind`, `correlation_id` and `payload`, at most 1 MiB; a connection opens with a `module.handshake` frame and expects `module.ready` back, authenticated with an HMAC over a secret the host passes in `PRIOR_MODULE_CONNECTION_SECRET`; the process is started with `Setpgid` and killed as a group on close. Which does Prior want for a long-running codec process: (a) `moduleapi` framing, one `fusion-record` request per frame payload, the handshake included; or (b) newline-delimited JSON, one request per line and one response per line, with any framing done by Prior's adapter around the process? A third answer, one process per request as in FJ01, is also acceptable to the fusion side; say so if it is enough.

### 10. The nine deferred operations are answered, not broken

**Closes:** nothing to edit; the adapter's reading of `codec/schemas/protocol.schema.json` (its `description`) and `codec/src/cli/ops.ts` lines 91, 112 and 294. Preferred form: none needed.

The protocol schema names fourteen operations. FJ01 implements `inspect`, `list`, `show`, `validate` and `transition`; the other nine (`create`, `claim`, `release`, `set-mode`, `set-dependencies`, `adopt-plan`, `attach-evidence`, `reconcile`, `migration`) are validated against the schema and then answered `{"ok":false,"error":{"class":"operation-unknown","reason":"not-implemented-in-fj01","detail":"..."}}` on stdout with exit 0. A `transition` on an issue, decision or any other non-package record receives the same class and reason. An adapter must read that answer as "lands in a later package", not as a codec defect. For contrast: an `op` outside the fourteen is `operation-unknown/unknown-op`, and a request that is not strict JSON or fails the schema is `schema-invalid`, both also on stdout with exit 0.
