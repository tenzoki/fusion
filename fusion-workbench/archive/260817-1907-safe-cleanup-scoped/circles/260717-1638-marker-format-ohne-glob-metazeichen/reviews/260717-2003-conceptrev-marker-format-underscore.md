# Concept Evaluation: Implementation Plan — state markers bracket → underscore

**Date:** 2026-07-17 20:03
**Target:** `260717-1959[o]-plan-marker-format-underscore.md`
**Verdict:** clean
**Diagrams evaluated:** 2  |  **Validation:** by-tool (mmdc)

## Verdict

Both diagrams are coherent and both faithfully represent the plan. The phase-dependency graph is a clean 7-node DAG: no cycles, a sensible fan-out of 3 on the entry phase, top-down layering that reads without any edge fighting the grain, and every one of its 9 edges maps to a dependency the plan actually declares in its step list. The delimiter-transformation graph is a clean before/after mapping — two labelled subgraphs, four parallel edges, no cycles, no orphans. Nothing structural is wrong. The only observations are cosmetic and do not move the verdict.

## Per-diagram measurements

| # | Type | Nodes | Edges | Max fan-out | Cycles | Layered | Verdict |
|---|------|-------|-------|-------------|--------|---------|---------|
| 1 | flowchart TD (phase DAG) | 7 | 9 | 3 (`P0`) | 0 | yes (TD) | clean |
| 2 | flowchart LR (transform) | 8 | 4 | 1 | 0 | yes (2 subgraphs) | clean |

## Findings

No substantive findings. Two cosmetic notes for completeness — neither is a design defect:

- **Diagram 1 — mixed transitive-reduction convention (cosmetic).** The graph draws `P0 --> P3` even though `P0 --> P1 --> P3` already connects those phases, so that edge is transitively redundant. At `P6`, by contrast, the author *did* reduce — `P6` depends on Steps 1–6 in the prose, but the graph draws only `P5 --> P6` and `P2 --> P6` (the minimal set that still reaches every predecessor). So one phase shows declared-but-redundant edges and another shows the reduction. This is defensible either way: `P0 --> P3` faithfully mirrors the plan's explicit "Dependencies: Steps 1 and 2" for Step 4. It reads as a drawing-convention inconsistency, not a wrong dependency. If the author wants uniformity, either reduce `P0 --> P3` away or add the analogous declared edges into `P6` — a matter of taste, not correctness.

- **Diagram 2 — unlabeled edges (cosmetic).** The four `A_n --> B_n` edges carry no verb. On a semantic graph an unlabeled edge can hide meaning, but here the two subgraph captions ("Bracket form — glob metacharacter" / "Underscore form — inert") already carry the relation, and the transform is uniform across all four rows, so the meaning is unambiguous. A single `|becomes|` label would be marginally clearer; its absence hides nothing.

**Faithfulness to the plan (the load-bearing question).** The plan is a 7-step sequence, each step tagged Phase 0 through Phase 6 (seven phases; the "6-phase" framing in the dispatch under-counts by one — Phase 0 is a real phase with real work and its own node). The graph's seven nodes match the seven steps one-to-one, and every declared step dependency appears as an edge with no spurious edges added. `P0` correctly has no incoming edge (Step 1 depends on nothing); `P6` correctly sits at the sink (Step 7 depends on everything). The graph is an accurate measurement of the plan's actual dependency structure.

The type choice fits both times: a dependency ordering drawn as `flowchart TD` (the DAG), and a before/after value mapping drawn as `flowchart LR` with subgraphs — both exactly what the diagram-type table calls for.
