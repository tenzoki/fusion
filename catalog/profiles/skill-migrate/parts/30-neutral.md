
**The question to migrate.** When the four cut rows (`package-live`, `package-terminal`, `record-live`, `record-closure`) are all 0, say no record is converted: terminal records stay as they are, nothing is rewritten, and the run writes its frozen plan, its receipt and the manifest. Once `blocking=0`, say first: *every installation that writes this workbench must be on 13.0.0 or later before it writes again (13.2.0 to roll back or re-run a migration that converts no record); nothing detects a checkout that does not update.* Then ask once:

> This workbench is ready to move to the new JSON format. A full backup outside the workbench, taken before the first repair or now, stands first; the move runs in chunks and can be rolled back.
> 1. Migrate now.
