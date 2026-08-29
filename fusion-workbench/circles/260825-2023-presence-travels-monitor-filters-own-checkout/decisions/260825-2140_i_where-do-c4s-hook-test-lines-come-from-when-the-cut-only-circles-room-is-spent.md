# Where do C4's hook-test lines come from, now that the cut-only Circle's room is spent?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`260822-1102_*_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md`
(answered: a cut-only Circle runs first, and the rebuild starts against the room it produces);
`260822-1154_*_does-the-hook-test-line-budget-cover-comment-prose.md`
(the adjacent open question about what the surface counts, which this one does not answer and does not need answered);
`hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining` (the two events at which a baseline moves);
`hooks/lib/__tests__/surface-growth-bound.test.ts` (the three surface budgets);
`260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`
step 10, the step this question blocks

---

## Question

C4 adds one executable, `bin/fusion-events`, and changes the event window of `bin/monitor`. Both are
program logic that this project tests: every one of the five `bin/` helpers with behaviour has a test
file under `hooks/lib/__tests__/`, and the monitor's other reader of a JSONL log has one at 1 102
lines. The hook-test surface has **0 lines** of head-room, measured at HEAD on 260825 by summing
`TEST_LINE_BASELINE` over the tree: 20 375 lines against a budget of 20 375.

The standing answer to "what happens when the room is gone" was given on 260822 and has been spent.
The user chose a cut-only Circle, C0, over paying per step and over declaring a third re-baselining
moment. C0 ran, produced 302 lines on this surface, and C1 through C3 consumed all 302. The answer
said the rebuild "starts against the room it produces"; it did not say what the rebuild does when the
room runs out before the last capability. That is this question, and it arrives at the one capability
that adds executable code rather than record text.

The three other bounded surfaces are not in this condition. `agents/*.md` has 3 007 bytes and
`skills/*/SKILL.md` 1 923, and the plan's step 5 returns bytes to both by replacing a repeated shell
block with a helper call. The always-on rule core has 14 bytes, and the plan writes nothing into it:
its rule text lands in `rules/workbench-tracking.md`, which `bin/fusion-rules` emits to no agent and
which therefore falls on no bounded surface. The hook-test surface is the only one where the plan
cannot route around the bound.

## Options

1. **Ship the new logic untested, name the gap, and file it.** No test lines, no cut, no baseline
   movement. The Circle closes with a defect record saying which behaviour has no gate.
   - Pros: costs nothing anywhere and needs no user decision beyond this one. It has a precedent:
     `bin/fusion-prose-metric` shipped untested in exactly this condition.
   - Cons: that precedent was **enumerated as one of the four defects C0 existed to clear**, so the
     project has already ruled once that this outcome is a defect rather than a resolution. It would
     also leave the checkout filter untested, and the checkout filter is the half of this Circle that
     decides what a person sees on a running dashboard.
2. **Cut the same number of lines from the hook-test surface, in the same Turn, and name the cut.**
   Option 2 of the 260822 record, re-taken for one surface and one Circle rather than for the rebuild.
   - Pros: no baseline moves, so the instrument keeps its meaning, which is the property the user
     bought by rejecting options 2 and 3 there. The trade is priced where a human can still refuse it.
   - Cons: it is the option the user rejected. It makes a Circle about presence also a reduction task
     in test files it has no other reason to open, and the cut has to come out of coverage that exists
     rather than out of slack, because there is no slack: the surface is at exactly its budget.
3. **A second cut-only Circle runs first**, on the hook-test surface alone, with C4's measured test
   requirement as its test.
   - Pros: the answer the user already gave, applied again at the moment its room ran out, which is
     the reading most faithful to what was decided on 260822.
   - Cons: it puts a Circle in front of the last capability of five, after four have run, and the size
     of the cut needed is known only once C4's tests are written. It also asks a second Circle to cut
     a surface that one Circle has already cut once.

## Constraints

- No baseline may move outside the two events written down in
  `hooks/lib/__tests__/helpers/growth-bound.ts`, and a Circle wanting room is neither. That constraint
  survives every option here.
- Whatever is chosen has to be checkable by the command that measures the bound, so that the claim
  "this Circle stayed inside its terms" is verified rather than asserted.
- The figures above are measured at HEAD on 260825 and will move with any edit to a test file. Any
  answer has to survive being re-measured at the moment step 10 begins.
- Options 2 and 3 both need a number that does not exist yet. The plan's step 10 states its own
  estimate, roughly 200 to 300 lines, from the sizes of the comparable existing test files; the real
  figure is known when the tests are written.

## Recommendation

None on the choice, which trades the instrument's credibility against this Circle's coverage and is
the user's. Two observations that bear on it.

The condition is not the same as the one C0 was created for. There the four bounded surfaces were all
short and the work was record text, which can be written smaller. Here one surface is short and the
work is a program, which cannot: a test either exercises the checkout filter or it does not.

And the plan is arranged so that this question blocks one step and not the Circle. Steps 1 through 9
touch no test line, so the presence report, the monitor filter and the single Turn count can all be
built and read while this is open. What waits on the answer is whether they are gated.

---
Answered: 260825-2123-orchestrator-session.md `## Decision answered — the hook-test lines` — option 2, the user's own answer at the orchestrator's gate on 2026-08-26: cut an equal number of lines from the hook-test surface in the same Turn as the addition, name the cut, and move no baseline.

---
Implemented: `c649556` and `46de871` — option 2 realised in the same Turn, exactly as answered. `c649556` cut 262 lines from `hooks/lib/__tests__/**` and named each cut (`guard-bash-integration.test.ts` 393→304, `guard-project-config-integration.test.ts` 423→250); `46de871` added the coverage (`fusion-events.test.ts` 166 lines new, `monitor-warnings-panel.test.ts` 1102→1136). Verified at HEAD `7774d56`: the hook-test surface stands at 20 349 lines against a 20 375 budget, so the addition was more than paid for; `git diff 73ca11c..HEAD` over `hooks/lib/__tests__/surface-growth-bound.test.ts`, `rules-emission-golden.test.ts` and `helpers/growth-bound.ts` is empty, so no baseline map moved; `cd hooks && npm test` exits 0, 44 files, 776 tests.
