migrate: the exit-7 retry names `resume` or `rollback` whatever subcommand met the unknown outcome
---
Since `e1fba90e`, `main` in `hooks/migrate.ts` words the retry for every exit-7 Stop: "`resume` (or `rollback`, if that was the command) sends the same request again". `main` holds `sub` and the flags, but the clause names those two commands whatever was run. For `survey`, `status`, `repair` and `set-aside`, the request that went unanswered is a read (`migration survey` or `inspect`), and `resume` does not send it again. If the session records a run in flight, `resume` drives it and writes, which a read-only call never asked for. For `rollback --end-fence`, the request was `maintenance end`, and `rollback` without the flag sends a rollback chunk instead. This is pre-existing (the 13.3.2 `send` text said the same), but the 13.3.3 move made the fix local to `main`. Severity Low.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence** (at `8530c67c`):

- `hooks/migrate.ts` `main`, the catch around the subcommand dispatch. The exit-7 clause is fixed to `command(wb, session, "resume")` / `command(wb, session, "rollback")`.
- `survey` sends `{ op: "migration", phase: "survey" }`, which carries no operation id. `inspect` sends `{ op: "inspect" }`. `status`, `setAside`, `current` and `preconditions` all call `inspect`, and none of these requests has a recorded id that a retry could resend.
- `endLeftFence` → `endRollbackFence` sends `maintenance end` under `s.rollback.end_id`. Only `rollback --end-fence` resends that request.
- `bin/fusion-migrate` header, exit 7: "`resume` (or `rollback`, if that was the command), with the same --session, sends the same request again". This also only holds for `run`/`resume`/`rollback`.

**Fix direction:** in `main`, word the clause from `sub` and its flags:
- `run` / `resume`: `resume`.
- `rollback`: `rollback`, keeping `--end-fence` when given.
- A read-only subcommand: "run the same command again", built with `command(wb, session, <sub and flags>)`.

Update the header's exit-7 line to match. Exit codes unchanged.

**Acceptance test:**
- A `migrate.test.ts` case cuts the codec (the existing `killPlugin()` rule) during `status` and during `rollback --end-fence`.
- On `status`, it expects the exit-7 stderr to name `status` and not `resume`.
- On `rollback --end-fence`, it expects the stderr to name `rollback --end-fence`.
- The existing `run` cut case still names `resume` with `--session`.
