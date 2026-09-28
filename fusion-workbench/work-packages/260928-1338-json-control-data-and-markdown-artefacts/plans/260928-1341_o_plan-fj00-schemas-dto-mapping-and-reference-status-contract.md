# Implementation Plan: FJ00 — schemas, Prior DTO mapping and the reference/status contract

**Date:** 2026-09-28
**Status:** Draft
**Spec:** Prior's `concept/fusion-json-workbench-spec.md` (2026-09-28, sections 3, 4, 6 and 9; held in the Prior repository, read-only from here), read together with `rules/fusion-workbench-conventions.md` `## Work packages`, `## State Markers — issues and planning` and `## State Markers — decisions`, which the spec preserves by value.
**Cross-references:** 260928-1338-json-control-data-and-markdown-artefacts.md, 260928-1341_*_does-the-json-codec-live-in-its-own-package-or-under-hooks.md, 260927-2304-fusion-dual-host-design-review.md, 260927-2319_*_does-the-growth-bound-on-shipped-text-yield-to-the-dual-host-prompt-set.md, 260922-1059_*_is-a-record-in-issues-a-candidate-or-an-admitted-work-item.md, 260922-1114_*_does-the-transition-windows-legacy-read-live-at-one-site-per-runtime.md
**Survey commit:** fusion `40a1713f` on `fj-json-workbench` (cut from `v12-prior-nomenclature`), Prior `12d8424` plus the uncommitted spec of 2026-09-28. Bounded surfaces at `40a1713f`, measured with the sums of `surface-growth-bound.test.ts`'s baselines against the tree: `agents/*.md` 3 806 bytes of room, `skills/*/SKILL.md` 25 559 bytes, the hook test suite **6 lines**.
**Decidability:** The load-bearing question is *is a record's control state, and the legality of a change to it, decidable from the JSON pair alone?* Yes by construction: the spec makes JSON the single source of status, claim, mode, dependencies and evidence, and every transition rule is a function of the current JSON and the requested one. The question this package must not try to answer is *which manual edit was a deliberate state change*: that is undecidable from bytes, and the spec's mechanism for it is the revision hash plus compare-and-swap, which turns it into "did the bytes I read still stand when I wrote", a decided question. FJ00 therefore ships schemas, tables and fixtures that a validator answers, and no heuristic over Markdown or over edit intent.

## Directive

Deliver the first of the six packages Prior's specification enumerates in its section 9: machine-checkable schemas for the five contracts (`fusion.workbench/v1`, `fusion.package/v1`, `fusion.record/v1` with its kind union, `fusion.campaign/v1`, `fusion.evidence/v1`), the reference and status contract as data, a typed and lossless mapping of Prior's existing registers onto those contracts, and one fixture set that both hosts validate. Section 9 states the verifiable result: "JSON-Fixtures für alle gesteuerten Arten; Prior-Register einschließlich Fehlerfällen verlustfrei abgebildet". Nothing here reads or writes a real workbench, ships an installer asset, or migrates anything.

## Current State

- **Fusion holds no schema and no JSON reader today.** `hooks/` is a TypeScript package built by `tsc` through `hooks/scripts/build.mjs` into a committed, self-contained `hooks/dist/`; `hooks/package.json` has no runtime dependency and no JSON-schema library. `grep -rlE 'ajv|json-schema' hooks bin` is empty.
- **The hook test suite has 6 lines of head-room** (`TEST_LINE_HEAD_ROOM = 3_030` over a floor of 19 228 lines, tree at 22 252). Any test file added under `hooks/lib/__tests__` turns the suite red. `CLAUDE.md` `## Conventions` says the way out of a red bound is a cut, never a baseline edit; the ruling `260927-2319_*_does-the-growth-bound-on-shipped-text-yield-to-the-dual-host-prompt-set.md` speaks of the dispatch text and names the head-room raise as the first move; it does not name the test-line bound. Where the codec's code and tests live is therefore a decision, filed beside this plan and put to the user at the plan approval.
- **Prior's registers are Go structs without JSON tags.** `modules/fusion/candidates/register.go`, `modules/fusion/packages/packages.go` and `modules/fusion/campaign/campaign.go` serialise through `encoding/json` defaults, so their on-disk keys are the Go field names (`ID`, `StableKey`, `RefreshPolicy`, `CheckedAt`), a nil slice is `null` and an empty one `[]`, `time.Time` is RFC 3339, and each aggregate's `Revision` is the hex SHA-256 of `json.Marshal` of the value with `Revision` cleared (`registerRevision`, `planRevision`, `stateRevision`). Prior's `modules/fusion/schemas/{candidate,work-package,campaign-charter}.json` are snake_case input contracts and are **not** the on-disk shape of those structs; the mapping has to name which of the two it reads.
- **Prior's package state vocabulary differs from fusion's.** `packages.Package.State` takes `formed, admitting, admitted, running, completed, failed, stale`; fusion's `**Status:**` takes `open, claimed, paused, done, dropped` and the spec forbids reducing unknown Prior values to `dropped`. The spec's outcome classes are `completed, bounded, cancelled, failed, dropped, legacy-completed`.
- **Fusion's existing vocabularies the schemas must carry by value:** the five package statuses and their transition edges, `_o_ _p_ _c_ _d_` on issues, plans and discussions, `_o_ _a_ _i_ _s_ _d_` on decisions, `**Depends-on:**` as a terminal-condition edge, at most one active plan, `**Mode:** autonomous` written only on the user's word. All in `rules/fusion-workbench-conventions.md`.
- **Citation forms the reference contract must keep resolving:** storeless basename with wildcarded marker, markerless `YYMMDD-HHMM-<topic>.md`, and `foreign:<project>:<citation>` (`## Filename Patterns`).
- **Prior's dual-host plan FH01** (Prior `docs/design/fusion-dual-host-implementation-plan.md` `### FH01`) is superseded in its storage half by the spec and keeps its acceptance sentence "both adapters can validate the same fixture set; invalid fixtures are refused for named reasons". That sentence is the interoperability target of this package.

## Approach

One new package, `codec/`, at the fusion repository root, is the single home of everything the JSON contract needs that is neither prose nor a hook: schemas, the contract tables, the fixtures, the TypeScript mapping and validation code, and its own test suite. It is a sibling of `hooks/`, built the same way (`tsc`, `vitest`), and for FJ00 it ships nothing: no `dist/`, no installer line, no `bin/` entry. FJ01 decides the process boundary and the shipped form; FJ03 wires consumers; FJ05 ships. Keeping FJ00 inside `codec/` is what lets the package be proven with a full test suite without touching the three bounded surfaces, and it is the shape the spec asks for when it says the codec has one implementation and both hosts bind to it.

```
codec/
  package.json  tsconfig.json  vitest.config.mjs  README.md
  schemas/        common.schema.json  workbench.schema.json  package.schema.json
                  record.schema.json  campaign.schema.json  evidence.schema.json
  contract/       transitions.json      # per kind: states, edges, claim rule, terminal set, outcome classes
                  dependencies.json     # depends_on conditions: terminal, succeeded
                  prior-mapping.json    # Prior state/field -> fusion field, each row confirmed: true|false
  fixtures/       manifest.json         # every fixture: path, schema, expected valid|invalid, error class
                  valid/<schema>/*.json  invalid/<schema>/*.json  bytes/*.bin
                  prior/<register|plan|campaign>/<case>/{prior.json,fusion.json}
  src/            strict-json.ts  validate.ts  transitions.ts  references.ts
                  prior/candidates.ts  prior/packages.ts  prior/campaign.ts
  src/__tests__/  one file per src module, plus fixtures.test.ts over the manifest
```

The fixture manifest is language-neutral on purpose: Prior's Go side reads the same `fixtures/manifest.json` and asserts the same outcomes, which is the FH01 acceptance sentence made executable on both sides. Validation in FJ00 uses `ajv` plus `ajv-formats` as **devDependencies only**; whether the shipped codec carries a schema library or a bounded validator of its own is FJ01's question and is named there, not decided here by default.

## Implementation Steps

1. **Package skeleton**
   - Executor: `code-implementer`
   - Files: `codec/package.json`, `codec/tsconfig.json`, `codec/vitest.config.mjs`, `codec/README.md`, `codec/.gitignore`
   - Changes: private package, `"type": "module"`, `engines.node >= 20.12.0` as `hooks/` has; devDependencies `typescript 5.9.3`, `vitest ^2.1.0`, `@types/node`, `ajv ^8`, `ajv-formats ^3`; scripts `test` (vitest run) and `typecheck` (tsc --noEmit); no `build` and no `dist` in this package yet. README states the package's purpose, the FJ00 boundary (nothing shipped), the decision record that placed it here, and that `npm test` in `codec/` is the package's own gate beside `hooks/`'s. `.gitignore` excludes `node_modules`.
   - Acceptance: `cd codec && npm install && npm test` runs an empty suite green; `hooks/` suite unchanged.
   - Dependencies: the decision record `260928-1341_*_does-the-json-codec-live-in-its-own-package-or-under-hooks.md` answered with option 1. Any other answer stops this plan at step 1 and it is re-planned.

2. **Common definitions**
   - Executor: `data-implementer`
   - Files: `codec/schemas/common.schema.json`
   - Changes: JSON Schema draft 2020-12, `$id` `fusion.common/v1`, `$defs`: `uuid` (RFC 4122 lowercase), `sha256` (`^sha256:[0-9a-f]{64}$`), `prior_revision` (`^prior-json-sha256:[0-9a-f]{64}$`, the typed import value the spec requires for Prior's differently encoded revisions), `timestamp` (RFC 3339 with offset), `record_ref` `{workbench_id, record_id, revision?, display?}`, `artefact_ref` `{path, sha256, kind}` with `path` workbench-relative, no leading `/`, no `..` segment, `foreign_ref` `{project, citation}`, `actor` `{kind: user|agent|host, name, person|null}`, `execution_policy` enum `claude-guided | prior-enforced`, `extensions` (object, any content), and the `legacy_citation` string forms (storeless wildcarded basename, markerless basename, `foreign:` prefix).
   - Acceptance: the file compiles under ajv strict mode; `fixtures/valid/common/*.json` and `fixtures/invalid/common/*.json` (step 7) pass and fail as the manifest says.
   - Dependencies: 1.

3. **Workbench and package schemas**
   - Executor: `data-implementer`
   - Files: `codec/schemas/workbench.schema.json`, `codec/schemas/package.schema.json`
   - Changes: `fusion.workbench/v1` exactly as spec §4.1 (`schema`, `id`, `required_features`, `migration` nullable with `id`, `source_layout`, `receipt`, `extensions`); `fusion.package/v1` exactly as spec §4.2: every key required, `additionalProperties: false`, `domain` `code|data|null`, `status` enum of the five values, `claim` nullable `{checkout_id (8 lowercase hex), person|null, claimed_at|null}`, `mode` `{value: ordinary|autonomous, source: record_ref|{kind: user-word, ref}|{kind: legacy, ...}|null}`, `origin` `{kind: user-request|package|campaign|legacy-unknown, ref}`, `filed_by`, `narrative {path}`, `depends_on` list of `{target: record_ref, condition: terminal|succeeded}`, `active_documents` list of `{ref, role: spec|plan, revision}` with at most one `plan` expressed as a schema-level constraint (`contains`/`maxContains`), `references`, `evidence` list of `evidence_ref` (`record_ref` to a `fusion.evidence/v1` record plus `policy`), `outcome` nullable `{class, reason, evidence}`, `provenance {source: created|imported|legacy-terminal, legacy_fields, backup?}`, `extensions`. Cross-field rules JSON Schema can express are expressed (`if/then`: `status: claimed` requires non-null `claim`; `open`/`paused` require `claim: null`; `outcome` non-null only on `done`/`dropped`; `done` admits `completed|legacy-completed` only). Rules it cannot express are named in the file's `description` and enforced by `transitions.ts` (step 10).
   - Acceptance: fixtures of step 7 for both schemas classify as the manifest says, including the claimed-without-claim and open-with-claim refusals.
   - Dependencies: 2.

4. **Record schema with the kind union**
   - Executor: `data-implementer`
   - Files: `codec/schemas/record.schema.json`
   - Changes: `fusion.record/v1` with the common fields spec §4.3 lists and `control` as a `oneOf` discriminated by `kind`: `issue` (`state: open|in_progress|closed|deferred`, `disposition` `{kind, reason_ref}|null`, optional `candidate` block), `plan` (same four states, `steps: [{id, state: open|in_progress|done}]`, `criteria`, `acceptance` binding `{ref, revision}|null`), `discussion` (four states, `participants`, `outcome_refs`), `decision` (`state: open|answered|implemented|superseded|dropped`, `answer_ref`, `implementation_ref`, `superseded_by`, each nullable). Each control branch forbids the other kinds' fields. The `candidate` block carries, with exact types, every field Prior's `candidates.Candidate`, `Qualification` and `Disposition` hold: `stable_key`, `version` (positive integer), `source {id, revision, watermark, refresh_policy}`, `evidence [{ref, revision}]`, `reproduction [string]`, `severity|confidence|estimated_scope|risk` (non-negative integers), `affected_resources`, `dependencies`, `qualification` nullable `{candidate_version, source_revision, evidence_hash, passed (boolean), reasons, checked_at}`, `selection` nullable `{candidate_version, policy_version, snapshot_hash, outcome, score, reasons}`, `admission` nullable `{work_item_id, current_attempt}`, `merge_into` nullable. The split of Prior's one `Disposition` into `selection` and `admission` is the spec's own ("Auswahlzustand und Issue-Lifecycle sind verschiedene Achsen") and is recorded in `prior-mapping.json` (step 6). Arrays that Prior holds as sets are `uniqueItems: true`.
   - Acceptance: fixtures for all four kinds, valid and invalid, classify as the manifest says; a fixture carrying a `plan` field inside an `issue` control is refused.
   - Dependencies: 2.

5. **Campaign and evidence schemas**
   - Executor: `data-implementer`
   - Files: `codec/schemas/campaign.schema.json`, `codec/schemas/evidence.schema.json`
   - Changes: `fusion.campaign/v1` holds what the spec keeps register-wide: `charter` (Prior's `campaign.Charter` fields, exact types), `state` (`campaign.State` minus `Charter` and `Revision`, with `revision` as `prior_revision` where imported), `register` (`candidates.Register` minus `Candidates`: `stable`, `watermarks`, `intake_closed`, `closed_watermark`, `policy`, `snapshot`), `formation` (`packages.Plan` minus `Revision`: `policy_version`, `accepted_revision`, `remaining_budget`, `candidates`, `packages`, `order`, `deferred`, `admissions`, `active_items`), each block nullable so a campaign that never used a register validates. `fusion.evidence/v1`: `subject {git_tree, git_range|null}`, `brief_revision`, `plan_revision|null`, `role {profile, version}`, `host`, `execution_policy`, `verdict` enum, `uncertainties`, `checks [{id, result: pass|fail|skipped|unknown, detail}]`, `report {artefact_ref}`, `predecessor: record_ref|null`, `accepted_at`.
   - Acceptance: fixtures classify as the manifest says; a campaign fixture with `register: null` and `formation: null` is valid.
   - Dependencies: 2, 4.

6. **Contract tables as data**
   - Executor: `data-implementer`
   - Files: `codec/contract/transitions.json`, `codec/contract/dependencies.json`, `codec/contract/prior-mapping.json`
   - Changes: `transitions.json` names, per kind, the state set, the terminal subset, every allowed edge (`package`: the spec §4.2 matrix; `issue`/`plan`/`discussion`: `open→in_progress→closed`, `open→closed`, `open→deferred`, `in_progress→deferred`, `deferred→open` as `## State Markers — issues and planning` allows them, with `closed` and `deferred` terminal; `decision`: `open→answered→implemented`, `open→implemented`, `open→dropped`, `answered→dropped`, `implemented→superseded` as the one terminal-to-terminal edge, `answered→superseded`), the claim rule per package state, and the outcome classes admitted per terminal state. `dependencies.json` defines `terminal` (target in `{done, dropped}`) and `succeeded` (target `done` with `outcome.class` in `{completed}` and at least one accepted evidence). `prior-mapping.json` is the explicit table the spec requires before any import: one row per Prior field (`candidates.*`, `packages.*`, `campaign.*`, on-disk key as Go emits it) to fusion path, with `revision_encoding`, `null_vs_empty` handling, and `confirmed: false` on every row until the Prior side (Codex) has confirmed it; the `packages.Package.State` rows carry a proposed target and `confirmed: false`: `formed|admitting → no fusion package (campaign formation only)`, `admitted → open`, `running → claimed`, `completed → done + completed`, `failed → dropped + failed`, `stale → paused` with reason `stale`. An unconfirmed row is a stop for FJ04's migration, never a default.
   - Acceptance: `transitions.test.ts` (step 10) proves the tables against the spec's matrix and the conventions' vocabularies; `prior-mapping.json` names every field of the three Go aggregates (a test enumerates the field names from a checked-in copy of the struct definitions in `fixtures/prior/source-structs.txt`, stamped with Prior commit `12d8424`).
   - Dependencies: 3, 4, 5.

7. **Fixtures and manifest**
   - Executor: `data-implementer`
   - Files: `codec/fixtures/manifest.json`, `codec/fixtures/valid/**`, `codec/fixtures/invalid/**`, `codec/fixtures/bytes/**`
   - Changes: valid fixtures: workbench new and imported; package in each of the five statuses, including `claimed` with claim, `paused` without claim, `done` + `completed`, `done` + `legacy-completed` with `provenance.source: legacy-terminal`, `dropped` + `failed`, one with two specs and one plan in `active_documents`, one with `mode.value: autonomous` sourced by a user-word ref; one record per kind, plus an issue with a full candidate block; campaign minimal and campaign with register and formation; one evidence record per policy. Invalid fixtures, each with a named error class in the manifest: unknown key outside `extensions`, `claimed` with `claim: null`, `open` with a claim, `paused` with a claim, `done` with `outcome: null`, `done` with class `failed`, `open` with an outcome, two `plan` entries in `active_documents`, unknown `depends_on.condition`, malformed sha, `..` in an artefact path, absolute path, duplicate ids in `depends_on`, non-uuid `id`, `mode.value: autonomous` with `source: null`, a `decision` control inside an `issue` record, negative severity, `passed: "true"` as string. Byte-level fixtures under `bytes/`: UTF-8 BOM, duplicate key, `NaN`, two top-level objects, a 1 MiB + 1 byte record, CRLF only (valid, but must not be produced by a writer). The manifest lists every fixture with `schema`, `expect: valid|invalid`, `error_class` from the spec's typed set (`schema-invalid` sub-classed by the schema keyword or `strict-json` reason).
   - Acceptance: every file under `fixtures/` except `prior/` appears in the manifest exactly once (a test asserts it); the manifest validates against a small `manifest.schema.json` of its own.
   - Dependencies: 3, 4, 5.

8. **Strict reader and validation harness**
   - Executor: `code-implementer`
   - Files: `codec/src/strict-json.ts`, `codec/src/validate.ts`, `codec/src/__tests__/strict-json.test.ts`, `codec/src/__tests__/fixtures.test.ts`
   - Changes: `strict-json.ts` reads bytes and returns either a parsed value or a typed refusal: BOM, size over 1 MiB, invalid UTF-8, duplicate key at any depth, non-finite number token, more than one top-level value, non-object top level. It is a scanner over the token stream, not a second JSON grammar: it tokenises only far enough to find duplicate keys and multiple values and hands the bytes to `JSON.parse` for the value. `validate.ts` loads the six schemas into one ajv instance (strict, `allErrors`), exposes `validate(schemaId, value)` returning `{ok: true}` or `{ok: false, class: "schema-invalid", errors}`. `fixtures.test.ts` walks the manifest and asserts each outcome and error class.
   - Acceptance: `npm test` in `codec/` green with every manifest entry exercised; the test prints the count of fixtures per schema and per outcome.
   - Dependencies: 1, 7.

9. **Prior DTO mapping, both directions**
   - Executor: `code-implementer`
   - Files: `codec/src/prior/candidates.ts`, `codec/src/prior/packages.ts`, `codec/src/prior/campaign.ts`, `codec/src/prior/types.ts`, `codec/src/__tests__/prior-mapping.test.ts`, `codec/fixtures/prior/**`
   - Changes: TypeScript types mirroring the three Go aggregates in their on-disk shape (Go field names, `null` for nil slices, RFC 3339 times, hex revisions). `importRegister(register) → {campaign.register, issues[].control.candidate[]}`, `importPlan(plan) → campaign.formation`, `importCampaignState(state) → campaign.{charter,state}` and the three inverses `export*`. Every import stamps `provenance.source: imported`, keeps the raw aggregate revision as `prior_revision`, and records the removed or split fields in `provenance.legacy_fields`. Nothing invents: an unknown `Package.State` or an unmapped field is a typed refusal (`unresolved-reference` for a `WorkItemID` naming no record, `schema-invalid` otherwise), never a default. Round-trip fixtures under `fixtures/prior/<aggregate>/<case>/{prior.json, fusion.json}` cover the cases Prior's own tests name: duplicate intake and source change (requalification), frozen selection with stale prevention, admission with stable item and current attempt, merge chain, closed watermark with every exclusion reason, adaptive formation with merge/split/deferral, admission crash before observation, dependency cycle deferred, failed package not blocking an unrelated one. The first version of `prior.json` files is derived by hand from the struct definitions at `12d8424` and each carries `"_provenance": "derived-from-source@12d8424"`; step 12 asks the Prior side to replace them with goldens emitted by the Go code.
   - Acceptance: for every case, `export(import(prior)) ` equals `prior` byte-for-byte after canonical re-serialisation, and `import(prior)` validates against the schemas; the test refuses a fixture whose `_provenance` is still `derived-from-source` when the environment variable `CODEC_REQUIRE_GOLDENS=1` is set, so the gap is visible and not silent.
   - Dependencies: 5, 6, 8.

10. **Transition and dependency rules as code over the tables**
    - Executor: `code-implementer`
    - Files: `codec/src/transitions.ts`, `codec/src/references.ts`, `codec/src/__tests__/transitions.test.ts`, `codec/src/__tests__/references.test.ts`
    - Changes: `transitions.ts` reads `contract/transitions.json` and `dependencies.json` and answers `allowed(kind, from, to, payload)` with a typed reason on refusal (`conflict` for a disallowed edge, `schema-invalid` for a claim or outcome rule broken by the target state, `missing-evidence` for `succeeded` without accepted evidence). `references.ts` parses the three legacy citation string forms and the two structured reference shapes into one discriminated type and renders a structured reference back to its prose citation; it resolves nothing against a file system in FJ00. Tests enumerate every ordered pair of package states with and without a claim and assert the table, every decision and issue edge, both dependency conditions across a target in each terminal state, and every citation form the conventions name.
    - Acceptance: the enumeration is exhaustive by construction (the test builds the pairs from the state list in the table, never from a hand-written list) and green.
    - Dependencies: 6, 8.

11. **The hook suite still passes with `codec/` in the tree**
    - Executor: `code-implementer`
    - Files: whichever lint the new directory trips, expected among `hooks/lib/__tests__/reference-resolution-lint.test.ts` (its pinned citation count and its scan roots), `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`, `hooks/lib/__tests__/committed-dist.test.ts`; possibly `.gitignore` for `codec/node_modules`
    - Changes: run `npm test` in `hooks/` from an isolated `git worktree` of the branch (the suite rewrites `hooks/dist`, which is why the spec asks for the worktree); classify every red as either a lint that must learn the new directory (fix inside that lint's own rules, never by widening a baseline) or a stop. Record the run's exit code, file and test counts in this step's `[DONE]` note.
    - Acceptance: `hooks/` suite green in the worktree, or the one expected red named here with the lint file and the reason, and every other red a stop. The three growth-bound figures in `**Survey commit:**` are re-read after the run and stated; none may have moved, because this plan adds nothing to the bounded surfaces.
    - Dependencies: 1 to 10.

12. **Cross-check note for the Prior side**
    - Executor: `analyst`
    - Files: `codec/fixtures/prior/REQUESTS.md`
    - Changes: one page listing, for the Prior side, what FJ00 needs from Prior and cannot produce here: Go-emitted goldens for every case under `fixtures/prior/`, confirmation or correction of every `confirmed: false` row in `contract/prior-mapping.json`, and a Go test that reads `fixtures/manifest.json` and asserts the same outcomes. Written so that the user can hand it to Codex verbatim.
    - Acceptance: the file exists, names each request with the fixture path and the manifest field it closes, and states the fusion commit it was written against.
    - Dependencies: 6, 7, 9.

## Where this work stops

- `cd codec && npm test` is green at the commit that closes this plan, and its output names the number of fixtures exercised per schema and per outcome.
- Every fixture under `codec/fixtures/` outside `prior/` appears exactly once in `fixtures/manifest.json`, and every manifest outcome was asserted by the harness, not read from the manifest into the expectation.
- Every field of Prior's three aggregates at `12d8424` has a row in `contract/prior-mapping.json`; rows still carrying `confirmed: false` are listed in `codec/fixtures/prior/REQUESTS.md` and nowhere treated as defaults.
- Every `fixtures/prior/**/prior.json` either is a Go-emitted golden or carries `_provenance: derived-from-source@12d8424`; the count of each is stated in the closing report.
- The `hooks/` suite is green in an isolated worktree at the closing commit, and the three growth-bound figures stand where the survey read them.
- No file under `agents/`, `skills/`, `rules/`, `bin/`, `hooks/dist/`, `install.sh` or `templates/` changed in this plan's commits, except the lint files step 11 names.
- The decision `260928-1341_*_does-the-json-codec-live-in-its-own-package-or-under-hooks.md` carries an `Answered:` line naming the user's ruling before step 1's commit.
- No workbench, real or copied, was read or written by any code this plan lands, and no version surface moved.

## Data Structures

The six schemas under `codec/schemas/` and the three tables under `codec/contract/` are the data structures; steps 2 to 6 state their fields. The TypeScript types in `codec/src/prior/types.ts` mirror Prior's Go aggregates and are internal to the mapping.

## API Changes

None shipped. `codec/src/*.ts` exports `strictParse`, `validate`, `allowed`, `parseReference`, `renderReference`, `importRegister`, `importPlan`, `importCampaignState` and their inverses for FJ01 to wrap; FJ00 exposes no process, CLI or hook.

## Testing Strategy

Four suites inside `codec/`: the manifest-driven fixture suite (every fixture, both outcomes), the strict-reader suite over the byte fixtures, the exhaustive transition enumeration, and the Prior round-trip suite with the golden gate `CODEC_REQUIRE_GOLDENS`. The `hooks/` suite is run once in a worktree at step 11 to prove the new directory trips no lint. No live model, no real workbench.

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Hand-derived Prior fixtures mis-state the on-disk shape (a `null` where Go writes `[]`, a field the struct gained after `12d8424`) | Every derived fixture is stamped; step 12 requests goldens; the `CODEC_REQUIRE_GOLDENS` gate keeps the gap visible until FJ04 |
| `packages.Package.State` mapping rows are wrong | Rows carry `confirmed: false`; FJ04 refuses to migrate over an unconfirmed row; the Prior side rules |
| JSON Schema cannot express a cross-field rule and the rule silently lives only in code | Every such rule is named in the schema's `description` and enumerated in `transitions.test.ts`; the fixture set carries an invalid case for each |
| The `hooks/` lints scan `codec/` and go red for reasons unrelated to the contract | Step 11 classifies each red inside the lint's own rules; no baseline moves |
| The codec-home decision is answered otherwise than option 1 | Step 1 is the stop; the plan is re-cut, not patched |

## Open Questions

- [ ] Does the codec live in its own package? (`260928-1341_*_does-the-json-codec-live-in-its-own-package-or-under-hooks.md`, at the plan approval)
- [ ] Are the proposed `Package.State` rows right, and does Prior emit `null` or `[]` for empty slices in the aggregates it persists? (for the Prior side, via step 12)
- [ ] Does the Prior side accept `fixtures/manifest.json` as the shared fixture index for FH01's acceptance sentence?
