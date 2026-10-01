# Code review: FJ03b, the qualified initialize revision, and FJ03c (write client, Setup, skills on JSON)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `b1dcd3c6..b22fa611`
**Not-opened:** `README-hooks.md`, `codec/README.md`, `codec/fixtures/prior/REQUESTS.md`, `codec/fixtures/manifest.json`, `codec/fixtures/valid/protocol/initialize.json`, `codec/fixtures/invalid/protocol/initialize-id-not-uuid.json`, `codec/fixtures/invalid/protocol/initialize-manifest-field.json`, `codec/fixtures/invalid/protocol/initialize-without-operation-id.json`, `codec/fixtures/invalid/protocol/initialize-without-workbench.json`, `codec/fixtures/protocol-session-fj02/15-reconcile.role-delta.json`, `codec/fixtures/protocol-session-fj02/README.md`, `codec/fixtures/protocol-session-initialize/`, `codec/dist/fusion-record.js`, `codec/scripts/bench-fixture.mjs`, `codec/src/__tests__/round-trip-cli-fj02.test.ts`, `codec/src/__tests__/round-trip-cli-initialize.test.ts`, `codec/src/__tests__/store.test.ts`, `codec/src/__tests__/kernel.test.ts`, `codec/src/__tests__/protocol.test.ts`, `codec/src/__tests__/fixtures.test.ts`, `codec/src/__tests__/helpers/session.ts`, `hooks/lib/__tests__/declared-citation-paths.test.ts`, `hooks/lib/__tests__/fixtures/surface-growth.golden`, `hooks/lib/__tests__/surface-growth-bound.test.ts`, `hooks/lib/__tests__/reference-resolution-lint.test.ts`, `hooks/lib/__tests__/plan-size.test.ts`, `hooks/lib/__tests__/citation-sweep.test.ts`, `hooks/lib/__tests__/fusion-events.test.ts`, `hooks/lib/__tests__/work-graph.test.ts`, `hooks/lib/__tests__/fusion-claimed-package.test.ts`, `hooks/lib/__tests__/record-client.test.ts`, `hooks/lib/__tests__/hook-route-exclusion.test.ts`, `bin/fusion-plan-size`, `hooks/dist/`
**Review domain:** code
**Work-item:** 260928-1338-json-control-data-and-markdown-artefacts

Notes on the header:

- **Read only in part, still listed above.** `codec/dist/fusion-record.js` was run, not read: the A1 reproduction ran against it and the base blob. `hooks/dist/` was rebuilt from the sources into a scratch directory, `diff -rq` showed no difference, and the compiled files were not read. `install.test.ts` was read in its `shippedBlocks` helper and the FJ03c case's assertions only. The test files listed were read by case name or by diff hunk only.
- **Documentation and fixtures** were outside this dispatch's code focus.
- **Contract.** The three plans named in the dispatch, Prior `fusion-qualified-revision-contract-response.md`, `fusion-initialize-prior-response.md` and `fusion-fj03c-prior-response.md` at `b912302`.
- **Method.** The analysis ran in three parallel passes: codec, readers and monitor, write client and skills. Every finding below was re-checked at its cited lines before filing.

## Summary

The range does what its plans say on the questions the dispatch singled out:

- **No automatic hook reaches the codec.** I traced the static imports from all six compiled `hooks.json` entries. None reaches `record-index`, `record-client`, `record-write`, `record-change`, `codec-read` or `write`, and the only process starts on that route are `git` and the identity helpers.
- **Refused or unanswered is never read as empty.** This holds in `record-index.ts`, `codec-read.ts`, the gate, the three gated readers and Setup's `initialize` table.
- **The `reconcile` index is built inside `reconcile` only, per body run, and is byte-neutral.** It uses the same sorted walk, skips strict-refused files, applies no `blockedOn` filter and uses the kernel's refusal texts word for word.
- **`role` is placed right.** It sits on `/active_documents/<i>/ref` sites only, after `at`, and only as `plan` or `spec`.

One finding is High. The write client lets `transition --to claimed` carry a caller-built claim, which bypasses the ownership binding response 22 requires. Two are Medium:

- a regression in `inspect` on a malformed `.json-state`;
- a Setup-to-migrate loop for a workbench that lost its marker.

## Totals

| Severity | Count | Issues |
|---|---|---|
| Critical | 0 | none |
| High | 1 | claim forged through `transition` |
| Medium | 2 | `inspect` throws on non-directory journal; Setup/migrate loop on marker loss |
| Low | 5 | sweep exit 1; retained-row repair silent; monitor `ts` sort; `isRegularFile` swallow; three stale texts |

## Findings by theme

### 1. Ownership on the write path (High)

**`transition --to claimed --claim '<JSON>'` writes any checkout's claim.**

- **The flaw.** `hooks/lib/record-write.ts` `PAYLOAD_FIELDS` admits `claim` for a package. `fieldsOf` passes it through with `JSON.parse`. `ownership()` reads the identity only for `claim`, or when the source status is already `claimed`.
- **Probe.** Through the real bundle, a transition from `open` landed (exit 0) with `checkout_id: "deadbeef"`. After that, `claim` was refused `conflict/already-claimed` and `transition --to open` exited 5.
- **Contract.** Prior response 22 covers "all entry points … including general transition". Response 38 rules out a Claude-side takeover, so this side cannot repair a forged claim.
- **Fix.** `transition --to claimed` becomes a usage error that names `claim`. `--claim` is admitted only as `null` on leaving `claimed`.
- **Issue:** `261001-0841_*_fusion-write-transition-into-claimed-writes-a-claim-for-any-checkout-past-the-ownership-binding.md`.

### 2. Malformed or missing workbench state is not answered (Medium, Low)

**2a. `inspect` throws on a non-directory `.json-state` or `.json-state/journal` (Medium).**

- **The flaw.** `pendingInitialize` → `pendingIds` in `codec/src/journal.ts` catches only `ENOENT`.
- **Reproduced.** I placed a regular file as `.json-state`. The current bundle printed an `ENOTDIR` stack and exited 1. The `b1dcd3c6` bundle answered `state: legacy`.
- **Impact.** This is the gate request of every reader and of Setup.
- **Same root, second effect.** `initialize` with `journal` as a file throws in `sweep` before the plan's `target-not-empty` branch can answer.
- **History.** It is the same class as the closed `workbench.json`-directory issue.
- **Issue:** `261001-0841_*_inspect-throws-and-exits-1-when-json-state-or-its-journal-is-not-a-directory.md`.

**2b. `isRegularFile` maps every `stat` error to `manifest-not-a-file` (Low).** It uses a bare `catch { return false; }` in `codec/src/store.ts`. `EACCES` and `ELOOP` get the wrong diagnosis. Issue: `261001-0841_*_isregularfile-reads-every-stat-error-on-workbench-json-as-manifest-not-a-file.md`.

**2c. The citation sweep exits 1 on an internal error (Low).**

- **The flaw.** `hooks/citation-sweep.ts` calls `main` unwrapped.
- **Measured.** In an install without `codec/contract/` the sweep exits 1 with a stack. `plan-size` and `citation-check` exit 3 on the same install.
- **History.** It repeats closed issue `260930-1446_*_a-crash-of-the-scope-or-order-entry-exits-1-…`; that fix did not reach the sweep.
- **Issue:** `261001-0841_*_the-citation-sweep-exits-1-on-an-internal-error-which-its-exit-table-reads-as-a-usage-error.md`.

### 3. Setup on an existing workbench (Medium)

**A v12 workbench without `.fusion-setup` loops between Setup and `/fusion:migrate`.**

- **How the loop forms.** The legacy row in `initialize()` keys on the marker alone, so the stores make the codec answer `target-not-empty`. Setup then names `/fusion:migrate`, whose first block halts without a marker and names Setup.
- **Regression.** At `b1dcd3c6` Setup re-wrote a lost marker.
- **Second error.** The `result=legacy` bullet says `/fusion:migrate` converts control data. That conversion is FJ04's, and `/fusion:migrate` only renames directories.
- **Issue:** `261001-0841_*_setup-routes-a-workbench-that-lost-its-marker-to-fusion-migrate-which-halts-without-a-marker.md`.

### 4. Silent paths in the log writer and the monitor (Low)

**4a. The retained-row repair is swallowed, and a torn retained line is dropped.**

- `write()` wraps `repairRetained` in an empty `catch` and ignores its result.
- `repairRetained` truncates the read prefix, including a line `rowsIn` skipped as unparseable.
- Issue: `261001-0841_*_the-write-client-swallows-a-failed-repair-of-retained-rows-and-drops-a-torn-retained-line.md`.

**4b. A `record_change` row with a non-string `ts` makes the dashboard sort raise.**

- **The site.** `bin/monitor` `_record_changes` reads rows from every checkout and from the Prior host, and its sort key does not check the type.
- **Unverified.** This is inference from Python semantics; the monitor was not run with such a row.
- **Issue:** `261001-0841_*_one-record-change-row-with-a-non-string-ts-breaks-the-monitor-dashboard.md`.

### 5. Texts that drifted inside the range (Low)

These are bundled in one issue:

- `hooks/lib/record-client.ts` still describes the quadratic `reconcile` that steps 4 and 7 fixed.
- An `ops.test.ts` name claims blocked-recovery precedence its body does not build.
- The `pending-initialize-unreadable` detail names the intent directory twice; the initialize plan observed this and filed nothing.

Issue: `261001-0841_*_three-texts-in-the-range-state-what-the-code-or-test-no-longer-does.md`.

## Checked against the focus list, no finding

- **codec `initialize`:**
  - **Content check, with the exemption pinned to `store.ts` and `journal.ts` constants.** The exemption covers `lockProtocolOwns` (lock, claims, their temp files) and a self-ignore holding exactly `*\n`. Empty `journal/` and `ops/` and dot entries in them are exempt.
  - **Pre-lock refusal.** It stands only while `.json-state` is still not a directory after the check.
  - **Precedence:**
    - In `mutate`, replay and own-blocked come before the plan.
    - In the plan, a blocked intent comes before the content check.
    - Replay and `recovery-blocked` come before `manifest-present`.
- **`inspect.pending`, Prior's three corrections:**
  - Detection is independent of the root's content and the manifest state.
  - Unreadable data, wrong writes, an invalid staged manifest and an id mismatch each give a refusal, and more than one committed intent gives `ambiguous`.
  - `id` is read from the validated staged manifest, and `blocked` comes from the shared `blockedIntent`.
- **`list.result.state`:** present. `codec-read.ts` `listedRecords` checks it after the gate, and any value other than `json-control` or `legacy` is "no answer".
- **Staging drift:** path-only. A control file is classified through `narrativeOf`, and `pair-split` handles `AM`/`MM` halves, renames and quoted paths. `EVIDENCE_NAME` is pinned to the codec's regex text.
- **Record index and gated readers:**
  - Exit 3 or 4 (6 for the sweep) with empty stdout.
  - Legacy output differs only by `format=`.
  - The sweep refuses a codec-written `<path>` and takes `bound=` from `reconcile` bindings and the neighbouring report, without sending `show`.
- **Monitor:**
  - The `record_change` pass runs outside the checkout filter, and its rows are excluded from `_scoped_events`.
  - `_last_observed` joins on the exact path and requires `to` or `created`.
- **`record-change.ts`:**
  - Idempotence key `(workbench_id, operation_id, path, revision)` over the whole log.
  - A lone LF is written before an append to a torn log.
  - Retained rows keep their original `ts`, and a suffix written meanwhile is kept.
- **`record-write.ts`, `write.ts`, `bin/fusion-write`:**
  - Ownership for `release` and transitions out of `claimed`, apart from finding 1.
  - No retry after `unanswered`, and `expected_revision` comes from `show`.
  - The `PAYLOAD_FIELDS` test derives from both schema files.
  - Exit table 0–7 is the same in `write.ts`, the wrapper header and `README-hooks.md` (rows located by grep, file not read in full).
  - The evidence plugin version is read from `.claude-plugin/plugin.json`.
  - The `initialize` branch runs before the workbench lookup and before `bin/fusion-identity`.
- **Skills:**
  - Setup creates only `./fusion-workbench` before `initialize`, and carries `disable-model-invocation: true`, as does `wp`.
  - The wp, discuss and archive gate (`grep -o '"state":"[a-z-]*"' | head -n 1`) picks the top-level state of a live answer. A refusal falls to the legacy body, which halts at `fusion-paths`.
  - The archive hold's `find` predicates are quoted for names with spaces.
  - Inference: `install.test.ts` `shippedBlocks` recognises only fences that start in column 0, so an indented block inside a list item would be skipped silently. Every block it runs today is found. Not filed.

## Cross-cutting observations

- **Exit 1 for an internal error has now reached three entries.** Scope and order were fixed in the closed `260930-1446` issue. In this range the bundle crashes in `inspect` (2a) and the sweep is not wrapped (2c). A suite-level check that every `bin/` entry maps an uncaught throw to its documented internal-error code would stop the pattern recurring. That is a suggestion, not filed.
- **Bare `catch` blocks that turn an error into a benign value.** `isRegularFile` (2b), `rowsIn`/`repairRetained` (4a) and the repair wrapper in `write()` (4a) each turn an unknown failure into "not a file", "no row" or "nothing to report". The readers this range adds avoid that, which makes these three conspicuous.
- **The ownership check is decided by the subcommand, not by the claim field it writes.** Finding 1 follows from that cut. Deciding on "does this request write a `claim` value" would cover `claim` and `transition` with one rule.

## Recommended sequencing

1. **Before any consumer or agent text calls `bin/fusion-write transition` (FJ03d):** finding 1.
2. **Before Setup on this branch is installed anywhere a marker can be missing, for example a fresh clone of a tracked workbench:** finding 3.
3. **Next digest-moving codec revision:** 2a, 2b, and point 3 of the stale-texts issue. Prior's archive revision (requests 36 and 37) is the natural carrier, since it moves the digest anyway.
4. **Cleanup, any time:** 2c, 4a, 4b, and points 1 and 2 of the stale-texts issue.
