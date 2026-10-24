migrate: `run` says "is being rolled back" over a record whose rollback's `maintenance begin` was refused, where 13.3.6 answered the true no-op
---
`rollback` writes `s.rollback` before it sends `maintenance begin`. When the codec refuses that begin (exit 8, `conflict/maintenance-active`), the field stays set although no fence of this record stands and no chunk was rolled back. 951f27e9 reads `s.rollback !== null` in `run` as "a rollback in flight": `run` now exits 5 with "<id> is being rolled back; `bin/fusion-migrate rollback` finishes that". Neither half holds. Nothing is being rolled back, and the named `rollback` cannot finish, because the foreign fence's stored answers are work since the plan, which the codec's audit refuses in every later rollback. At 2a9f4a72 the same `run` answered `result=no-op` "verified", which was true: the tree is under JSON control, verified, with no fence.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261024-1222-migrate-run-over-a-record-whose-rollback-is-in-flight-answers-no-op-verified-and-the-13-3-6-exit-7-retry-now-routes-there.md (closed; this is a residual of its fix); commit 951f27e9; 261024-1425-reviewer-post-release-pass-over-v13-3-7.md

**Evidence.**

- `hooks/migrate.ts` `function rollback`: `if (s.rollback === null) { s.rollback = { begin_id: randomUUID(), end_id: randomUUID() }; writeState(session, s); }`, then `if (i.state === "json-control" && !stored(wb, s.rollback.begin_id)) send(wb, { op: "maintenance", ..., action: "begin" });`. A refusal there propagates outside the `try` and leaves the field written. This has been the case since 4b141b07.
- `hooks/migrate.ts` `function run` (951f27e9): `if (previous && !previous.rolled_back && previous.rollback !== null) throw new Stop(EXIT.precondition, `${previous.migration_id} is being rolled back; ${command(wb, session, "rollback")} finishes that`);`.
- The `stale()` doc comment in the same file already says the field is not proof of a rollback in flight ("after one undo attempt the session alone looks like a rollback in flight"). That comment covers records from before 13.1.4. The begin path above still writes such a record.
- Reproduced in a scratch worktree at dfcc9fc5, using the suite's `killPlugin` and `project()` under `--session <home>/own`:
  1. `run`: exit 0.
  2. A foreign fence, sent through the real bundle: `{op:"maintenance",action:"begin"}`, ok.
  3. `rollback`: exit 8, `maintenance begin refused: conflict/maintenance-active`. `state.json` now holds `rollback: {begin_id, end_id}`.
  4. The foreign fence ended through the bundle, ok. `status` reads `state=json-control fence=- done=true rolled_back=false record=current`.
  5. Plain `run`: exit 5, "migration-… is being rolled back; `bin/fusion-migrate rollback --session …` finishes that".
  6. The named `rollback`: exit 8, `conflict/after-state-changed: the stored answer <foreign begin> ... is neither in the baseline ...`. It ends its own fence, and the store stays under JSON control.
  7. `run` killed on `op: inspect`: exit 7, naming `rollback`, with the same outcome.
- The same probe against 2a9f4a72's `hooks/dist/migrate.js` gives this: plain `run` exits 0 with `result=no-op`; `run` killed on `op: inspect` names `run`, which also exits 0 with `result=no-op`.

`resumeRun` ("is being or was rolled back") and `current()` (`claim` "a rollback in flight") make the same reading of the field. Neither changed in this range.

**Fix direction.** Make the field mean what its readers say it means, at its writer. In `rollback`, when `maintenance begin` is refused and `begin_id` is not stored, set `s.rollback` back to `null` and write the state before rethrowing. An unanswered begin (exit 7) keeps the field, because that begin may have landed. Alternatively, word the `run` refusal so it does not claim a rollback in flight, for example "a rollback of <id> was begun and is not settled". The first fix also makes the `resumeRun` and `current()` wording true for new records.

**Acceptance.**
- A test in `hooks/lib/__tests__/migrate.test.ts` completes a `run`, begins a foreign fence through the bundle, gets exit 8 `maintenance-active` from `rollback`, and ends the foreign fence. It then asserts that `run` makes no claim that a rollback is in flight: either exit 0 `result=no-op`, or a message without "is being rolled back". Red on dfcc9fc5.
- The two 261024-1222 tests and the rest of `migrate.test.ts` still pass. `cd hooks && npm test` exits 0.
