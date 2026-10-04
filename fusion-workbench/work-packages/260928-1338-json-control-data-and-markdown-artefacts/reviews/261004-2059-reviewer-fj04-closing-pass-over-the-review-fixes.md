# Review: FJ04 closing pass over the fixes for review 261004-1807 and the hand-over correction

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `9232314a..728545eb`
**Not-opened:** `fusion-workbench/orchestrator-events.jsonl`
**Review domain:** code
**Work package:** 260928-1338-json-control-data-and-markdown-artefacts.md
**Cross-references:** 261004-1807-reviewer-fj04-closing-pass-over-the-legacy-migration.md

**How the files were covered.** `fusion-workbench/orchestrator-events.jsonl` was only searched with grep, never read through. Every other file the range changes was read, as a diff or whole. Generated files were rebuilt in a scratch clone of `728545eb`. `codec/scripts/build.mjs` reported `dist/fusion-record.js: unchanged`, and the bundle hashed 689 747 bytes, `sha256:c76bbce9cc86634f5e9c227e8496511dc71eb845768704f43e68200ab841e52e`, before and after. After `rm -rf hooks/dist && npx tsc`, `git status` was empty, so every `hooks/dist/` file is the compile of its source.

**The list the previous review carried unopened.** All of it is covered now:
- `codec/dist/fusion-record.js` and the eleven `hooks/dist/` files (`events-query`, `legacy-import`, `legacy-repair`, `stores`, `migrate`, `write`, each `.d.ts` and `.js`): rebuilt byte-equal, as above.
- `rules-emission.golden` and `surface-growth.golden`: opened. The range's `surface-growth.golden` diff matches the line and byte deltas the commits state. The two golden tests are green.
- The 14 codec fixtures named there: opened. A single-cause control was run over each `legacy-unknown` fixture with ajv over `codec/schemas/`. Every invalid one turns valid when the token is swapped for a live actor. Every valid one turns invalid when `provenance.source` is set to `created`.
- `protocol-session-migration/README.md` and `round-trip-cli-migration.test.ts`: opened. The session test is green: 110 cases.

## Summary

All six fixes close their findings. Each regression test fails against the pre-fix code and passes at `728545eb`. The bundle rebuilds to `c76bbce9`. Every figure, hash, line number and Prior quote checked in the `REQUESTS.md` addendum matches the tree, and so do the two Prior pins, read without checking anything out. One defect remains. It shares D1's root cause and D1's fix did not reach it: the citation sweep that `/fusion:migrate` Step 6 runs can no longer rewrite a `circles/` container-root citation.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 0 |

## Findings by theme

### D. The v11 store names after 13.0.0

**D3. Medium (code). The sweep's container-root list was left on the emptied window table.** Issue `261004-2059_*_since-13-0-0-the-citation-sweep-cannot-rewrite-a-v11-container-root-citation-so-migrate-step-6-leaves-every-one.md`.

`hooks/citation-sweep.ts:688` (`candidateFor`, the `package-record`/`package-dir` branch):

```ts
const m = new RegExp(`(?:${CONTAINER_ROOT_ALT})\\/(${DIR})(?:\\/(${DIR}))?`).exec(t);
```

`CONTAINER_ROOT_ALT` (imported at `:451`) is `CONTAINER_ROOT_NAMES.join("|")`, which since step 10a is `work-packages` alone. `8b7efa30` gave the scanner and staging-drift `CITED_CONTAINER_ROOTS` and left this site alone.

Verified on a probe workbench that cites `circles/<dir>/<dir>.md`, `work-packages/<dir>/<dir>.md`, `shared/planning/<record>` and `circles/<dir>`:

| Tool | `1fda4088` | `728545eb` |
|---|---|---|
| `fusion-citation-check` | (not run) | `store-prefixed=4`, every row `rewritable` |
| `fusion-citation-sweep --dry-run` | `rewrites=4`, package-record 2, package-dir 1 | `rewrites=2`, package-record 1, package-dir 0, `residual=0` |

The sweep leaves both `circles/` tokens unchanged and says nothing about them. `skills/migrate/SKILL.md` `## Step 6 — Sweep the citations` runs exactly this sweep after renaming `circles/`. So at 13.0.0 the migration repairs the `shared/planning/` and `shared/consult/` citations and leaves every container-root citation for the check to report. `citation-sweep.test.ts` lost its `circles/` cases at step 10a, and D1 restored no case there.

Fix direction: `candidateFor` reads `CITED_CONTAINER_ROOTS`, and a sweep test case for each v11 container-root form is shown red at `728545eb`. Scope: the hooks side only; no codec byte moves.

## What holds (verified)

**A1, the reserved actor in every position (`f9ecae78`).**
- `$ref`s to `common` `$defs/actor`: `record.schema.json:15` (filed_by), `:363` (participants), `:454` (deferral.ruled_by), `package.schema.json:110`, and `protocol.schema.json:441` inside `live_actor`. Every record position has a top-level `if/then`. Every request position is a `live_actor`, `create`'s payload guard, or `live_deferral`. No other actor-shaped field exists in `evidence`, `campaign`, `workbench` or the migration schemas. `transition`'s payload has `additionalProperties: false` and no `participants`.
- Counterexamples tried: a non-array `participants`, and a token with a trailing space. Both pass the protocol schema, and both are left to the record schema's shape check on the composed record, as `create`'s payload description states. Neither is the reserved token.
- Regression: with `9232314a`'s `codec/schemas` and `codec/dist` restored in the clone, the new `ops.test.ts` block has 3 red (create participants, create deferral, transition deferral) and 2 green (claim/release, the import read). The commit message predicts exactly this.

**C1, the rollback fence (`4b24d595`).**
- `workSincePlan` compared against the codec. `laterOperations` (`codec/src/migration.ts:853`) drops baseline entries and scheduled requests. `exemptSet` (`:1936`) keeps three answers: verify, the `end` of chunk 1's fence, and the standing `begin`. `provenNoOps` (`:1976`) adds the no-ops. The host's own set covers the baseline by id, every scheduled id, `end_id` and the rollback pair. Its no-op test is looser than the codec's four conditions. When the two disagree, the host reports "no work" where the codec refuses, so the fence stays and `--end-fence` is offered. The opposite error would forfeit a rollback for good, and no case of it was found.
- `endLeftFence` refuses unless the standing fence is this rollback's `begin` and the first rollback chunk is not stored.
- Regression: with `9232314a`'s `hooks/migrate.ts`, `hooks/dist/migrate.js` and `bin/fusion-migrate` restored, the new `migrate.test.ts` case is red.

**B1 and A2 (`833575f8`, `e437d6a8`, `788f4acf`).** With `9232314a`'s `legacy-import` and `legacy-repair` (source and dist) restored, 4 of 36 cases are red: the two new `ROWS`, the changed recorded-value case, and the new repair refusal.

**D1 (`8b7efa30`).** With `9232314a`'s `stores`, `citation-scan` and `staging-drift` (source and dist) restored, 5 of 61 cases are red: the four v11 spellings and the staging case. The other consumers of the window lists were checked. `citation-corpus.ts` and `review-coverage.ts` read on-disk paths, which `/fusion:migrate` renames. `record-write.ts` names write targets. None needs the v11 root. `citation-sweep.ts` is the exception, D3 above.

**D2 (`ad563935`, `e0db2545`).** No `WINDOW=` key is left in any shipped file. `READS_V12` replaces it in the skill and in both tests. The skill's byte count is unchanged by `e0db2545`: +2, −1 and −1.

**The `REQUESTS.md` addendum (`728545eb`, from line 2462).**
- At `f9ecae78` the file is 2 460 lines, `sha256:3c7066e4…fdb7`. Every line the addendum cites says what it quotes, among them 2064, 2078, 2079, 2082, 2096, 2154, 2193, 2207, 2208, 2212, 2225, 2250, 2252, 2253, 2257, 2264, 2343, 2347, 2365, 2372, 2374, 2389, 2396, 2407, 2418, 2421 and 2460.
- The nine fixture hashes, the four schema hashes, `manifest.json`, `bin/fusion-record` and the two session READMEs at `f9ecae78` equal the tables. The bundle diff is 50 lines in and 8 out. Condition 4 is still at `migration.ts:758`. `git diff --stat 9232314a e0db2545 -- codec/src` names the two test files. `plugin.json` reads 13.0.0.
- Manifest: 347 entries, 86 valid and 261 invalid (260 `schema-invalid`, 1 `unsupported-format`). The per-schema table matches. There are 110 fixtures new since `e1bafd2f`, split as stated. The arithmetic of line 2550 holds: 271 bytes per entry, a 1 170-byte base, 3 865 under the cap.
- Prior pins, read with `git -C <Prior> show` and nothing checked out. On `main` at `7758bfa`: `fusion-fj01` has 323 entries and five differ at both `f9ecae78` and `e0db2545`; `fusion-codec` has 381 entries and five differ. On the candidate branch, 611 entries and two differ. Each set is the one the addendum names, and the 381 + 9 = 390 projection follows.
- Prior's quotes at `7758bfa` are verbatim, with one exception. "Also record the derivation when a present answer line has no resolvable target." ends at a semicolon in Prior's text, and its second clause is dropped. Not filed.

**Suites, in the scratch clone at `728545eb`.**
- `cd codec && CODEC_REQUIRE_GOLDENS=1 npm test`: exit 0. 21 files and 1 694 tests, `fixtures: 347 manifest entries`, 13 Go-emitted goldens, 163 of 163 prior_keys. `npx tsc --noEmit`: exit 0.
- `cd hooks && npm test`: 1 138 of 1 139 pass. The one red is the accepted monitor loopback case.
- A first hooks run also failed `committed-dist.test.ts` 3 times. The cause was the clone: it lacked the git-ignored `hooks/package-lock.json`. With that file copied in, the test is 4 of 4 green.
- The clone was restored with path-scoped `git checkout 728545eb -- <paths>` after each regression run, and `git status` was empty at the end.

## Not filed (observations)

- `composeProposal`'s `actor` closure (`hooks/lib/legacy-import.ts:671`) returns `input.actors[narrative]` without the `LEGACY_UNKNOWN` check that `filedBy` and `checkAnswers` now make. A repair log is the only source of `input.actors` (`actorsFromLog`), and since `e437d6a8` `applyRepair` refuses the token before it writes. Only a log written by the pre-fix code, or edited by hand, reaches this path, and 13.0.0 is untagged. Defence in depth, not a reachable defect.
- `skills/migrate/SKILL.md:139` still says "inside the window one usually exists". That is still true of a workbench used during 12.x.

## Cross-cutting observations

- **One cause, a third consumer.** The previous review traced D1 to "the closure removed a list where it meant to remove a read". The fix moved two of the three readers that need the v11 root. The third is the sweep, the remedy the other two point to. A grep for `CONTAINER_ROOT_ALT` and `CONTAINER_ROOT_NAMES` over `hooks/` finds all three.
- **The regression tests are real.** All five fixes with behaviour were shown red against the pre-fix code in this pass, not only in their commit messages.

## Recommended sequencing

1. **Before 13.0.0 ships:** D3. It is host-only and moves no codec byte, so Prior's re-pin to `c76bbce9` (request 60) does not wait on it.
2. Nothing else is outstanding from this range.
