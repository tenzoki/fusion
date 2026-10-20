The lean-CLAUDE.md rule reaches no agent that writes CLAUDE.md
---
`rules/context-lean-claude-md.md` is shipped but emitted to no agent; implementation-planner, code-implementer, document-editor and reviewer load nothing that says a project's CLAUDE.md takes no topic-bound content or where a design invariant goes instead (module header, topic rule file, decision record).
---
**Filed by:** orchestrator (on the user's instruction), Kai Stalmann <ks@qantr.com>

krk: 44 of 53 plans name CLAUDE.md, 12 name the section `Was man nicht sieht` as a write target; plan-step commits added ~87 KB (48 % of growth), e.g. `55a87679` +12 KB.

Evidence: `261020-0835-why-a-consumers-claude-md-grows-unchecked.md`

**Acceptance:** `bin/fusion-rules` output for those four agents contains a binding rule naming CLAUDE.md's allowed content and the destinations for topic-bound content, and a plan step targeting CLAUDE.md must name why the content binds every session.
