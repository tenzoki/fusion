Churn and cross-file critical warnings latch permanently and never reset

---

`totalChanges` in `churn.json` and `pingBackCount` in `cross-file.json` are
monotonic for the life of a project. Once any single file crosses
`totalChangesCritical` or `pingBackCritical`, `churn_critical` and
`cross_file_critical` fire on every subsequent write to any file, for ever.
Nothing in the tree resets either counter.

---

Context.

`hooks/lib/churn.ts:107-132` resets the per-session counter after two hours
(`SESSION_MAX_AGE_MS`, `hooks/lib/churn.ts:105`), but `stats.totalChanges` at
`hooks/lib/churn.ts:127` only ever increments. `analyzeChurn` then re-checks
that permanent total against `totalChangesCritical` on every call
(`hooks/lib/churn.ts:178`), so a file with fifteen lifetime changes is reported
as critical whenever any file is written.

Cross-file is worse: it has no session concept at all. `recordEdit`
(`hooks/lib/cross-file.ts:122-153`) only increments, `analyzeCrossFile`
(`hooks/lib/cross-file.ts:169-174`) only compares, and `resetCrossFile`
(`hooks/lib/cross-file.ts:200-208`) has no caller anywhere in the repository —
not in `hooks/`, not in `bin/`, not in `skills/`, not in the tests. The
function's own docstring calls it a checkpoint "after a commit indicates
progress"; no commit path ever invokes it.

The effect is measurable in this repository's own log. The composition recorded
in `260805-1859_o` reads:

    1182 churn_warning       1166 churn_critical
    1139 cross_file_warning  1164 cross_file_critical
      41 guard_block           19 guard_halt

Out of 11,142 lines, 2,330 are the two critical types. Twenty-one percent of the
guard's event log comes from two counters that steer no branch: `analyzeChurn`'s
result is consumed only by the emit loop at `hooks/tracker.ts:432-448`, and
`analyzeCrossFile`'s only by `hooks/tracker.ts:458-474`. Neither reaches
`block`, `recordBlock`, `raiseHalt` or the hook response.

Two consequences beyond log size. The dashboard's warnings panel holds thirty
rows (`260802-2232_c`), so a permanently-firing critical pushes real
`guard_block` and `guard_halt` rows off it. And the warning loses its meaning as
a signal: a level that is always on reports nothing about the current session,
which is the question `agents/orchestrator.md:113` asks the churn file at Setup.

This issue is the mechanism behind the numbers in `260805-1859_o`, which
proposes rotation and a quieter `tracker_record`. Those treat the volume. This
one treats the cause.

---

Severity: Medium. No enforcement is affected, by construction — both counters
are observation-only per `README-hooks.md`. The cost is a permanently degraded
signal, a buried warnings panel, and a fifth of the event log.

Fix direction: one decision precedes the fix. Either the counters get a reset
boundary (session start, a commit, or an explicit checkpoint that finally calls
`resetCrossFile`), or the total-level thresholds are dropped and only the
session-level ones survive, or cross-file is removed outright. The analysis
`shared/analyses/260809-1101-guard-support-layer.md` notes that cross-file has no
reader outside its own accumulation, which makes removal a smaller change than
repair.

Cross-references:
`shared/analyses/260809-1101-guard-support-layer.md` (finding 1, target C3);
`circles/260801-1244-guard-rules-write/issues/260805-1859_o_das-guard-event-log-waechst-unbegrenzt-und-sein-groesster-schreiber-liefert-null-information.md`;
`circles/260801-1244-guard-rules-write/issues/260802-2232_c_advisory-rows-share-the-30-row-warnings-panel-and-can-bury-blocks.md`;
`README-hooks.md` (Churn Detection).

---

**Reconciliation 260809-1651 (reconciler, domain `code`) — stays `_o_`. Untouched by the defect round.**
The six commits `451a07e..fb262d8` touch `hooks/tracker.ts`, `hooks/lib/protected-snapshot.ts`, `hooks/lib/git-branch-guard.ts` and the new `hooks/lib/reverted-copy.ts`. `hooks/lib/config.ts`, `hooks/lib/churn.ts`, `hooks/lib/cross-file.ts` and `hooks/lib/escalation.ts` are not in the diff, so every line this record cites still reads as filed and its acceptance criteria are unmet.
