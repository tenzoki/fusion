# /fusion:migrate: the landed-cell docs drop the stale-record condition every landedFence caller applies

## Directive

Filed on the user's word of 2026-10-17 in chat. Offered the option "Das Issue als kleines Paket im Automode beheben (13.1.10)", the user answered "1". The work is the low issue `261017-1049-migrate-landed-cell-docs-drop-the-stale-condition-so-an-interrupted-rollback-meets-their-premise.md`, filed by the closing review of `261017-1026-migrate-landed-cell-docs-reset-wording`: the clauses 13.1.9 reworded in the `bin/fusion-migrate` header and the `migrate.ts` row of `README-hooks.md` no longer carry the condition that the record reads stale, which every caller of `landedFence` in `hooks/migrate.ts` applies, so an interrupted rollback over a legacy tree (record current) meets their premise while the helper names no chunk there. Fix direction and acceptance are the issue's. The new wording is checked against every caller of `landedFence` before it is written, so this fix does not open a third round. Docs only: no condition, message or exit code moves. Released as fusion 13.1.10, the marketplace entry edited before anything is pushed.

The user asked for this item to run in mode autonomous, in the answer quoted above.
