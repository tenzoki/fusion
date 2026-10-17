# /fusion:migrate: the end-fence docs over-claim for a session recorded elsewhere and for an undo cut mid-chunk

## Directive

Filed on the user's word of 2026-10-17 in chat. Offered the option "Beide Issues jetzt beheben (13.1.11), im Automode", the user answered "1". The work is the two low issues the closing review of `261017-1605-migrate-landed-cell-docs-stale-condition` filed: `261017-1637-migrate-end-fence-landed-clause-promises-the-message-for-a-session-recorded-for-another-workbench-path.md` (rollback's recorded check runs before endLeftFence, so the header and README clauses promise the landed message, and the README the idle-fence one, where a session recorded for another workbench path is refused first) and `261017-1637-migrate-undo-note-names-end-fence-for-an-undo-cut-mid-chunk-where-an-intent-pending-makes-it-refuse.md` (the sentence before the reworded Undo clause promises `--end-fence` where a pending intent makes it refuse). Fix direction and acceptance are the issues'.

This is the fifth round on these sentences, each having found one condition just outside the function the previous round read. So the wording is derived from the whole command path, from the CLI entry through every check that runs before the message, and phrased so that it does not claim more than that path guarantees. Docs only: no condition, message or exit code moves. Released as fusion 13.1.11, the marketplace entry edited before anything is pushed.

The user asked for this item to run in mode autonomous, in the answer quoted above.

## Closure

Closed `done` on 2026-10-17, outcome class `completed`, by the orchestrator in session `3bd9f8b5-e804-461f-868f-a0c46a94a8f9`, the finish answered by mode autonomous. Commit range `5e4fca82..` the closing commit; released as fusion 13.1.11, tag `v13.1.11` on `c239cdd6`, marketplace entry `4979e53`, the cache clone pulled. Order as run: the marketplace entry was edited before any push, fusion `main` and the tag were pushed before the marketplace commit was pushed, and the cache pull came last. The code-implementer stopped once before writing, on a cell the plan had not tested (a rolled-back session recorded for another workbench path, which `run` does not refuse); the plan was revised in place and re-bound (`d8cfe42b`). Both low issues the package was filed for are resolved and closed as fixed (`c239cdd6`). The closing review `261017-1747-reviewer-closing-pass-over-the-migrate-landed-cell-docs-entry-path-conditions-package.md` ran before the tag over `2615df08..c239cdd6`, verdict accept, Not-opened none. The release commit does not state the review-coverage result, the gap the third issue below names. Left open in this container: `261017-1708-migrate-messages-name-end-fence-as-ending-a-fence-it-then-refuses-to-end.md`, `261017-1708-migrate-header-run-entry-lists-its-preconditions-without-the-legacy-state-check.md`, `261017-1717-migrate-run-reuses-a-rolled-back-session-recorded-for-another-workbench-path.md`, `261017-1747-migrate-refusal-claims-except-only-the-legacy-fence-removal-where-end-fence-also-ends-a-json-fence-over-a-stale-record.md`, `261017-1747-migrate-undo-note-environment-bound-covers-only-status-and-refusals-and-omits-a-codec-refusal.md` and `261017-1747-releasing-step-0-names-the-closed-session-log-for-the-review-coverage-result-and-four-release-commits-omit-it.md`.

Stop conditions of the plan, not put to the user under mode autonomous, carried verbatim and none marked as failing:

- `bin/fusion-migrate` differs from `0f2e098e` only in comment lines: the sentence added after "git is required too, and is asked.", the first sentence of the `rollback --end-fence` entry, and the `set-aside` entry.
- The header's idle and landed sentences in the `rollback --end-fence` entry, and the landed sentence of the `**Undo.**` paragraph, are byte-identical to `0f2e098e`.
- The header's `rollback --end-fence` entry is bounded to a session that records this workbench, and the `migrate.ts` row's idle and landed clauses are bounded the same way.
- No sentence of the `**Undo.**` paragraph names `rollback --end-fence` as the way out where an intent is pending.
- `README-hooks.md` differs from `0f2e098e` only in the `migrate.ts` row and the `bin/fusion-migrate` row.
- Every "refused by `run`, `resume` and `rollback`" claim in the edited passages is bounded to a record of this workbench.
- Every exit code, condition and message string in `hooks/migrate.ts` and `bin/fusion-migrate` is unchanged, and `migrate.test.ts` passes unedited.
- In each of the three edited files the multiset of backticked tokens equals `0f2e098e`'s, and `reference-resolution-lint`'s `BASELINE` reads 2061/371/11, unedited, and the lint passes.
- Both issues carry a `Resolved:` line, and the full hook suite ran after the second write with no red beyond the two pre-existing `workbench-citation-lint` findings.
- Every growth bound is green with the golden regenerated, and no baseline, `SKILL_BASELINE` entry or head-room constant was edited.
- The help paragraph reads "Coming from 13.1.10 or earlier" and "13.1.2 to 13.1.11 need no migration", still says "13.1.2 to 13.1.7 each change only", and carries a 13.1.11 sentence saying it changes nothing that runs.
- Before anything is pushed, `plugin.json`, both pin examples and the marketplace working clone's `marketplace.json` read 13.1.11.
- Before the tag `v13.1.11` is created, a closing review of the range since `v13.1.10` is filed in this package's reviews store, and its verdict is accept or every finding it rates above Low is answered.
- The tag `v13.1.11` is on the pushed fusion `main` commit, and the fusion push happened before the marketplace push.
- After both pushes, the marketplace cache clone has been pulled.
- Either step 1 changed the two added passages (the header's `set-aside` entry and the `bin/fusion-migrate` row), or the dispatcher struck them before step 1 ran and step 1's report says so.
