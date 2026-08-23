The Grounding's "first write outside the workbench" claim was already false when it was written

---

`circles/260823-0023-settle-what-travels-between-checkouts/_t_circle.md` `## Grounding snapshot` states, of the merge-driver decision:

> **this is the first time `/fusion:setup` writes a file outside `fusion-workbench/`.** Every write it performs today lands inside the workbench it creates, which is what makes the skill safe to run in a directory whose other contents nobody has looked at.

`skills/setup/SKILL.md` Step 0g already writes two files at the project root, and had done so before this Circle was shaped.

---

1. `.claude/settings.local.json`, created or merged into, at `pwd`. The step's own text: *"Target: `.claude/settings.local.json` in `pwd` — the project root Step 0 reported. Merge into any existing file; never overwrite one."*
2. `.gitignore`, appended to. The step's own text: *"Check `.gitignore` for either `.claude/settings.local.json` or `.claude/`; if neither matches, append `.claude/settings.local.json` to `.gitignore`. This step is not optional."*

So the property the Grounding treats as intact, that every Setup write lands inside the workbench, was gone before the merge-driver decision was taken. Step 0g was added when `/fusion:unlock` folded into Setup on 2026-08-15 (`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-0029_*_what-permission-grant-does-setup-seed-when-unlock-becomes-a-setup-step.md`).

## What is and is not affected

**The decision stands.** The user chose the behaviour, that `/fusion:setup` creates or amends a root `.gitattributes`, and the reasoning offered alongside it does not change what was chosen. Nothing in C2 needs re-deciding.

**The accepted cost was stated against a fact that did not hold.** The Grounding records the write as "an accepted but significant change of property". It is not a change of property; it is a second instance of one Step 0g already established. That matters for a later reader, who would otherwise reconstruct a history in which `/fusion:setup` was workbench-only until 2026-08-23.

**It changes the plan for the better rather than for the worse.** Step 0g is a worked convention for a project-root write from Setup: read first, add only, never remove an existing entry, write only in `pwd` and never a subfolder, report the outcome either way in the Done report. C2's merge-driver step reuses that shape instead of inventing a second one. Recorded in `circles/260823-0023-settle-what-travels-between-checkouts/planning/260823-0800_*_c2-what-travels-between-checkouts-is-settled.md` `## Current State`.

## Verified

Read at HEAD `3ee8eaf`: `skills/setup/SKILL.md` Step 0g sections 1, 2 and 3, and the `## Grounding snapshot` paragraph in this Circle's record.

**Found by:** planner, while planning C2.
