# The campaign skill allows Monitor, which it no longer uses, and not Write, which Step 6 uses

---
The frontmatter of `skills/campaign/SKILL.md` reads `allowed-tools: [Bash, Read, AskUserQuestion, Monitor, TaskStop]`. Since the amendment the watch runs under Bash `run_in_background`, and Step 6 tells the session to `Write` the commit message file.
---
**Domain:** code
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** review `261126-2111-reviewer-closing-pass-over-13-6-0.md`

**Evidence:** `catalog/profiles/skill-campaign/parts/01-claude.md:4` (rendered `skills/campaign/SKILL.md:4`); `parts/07-claude.md:17` ("`Write` its message to `fusion-commit-msg-<session-id>-<act>.txt`"). `skills/cleanup/SKILL.md:4`, which writes its message files the same way, lists `Write`. Not verified: whether the harness prompts for `Write` under default permission mode in this skill; the retest ran in auto mode.

**Acceptance:** `Monitor` is gone from the list and `Write` is on it, or Step 6 writes the message without `Write`.
