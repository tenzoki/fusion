# Resolver test learns the forum keys

**Agent:** coder
**Task:** S7 of `260907-1942_o_message-between-checkouts-read-before-pull.md`
**Status:** Complete

## What was done

Added one `describe("the forum keys")` block to `hooks/lib/__tests__/fusion-paths.test.ts`,
in the shape of the existing `the backlog keys` block: a staged fixture prompt naming
`$OUT_FORUM`, `$SCAN_FORUM` and `$OUT_PLAN`, driven through a copy of the real script,
asserting `shared/forum` for both forum keys in three states — no Circle active, a Circle
active, and a `<circle-dir>` target passed (both with and without an active Circle).

`SCAN_FORUM` is additionally asserted to carry exactly one store, the invariant-2 collapse
the other unconditionally-shared kinds already show.

## The moving control

`OUT_PLAN` rides along in the same fixture prompt and is asserted to **move** across the
three states — `shared/planning`, `circles/<active>/planning`, `circles/<target>/planning`.
Without it, a key that were never Circle-bound at all would produce the same three green
assertions for the wrong reason, and the block would be asserting a constant rather than an
immunity. Task S1 proved the property this way by hand; the block encodes it.

No roster-wide assertion was touched: the key-set, every-skill and flat-namespace cases read
the tree and pick up a new skill on their own. `skills/news/SKILL.md` does not exist yet
(task S8), which is why `fusion-paths news` exits 2 today and no case here names it.

## Budget

45 lines added, 0 removed (`git diff --numstat`) against a ≤ 45 budget.

## Verification

`cd hooks && npx vitest run lib/__tests__/fusion-paths.test.ts` — exit 0, 84 tests passed.
The full `npm test` was deliberately NOT run: two sibling agents are mid-edit on
`bin/fusion-forum` and `skills/archive/SKILL.md` in this tree, so a full-suite result would
not have been about this change.

## Not done, deliberately

The plan's step 7 was left at its current marker rather than set to `[DONE]`: the dispatch
scoped this task to the one test file and named the concurrent editors as the reason.
Whoever commits this should flip it.
