## FJ05 (the takeover addendum, request 62, and the state of fusion's FJ05 items)

**Written against:** fusion commit `031645d2` on branch `fj-json-workbench` (2026-10-09 10:27). No file outside `fusion-workbench/` differs between `e4755c58`, the commit fusion's FJ05 plan was measured at, and `031645d2` (`git diff --stat e4755c58 031645d2 -- . ':!fusion-workbench'` prints nothing). At that commit this file is 2 756 lines, `sha256:db69ff06e6d2783342af55e53b2bb29c5db072952ce3bba6c7b834daeda73c50`. Prior was read at `7da6690` (2026-10-07 14:53), the head of its `main`, and `## 38` at `b912302`. **The bundle is the qualified one, unmoved:** `codec/dist/fusion-record.js` is 689 747 bytes, `sha256:c76bbce9cc86634f5e9c227e8496511dc71eb845768704f43e68200ab841e52e`, the same blob since `f9ecae78`. Every figure below that names a code position was read at `031645d2`.

FJ05 is the last row of section 9. On 2026-10-09 the user ruled that one gap closes inside FJ05, before 13.0.0 ships: the administrative takeover of a claim held by a checkout that no longer exists (request 38). Fusion's plan for FJ05 is `261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md`. This section does three things. It states the contract delta that `Prior: docs/design/fusion-fj03c-prior-response.md` `## 38` asks for "before implementation", and puts it to Prior as request 62. It reports what fusion closed of Prior's FJ05 items since `e7695d9c`. And it restates the requests that stand.

### The terms this delta answers

`## 38` at `b912302` accepts the direction with these terms: a dedicated takeover branch of `claim` naming the inspected previous checkout, the new claim, the exact inspected revision and resolvable user provenance; the kernel checks holder, claimed state, CAS and source, with no fallback to an ordinary claim; the existing journal and a stable operation id, with no automatic conflict retry; authorisation stays in the host, and a user-word or record reference "is evidence, not a credential or proof that an old worker has stopped"; Claude's route needs explicit user approval for this particular package and transfer; the history is typed at `provenance.claim_transfers`, appended atomically, absent on unchanged old records, never in `extensions` or `legacy_fields`, with no backfill; the `record_change` row is `op: claim` with `change: {from: "claimed", to: "claimed", previous_checkout_id, checkout_id}`; and the tests name eight cases.

The user relayed Prior's statement of 2026-10-09 in these terms: an existing checkout may take over the orphaned package with the user's explicit consent; the request names the previous owner, the new owner and the checked record revision; the takeover is logged durably, and its history survives a later release; the new owner may then release normally; and it must work with Claude Code alone. No Prior commit carries that statement at `7da6690`. Each part below is checked against both.

The delta changes no status edge. `claimed` stays `claimed`; what changes is the holder. So `codec/contract/transitions.json` is left byte-unchanged (see part 9), and the takeover lives in the protocol schema, the shared provenance definition and the `claim` operation.

### Part 1. The request: a `takeover` member of `claim`

The `claim` branch of `codec/schemas/protocol.schema.json` gains one optional member. Without it, `claim` is byte-for-byte today's operation, its refusal `conflict/already-claimed` on a claimed package included.

```json
{
  "op": "claim",
  "operation_id": "<uuid>",
  "record": { "path": "work-packages/<name>/package.json" },
  "expected_revision": "sha256:<the revision the caller inspected>",
  "actor": { "actor": "orchestrator", "person": "<PERSON>" },
  "claim": { "checkout_id": "<new holder>", "person": "<PERSON>", "claimed_at": "<RFC 3339, now>" },
  "takeover": {
    "previous_claim": { "checkout_id": "<previous holder>", "person": "<as stored>", "claimed_at": "<as stored, or null>" },
    "source": { "kind": "user-word", "ref": { "workbench_id": "<uuid>", "record_id": "<uuid>" } }
  }
}
```

| Field | Rule | Where it is checked |
|---|---|---|
| `takeover` | optional; `additionalProperties: false`; `previous_claim` and `source` both required | protocol schema |
| `takeover.previous_claim` | the complete standing claim as `show` returned it: `checkout_id`, `person`, `claimed_at` (`claimed_at` may be `null`, as an imported claim may carry) | shape: protocol schema; equality with the stored claim: kernel |
| `takeover.source` | a `record_ref`, or `{kind: "user-word", ref: <record_ref or artefact_ref>}`: the two non-null shapes `mode.source` admits today. `null` and the `legacy` shape are not admitted | shape: protocol schema; resolution: kernel |
| `claim` | the new holder; as today, `claimed_at` must be non-null (`schema-invalid/claimed-at-required`) | protocol schema and kernel, unchanged |
| `expected_revision` | already required on every `claim`; on a takeover it is the inspected revision, and the kernel's CAS makes it binding | kernel, unchanged |
| `actor` | `live_actor`, so `legacy-unknown` is refused, as in every request | protocol schema, unchanged |

The previous owner, the new owner and the checked revision of the relayed statement are `takeover.previous_claim.checkout_id`, `claim.checkout_id` and `expected_revision`.

### Part 2. The kernel's checks, their order and every refusal

The takeover branch runs inside the one mutation sequence, after sweep and recovery, the replay lookup and the maintenance fence, as every mutation does (request 39). It then checks in this order. The first that fails refuses, writes nothing, and never falls back to an ordinary claim.

| # | Check | Refusal (`class/reason`) | New or existing |
|---|---|---|---|
| 1 | the request validates against the protocol schema: `takeover` carries both members, `source` has an admitted shape, no unknown member | `schema-invalid/request` | existing |
| 2 | the stored bytes hash to `expected_revision` | `conflict/revision-mismatch` | existing |
| 3 | the record is a package | `schema-invalid/not-a-package` | existing reason |
| 4 | the package is live | `conflict/package-terminal` | existing reason |
| 5 | the package is `claimed` (a takeover of an `open` or `paused` package is refused, not landed as a claim) | `conflict/takeover-not-claimed` | **new** |
| 6 | `takeover.previous_claim` equals the stored `claim` in all three fields | `conflict/takeover-holder-mismatch` | **new** |
| 7 | `claim.checkout_id` differs from `previous_claim.checkout_id` | `schema-invalid/takeover-same-checkout` | **new** |
| 8 | `claim.claimed_at` is non-null | `schema-invalid/claimed-at-required` | existing |
| 9 | `source` resolves in this workbench, by the resolver `set-mode` uses | `unresolved-reference/record-not-found`, `unresolved-reference/foreign-workbench`, `unresolved-reference/ambiguous-reference`, or the artefact resolver's refusal for a path or hash that does not match (`missing-evidence/artefact-changed` among them) | existing reasons |
| 10 | the record after the write validates as `fusion.package/v1` | `schema-invalid/<the validator's reason>` | existing |

Checks 3, 4 and 2 are the read `set-mode` already makes (`livePackage` in `codec/src/cli/ops.ts`). Check 6 compares the canonical serialisation of the two claim objects. A request without `takeover` on a claimed package still answers `conflict/already-claimed`, and nothing in it reads `takeover`.

**Authority is not decided here.** The kernel receives no identity it may authorise on, as `codec/src/cli/ops.ts` states for `claim` and `release` today. Check 9 is the codec's half of "denied authority": an unresolvable source is refused. Whether the caller may take over at all is the host's: Prior's administrative authority, revocation and generation checks, and quiescing a Prior worker; on Claude, the user's explicit word (part 8).

### Part 3. The write: `provenance.claim_transfers`

On success the kernel writes the package's control file once, under the existing journal intent and the request's `operation_id`. In that one write it replaces `claim` with the request's `claim`, keeps `status` `claimed`, and appends one entry to `provenance.claim_transfers`, creating the array when it is absent. No other field moves, and no other file is written.

| Entry field | Value | Schema |
|---|---|---|
| `previous_claim` | the stored claim, as checked in step 6 | `$defs/claim` (new in common, the three-field shape `package.claim` has today) |
| `claim` | the new claim | `$defs/claim`, `claimed_at` non-null |
| `inspected_revision` | `expected_revision` | `$defs/sha256` |
| `operation_id` | the request's | `$defs/uuid` |
| `actor` | the request's | `$defs/actor`, with `legacy-unknown` refused |
| `transferred_at` | `claim.claimed_at`, copied by the kernel; the request carries no separate time | `$defs/timestamp` |
| `source` | the request's `takeover.source`, verbatim | `record_ref` or the `user-word` object |

`transferred_at` is a copy and not a second clock reading, so the two times cannot disagree and a recorded session replays byte-identically.

**Where the schema rule sits.** `$defs/provenance` in `codec/schemas/common.schema.json` is shared by `package.schema.json`, `record.schema.json` and `campaign.schema.json`, and it is `additionalProperties: false`. A package-only extension through `allOf` cannot add a property to a closed object. Fusion therefore proposes:

- `common.schema.json`: `$defs/claim` and `$defs/claim_transfer` are new; `$defs/provenance` gains the optional property `claim_transfers`, `{type: array, minItems: 1, items: claim_transfer}`. An empty array is invalid, so "absent when never transferred" is the only spelling.
- `record.schema.json` and `campaign.schema.json`: their `provenance` property becomes `allOf: [{$ref: provenance}, {not: {required: ["claim_transfers"]}}]`. An issue, plan, decision, discussion or campaign carrying the field is refused.
- `package.schema.json`: unchanged.
- No schema id changes. Every record that validates at `031645d2` validates after it.

**History outlives the claim.** `release` writes `claim: null` and `status: open` and leaves `provenance` as it is. So do a later ordinary claim, `transition` and `set-mode`. A further takeover appends a second entry, whose `previous_claim` equals the first entry's `claim`. Nothing removes or rewrites an entry. Import and migration write no entry, and no historical transfer is backfilled.

### Part 4. The answer and the `record_change` row

The landed answer of a takeover is today's `claim` answer with two members added: `{operation_id, path, from: "claimed", to: "claimed", revision, previous_revision, previous_checkout_id, checkout_id}`. An answer without `takeover` is unchanged, and every recorded `claim` exchange keeps its bytes.

The Claude client composes the row from that answer, as it composes every row from what it observed (`hooks/lib/record-change.ts`): `op: "claim"`, `change: {from: "claimed", to: "claimed", previous_checkout_id, checkout_id}`, with the usual envelope binding `revision` and `operation_id`. The committed record carries the full entry. The rules for a row that cannot be appended or a write that was not observed stay those of request 32.

### Part 5. Replay and the journal

- **Identical replay** under the same `operation_id` answers the stored bytes and writes nothing, so it appends no second entry. This holds after the package has moved on, because the replay lookup precedes every check.
- **Divergent replay**, the same `operation_id` with another request: `conflict/operation-id-reused`.
- **The same takeover under a fresh `operation_id`** after it landed: `conflict/revision-mismatch`, since the inspected revision is gone. If the caller re-reads, check 6 refuses it as `conflict/takeover-holder-mismatch`.
- **No automatic retry.** The Claude client never retries a conflict. After an unknown outcome the one route is a re-send of the identical request under the same `operation_id`, as `bin/fusion-write`'s header states for every operation. For a takeover the client prints the previous claim beside `expected_revision` and `claimed_at`, and the re-send repeats the request it printed. It does not recompose from a fresh `show`, which after a landed takeover would name the new holder and turn the re-send into a divergent replay.

### Part 6. Reconcile and archive retention

`reconcile` gains one reference site per entry, beside the package's existing sites in `referenceSites` (`codec/src/cli/ops.ts`):

- `/provenance/claim_transfers/<i>/source/ref` for a `user-word` source;
- `/provenance/claim_transfers/<i>/source` for a bare `record_ref`.

That is the spelling `/mode/source` and `/mode/source/ref` already use. The test in `codec/src/__tests__/ops.test.ts` that derives every site from the schema positions forces the addition.

**Archive retention needs no new rule.** The archive host's binding pass (`holdsOf` in `hooks/lib/record-archive.ts`) holds every unit that a `reconcile` reference from a record staying behind resolves to. A record a transfer cites therefore stays while the package that cites it stays, live or terminal. If both move in one sweep, the citation moves with them. Prior's host applies the same rule from the same `reconcile` answer, as request 40 made `reconcile` sufficient for archival safety.

**A source that stays resolvable.** The source is checked at the write. Afterwards `reconcile` reports it like any other site, and a source that no longer resolves holds nothing. That matters for the spelling `rules/fusion-workbench-conventions.md` gives `set-mode` today: a `user-word` around an `artefact_ref` to the package's own narrative, at the hash of its bytes. Narratives grow, so that reference decays on the first append. At `031645d2` the one such source in fusion's workbench already reports `unresolved`, `missing-evidence/artefact-changed` (a read-only `reconcile` over the live workbench: 446 references, 195 `resolved`, 250 `unchecked`, 1 `unresolved`, that one). So fusion proposes that Claude's route cite the user's words through a `record_ref`: a decision record filed in the package's container, whose narrative holds the user's words verbatim and which the user's ruling answers. A `record_ref` resolves by id for as long as the record exists, whatever its narrative later gains, and the binding pass holds it. The kernel admits either shape. The choice binds only fusion's route, and it is put to Prior in request 62 because it decides what "resolvable" means after the write.

### Part 7. `required_features`: fusion proposes none

`workbench.json` lists `required_features`, and an unknown value locks every supported mutation of the whole workbench. Fusion proposes no new value, for three reasons.

1. An older reader does not misread a transferred package: it refuses it. Both readers that predate the field, the window build in `~/.fp` at `c76bbce9…` and Prior's two pins at `f9ecae78`, meet `claim_transfers` under a closed `$defs/provenance` and answer `schema-invalid` for that package alone. That is read from the closed definition, not run.
2. A feature value would lock mutation for those readers on every workbench the new client touches, including those where no takeover was ever written.
3. No released client predates the field. 13.0.0 is untagged, and both older readers are replaced before release: requests 63 and 64 re-pin Prior, and fusion's plan reinstalls `~/.fp` from the release candidate before anyone tests it. No takeover is written to fusion's own workbench before that reinstall.

If Prior wants old writers fenced, the narrower alternative is a value such as `claim-transfers-v1` that the kernel adds to the manifest in the write that appends the first entry. Fusion does not propose it, because reason 1 already fails closed.

### Part 8. The Claude route and its approval rule

```
bin/fusion-write claim --record <package control path> --take-over-from <checkout_id> --source <JSON> --actor <actor>
```

- **Flags.** `--take-over-from` and `--source` are given together or not at all; one without the other is a usage error, nothing sent. `--take-over-from` equal to this checkout's own identifier is a usage error. A `--source` that is not JSON, or whose shape the protocol schema refuses, is a usage error.
- **Composition.** The client reads `show`. When the standing `claim.checkout_id` differs from `--take-over-from`, it refuses with exit 5 and sends nothing. Otherwise it composes `takeover.previous_claim` from that `show`, `expected_revision` from its revision, and `claim` from this checkout's identity, as `claimWritten` already requires of every written claim.
- **Nothing else moves.** `release` and `transition` keep the foreign-owner refusal and gain no flag. A `transition` cannot carry `takeover`: its payload is closed, and the client's written-claim check still refuses a foreign claim in any `transition`.
- **The approval rule.** The orchestrator sends a takeover only on the user's explicit word, given in the conversation, that names this package and its previous holder, and only after the user confirms that the former checkout is gone or has stopped writing. That confirmation stands in for quiescing, which Claude cannot do. The user's words go verbatim into the decision record of part 6, and `--source` cites that record. `mode` `autonomous` never answers it. It is one word per package and per transfer, and a second transfer asks again.
- **Claude Code alone.** The route uses the shipped bundle through `bin/fusion-record` and `bin/fusion-write`, with no Prior installation, binary, service or variable.

Once a takeover lands, the new holder is the holder: `release`, `transition` and every holder check treat it as they treat any claim this checkout made.

### Part 9. The tests: Prior's eight cases, one by one

| # | Prior's case | Codec (`codec/src/__tests__/`) | Claude client (`hooks/lib/__tests__/record-write.test.ts`, `codec/src/__tests__/install.test.ts`) |
|---|---|---|---|
| 1 | **denied authority** | a source naming an unknown id (`unresolved-reference/record-not-found`), another workbench (`unresolved-reference/foreign-workbench`), an artefact at a wrong hash (refused by the artefact resolver); each leaves the record's bytes unchanged | `--take-over-from` without `--source` is a usage error and sends nothing. The route rule (no user word, no request) is observed by one headless case of the opt-in suite `hooks/lib/__tests__/agent-dispatch-observation.test.ts`, not by a unit test. Prior's authority check is Prior's test |
| 2 | **wrong holder** | `previous_claim` naming another checkout, or the right checkout with another `person` or `claimed_at`: `conflict/takeover-holder-mismatch` | the standing holder differs from `--take-over-from`: exit 5, nothing sent |
| 3 | **stale revision** | a revision taken before an intervening write: `conflict/revision-mismatch`, nothing written | the refusal is printed, not retried |
| 4 | **missing source** | `takeover` without `source`, and with `source: null`: `schema-invalid/request` | `--take-over-from` without `--source`: usage error (as case 1) |
| 5 | **replay** | identical replay answers the stored bytes with one entry; divergent replay is `conflict/operation-id-reused`; the same takeover under a fresh id after it landed is `conflict/revision-mismatch` | the unknown-outcome re-send repeats the printed request and composes no row |
| 6 | **release after transfer** | the new holder's `release` lands: `status` `open`, `claim` `null`, `claim_transfers` byte-unchanged | in the installed tree, with no Prior present: package claimed by an absent checkout `deadbeef`, taken over with a `user-word` source, then released by the new holder; a `release` by a non-holder still exits 5 |
| 7 | **successive transfers** | A to B to C: two entries in order, the second's `previous_claim` equal to the first's `claim`; a release between them keeps both | in the installed tree, a second package taken over twice |
| 8 | **general-transition bypass** | `transition --to claimed` on a claimed package with a foreign claim: `conflict/transition-refused`, as today; a `transition` payload carrying `takeover`: `schema-invalid/request`; `claim` without `takeover` on a claimed package: `conflict/already-claimed`, as today | `transition` with a foreign `--claim` still exits 5; no `release` or `transition` flag exists to bypass the holder check |

Besides the eight: a takeover on an `open` and on a `paused` package (`conflict/takeover-not-claimed`, not a claim), on a terminal package (`conflict/package-terminal`), on an issue (`schema-invalid/not-a-package`), and to the same checkout (`schema-invalid/takeover-same-checkout`). The shared fixtures gain these:

- valid: a `claim` request with `takeover`; a package with one entry; a package with two; a package with none whose `provenance` is byte-equal to today's;
- invalid: `takeover` without `source`; without `previous_claim`; an empty `claim_transfers`; `claim_transfers` on an issue record; an unknown member in an entry; `legacy-unknown` as an entry's `actor`.

### Part 10. The recorded session, the pinned paths expected to move and the bundle

**A new recorded session,** `codec/fixtures/protocol-session-takeover/`, recorded under `UPDATE_PROTOCOL_SESSION_TAKEOVER=1` with a gate test like the other sessions. Its exchanges run the eight cases and the four extra refusals in the codec column above, end to end on one seeded workbench, then `reconcile` showing the transfer sources and `validate` answering valid. It uses fixed literals and the `initialize` session's digest-placeholder rule.

**Recorded bytes.** No recorded exchange is expected to move. The ordinary `claim` answer is unchanged, `inspect` gains no operation and no feature, and the one recorded `reconcile` answer (`protocol-session-fj02/15-reconcile`) holds no transferred package. If one moves anyway, it gets a reviewed delta file beside its recording, as in the archive revision.

**Pinned paths expected to move** (inferred from the files the delta edits; the implementation step measures them against both pin files and lists every blob that moved):

| Pin | Expected to move | Expected to stay |
|---|---|---|
| `Prior: tests/testdata/fusion-codec/UPSTREAM.json` (390 files at `f9ecae78`) | `schemas/common.schema.json`, `schemas/protocol.schema.json`, `schemas/record.schema.json`, `schemas/campaign.schema.json`, `fixtures/manifest.json`, `fixtures/prior/REQUESTS.md`; new fixtures added | `schemas/package.schema.json`, every other schema, all three files of `contract/` |
| `Prior: tests/testdata/fusion-fj01/UPSTREAM.json` (611 entries at `f9ecae78`) | `codec/dist/fusion-record.js`, `codec/fixtures/prior/REQUESTS.md`; the new session's files added | `bin/fusion-record`, every existing recorded session and delta file |

`codec/contract/transitions.json` stays byte-unchanged on purpose. Its sentence "a second claim on a claimed package is a conflict" stays true of `claim` without `takeover`, and the edge table gains nothing. So `TestFusionAppliedRulingAndGoldens` and the 13 goldens are expected to pass unchanged.

**The bundle digest moves** from `c76bbce9…`. The new digest and byte size are stated in the conformance hand-over (requests 63 and 64), not here.

### 62. Does this shape meet `## 38`?

**Closes:** fusion decision `260930-2305_*_how-is-a-claim-held-by-a-checkout-that-no-longer-exists-released-under-response-22.md`, option 2, which this delta realises once Prior accepts it and the revision is qualified. Preferred form: a Prior response document giving each part 1 to 10 one verdict (accepted, corrected with the correction, or refused) and naming the revision that carries the takeover.

Fusion asks in particular:

1. **Parts 1 to 5.** Do the request, the ten checks, the entry and the replay rules meet `## 38`'s takeover branch? Is `transferred_at` as a copy of `claim.claimed_at` acceptable?
2. **Part 3.** Is the schema placement right: the optional property in the shared `$defs/provenance`, refused by `not: {required}` in the record and campaign schemas, with no schema id changed?
3. **Part 6.** Is a source checked at the write and reported afterwards by `reconcile` what `## 38` means by "resolvable user provenance"? Does Prior accept the binding pass, unchanged, as the archive retention rule?
4. **Part 7.** Does Prior confirm that no `required_features` value is needed, or does it want the conditional value?
5. **Revision.** Fusion proposes that the takeover ship as the next qualified bundle on `fj-json-workbench`, before 13.0.0 is tagged, followed by requests 63 and 64 (re-snapshot and re-pin) in the shape of 59 and 60. Prior's host binding of the takeover (its authority, revocation and generation checks, quiescing a Prior worker, and exposure through `prior fusion call`) stays Prior's work and gates no fusion release.

A refusal of the takeover, or a reshaping beyond the fields named here, stops fusion's FJ05 run before any schema is edited; fusion then re-plans the implementation and does not ship 13.0.0 without the takeover.

### What fusion closed of Prior's FJ05 items since `e7695d9c`

`Prior: docs/design/fusion-fj03d-prior-response.md` `## FJ03d completion and FJ05 scope` names five items for FJ05's release acceptance. Fusion's defect plan `261007-1836-plan-the-four-open-defects-fixed-before-v13-is-tested.md` carried four defects, D1 to D4. Two of the five items are closed on fusion's side; the other three are open, and fusion's FJ05 plan owns each.

| Prior's item | State on fusion's side | Evidence |
|---|---|---|
| The reviewer evidence issue `261005-0626` (D3) | **resolved**, not bounded: the feature works | Decision `261007-1836-which-party-binds-a-closing-reviews-evidence-into-the-finish-so-a-succeeded-edge-can-be-met.md`, option 1, `implemented` at `89471d97`. The finish binds the closing review's evidence into `outcome.evidence`, the one field `succeeded` reads: `bin/fusion-write transition --to done --outcome … --evidence <evidence control path>`, sent by `agents/orchestrator.md` `## Closing a work package` before the closure note. Proof through the shipped CLI: `hooks/lib/__tests__/record-write.test.ts`, `describe("a succeeded edge, through bin/fusion-write and bin/fusion-work-order")`: the successor is blocked while its target is live and ready once the target is finished with `--evidence`. The issue `261005-0626_*_no-shipped-prompt-binds-a-reviewers-evidence-record-to-its-package-so-a-succeeded-edge-cannot-be-met.md` is closed `fixed` |
| The six shipped-consumer test gaps (D4) | **dispositioned**: five by test, one by observation, with the unobserved remainder stated as a limit | `f2e8ea4b`: the tenth case group of `codec/src/__tests__/install.test.ts` lifts the blocks of `/fusion:reconcile`, `/fusion:cadence` `## Process`, `/fusion:check` `## gitignore`, `/fusion:migrate` Step 7's Node gate and `/fusion:help` by heading from the installed tree and runs them verbatim on a JSON workbench. The agent prompts by observation: `261007-2348-agent-dispatch-and-skill-block-observation-at-495aca7d.md`, cases (a) to (e) of the opt-in suite, 9 of 9 passed in one run. What stays unobserved is the bullet "Six agent behaviours on a JSON workbench were never observed" in `docs/upgrading-to-v13.md` `## Documented limits`, added in `ee3a3c19`. The issue `261005-1018_*_six-consumers-the-prior-spec-names-have-no-test-that-runs-their-shipped-text.md` is closed `fixed` |
| Review of `99eef20d`, `95720e4c`, `b65eb4b0`, `e7695d9c` and the review-fix coverage | **open** | Fusion's FJ05 plan reviews `cd1b5522..<head at plan approval>` first, then a closing pass and a pass over its fixes, to `verdict=covered`. At `e4755c58`, `bin/fusion-review-coverage --since cd1b5522 --head HEAD` reports `commits=61 reviews=1 uncovered=61` |
| The release artefact, fresh install, assets, smoke test, repeat migration, and which ref and home the launcher's update path selects | **open** | The FJ05 plan's acceptance track, at one release candidate that the tag and `main` are then set to |
| Release documentation checked against behaviour | **open** | The FJ05 plan checks every bullet of `## Documented limits` against the head. The stale-claim bullet ("There is no takeover of a stale claim") is replaced by the route once request 62 is answered and the takeover lands |

Three further fixes landed in the same period. Each changes shipped behaviour, and none asks Prior anything:

- **D1**, `69ee56f8`: `bin/monitor` binds its wildcard listener without a reverse name lookup. The intermittent monitor case that Prior's response mentions was a 30-second `getfqdn` on the host's resolver, not a permission. The test harness now makes that lookup hang for every monitor case, so the case is deterministic. Issue `260928-1520_*_the-monitor-wildcard-bind-case-times-out-on-a-host-its-own-probe-declares-usable.md`, closed `fixed`. D2 needed no change.
- **`ee3a3c19`**: dropping a package ends its adopted plan, and under `autonomous` the orchestrator may hold a closure whose work is visibly not done, rather than skipping the closing review. Issues `261008-0044-dropping-a-package-leaves-its-adopted-plan-in-progress.md` and `261008-0044-under-autonomous-mode-the-orchestrator-stops-before-the-closing-review-and-never-dispatches-the-reviewer.md`, both closed `fixed`.
- **`f37b6194`**: `/fusion:cadence` sees a change made by `transition` alone on a JSON workbench. Issue `261007-1852-cadences-tree-scan-does-not-see-a-transition-only-change-on-a-json-workbench.md`, closed `fixed`.

None of these moves a byte under `codec/dist`, `codec/schemas` or `codec/contract`. The bundle stays `c76bbce9…` until the takeover lands.

### A correction, by line

The hand-over above closes with "FJ05 is planned against `b65eb4b0` and the digest above". FJ05 is planned in `261009-1021-plan-fj05-release-acceptance-of-13-0-0-with-the-claim-takeover.md`, measured at `e4755c58`. The digest above stays the base until the takeover moves it. That line stands unedited, and this sentence replaces it.

### Requests 59 to 62, as they stand

| Request | State | Where |
|---|---|---|
| 59 | **complete** at Prior `d6abeb8` | `Prior: docs/design/fusion-fj04-correction-prior-response.md` `## 59: shared fixtures` |
| 60 | **complete** at `d6abeb8`; `c76bbce9…` qualified | the same document, `## 60: runtime qualification` |
| 61 | **answered Yes** at Prior `7da6690`: the 38 hits stated apart, each with its reason, count as classified, under the disposition Prior names "no consumer of the old Fusion control grammar, with evidence"; FJ03d is complete | `Prior: docs/design/fusion-fj03d-prior-response.md` |
| 62 | **asked** above: does the takeover delta meet `## 38`, part by part, and which revision carries it | this section |
