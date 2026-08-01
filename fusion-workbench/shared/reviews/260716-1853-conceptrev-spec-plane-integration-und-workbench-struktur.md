# Concept Evaluation: Spec — Plane-Anbindung und Umstrukturierung der workbench

**Date:** 2026-07-16 18:53
**Target:** `fusion-workbench/planning/260716-1847[o]-spec-plane-integration-und-workbench-struktur.md`
**Verdict:** acceptable
**Diagrams evaluated:** 1  |  **Validation:** by-tool (mmdc, exit 0)

## Verdict

The graph is sound and the design it shows is coherent. One diagram, 11 nodes, 13 edges, acyclic, no god-node (max fan-out 3), no orphans, every node reachable from the entry node `A`. The type fits: a `graph TD` decomposition of a request into two strands plus a constraint is exactly what a flowchart is for, and the four decision nodes are visually distinguished by fill rather than by a second diagram — the right call. The verdict is `acceptable` rather than `clean` for one substantive reason: the load-bearing sequencing claim of the whole spec — "Umbau zuerst" — rides on a single unlabeled edge (`I --> F`), which is the one relation in the graph a reader cannot recover without the prose.

## Per-diagram measurements

| # | Type | Nodes | Edges | Edge/node | Max fan-out | Max fan-in | Cycles | Layered | Verdict |
|---|------|-------|-------|-----------|-------------|------------|--------|---------|---------|
| 1 | flowchart (`graph TD`) | 11 | 13 | 1.18 | 3 (`A`, `E`) | 2 (`C`, `F`, `G`) | 0 | direction only, no subgraphs | acceptable |

Density is low and honest — 1.18 edges per node on a decomposition graph is the shape you want. No hairball indication.

## Findings

**1. The sequencing dependency is unlabeled — substantive.** `I["C1: Circle als Container"] --> F["C3: Übertragung in Plane"]` is the only edge that crosses from the Umbau strand into the Plane strand. It carries the spec's central recommendation ("Circle 2 setzt Circle 1 voraus", §Vorschlag zum Zuschnitt) and its central architectural argument (the new structure is what Plane modules map onto). Every dotted edge in the graph is labeled; this solid one, which asserts more than any of them, is not. A reader tracing the graph sees a bare arrow and cannot tell whether it means "precedes", "enables", or "is consumed by". Label it (`-->|"setzt voraus"|`) — that is a labeling gap, not a design defect. The dependency itself is correctly directed and correctly placed.

**2. Edge semantics from decision node `E` are inconsistent — cosmetic.** `E` has three outgoing edges: `E --> F` and `E --> G` are unlabeled, while `E -.->|"blockiert Umfang"| K` is labeled. All three plausibly mean "blocks", and the prose confirms it ("Blockiert auf D1" appears in C3, C4 and the D4 framing). The graph presents one relation in two visual grammars. Reading the prose resolves it; reading the graph alone does not.

**3. No `subgraph` blocks for the two strands — cosmetic, defensible.** Rule 3 in `rules/design-diagrams.md` calls for visible layering. The two strands (`B`-side and `C`-side) are named in node labels rather than drawn as containers. At 11 nodes with a clean top-down read this costs the reader nothing, and the `A` fan-out makes the split legible without boxes. Wrapping `B/E/F/G` and `C/H/I/J` in subgraphs would make the strand independence — the spec's first finding — visible in the graph rather than only in the node text. Worth doing if the diagram is revised for other reasons; not worth a revision on its own.

**4. `D -.->|"geprüft: berührt Umbau nicht"| C` draws a non-relation — noted, not a defect.** An edge that asserts the *absence* of a constraint is unusual graph semantics: structurally it reads as a dependency, textually it denies one. It works here because the label is explicit and because the finding it carries (hooks do not constrain the restructure, verified against `hooks/config.json:12-22`) is the most consequential claim in the spec and deserves to be on the graph. Calling it out so a future reader does not mistake it for a live coupling.

**No cycles, no god-node, no orphans.** `A` and `E` both fan out to 3, which is proportionate — `A` is the request root, `E` is the acknowledged blocking decision (D1). Neither is a god-node candidate. The dominance of `D1`/`E` in the graph correctly mirrors the prose's claim that D1 gates the scope of C3 and C4; the graph and the argument agree, which is the check that matters.

## What a clean redraw would require

Not applicable — the verdict is not `tangled`. The design is sound; the graph has a labeling gap, not a structural one. If the spec is revised at the gate for other reasons, labeling `I --> F` and normalising the `E`-outgoing edge grammar would carry it to `clean`.
