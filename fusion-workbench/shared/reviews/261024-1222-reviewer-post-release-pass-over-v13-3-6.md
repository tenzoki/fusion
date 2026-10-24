# Post-release review of fusion 13.3.6

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Review domain:** code
**Reviewed-range:** `8280c372..2a9f4a72`
**Not-opened:** `fusion-workbench/orchestrator-events.jsonl`, `261024-1005-reviewer-post-release-pass-over-v13-3-4-and-v13-3-5.md`, `fusion-workbench/work-packages/` records of the H1/H6/H7 hand-over package touched by 1ac2b90b (plans, decisions, issues, package.json files)
**Verdict:** accept, with one Medium follow-up for 13.3.7

## Summary

All four 261024-1005 issues meet their acceptance criteria. The release surfaces read 13.3.6 everywhere. Both new tests fail on ac94c494 and pass on 2a9f4a72, and `hooks/dist/migrate.js` matches a fresh build byte for byte. One residual: 046980a2's record-based retry sends a `run` that met exit 7 over a completed run whose rollback is in flight back to `run`. That `run` exits 0 with `result=no-op` "verified" over a legacy tree with the rollback fence standing. Before the fix, the retry named `resume`, which exits 5 and points at `rollback`. The no-op itself has existed since e7cb55c03.

## Totals

Critical 0 / High 0 / Medium 1 / Low 0.

## Findings

### M1. A completed run with its rollback in flight: `run` answers no-op "verified", and the 13.3.6 retry now routes there

- `hooks/migrate.ts:555`: `if (previous?.done && !previous.rolled_back) return [... "result=no-op", "note=nothing was sent: the session records this migration as verified"]`. It does not check `previous.rollback`. `resumeRun` at `:600` does.
- `hooks/migrate.ts:933`: `if (sub === "run") return s !== null && !s.done && !s.rolled_back ? "resume" : "run";`.
- Reproduced in a scratch worktree with the suite's `killPlugin` stand-in. The steps were `run` (0), then `rollback` killed at `phase: rollback, chunk: 2` (7). `status` then reads `state=legacy`, a fence, `done=true`, `rolled_back=false`, `record=current`. Plain `run` gives exit 0 `result=no-op`. `run` killed on `op: inspect` gives exit 7 and names `bin/fusion-migrate run`, which exits 0 with the same no-op. At ac94c494 the same probe named `resume`, which exits 5: "rollback finishes that".
- The texts are wrong too. The `bin/fusion-migrate` header says "else `run` again (the outcome came before the record was written)", and the 2a9f4a72 message says "a recorded run still names resume". Neither holds for a `done` record.
- Scope: direct CLI use of the helper only. `/fusion:migrate` Step 7 runs `status` and asks on exit 7. It does not follow the named command.
- Fix direction: the no-op requires `previous.rollback === null`, and otherwise refuses and names `rollback`. `retry` names `rollback` after `run` when a rollback is in flight.
- Filed: `261024-1222-migrate-run-over-a-record-whose-rollback-is-in-flight-answers-no-op-verified-and-the-13-3-6-exit-7-retry-now-routes-there.md`.

## The four closed issues against their acceptance

1. **Exit 7 after `run` before a record** (261024-1005, migrate exit 7). `retry(sub, rest, s)` reads the record. The new test kills `op: inspect` under `--session <home>/own`, names `run --session <dir>`, and the named command reaches `json-control`. The test was red on ac94c494 (named `resume`) and is green on 2a9f4a72. The `phase: apply, chunk: 1` case still names `resume`, and the full `migrate.test.ts` is 34/34 at 2a9f4a72. The header and comment were updated, except for the parenthetical in M1. **Met.** On the implementer's first deliberate leave-alone: "a recorded in-flight rollback still names `resume`" holds only for a rollback of an *unfinished* run (`done: false`). There it costs one hop that ends at the right command, and is not a defect. For a rollback of a *completed* run the retry names `run`, which is M1.
2. **Unquoted `--session`** (261024-1005, migrate command). `shellWord()` (`hooks/migrate.ts:166`) serves `command()` (`:170`), `retry()` (`:937`) and the preconditions aside (`:538`). The test runs the named `repair --list --session '<home>/my own'` through `/bin/bash -c` and gets exit 0 with `blocking>0`. It was red on ac94c494, where the path was unquoted. **Met.** On the second deliberate leave-alone: `:826` `` `--session ${session}.stale-…` `` is a template with a `…` placeholder the user must fill in. It is not a command that can be pasted, so it is not a defect. Quoting the stem would still help a user whose path holds a space.
3. **Five install-documentation statements** (261024-1005, the 13.3.4 install pass). `install.sh:27-30` no longer says every release is tagged. `README.md:30` states the gap without a list. The launcher `--update` line (`install.sh:136`) and `README.md:21` both read "re-install the head of main into ~/.fusion". `git grep 'Problem 1[0-9]'` outside the workbench returns nothing. `README-agents.md` step 4 cites `260816-1707_*_which-install-path-is-the-authoritative-one-for-end-users.md`, and that decision exists in the workbench. The 13.3.5 help sentence now says "ends the fence and settles the record; the store stays under JSON control". `bash -n install.sh` exits 0. **Met.**
4. **catalog/README.md** (261024-1005, catalog). The workflows row names no count and points to `ls workflows`. Its `entry.v1.json` description matches `catalog/workflows/entry.v1.json` `status` ("request 76, not yet accepted by Prior"). The rows for `schema-cases.test.ts` and `testdata/*-schema-cases.v1.json` are present, and `adapters/prior/fusionmodule/internal/steps/schema_cases_test.go` exists. `cd catalog && npm test` gives 225 passed at 2a9f4a72. **Met.**

## Measured, not taken from the commit messages

- **stampBare 12 -> 11.** The gate asserts `toEqual(BASELINE)` (`reference-resolution-lint.test.ts:528`), so the value is exact, not an upper bound. The test passes at 2a9f4a72 with `{2090, 378, 11}`, which makes 11 a measured value.
- **Surface-growth golden.** `wc -c skills/help/SKILL.md` = 17206 and `wc -l migrate.test.ts` = 860 match the golden. `surface-growth-bound.test.ts` passes (12/12).
- **dist.** `node scripts/build.mjs` in a clean worktree at 2a9f4a72 leaves `git status` clean, so `hooks/dist/migrate.js` is the build of `hooks/migrate.ts`.

## Release coherence (2a9f4a72)

- `.claude-plugin/plugin.json` 13.3.6. The `install.sh:29` and `README.md:30` pin examples are `tags/v13.3.6`. The marketplace clone `marketplace.json` fusion `version` is 13.3.6 (2d6cdb5). `v13.3.6` peels to 2a9f4a72 and is on origin, and `heads/main` on origin is 2a9f4a72.
- Help update paragraph (`skills/help/SKILL.md:89`). The label "Coming from 13.0.0 to 13.3.5" follows the convention of the previous one, which named the prior version. 13.3.6: "quotes it so it pastes" is true where the path needs quoting, per point 2. "before any run is recorded, the named retry is `run` again" is true. The sentence leaves out the `done` case of M1 but states nothing false. 13.3.5: true against `endLeftFence`. 13.3.4: "exit 7 names a command that sends the request again" is literally true: every named retry resends the unanswered `inspect`. What that command then does is M1.

## Observations not filed

- `hooks/migrate.ts:967` now calls `readState(session)` in the exit-7 handler for every subcommand. A `state.json` that does not parse would turn an exit 7 from `survey` or `repair --list` into the internal-fault exit 3. `writeState` writes through a temp file and `rename`, so this needs outside damage to the file. Noted, not filed.

## Recommended sequencing

Nothing blocks 13.3.6. M1 goes into 13.3.7. It sits in the same two functions the closed issue touched, so one test pair pins both.
