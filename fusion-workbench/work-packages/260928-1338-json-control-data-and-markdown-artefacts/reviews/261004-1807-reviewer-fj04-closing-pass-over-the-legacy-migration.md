# Review: FJ04 closing pass, the legacy-workbench migration (code and data)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `1fda4088..9232314a`
**Not-opened:** `codec/dist/fusion-record.js`, `hooks/dist/lib/events-query.d.ts`, `hooks/dist/lib/events-query.js`, `hooks/dist/lib/legacy-import.d.ts`, `hooks/dist/lib/legacy-import.js`, `hooks/dist/lib/legacy-repair.d.ts`, `hooks/dist/lib/legacy-repair.js`, `hooks/dist/lib/stores.d.ts`, `hooks/dist/lib/stores.js`, `hooks/dist/migrate.d.ts`, `hooks/dist/migrate.js`, `hooks/dist/write.d.ts`, `hooks/dist/write.js`, `hooks/lib/__tests__/fixtures/rules-emission.golden`, `hooks/lib/__tests__/fixtures/surface-growth.golden`, `codec/fixtures/invalid/migration/rollback-binding-no-op-with-op.json`, `codec/fixtures/invalid/migration/rollback-binding-no-op-without-answer-sha256.json`, `codec/fixtures/invalid/migration/rollback-binding-no-ops-empty.json`, `codec/fixtures/invalid/protocol/adopt-plan-actor-legacy-unknown.json`, `codec/fixtures/invalid/protocol/attach-evidence-actor-legacy-unknown.json`, `codec/fixtures/invalid/protocol/create-filed-by-legacy-unknown.json`, `codec/fixtures/invalid/protocol/set-dependencies-actor-legacy-unknown.json`, `codec/fixtures/invalid/protocol/set-mode-actor-legacy-unknown.json`, `codec/fixtures/invalid/protocol/transition-actor-legacy-unknown.json`, `codec/fixtures/invalid/record/created-with-legacy-unknown-filer.json`, `codec/fixtures/valid/migration/part-repairs-reported.json`, `codec/fixtures/valid/migration/rollback-binding-with-no-ops.json`, `codec/fixtures/valid/package/done-legacy-completed-legacy-unknown-filer.json`, `codec/fixtures/valid/record/issue-imported-legacy-unknown-filer.json`, `codec/fixtures/protocol-session-migration/README.md`, `codec/src/__tests__/round-trip-cli-migration.test.ts`
**Review domain:** both
**Work package:** 260928-1338-json-control-data-and-markdown-artefacts.md

**How the unopened files were covered.** Both bundles were rebuilt in a scratch clone of `9232314a` and compared, not read: `codec/scripts/build.mjs` reported `dist/fusion-record.js: unchanged`, and the file hashes `sha256:575aec476cb9ce0fa06dd245e41825afc84dc3944a5b2faf938bc7c8a3ff260c` before and after; `rm -rf hooks/dist && npx tsc` left `git status` empty, so every `hooks/dist/` file, `hooks/dist/order.js` included, is the compile of its source. The fixtures listed were validated by the codec suite's manifest gate, not read one by one. Of the 38 changed files of `protocol-session-migration/`, the 36 exchange files are listed in the hand-over table and 5 hashes were spot-checked equal to it; the session replays green (110 cases). `hooks/dist/order.js`, carried from an earlier review's list, was opened.

## Summary

The codec side of FJ04 holds up. The verified-no-op rule, the `no_ops` binding and its size check, the audit's three-way split and the bound-no-op hold read correctly against Prior `d0fce6c`'s four conditions. The bundle is reproducible, the suites are green apart from the accepted monitor case, and the hand-over's hashes, counts and session table match the tree. Six defects were found. The weightiest are a gap in the reserved-actor rule, which lets a live write produce `legacy-unknown` against five texts, the hand-over to Prior among them, and a host fence fix that forfeits rollback for good on refusals a retry would clear. The other four are a missing `derived` entry, the v11 citation forms dropping out of every check at 13.0.0, a reserved token the repair accepts, and four stale texts.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 4 |
| Low | 2 |

## Findings by theme

### A. The reserved actor `legacy-unknown`

**A1. Medium (data). Nested actor positions admit the token, so a created record carries it.** Issue `261004-1807_*_the-reserved-actor-legacy-unknown-passes-every-nested-actor-position-so-a-live-write-produces-it.md`.

The rule guards `filed_by.actor` on records and packages (`record.schema.json` and `package.schema.json`, the top-level `if/then`) and the top-level `actor` of the eight requests (`protocol.schema.json` `$defs/live_actor`). Two other positions reach the unguarded `common` `$defs/actor`: `deferral.ruled_by` (record `$defs/deferral`, which the `transition` payload references) and `discussion_control.participants[]`, which `create`'s free payload fills.

Verified end to end through the frozen bundle: a `create` of a discussion with `participants: [{"actor":"legacy-unknown","person":null}]` answered `ok` and wrote a `created` record carrying it. Verified by ajv: a `transition` payload with `deferral.ruled_by.actor` `legacy-unknown` and a `created` decision record carrying that ruler both validate.

This contradicts `common.schema.json` ("no live write produces it"), `protocol.schema.json` `live_actor`, `codec/README.md`, the manifest note of `invalid/protocol/create-filed-by-legacy-unknown.json`, `REQUESTS.md` lines 2079 and 2208 ("No other request carries an actor. 'No live write can produce it' stands"), and the plan's stopping clause on `created` records. `claim` and `release` refuse the token by schema but have no fixture and no test.

Fix direction: extend the record-level rule to every actor position on a `created` record, guard the transition payload's `deferral.ruled_by`, add the fixtures, rebuild, and correct the two `REQUESTS.md` lines in an addendum. **The digest moves, so this precedes Prior's re-pin (request 60).**

**A2. Low (code). The repair and the reader accept the token as a recorded actor.** Issue `261004-1807_*_the-repair-and-the-reader-accept-legacy-unknown-as-a-recorded-actor-with-no-derived-entry.md`. `ACTOR` (`hooks/lib/legacy-import.ts`) matches `legacy-unknown`. A repair answer naming it, or a Markdown `**Filed by:** legacy-unknown`, yields the reserved actor with no `derived["/filed_by/actor"]`. That breaks the pairing `REQUESTS.md` line 2082 promises. Read, not run.

### B. Every derived or defaulted value carries a `derived` entry

**B1. Medium (code). An `Answered:` line citing nothing resolvable defaults `answer_ref` with no entry.** Issue `261004-1807_*_an-answered-line-citing-nothing-resolvable-defaults-answer-ref-to-the-original-with-no-derived-entry.md`.

In `composeProposal`'s decision branch, the missing or empty line writes `derived["/control/answer_ref"]`. The `else` branch for an unresolvable citation writes the same default and no entry. Verified by composing the legacy fixture with the shipped `hooks/dist/lib/legacy-import.js`: both of its `_a_` decisions of that shape come out with `derived` absent.

The plan's amendment calls this case the same default, and `## Where this work stops` requires an entry for every one. The other rules check out against the code: `/filed_by/*`, `/control/steps/<i>/state` (the index is taken before the push), `/control/steps`, `/references/<i>` (taken at `out.length`, after `reference-not-a-citation` drops) and `/status`.

### C. Rollback after activation

**C1. Medium (code). The fence fix of `7713c679` ends the fence on every refusal class.** Issue `261004-1807_*_a-refused-first-rollback-chunk-ends-its-fence-on-every-refusal-class-and-forfeits-rollback-for-good.md`.

`rollback()`'s catch tests only `EXIT.refused` and the pre-begin `json-control` state. `send()` maps every codec refusal to `EXIT.refused`. So `conflict/lock-timeout`, `receipt-unverified` (a receipt deleted by hand) and a tree-comparison `after-state-changed` (a hand edit, revertable) all end the fence. Inference from `exemptSet` and `audit`: the stored `begin`/`end` pair is then a later operation, and every future rollback refuses.

The `Resolved:` note of issue 261004-1516 ("the only case newly lost is a hand-reverted change with no codec operation") and `REQUESTS.md` line 2396 understate this. The crash cuts of the fix itself are sound: a crash after the `end` and before `writeState` resends the `end` under its stored id on the next `rollback`, and the stored answer replays.

**What holds (verified).**
- `provenNoOps` checks all four conditions, in order and with no normalisation.
- `audit`'s exempt and no-op classes cannot overlap: an exempt answer is a `maintenance` answer or `verify` under its scheduled id, a no-op is a `migration` `plan` under an unscheduled one.
- `boundNoOpsHold` runs before the audit on later chunks.
- The binding is built, size-checked and validated before any write.
- A refusal stores nothing (`codec/src/journal.ts`), so `stored()` never mistakes a refused chunk for a landed one.
- `secondRun` (`migration.ts:758`) is the one site that writes `no_op`.

### D. The 13.0.0 window closure (step 10a)

**D1. Medium (code). v11-form citations drop out of every check.** Issue `261004-1807_*_since-13-0-0-a-citation-under-a-v11-store-name-is-invisible-to-the-citation-scanner-and-staging-drift.md`.

Emptying `WINDOW_LEGACY_NAMES` emptied `WINDOW_LEGACY_RECORD_STORES` and the v11 entry of `CONTAINER_ROOT_NAMES`. `citation-scan.ts` and `staging-drift.ts` build their segment lists from those two. A citation under `circles/` is one token at `1fda4088` and none at `9232314a`, measured with the shipped scanner. The conventions keep `backlog` in both lists for exactly this reason, and `stores.ts`'s own comment says the list is for "segment lists that must still recognise them".

`/fusion:migrate` rewrites no record, so these citations survive every migration. Fourteen live records in this workbench contain `circles/`. Step 10a's test edits replaced the old form rather than pinning it.

**D2. Low (code). Four texts describe a rename-only pass, a required repair or an open window.** Issue `261004-1807_*_four-migrate-texts-at-13-0-0-describe-a-rename-only-pass-a-required-repair-or-an-open-window.md`. The four are: the migrate skill's `description`, `README.md:28`, `README-agents.md:249`, and Step 2's `WINDOW=open` at 13.0.0.

### E. Schema and fixture consistency, the hand-over's statements

Verified, no finding:
- The manifest has 338 entries, 84 valid and 254 invalid, with no duplicate path, no unlisted file and every path under its `expect` directory.
- The schema diff matches the hand-over's table of four changes. `no_ops` is closed and `minItems: 1`. `$defs/repair` admits both severities, and `migration-proposal.schema.json` references it.
- At `9232314a`, `protocol.schema.json`, `manifest.json`, `bin/fusion-record` and the five session hashes spot-checked equal the hand-over's tables.
- Bases B and C and base A's 01 to 24 are untouched since `0dc4be8b`. The changed and added exchanges are exactly the table's.
- The kernel re-qualification list, the request states (54 to 58 outstanding) and the suite figures match.
- The other `REQUESTS.md` statements disagree with the code only where A1 says. One more figure is stale: line 2154 infers "some 5 000" no-ops under the cap, the hand-over measures about 271 bytes an entry (4 001 refused), and `codec/README.md` says some 3 800. A1's acceptance carries the correction.

## Cross-cutting observations

- **One claim, five copies.** A1's false sentence ("no live write produces it") stands in two schema descriptions, the codec README, a manifest note and `REQUESTS.md`. Each was written from the top-level request fields alone. The check that would have caught it is a walk of every `$ref` to `common` `$defs/actor`. There are four such refs: one in `package.schema.json` and three in `record.schema.json`, two of them nested. Protocol reaches the nested ones through `fusion.record/v1`.
- **The closure removed a list where it meant to remove a read.** D1 and the `WINDOW=open` key in D2 share a cause: the window's data table was emptied, and every consumer that used it for a purpose other than the window lost that purpose too. `ARCHIVED_CONTAINER_ROOTS` and `V11_STORE_NAMES` show the separation was already understood in two places.
- **Cost statements narrower than the mechanism.** C1 and B1 both have a correct mechanism for the measured case and a text that generalises from it.

## Not filed (observations)

- `0dc4be8b` and `d1f02baa` committed schemas without a rebuild, so `committed-bundle.test.ts` is red at those two commits. The hand-over discloses it, and the plan's clause ("green at every commit that moved the bundle") holds by its wording. Bisecting across them will hit it.
- `hooks/dist/order.js` (carried): it is the compile of `hooks/order.ts`, and its header's "no test gates on it" sits beside `fusion-work-order.test.ts`, which drives the real `bin/fusion-work-order`. The wording may mean "no gate blocks on it". Not filed.
- Confidentiality: `REQUESTS.md`, every shipped surface, commit messages in the range and the 261004-1516 analysis carry the other two workbenches only as the second and the third. The step-12 analysis 261003-1004 and the plan's head name them and give their source commits and tree hashes, which the plan's own rule (no file name, no content) permits. Whether that stands in a tracked workbench is the user's call.

## Recommended sequencing

1. **Before Prior re-pins (request 60):** A1. It moves the frozen digest, so the hand-over's digest and request 60 are restated once it lands.
2. **Before 13.0.0 ships:** C1 and D1, both host-only. B1, a host-only change plus a `REQUESTS.md` evidence value, can ride with A1's addendum.
3. **Cleanup:** A2, D2.

## Verification

- `cd codec && CODEC_REQUIRE_GOLDENS=1 npm test` in a scratch clone of `9232314a`: exit 0, 21 files, 1 678 tests, `fixtures: 338 manifest entries`; `npx tsc --noEmit` exit 0.
- `cd hooks && npm test`, run alone: 1 130 of 1 131, the one red the accepted monitor loopback case. A first run, concurrent with the codec suite in the same clone, also failed `surface-growth-bound.test.ts` on the hook-tests golden. That case passed in isolation and in the solo run, so the cause is the concurrent run.
- The bundle rebuild and the `hooks/dist` recompile are as stated in the head.
- The A1 proof used the frozen bundle on a scratch workbench. The D1 comparison used the shipped scanner at both ends of the range, in the clone, which was restored to `9232314a` afterwards.
