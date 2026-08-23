# Two answered decision records close as implemented

**Date:** 2026-08-23 12:43
**Agent:** coder
**Circle:** `260823-0023-settle-what-travels-between-checkouts`
**Status:** Complete

## Task

Plan step 8 of
`circles/260823-0023-settle-what-travels-between-checkouts/planning/260823-0800_*_c2-what-travels-between-checkouts-is-settled.md`:
append an `Implemented:` annotation to the Circle's two answered decision records and move each marker
from `_a_` to `_i_`.

## What was done

Both records got one appended block in the footer form defined by
`rules/fusion-workbench-conventions.md` `## Inline State Tracking` (Decision files), and were renamed
with `mv`. Neither record moved store: the event-log record stays in `shared/`, the activation record
stays inside the C1 Circle that raised it, and each is cited where it lives.

**`shared/decisions/260822-1136_i_how-does-the-tracked-event-log-behave-when-two-checkouts-both-appended-to-it.md`**
cites `c9eba48` (Step 0h of `/fusion:setup`, the union merge driver) with its reasoning in
`rules/workbench-tracking.md` `## The event log carries a union merge driver`, plus the two later
commits the answer is not whole without: `2f1e3a6`, which sorts the Phase-4 sequence diagram by `ts`,
and `18974bc`, which gives the `set` branch of `git check-attr` its own words. It records the accepted
cost, the Turn count staying with C4, and the defect filed during the work
(`circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1110_*_the-merge-driver-unsorts-a-second-event-log-reader-whose-repair-direction-is-positional.md`).

**`circles/260822-1921-measure-what-two-checkouts-share/decisions/260822-2219_i_what-does-a-second-checkout-do-with-a-circle-record-marked-active-that-it-never-activated.md`**
cites `25f60eb` (Step 0i, the `MISSING-POINTER` report and the activation offer), which in the same
commit added `/fusion:setup` to the closed writer enumeration of `.active-circle` in
`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`, satisfying this record's fourth
constraint. It cites `18974bc` for `MULTIPLE-ACTIVE`, the case the record left without a rule.

Both blocks point at
`circles/260823-0023-settle-what-travels-between-checkouts/_*_circle.md` `## Grounding snapshot` for the
answer itself, because the user gave it at the shaping gate and not in the records.

## Verification

- `git cat-file -e` resolves all four cited commits: `c9eba48`, `2f1e3a6`, `18974bc`, `25f60eb`.
- Each edited file was diffed line for line against its pre-edit blob over the original line count:
  pure append in both, no existing line edited.
- `npm test` from `hooks/` — exit 0, 41 files, 724 tests. That covers both citation gates over the
  renamed paths, and the growth bounds, which this step does not touch.
- `bin/fusion-prose-metric` on both records reads `over`, as both did before the edit (4 em-dashes and
  1). Each addition carries exactly one, the separator the `Implemented:` footer grammar requires.

## Note for the next reader

Renaming a decision to `_i_` takes it out of the workbench citation gate's corpus, which holds `_o_`
and `_a_` decisions only (`hooks/lib/__tests__/workbench-citation-lint.test.ts`). Every remaining
citation of these two records elsewhere uses the `_*_` marker wildcard, so nothing dangled.

Plan step 8 is marked `[DONE]`. Step 9 is the only step left. Nothing was committed.
