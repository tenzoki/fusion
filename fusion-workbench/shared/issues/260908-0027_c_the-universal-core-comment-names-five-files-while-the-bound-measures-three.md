The universal-core comment names five files while the bound measures three, and a plan read the head-room off it

---
`RULE_BASELINE` in `hooks/lib/__tests__/rules-emission-golden.test.ts` opens its first block with
"The universal core — text every agent applies, and the exact set the HARD bound measures", and
five entries follow. The bound does not measure that set. It computes the core as the intersection
of every agent's emission, and `bin/fusion-rules` emits three files unconditionally:
`agent-setup.md`, `fusion-workbench-conventions.md` and `critical-stance.md`. The other two,
`user-facing-output.md` and `decision-record-examples.md`, moved to derived audiences at the two
gates of 2026-08-27 and the comment did not move with them.

---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>

**What it cost, measured.** A planner sized this Circle's rule-file work off the comment and
recorded 88 836 bytes against a floor of 86 573 and a budget of 98 573, giving 9 737 of head-room.
Summed over the three files the emitter actually emits unconditionally, the floor is 65 498, the
budget 77 498, and the core stood at 73 000 with **4 498** free at the commit the plan measured
against. The recorded margin was more than twice the real one. Nothing was at risk in this Circle,
because the spend was 317 bytes, but the same reading sizes the next one.

**Evidence.** The three unindented `emit_if_exists` lines in `bin/fusion-rules` are the always-on
set; `CLAUDE.md`'s always-on paragraph states in as many words that the indented ones are
conditional and not part of the floor. The five baseline entries are read straight off the comment
block above them. Measured at HEAD `9d99b19d`: `agent-setup.md` 4 181, `fusion-workbench-conventions.md`
58 762, `critical-stance.md` 10 374, total 73 317 of the 77 498 budget.

**Why the comment and not the plan is the defect.** The plan's figure is a point-in-time
measurement in a record that has closed and carries the correction in its reconciliation log. The
comment is live text in the file a person opens precisely when they need this number, and it
asserts the equivalence that made the misreading reasonable. The baseline map itself is correct:
it must hold an entry for every file either measurement reads, core and role-specific alike, so
the five entries are not the error. The sentence claiming those five are the core is.

**Acceptance test.** The comment above the first `RULE_BASELINE` block names the set the hard bound
actually measures, or says plainly that the block's grouping is a historical label and not the
bound's input. A reader who takes the head-room figure from that block arrives at the same number
`growth()` reports for the universal core.

**Cross-references:** `260907-1942_*_message-between-checkouts-read-before-pull.md` `## Reconciliation Log`
(where the misreading is corrected); `260827-0830_*_do-the-decision-record-worked-examples-stay-on-the-always-on-floor.md`
and `260827-0910_*_does-every-dispatch-carry-the-full-user-facing-style-contract.md` (the two gates
that moved the two files off the floor).

---
Resolved: The comment block above `RULE_BASELINE`'s first five entries now says that the block is the
2026-08-14 arming's provenance and not a measurement, that its 86 573 sum is a historical label rather
than the hard bound's input, and that the bound reads the computed intersection — the three entries
marked `core`, floor 65 498, budget 77 498. Each of the five entries carries its own marker naming
which measurement reads it (`core -> HARD bound`, or `role-specific at gate 260827-0830 / -0910 ->
REPORT`), and the second block's comment now states that the REPORT's set is those three plus the two
gated entries above them. The record's own diagnosis held in every part, so nothing in it was
corrected: `bin/fusion-rules` carries exactly three unindented `emit_if_exists` lines (`agent-setup.md`,
`fusion-workbench-conventions.md`, `critical-stance.md`), the golden shows those three at 15 of 15
agent blocks against 6 and 5 for the two gated files, and the three weigh 73 317 against the 77 498
budget. One correction beyond the acceptance test, in the same file and comment-only: the doc comment
above the map opened "The five CORE figures below", the same claim in weaker form, and now reads that
the five took their sizes when all five were the core. No number, baseline value or assertion changed.

Two things a later reader should know. The repair is line-for-line the length of what it replaced,
deliberately: `hooks/lib/__tests__/rules-emission-golden.test.ts` is inside the `hook-tests` surface
bound, a first draft of this comment added 25 lines and failed
`surface-growth-bound.test.ts`'s golden, and spending that surface's head-room on a comment repair
would have been the wrong trade. And one defect in the same doc comment was left standing as out of
scope: it cites "`## Re-baselining: the two events at which the baseline moves`", while
`helpers/growth-bound.ts` has named three events since 2026-09-05.
