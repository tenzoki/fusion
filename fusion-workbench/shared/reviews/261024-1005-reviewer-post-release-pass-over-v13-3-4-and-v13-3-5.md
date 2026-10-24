# Post-release review of fusion 13.3.4 and 13.3.5

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `8530c67c..8280c372`
**Not-opened:** `hooks/dist/migrate.js`, `261023-1846-migrate-eight-messages-still-name-a-helper-command-without-the-session-flag-and-the-13-3-3-note-says-every-one-does.md`, `261023-1846-reviewer-post-release-pass-over-v13-3-3.md`, `261023-1847-migrate-exit-7-retry-names-resume-or-rollback-whatever-subcommand-met-the-unknown-outcome.md`, `261023-1854-does-the-catalog-gain-entries-under-fusion-catalog-v1-or-as-v2.md`, `261023-1854-how-does-a-skill-become-a-profile-when-its-body-carries-claude-mechanics.md`, `261023-1854-plan-prior-full-surface-handover-h1-to-h9.md`, `261023-1854-which-plugin-tree-does-the-bundle-payload-carry-for-the-helper-runtime.md`, `261023-1854-which-schemas-bind-an-entry-run-of-an-agent-that-is-also-a-workflow-role.md`, `261023-2154-entry-envelope-oversize-replacement-drops-the-commit-of-an-integration-that-stands.md`, `261023-2154-entry-load-and-the-receipt-cross-checks-have-no-test-that-would-turn-red.md`, `261023-2154-entry-module-passes-a-settled-answer-of-status-recovery-required-through-as-recovery-required.md`, `261023-2154-frozen-entry-result-schema-describes-changes-and-questions-differently-from-what-the-module-and-prior-produce.md`, `261023-2154-reviewer-closing-review-of-prior-handover-h1-h6-h7.md`, `261023-1846-migrate-eight-messages-still-name-a-helper-command-without-the-session-flag-and-the-13-3-3-note-says-every-one-does.record.json`, `261023-1847-migrate-exit-7-retry-names-resume-or-rollback-whatever-subcommand-met-the-unknown-outcome.record.json`, `261023-1854-does-the-catalog-gain-entries-under-fusion-catalog-v1-or-as-v2.record.json`, `261023-1854-how-does-a-skill-become-a-profile-when-its-body-carries-claude-mechanics.record.json`, `261023-1854-under-prior-do-the-hook-rows-keep-going-to-orchestrator-events-jsonl.record.json`, `261023-1854-which-plugin-tree-does-the-bundle-payload-carry-for-the-helper-runtime.record.json`, `261023-1854-which-schemas-bind-an-entry-run-of-an-agent-that-is-also-a-workflow-role.record.json`, `261023-2154-entry-envelope-oversize-replacement-drops-the-commit-of-an-integration-that-stands.record.json`, `261023-2154-entry-load-and-the-receipt-cross-checks-have-no-test-that-would-turn-red.record.json`, `261023-2154-entry-module-passes-a-settled-answer-of-status-recovery-required-through-as-recovery-required.record.json`, `261023-2154-frozen-entry-result-schema-describes-changes-and-questions-differently-from-what-the-module-and-prior-produce.record.json`, `261023-2154-reviewer-closing-review-of-prior-handover-h1-h6-h7.evidence.json`, `261023-1846-prior-full-surface-handover-h1-to-h9/package.json`, `261023-1915-prior-handover-b-agent-profiles/package.json`, `261023-1915-prior-handover-c-skill-profiles/package.json`, `261023-1915-prior-handover-e-bundle-payload/package.json`, `261023-1915-prior-handover-f-release-and-request-76/package.json`
**Scope note:** the workbench records above are what a4065d78, 97552507 and af76f94f carry; the dispatch asked only that those three commits change nothing outside `fusion-workbench/`, which was checked. Commit 1ac2b90b, after `8280c372`, is outside this range.
**Review domain:** code
**Verdict:** the two releases stand; four Low findings, filed as issues. No release blocker.

## Summary

The docs pass (19810b74) is largely true against `install.sh`, the two `package.json` engines and `claude plugin --help`; five statements in it or the 13.3.5 help paragraph are still false or unresolvable. The `--session` fix (408bd58e) holds at all eight sites and its tests bite, but the new `retry()` names `resume` after a `run` that recorded nothing yet, reproduced. The end-fence fix (88c44a19) is correct: `endStored` reads the same stored-answer shape the codec writes, and only successful answers are stored. The four version surfaces agree at 13.3.5.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 4 |

## Findings by theme

### The exit-7 retry after `run` (Low)

`hooks/migrate.ts` `function retry`: `if (sub === "run" || sub === "resume") return "resume";`. `run` sends `inspect` (from `preconditions`) and the survey before `writeState`, and `resumeRun` starts with `recorded()`, which exits 5 on an empty session. Reproduced at 8280c372 on a scratch plugin copy whose codec stand-in exits 9 on `op: inspect`: `run` exit 7 names `bin/fusion-migrate resume --session <dir>`; that command exits 5, "no run is recorded". The 408bd58e test kills at `phase: apply, chunk: 1`, after the record is written, so it cannot see this. The same claim is in the `retry` comment, `bin/fusion-migrate`'s exit-7 header line and the help 13.3.4 sentence. Pre-13.3.4 the message named `resume` too, so this is a residual of the fix rather than a regression.
Issue: `261024-1005-migrate-exit-7-after-run-names-resume-before-any-run-is-recorded-so-the-named-retry-exits-5.md`.

### The session path in a named command (Low)

`function command` appends `--session ${session}` unquoted; `retry()` quotes its own arguments. With `--session "<scratch>/home/my own"` a blocking `repair --apply` names `` `bin/fusion-migrate repair --list --session <scratch>/home/my own` ``, which pasted is a usage error. `runNamed` in the test splits on spaces and every test session is `join(home, "own")`, so no test can see it.
Issue: `261024-1005-migrate-command-spells-a-non-default-session-path-unquoted-so-a-path-with-a-space-names-a-command-that-cannot-be-pasted.md`.

### Install, update and release docs (Low)

Verified true: Node `>=20.12.0` in both `hooks/package.json` and `codec/package.json`; the launcher exports `FUSION_PLUGIN_ROOT` before `exec claude` and its comment calls the env-file route unreliable; `--update` downloads `main`'s `install.sh` and keeps no variables; `claude plugin update`, `uninstall --scope` and `list` exist (`--help`); the marketplace entry's `source` is `github` `tenzoki/fusion` with no ref; `/fusion:check` has a `permissions` selector; v10.8.0 to v10.13.0 and v10.15.0 to v10.19.0 have no tag.

Still false or unresolvable, one issue: `install.sh` header says every release is tagged (v11.8.1 is not either, and `README.md` omits it); the launcher's `--update` usage still says "the latest"; `README-hooks.md` keeps "Problem 10/11/13", the same dead reference 19810b74 removed for 12; `README-agents.md` step 4 cites a bare stamp two decisions share, and the lint baseline was raised to admit it; the 13.3.5 help sentence says the end-fence retry "finishes the undo", where the store stays under JSON control and no later rollback is possible.
Issue: `261024-1005-the-13-3-4-install-documentation-pass-left-five-statements-untrue-or-unresolvable.md`.

### Carried file: `catalog/README.md` (Low)

"Two exist" for the workflows, with `entry.v1.json` present since a419215a and frozen in `catalog/schemas/FROZEN`; the layout omits both schema-case tables and `schema-cases.test.ts`.
Issue: `261024-1005-catalog-readme-says-two-workflows-exist-and-its-layout-omits-the-schema-case-tables.md`.

## What holds

- **All eight `command()` sites.** `preconditions`, `run`, `resumeRun`, `rollback`, `restoreBackup`, `setAside`, `repair` and `endLeftFence` now build every named command through `command(wb, session, …)`. `endLeftFence` names `run` against the session with `.stale-…` stripped, which is the session the record was set aside from. The source scan in `migrate.test.ts` reads escaped backticks in template literals and backticks in double-quoted strings, with four descriptive exemptions; the commit says it was red on the parent, which fits the eight bare sites it removed.
- **`retry()` quoting.** `'${a.replace(/'/g, "'\\''")}'` is correct POSIX single-quote escaping; `--session` and its value are filtered out before `command()` adds them. Untested (see the session-path finding). The as-given branch is safe: of the other subcommands, only `inspect` and the survey reach the codec, and both are reads.
- **`endStored`.** The codec writes an `ops/<id>.json` answer only for `ok: true` responses (`codec/src/kernel.ts`, both `writeAnswer` sites), and `{ response }` is the stored shape, so `response?.ok === true` is the right test. The plain `rollback` route after a lost final `maintenance end` also settles: the fence is gone, `!stored(end_id)` short-circuits, `rolled_back` is set. Both 88c44a19 tests assert the state file, not only the exit code.
- **Version surfaces at 13.3.5.** `.claude-plugin/plugin.json` 13.3.5; `install.sh` header `FUSION_REF=tags/v13.3.5`; `README.md` `Overrides:` `tags/v13.3.5`; marketplace clone `marketplace.json` fusion `version` 13.3.5 (its commit 8876fc0). `v13.3.4` and `v13.3.5` resolve to ca163131 and 8280c372, and `origin` carries both. 13.3.4 was never entered in the marketplace, and 8280c372's message says so.
- **Help update paragraph.** The label "Coming from 13.0.0 to 13.3.4" covering 13.3.0 to 13.3.5 follows the convention of the two paragraphs below it, the paragraph count stays at the cap of three, and the 13.3.3 sentence was folded into 13.3.4's ("which 13.3.3 did for some"). Two sentences are inaccurate: 13.3.4's exit-7 claim (first finding) and 13.3.5's "finishes the undo" (docs finding).
- **Workbench-only commits.** a4065d78, 97552507 and af76f94f change no path outside `fusion-workbench/`.
- **Carried files.** `main_test.go` and `hostsvc/entry_test.go` assert what their names say; `schema-cases.test.ts` and the Go `schema_cases_test.go` read the same two tables; `fixture.go`'s `EntryBundle` reads the live catalog and writes only to a temp dir. One observation, not filed: `supportEntries` ignores two `json.Unmarshal` errors with `_ =` and sets `claude-code` support as well as `prior`, contrary to its comment. Test-only: an unreadable `id` ends in `t.Fatalf`. `orchestrator-events.jsonl`: 8 129 lines, all parse.

## Cross-cutting observations

- **A fix's test exercises the path the bug report named, and stops there.** 408bd58e's exit-7 test kills `run` after its record exists; `runNamed` splits on spaces; the help sentence was written from the commit subject. Each closing claim ("every", "names the command that met it", "finishes the undo") is wider than the case that verified it. Third consecutive release where the `/fusion:migrate` message surface is corrected after release.
- **Partial cleanup of a pattern.** 19810b74 fixed "Problem 12" and left 10, 11 and 13; fixed the README tag statement and left `install.sh`'s; fixed the docs' `--update` wording and left the launcher's. The analysis named all of them (S7, W8); the gap is in applying it, not in finding it.
- **inference, not measured:** the README's in-session check, `grep … "$FUSION_PLUGIN_ROOT/.claude-plugin/plugin.json"`, names the wrong copy when a bare `claude --plugin-dir` starts from a launcher-spawned shell that already exports `FUSION_PLUGIN_ROOT`. The analysis's M6 says the same and leaves it unmeasured; only `CLAUDE.md` was changed for it.

## Recommended sequencing

None blocks. Take the two migrate issues together in one patch release, since both change `retry()`/`command()` and `migrate.test.ts`, and correct the help 13.3.4 and 13.3.5 sentences in the same release note. The docs and `catalog/README.md` issues are cleanup for any later release; the `stampBare` rollback in the docs issue moves the reference-resolution baseline, so it needs the usual re-approval note.

## Checks run

- `cd hooks && npm test`: exit 0 (67 files passed, 1 skipped; 1209 tests passed, 14 skipped), started before this review's records were written; `workbench-citation-lint` was re-run over them afterwards.
- `bash -n install.sh`: exit 0.
- Reproductions on a scratch plugin copy at 8280c372 (codec stand-in exiting 9 on `inspect`; `--session` with a space), under the session scratchpad, outside the repository.

No evidence record: this review sits in `shared/reviews`, outside any work package's container, which is the one place `agents/reviewer.md` asks for one.
