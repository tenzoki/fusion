# Deleting a test file at its baseline frees no head-room, so the Turn-budget cut cannot pay the hook-test bound

---
**Domain:** code
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260910-0020_*_session-2s-own-additions-do-not-fit-the-hook-test-growth-bound-and-the-plan-does-not-say-so.md` is the issue whose closing sentence this defect falsifies. `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md` is the plan whose step C1 the Turn-budget removal was pulled forward out of.

---

## What is wrong

The route chosen for step C1a rests on the sentence "`hooks/lib/__tests__/turn-budget-lint.test.ts`
is 525 lines and its subject is deleted at step C1". The inference from that sentence to 525 lines of
head-room is false. **Deleting that file frees exactly zero lines**, and the surface stays 232 lines
over.

The arithmetic is in `growth()` in `hooks/lib/__tests__/helpers/growth-bound.ts`:

    const total = files.reduce((n, f) => n + f.size, 0);
    const floor = files.reduce((n, f) => n + (baseline[f.rel] ?? 0), 0);

Both sums run over **the files present on the tree**, so a deleted file leaves `total` and `floor`
together. `turn-budget-lint.test.ts` measures 525 lines today and its entry in `TEST_LINE_BASELINE`
is 525, so removing it subtracts 525 from each side and `delta` does not move. Removing its baseline
entry as well changes nothing, because the map is only ever read through a present file's key.

## How it shows

From `hooks/`, with the file moved aside and then restored:

    npx vitest run surface-growth-bound

Before: `... 2 732 lines past its baseline, which is 232 beyond the 2 500 ... (23 498 lines now,
budget 23 266 = floor 20 766 + 2 500)`.

With `turn-budget-lint.test.ts` absent: `... 2 732 lines past its baseline, which is 232 beyond the
2 500 ... (22 973 lines now, budget 22 741 = floor 20 241 + 2 500)`.

The same 2 732 and the same 232, with both totals 525 lower. Measured on this tree at 2026-09-10,
with session 2's uncommitted B3 work in place.

## The asymmetry underneath it

The instrument's header states one half of the rule and not the other. It says a file with **no**
baseline entry costs its whole current size, "and it is deliberate: nobody granted the new file a
budget". It says nothing about deletion, and the behaviour that follows from the code is that a
deleted file **refunds nothing**. So two acts with the same effect on the surface account
differently:

| Act | Effect on the surface | Head-room freed |
|---|---|---|
| Shrink a 525-line baselined file to 1 line | 524 lines gone | 524 |
| Delete the same 525-line baselined file | 525 lines gone | 0 |
| Delete a 525-line file with **no** baseline entry | 525 lines gone | 525 |

Whether that is intended is not decidable from the text: no comment, record or test states the
deletion case either way. It is filed here as a defect rather than a decision because the instrument
documents its own new-file rule and is silent on the mirror image of it, and because a reader who has
read that header will infer the refund, exactly as the plan's own route did.

## Consequence for the cut

**No whole-file deletion in this plan pays any of the three surface budgets**, unless the file
deleted has no baseline entry. That reaches beyond this step: every deletion in C1 through C9 that
was expected to buy room buys none. The room has to come from files that stay on the tree and get
smaller, or from files that were added after the last re-baseline and were therefore never granted a
budget.

On the hook-test surface as it stands, the entries with no baseline entry are the ones that pay in
full: `citation-form.test.ts` (+384), `dispatch-bound-lint.test.ts` (+246), `dispatch-bytes.test.ts`
(+223), `fusion-forum.test.ts` (+220), `session-start-event.test.ts` (+150), `bound-agent-set.test.ts`
(+96) and `declared-citation-paths.test.ts` (+70). Nothing here proposes cutting any of them; they
are named because they are where 232 lines can be found and the Turn-budget cut is not.

The Turn-budget removal itself is still wanted, and the user ruled for it. What it does not do is
free this surface, so it should not be dispatched as the payment for it.

## The fix

Two parts, and the second depends on a ruling rather than on this record.

1. Correct the closing sentence of the cross-referenced issue and the route note it produced, so that
   a later reader does not re-derive the same inference. The measurement above is what replaces it.
2. Decide whether the instrument should refund a deletion. If yes, `growth()` computes `floor` over
   the union of the present files and the baseline keys, and the three baseline maps stop carrying
   entries for files that are gone as a matter of hygiene rather than of accounting. If no, the
   header gains the sentence it is missing, next to the new-file rule it already states.

**Acceptance test:** `npx vitest run surface-growth-bound` from `hooks/` reports a figure that moves
when a baselined file is deleted, or the instrument's header states in as many words that it does
not.
