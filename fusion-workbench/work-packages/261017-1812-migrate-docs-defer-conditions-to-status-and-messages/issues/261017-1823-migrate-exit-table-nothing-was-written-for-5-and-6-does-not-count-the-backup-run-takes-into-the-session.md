# migrate: the exit table's "nothing was written" for 5 and 6 does not count the backup `run` takes into the session

---
The `bin/fusion-migrate` header's exit table says of 5 "Nothing was written by this call." and of 6 "nothing was written". `run` takes the backup into the session before it surveys. On a fresh session it then writes the session's `backup/` and `backup.sha256`, and it can still stop with exit 6 (blocking findings) or with exit 5 (a narrative changed between survey and composition, in `serialise`). No workbench file is written before either exit, so the sentences hold for the workbench and fail for the session.
---
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261017-1823-plan-migrate-docs-defer-conditions-to-status-and-messages.md`

**Evidence (read at `68ff12b7`, not reproduced).**
- `hooks/migrate.ts` `run`: `ensureBackup(wb, session)` runs right after `preconditions`. `survey`, `compose` and `serialise` follow it. The blocking refusal (exit 6) and the `serialise` refusal "changed between survey and composition" (exit 5) both come after it.
- `hooks/lib/legacy-repair.ts` `ensureBackup`: where `backup.sha256` is absent it creates the session directory, copies the workbench into `backup/` and writes `backup.sha256`.
- Every other exit-5 site in `hooks/migrate.ts` comes before the first write of its call.

**Reach.** Description only. A reader who relies on "nothing was written" to decide whether a session directory exists finds one.

**Fix direction.** Say what holds: no workbench file was written by the call (the session backup aside). Or drop the clause and leave it to the messages, most of which already say what they did not write. Keep new words unbackticked. No code change. The 13.1.12 package (`261017-1823-plan-migrate-docs-defer-conditions-to-status-and-messages.md`) cuts the refusal list on the exit-5 line but leaves this sentence unchanged, so it can be decided on its own.

**Acceptance.** Neither the exit-5 line nor the exit-6 line claims that nothing was written where `run` has written the session backup.
