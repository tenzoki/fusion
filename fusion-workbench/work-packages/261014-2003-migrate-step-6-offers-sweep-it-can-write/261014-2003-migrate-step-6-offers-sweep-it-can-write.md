# /fusion:migrate Step 6 offers a citation sweep it can actually write

## Directive

Filed on the user's word of 2026-10-14 in chat, choosing "Auf dein Wort ein Arbeitspaket für den Fix des Migrations-Issues anlegen". The work is the fix of `261014-0830-migrate-step-6-runs-the-citation-sweep-write-on-a-tree-its-own-guard-refuses.md`: Step 6 of `skills/migrate/SKILL.md` runs the sweep's `--write` straight after Step 4's staged renames, which the sweep's own guard refuses with exit 4, and a re-run after the commit reaches `FOUND=0` and never offers Step 6 again. Fix direction and acceptance are the issue's. Prior, relayed by the user, requires a reproduction and a regression test to belong to the fix. krk shows the consequence on a migrated consumer: 244 citations still name `circles/` paths. No affected migration run is pending, as far as the user knows.
