Plan steps write CLAUDE.md past every approval, contradicting the policy-curator's premise
---
`agents/policy-curator.md` (its opening scope section) states every edit to CLAUDE.md comes through the curator behind approval; in practice plan steps executed by code-implementer edit it with no gate (`agents/code-implementer.md` grants code-level documentation without excluding CLAUDE.md; `agents/data-implementer.md` opens on any task naming the file).
---
**Filed by:** orchestrator (on the user's instruction), Kai Stalmann <ks@qantr.com>

krk since 2026-08-16: 46 of 57 commits touching CLAUDE.md came from paths other than the curator.

Evidence: `261020-0835-why-a-consumers-claude-md-grows-unchecked.md`

**Acceptance:** Either the curator text is corrected to state the actual writers, or edits to CLAUDE.md by executors are routed/gated as the text claims; the prompt and the behaviour agree.

---
Resolved: on the user's ruling D2 option 1 with D4 option 3, `agents/policy-curator.md` now names two writers of CLAUDE.md (a plan step an implementer executes, behind plan approval, and the curator, behind its ledger), both bounded by `rules/fusion-workbench-conventions.md` `## A project's CLAUDE.md`; the sole-path phrase left `skills/curate/SKILL.md`; the planner's step template carries a `CLAUDE.md:` field and the orchestrator's plan review lists every step whose Files names CLAUDE.md. Plan step 2 of `261020-0927-plan-consumer-claude-md-stays-lean.md`.
