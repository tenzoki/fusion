# Planner — revision of the C5b remediation plan: two answers folded in, two diagrams repaired

**Date:** 2026-08-04 17:02
**Agent:** planner
**Circle:** `circles/260801-1244-guard-rules-write`
**Status:** Complete
**Target (revised in place):** `circles/260801-1244-guard-rules-write/planning/260804-1633_o_plan-c5b-remediation-and-ship.md`

---

## What this session did

Revised the existing plan in place rather than filing a second one. Two inputs arrived together and were folded together on purpose: the user approved the plan at the gate on condition that the diagrams be repaired, and answered both blocking decisions in the same exchange. Repairing a work-order graph while the dependencies it draws are being redefined is how the graph and the prose came apart in the first place.

## Inputs read

- `decisions/260804-1630_a_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md` — option 1, per-leaf fallback across project, plugin, `DEFAULTS`.
- `decisions/260804-1631_a_may-a-project-file-set-guard-enabled-and-switch-the-whole-guard-off.md` — option 1, the project layer may not set `guard.enabled`, with a mandatory diagnostic.
- `reviews/260804-1644-conceptrev-plan-c5b-remediation-and-ship.md` — verdict `tangled`, five named repairs plus a recurrence note.
- `decisions/260803-1314_o_...` (open) and its two reconciliation entries, to test whether Step 4's conditionality survives.
- `hooks/lib/config.ts` at HEAD `53b3765`, the `DEFAULTS` block and the merge at `:277-300`, to check the leaf-provenance claim rather than assert it.

## Steps changed, and why

| Step | Change | Forced by |
|---|---|---|
| 2 | `hooks/guard.ts` dropped from the file list; three sub-bullets rewritten from questions to answers; new obligation to settle whether the returned configuration carries leaf provenance; consuming-project paragraph rewritten; two verification rows and two falsifiers added | both answers |
| 4 | Conditionality confirmed to survive; the `Step 2` half of its dependency line made explicit; a paragraph on what the answers changed in both directions (option 2 cheaper, option 3 harder to justify) | both answers, and conceptrev finding 1 |
| 5 | Settlement paragraph against Step 7 | conceptrev finding 2 |
| 6 | Decision `260803-1314` added to the dependency line as a dependency either way; `_override` rewrite and the `enabled` exception made named obligations | both answers |
| 7 | Step 5 struck from the dependency line; decisions `260803-1314` and `260803-1402` added; obligation 4 grew the leaf rule; obligations 12 and 13 added | both answers, conceptrev findings 2 and 5 |
| 8 | Dependency line restated as direct prerequisites (Steps 6 and 7) instead of the closure | the edge-per-declaration convention |

Steps 1 and 3 are unchanged apart from one reworded phrase in Step 1's dependency line ("both blocking decisions" no longer describes two answered records).

## Diagram repairs

All five the evaluator named, plus the transitive-edge policy.

1. `S2 --> S4` added. The evaluator's finding 1 and the one that would have misled at the gate.
2. Step 5 settled against Step 7: the dependency line was the error and is struck. All four statements now agree, and Open Question 1 is closed with that settlement recorded.
3. Three arrow shapes for three obligations — solid for a hard gate, thick for a gate conditional on an open decision, dotted for a preference that gates nothing — with the convention stated in prose above the graph.
4. One transitive policy, stated: every edge is one name in one `Dependencies` line and every name is one edge, direct prerequisites only. Checked both ways by hand; 18 edges, 18 declarations.
5. `260803-1402` added as a fourth decision node with its edge to Step 7.
6. Diagram 1's caption reconciled with the six defects it draws, and the `F<n>` identifiers documented as mapping to `260804-160<n>`, which turns the apparent `F5` gap into a stated scope decision. Its three inbound merge edges gained precedence ordinals, which puts the rule decision `260804-1630` answered onto the edges that embody it.

Both blocks rendered with `mmdc` 11.16.0: diagram 1 unchanged at 18 nodes and 17 edges, diagram 2 at 12 nodes and 18 edges, both acyclic and orphan-free.

The evaluator's suggested `subgraph` partition was tried and rejected on evidence: Mermaid routes cluster-crossing edges through the cluster boundary, which bundled the eight edges leaving Steps 1 to 4 into an untraceable ribbon. The partition moved into the node labels and fills instead. The rejection and its reason are stated in the plan.

## Filed

`shared/issues/260804-1702_o_the-diagram-self-check-tests-shape-and-never-tests-agreement-with-the-prose.md`. The evaluator noted this is the second consecutive evaluation in this Circle finding a dependency drawn nowhere. `rules/design-diagrams.md`'s self-check asks five questions about the graph in isolation and none about agreement with the prose, so it cannot catch the class and in fact rewards it — a graph missing an edge scores better on every one of the five. Shared store, not the Circle: a defect in the plugin's authoring rule, found beside this Directive rather than caused by it.

## What did not change

Step content the user approved, beyond what the answers force. Two changes go slightly past a text edit and are called out in the report rather than buried: Step 2 loses `hooks/guard.ts` and gains the leaf-provenance obligation, and Step 6 gains decision `260803-1314` as a dependency. Both follow from the answers; neither reopens anything the user settled.

The plan keeps its filename and its `_o_` marker. Approved is not complete.

## Open after this session

- `260803-1314` is now the single remaining decision between the available work and the ship. The plan previously classed it as ship-gating but not code-blocking; that was accurate only while Step 2 was blocked too.
- `260803-1402` gates Step 7 alone.
- Open Question 2 (whether the eight deferred defects get a fresh reading) is untouched.
