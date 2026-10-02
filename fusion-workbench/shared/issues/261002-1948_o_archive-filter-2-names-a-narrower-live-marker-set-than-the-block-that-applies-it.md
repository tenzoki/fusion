Archive filter 2 names a narrower live-marker set than the step-3 block that applies it to a container
---
`skills/archive/SKILL.md` `## Safety filters (apply to ALL modes)` filter 2 now excludes "a `done` or `dropped` work package holding any record above". The records above are `_o_`/`_p_`/`_d_` defects and plans and `_a_` decisions. The step-3 selection block also excludes a container for an `_o_` or `_d_` decision and an `_o_` discussion (`case … in (o|p|a|d)` over `issues`, `plans`, `planning`, `discussions`, `decisions`), and the step-3 paragraph `**A live line is filter 2 reaching inside the container**` lists that wider set. Two enumerations of one rule, and they disagree.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261002-1723_*_archive-moves-a-done-work-package-whole-and-takes-an-open-issue-inside-it-out-of-every-scan.md

Severity: Low. The block's behaviour is the defensible one: no tier ever selects an `_o_` or `_d_` decision or an `_o_` discussion from the shared store, so a container holding one should not take it out either. The defect is that the filter text, which `skills/help/SKILL.md` `### 4. Update` cites as the authority for 12.2.2's fix, states less than the code does.

Acceptance: the marker set a container is excluded for is enumerated once (filter 2 or the step-3 paragraph), the other place cites it, and the enumeration matches the `case` pattern in the block.
