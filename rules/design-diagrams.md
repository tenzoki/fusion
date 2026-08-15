# Design Diagrams — formal, parseable representation of technical design

**Provenance:** No motivating record recoverable; introduced in `git:bd5f6e6`.

This rule is loaded for the planning and analysis agents (`planner`, `analyst`, `taskplanner`, `shaper`, `investigator`). It governs **how technical design is represented** in the documents these agents produce.

The core idea: **a diagram of a design is also a measurement of that design.** A clear graph — few crossing edges, visible layering, sensible fan-out, no unexplained cycles — reflects a clear architecture. A tangled hairball reflects a tangled one. So the diagram is not decoration; it is evidence. For that evidence to be usable, it must be in a **formal, parseable form** — Mermaid — that you and the human at the gate can both read and judge unambiguously.

ASCII art is **rejected** for structural design. It is ambiguous, it cannot be parsed, and it cannot be evaluated. Use it only for throwaway sketches that never enter a deliverable.

## When to include a diagram

Include a Mermaid diagram whenever the document describes structure worth seeing:

- **Component / architecture shape** — modules, services, packages and how they relate.
- **Control or data flow** — how a request, a value, or an event moves through the system.
- **State / lifecycle** — an entity that moves through named states with transitions.
- **Dependency ordering** — tasks, build steps, or work items with prerequisites (a DAG).
- **Interaction sequence** — who calls whom, in what order, across components or agents.
- **Data model** — entities and their relationships.

Do **not** force a diagram where there is nothing structural to show — a one-file edit, a single linear change, a pure prose argument. A diagram that adds no information is noise. Judgement is yours; the test is "would a reader understand the design faster *with* this graph than without it?"

## Which diagram type

| Content | Mermaid type |
|---|---|
| Architecture, components, dependency graph | `flowchart` / `graph` (use `subgraph` for layers) |
| Interactions over time, call sequences | `sequenceDiagram` |
| Lifecycle, status machines | `stateDiagram-v2` |
| Data / entity model | `erDiagram` |
| Type / class structure (code design) | `classDiagram` |
| Task / step dependency ordering | `flowchart TD` (the DAG) |

When in doubt, a directed `flowchart` with named edges covers most design content.

## Authoring rules

1. **Valid, parseable Mermaid.** Fence every diagram as a ` ```mermaid ` block. It must parse — a diagram that does not parse is worse than none, because it signals a design you could not even formalise. Re-read your own syntax before finalising.
2. **Label edges where the relation carries meaning.** `A -->|publishes| B` beats a bare `A --> B` when the verb matters. Unlabeled edges on a semantic graph hide the design.
3. **Make layering visible.** Use `subgraph` blocks and an explicit `direction` (`TD`, `LR`) so the reader sees tiers, not a flat soup of nodes.
4. **Name nodes for intent, not implementation** — consistent with `HYG-INTENT-NAMES` where the project ships coding-hygiene rules.
5. **One diagram, one concern.** If a single graph tries to show architecture *and* sequence *and* data model at once, split it. Overloaded diagrams are the visual form of an overloaded module.

## Coherence self-check

Before you finalise a diagram, read it as a critic would. This check is the only structural assessment the graph gets before the human at the gate reads it, so run it rather than assume something downstream will. An obvious hairball should never leave your hands:

- **Hairball test** — is the edge count wildly out of proportion to the node count? Dense crossing edges usually mean missing structure (a layer or grouping you have not drawn), not genuine complexity.
- **Fan-out** — does one node point at almost everything? A god-node in the graph is usually a god-object in the design.
- **Cycles** — are there unexplained cycles? A dependency cycle in the graph is a dependency cycle in the architecture (cf. `HYG-NO-CYCLES`). If a cycle is intentional, say why in the prose.
- **Layering** — can you draw a clean direction (top-down / left-right) without edges fighting it? Edges that run against the grain signal a boundary violation.
- **Orphans** — is every node reachable and connected? A floating node is a piece of design with no stated relationship.

If your own diagram fails these, the fix is almost never "draw it neater" — it is "the design has the problem the graph is showing you." Fix the design, then redraw. This is `HYG-FIX-DESIGN` applied to the picture.

This is why the formal form matters: a parseable graph is one a reader can check claim by claim. Write it so that an honest reading of it holds up at the gate.
