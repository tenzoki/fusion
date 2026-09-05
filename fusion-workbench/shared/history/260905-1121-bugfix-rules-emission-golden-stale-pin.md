# Bugfix: stale golden pin for `rules/user-facing-output.md` size

**Date:** 2026-09-05 11:21
**Status:** Complete
**Trigger:** User report — one pinned inventory stale after an on-disk rule-file edit

## Error

`rules-emission-golden.test.ts > matches the checked-in golden` failing (824/825 other tests green). The golden fixture at `hooks/lib/__tests__/fixtures/rules-emission.golden` pinned `user-facing-output.md` at 9155 bytes in every block that draws it as a conditional emission (`orchestrator`, `curator`, `editor`, `playmaker`, `reconciler`, `shaper`), plus each block's total.

## Root Cause

`rules/user-facing-output.md` grew 9155 -> 10884 bytes as a deliberate, already-applied edit (not part of this task — confirmed on disk with `wc -c rules/user-facing-output.md` = 10884). The golden fixture `hooks/lib/__tests__/fixtures/rules-emission.golden:46,53,60,81,99,116` still pinned the old 9155-byte measurement, so the golden test's byte-for-byte comparison against live `bin/fusion-rules` output diverged. This is the documented, expected consequence of `rules-emission-golden.test.ts`'s design ("HARD — the GOLDEN... fails on any change... meant to be regenerated whenever a change is deliberate") — not a code defect.

## Fix

Regenerated the fixture from live measurement using the documented one-command procedure (`rules-emission-golden.test.ts` `## Updating the golden`, lines 170-184):

```
cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts
```

This rewrites `hooks/lib/__tests__/fixtures/rules-emission.golden` from live output and then fails on purpose (`was not run with the update flag left switched on`), forcing a second run without the flag to confirm green.

| File | Change |
|------|--------|
| `hooks/lib/__tests__/fixtures/rules-emission.golden` | Regenerated. The six blocks that draw `user-facing-output.md` (`orchestrator`, `curator`, `editor`, `playmaker`, `reconciler`, `shaper`) move `user-facing-output.md 9155` -> `user-facing-output.md 10884`, and each block's own `total` moves up by the same +1729 bytes. No other line changed. |

No source file, rule file, `agents/*.md`, `skills/*/SKILL.md`, or hook runtime code was touched. `RULE_BASELINE` in `hooks/lib/__tests__/rules-emission-golden.test.ts` was not edited (confirmed: `git diff --stat` on that file is empty) — per the file's own header, regenerating the golden never moves the baseline; a baseline moves only at the two events in `## Re-baselining`, neither of which occurred here.

## Verification

- [x] Original error resolved — `rules-emission-golden.test.ts` green (12/12 tests) on a plain re-run without `UPDATE_RULES_GOLDEN`
- [x] Full test suite passes — `cd hooks && npm test`: 48 test files, 825 tests, all green
- [x] No regressions introduced — the only diff is the six lines named above; a pre-existing, unrelated non-failing report (`playmaker` role-specific budget: `circle-records.md`, `backlog-entries.md`, `decision-record-examples.md` growth) still prints as it did before this change, and is explicitly non-blocking (`REPORTED, NEVER FAILING`) per the same file's header

Both blocking numbers the file's header calls out, `RELEASE_CAP` and `DRIFT_CEILING`, pass (all 12 sub-tests in the suite are green).

## Unrelated Issues Found

None filed. The pre-existing playmaker role-text budget report (circle-records.md/backlog-entries.md/decision-record-examples.md growth) already prints as designed and is out of scope for this task.
