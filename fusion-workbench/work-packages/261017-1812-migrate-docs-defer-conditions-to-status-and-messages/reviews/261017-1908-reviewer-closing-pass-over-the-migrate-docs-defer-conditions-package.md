# Closing review: migrate undo docs defer conditions to `status` and the messages (fusion 13.1.12)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `c239cdd6..d825345e`
**Not-opened:** none
**Review domain:** code
**Work-item:** `261017-1812-migrate-docs-defer-conditions-to-status-and-messages`
**Verdict:** accept. Three Low findings, each filed as an issue. None blocks the tag.

## Summary

The release changes comment lines of `bin/fusion-migrate`, two rows of `README-hooks.md`, the Undo paragraph of `docs/upgrading-to-v13.md`, and the release surfaces. No code line changed, and the usage block is byte-identical. I read every kept sentence against `hooks/migrate.ts`, the wrapper and the codec. All hold on every path except one: the header's `rollback --end-fence` removal claim has no "itself", which the README row and the Undo paragraph do carry. The text is clearly better than 13.1.11, and nothing a reader needs in order to act safely was lost. One older header line (`status`) still states the converse that the new wording correctly avoids. One code defect turned up at the I11 site. It falsifies no doc sentence.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 3 |

## What was checked, and how

- Diff of `c239cdd6..d825345e` in a scratch clone, all eight files named in the dispatch, and the uncommitted marketplace edit (read only).
- Every kept sentence against its plan row (I1 to I12, R, S): `hooks/migrate.ts` `run`, `preconditions`, `rollback`, `refusedFirstChunk`, `workSincePlan`, `endRollbackFence`, `endLeftFence`, `ownFence`, `idleFence`, `landedFence`, `landedWay`, `intentStands`, `setAside`, `stale`, `current`, `status`, `main` and its `catch`; the wrapper's exits; `codec/README.md` (`maintenance` table, the kernel order, `rollback {chunk: k}`); `codec/src/store.ts` (`hold`, `releaseLock`, `removeFence`).
- `git diff -U0` of `bin/fusion-migrate`: every changed line begins with `#`. `bash -n` passes. `sed -n 3,15p` is the same at both ends.
- In the scratch clone: `vitest run` over `migrate.test.ts`, `reference-resolution-lint.test.ts`, `surface-growth-bound.test.ts` and `derivable-enumerations-lint.test.ts` gave 4 files and 91 tests passed. The full suite was not run here. The release commit reports it red only for the known pre-existing workbench-citation-lint findings.
- `skills/migrate/SKILL.md` `ROUTE=stale` (line 191), for the Undo paragraph's "then offers to set that record aside".

## Findings

### Kept claims: one qualifier missing (Low)

**F1. The header's `rollback --end-fence` entry says "removes no other file of the workbench" with no "itself".** `261017-1908-migrate-header-end-fence-entry-says-it-removes-no-other-workbench-file-without-the-itself-its-json-branch-needs.md`.
`bin/fusion-migrate` header, the `rollback --end-fence` entry: "It ends no other fence and removes no other file of the workbench, and it removes that one only where no rollback chunk of the record is stored." The sentence covers both branches. On the JSON branch the codec does the work. Its `hold` unlinks stale takeover claims and old `.*.tmp` files, and `releaseLock` unlinks `write.lock` (`codec/src/store.ts`). The README `migrate.ts` row ("removes itself") and the Undo paragraph ("removes no file itself") carry the qualifier, and plan row I1 says it is part of the claim. Fix: add "itself". This is a comment line only.

The rest of the kept sentences, verified:
- **R.** Every non-zero exit prints a reason. `main`'s `catch` prints `say(e.message)` or the fault text. The wrapper runs `printf` before exits 1, 3 and 4, and `usage` before exit 2.
- **I1/I2.** `endLeftFence` has one `unlinkSync(file)`, guarded by `idle !== null`. `idleFence` needs `own.landed.length === 0` and no `intentStands`. Its other writes are `writeState` (session `state.json`) and, on the JSON branch, the codec's `end`.
- **I3.** Legacy branch: `again.operation_id !== idle` refuses. JSON branch: `i.maintenance?.operation_id !== s.rollback.begin_id` refuses, and `end` names `begin_id`. The codec answers `conflict` to an `end` naming another fence.
- **I4.** This is a codec property, unchanged in substance.
- **I5.** Only `landedWay` names a hand deletion. Every swept passage defers to the message for it.
- **I6 to I9.** `setAside` has one `renameSync`. It throws first on `shows === null` and on `shows !== null && standing(i)`, and `existsSync(to)` runs right before the rename.
- **I10.** For a record that is not rolled back, `run` first runs `current` (which only inspects), then returns the no-op or throws "is recorded". No `migration` op is sent.
- **I11.** `refusedFirstChunk` returns before `endRollbackFence` when `work` is null or empty. The sentence is a necessary condition and promises no success.
- **I12.** Each `Stop(EXIT.precondition, …)` in `preconditions` names itself. The routes are in the message strings.
- **S.** `stale` is non-null only on a positive contradiction.
- The `run` entry now puts the survey before the blocking refusal, as the code does. 13.1.11 had them the other way round.

No swept sentence still states a sufficient condition that an earlier refusal could falsify. The purpose sentences are covered by R in the header and by "where they proceed", "is for" and "where it succeeds" in the README and the Undo paragraph.

### Adjacent drift the new wording exposes (Low)

**F2. The header's unchanged `status` entry reads `record=` as "whether the tree carries the record's last write".** `261017-1908-migrate-header-status-entry-reads-record-as-whether-the-tree-carries-the-last-write-which-stale-does-not-decide.md`.
`stale`'s own comment says "It does not say the tree matches the record: a reset of an uncommitted migration leaves the plan files and reads current." The 13.1.12 texts state only stale ⇒ disagree (plan row S, "never the converse"). The `status` entry, three lines below the rewritten `set-aside` entry, still states both directions. It was outside the swept set, so this is not a defect of the package's execution, but it is the same class of claim.

### Code, found at a kept invariant's site (Low)

**F3. `rollback` treats a later chunk refused in the same call as a refusal of the first chunk after activation.** `261017-1908-migrate-rollback-treats-a-later-chunk-refused-in-the-same-call-as-the-first-chunk-after-activation.md`.
`rollback` tests `i.state === "json-control"` against an `inspect` taken before its loop. Once the first rollback chunk lands, the manifest is gone and the tree is legacy. A refusal of the next chunk in the same call still reaches `refusedFirstChunk`, which either offers `--end-fence` "to stay under JSON control" or sends a `maintenance end` that the codec refuses over a legacy store. Nothing is removed, so the harm is a misleading message. This is an inference from reading the code and was not reproduced. The header sentence speaks only of "the first chunk after activation", so no doc sentence is false.

## Check (2): nothing needed to act safely was lost

- **Hand deletion.** All three texts now say it is named only by the helper's message. The header and the Undo paragraph say so explicitly ("Delete that file by hand only where the helper's message names that deletion"). The README row defers to "the message each prints". The conditions (`record=stale`, `journal/` empty, no listed control path standing) are in `landedWay`'s own text, so the reader meets them where they apply.
- **What was dropped.** The Undo paragraph's "the skill then surveys again" (the skill still does it: `SKILL.md` line 191), the intent-pending wording, the write-lock and re-read checks of `--end-fence`, and the exit-5 refusal list. Each is conditional and reaches the reader as a stderr message at the moment it applies. None is a precondition a reader must check before running anything.

## Check (3): readability

Clearly better. The `migrate.ts` row's middle went from 1 537 bytes of nested conditions to four plain sentences in 556 bytes (measured with `wc -c` on the span between "under its recorded id." and "It writes no control"). The Undo paragraph's rewritten part went from 18 lines to 9, and every sentence there is now one claim. Two small spots, neither filed:
- The header `run` entry: "printing those lines first" now sits after the survey, further from its antecedent (the reported, untracked and ignored lines). The README row's "(printing its `reported=` lines first)" is unambiguous.
- The README `bin/fusion-migrate` row: "removing itself no workbench file but" is awkward word order.

## Check (4): no code moved, help true, release surfaces

- `bin/fusion-migrate`: comment-only diff, usage block identical, `bash -n` passes. `hooks/migrate.ts`, `hooks/dist/` and `skills/migrate/SKILL.md` have no diff in the range.
- The help paragraph ("Coming from 13.1.11 or earlier", "13.1.2 to 13.1.12 need no migration", "13.1.12 changes nothing that runs; it shortens the undo descriptions") is true. It joins the predecessor's paragraph, which is the patch rule of `README-agents.md` `## Releasing` step 0. The golden moved by the sentence's 70 bytes.
- The version surfaces agree at 13.1.12: `plugin.json`, the `install.sh` and `README.md` pins, and the marketplace working clone (uncommitted, version line only). The two `description`s compare equal.
- The release commit message states the `fusion-review-coverage --since v13.1.11` result, `uncovered=3`, all three workbench records, with this review named as the step before the tag. That satisfies step 0.

## The three issues the release closed

- `261017-1747-migrate-refusal-claims-except-only-the-legacy-fence-removal-where-end-fence-also-ends-a-json-fence-over-a-stale-record.md`: **fixed is right.** No refusal claim is left to falsify, and the `set-aside` entry carries no exception phrase.
- `261017-1747-migrate-undo-note-environment-bound-covers-only-status-and-refusals-and-omits-a-codec-refusal.md`: **fixed is right.** I checked every remaining promise in the paragraph against exits 1 to 4, 7 and 8. Each is scoped ("where it succeeds", "Its `record=stale` … then offers") or unconditional. The second half of the acceptance is moot, as its `Resolved:` line says.
- `261017-1708-migrate-header-run-entry-lists-its-preconditions-without-the-legacy-state-check.md`: **defensible, though `superseded` would have been more exact.** Read literally, its acceptance ("every refusal … in the entry's list, in code order") is not met. The defect is gone because the list is gone, and the `Resolved:` line says that the fix direction was replaced. The record is terminal, so I filed nothing.

## Cross-cutting observations

- The method works. Each surviving sentence was checkable against one code site, and this pass needed no cell table. Both doc findings (F1, F2) are about one qualifier or one direction, not a missing condition.
- The qualifier "itself" is the load-bearing word on every removal claim that crosses into the codec. Of the three texts, only the header's sentence lacks it.

## Recommended sequencing

Tag v13.1.12 as is. F1 and F2 are comment lines in one file and could ride the next patch together. F3 is a code change with a test and a dist rebuild. It belongs with the open code issues `261017-1708-migrate-messages-name-end-fence-as-ending-a-fence-it-then-refuses-to-end.md` and `261017-1717-migrate-run-reuses-a-rolled-back-session-recorded-for-another-workbench-path.md`.
