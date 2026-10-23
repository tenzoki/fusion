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

## Taken up

On 2026-10-23 checkout `114caf11` (teal-jetty) claimed the item on the user's word in chat: "übernimm 1 im automode". Mode autonomous on that word: the plan approval, the claim and the finish once the plan is complete are answered by the field.

## Closed

On 2026-10-23 the item closed `done`, outcome `completed`, in session `8b3b7bf5-6951-4e24-abd3-a430445d035b` on checkout `114caf11`. Commit range `3ac7e25e..a6071469`: the three fixes (`a567d299`, `29a96ed1`, `2e5f4277`), the ride-along comment and skill fixes with the nine issues resolved (`0521dc83`), the release commit fusion 13.3.2 (`6b92d484`) and the closing review (`a6071469`, verdict accept, evidence `reviews/261023-1403-reviewer-closing-pass-over-the-migrate-code-issues-package.evidence.json`). Tag `v13.3.2` is on `a6071469`; fusion was pushed before the marketplace (`6a91af6`), and the marketplace cache clone was pulled afterwards. Review coverage since `v13.3.1`: 0 uncovered.

The plan's `## Where this work stops` clauses were not put to the user: under mode autonomous they are answered by the field, and none is marked as failing. Verbatim:

1. Each of the three named issues either has a fix whose test was red before the fix and green after, or is closed as not reproduced with its test kept as a pin. Step reports show which, per issue and per cell.
2. `run` refuses with exit 5, before any write, a rolled-back session whose `state.json` records another workbench path, and names `set-aside --consent`. A rolled-back session of this workbench still starts a new migration.
3. No message of `hooks/migrate.ts` suggests `rollback --end-fence` except where `endFenceEnds` holds for the record it names. No refusal from `current` suggests `set-aside --consent` while a fence or intent stands that the same message names no admitted step to end first.
4. `endLeftFence` unlinks `.json-state/maintenance.json` under the same conditions as at `30fdcccd`, and `setAside` renames under the same conditions.
5. A rollback chunk refused after another chunk landed in the same call exits 8 with the codec's refusal and reaches no `refusedFirstChunk` text and no `maintenance end`.
6. `hooks/dist/migrate.js` is the build of the committed `hooks/migrate.ts`, and `committed-dist` is green on the release commit.
7. The four comment lines of `bin/fusion-migrate` and the `## The session` sentence read as step 7 says, and `skills/migrate/SKILL.md` is smaller than 29 752 bytes.
8. `README-hooks.md`, `docs/upgrading-to-v13.md` and `docs/upgrading-to-v12.md` are byte-identical to `30fdcccd`, and no sentence in them quotes a changed message.
9. Every growth bound is green with the golden regenerated. No baseline or head-room constant was edited. `reference-resolution-lint` reads 2089/377/11, unedited, and the full suite is green, `workbench-citation-lint` included.
10. The help paragraph reads "Coming from 13.0.0 to 13.3.1" and "13.3.0 to 13.3.2 need no migration", carries a 13.3.2 sentence saying what changes, and the section still holds three install-from paragraphs.
11. Before anything is pushed, `plugin.json`, both pin examples and the marketplace working clone's `marketplace.json` read 13.3.2.
12. The release commit states the `bin/fusion-review-coverage --since v13.3.1` result.
13. Before the tag `v13.3.2` is created, a closing review of the range since `v13.3.1` is filed in this package's reviews store, and its verdict is accept, or every finding it rates above Low is answered.
14. The tag `v13.3.2` is on the pushed fusion `main` commit, and the fusion push happened before the marketplace push.
15. After both pushes, the marketplace cache clone has been pulled.

Left open: `issues/261023-1403-migrate-unknown-outcome-and-refused-first-chunk-messages-spell-commands-without-the-session-flag.md` (Low, pre-existing, filed by the closing review) and `issues/261017-2028-migrate-repair-apply-and-restore-backup-use-a-session-recorded-for-another-workbench-path.md` (out of this plan's scope).
