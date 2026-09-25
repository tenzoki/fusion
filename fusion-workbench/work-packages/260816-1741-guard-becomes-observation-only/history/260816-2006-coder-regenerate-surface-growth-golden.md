# Coder — regenerate the surface-growth golden after step 1

**Date:** 2026-08-16 20:06
**Agent:** coder
**Status:** Complete
**Plan:** `260816-1915_*_the-compliance-guard-becomes-observation-only.md`, step 1 (close-out)
**Files changed:** `hooks/lib/__tests__/fixtures/surface-growth.golden`

## What was done

Step 1 grew `skills/setup/SKILL.md`, which put the checked-in golden out of step with the
tree and turned the "matches the checked-in golden" case of `surface-growth-bound.test.ts`
red. The predecessor left the fixture alone deliberately, because its scope excluded
`hooks/`. This task closes that out with the instrument's own sanctioned command.

Two commands, in the order the test file's `## Updating the golden` header prescribes:

1. `cd hooks && UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts`
   — rewrote the fixture from live measurement and failed on purpose (1 failed, 11 passed).
   That failure is the instrument's guard against a regeneration run ever being green.
2. `cd hooks && npx vitest run lib/__tests__/surface-growth-bound.test.ts` — exit 0, 12 of 12.

No file was hand-edited. The fixture is machine-written and was changed only by the run.

## What moved, per surface

The diff is one hunk in the `[skills bytes]` block:

| Entry | Before | After | Delta |
|---|---|---|---|
| `setup/SKILL.md` | 36 333 | 38 194 | +1 861 |
| `skills` total | 226 897 | 228 758 | +1 861 |

**Nothing else moved.** The `[rules bytes]`, `[agents bytes]` and `[hook-tests lines]` blocks
are byte-identical to their checked-in state, and no other entry inside the skills block
changed. The single delta matches to the byte the growth the step-1 history log already
measured, so no earlier task reached beyond its stated scope.

## What this did not do

Regenerating the golden does not move a baseline and does not clear a bound — the test file
states that at `:164` and the failure text repeats it. The `skills/` head-room bound was green
throughout, before and after. **No baseline map was touched**, so plan step 10, which copies
the per-file sizes into the baseline maps at a cleanup, is not pre-empted and still has its
full subject.

## Verification

`cd hooks && npx vitest run lib/__tests__/surface-growth-bound.test.ts` — exit 0, 12 passed.

`reference-resolution-lint.test.ts` remains red at HEAD for an unrelated reason:
`hooks/guard.ts:307` cites a decision record under a `_o_` marker that now stands at `_a_`.
Plan step 2 deletes that block. Left alone, per the dispatch.
