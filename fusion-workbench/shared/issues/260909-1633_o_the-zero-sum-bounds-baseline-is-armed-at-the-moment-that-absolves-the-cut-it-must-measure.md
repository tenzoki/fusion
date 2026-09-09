# The zero-sum bound's baseline is armed at the moment that absolves the cut it must measure

---
`260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` C8 defines its baseline as "the six totals
measured at the moment the cut lands". C7's stop condition then delegates to that bound to catch a
merge that raises the per-dispatch total. A baseline armed at the landing cannot measure the landing.
Measured independently, the merges C7 proposes raise the bounded quantity on six of the eight paths
they touch, so the growth the stop exists to catch is precisely the growth the baseline absolves.

---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260909-1628-adversarial-review-of-the-cut-fusion-to-a-working-minimum-spec.md` (findings 4.4, 5.7, 5.9; MF-4, SF-4); `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` (C7 Stops-when, C8); `260909-1346_*_the-rule-growth-bound-covers-the-core-while-the-hottest-path-grew-29-percent-back.md` (the standing issue C8 answers)

## The circularity

C7's Stops-when: "If the merged `planner` or `analyst` prompt cannot reach its byte target without
dropping an obligation the merged roles carried, the merge stops ... A merge that grows the
per-dispatch total is the failure mode C7 names, and the bound in C8 will catch it, so this stop is
measured and not judged."

C8: "The baseline is the six totals measured at the moment the cut lands."

The bound cannot catch the growth of the change that arms it.

## The growth it would have to catch, measured at `bb341360`

`bin/fusion-rules` keys conditional emissions on the agent name, so a merged role inherits the union of
every conditional its inputs satisfied. Component sizes: always-on floor 76 013; `default-voice-en`
3 021, `design-diagrams` 5 285, `decision-record-examples` 4 952, `user-facing-output` 10 884,
`circle-records` 28 124, `review-contract` 6 820, `bounded-dispatch` 9 162. Every one of the fifteen
measured emissions reconstructs exactly from these.

Merged planner rule set 100 155; at C7's 22 000-byte prompt target the path is 122 155, against
planner's 108 996 today (+13 159) and taskplanner's 95 368 (+26 787). Merged analyst rule set 111 185;
at 22 000 the path is 133 185, against analyst's 105 357 today (+27 828), coderev's 100 136 (+33 049)
and consultant's 104 247 (+28 938).

## A second, independent defect in the same capability

C8 criterion 2 and Stops-when 1 both rest on "replayed over 2026-08-27 to 2026-09-09, the bound goes
red". Replayed: the coder path total was 154 440 bytes at `265a86fb` (9 649 + 65 944 + 78 847) and is
188 256 now, a rise of 21.9 percent. So it goes red. But a bound with zero head-room goes red over that
window for any component set that grew by one byte, the always-on core included. The criterion
distinguishes nothing.

## What would resolve it

1. Arm the baseline at the pre-cut totals rather than at the landing. The eight measured rows are in
   the review report and in C8's own table.
2. Complete the replay test: the new bound goes red over the failing window **and** stays green over a
   window in which nothing grew, **and** the existing instrument stays green over the failing window.
   Only the first third is currently stated.

## State

`_o_` open. Blocks C8, and blocks C7's stop condition, which is unsound until C8's baseline moves.
