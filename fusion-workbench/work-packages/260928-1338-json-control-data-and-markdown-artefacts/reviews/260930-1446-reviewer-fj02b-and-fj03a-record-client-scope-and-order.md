# Code review: FJ02b steps 4 to 6 and FJ03a (record client, format gate, scope and order on JSON)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `d6328638..4bbc9d19`
**Not-opened:** `hooks/dist/guard.d.ts`, `hooks/dist/guard.js`, `hooks/dist/lib/dispatch-bytes.d.ts`, `hooks/dist/lib/dispatch-bytes.js`, `hooks/dist/lib/orchestrator-events.d.ts`, `hooks/dist/lib/orchestrator-events.js`, `hooks/dist/lib/record-client.d.ts`, `hooks/dist/lib/record-client.js`, `hooks/dist/lib/scope.d.ts`, `hooks/dist/lib/scope.js`, `hooks/dist/lib/work-graph.d.ts`, `hooks/dist/lib/work-graph.js`, `hooks/dist/order.d.ts`, `hooks/dist/order.js`, `hooks/dist/scope.d.ts`, `hooks/dist/scope.js`, `hooks/lib/dispatch-bytes.ts`, `hooks/lib/__tests__/dispatch-bytes.test.ts`, `hooks/lib/__tests__/context-manifest.test.ts`, `hooks/lib/__tests__/fusion-paths.test.ts`, `hooks/lib/__tests__/fusion-work-order.test.ts`, `hooks/lib/__tests__/guard-state-shape.test.ts`, `hooks/lib/__tests__/helpers/guard-harness.ts`, `hooks/lib/__tests__/reference-resolution-lint.test.ts`, `hooks/lib/__tests__/surface-growth-bound.test.ts`, `hooks/lib/__tests__/fixtures/surface-growth.golden`, `codec/src/__tests__/round-trip-cli-fj02.test.ts`, `codec/src/__tests__/round-trip-cli-fj02b.test.ts`, `README-hooks.md`, `codec/README.md`, `codec/fixtures/prior/REQUESTS.md`, `codec/fixtures/protocol-session-fj02b/`, `fusion-workbench/orchestrator-events.jsonl`, `260928-1338-json-control-data-and-markdown-artefacts.md`, `260929-1810_*_does-the-2026-09-27-ruling-on-the-growth-bound-reach-the-hook-tests-and-shipped-text-fj03-changes.md`, `260929-1810_*_in-which-order-do-the-parts-of-fj03-and-fj04-land-while-fusions-own-workbench-is-still-in-the-v12-form.md`, `260929-1810_*_what-does-the-claude-side-declare-about-a-read-that-finishes-a-committed-intent.md`, `260929-1810_*_where-do-the-claude-side-consumers-of-the-codec-live-and-how-do-they-reach-it.md`, `260929-1810_*_which-write-creates-the-manifest-of-a-new-json-controlled-workbench.md`, `260929-1919_*_the-dispatch-hook-reaches-the-claimed-package-helper-through-fusion-rules-so-how-does-it-stay-off-the-codec.md`, `260929-2025_*_which-response-size-does-the-claude-side-client-accept-from-the-codec-and-which-environment-does-the-child-get.md`, `260929-1810_*_list-answers-a-legacy-workbench-with-an-empty-list-and-names-no-state.md`, `260929-1810_*_the-shipped-prompts-disagree-on-who-moves-which-marker-and-one-names-a-marker-no-vocabulary-has.md`, `260929-2025_*_the-orchestrator-prompt-still-says-a-task-start-row-carries-the-byte-measurements.md`, `260929-1417_*_plan-fj02b-plan-progress-and-evidence-creation-through-the-kernel.md`
**Review domain:** code
**Work-item:** 260928-1338-json-control-data-and-markdown-artefacts

Notes on the header. `d6328638` is `c4246ef4^`. The compiled `hooks/dist/` files were not read; `hooks/dist/scope.js` and `hooks/dist/order.js` were run against scratch workbenches. Test files listed as not opened were searched by case name only. The last group are documentation, fixtures and workbench records outside the code domain of this dispatch. `codec/README.md` is being edited by another executor and its working tree was not read. The FJ03a plan (`260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md`) was read as the contract.

## Summary

The record client, the gate and the two readers mostly do what the plan says. `refused` and `unanswered` never become an empty answer. The re-read is bounded to one. `recovery-blocked` stops both readers wherever it arrives. The wrappers quote their arguments and pass exit codes through with `exec`. The hook-route test catches any codec reach on the branches it runs, subprocess routes included.

One defect is High: scope resolution has no notion of a package row the codec itself reports as invalid. Verified on a scratch workbench, a claimed package that is schema-invalid or has lost its narrative resolves as in scope with exit 0, while the order reader calls the same record unreadable. A status value outside the five is skipped silently, which can fall back to `shared/`. The order reader has a Medium defect next to it: a dependent reads `ready` although the codec reported its edge unmet.

## Totals

| Severity | Count | Issues |
|---|---|---|
| Critical | 0 | none |
| High | 1 | scope validity |
| Medium | 1 | order readiness |
| Low | 5 | legacy outside git, crash exit 1, timeout margin, route-test pin, duplicated helpers |

## Findings by theme

### 1. When does a package row "read"? The two readers answer differently (High, Medium)

**1a. Scope resolves a package the codec's validation refuses (High).** `codec/src/store.ts` `readPair` strict-parses and reads `schema` and `kind`, and validates nothing further. So `list` and `show` answer a schema-invalid control file without a `problem`. `hooks/lib/scope.ts` `listClaimed` takes a `problem`-free row as readable. `held` checks only for an unnamed narrative, never for a missing one (`narrative.sha256 === null`). And `if (row.status !== "claimed") continue;` skips any status outside the five without comment.

Reproduced with the committed bundle and `node hooks/dist/scope.js claimed`. An extra field in `package.json` gives exit 0 with `PACKAGE=` and `CONTAINER=`. A deleted narrative gives exit 0 with `PACKAGE=` naming a file that does not exist. On the same store `hooks/dist/order.js` prints `unreadable=…: unresolved-reference/narrative-missing`.

The plan's `## Testing Strategy` says step 3 covers "Schema-Mismatch" and "fehlende Gegenstücke" as the unreadable package. The one test for that case uses conflict markers, which strict parsing already catches.
Issue: `260930-1446_*_scope-resolves-a-package-the-codecs-own-validation-refuses-while-the-order-reader-names-it-unreadable.md`.

**1b. Order reports a dependent `ready` over an edge the codec said is unmet (Medium).** `hooks/lib/work-graph.ts` `readWorkGraph` moves a live package with any `reconcile` finding to `unreadable`. Every `dependency-unmet` edge naming that package then becomes `unresolved=… target-unreadable`, and the dependent keeps `ready`. Reproduced: `b` depends on open package `a` under `terminal`, `a`'s narrative is deleted, and the report prints `ready=1` with `b` `ready`. The `note=` line then says these are entries "the codec could not resolve to a package", which is false here. This departs from the plan's `## Data Structures` table: an unmet edge to a live package's row is a resolved edge.
Issue: `260930-1446_*_the-order-reader-reports-a-dependent-ready-when-the-codec-reported-its-edge-to-a-live-package-unmet.md`.

The two findings share a root, and the fix should be one criterion: scope is too lenient, and order drops a known edge because it is strict about the target.

### 2. The format gate and Prior's ruling on request 28 (Low)

Prior's ruling at `ad21e58` says a consumer that derives scope, work order or dispatch calls `inspect` at its start. `claimedBy`, `isPackage` and `readWorkGraph` each gate first, and `bin/fusion-paths <item-dir>` reaches the gate through `item`. The one scope path without a gate is `bin/fusion-claimed-package`'s not-a-git-work-tree branch (`fusion-identity` exit 4 → `exit 0`). It answers before the node entry runs, so a legacy workbench outside git resolves into `shared/`. The header's reasoning covers the claim, not the format.
Issue: `260930-1446_*_scope-resolution-answers-a-legacy-workbench-outside-git-without-the-format-gate.md`.

### 3. Exit codes (Low)

The documented tables are implemented as written. `hooks/scope.ts` exits 0, 1 or 3. `hooks/order.ts` exits 3 only for `bundle-missing` and 4 for every other failed read, the gate and `lock-timeout` included. Exit 4 is reachable from `list` and `reconcile` refusals, from a `recovery-blocked` finding at any of the three places, and from `unanswered` on any call after the gate.

The gap is the undocumented code. An uncaught exception or a failed module import exits 1, and 1 has a meaning on every route: "no such package" for `bin/fusion-paths <item-dir>`, "stop" for `bin/fusion-claimed-package`, "usage error" for `bin/fusion-work-order`. `orderOf` throws by design when the reader violates its input contract.
Issue: `260930-1446_*_a-crash-of-the-scope-or-order-entry-exits-1-which-the-wrappers-read-as-a-callers-mistake.md`.

### 4. The client (Low)

Verified as the plan asks:
- `ask` classifies `ok: false` as `refused` only with a string `class` and `reason` and no `result`.
- A non-zero child exit is `unanswered/exit`. This matches `codec/src/cli/main.ts`, which exits 0 for every written response.
- Framing is exactly one line and a newline.
- `env: {}`, `cwd` is the bundle's directory, and the request carries the absolute workbench, so `FUSION_WORKBENCH` cannot leak in.
- `ETIMEDOUT` is `timeout`, there is no retry (tested: the stand-in starts once), and the `gate` rejects any state it does not know.

The weak spot is the 70 s timeout. Its relation to the codec's 65 s wait is stated in a comment and pinned nowhere. `codec/src/kernel.ts` `read` checks its deadline only after running the body, so the typed `lock-timeout` is not guaranteed to arrive first once unscoped `list` and `reconcile` get slow at the scale request 31 measures. `maxBuffer` overflow has no test and surfaces as cause `exit`.
Issue: `260930-1446_*_the-record-clients-timeout-margin-over-the-codecs-lock-wait-is-neither-pinned-nor-sufficient-for-post-wait-work.md`.

### 5. Does the hook-route test prove what its name claims? (Low)

Mostly yes. It runs every command in `hooks/hooks.json` through `/bin/sh` against a scratch plugin whose rule, claimed-package, paths, work-order and record helpers are logging stubs, with a logging stub at `<plugin>/codec/dist/fusion-record.js`. `defaultBundle()` resolves to that stub, so any path from an automatic hook into the record client is logged whether it goes by import or by subprocess. The control case shows the log records a real call. The test asserts the row's identity fields and the absence of byte fields, as amendment 2 asks.

Two limits remain. The static half pins which modules import `node:child_process`, not which programs they start. The dynamic half runs one payload shape per tool: SessionStart `startup` only, writes to a non-workbench path only. A new spawn of a codec helper on an unexercised branch of one of the three pinned modules would pass.
Issue: `260930-1446_*_the-hook-route-exclusion-test-pins-which-modules-spawn-but-not-what-they-spawn.md`.

### 6. Duplication (Low)

`isObject`, `refusalOf`, `problemOf`, `refusedByGate` and `isPackageRow` are defined in both `hooks/lib/scope.ts` and `hooks/lib/work-graph.ts`, and `isObject` a third time in `hooks/lib/record-client.ts`. Theme 1 is what two copies of one criterion look like once they drift.
Issue: `260930-1446_*_scope-and-work-graph-each-carry-their-own-copy-of-the-reader-helpers.md`.

### 7. FJ02b commits (`c4246ef4`, `6e01977f`, `7b8dde51`)

No defect found. `codec/src/__tests__/kernel.test.ts` `stored answers are never pruned` replays the recorded FJ02 `01-create`, `02-claim` and `03-release` through the committed bundle. It asserts all three stored answers remain after `03` (`opsEntries`), that the retained answer makes a late `02` a no-op, that deleting only `02`'s answer lets it land again (the ABA the retention prevents), and that the CAS still refuses a fresh id against `02`'s revision. The case names match what they assert. `codec/src/__tests__/helpers/session.ts` holds the recorders' shared machinery and no assertion beyond `result`'s `ok` check, as its header says. `fixtures.test.ts` excludes the new session directory from indexing. `7b8dde51` changes no code.

## Cross-cutting observations

- **One criterion, two implementations.** The scope criterion was centralised in `bin/fusion-claimed-package` to prevent this, and the codec readers repeat it one layer down. Scope and order now disagree on the same record (theme 1). Duplicated helpers (theme 6) are how that disagreement will keep coming back.
- **Where the gate sits** is right in the three TypeScript entry points and wrong in the one shell branch that answers before them (theme 2).
- **Stated but unpinned invariants.** The timeout relation (theme 4) and what the three spawning modules start (theme 5) are each asserted in a comment and held by no test.

## Test assertions against their names

- `fusion-claimed-package.test.ts`: the names match the assertions. "exit 3, naming the record, when a package does not read" covers the strict-parse case only (theme 1a). The injected-`ask` cases assert call counts (`list: 2, show: 2`) and so show the bound on the re-read.
- `work-graph.test.ts` "places each edge entry by the table": it pins `target-unreadable` for an edge to a live package with a finding. That is the behaviour theme 1b calls a defect, and the plan's own table does not have that row.
- `record-client.test.ts`: the names match. "leaves no .json-state behind" backs the header's statement for a settled store.
- `install.test.ts`: both new cases assert what they name. Step 5 records that `unsupported` is not refused from an installed copy. The plan's third stopping clause can be read as asking for that, and the plan was closed with it untested there (covered at the work tree only).

## Recommended sequencing

1. Before FJ03b builds on the readers: theme 1 (both issues together, one validity criterion, with theme 6 folded in).
2. Before any build of this branch is installed: theme 3 (exit-code collision on the Setup path) and theme 2.
3. Before FJ04's real migrations, beside request 31: theme 4.
4. Cleanup: theme 5.
