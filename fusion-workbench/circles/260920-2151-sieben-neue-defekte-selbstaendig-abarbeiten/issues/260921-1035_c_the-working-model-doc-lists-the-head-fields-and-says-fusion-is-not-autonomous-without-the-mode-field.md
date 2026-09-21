The working-model doc lists the head fields and says fusion is not autonomous, without the `**Mode:**` field
---
`docs/working-model.md` `## 1` (lines 13-29 at `8ef78ffc`) shows the work-item head with `**Claim:**`, `**Active spec/plan:**`, `**Depends-on:**`, `**Cross-references:**` and explains each; `**Mode:**` is neither shown nor explained. `## 3. The gates` (line 102) opens "Fusion is deliberately not autonomous. It stops and hands you the decision at defined points." and lists the plan review among them (line 107). Both were true at `9c7101aa`; at `8ef78ffc` a work item can carry the user's standing answer to the plan review, the claim and finish of that item, and its stop-conditions read (`rules/fusion-workbench-conventions.md` `## Backlog entries — work items`; `agents/orchestrator.md` `## Human Gate Rules`). `README-agents.md` lines 227 and 294 list fields non-exhaustively and need no edit.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260921-0842_*_how-does-a-work-item-tell-the-orchestrator-to-work-it-without-asking.md, 260921-1035-reviewer-mode-autonomous-field-against-its-decision.md

Severity: Low. Scope: `docs/working-model.md`, off every dispatch path.

Acceptance: the head-field walk-through names `**Mode:** autonomous`, what it answers and who writes it; `## 3. The gates` says which of its bullets the field can answer and which never. No golden moves.

---
Resolved: fixed in the commit that carries this line.
