# Bugfix: the two pinned-inventory gates re-approved for the checkout-name helper

**Date:** 2026-09-04 18:40
**Status:** Complete
**Trigger:** Orchestrator test failure
**Filed by:** bugfixer, Kai Stalmann <ks@qantr.com>

## Error

`cd hooks && npm test` red on two suites after step 2 of this Circle added `bin/fusion-checkout-name`, `hooks/lib/__tests__/fusion-checkout-name.test.ts`, one `.gitignore` line and one `CLAUDE.md` Layout row:

- `reference-resolution-lint.test.ts` — `expected { paths: 1563, anchors: 217, stampBare: 13 } to deeply equal { paths: 1552, anchors: 216, stampBare: 11 }`
- `surface-growth-bound.test.ts` — the checked-in inventory `fixtures/surface-growth.golden` missing the new test file; `hook-tests` total 19 876 vs the tree's 20 044. The bound itself passed (168 lines against 448 free).

## Root Cause

Neither is a defect. Both gates pin a committed inventory and both state that a legitimate addition is re-approved rather than fixed:

- `reference-resolution-lint.test.ts:487-495` (`BASELINE_MESSAGE`) — "RE-APPROVING THE BASELINE IS THE EXPECTED RESPONSE … what is not expected is to widen the assertion back into a floor."
- `fixtures/surface-growth.golden:1-13` — "Generated. Do not hand-edit … Regenerating this file does not move any baseline and therefore never clears a bound."

## Fix

**Attribution, measured rather than apportioned.** With both new files moved out of the tree and `CLAUDE.md` restored from HEAD, the reference gate resolves 1552/216/11 exactly, so the whole delta is this addition's.

| File | Share |
|------|-------|
| `bin/fusion-checkout-name` (header comment lines) | +8 paths, +1 anchor, +2 stampBare |
| `CLAUDE.md` (the new Layout row) | +3 paths |
| `hooks/lib/__tests__/fusion-checkout-name.test.ts` | 0/0/0 — `hooks/**.ts` is `recordsOnly` and it cites no record |

The helper's eight are `CLAUDE.md` in its authoritative-documentation sentence, `bin/monitor`, `bin/fusion-paths`, `hooks/lib/events-query.ts`, `bin/fusion-identity` three times, and `rules/workbench-tracking.md` `## The four classes` — a rooted heading, one path and one anchor at once. The two bare stamps are the `**Registered:**` and `**Refreshed:**` values of the worked entry example, bare because the `head-field` exemption reads a line's own head and a comment line has none. The row's three are `bin/fusion-checkout-name`, `bin/fusion-identity`, `bin/fusion-workbench-root`.

One finding worth keeping: single-file revert of the `CLAUDE.md` row alone reads +2, not +3. With the helper absent the row's citation of it dangles and is not a resolved path, so the shares sum to 10 by that method and to 11 with the helper present. The under-count is the method, not a citation — the mirror of the over-count the `bin/fusion-citation-sweep` entry on the same line records.

| File | Change |
|------|--------|
| `hooks/lib/__tests__/reference-resolution-lint.test.ts:480` | `BASELINE` 1552/216/11 -> 1563/217/13, with the re-approval note prepended on the same line and the previous entry demoted to `Previous:`. One line changed; the file's line count is unmoved at 996, so its own golden entry stays correct. |
| `hooks/lib/__tests__/fixtures/surface-growth.golden` | Regenerated with `UPDATE_SURFACE_GOLDEN=1`: `fusion-checkout-name.test.ts 168` added to the `hook-tests` block, total 19 876 -> 20 044. |

No baseline number in `helpers/growth-bound.ts` or in `surface-growth-bound.test.ts` was touched, no exemption was added, and nothing the reference lint scans was edited to make a number match.

## Verification

`cd hooks && npm test` — exit code 1, `Tests 2 failed | 812 passed (814)`.

- [x] Original error resolved — `reference-resolution-lint.test.ts` (38 tests) and `surface-growth-bound.test.ts` (12 tests) both green
- [x] No regressions introduced — the two remaining failures are the two out-of-scope suites, unchanged: `citation-sweep.test.ts` (red at this session's start commit `cda72f71`) and `workbench-citation-lint.test.ts` (`portfolio.md:107`, machine-regenerated)
- [x] The step-2 additions are byte-identical to their pre-measurement state, `bin/fusion-checkout-name` still `-rwxr-xr-x`

## Unrelated Issues Found

None. The two red suites named above were already filed as out of scope for this repair.
