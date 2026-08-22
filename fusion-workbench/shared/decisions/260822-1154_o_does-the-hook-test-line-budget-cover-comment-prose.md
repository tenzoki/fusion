# Does the hook-test line budget cover comment prose?

---
**Domain:** code
**Filed by:** planner
**Cross-references:** `circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0144_*_the-authoritative-prose-metric-has-no-test-and-the-hook-test-surface-has-43-of-2500-lines-left.md` (raises the question and declines to answer it); `circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2204_*_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md` (the measured instance: six lines of attribution comment against a stopping criterion); `hooks/lib/__tests__/surface-growth-bound.test.ts` `## Where each head-room comes from`; `shared/decisions/260822-1154_o_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md`

---

## Question

The hook test surface is bounded in **lines**, and the reason it is measured in lines rather than bytes is stated in the file that bounds it: "every line is maintenance and suite wall-clock, paid on every run." A comment line is neither. It is not maintained in the sense a test case is, and vitest does not spend a millisecond on it.

7 167 of the surface's 20 363 lines are comment, 35 per cent. That is not an incidental overhang; it is how this project writes its gates, and the conventions that produce it are good ones. `hooks/lib/__tests__/reference-resolution-lint.test.ts` asks for a written attribution above its count pin every time the pin moves, which is why the pin can be trusted. `hooks/lib/__tests__/helpers/growth-bound.ts` requires an arming's absolution text to survive as text so the request the instrument was making outlives the number moving.

The two collide, and the collision has been measured twice. A Circle spent six of its remaining lines on an attribution the convention asked for and could not meet its own stopping criterion as a result. A Circle before it left `bin/fusion-prose-metric` untested because the surface had 108 lines and the test would not fit, while 40 lines of the same Turn's allocation went to comment above a constant.

So: is a comment line on this surface the same kind of cost as a test line, and if it is not, what does the instrument do about it?

## Options

1. **Yes, and nothing changes.** A line is a line. The surface bounds the tree's size and does not ask what a line contains.
   - Pros: the measurement stays trivially reproducible from `find … | wc -l`, which is what makes the bound arguable at all. No new classifier, no new exemption, no new thing to keep true. And a convention that costs nothing is a convention nobody sizes: the collision is what makes the project decide whether an attribution block is worth its lines, which it did, correctly, by consolidating two into one.
   - Cons: the surface charges prose obligations against a budget derived from what test code costs to maintain and to run, which is a category error stated in the file's own words. And it makes the two conventions above adversaries of each other on a fixed budget, which is a pressure toward writing the attribution shorter than the pin deserves.
2. **No. Exclude comment and blank lines from the count, and recompute `TEST_LINE_BASELINE` under the new rule in the same commit.**
   - Pros: charges the budget for what the budget's own stated reason says it charges for. Removes the pressure to under-write an attribution. The nearest precedent already exists: `fixtures/` is inside the surface's walk and falls out for being machine-written records rather than TypeScript anybody maintains, so the surface already distinguishes a line's kind.
   - Cons: **recomputing the baseline is not one of the two re-baselining events**, and the user rejected declaring a third (`260822-1102`, option 3). Taking this option without recomputing is worse: total would drop 20 363 to 11 544 against an unmoved floor of 17 875, absolving every line of growth the surface holds. It also needs a comment classifier that agrees with itself across JSDoc, block comments, and a string containing `//`, which is a new mechanism on a surface whose value is that its measurement is a single shell command.
3. **No, but narrowly: exempt only the attribution blocks a gate's own re-approval convention asks for, by an explicit marker.**
   - Pros: touches the one case both measured instances are about, and leaves everything else alone. Smaller than option 2 and needs no general classifier.
   - Cons: the exemption is opt-in by a marker, so it is available to any comment somebody wants off the budget, which is the exemption the instrument exists to refuse handing itself. It also needs the same baseline recomputation option 2 needs, in proportion to how many blocks carry the marker on the day it arms.

## Constraints

- Any option that changes what the surface counts requires `TEST_LINE_BASELINE` to be recomputed under the new rule, and that is neither of the two re-baselining events. The user has rejected a third. So options 2 and 3 are not reachable without either an answer to that or a deliberate arming, which is event 2 and has its own written form.
- A shrink must never trip the bound, and no option may make the surface pass on a measurement of something other than what it claims to measure.
- The measurement's reproducibility from `git` is load-bearing. The current head-room was derived by replaying 40 commit-days, and a rule that cannot be replayed the same way over the same history cannot be checked.

## Recommendation

None yet, and that is the honest position. The question is not answerable inside C0: every option that changes the count needs a baseline recomputation C0 is forbidden to make, and option 1 is not an answer so much as the status quo carried forward. What C0 can do is remove the pressure — 300 lines of head-room is enough that the next attribution block does not have to be written against a wall — and leave the question standing for a Circle that can also move a baseline at an arming.

Two things worth carrying into whoever answers it. The `fixtures/` exclusion is a real precedent for distinguishing a line's kind on this surface and should be read before option 2 is judged impractical. And the strongest argument for option 1 is not that a comment costs wall-clock; it is that a budget somebody has to spend is what made this project consolidate two attribution blocks into one, which was the right edit and would not have happened under a free allowance.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:
