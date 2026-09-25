# Bugfix: the two pinned-inventory gates re-approved after step 3's rule edits

**Date:** 2026-09-04 19:15
**Status:** Complete
**Trigger:** Orchestrator test failure
**Filed by:** bugfixer, Kai Stalmann <ks@qantr.com>

## Error

`cd hooks && npm test` red on two suites after step 3 added `shared/checkouts/` to the layout tree, to the `shared/`-holds paragraph and to the R1 row of the four-class partition.

```
reference-resolution-lint.test.ts > resolved exactly the pinned number of references in each plugin class
  expected { paths: 1566, anchors: 217, stampBare: 13 } to deeply equal { paths: 1563, anchors: 217, stampBare: 13 }

rules-emission-golden.test.ts > matches the checked-in golden, agent by agent
  fusion-workbench-conventions.md 51456 -> 51897, total 71078 -> 71519 (reported on 'analyst', the first block to differ)
```

## Root Cause

Neither is a defect in code. Both gates pin an inventory of the shipped text and fail on any legitimate move of it, and both name re-approval as the expected response.

`hooks/lib/__tests__/reference-resolution-lint.test.ts:480` holds `BASELINE`, a committed count rather than a floor, and its own `BASELINE_MESSAGE` at line 487 states that re-approving is the expected response and that widening the assertion back into a floor is not. Step 3 added three resolving `bin/fusion-checkout-name` tokens. The helper exists and is executable (`bin/fusion-checkout-name`, shipped at commit `0dcbf992`), so no reference dangles: the `no dangling reference of any class` case passed throughout, and only the count moved.

`hooks/lib/__tests__/rules-emission-golden.test.ts` pins the path set, the emission order and each file's byte size per agent in `fixtures/rules-emission.golden`. `rules/fusion-workbench-conventions.md` is always-on, so its +441 bytes reach every agent block. The header's `## Updating the golden` names regeneration as the deliberate remedy.

## Fix

| File | Change |
|------|--------|
| `hooks/lib/__tests__/reference-resolution-lint.test.ts` | `BASELINE.paths` 1563 -> 1566; the new re-approval entry prepended to the trailing comment, the 2026-09-04 step-2 entry demoted to `Previous:` in the form that line already used. One line changed, no line added. |
| `hooks/lib/__tests__/fixtures/rules-emission.golden` | Regenerated with `UPDATE_RULES_GOLDEN=1`. `fusion-workbench-conventions.md 51456 -> 51897` and the total +441 in every agent block, and that is the whole diff: no path entered or left, no order changed, no other file's size moved. |

Shares of the +3, by single-file revert against `HEAD` and disjoint, summing exactly with neither the over-count nor the under-count the two entries below it in the log record:

```
both files at HEAD                 paths 1563  (gate green)
conventions new, tracking at HEAD  paths 1565  (+2)
conventions at HEAD, tracking new  paths 1564  (+1)
both new                           paths 1566  (+3)
```

All three tokens are `bin/fusion-checkout-name`: the layout-tree row comment and the `shared/`-holds paragraph in `rules/fusion-workbench-conventions.md`, and the `bin/fusion-checkout-name register` citation in the new paragraph under `rules/workbench-tracking.md` `## The four classes`. `anchors` and `stampBare` did not move: the tracking paragraph names the R1 row in prose rather than citing a heading, and neither new token is followed by one.

`rules/workbench-tracking.md` is emitted to no agent, so its +417 bytes reach no golden.

**No growth baseline moved, and none had to.** The header of `rules-emission-golden.test.ts` states it directly: regenerating the golden does not move `RULE_BASELINE` and therefore never clears the hard bound. The bound was not near failing. The universal core reads 66 234 bytes (`agent-setup.md` 3 963 + `fusion-workbench-conventions.md` 51 897 + `critical-stance.md` 10 374) against a 65 498 floor inside `GROWTH_BUDGET` 12 000, so 11 264 bytes stood free. `fusion-workbench-conventions.md` at 51 897 is in fact still below its own 52 027 entry in `RULE_BASELINE`. The core-bound case passed before the regeneration as well as after it.

No rule file was edited to make a number match, no assertion was widened, no exemption was added.

## Verification

Command: `cd hooks && npm test` — exit code **1**, from one pre-existing failure that is not this task's.

- [x] Original errors resolved: `reference-resolution-lint.test.ts` and `rules-emission-golden.test.ts` both green.
- [x] 47 of 48 suites pass, 813 of 814 cases.
- [x] No regressions introduced: the only red suite is `citation-sweep.test.ts`, verified red at this session's start commit `cda72f71` and filed as `260904-1839_*_citation-sweep-test-is-red-at-head-and-was-already-red-before-this-session-started.md`. It names three workbench records this task never touched, two of them committed before this task began.
- [x] `rules/fusion-workbench-conventions.md` (51 897) and `rules/workbench-tracking.md` (17 538) are byte-identical to how the task received them; the temporary reverts used for the share measurement were restored.

## Unrelated Issues Found

None. The one red suite was already filed.
