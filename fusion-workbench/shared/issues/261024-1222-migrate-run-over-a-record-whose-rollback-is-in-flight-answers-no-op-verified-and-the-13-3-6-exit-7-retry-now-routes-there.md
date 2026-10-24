migrate: `run` over a record whose rollback is in flight answers `result=no-op` "verified", and since 13.3.6 the exit-7 retry after `run` routes there
---
After a completed run, a `rollback` cut part-way leaves a record with `done: true`, `rolled_back: false` and `rollback` set, over a legacy tree with the rollback fence standing. `run` on that record exits 0 with `result=no-op` and "the session records this migration as verified". 046980a2 made the exit-7 retry after `run` name `run` for any `done` record, so the named retry now lands on that false success, where at 8280c372 it named `resume`, which exits 5 and points at `rollback`.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261024-1005-migrate-exit-7-after-run-names-resume-before-any-run-is-recorded-so-the-named-retry-exits-5.md (closed; this is a residual of its fix); commit 046980a2; 261024-1222-reviewer-post-release-pass-over-v13-3-6.md

**Evidence.**

- `hooks/migrate.ts:555` (`function run`, since e7cb55c03): `if (previous?.done && !previous.rolled_back) return [..., "result=no-op", "note=nothing was sent: the session records this migration as verified"];`. It does not check `previous.rollback`. `resumeRun` at `:600` does (`s.rolled_back || s.rollback !== null` refuses and names `rollback`).
- `hooks/migrate.ts:933` (`function retry`, 046980a2): `if (sub === "run") return s !== null && !s.done && !s.rolled_back ? "resume" : "run";`. A `done` record with a rollback in flight takes the `run` branch.
- Reproduced on a scratch worktree at 2a9f4a72 with the suite's `killPlugin` stand-in: `run` (exit 0), then `rollback` killed at `phase: rollback, chunk: 2` (exit 7). `status` then reads `state=legacy`, `fence=<id>`, `done=true`, `rolled_back=false`, `record=current`. Then:
  - plain `run`: exit 0, `result=no-op`, `note=nothing was sent: the session records this migration as verified`.
  - `run` with the stand-in killing `op: inspect`: exit 7, "`bin/fusion-migrate run` sends the same request again"; that command exits 0 with the same no-op.
  - The same probe against ac94c494 (pre-fix) names `bin/fusion-migrate resume`, which exits 5: "is being or was rolled back; `bin/fusion-migrate rollback` finishes that".
- Two texts state the rule this misses. The `bin/fusion-migrate` exit-7 header says "else `run` again (the outcome came before the record was written)", which is false for a `done` record. The release message of 2a9f4a72 says "a recorded run still names resume", which is false for a recorded run that completed and whose rollback is in flight.

`/fusion:migrate` Step 7 does not follow the named command on exit 7. It runs `status` and asks, so the skill path is not affected. A user who runs the helper directly is.

**Fix direction.** In `run`, take the no-op only when `previous.rollback === null`. A record with a rollback in flight refuses (exit 5) and names `rollback`, as `resumeRun` does. In `retry`, name `rollback` after `run` when the record has `rollback !== null && !rolled_back`. Correct the header line and the `retry` comment to the rule the code keeps.

**Acceptance.**
- A test in `hooks/lib/__tests__/migrate.test.ts` completes a `run`, cuts its `rollback` at `phase: rollback, chunk: 2`, then asserts that plain `run` does not exit 0 and that its message names `rollback`. Red on 2a9f4a72.
- The same state with `run` killed on `op: inspect` exits 7 and names a command that, when run, does not answer `result=no-op`. Red on 2a9f4a72.
- The two new tests from 046980a2 and the `phase: apply, chunk: 1` case still pass. `cd hooks && npm test` exits 0.
