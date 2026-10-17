# /fusion:help credits 13.1.7 with a refusal 13.1.6 already had, and the idleFence comment still names a reset as the cell's cause

## Directive

Filed on the user's word of 2026-10-17 in chat. Offered the option "Beides als kleines Paket im Automode erledigen (13.1.8)", the user answered "1". The work is the low issue `261017-0000-help-13-1-7-note-credits-the-release-with-a-proposal-check-13-1-6-already-had.md`, filed by the closing review of `261016-2328-migrate-landed-fence-wording-and-unverified-proposal-branch`, plus that review's unfiled note: the `idleFence` doc comment in `hooks/migrate.ts` still says a rollback that landed chunks "then met a git reset", describing the cell by its usual cause where the code checks no reset. Fix direction and acceptance for the first are the issue's; for the second, the comment states what the code checks and names a reset only as one way into the cell. No behaviour changes: no condition, message or exit code in `hooks/migrate.ts` moves. Released as fusion 13.1.8.

The user asked for this item to run in mode autonomous, in the answer quoted above.
