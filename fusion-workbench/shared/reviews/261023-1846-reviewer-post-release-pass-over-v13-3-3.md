# Post-release review: fusion 13.3.3

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Review domain:** code
**Reviewed-range:** `a6071469..8530c67c`
**Not-opened:** `fusion-workbench/orchestrator-events.jsonl`, `261017-2030-plan-migrate-code-issues-end-fence-suggestion-foreign-session-later-chunk.record.json`, `261023-1403-migrate-unknown-outcome-and-refused-first-chunk-messages-spell-commands-without-the-session-flag.record.json`
**Cross-references:** `261023-1403-migrate-unknown-outcome-and-refused-first-chunk-messages-spell-commands-without-the-session-flag.md`, `261023-1403-reviewer-closing-pass-over-the-migrate-code-issues-package.md`

Tag `v13.3.2` resolves to `a6071469`; tag `v13.3.3` to `8530c67c`. The range holds `fb2dbfbc`, `e1fba90e`, `479b5354`, `8530c67c`. The three record files above were seen only through `git show --stat` or a single-field grep; workbench content is out of a code review's scope.

## Summary

The three sites the issue and the follow-up named are fixed correctly. The exit-7 move from `send` to `main` is behaviour-preserving for exit codes and does not lose or double the retry clause. The new test is red against the v13.3.2 source in all three of its parts and green at `8530c67c`. The committed dist is the build of the source. The release does not deliver what its note claims: eight other message sites still name a subcommand bare, so "every message naming a command carries `--session`" is false. Verdict: **revise** (two Low findings, no blocker).

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 2 |

## Findings

### F1 (Low): bare subcommand names remain in eight message sites, and the 13.3.3 note says none do

Filed: `261023-1846-migrate-eight-messages-still-name-a-helper-command-without-the-session-flag-and-the-13-3-3-note-says-every-one-does.md`.

`hooks/migrate.ts` at `8530c67c`. Each site below tells the user to run a subcommand by its bare name, inside a function that has `session` in scope:

- `preconditions` (fallback `way`)
- `run` (blocking: "\`repair --list\` proposes their repairs")
- `repair` (unknown id)
- `resumeRun` ("\`rollback\` finishes that")
- `rollback` ("\`resume\` first")
- `restoreBackup` ("\`rollback\` first")
- `setAside` (current record: "\`run\` starts…" / "\`resume\` or \`rollback\` acts on it")
- `endLeftFence` (the `fence-ended=` note ends in a bare `run`)

The `repair --list` site has a concrete consequence. `compose` reads `actorsFromLog(readRepairLog(session))`, so a control-only repair applied without the flag is logged in the default session, and `run --session <dir>` stays blocked.

Release surfaces stating the opposite:
- `skills/help/SKILL.md` `### 4. Update`: "13.3.3: `/fusion:migrate` messages naming a command carry `--session` under a non-default session."
- The `8530c67c` message: "every message that names a bin/fusion-migrate command carries --session".

Root cause: the 261023-1403 issue stated "Every other message site that names a helper command builds it with `command(wb, session, sub)`". That holds only for the `` `bin/fusion-migrate …` `` spelling and not for the bare-subcommand spelling, and the fix was scoped from that sentence. The new test matches only the `` `bin/fusion-migrate …` `` token (`/`bin\/fusion-migrate [^`]*`/g`), so it cannot see the bare form either.

### F2 (Low): the exit-7 retry clause ignores which subcommand ran

Filed: `261023-1847-migrate-exit-7-retry-names-resume-or-rollback-whatever-subcommand-met-the-unknown-outcome.md`.

`main`'s catch always names `resume` / `rollback`.
- For `survey`, `status`, `repair`, `set-aside`: the unanswered request is a read, so "sends the same request again" is false. `resume` would drive a recorded run in flight.
- For `rollback --end-fence`: the request was `maintenance end`, which only `rollback --end-fence` resends.

This is pre-existing (13.3.2's `send` text said the same). It is now a local fix, because `main` holds `sub` and the flags. The `bin/fusion-migrate` header's exit-7 line carries the same narrowing.

## Checks that passed

**Remaining `bin/fusion-migrate` spellings.** Every backticked `` `bin/fusion-migrate …` `` command in `hooks/migrate.ts` is now built by `command()`. `grep -n "fusion-migrate " hooks/migrate.ts` finds only `command()` itself and the usage text, which names no subcommand to run. The bare-name sites are F1.

**`main` restructure.**
- Exit codes: the catch rethrows any Stop other than exit 7 as the same object, and any non-Stop error unchanged. The exit-7 rethrow keeps `EXIT.unknown`. The usage, flag and directory checks before the `try` cannot reach `send`.
- No loss or doubling: every `send` call sits inside a subcommand function called from the `try`, and nothing at module level calls it.
- Wrapping catches: the only catch that wraps a codec Stop is `refusedFirstChunk`'s around `endRollbackFence`. It keeps `(e as Stop).code` and puts the inner message last, so `main` appends the clause once, at the end. `rollback`'s chunk-loop catch passes everything but exit 8 through unchanged.
- No swallowing: none of the 14 `catch` sites in the file converts or drops an exit-7 Stop. The bare `catch {}` blocks guard file reads only. `legacy-repair.ts` and `legacy-import.ts` do not call the codec client, so no `send` caller outside `main`'s `try` prints a text without the clause.

**Tests.** Run in scratch copies extracted with `git archive`, never in the live tree.
- The v13.3.2 `hooks/migrate.ts` and `hooks/dist/migrate.js` under the `8530c67c` test file, with assertions made soft so each part reports:
  - refused first chunk: names `` `bin/fusion-migrate rollback` `` and `` `… rollback --end-fence` `` without the flag
  - exit-7 cut: names `` `bin/fusion-migrate resume` `` without the flag
  - recorded-run refusal: 0 commands matched, 2 expected

  All three parts are red.
- At `8530c67c` the case is green. The full `npm test` gave 66 files passed and 1 failed. The failure was `committed-dist.test.ts`, with `EEXIST` on the `node_modules` symlink. That symlink is an artefact of the scratch copy (the extracted tree already carried one, committed into the scratch repo), not of the release.

**Dist.** A rebuild with `node scripts/build.mjs` at `8530c67c` is byte-identical to the committed `hooks/dist/migrate.js` (`cmp`). The same check holds for v13.3.2.

**`bin/fusion-migrate` header.** The exit-7 line matches the printed text: "Nothing is lost; `…resume` (or `…rollback`, if that was the command) sends the same request again", with `--session` when non-default. Its scope limit is F2. No other shipped text quotes the changed messages (`git grep` outside the workbench and `dist`).

**Release surfaces.**
- `.claude-plugin/plugin.json`, `README.md` and `install.sh` read 13.3.3.
- `skills/help/SKILL.md` `### 4. Update` still holds three install-from paragraphs: "Coming from 13.0.0 to 13.3.2", "… to 13.1.12", "… to 13.1.11", then "Older than that". Its relabel follows the section's established pattern. Its 13.3.3 sentence is inaccurate (F1).
- The surface-growth golden moves `help/SKILL.md` by 99 bytes and `migrate.test.ts` by 22 lines. No baseline or head-room constant moved.

## Cross-cutting observations

- Two passes in a row produced a "the remaining sites are fine" claim without enumerating them. The closing review behind 261023-1403 said every other site used `command()`. The 13.3.3 release then repeated that as a property of the release. Both claims rested on the `` `bin/fusion-migrate …` `` spelling only, so the enumeration should cover the bare-subcommand form (`rules/critical-stance.md` §5).
- The release commit records `bin/fusion-review-coverage --since v13.3.2` as 3 of 3 uncovered and released over it. This pass covers that range after the fact.
- Not a code defect: `e1fba90e`'s message ends without the `Co-Authored-By:` trailer the other three commits carry.

## Recommended sequencing

No release blocker. F1 and F2 touch the same function family and the same test file, so they fit one `code-implementer` dispatch and one patch release. Fix F1's help sentence in the same patch, by making it true or narrowing it.
