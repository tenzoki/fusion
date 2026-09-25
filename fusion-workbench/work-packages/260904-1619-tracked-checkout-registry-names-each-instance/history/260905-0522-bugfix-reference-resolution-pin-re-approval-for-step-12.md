# Bugfix: the reference-resolution pin is re-approved for step 12's release texts

**Date:** 2026-09-05 05:22
**Status:** Complete
**Trigger:** Orchestrator test failure
**Filed by:** bugfixer, Kai Stalmann <ks@qantr.com>

## Error

`hooks/lib/__tests__/reference-resolution-lint.test.ts`, the assertion at line 533:

```
expected { paths: 1583, anchors: 218, stampBare: 13 } to deeply equal { paths: 1572, anchors: 218, stampBare: 13 }
```

The gate's other 37 tests passed, the dangling-reference assertion above the pin included, so every reference in the shipped text still resolves and only the pinned count moved.

## Root Cause

Not a defect in the shipped text. `hooks/lib/__tests__/reference-resolution-lint.test.ts:483` pins the number of plugin-file paths the gate resolves to a committed constant, and step 12 of this Circle added eleven resolvable citations to the shipped surface without moving the pin. The gate's own `BASELINE_MESSAGE` (lines 490 to 500) names re-approval as the expected response, and the mechanism is a pin rather than a floor deliberately: a floor cannot notice coverage leaving.

## Fix

`BASELINE` moved from `paths: 1572` to `paths: 1583`; `anchors: 218` and `stampBare: 13` were left alone, both measured unmoved. The attribution entry was **prepended** to the existing chain on the same physical line, in the established `Previous: ` form, adding no line: the growth bound measures this file by the line and the chain already occupies three of them. No entry was dropped. No growth baseline was edited, and none needed editing.

| File | Change |
|------|--------|
| `hooks/lib/__tests__/reference-resolution-lint.test.ts:483` | `paths` 1572 -> 1583 in `BASELINE`; the dated re-approval entry prepended to the comment chain on that same line |

### The shares, re-measured

Method: single-file revert against HEAD (`git show HEAD:<path>`, or removal for the new untracked note), one file at a time, then the gate alone; every file restored afterwards and verified byte-for-byte by `shasum -a 256`. No whole-tree git command was used.

| File | gate reads with it reverted | share |
|---|---|---|
| `docs/upgrading-to-v10-21.md` (new) | 1574 | +9 |
| `README.md` | 1581 | +2 |
| `CLAUDE.md` | 1582 | +1 |
| `README-hooks.md` | 1583 | 0 |
| `install.sh` | 1583 | 0 |
| `.claude-plugin/plugin.json` | 1583 | 0 |

All five of the dispatch's files reverted together: **1572/218/13, gate passing**, so no share is owed to a file step 12 did not touch. The figures reproduce the shares the implementing agent measured, and `.claude-plugin/plugin.json` was measured as well rather than assumed: it is 0 by construction, since `surface()` in that test file never reaches it.

### The overlap

The shares sum to 12 against a move of 11 because one token is shared. `README.md`'s new upgrade paragraph points at the note, and that pointer resolves only while the note exists, so reverting the note alone un-resolves it too. It is counted once inside the note's 9 and once inside `README.md`'s 2. Reverting the note is also the only one of the six single-file measurements that reads **two** failures, the second being the dangling pointer.

The overlap was measured, not reasoned: with the note and `README.md` reverted **together** the gate reads 1573, so the pair is -10 and the shared token is exactly one. That also derives the note's own contribution as 8, which agrees with enumerating its path tokens: `bin/fusion-identity` twice, `bin/fusion-events` twice (both in the `bin/fusion-events presence` form), the `$FUSION_PLUGIN_ROOT`-rooted spellings of `bin/fusion-events` and `bin/fusion-checkout-name`, the bare `bin/fusion-checkout-name`, and `rules/workbench-tracking.md`. The bare `bin/` the note also carries is no path and contributes nothing, which is what makes the two derivations agree.

The two zeros hold by construction as well as by measurement: `README-hooks.md` rewrote two rows of its `hooks/lib` table and every plugin path in them already stood there, and `install.sh` is scanned on its `#` comment lines only, where its one edit is a version string carrying no token.

## Verification

Command: `cd hooks && npm test`. Exit code **1**.

- [x] Original error resolved: `lib/__tests__/reference-resolution-lint.test.ts` passes, 38 of 38.
- [x] 47 of 48 test files pass, 824 of 825 tests.
- [x] No regressions introduced. Both growth-bound gates pass (`surface-growth-bound.test.ts`, `rules-emission-golden.test.ts`), and the file's line count is 999 before and after.
- [x] `monitor-warnings-panel.test.ts` passed on both runs of this session, so the filed intermittent bind race did not fire.

The one failing file is `lib/__tests__/citation-sweep.test.ts`, which is what the exit code of 1 reports, and it is not this fix's. It is already filed as `260904-1839_*_citation-sweep-test-is-red-at-head-and-was-already-red-before-this-session-started.md`, and every path it names is a record under `fusion-workbench/`, which this fix did not touch.

## Unrelated Issues Found

None. The two red suites this dispatch named out of scope are both already filed (`260904-1839_*_citation-sweep-test-is-red-at-head-and-was-already-red-before-this-session-started.md`, `260904-2140_*_monitor-warnings-panel-test-fails-intermittently-on-the-dual-stack-bind.md`), so nothing new was written.
