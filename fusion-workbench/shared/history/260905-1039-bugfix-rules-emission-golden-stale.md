# Bugfix: stale rules-emission golden after conventions-file shrink

**Date:** 2026-09-05 10:39
**Status:** Complete
**Trigger:** User report (test failure identified in advance, root cause pre-diagnosed)

## Error

`hooks/lib/__tests__/rules-emission-golden.test.ts > matches the checked-in golden, agent by agent` failed. 824 of 825 tests in `npm test` passed.

## Root Cause

`rules/fusion-workbench-conventions.md:1` (the `_a_` row of `## State Markers — decisions`) was deliberately edited: the sentence "Cite the path as it stands, whether that is inside a Circle or in `shared/`." was replaced with a pointer to `## Filename Patterns`. The file shrank from 52 629 to 52 613 bytes (-16 bytes). `hooks/lib/__tests__/fixtures/rules-emission.golden` pins that file's byte size, per agent block, plus each block's running total, so the golden went stale the moment the file changed — it is a fixture that must be regenerated after every deliberate edit to an always-on rule file, not a defect in the edit itself.

## Fix

Regenerated the golden through the documented path (`hooks/lib/__tests__/rules-emission-golden.test.ts`, header comment): `cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts`, which rewrites the fixture and fails on purpose (`was not run with the update flag left switched on`) so the flag can never be left on in a green run. Re-ran without the flag; all 12 tests in that file pass.

| File | Change |
|------|--------|
| `hooks/lib/__tests__/fixtures/rules-emission.golden` | `fusion-workbench-conventions.md` entry 52629 → 52613 in each of the 15 agent blocks that carry it, and each block's `total` reduced by 16 to match. No other line changed. |

Confirmed via `git diff` that the fixture diff is exactly those 30 lines (15 file-size lines + 15 total lines) and nothing else. `RULE_BASELINE` in `rules-emission-golden.test.ts` was not touched — regenerating the golden does not move the baseline (only re-cut at the two events in the test file's own `## Re-baselining` section), so no growth bound was cleared by this change; a shrink trips no bound in the first place.

## Verification

- [x] Original error resolved — `rules-emission-golden.test.ts` now passes (12/12).
- [x] Full test suite passes — `cd hooks && npm test`: 48 test files, 825 tests, all passed. Exit code 0.
- [x] No regressions introduced — `git status` shows only `hooks/lib/__tests__/fixtures/rules-emission.golden` modified by this task (the `rules/fusion-workbench-conventions.md` edit was the pre-existing, out-of-scope cause).

## Unrelated Issues Found

None.
