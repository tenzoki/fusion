The Grounding's "first write outside the workbench" claim was already false when it was written

---

`260823-0023-settle-what-travels-between-checkouts` `## Grounding snapshot` states, of the merge-driver decision:

> **this is the first time `/fusion:setup` writes a file outside `fusion-workbench/`.** Every write it performs today lands inside the workbench it creates, which is what makes the skill safe to run in a directory whose other contents nobody has looked at.

`skills/setup/SKILL.md` Step 0g already writes two files at the project root, and had done so before this Circle was shaped.

---

1. `.claude/settings.local.json`, created or merged into, at `pwd`. The step's own text: *"Target: `.claude/settings.local.json` in `pwd` — the project root Step 0 reported. Merge into any existing file; never overwrite one."*
2. `.gitignore`, appended to. The step's own text: *"Check `.gitignore` for either `.claude/settings.local.json` or `.claude/`; if neither matches, append `.claude/settings.local.json` to `.gitignore`. This step is not optional."*

So the property the Grounding treats as intact, that every Setup write lands inside the workbench, was gone before the merge-driver decision was taken. Step 0g was added when `/fusion:unlock` folded into Setup on 2026-08-15 (`260815-0029_*_what-permission-grant-does-setup-seed-when-unlock-becomes-a-setup-step.md`).

## What is and is not affected

**The decision stands.** The user chose the behaviour, that `/fusion:setup` creates or amends a root `.gitattributes`, and the reasoning offered alongside it does not change what was chosen. Nothing in C2 needs re-deciding.

**The accepted cost was stated against a fact that did not hold.** The Grounding records the write as "an accepted but significant change of property". It is not a change of property; it is a second instance of one Step 0g already established. That matters for a later reader, who would otherwise reconstruct a history in which `/fusion:setup` was workbench-only until 2026-08-23.

**It changes the plan for the better rather than for the worse.** Step 0g is a worked convention for a project-root write from Setup: read first, add only, never remove an existing entry, write only in `pwd` and never a subfolder, report the outcome either way in the Done report. C2's merge-driver step reuses that shape instead of inventing a second one. Recorded in `260823-0800_*_c2-what-travels-between-checkouts-is-settled.md` `## Current State`.

## Verified

Read at HEAD `3ee8eaf`: `skills/setup/SKILL.md` Step 0g sections 1, 2 and 3, and the `## Grounding snapshot` paragraph in this Circle's record.

**Found by:** planner, while planning C2.

---
Resolved: the user corrected the sentence by hand in `_t_circle.md` `## Grounding snapshot` on 260823, before the closure rename. The Grounding now records that Step 0g already writes `.claude/settings.local.json` and appends to `.gitignore` at the project root, so the merge driver is the third such write rather than the first, and Step 0g is a worked convention rather than a precedent being set.

No agent could perform this correction. The shaper is the only writer of a Circle record's `## Grounding snapshot`, and its mode 3 halted: neither of its two scope values covers a Grounding-only correction on a Circle whose `**Active spec/plan:**` cites a file. That gap is filed as `260823-1455_*_the-shapers-mode-3-has-no-scope-value-for-a-grounding-only-correction-and-halts-on-the-only-case-that-needs-one.md`, and it is why this record closes against a human edit rather than an agent's.

---
Amended by reconciler, second Coherence pass, 260823-2130-reconciliation.md. **The resolution note above describes a
state that no longer stands, and its central figure was wrong when written.**

It records the correction made by hand in `2ec2bc2` and repeats that edit's claim that the merge
driver is "the third such write", naming only Step 0g's two files. That was wrong by one:
`skills/setup/SKILL.md` Step 0f writes `./fusion.json` at the project root and has done so since
`92db96a` (2026-08-16), nineteen days before this Circle record existed. So this record closed against
a correction that was itself inaccurate — which is why the note is amended rather than left to stand
as the account of how the defect was fixed.

`a40b330` supersedes it. The Grounding now reads "**`/fusion:setup` already writes outside
`fusion-workbench/`.** Step 0f writes `./fusion.json`, and Step 0g writes `.claude/settings.local.json`
and appends a line to `.gitignore`, all at the project root and all older than this Circle." The
ordinal is dropped rather than corrected, because counted by files the driver is the fourth and counted
by steps the third, and the number carried no information while having been wrong in both directions.

Verified at HEAD against `skills/setup/SKILL.md:245-268` and `:270-313`, and by grepping every write in
the skill body for a project-root target: the corrected sentence is complete as well as true. The
closure stands; only the account of it needed repair. The undercount was filed and closed separately as
`260823-1635_*_the-corrected-grounding-undercounts-setups-project-root-writes-and-omits-step-0f.md_*`.
