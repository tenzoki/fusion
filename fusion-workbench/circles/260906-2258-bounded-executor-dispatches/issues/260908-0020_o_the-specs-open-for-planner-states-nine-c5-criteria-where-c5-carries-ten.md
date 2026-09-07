The spec's `## Open for Planner` states nine C5 acceptance criteria where C5 carries ten
---
`260907-0820_*_spec-bounded-executor-dispatches.md` `## Open for Planner` writes: "its step 1 calls C5's acceptance criteria eight where the specification states nine". C5's own `**Acceptance criteria:**` list carries ten `- [ ]` items. The sentence that corrects the plan's count is itself off by one, which is `rules/critical-stance.md` §5: the numeral is a second copy of the list's length and it is the copy that drifted. The committed version at `223f916a` carried nine; the fourth revision struck the user-acceptance criterion and added two, giving ten.

The plan `260907-1450_*_plan-bounded-executor-dispatches.md` no longer states any count — its Step 1 names the criteria it means instead — so nothing downstream reads the wrong figure. What is left is the specification's own sentence.

Evidence: `grep -c '^- \[ \]'` over C5's section returns 10 on the working tree of 2026-09-07; the same grep over `git show 223f916a:...` returns 9.

Acceptance test: the sentence in `## Open for Planner` either names the criteria it means or carries a figure that reproduces under that grep.
---
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
Found while pulling the plan through to the specification's fourth revision, at the second of the three places `## Open for Planner` itself names. The plan-side half of that item is done; this is the spec-side half, and the shaper owns that file.
