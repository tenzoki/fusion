# R1 — freeing hook-test head-room by cutting duplicated comment prose

**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <kai@qantr.com>
**Circle:** 260909-1700-cut-fusion-to-working-minimum

## What was asked

Free at least 500 lines in `hooks/lib/__tests__/**.ts` by removing comment prose that is
duplicated elsewhere, replacing each removal with a citation of the surviving copy. A block
that is the only home of its content stays, however verbose.

## What was done

247 lines freed. The surface stood 232 lines over its head-room (23 498 against a budget of
23 266) and now stands at 23 251 — the bound passes with **15 lines of head-room left**.
The 500 was not reached: under the citation rule the remaining candidates are sole homes, and
cutting them would trade the project's reasoning for budget.

Every removed block, with the surviving copy, is in the dispatch report. The largest single cut
is the pre-arming cut log above `RULE_BASELINE` in `rules-emission-golden.test.ts` (84 lines),
whose eight entries are each written up in the Circle plan
`260804-2356_*_plan-ausstieg-kontextsteuer-und-auslieferung.md`
and in that step's own history log. The 2026-08-14 arming entry and its standing-cleanup table
were left intact, as were `helpers/growth-bound.ts`'s re-baselining rule, every arming record in
`surface-growth-bound.test.ts`, and the baseline maps.

One roll rather than a cut: pin re-approval entries 41 to 54 moved verbatim to
`260910-0512-reference-resolution-pin-re-approval-log-entries-41-to-54.md`,
which is the maintenance `reference-resolution-lint.test.ts`'s own header prescribes
(decision `260822-1229_*_where-does-the-reference-resolution-pins-re-approval-attribution-log-live.md`, option 2).

## Verification

`cd hooks && npm run build && npm test` — exit 0, 979 of 979 passing (978 of 979 before, failing
on `surface-growth-bound` alone). No `it(` or `expect(` was removed from any file: the count of
both tokens is unchanged against `HEAD` in every edited file. Step B3's uncommitted work is
untouched.

## What B4 has to budget for

**15 lines.** B4 touches four readers and a renderer and will not fit in that, so the next
dispatch needs either a further cut on this surface or a decision the plan does not currently
carry. The 253 lines the dispatch asked for beyond the shortfall were not found under the
citation rule and are handed back unfound: what remains in these files is, as far as this pass
could establish, the sole written home of its content.
