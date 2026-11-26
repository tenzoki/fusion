# The steering commit route drops the orchestrator's apostrophe check on its absolute paths

---
Step 6 puts `<absolute paths>` inside a single-quoted `bash -c` string, as the orchestrator's Step 4 does, but without that step's check that no staged path contains a `'`. The paths are absolute, so the user's own project location is inside the string; a space in it also splits a path, since nothing quotes each path inside the string. `path=` is workbench-relative and the text does not say to join it to the `WORKBENCH` Step 0 resolved.
---
**Domain:** code
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** review `261126-2111-reviewer-closing-pass-over-13-6-0.md`

**Evidence:** `catalog/profiles/skill-campaign/parts/07-claude.md:17` (rendered `skills/campaign/SKILL.md:137`); compare `catalog/profiles/orchestrator/parts/37-claude.md` ("Before you send it, check that no path in your staging list contains a `'`", rendered `agents/orchestrator.md`, Step 4 sub-step 5). `git reset -q` there empties the index of the steering checkout, where anything staged is the user's own, not a child run's as the orchestrator's text reasons.

**Acceptance:** Step 6 says how the absolute path is formed from `path=`, carries the same apostrophe check, and either quotes each path inside the string or states that a path with a space is an approval matter as the orchestrator does. Within `SKILL_HEAD_ROOM`.
