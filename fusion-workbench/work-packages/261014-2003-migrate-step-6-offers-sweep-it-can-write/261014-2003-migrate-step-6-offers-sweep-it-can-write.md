# /fusion:migrate Step 6 offers a citation sweep it can actually write

## Directive

Filed on the user's word of 2026-10-14 in chat, choosing "Auf dein Wort ein Arbeitspaket für den Fix des Migrations-Issues anlegen". The work is the fix of `261014-0830-migrate-step-6-runs-the-citation-sweep-write-on-a-tree-its-own-guard-refuses.md`: Step 6 of `skills/migrate/SKILL.md` runs the sweep's `--write` straight after Step 4's staged renames, which the sweep's own guard refuses with exit 4, and a re-run after the commit reaches `FOUND=0` and never offers Step 6 again. Fix direction and acceptance are the issue's. Prior, relayed by the user, requires a reproduction and a regression test to belong to the fix. krk shows the consequence on a migrated consumer: 244 citations still name `circles/` paths. No affected migration run is pending, as far as the user knows.

## Closure, 2026-10-15

Closed `done` by the orchestrator on the user's word. Commit range `313134ed..8ce3a44d`: the reproduction, the skill change, the regression cases, the docs, the issue resolved and closed, release 13.1.2 (`5289407a`), and the closing review (`8ce3a44d`). The closing review `261015-1310-reviewer-closing-pass-over-the-migrate-step-6-package.md` covers `313134ed..5289407a`, verdict revise: the fix holds, and five issues stand as follow-on work in this container, one high (Step 7 reads a JSON-controlled workbench with no local migration session as unmigrated), two medium, two low. The plan's six stop conditions were put to the user and all hold, with two measured facts stated beside them: the `reference-resolution-lint` baseline was re-approved twice, which is not a growth bound, and the hook suite carried one red test, the pre-existing `workbench-citation-lint`.
