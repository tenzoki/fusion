# Concept Evaluation: Plan: Provenance header on rule files (C8)

**Date:** 2026-08-02 11:38
**Sender:** conceptrev
**Target:** `circles/260801-1244-rule-provenance-header/planning/260802-1131_o_plan-rule-provenance-header.md`
**Verdict:** acceptable
**Diagrams evaluated:** 2  |  **Validation:** by-tool (mermaid 11 parser under a jsdom shim; both blocks return `flowchart-v2`)

## Verdict

Both graphs are structurally sound, and one of the two is a line short of complete. They are sparse (4 nodes with 6 edges, and 8 nodes with 7 edges), acyclic, free of orphans, and their maximum fan-out is 3 and 2, so neither points at a god-object or hides a dependency loop. `flowchart TD` is the right type for both, a step-dependency ordering and a control flow. The one substantive gap sits in the second graph, the gate's control flow: the terminal node names the array `missing`, but no edge shows that array being accumulated across the ten rule files, so the graph reads as one file producing one suite failure when the design collects every offending file and reports them together. The step-order graph in `### Work order` needs nothing. Its three unlabelled edges and its three transitively redundant edges are faithful transcriptions of the dependency lines the plan states in prose, not authoring slips.

## Per-diagram measurements

| # | Where | Type | Nodes | Edges | Edge/node | Max fan-out | Max fan-in | Cycles | Orphans | Subgraphs | Longest path | Verdict |
|---|-------|------|-------|-------|-----------|-------------|------------|--------|---------|-----------|--------------|---------|
| 1 (line 62) | `### Work order` | `flowchart TD` | 4 | 6 | 1.50 | 3 (`S1`) | 3 (`S4`) | 0 | 0 | 0 | 3 | clean |
| 2 (line 79) | `### Gate structure` | `flowchart TD` | 8 | 7 | 0.88 | 2 (`RE`) | 1 (all) | 0 | 0 | 0 | 6 | acceptable |

Diagram 1: single root `S1`, single leaf `S4`. Unlabelled edges 3 of 6 (`S3->S4`, `S2->S4`, `S1->S4`). Transitively redundant edges 3 of 6 (`S1->S3`, `S2->S4`, `S1->S4`), so the transitive reduction is the straight chain `S1 -> S2 -> S3 -> S4`.

Diagram 2: single root `READDIR`, two leaves `HIT` and `FAIL`. Unlabelled edges 4 of 7 (`READDIR->READ`, `READ->WINDOW`, `MISS->REPORT`, `REPORT->FAIL`).

Both blocks were extracted verbatim, passed through `mermaid.parse`, and then measured by reading the parser's own vertex and edge tables rather than by eye. Degree, reachability, depth-first cycle detection, longest path, and transitive reduction were computed from those tables. Every node label survived parsing intact, including `expect(missing).toEqual([]) fails npm test`, whose square brackets nested inside a quoted label were the one syntax risk worth checking with a tool instead of by reading.

## Findings

**1. The gate graph names the accumulator but never shows it being filled. (Medium, substantive)**

In `### Gate structure`, the terminal node `FAIL` reads `expect(missing).toEqual([]) fails npm test`, and `REPORT` reads `report(): file, the missing-header statement, the fix, the admission form`. Both refer to `missing`, the array of files that failed the check. No edge in the graph produces that array. The path from `MISS` ("no header: null") to `REPORT` to `FAIL` has fan-in 1 at every node, so the graph shows one headerless file travelling alone to a suite failure.

The design does something else. Step 3 specifies `report(missing: string[])` emitting "one block per file" (line 282), and the corpus test collects `rel` for every gated file whose `headerLine` is `null` before asserting once (line 299). The real shape is a fan-in: ten files are scanned, the failures accumulate into one list, and one assertion consumes it. That fan-in is the reason the gate's failure output is legible in the first place, because a developer who removes headers from three files sees all three named in a single run rather than fixing one and rerunning.

The consequence is narrow but real. A reader working from the graph alone cannot tell where `missing` comes from, and would infer a per-file abort rather than a corpus sweep. The design is not at fault here; the drawing under-reports it, in the same way the spec's graph under-reported the conventions file's second role.

The correction is structural rather than a redesign. Enclosing `READ`, `WINDOW`, `RE`, `HIT` and `MISS` in a `subgraph` labelled as the per-file scan, then drawing one labelled edge out of that subgraph into `REPORT` such as `-->|"collected across all gated files"|`, makes the boundary between per-file work and corpus-level reporting visible and gives `missing` a visible origin. Authoring rule 3 in `rules/design-diagrams.md` covers the subgraph half of this.

**2. Iteration is carried by edge and node labels rather than by structure. (Low)**

Two loops are stated in text inside the graph rather than drawn. `READ` carries "per file" in its node label, and the edge `WINDOW -->|"each of the 10 lines"| RE` carries the inner scan over the header window. A flowchart's usual device for a loop is a back edge, which would have made this graph cyclic and drawn a cycle finding from this evaluation.

We read the author's choice as a deliberate and defensible trade, not an oversight: a false cycle would have been the worse error, and the labels do state the iteration accurately. It is recorded as Low because the subgraph correction in finding 1 resolves it as a side effect, by making the per-file region visible as a region.

**3. The success path terminates without a stated outcome, while the failure path does not. (Low)**

`HIT` ("header found: 1-based line number") is a leaf with fan-out 0. Nothing consumes it. The failure branch from `RE` runs three nodes deep to an explicit `FAIL`, so the graph is asymmetric about its two outcomes.

The design does give `HIT` a consumer. Step 3 states that returning the line number rather than a boolean "is what lets a test assert the window boundary exactly" (line 280), and four window tests depend on it, including the one asserting `headerLine` returns `10` for a header on line 10. A node whose value is load-bearing in the test design appears in the graph as a dead end. One further node or one labelled edge would close the asymmetry.

**4. The work-order graph draws the transitive closure of its dependencies rather than the reduction. (Low, and arguably correct as drawn)**

Three of the six edges in `### Work order` are implied by others: `S1->S3` follows from `S1 -> S2 -> S3`, and `S2->S4` and `S1->S4` follow from the chain to `S4`. Removing them leaves the straight line `S1 -> S2 -> S3 -> S4`, which is the design's actual shape. The redundancy is what raises `S1`'s fan-out to 3 and `S4`'s fan-in to 3, and a reader who took those numbers as branching would be reading structure that is not there.

We do not call this a defect. Each drawn edge matches a dependency the plan declares in prose: Step 3 declares "Steps 1 and 2" and Step 4 declares "Steps 1, 2 and 3". The graph is an accurate transcription of the plan's own declarations, and the two labelled edges sit exactly on the two orderings whose rationale is not self-evident, the reason the gate lands after the backfill and the reason the conventions section lands before the gate. That is authoring rule 2 applied well. The note is recorded so that the fan-out and fan-in figures in the table above are not misread as evidence of branching work.

**Correctly handled, and worth naming so the executor does not treat these as defects.**

The absence of `subgraph` blocks in diagram 1 is right. A four-node chain has no tiers to show, and a subgraph there would be decoration. The terse node identifiers (`RE`, `READDIR`, `S1`) sit against authoring rule 4's preference for intent names, but identifiers are not what a reader sees rendered, and every visible label states its intent plainly. Neither point is worth an executor's attention.

**Density is not a problem in either graph.** At 1.50 and 0.88 edges per node, with maximum fan-out of 3 and 2, both are far below any hairball threshold. The acyclicity is a property of the design rather than an artefact of small drawings: the work order is genuinely sequential because the plan requires a green suite at every commit boundary, and the gate's control flow is genuinely a pipeline.

**No missing diagram.** The two graphs cover the two places in this plan where structure is worth seeing, the step ordering and the gate's control flow. The remaining candidate is the test taxonomy in Step 3, which groups tests into corpus, window, pattern, negative fixtures and real-file checks. That is a categorisation without relations between its members, and the plan's prose list serves it better than a graph would. Forcing a diagram there would add nodes and no information.

## Notes on scope of this evaluation

This plan's input spec was evaluated earlier today at `circles/260801-1244-rule-provenance-header/reviews/260802-1108-conceptrev-spec-rule-provenance-header.md`, verdict acceptable on a missing-edge finding. The plan's graphs are new work rather than a redraw of the spec's graph, so nothing here re-litigates that verdict. The four prior `conceptrev` verdicts in `shared/reviews/` cover the Plane integration and the Circle-container restructure and do not touch this Circle.

This evaluation judges the two diagrams against `rules/design-diagrams.md`. It does not verify the plan's factual claims, among them the commit hashes in the backfill table, the line numbers cited in `bin/fusion-rules`, and the assertion that the three sibling lint gates share the shape Step 3 follows.
