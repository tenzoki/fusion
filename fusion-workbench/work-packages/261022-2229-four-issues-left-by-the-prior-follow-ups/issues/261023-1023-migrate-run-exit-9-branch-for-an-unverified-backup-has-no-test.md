migrate run's exit-9 branch for an unverified backup has no test
---
`f0d06298` split the `catch` around `ensureBackup` in `run()` (`hooks/migrate.ts`) into two branches: `BackupUnverified` to exit 9, any other error to exit 3. The new test covers the exit-3 branch only. No test drives `bin/fusion-migrate run` into exit 9, so a regression that sends an unverified backup to exit 3 (or the reverse) stays green.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261023-1023-reviewer-closing-review-of-the-four-issues-left-by-the-prior-follow-ups.md`, `261022-1806-migrate-run-maps-every-ensurebackup-failure-to-exit-9-including-a-copy-io-error.md`

## Defect

`hooks/migrate.ts` `run`, at `45d40491`:

```ts
if (e instanceof BackupUnverified) throw new Stop(EXIT.backup, `${e.message}; nothing was repaired or migrated, and ${session} holds the copy that failed`);
throw new Stop(EXIT.fault, `backing up the workbench failed: ${(e as Error).message}; nothing was migrated, and ${session} may hold a partial copy`);
```

`hooks/lib/__tests__/migrate.test.ts` at `45d40491` has one exit-9 assertion (`toEqual([9, …])`, in the case "refuses the v11-named twin … and a backup that does not verify stops the first repair"). It drives `repair --apply`, not `run`. The exit-3 case added by `f0d06298` ("an I/O error while run copies the backup is exit 3 …") drives `run`. `run`'s exit-9 branch is the one the skill's `**Run.**` sentence now names ("Exit 5, 8, 9 or 3"), and nothing asserts it.

## Fix direction

Code-implementer. Add one `run` case beside the exit-3 case: seed `<session>/backup/` with a stray file, as the `repair` exit-9 case already does, run `bin/fusion-migrate run --session <session>`, and assert exit 9, stderr containing "does not verify" and "nothing was repaired or migrated", no `backup.sha256`, and an unchanged workbench tree hash. Keep the hook-tests growth bound green by cutting, never by a baseline edit; regenerate `surface-growth.golden`.

## Acceptance

- `cd hooks && npm test` green, the new `run` exit-9 case among them.
- Temporarily deleting the `if (e instanceof BackupUnverified) …` line in `run` turns the new case red (stated in the report, not committed).
