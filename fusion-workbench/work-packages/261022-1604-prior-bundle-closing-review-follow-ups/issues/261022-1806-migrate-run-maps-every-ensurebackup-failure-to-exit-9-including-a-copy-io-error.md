# migrate run maps every ensureBackup failure to exit 9, including a copy I/O error

## Observation

Plan step 7 of `261022-1611-plan-prior-bundle-closing-review-follow-ups.md` gave `ensureBackup` a distinguishable error, `BackupUnverified` in `hooks/lib/legacy-repair.ts`, and made `repair` in `hooks/migrate.ts` map only that error to `EXIT.backup` (9). `run()` in `hooks/migrate.ts` (around lines 501-505, at the step-7 commit) still maps every exception from `ensureBackup` to exit 9, including an I/O error while copying. `bin/fusion-migrate`'s exit table describes 9 as "the backup does not verify", which a copy fault is not. Reported by the step-7 executor as outside its scope; not reproduced by hand.

## Fix direction

Map only `BackupUnverified` to 9 in `run()` as `repair` now does, and any other `ensureBackup` exception to `EXIT.fault` (3) with its message; add a test whose copy fails with an I/O error and asserts exit 3. Executor: code-implementer.
