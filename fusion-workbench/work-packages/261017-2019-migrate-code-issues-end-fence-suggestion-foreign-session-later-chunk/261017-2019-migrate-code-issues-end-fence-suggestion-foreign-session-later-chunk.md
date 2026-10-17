# /fusion:migrate code: messages suggest an --end-fence that refuses, run reuses a foreign rolled-back session, rollback mistakes a later refused chunk for the first

## Directive

Filed on the user's word of 2026-10-17 in chat. Offered the option "Die migrate-Code-Issues gesammelt als ein Paket angehen: `run` mit fremder Sitzung, `--end-fence` in Meldungen, Chunk-Erkennung bei `rollback`. Den Plan lege ich dir zur Freigabe vor.", the user answered "1". Mode ordinary: the plan is put to the user for approval.

The work is the three open low issues against `hooks/migrate.ts` behaviour:

- `261017-1708-migrate-messages-name-end-fence-as-ending-a-fence-it-then-refuses-to-end.md` (container `261017-1659-migrate-landed-cell-docs-entry-path-conditions`): three messages name `rollback --end-fence` as the way out in cells where that command then refuses.
- `261017-1717-migrate-run-reuses-a-rolled-back-session-recorded-for-another-workbench-path.md` (same container): `run` overwrites the `state.json` of a rolled-back session recorded for another workbench path and keeps that session's backup of the other tree. Read from the code, not reproduced; whether it is by design is open.
- `261017-1908-migrate-rollback-treats-a-later-chunk-refused-in-the-same-call-as-the-first-chunk-after-activation.md` (container `261017-1812-migrate-docs-defer-conditions-to-status-and-messages`): `rollback` reads the tree's control state before its chunk loop, so a later chunk refused in the same call reaches the first-chunk handling. Read from the code, not reproduced.

Each is reproduced by a test before it is fixed; one that does not reproduce is reported and closed as not reproduced, not fixed blind. Where a fix needs a choice of behaviour (the second above especially), the plan names the options and the user decides at the plan review. The low comment and doc issues in the same files (`261017-1823-` and `261017-1908-` in container 261017-1812) may ride along where a step already touches those lines; the plan says which. The guard against deleting anything a rollback still needs stays as it is: no fence is removed by the helper beyond what it removes today.

## Set aside

On 2026-10-17 the user stopped the session before approving the plan ("ja, abschließen, ich würde diese fusion version gern mal mit prior und mit claude ausprobieren."). The plan `261017-2030-plan-migrate-code-issues-end-fence-suggestion-foreign-session-later-chunk.md` stays filed and unapproved; nothing was implemented. The item is released, back to open, for whoever takes it up.
