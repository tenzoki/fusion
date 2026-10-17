# /fusion:migrate: the helper header and the README-hooks row still describe the landed-fence cell as chunks that landed "before the reset"

## Directive

Filed on the user's word of 2026-10-17 in chat. Offered the option "Das Doku-Issue als kleines Paket im Automode erledigen", the user answered "1". The work is the low issue `261017-0849-migrate-landed-cell-docs-in-the-helper-header-and-readme-hooks-still-presuppose-a-git-reset.md`, filed by the closing review of `261017-0819-help-13-1-7-credit-and-idlefence-comment`: the `bin/fusion-migrate` header and the `migrate.ts` row of `README-hooks.md` still say the rollback chunks landed "before the reset", where `landedFence` checks no reset. Fix direction and acceptance are the issue's. Docs only: no condition, message or exit code moves. Released as fusion 13.1.9, since the manifest is bumped on every change; this time the marketplace entry reads the new version before anything is pushed.

The user asked for this item to run in mode autonomous, in the answer quoted above.
