The head-room raise log states 84 stripped lines where the file strips to 81

---
`README-hooks.md:556`, in the paragraph justifying the second `TEST_LINE_HEAD_ROOM` raise:

> The file is 131 lines against 33 of margin. … stripped of every comment and every blank line the
> file is still **84 lines**, so deleting all of its reasoning … still leaves it **51 over**.

`hooks/lib/__tests__/claude-md-weight.test.ts` is 131 lines: 23 blank, 24 beginning `//`, 3
single-line `/** … */` doc comments, leaving **81**. The 3-line gap is exactly the three JSDoc lines
— a count that took the `//` lines and the blanks and missed them. 81 − 33 = **48 over**, not 51.

Every other figure in the entry is exact and was re-derived: the raise 2 595 → 2 693 (+98), the floor
19 228 summed from `TEST_LINE_BASELINE`, the budget 21 921, the surface 21 921 at `d3ff530c` giving
zero margin, 21 790 after `da1c62ed` giving 33, 21 814 at `92cd2491` giving 9, the retired gate's
−24 net (`git show --numstat da1c62ed`: +6/−30), and the +193 still standing against the derived
2 500. This one figure is the exception, and the argument it supports survives it — the file is over
either way.

It matters because the same section was corrected four hours earlier for the same class of fault:
`260916-0734_*_the-head-room-raise-log-states-a-surface-total-and-two-margins-that-no-committed-tree-holds.md`,
cleared in `1dc04c71`. A figure stated bare in prose is what `rules/critical-stance.md` §5 asks to be
enumerated, derived or commit-stamped, and this one is none of the three.

**Acceptance test:** the sentence states the stripped-line count and the resulting overage that
`awk`/`grep` over the committed file produce, or names the command that produces them instead of
stating a figure.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
Cross-references: `260916-0734_*_the-head-room-raise-log-states-a-surface-total-and-two-margins-that-no-committed-tree-holds.md` (the same section, the same class, cleared in this range).
