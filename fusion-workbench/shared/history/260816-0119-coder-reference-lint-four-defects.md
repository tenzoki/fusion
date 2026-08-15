# Reference-resolution lint: four defects in one pass

**Status:** Complete
**Agent:** coder
**Session:** 260816-0119
**Started at HEAD:** `3a0408a`
**Files changed:** `hooks/lib/__tests__/reference-resolution-lint.test.ts` (only)

---

## What was asked

Four defect records, all landing in the same gate file, fixed in one pass without committing.

## What was done

**1 — the `lib/…` spelling** (`shared/issues/260812-1407_*_…`). `lib` joined the directory
alternation in `PLUGIN_PATH_BODY`; a new `resolveToken()` maps a `lib/…` token to `hooks/lib/…` for
the existence check, written once and used by both the scanner and the EXAMPLE_PATHS-is-fabricated
guard. **34 citations entered the examined set** — 27 that resolve (`counts.paths` 1095 → 1122) and
7 occurrences that do not. A behavioural case drives both halves.

**2 — the deliberately dead modules.** The 7 dangling occurrences name **six** distinct modules, not
the seven the dispatch expected: `lib/bash-mutation-guard.ts`, `lib/protected-snapshot.ts`,
`lib/rules-write-exemption.ts`, `lib/fs-locator.ts`, `lib/reverted-copy.ts`, and
`lib/state-drift.ts` cited twice (`README-hooks.md:183` and `:185`). Each gained an `EXAMPLE_PATHS`
entry naming its removal date and the section that names it, same shape as `bin/fu`.

**3 — the top-level hook entrypoints** (`shared/issues/260811-1755_*_…`). `surface()` gained a
second loop over `hooks/*.ts` on the same terms as `hooks/lib/*.ts` — comment lines, `recordsOnly`.
**8 record citations entered scope** (`counts.records` 87 → 95), across `guard.ts`,
`review-coverage.ts`, `session-start.ts` and `tracker.ts`. **All 8 resolve**; the expectation that
this would surface more dangling citations did not hold, and **no shipped file was changed**.

**4a — the deleted behavioural case** (`circles/260815-0007-…/issues/260815-1251_*_…`).
`scanPluginPaths` now takes `rootVars` as a defaulted third parameter, so the restored case
*"skips a variable declared as naming something other than the plugin tree"* declares its own
`STASH_DIR` entry rather than needing a real inhabitant. It asserts the skip **and** that the same
token under an undeclared variable still fires, so it is a demonstration rather than an assertion of
absence.

**4b — the coverage floors** (`shared/issues/260810-2149_*_…`). The three floors are replaced by
`BASELINE = { paths: 1122, anchors: 139, records: 95 }`, asserted with `toEqual` in one comparison
over all three. The failure message states in full sentences that re-approving the baseline is the
expected response to a legitimate change, says to write the received numbers into `BASELINE` in the
same commit, and names widening back to a floor as the response that is not wanted.

## Verified by mutation, both directions (acceptance criterion 4)

- **Coverage leaves** — rewrote one shipped citation `lib/git.ts` → bare `git.ts`: fails at
  `paths: 1121` vs `1122`. This is the case no floor can see.
- **Coverage arrives** — appended two resolving citations to `README-hooks.md`: fails at
  `paths: 1124` vs `1122`.

Both printed the re-approval message. `README-hooks.md` was restored byte-for-byte after each
(confirmed absent from `git diff --stat`).

## Line delta

`reference-resolution-lint.test.ts` **814 → 933 lines, +119 net** (+135/−16). The records estimated
~75; the overrun is the six `EXAMPLE_PATHS` reasons, the baseline failure message, and the extra
`lib/…` behavioural case. Well inside the hook-tests head-room — `surface-growth-bound.test.ts`'s
own line bound passed.

## Also filed

- `shared/decisions/260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md`
  — item 2 of `260811-1755`, which that record explicitly reserved for a decision record.
- `shared/issues/260816-0119_*_the-lints-newly-widened-surface-still-stops-at-hooks-lib-tests-where-real-citations-have-gone-stale.md`
  — six real stale citations measured in `hooks/lib/__tests__/`, and why widening there is not
  mechanical.

## Verification

`cd hooks && npm test` — **exit 1**, sole failure
`surface-growth-bound.test.ts > matches the checked-in golden, surface by surface`. 763 of 764 pass.
That golden is the per-file byte inventory of the bounded surfaces; it is stale because another
agent's concurrent `agents/orchestrator.md` edit moved that surface's total, and the dispatch
excluded it from this task's scope. It was deliberately **not** regenerated. The growth *bound*
itself passed, including the hook-tests line bound this task's +119 lines count against.

An earlier run of the same command failed at the build step instead — `tsc` rejected
`hooks/lib/review-coverage.ts` over a `notOpenedRaw` field missing from four `ReviewRow` literals.
That file is another agent's concurrent work and was never touched here; it was green again by the
final run.

This file's own suite: `cd hooks && npx vitest run lib/__tests__/reference-resolution-lint.test.ts`
— **exit 0, 34/34 passed.**

Not committed — the orchestrator stages and commits.
