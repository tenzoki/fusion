# coder: T3-code, close the five findings of the Turn 2 code review

**Date:** 2026-08-24 21:50
**Circle:** circles/260824-1853-close-every-open-defect
**Source:** `reviews/260824-2145-coderev-turn-2-review-closure-range.md`, the four `260824-2145_*` records under this Circle's `issues/` and the one under `shared/issues/`
**Status:** Complete

## What changed

- `agents/orchestrator.md`: the executor rule at `:574` bans `git reset --hard` and says the plain form in step 5 writes the index only, inside the lock; the `### Rebalance Gate` trigger names `coherent` + `state Directive`; the Revise Directive bullet states the no-spec entry (shaper in user-direct mode with the session's evidence); the once-per-session cap says, in the bounding bullet alone, that stating a Directive is not a revision and leaves the counter at 0.
- `agents/reconciler.md`: the cadence note at `:103` fires the gate on `coherent` + `state Directive` too; recommendation row 2 becomes "`coherent` otherwise → `none`", so row 1 is the only exception and a `not evaluable: no commits` edge matches a row.
- `bin/fusion-session-domain:41`: "double-quoted or bare", matching the `sed`. The no-line alternative the record offered; no `it.each` row added.
- `hooks/lib/__tests__/fusion-session-domain.test.ts:10`: "three-way". Same line count.
- `fusion-workbench/shared/analyses/260824-2121-*`: a retrospective section attributes paths 1294→1295 and anchors 180→181 to `0db1fbb` (recovered with `git log -S'paths: 1295'` and the commit's diff: `agents/shaper.md` once more, and `rules/user-facing-output.md` `## Length` first cited, both in the new `## How you ask the user anything` section). Written into the rolled log rather than the test file: hook-test head-room is 0. `BASELINE` unmoved.
- `hooks/lib/__tests__/fixtures/surface-growth.golden`: regenerated for the two agent files (+502, +162). No baseline map touched.

## Head-room

agents 3 675 → 3 011 bytes (+664); always-on rules 216 → 216 (no rule edited); hook tests 0 → 0 lines (no line added).

## Records closed (`_o_` → `_c_`)

Four under `issues/` of this Circle, stamp `260824-2145`; `shared/issues/260824-2145_c_the-reference-resolution-pin-chain-*`.

## Verification

`cd hooks && npm test` — exit 0 (760 tests, 43 files).
