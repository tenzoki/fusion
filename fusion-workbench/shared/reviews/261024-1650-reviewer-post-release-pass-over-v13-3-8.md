# Post-release review of fusion 13.3.8

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Review domain:** code
**Reviewed-range:** `dfcc9fc5..fd535452`
**Not-opened:** `fusion-workbench/orchestrator-events.jsonl`, `261024-1005-reviewer-post-release-pass-over-v13-3-4-and-v13-3-5.md`, `fusion-workbench/work-packages/` records of the H1/H6/H7 hand-over package (carried from earlier passes; records, not code)
**Verdict:** revise: one Medium regression in the dangerous direction; nothing else

## Summary

5e16e63d fixes both 13.3.7 findings as their issues asked. Row J of the state table now gives the true no-op. An exit 7 from `survey` or `repair` over a damaged `state.json` stays exit 7. Both new tests are red on dfcc9fc5 and green at fd535452.

The refusal test in the new `rollback` catch cannot tell a foreign fence from the rollback's own fence. When `maintenance begin` set its fence but its stored answer was lost, the retried begin is refused under its own fence. 13.3.8 then drops the record of that fence. After that no helper command ends it, and `run` answers "verified" over a store that refuses every write. 13.3.7 kept the record, and `rollback --end-fence` ended the fence. The release surfaces are coherent at 13.3.8, and every sentence of the help paragraph is true.

## Totals

Critical 0 / High 0 / Medium 1 / Low 0.

## Findings

### M1. A refused retry of the rollback's own `maintenance begin` clears the record of the fence it set

- `hooks/migrate.ts` `function rollback`: the catch nulls `s.rollback` when `e.code === EXIT.refused && !stored(wb, begin)`.
- The `!stored` clause adds nothing. `codec/src/kernel.ts` `mutate` stores no refusal ("A refusal writes nothing and stores nothing"). It also answers a request whose answer is stored before any fence check (`replayAnswer` precedes `fenceRefusal`). So on every refusal, `begin` is not stored.
- `mutate` sets a fence and only then stores its answer. Its own comment says: "a crash between leaves the fence set and no answer, and a retry meets the fence it set, named by its own id". `fenceRefusal` lets only a matching `end` through, so that retry is `conflict/maintenance-active` naming `begin` itself.
- Row K below reproduces it. The process dies between fence and answer, then the named retry `rollback` runs. At fd535452: exit 8, record `T/null/F`, fence `<begin_id>` stands. `rollback --end-fence` then answers 5 ("no fence of a refused rollback stands"), and `run` answers 0 `no-op` "verified". At dfcc9fc5 the same steps keep `T/set/F`, and `--end-fence` ends the fence (0, `fence=-`).
- The direction is the dangerous one: a fence that stands loses its record. Every later `rollback` mints fresh ids, is refused by the same fence and clears them again. The only exit is deleting `.json-state/maintenance.json` by hand, and no message names it.
- The trigger is rare. It needs the codec child to die between two filesystem calls (Ctrl-C, a client timeout kill, power loss), followed by the retry that exit 7 itself names.
- Pre-existing in both versions: the retry's exit-8 message names no way out.
- Scope: `bin/fusion-migrate rollback` and `/fusion:migrate`'s undo route. One function.
- Fix direction: decide on the standing fence (`inspect().maintenance.operation_id === begin`), not on `stored`.
- Filed: `261024-1650-migrate-rollback-drops-the-record-of-its-own-standing-fence-when-the-retried-begin-is-refused.md`.

## Question 1: every way the begin can fail

`send` throws only two `Stop` codes; `ask` may also throw.

| Failure | Catch does | True? |
|---|---|---|
| exit 7, unanswered (begin landed or not) | keeps `s.rollback`; the retry resends under the same id | yes: a landed begin answers by replay; a lost one resends |
| exit 8, foreign fence (`maintenance-active` under another id) | nulls | yes (row J) |
| exit 8, `recovery-blocked`, `lock-timeout`, `legacy-workbench` race | nulls | yes: no fence was set |
| exit 8, own fence set, answer lost (row K) | nulls | **no**: M1 |
| exit 8 whose `begin` IS stored | unreachable: a stored answer is replayed, never refused | n/a |
| a thrown non-`Stop` (spawn fault) | keeps the record, rethrows, exit 3 | conservative |
| `writeState` throws inside the catch | the I/O error replaces the refusal, exit 3 | the record still says set, the safe side; not filed |

`endStored` is not used on this path. The `stored` check is against `s.rollback.begin_id`, the right id. It is just not the right test.

## Question 2: the exit-7 handler reads the record only for `run`

`retry` reads `s` only on its `run` branch. `resume` returns `resume`. `rollback` returns its own flag form. Every other subcommand repeats its arguments. No other branch needs the record. Under `run`, the record was parsed by `run`'s own first `readState` just before, so the handler adds no new failure there.

## The state table, re-run at fd535452 and at dfcc9fc5

The probe is the previous pass's probe rebuilt as a vitest file, appended to each tree's `migrate.test.ts` in scratch worktrees and removed afterwards. Same helpers, with `--session <home>/own`. Order per row: `run` with `op: inspect` killed, then plain `run`, then the command that exit 7 named. Rows A, D and G proceed, so their plain `run` is their named command.

| Row | Record | Plain `run` | Killed, names | Named then | Changed since 13.3.7? |
|---|---|---|---|---|---|
| A | none | 0 `json-control` | `run` | (= plain) | no |
| B | F/null/F | 5, `resume`, `rollback` | `resume` | 0 `json-control` | no |
| C | T/null/F | 0 `no-op` | `run` | 0 `no-op` | no |
| D | T/set/T | 0 `json-control` | `run` | (= plain) | no |
| E | T/set/F | 5 "is being rolled back", `rollback` | `rollback` | 0 `legacy`, `rolled_back=true` | no |
| F | F/set/F | 5 "is being rolled back", `rollback` | `rollback` | 0 `legacy`, `rolled_back=true` | no |
| G | F/set/T | 0 `json-control` | `run` | (= plain) | no |
| H | T/set/F, own fence stands | 5 "is being rolled back", `rollback` | `rollback` | 8, names `rollback`, `rollback --end-fence`, fence kept | no |
| I | T/null/F | 0 `no-op` | `run` | 0 `no-op` | no |
| J | **T/null/F** (was T/set/F) | **0 `no-op`** (was 5) | **`run`** (was `rollback`) | **0 `no-op`** (was 8) | **fixed** |
| K | own begin fence, answer lost, then retried `rollback` | 0 `no-op` over a fenced store | `run` (read off `retry`, not run) | 0 `no-op`, fence stays | **regressed** (M1) |

Rows A to J tell the truth at fd535452. At dfcc9fc5 the probe reproduced the previous review's row J (5, then 8). Row K is new to the table. Its "record" column is the state after the named retry `rollback`, which is where the two versions part.

## The two new tests

- Copied into a dfcc9fc5 worktree with `-t 261024-1425`: 2 failed. The survey/repair test got exit 3 with `SyntaxError ... at readState`. The rollback test got a record with `rollback` set and `run` exit 5.
- At fd535452, `migrate.test.ts` passes 38 of 38.
- Both pin the behaviour their issues name. Neither covers row K: the rollback test's fence is foreign.

## dist

`node scripts/build.mjs` in a clean fd535452 worktree left `git status` clean. The tracked `hooks/dist/migrate.js` is the build of `hooks/migrate.ts`.

## Release coherence (fd535452)

- `.claude-plugin/plugin.json` is 13.3.8. `install.sh:29` and `README.md:30` pin `tags/v13.3.8`. No other 13.3.x string is left in the three files. `bash -n install.sh` exits 0.
- `v13.3.8` peels to fd535452. On origin, `refs/heads/main` and the peeled tag are both fd535452.
- Marketplace: 92cb917 changes one line of `.claude-plugin/marketplace.json`. The fusion entry is 13.3.8, its description equals `plugin.json`'s byte for byte, and the source is `tenzoki/fusion`. The clone is clean and origin `main` is at 92cb917.
- Golden: `wc -c skills/help/SKILL.md` is 17620 and `wc -l migrate.test.ts` is 918. Both match `surface-growth.golden`. No bound moved.

### The help paragraph, sentence by sentence

- Label "Coming from 13.0.0 to 13.3.7", and "13.3.0 to 13.3.8 need no migration": true. There is no store change in the range, and the label follows the convention of the previous releases.
- "13.3.8: a rollback the store refuses to start no longer leaves the session looking as though a rollback were running": true (row J). Row K is not a contradiction, because there the store did start the rollback's fence. M1 is the opposite error, not this one.
- "and an unknown outcome at `survey` or `repair` stays a retry even when the session file is damaged": true, measured for `survey` and `repair --list`. It holds for `repair --apply` by the same code path (the `sub === "run"` guard).
- "13.3.7: ... refuses and names `rollback`, and so does the retry after an unknown outcome at `run`": true for E, F and H. It is no longer said of J, which 13.3.8 removed from the class.
- 13.3.6 "before any run is recorded, the named retry is `run` again": true (row A).
- The 13.3.5 to 13.3.0 sentences are unchanged and outside this range's code.

## Measured, not taken from the commit messages

- `migrate.test.ts` at fd535452: 38 passed.
- Two new tests at dfcc9fc5: 2 failed.
- Full `cd hooks && npm test` at fd535452 in a clean worktree, with the probe file removed: exit 0, 1215 passed and 14 skipped. This matches the commit message.

## Observations not filed

- The `!stored(wb, begin)` clause in the catch is always true on a refusal (see M1). The fix for M1 replaces it, so it is not filed separately.
- 5e16e63d closes both 261024-1425 issues. Whether each narrative carries its `Resolved:` line is a records question for the state auditor. It is outside this code review, and I did not open them.

## Recommended sequencing

Nothing here blocks use in the common case. M1 is a one-function fix in `hooks/migrate.ts` with a test. It belongs in the next patch release, because 13.3.8 turned a recoverable state into one that only a hand deletion recovers.
