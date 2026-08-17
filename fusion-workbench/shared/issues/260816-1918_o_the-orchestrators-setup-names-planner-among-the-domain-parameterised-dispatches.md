The orchestrator's Setup names `planner` among the domain-parameterised dispatches, and `agents/planner.md` parses no `**Domain:**` line

---

`agents/orchestrator.md:156` introduces the workbench-domain heuristic as producing "the default `domain` parameter for `taskplanner`, `reconciler`, and `planner` dispatches in this session". `agents/planner.md` has no `## Domain` section and no parse of a `**Domain:**` line; its parameter block reads `**Executors:**` and `**Circle:**` only (`agents/planner.md:47-53`).

`CLAUDE.md` `## Conventions` names this exact defect class and names this exact instance: "a second copy is how the planner came to be listed as domain-parameterised in four places while `agents/planner.md` never parsed the string". The authoritative roster is `README-agents.md` `## Dispatch parameters`, which lists three domain-parameterised agents, and `planner` is not among them.

---

Found while planning the guard-removal Circle, reading the orchestrator's Setup Step 5 for the guard check two lines above it. It has no connection to that Directive, so it is filed in the shared store under the Origin Rule rather than in the Circle.

The cost is small and specific: an orchestrator that follows this line prefixes a planner dispatch with a parameter the planner ignores, which is harmless, and a reader who trusts it looks for domain handling in `agents/planner.md` and does not find it. The fix is one word deleted from `:156`. The value of filing it is that this is the fourth known site of the same wrong claim, and `CLAUDE.md` already records that closing three of them left the fourth standing.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `agents/orchestrator.md:151` still names `planner` among the domain-parameterised dispatches while `agents/planner.md` parses no `**Domain:**` line. The same file already gets it right at `:191`, so it now contradicts itself. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.
