log-activity calls itself cleanup's Step 6 and it is Step 5

---

`skills/log-activity/SKILL.md` opens "This is the activity-log step of `/fusion:cleanup` (its Step 6)". The activity log is Step 5. `skills/cleanup/SKILL.md`'s selector table fixes the numbering, and `skills/curate/SKILL.md` correctly claims Step 6 for itself, so two bodies now claim one number.

---
**Filed by:** planner, Kai Stalmann <ks@qantr.com>

**Evidence.** `skills/log-activity/SKILL.md`, first paragraph after the H1. Against `skills/cleanup/SKILL.md` `## Arguments`, whose table reads `log-activity` at Step 5 and `claude-md` at Step 6, and `skills/curate/SKILL.md`, whose first paragraph says "its Step 6, the pipeline's last before housekeeping".

**Why it is a new record rather than a note on an old one.** `260907-1942_*_the-cleanup-pipelines-step-numbering-has-drifted-in-its-own-body-and-in-readme-agents.md` enumerated four drift sites in `skills/cleanup/SKILL.md` and one in `README-agents.md`, and is closed with all three acceptance clauses met; it never names `skills/log-activity/SKILL.md`. `260907-2332_*_two-descriptions-of-the-cleanup-run-order-reverse-the-last-two-steps.md` is open and covers the two sentences that reverse Steps 5 and 6 in `README-agents.md` and in cleanup's own frontmatter; it names no step number and does not reach this site either. This is the third site and no record covers it.

**Origin.** Found while reading the three existing cleanup step bodies as precedents for a fourth, during the planning of `260908-1410-cut-skills-surface-add-post-body`. That Circle touches no row in `skills/log-activity/SKILL.md`, so the defect was found next to the work rather than caused by it.

**Acceptance test.** `skills/log-activity/SKILL.md`'s opening paragraph names Step 5, and no two skill bodies claim the same cleanup step number.
