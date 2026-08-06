# Concept Evaluation: Implementation Plan "Die Textschicht des Plugins gegen den Code nachziehen"

**Date:** 2026-08-05 23:59
**Target:** `circles/260805-2005-textschicht-gegen-code-nachziehen/planning/260805-2353_o_plan-textschicht-gegen-code.md`
**Verdict:** acceptable
**Diagrams evaluated:** 1  |  **Validation:** by-tool (mmdc 11.16.0)

## Verdict

The plan's single diagram, the step dependency DAG, is structurally sound: it parses, it is acyclic, it is layered into the three tracks the prose describes, and its density is proportionate to a 17-step plan. The verdict is acceptable rather than clean because the graph omits five dependency edges the plan's own prose declares. Batch B (step 11) and Batch C (step 12) appear as free-starting source nodes although the prose gates both on the citation-form decision D1 plus prior steps, and the step-9-before-step-10 ordering that the Risks table calls out explicitly is likewise missing as an edge. The design itself is coherent; the drawing under-reports it, and the caption's claim "decisions gate the text layer" is not what the drawn edges say for two of the five text-layer batches.

## Per-diagram measurements

| # | Type | Nodes | Edges | Max fan-out | Max fan-in | Cycles | Layered | Verdict |
|---|------|-------|-------|-------------|------------|--------|---------|---------|
| 1 | flowchart TD | 18 | 23 | 4 (`G`) | 7 (`S17`) | 0 | yes (3 subgraphs, TD) | acceptable |

Density 23/18 = 1.28 edges per node — moderate and appropriate for a dependency DAG. Topological sort completes over all 18 nodes (verified by script), so the graph is acyclic. No orphans: every node has at least one edge and every node reaches the single sink `S17`.

## Findings

**1. Substantive — the graph omits five declared dependency edges, contradicting its own caption (diagram 1, nodes `S10`, `S11`, `S12`).**
The prose declares dependencies the graph does not draw:

- Step 10 (`S10`, Batch A) declares "D1 answered; **step 9** (avoid double-touching the conventions file)", and the Risks table repeats it ("Explicit ordering: step 9 first, step 10 depends on it"). The edge `S9 --> S10` is absent; the graph shows the two as parallel.
- Step 11 (`S11`, Batch B) declares "D1 answered; step 8". `S11` has **no incoming edges at all** — it is a source node in the graph. Missing: `G -->|D1 answered| S11` and `S8 --> S11`.
- Step 12 (`S12`, Batch C) declares "D1 answered; steps 4–7". `S12` also has **no incoming edges**. Missing: `G -->|D1 answered| S12` and the gate on the Track 1 fixes (steps 4–7, "don't correct a comment a code fix is about to rewrite").

The consequence is concrete: an executor scheduling from the graph alone would start Batches B and C immediately, before the citation-form decision D1 is answered. That is precisely the double-touch hazard the plan's own Approach section argues against ("decide the citation form first, or everything is touched twice"). The prose is right and internally consistent; the graph is the artifact that misstates it. This is a drawing-accuracy defect, not evidence of a design defect, which is why the verdict is acceptable rather than tangled.

**2. Cosmetic — `S17`'s fan-in of 7 is a legitimate sink, not a god-node.**
Step 17 is the bookkeeping pass that closes the findings ledger; the prose says it depends on all prior steps, and the graph correctly draws only the transitive reduction (S8–S13 reach `S17` through `S14`/`S15`). High fan-in on a terminal closure node reflects its role. No action needed.

**3. Cosmetic — edge labels are used exactly where the relation carries meaning.**
The four `G` out-edges are labeled with which decision unblocks each step ("D1 answered", "D2 answered", "D3 answered"); the remaining edges are plain precedence, where a label would add nothing. Consistent with the design-diagram rule's labeling guidance.

Positive observations, for calibration: diagram type matches content (`flowchart TD` is the rubric's prescribed form for task dependency ordering), the three `subgraph` blocks make the track layering visible, every drawn edge runs with the top-down grain, and the graph carries one concern only (dependency ordering — no architecture or sequence mixed in). Steps 14, 15, and 16 match their prose dependencies edge-for-edge (verified against the prose dependency lines; `G --> S14` is correctly elided as transitive through `S10`/`S13`).

## What a clean redraw would require

Not applicable at tangled severity, but the concrete gap for a revision is small and mechanical: add the five missing edges (`S9 --> S10`, `G -->|D1 answered| S11`, `S8 --> S11`, `G -->|D1 answered| S12`, and an edge from the Track 1 fixes to `S12`, e.g. via a join node or `S4..S7 --> S12`) so the drawn graph states the same ordering the prose and the Risks table already commit to. No design change is needed; the prose dependency structure is coherent as written.

---
References: diagram source extracted and parse-validated with `@mermaid-js/mermaid-cli` 11.16.0; graph metrics (node/edge counts, fan-in/out, topological sort, source/sink sets) computed by script over the extracted block. Prior conceptrev reviews in `shared/reviews/` (260716, 260722) concern other Circles; none covers this plan.
