The lean-CLAUDE.md rule reaches no agent that writes CLAUDE.md
---
`rules/context-lean-claude-md.md` is shipped but emitted to no agent; implementation-planner, code-implementer, document-editor and reviewer load nothing that says a project's CLAUDE.md takes no topic-bound content or where a design invariant goes instead (module header, topic rule file, decision record).
---
**Filed by:** orchestrator (on the user's instruction), Kai Stalmann <ks@qantr.com>

krk: 44 of 53 plans name CLAUDE.md, 12 name the section `Was man nicht sieht` as a write target; plan-step commits added ~87 KB (48 % of growth), e.g. `55a87679` +12 KB.

Evidence: `261020-0835-why-a-consumers-claude-md-grows-unchecked.md`

**Acceptance:** `bin/fusion-rules` output for those four agents contains a binding rule naming CLAUDE.md's allowed content and the destinations for topic-bound content, and a plan step targeting CLAUDE.md must name why the content binds every session.

---
Resolved: `rules/fusion-workbench-conventions.md` `## A project's CLAUDE.md` (emitted to every agent) names CLAUDE.md's allowed content, the destinations for topic-bound content including `.claude/rules/<topic>.md` with `paths:`, and that a plan step writing CLAUDE.md names why its content binds every session; `rules/context-lean-claude-md.md` `### Step 3` names destinations by kind. `## Rule-file provenance` removed to pay for it; the provenance-header lint case retargeted to `rules/rule-file-provenance.md` on the user's ruling. Plan step 1 of `261020-0927-plan-consumer-claude-md-stays-lean.md`.
