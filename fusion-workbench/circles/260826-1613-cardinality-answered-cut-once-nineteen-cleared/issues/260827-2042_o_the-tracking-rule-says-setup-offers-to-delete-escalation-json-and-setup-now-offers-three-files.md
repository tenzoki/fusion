The tracking rule says Setup offers to delete escalation.json, and Setup now offers three files

---
`rules/workbench-tracking.md:30` (commit `3fda829`, step 18a): "Nothing reads them, and `/fusion:setup` offers to delete `escalation.json`." `skills/setup/SKILL.md:429-443` (commit `abb0238`, step 18b, five commits later) probes and offers all three leftovers in one question. Two halves of one record, landed in one Circle, and the rule half describes the skill as it stood between them.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Cross-references:** `shared/issues/260827-0315_*_the-guard-state-rule-accounts-for-one-inert-leftover-and-the-directory-holds-three.md` (the record both halves closed)

## Fix direction

`rules/workbench-tracking.md:30`: "and `/fusion:setup` offers to delete all three". Not bounded (emitted to no agent).

## Acceptance

The rule names the same set the skill's `rm -f` line removes.
