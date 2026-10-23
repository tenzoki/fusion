# Closing review: the four issues the Prior follow-ups left open

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `7bf53fed..45d40491`
**Not-opened:** `codec/dist/fusion-record.js`, `hooks/dist/migrate.js`
**Review domain:** both (code, and the codec's contract and schema texts)
**Work package:** `261022-2229-four-issues-left-by-the-prior-follow-ups`; plan `261022-2234-plan-four-issues-left-by-the-prior-follow-ups.md`
**Cross-references:** `261022-2142-reviewer-closing-review-of-the-prior-bundle-follow-ups.md`, `261022-1712-catalog-render-test-no-longer-reproduces-agents-reviewer-md-since-91395e02.md`, `261022-1806-migrate-run-maps-every-ensurebackup-failure-to-exit-9-including-a-copy-io-error.md`, `261022-2143-three-pinned-codec-texts-still-say-proposed-mapping-or-every-cycle-after-step-13.md`, `261022-2143-migrate-skill-repair-apply-sentence-no-longer-tells-the-reader-to-stop-on-exit-6-or-9.md`, `261023-1023-migrate-run-exit-9-branch-for-an-unverified-backup-has-no-test.md`

The two generated files under Not-opened were verified by rebuild instead of being read, as the dispatch asked: in a `git clone` at `45d40491`, `cd hooks && npm run build` and `cd codec && npm run build` leave `git status --porcelain` empty, and the bundle is `sha256:b404745831dd921bfbae78f52df49604d22f4f78b7c07bce067cc9078e262e2d`, 700 116 bytes. Of `codec/fixtures/prior/REQUESTS.md`, only the dispatched part was read: lines 5793 to 6095, request 75 and Prior's answers to 75(a) and 75(b). Commit `67ce06c5`'s rewrite in the `261022-1604` narrative was opened as well.

## Summary

All four issues stand `closed` with disposition `fixed`. Each fix does what its issue asked and meets its plan step's acceptance. Every suite is green at `45d40491`, and every stop condition a command can decide holds. One Low follow-up is filed: the exit-9 branch that step 2 created in `run` has no test.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 1 filed, 2 observations not filed |

## Verification run

Every run below was made in `git clone`s of this repository under the session scratchpad, at `45d40491` ("after") and `7bf53fed` ("before"), with `node_modules` linked read-only from the working tree.

| Check | Result |
|---|---|
| `cd catalog && npm run render -- claude` (after) | `diff -r` against the committed `agents/` is silent; `git status` is clean |
| `npm run render -- prior <dir>` before and after | `diff -r` differs only in the `Included from fusion: rules/user-facing-output.md (commit …)` line of four profiles (the fusion commit, same `sha256`). No content byte moved. `reviewer.md` differs at line 32, which is that line |
| `cd catalog && npm test` | 73 of 73 |
| `cd catalog && shasum -a 256 -c schemas/FROZEN` | 14 of 14 `OK` |
| `cd hooks && npm test` (`PRIOR_REPO` exported) | 1198 passed, 14 skipped, exit 0. The new case "an I/O error while run copies the backup is exit 3 …" is among them |
| `cd codec && CODEC_REQUIRE_GOLDENS=1 npm test`; `npm run typecheck` | 1857 of 1857; exit 0. The clone stays clean afterwards |
| `PRIOR_REPO=… adapters/prior/stage.sh test` | all packages `ok`, exit 0 |

## Stop conditions of the plan

1. **Four issues closed.** All four `.record.json` files read `state: closed`, `disposition.kind: fixed`, and each narrative carries a `Resolved:` line.
2. **Frozen catalog assets.** `shasum -a 256 -c schemas/FROZEN` passes at `45d40491`.
3. **No growth-bound baseline or head-room constant moved.** `git diff 0db5d0de 45d40491 -- hooks/lib/__tests__/surface-growth-bound.test.ts hooks/lib/__tests__/rules-emission-golden.test.ts hooks/lib/__tests__/helpers/growth-bound.ts hooks/lib/__tests__/fixtures/dispatch-path.baseline hooks/lib/__tests__/fixtures/rules-emission.golden` prints nothing. `surface-growth.golden` moved by `migrate/SKILL.md` 29698 to 29752 and `migrate.test.ts` 580 to 595, and both totals with them. That set is outside the condition, as the plan intended.
4. **`codec/fixtures` append-only.** `git diff --name-only 0db5d0de 45d40491 -- codec/fixtures` names `codec/fixtures/prior/REQUESTS.md` alone. `--numstat` is `303 0`, in one hunk, `@@ -5792,0 +5793,303 @@`. The file at `0db5d0de` is 5 792 lines, so every added line follows the old last section.
5. **No tag.** `git tag --contains 7bf53fed` prints nothing.
6. **No module bundle built, Prior read-only.** No command can decide this from fusion's side. Nothing in the range adds a bundle artefact. `git diff --stat 7bf53fed 45d40491 -- agents bin .claude-plugin README-agents.md README-hooks.md` and `-- codec/src codec/package.json bin/fusion-record` are empty.

## Per issue, against the plan step

| Issue | Step, commit | Read against the acceptance |
|---|---|---|
| `261022-1712-…` catalog render test | 1, `360a8a60` | `06-neutral.md` now ends at "out-of-sync documentation." with no newline. `06a-claude.md` holds the `91395e02` sentence. `06b-neutral.md` starts with item 9's newline. `profile.json` lists them neutral, claude, neutral. The Claude render reproduces `agents/reviewer.md`, and the Prior render's content does not move (table above). Both new names fit `^parts/[a-z0-9-]+\.md$` (`catalog/schemas/profile.schema.json`). |
| `261022-1806-…` `run` exit 9 | 2, `f0d06298` | `run` in `hooks/migrate.ts` maps `BackupUnverified` to `EXIT.backup` and any other error to `EXIT.fault`, which is the split `repair` uses. The new test makes the session directory `0o555`, so `cpSync` fails with EACCES inside `ensureBackup` (`hooks/lib/legacy-repair.ts`). It asserts exit 3, the new message, no `backup.sha256` and an unchanged tree hash. It uses the same chmod technique as the existing `repair` exit-3 case. The `bin/fusion-migrate` exit table is unchanged, and rows 3 and 9 still fit. |
| `261022-2143-…` migrate skill sentence | 3, `03b08c5f` | `skills/migrate/SKILL.md`, the `repair --apply` sentence: "Exit 6 …; exit 9 …; exit 3 is any other fault, named on stderr, and a file may already be written: report whichever it is and stop." All three exits carry the instruction. The exit-3 clause now matches the code comment in `repair` ("may follow a write"). `**Run.**`: "Exit 5, 8, 9 or 3: show the reason and stop." This matches the exits `run` can now produce (Open Question 4, approved). |
| `261022-2143-…` three pinned codec texts | 4 and 5, `aa4277d8`, `1bbd6c53` | `grep -n 'every cycle'` and `grep -n -i 'proposal\|proposed'` over the three files print nothing. `jq -S 'del(.. \| .description?, .notes?)'` at `0db5d0de` and `45d40491` is equal for all three. The new `notes[2]` describes `cyclesOf` correctly: one first cycle per uncovered package id, in sorted order, and not every cycle. The bundle diff is the two inlined strings. |

**Request 75 and Prior's answers**, checked against Prior read-only. These all agree with `REQUESTS.md`:

- The commits: Prior `8b505a8` (parent `5f4d1ef`), `226b6bc` (parent `8b505a8`) and `08c57fb`.
- The two response documents: 197 lines / 11 635 bytes / `327ff1d5…`, and 148 lines / 7 893 bytes / `c7289a52…`.
- The constants at `08c57fb`: `QualifiedCodecDigest` and `codecBundleDigest` are `b4047458…`, `codecPin` and `tests/fusion_codec_test.go` line 69 are `aa4277d8…`. Both `UPSTREAM.json` files are at `aa4277d8…` with 418 and 744 entries, and fj01's `bundle_digest` is `b4047458…`.
- The pin loop against `08c57fb`: `0 of 418`, `0 of 744`. Against `b711b62` it reproduces request 75's verbatim listing: 5 of 418 moved, 2 of 744 moved.
- The `--numstat` of `08c57fb`: 16 files, 1 119 insertions, 58 deletions, which matches the per-row figures.
- `REQUESTS.md` at `aa4277d8`, `1bbd6c53` and `ac665ffd`: `36947f8e…` (5 792 lines), `8b467fbd…` (5 909 lines) and `9ee71332…`. `git diff --numstat aa4277d8 1bbd6c53` is `117 0`.
- The old phrases at `08c57fb` under `tests/testdata` occur only in the two `REQUESTS.md` copies. Prior's FJ00 ruling line 41 still reads "Proposed correspondence".
- The hand-over document at `7ac0845` is `9eca479a…`.
- Every quotation attributed to Prior occurs in the response document it cites, allowing for line wrapping.

The narrative rewrite in `67ce06c5` replaces the citation of `261022-2142-reviewer-closing-review-of-the-prior-bundle-follow-ups.md` that carried its store segment with the storeless basename. That is the citation-sweep form `rules/fusion-workbench-conventions.md` `## Filename Patterns` requires. It respells a citation in a terminal record and moves no state, which `## Terminal states are history` allows.

## Findings

### F1 (Low, code) `run`'s exit-9 branch has no test

Filed: `261023-1023-migrate-run-exit-9-branch-for-an-unverified-backup-has-no-test.md`.

Step 2 made `run` branch on `BackupUnverified` (`hooks/migrate.ts` `run`). The step added a test for the exit-3 branch only. The single exit-9 assertion in `hooks/lib/__tests__/migrate.test.ts` drives `repair --apply`. If the `instanceof` line in `run` were removed or misnamed, every case would stay green, and the skill's `**Run.**` sentence now names exit 9. The fix reuses the stray-file fixture the `repair` exit-9 case already uses.

## Observations, not filed

- **O1 (Low).** `README-agents.md` `## Plugin structure`, the `catalog/` bullet, says a role's parts are `NN-neutral.md`, `NN-claude.md` and `NN-prior.md`. The reviewer now also has `06a-claude.md` and `06b-neutral.md`. The renderer reads the list from `profile.json`, the schema admits the names, and `catalog/README.md` says `parts/*.md`, so nothing reads the shape. Not filed: the sentence describes the convention rather than gating anything. Fold it into the next edit of that bullet.
- **O2.** Step 5 asked that the codec-text issue's `Resolved:` line name `C`. That line was written at step 4 and names request 75, not `aa4277d8`. The record is terminal, and `REQUESTS.md` names `C` everywhere, so nothing is lost.
- **For the dispatcher.** The plan record is still `in_progress` with steps 1 to 5 `done`. It closes with the package.

## Cross-cutting observations

- The last review's cross-cutting note was that prose fixes left neighbouring sentences stale. This range answered it twice. Step 3 extended the fix to the `run` sentence, and step 4's three strings were checked by `grep` across the pinned files and by a `jq` equality, not by rereading one sentence. F1 has the same shape on the test side: the step tested the branch it added and not the branch it split off.

## Recommended sequencing

No release blocker. Prior's acceptance of 75(a) at `8b505a8` meets the tag condition for commits holding `aa4277d8`, and 75(b) at `08c57fb` made `b4047458…` the qualified bundle. F1 can ship with any fusion-only release and moves no pinned byte.
