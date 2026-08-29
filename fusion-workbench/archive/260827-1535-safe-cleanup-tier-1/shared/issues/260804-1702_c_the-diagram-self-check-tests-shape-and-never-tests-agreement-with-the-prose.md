The design-diagram self-check tests the graph's shape and never tests whether it agrees with the prose it illustrates

---

`rules/design-diagrams.md` `## Coherence self-check (your cheap first line)` asks the authoring agent five questions, and all five are about the graph in isolation: hairball, fan-out, cycles, layering, orphans. None of them asks whether the graph says the same thing as the document around it. A plan can pass every one of the five and still draw a dependency the prose does not declare, or omit one the prose does.

That is not a hypothetical gap. It has now been the finding in two consecutive `conceptrev` evaluations in the same Circle, against two different plans by the same authoring agent:

- `260802-1909-conceptrev-plan-guard-rules-write.md`, finding 2, verdict `acceptable`: one dependency edge missing from the work-order graph, judged latent because the proposed Turn split happened to enforce the ordering anyway.
- `260804-1644-conceptrev-plan-c5b-remediation-and-ship.md`, findings 1, 2 and 4, verdict `tangled`: the `Step 2 → Step 4` edge missing while Step 4's own text declares it, four statements about Step 5 and Step 7 disagreeing, and a transitive-reduction policy applied inconsistently so a missing edge could not be told from a deliberate omission. The second report names the recurrence explicitly: "in both plans the work-order graph is read at a gate for a partition it does not draw."

---

Both instances are the same defect class, and both fell on the question the human gate was convened to answer, which is where the cost is highest: a reader who trusts the picture starts work that cannot proceed, or approves an ordering the plan does not actually have.

The five shape questions could not have caught either one. A graph with a missing edge is *less* tangled by every measure the checklist names — fewer edges, lower fan-in, no new cycle. The checklist rewards the defect.

What is missing is an agreement check between the graph and the declarations it draws, plus a stated policy on transitive edges so a reader can tell a deliberate omission from a forgotten one. The revised plan at `260804-1633_*_plan-c5b-remediation-and-ship.md` `### Work order` works one such formulation out in place, as a local convention: every edge is one name in one step's `Dependencies` line and every name in every `Dependencies` line is one edge, direct prerequisites only. Whether that is the right general rule for every diagram type is exactly what needs deciding — it is written for a dependency DAG and says nothing useful about a `sequenceDiagram` or an `erDiagram`, so lifting it verbatim into the rule file would be the wrong move.

Filed in the shared store rather than in the Circle: this is a defect in the plugin's own authoring rule, not something the guard/rules-write Directive caused. It was found next to that work, which is the Origin Rule's shared case.

Touches `rules/design-diagrams.md`, which is on `guard.protectedPaths` — a fix needs the Human Gate or `FUSION_ALLOW_RULES_WRITE`, and `rules/protected-path-discipline.md` governs how.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `rules/design-diagrams.md:47-54` still lists only the five shape questions and says nothing about agreement with the prose. The `conceptrev` agent that produced the motivating findings was retired on 2026-08-15, which does not touch the rule text this record is about. Marker stays open. Log: `260817-1836-reconciliation.md`.

---
Resolved: fixed — the self-check gains an agreement question (every edge a declared dependency, every declared dependency an edge, the same test against the prose's relations for other types); rules/design-diagrams.md:54
