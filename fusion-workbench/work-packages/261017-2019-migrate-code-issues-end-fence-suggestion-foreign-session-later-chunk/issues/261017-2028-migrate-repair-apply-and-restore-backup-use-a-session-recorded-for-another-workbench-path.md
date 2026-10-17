# migrate: `repair --apply` and `restore-backup` use a session whose record names another workbench path, and a session with a backup and no record names no path at all

---
`run`, `resume` and `rollback` compare the session's recorded workbench path with this one (`recorded`, `stale`). `repair --apply` and `restore-backup` read no record. With `--session` naming a session whose `state.json` records another path, `repair --apply` edits this tree with no backup of it, because `ensureBackup` returns where `backup.sha256` exists, and `restore-backup --consent` puts the other tree back over this one. A session that holds a backup from a repair but no `state.json` records no path, so no check could tell.
---
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261017-1717-migrate-run-reuses-a-rolled-back-session-recorded-for-another-workbench-path.md`

**Evidence (read at `ef64ae79`, inference from the code, not reproduced).**
- `hooks/lib/legacy-repair.ts` `ensureBackup`: its first line returns when the session holds `backup.sha256`. `applyRepair` calls it before its first write, then writes the edit into the tree and appends to the session's repair log.
- `hooks/migrate.ts` `repair`: no `readState`, no path comparison.
- `hooks/migrate.ts` `restoreBackup`: checks the backup's tree hash, the manifest, the fence, plan files and consent, and then replaces every entry of the workbench but `.json-state/` with the backup. It reads no `state.json`.
- The backup carries no path. `state.json` records one only once `run` has written it.

**Reach.** Only with an explicit `--session` naming a session of another workbench, because the default session directory is keyed by the real path. `restore-backup` also needs `--consent`.

**Fix direction.** Decide first whether a backup is bound to the path it was taken from (for example, a path file written beside `backup.sha256` by `ensureBackup`), since without one the backup-only session cannot be checked. Then apply one comparison to every subcommand that uses the session's backup or repair log for this tree.

**Acceptance.** `repair --apply` and `restore-backup` refuse, before any write, a session recorded for another workbench path, each pinned by a test, or a recorded decision says why not.
