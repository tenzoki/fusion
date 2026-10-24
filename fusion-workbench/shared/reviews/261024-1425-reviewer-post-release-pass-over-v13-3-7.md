# Post-release review of fusion 13.3.7

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Review domain:** code
**Reviewed-range:** `2a9f4a72..dfcc9fc5`
**Not-opened:** `fusion-workbench/orchestrator-events.jsonl`, `261024-1005-reviewer-post-release-pass-over-v13-3-4-and-v13-3-5.md`, `fusion-workbench/work-packages/` records of the H1/H6/H7 hand-over package (carried from the two previous passes; outside this range)
**Verdict:** accept, with two Low follow-ups

## Summary

951f27e9 meets all three acceptance criteria of `261024-1222-migrate-run-over-a-record-whose-rollback-is-in-flight-answers-no-op-verified-and-the-13-3-6-exit-7-retry-now-routes-there.md`. I built a full table of the session-record states and ran each row. Every row a real interruption produces now reaches a command that succeeds, or one that refuses truthfully. One row the issue did not name is new: a rollback whose `maintenance begin` was refused. There `run` now claims "is being rolled back", where 13.3.6 gave the true no-op. Separately, the `readState` call in the exit-7 handler, noted by the previous pass, is now measured to turn an exit 7 from `survey` or `repair` into exit 3 when `state.json` does not parse. The release surfaces read 13.3.7 everywhere, and each clause of the help sentence is true.

## Totals

Critical 0 / High 0 / Medium 0 / Low 2.

## The state table, run

Probe: a vitest file in a scratch worktree at dfcc9fc5. It copies the suite's `project()` and `killPlugin()` and uses `--session <home>/own` in every case. For each state it runs plain `run`, then `run` with `op: inspect` killed, then the command that exit 7 names. Output: `status` lines and the commands named on stderr.

| Row | Record (`done` / `rollback` / `rolled_back`) | Plain `run` | `run`, inspect lost (7), names | Named command then |
|---|---|---|---|---|
| A | no record | (proceeds) | `run` | 0, `json-control` |
| B | run in progress: F / null / F (cut at apply chunk 1) | 5, names `resume`, `rollback` | `resume` | 0, `json-control` |
| C | done: T / null / F | 0, `no-op` | `run` | 0, `no-op` |
| D | rolled back after done: T / set / T | (proceeds) | `run` | 0, `json-control` (new id) |
| E | rollback in flight over done: T / set / F (cut at rollback chunk 2) | 5, names `rollback` | `rollback` | 0, `legacy`, `rolled_back=true` |
| F | rollback in flight over unfinished: F / set / F (apply chunk 1, then rollback chunk 1 cut) | 5, names `rollback` | `rollback` | 0, `legacy`, `rolled_back=true` |
| G | rolled back over unfinished: F / set / T | (proceeds) | `run` | 0, `json-control` |
| H | refused first rollback chunk, fence stands (hand edit): T / set / F | 5, names `rollback` | `rollback` | 8, names `rollback` and `rollback --end-fence`, fence unchanged |
| I | refused with work since plan, fence ended: T / null / F | 0, `no-op` | `run` | 0, `no-op` |
| J | rollback's `maintenance begin` refused by a foreign fence, foreign fence later ended: T / set / F, `fence=-` | 5, "is being rolled back" | `rollback` | 8, audit refusal; own fence ended |

- The guard sits after `current()`. A stale record therefore gets the stale-record message first, which is the same order as `resumeRun`.
- The guard checks `!rolled_back` first. This matters: a completed `rollback` leaves `s.rollback` set (`rollback()` sets only `rolled_back = true`). Rows D and G prove it: they proceed and are not refused.
- `retry` tests `s.rolled_back` before `s.rollback !== null` for the same reason.
- H: "rollback finishes that" is true only once the hand edit is put back. The named `rollback` refuses with exit 8 and names both ways out (put back, or `--end-fence`). That is a truthful refusal.
- J is finding L1.

## Findings

### L1. `run` claims "is being rolled back" when the rollback's `maintenance begin` was refused

- `hooks/migrate.ts` `function rollback` writes `s.rollback` and then sends `maintenance begin`. A refusal leaves the field set with no fence and no chunk rolled back. Row J reproduces it.
- 951f27e9's guard in `function run` reads the field as a rollback in flight: "<id> is being rolled back; `bin/fusion-migrate rollback` finishes that". Nothing is being rolled back. The named `rollback` cannot finish either, because the foreign fence's stored answers are work since the plan, and the codec's audit refuses them in every rollback.
- Against 2a9f4a72's dist, the same probe gives exit 0 `result=no-op`, which is true for that tree. So 951f27e9 turned a true answer into an untrue one for this row.
- The user still ends in a coherent state after one extra command: the exit-8 refusal explains itself, the fence of its own is ended, and `run` then answers the no-op.
- The `stale()` doc comment already says the field alone is not proof of a rollback in flight. `resumeRun` and `current()`'s `claim` make the same reading, unchanged in this range.
- Scope: `bin/fusion-migrate` used directly, and `/fusion:migrate` Step 7, which shows the exit-5 reason and stops. It needs a concurrent maintenance fence at the moment of `rollback`, so it is rare.
- Fix direction: on a refused begin with `begin_id` not stored, set `s.rollback = null` before rethrowing. That makes all three readers true for new records.
- Filed: `261024-1425-migrate-run-says-is-being-rolled-back-over-a-record-whose-rollback-maintenance-begin-was-refused.md`.

### L2. The exit-7 handler's `readState` turns a lost `survey` answer into exit 3 when `state.json` does not parse

- `hooks/migrate.ts` `function main`: `retry(sub, rest, readState(session))` is evaluated for every subcommand. `retry` uses the record only for `run`.
- I judged this again by measuring. `run`, `resume`, `rollback`, `set-aside` and `status` read `state.json` before any codec call, so for them the handler adds no new failure. `survey` and `repair` never read it, but they do send `migration survey`.
- With `{phase: "survey"}` killed and `state.json` = `{ not json`, both `survey` and `repair --list` exit 3 with "a fusion bug or an incomplete install" and a `SyntaxError ... at readState` stack. The unknown-outcome message and its retry are lost. Unkilled, `survey` exits 0.
- It needs outside damage to `state.json` and a lost codec answer at the same time. When both happen, the message is false about whose fault it is, and the fix is one expression.
- Filed: `261024-1425-migrate-exit-7-from-survey-or-repair-becomes-an-internal-fault-when-the-session-state-does-not-parse.md`.

## 951f27e9 against its issue's acceptance

1. **Plain `run` refuses and names `rollback`.** The test `run over a done record whose rollback is in flight refuses and names rollback...` asserts `[5, null, [rollback --session <own>]]` and then runs the named command (0, `rolled_back=true`). Against 2a9f4a72's dist it fails, receiving `[0, "no-op", []]`. **Met.**
2. **The exit 7 at `run` names a command that does not answer `no-op`.** The test `an exit 7 met by run over a rollback in flight names rollback...` fails against 2a9f4a72's dist, which named `run --session <own>`. At dfcc9fc5 it passes: the named `rollback` returns 0 `legacy`. **Met.**
3. **Earlier cases still pass.** `migrate.test.ts` is 36/36 at dfcc9fc5. That includes the two 046980a2 tests and the `phase: apply, chunk: 1` case. The full `npm test` exits 0 with 1213 passed. **Met.**

How the red runs were made: the dfcc9fc5 test file was copied into a 2a9f4a72 worktree, and `npm test -- lib/__tests__/migrate.test.ts -t 261024-1222` was run there. Result: 2 failed, for the reasons quoted above.

Not pinned by a test: row F (rollback in flight over an *unfinished* run, now `rollback` where 13.3.6 named `resume`) and row C's exit-7 retry (`run` → `no-op`). Both behave as the header states (see the table). I did not file this.

## Header, comment and dist

- The `bin/fusion-migrate` exit-7 text says: "`rollback` where it holds a rollback in flight, `resume` where it holds a run neither done nor rolled back, else `run` again (no live record was written yet, or a done one answers the no-op)". It matches `retry`'s branch order for rows A to I. "A rollback in flight" carries the same reading of `s.rollback` as L1. The `retry` doc comment says the same.
- `node scripts/build.mjs` in a clean worktree at dfcc9fc5 rewrote `hooks/dist/migrate.js` and left `git status` clean. The tracked dist is therefore the build of `hooks/migrate.ts`.

## Release coherence (dfcc9fc5)

- `.claude-plugin/plugin.json` is 13.3.7. The pin examples at `install.sh:29` and `README.md:30` are `tags/v13.3.7`. `bash -n install.sh` exits 0.
- `v13.3.7` peels to dfcc9fc5. `git ls-remote origin` shows the tag and `refs/heads/main` at dfcc9fc5.
- Marketplace clone: becb019 sets fusion `version` 13.3.7. The description equals `plugin.json`'s byte for byte. Origin `main` is at becb019.
- Help paragraph (`skills/help/SKILL.md`, "Coming from 13.0.0 to 13.3.6"). The label follows the convention of the previous release.
  - "13.3.0 to 13.3.7 need no migration": true, since there is no store change in range.
  - "13.3.7: a `run` over a record whose rollback was interrupted no longer reports the migration as verified; it refuses and names `rollback`": true for rows E and F. For F, 13.3.6 had not reported "verified" either, so "no longer" is true but not new there.
  - "and so does the retry after an unknown outcome at `run`": true for E, F, H and J.
  - The 13.3.6 sentence, "before any run is recorded, the named retry is `run` again", is still true (row A).
- Surface-growth golden: `wc -c skills/help/SKILL.md` = 17402 and `wc -l migrate.test.ts` = 891, both matching the golden. No bound moved.

## Measured, not taken from the commit messages

- `migrate.test.ts` at dfcc9fc5: 36 passed.
- Two new tests at 2a9f4a72: 2 failed.
- Full `cd hooks && npm test` at dfcc9fc5 in a clean worktree, with the probe files removed: exit 0, 1213 passed and 14 skipped. This matches the 1213 the commit message reports.

## Observations not filed

- The three changed records (`261024-1222` issue and its pair) close with `disposition: fixed`, but the narrative carries no `Resolved:` line. The same holds for the four `261024-1005` issues closed by 046980a2. Workbench records are outside this review's scope. I name this for the state auditor and did not file it.

## Recommended sequencing

Nothing blocks 13.3.7. L1 and L2 are independent one-function fixes in `hooks/migrate.ts` and can share one patch release.
