# A 44-line cut in the hook test surface, so step 8's work can land

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-24
**Plan:** `circles/260824-0530-record-attribution-and-circle-claim/planning/260824-0613_o_c3-attribution-on-records-and-a-claim-on-the-circle.md`, unblocking step 8

## Why

Step 8's writes were complete and its acceptance was met except for the last clause. The hook-test
line surface stood at **20 376 against a budget of 20 375** — floor 17 875 plus 2 500 of head-room —
and the suite was red on that one line and nothing else. The one line was step 8's own baseline
re-approval note in `hooks/lib/__tests__/reference-resolution-lint.test.ts`, which the gate there
requires. The step stopped rather than move a baseline, which is what
`hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining: the two events at which a baseline
moves` asks for: a red bound comes down by a cut.

This was that cut. **No baseline was edited**, and both of the open records the surface has standing
against it are left open and un-pre-empted:
`shared/decisions/260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md`, and
`shared/decisions/260822-1154_*_does-the-hook-test-line-budget-cover-comment-prose.md`, which asks
whether a comment line is the same kind of cost as a test line. This cut takes that second record's
status quo as it stands — a line is a line — and is an instance of the argument it names for that
position: a budget somebody has to spend is what makes the project decide whether a block of prose
is worth its lines.

## The criterion

Only spent prose was cut: an obituary for a mechanism that has been removed, and the history of a
defect where the test itself is the record of it. No assertion, no fixture value, no setup or
teardown step, no `expect`, no test name and no comment stating why a non-obvious assertion is
correct was touched. **No test was deleted** — not one `it`, not one `describe`, not one table case.
Test count is 732 before and 732 after.

## The three cuts

1. **`hooks/lib/__tests__/guard-bash-integration.test.ts`, -24 lines.** The header's
   `## What was here, and why five cases went in step 9` section: an inventory of four removals of
   test cases and of the guard mechanisms they covered. It explains no surviving assertion. The two
   points inside it that bear on a surviving case are already stated where that case is — the
   precondition case's own comment says it used to assert a block and why it no longer can, and the
   realpath trap is stated in `helpers/guard-harness.ts`, which the header already points at. The
   `## What this file is now` section above it carries the current state, the last-verdict date and
   the three properties the file asserts.
2. **`hooks/lib/__tests__/helpers/guard-harness.ts`, -5 lines.** The paragraph naming the write
   guard's fusion-repository stand-down as "a second, louder reason" for the throwaway project root.
   The stand-down went with the guard's last verdict on 2026-08-16 and the paragraph says so itself;
   the first reason, which is the live one, stands unchanged in the sentence above it.
3. **`hooks/lib/__tests__/domain-cascade.test.ts`, -15 lines.** The `Round 1` / `Round 2` narrative
   of how two earlier versions of this gate were too broad. Both issue citations are kept — issue
   260810-1918 in the heading above it, issue 260810-2110 folded into the surviving sentence — so
   the history is still reachable, and the paragraph that states what the gate does now
   (`REACH` in `hooks/lib/domain-cascade.ts` holds the claim, `README-hooks.md` is rendered from it)
   is untouched. One further line came out of reflowing that paragraph after the cut.

## Measurements

| | before | after |
|---|---|---|
| hook-test surface (lines) | 20 376 | 20 332 |
| budget (floor 17 875 + 2 500) | 20 375 | 20 375 |
| distance to budget | +1 over | 43 under |
| tests | 731 passed, 1 failed (732) | 732 passed (732) |

`hooks/lib/__tests__/fixtures/surface-growth.golden` was regenerated with
`UPDATE_SURFACE_GOLDEN=1`; the regeneration moves no baseline, and its diff is the three files above
plus step 8's own `agents/` figures.

`agents/*.md` measures 407 098 bytes, inside step 8's 407 137 acceptance ceiling. The `agents/`,
`skills/` and always-on rule bounds were not touched and did not move.

## Verification

`npm test` from `hooks/` — exit 0, 42 files, 732 passed. This also confirms step 8's work is sound
now that the bound is out of its way, so step 8 is marked `[DONE]` in the plan with an
`As built` note recording that its green came from this cut.
