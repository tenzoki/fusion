# migrate: `run` reuses a rolled-back session recorded for another workbench path, keeping its backup and repair log, and overwrites its record

---
`status` reports such a session as `record=stale`, and `resume` and `rollback` refuse it, but `run` checks staleness only for a record that is not rolled back. It goes on through its preconditions, keeps the backup and repair log the session already holds, and writes a new `state.json` for this workbench into it. Whether reusing that session is intended is not recorded anywhere this issue found.
---
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261017-1637-migrate-end-fence-landed-clause-promises-the-message-for-a-session-recorded-for-another-workbench-path.md`, `261017-1708-migrate-messages-name-end-fence-as-ending-a-fence-it-then-refuses-to-end.md`

**Observed (read at `0f2e098e`, not reproduced).**
- `hooks/migrate.ts` `stale`: its first line returns "the record is kept for …" when `s.workbench !== wb`, before the rolled-back check on the next line, so `status` prints `record=stale` for a rolled-back record of another path.
- `hooks/migrate.ts` `run`: `current` runs only for a previous record that is not rolled back, and so do the no-op and "a run … is recorded" branches. A rolled-back record of another path therefore reaches `preconditions`, then `ensureBackup`, then the new `writeState`, which replaces that session's `state.json`.
- `hooks/lib/legacy-repair.ts` `ensureBackup` returns at once when the session already holds `backup.sha256`, so the session's existing backup stands as this run's backup. That backup is the tree at the other path when its run began. `compose` and `serialise` read the session's repair log (`actorsFromLog`, the proposal's `repairs`), so that log's rows feed the new proposal too.
- `resume`, plain `rollback` and `rollback --end-fence` refuse the same session at `recorded` ("records X, not Y").

**Uncertain.**
- Whether this is a defect or intended. A rolled-back record of this workbench also keeps its first backup for a second run, and the header's `rollback` entry calls the restore target "the frozen post-repair input". Reusing the backup may be by design for one path and is unexamined for a moved one.
- Whether a moved project's old backup differs from its tree. For the same project moved on disk it may be byte-identical; for a session passed with `--session` from another project it is not, and `restore-backup` would then put that tree back.
- Reach: a session of another path is reached only with an explicit `--session`, because the default session directory is keyed by the real path.

**Fix direction.** Decide whether `run` should apply `recorded`'s path comparison to a rolled-back previous record (refusing with "records X, not Y" or naming `set-aside`), or whether reuse is intended and the docs should say so. A change to the condition needs a `migrate.test.ts` row and the header and README updates that follow it.

**Acceptance.** Either `run` refuses a rolled-back session recorded for another workbench path before any write, pinned by a test, or a recorded decision says reuse is intended and the header's `run` entry states what is kept.
