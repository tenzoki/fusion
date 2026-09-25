# Bugfix: the two pinned inventories step 4 moved

**Date:** 2026-09-04 20:37
**Status:** Complete
**Trigger:** Orchestrator dispatch after step 4 of `260904-1651_*_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md`
**Filed by:** bugfixer, Kai Stalmann <ks@qantr.com>

## Error

Two gates red on `cd hooks && npm test`, both of them pinned inventories rather than defects:

1. `hooks/lib/__tests__/reference-resolution-lint.test.ts` — `paths` resolved 1567 against a `BASELINE` of 1566; `anchors` 217 and `stampBare` 13 unmoved.
2. `hooks/lib/__tests__/fixtures/surface-growth.golden` — `fusion-events.test.ts` measured 322 lines against 251 in the golden, hook-tests total 20 044 against 20 115.

## Root Cause

Neither is a code fault. Each gate documents re-approval or regeneration as the response to a legitimate addition, and step 4's presence canonicalisation is one.

**Gate 1.** The single new class-(a) token is `bin/fusion-checkout-name`, cited once on a comment line of `bin/fusion-events:200`, in the header section explaining why the roster is passed in. Measured by single-file revert against HEAD, the method the pin's own log uses: with `bin/fusion-events` alone reverted the gate resolves 1566/217/13 exactly, so the whole move is that file's and no share is owed elsewhere. The step's four other changed files cannot reach the pin at all. `hooks/lib/events-query.ts` and `hooks/events-query.ts` are scanned `recordsOnly`, so a plugin path in their comments is not class (a); `hooks/lib/__tests__/fusion-events.test.ts` sits under a directory `surface()` never descends into; `hooks/dist/` is not a scanned surface. The script's two other `fusion-checkout-name` occurrences are shell code, and a `bin/` file is scanned on its `#` lines only.

**Gate 2.** `fusion-events.test.ts` grew by 71 lines with the canonicalisation cases. The `hook-tests` head-room case is green and stayed green: 20 115 lines against a floor plus 2 500 of head-room. The golden is an inventory, not a baseline, and its own header states that regenerating it moves no baseline and therefore never clears a bound.

## Fix

| File | Change |
|------|--------|
| `hooks/lib/__tests__/reference-resolution-lint.test.ts:480` | `BASELINE.paths` 1566 -> 1567, with the re-approval entry written into the trailing comment ahead of the previous ones. One line changed, so the file's own line count is unmoved. |
| `hooks/lib/__tests__/fixtures/surface-growth.golden` | Regenerated through `UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts`. Diff is exactly two lines: `fusion-events.test.ts` 251 -> 322 and `total` 20 044 -> 20 115. |

No baseline was edited. `hooks/lib/__tests__/helpers/growth-bound.ts` and `hooks/lib/__tests__/surface-growth-bound.test.ts` are untouched, which `git status` confirms.

The pin's trailing comment carried four entries, one more than the dispatch assumed. It now carries three: the new one, and the two 2026-09-04 entries for steps 3 and 2. Dropped were the 2026-08-29 re-approval for `bin/fusion-citation-sweep` (paths 1544 -> 1552) and the 2026-08-29 grammar entry (stampBare 12 -> 11); both are readable in this file at `git:d5a27230`, and the new entry says so. Unlike entries 1 to 40 they were dropped rather than rolled into a `shared/analyses/` log, which is the mechanism the pin's header describes for a long history.

## Verification

`cd hooks && npm test` — exit 1. 47 of 48 files pass, 820 of 821 tests.

- [x] Original errors resolved: `reference-resolution-lint.test.ts` 38/38 pass, `surface-growth-bound.test.ts` 12/12 pass.
- [x] No regressions: every other suite that passed before still passes, `committed-dist`, `rules-emission-golden` and `workbench-citation-lint` included.
- [x] The one failure is `citation-sweep.test.ts`, red at this session's start commit and filed as `260904-1839_*_citation-sweep-test-is-red-at-head-and-was-already-red-before-this-session-started.md`. It names four workbench records, none of them a file this fix touched.

## Unrelated Issues Found

None. The one candidate, the marker-form citation in `260904-2029-coder-presence-canonicalisation.md` that the sweep would rewrite, is already covered by the filed `citation-sweep` issue.
