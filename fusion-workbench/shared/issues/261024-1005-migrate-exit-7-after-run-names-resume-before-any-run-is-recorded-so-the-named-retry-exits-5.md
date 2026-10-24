migrate: an exit 7 met by `run` before its record is written names `resume`, and the named retry exits 5
---
`retry()` in `hooks/migrate.ts` maps `run` to `resume` unconditionally, but `run` sends two codec requests (`inspect` in `preconditions`, the `migration survey` in `survey`) before `writeState` records anything. An unknown outcome there names a command that cannot act.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261023-1847-migrate-exit-7-retry-names-resume-or-rollback-whatever-subcommand-met-the-unknown-outcome.md (closed; this is the residual of its fix); commit 408bd58e

**Evidence.** `hooks/migrate.ts` `function retry`: `if (sub === "run" || sub === "resume") return "resume";`. `function run`: `preconditions(wb, session)` calls `inspect(wb)`, then `survey(wb)`, and only the last statements build `s` and call `writeState(session, s)`. `function resumeRun` starts with `recorded(wb, session)`, which throws `no run is recorded in <session>` (exit 5).

Reproduced at 8280c372 on a scratch copy of the plugin whose codec stand-in exits 9 on `op: inspect`, over `codec/fixtures/legacy-v12/workbench`:

```
fusion-migrate: the outcome of inspect (operation -) is unknown: ... `bin/fusion-migrate resume --session <dir>` sends the same request again.
run exit=7
fusion-migrate: no run is recorded in <dir>
resume exit=5
```

With a rolled-back record kept in the session (`run` proceeds when `previous.rolled_back`), the same miss names `resume`, which answers "is being or was rolled back; rollback finishes that": also the wrong way.

The same claim stands in three texts: the `retry` doc comment ("`resume` for a run, which only `resume` drives on"), the exit-7 line of `bin/fusion-migrate`'s header ("`resume` after `run` or `resume`"), and `skills/help/SKILL.md` `### 4. Update`, 13.3.4 sentence ("exit 7 names the command that met it"). The 408bd58e test kills `run` at `phase: apply, chunk: 1`, after the record is written, so it cannot see this.

**Fix direction.** Decide the retry for `run` from the session's record, not from the subcommand: `resume` when `readState(session)` holds a record that is neither done nor rolled back (a run this call started), else `run` again. Correct the doc comment and the header line to match.

**Acceptance.**
- A test in `hooks/lib/__tests__/migrate.test.ts` kills `run` on `op: inspect` (the stand-in already takes `op`) under a non-default `--session`, asserts exit 7 and that the named command is `bin/fusion-migrate run --session <dir>`, then runs it and gets exit 0. Red on 8280c372.
- The existing `phase: apply, chunk: 1` case still names `resume`.
- `bin/fusion-migrate`'s exit-7 header line and the `retry` comment state the record-based rule.
