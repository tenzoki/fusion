# Concept Evaluation: Plan — remove eight mechanisms, collapse the administrative surface, extend the failing cap

**Date:** 2026-08-15 00:44
**Target:** `fusion-workbench/circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md`
**Verdict:** acceptable
**Diagrams evaluated:** 2  |  **Validation:** by-tool (mermaid-cli 11.16.0, both blocks rendered to SVG)

## Verdict

Both graphs are structurally sound, and the dependency graph is the stronger of the two documents in this plan: it is acyclic, it carries no god-node, and every one of the fifteen dependency statements written into the step blocks is satisfied by a path in it. The document lands at acceptable rather than clean for two reasons, neither of them a defect in a graph. The plan's prose contradicts its own diagram on step numbers in three places, and in the one unambiguous case the diagram is right and the sentence is wrong, which matters because both surfaces are read at the gate. The second diagram then draws four measured surfaces converging on a single hard-bound node, while the step it illustrates gives each surface its own baseline map, its own floor and its own separately derived head-room. The picture reads as one pooled budget where the design specifies four independent ones.

Density is not a problem in either graph and was not treated as one. The first diagram is a tree with an edge-to-node ratio of 0.94, which is as sparse as a dependency graph gets; the plan states plainly that the work is one chain, and the graph does not invent a serialization the step blocks do not already declare.

## Per-diagram measurements

| # | Type | Nodes | Edges | Ratio | Max fan-out | Max fan-in | Cycles | Components | Layered | Verdict |
|---|------|-------|-------|-------|-------------|------------|--------|------------|---------|---------|
| 1 | `flowchart TD`, 1 subgraph | 18 | 17 | 0.94 | 1 (all nodes) | 2 (`S9`, `S12`) | 0 | 1 | yes, subgraph + explicit `direction` | clean |
| 2 | `flowchart LR`, 2 subgraphs | 11 | 8 | 0.73 | 1 (all nodes) | 4 (`HB2`) | 0 | 4 at node level, 2 clusters | yes, two tiers (before / after) | acceptable |

Supporting counts. Diagram 1: three sources (`S1`, `D1`, `D2`), one sink (`S15`), longest path `S1 → … → S15` at 15 nodes and 14 edges, no isolated node, 10 of 17 edges labeled, node and edge counts confirmed against the rendered SVG (18 node groups, 17 link paths). The graph is exactly a tree: 18 nodes and 17 edges with no cycle. Diagram 2: sources `R`, `RX`, `R2`, `A2`, `K2`, `T2`, `RX2`; sinks `HB1`, `RP1`, `HB2`, `RP2`; 3 of 8 edges labeled; the eighth edge is a cluster-to-cluster link (`today --> after`) rather than a node-to-node one, and it renders. The four node-level components are the four measurement pathways, hard bound and report-only, before and after; no node floats.

## Findings

### 1. The plan's prose numbers three steps differently from the diagram, and the diagram is the correct surface

**Substantive for the reader at the gate, and not a graph defect.** The diagram's node labels match the numbered step list exactly: fifteen numbered steps, with the curator's `CLAUDE.md` pass drawn as gate `G1` between step 12 and step 13, and step 13 being the cap extension. Three sentences in the plan's prose use a different numbering.

The unambiguous case is `## Approach` point 5, which states that "step 15 re-takes" the before-measurement. Step 15 is release preparation; step 14 is the after-measurement, which the step-1 body itself names correctly when it says the identical block is re-run at step 14. The plan therefore contradicts itself, and the diagram sides with the correct half.

Two further sentences, the `**Decidability:**` line and `## Approach` point 2, place the curator's pass "at step 13". Gate `G1` sits immediately before step 13, so the phrase admits a charitable reading as the gate attached to that step's start. The reading is available, but it is not the one a reader arrives at after reading the numbered list, where step 13 arms the growth bound.

The practical risk is worth stating because the plan itself argues that step 13 must come last: an executor following the prose could take "step 13" to mean the curator pass and arm the cap before the removals have settled, which is the single outcome the record forbids. Correcting three sentences of prose resolves it. The diagram should not be redrawn.

### 2. Diagram 2 draws one hard bound where the design specifies four independent ones

The `after` subgraph shows `agents/*.md bytes`, `skills/*/SKILL.md bytes`, `hook test lines` and the always-on rule core all pointing into a single node labelled `hard bound · FAILS`, on five unlabeled edges. Step 13 specifies something more particular: each surface gets "its own baseline map keyed by file, its own floor summed over the files present, and its own head-room", each head-room derived from that surface's own `git log` replay rather than transplanted from the rules figure. The subgraph title, "four surfaces, one instrument", is accurate about the mechanism and the reason the extension is one test helper rather than two. The graph underneath it says something stronger, that four surfaces feed one threshold.

The difference is material rather than cosmetic. A pooled bound would let growth in `agents/` be paid for by shrinkage in `skills/`, which is the property the plan spends a paragraph refusing. A reader who takes the design from the picture takes away the pooled version. Splitting `HB2` into per-surface bound nodes, or labelling the four edges with the unit and the separate floor each carries, would close the gap. The `today` half already labels its two edges with the mechanism (`growth() vs RULE_BASELINE`), so the omission is also an asymmetry between the two halves of one graph.

### 3. The chain is evidenced, not assumed, and the subgraph label is more accurate than the prose it summarises

Worth recording in the plan's favour, because a fifteen-node path invites the suspicion of a serialization nobody checked. Every dependency declared in the step blocks is satisfied by a path in the graph, checked one by one: steps 2 through 15 each name their immediate predecessor and each has the corresponding edge; step 6's additional constraint that it must precede step 11, and step 11's restatement of it, are satisfied transitively; the two blocking decisions appear as `D1` and `D2` with dotted edges into exactly the two steps whose dependency lines name them, step 9 and step 12. The graph adds no constraint the plan does not declare.

The `removals` subgraph is labelled "sequential on `agents/orchestrator.md`", and that grouping holds up against the step file lists. Eight of the ten enclosed steps declare edits to `agents/orchestrator.md`: steps 2, 4, 6, 7, 8, 9, 10 and 11. The two that do not, steps 3 and 5, are the structured-data halves of the Plane and churn removals, and their ordering carries its own labelled reason on its own edge, "citations gone, files deletable" and "citations gone, leaves removable". No step outside the subgraph edits that file.

The `## Current State` sentence that the subgraph label summarises does not hold up as well. It claims "nine of the sixteen steps touch `agents/orchestrator.md`" and enumerates Plane, churn, the tasklist, `conceptrev`, the domain values, the counters, the administrative surface and both measurements. Two of the enumerated items are wrong against the plan's own file lists: the administrative surface, step 12, names `agents/curator.md` and not the orchestrator, and the two measurement steps read that file inside a `wc -c` command without editing it. Folding `investigator` into `analyst`, step 8, does edit it and is missing from the list. The count is eight editing steps. The correction belongs in the prose; the diagram's grouping is unaffected.

### 4. Edge labels follow one consistent convention, which is why the sparse graph still carries information

Diagram 1 labels an edge when the transition changes the state of the tree, and leaves it bare when the edge is pure sequence. Each of the eight solid labels reads as a post-condition of its source step rather than as a justification for its target: "before figures recorded" after step 1, "circle-stash's max_turns reader gone" after step 6, "review sender set reduced" after step 7, "tasklist out of Setup's read" after step 10. The two dotted labels use the other voice, "answer required before", which is correct for an input that blocks rather than a state that has been reached. Read against `rules/design-diagrams.md` authoring rule 2, the seven bare edges are the ones where a verb would add nothing. No finding here; the convention is worth keeping in the next plan.

### 5. Two cosmetic notes

Both blocks restate the direction they already declared: `flowchart TD` followed by `direction TB`, and `flowchart LR` followed by `direction LR`. The restatement is inert and both blocks render.

The cluster-to-cluster edge in diagram 2 (`today --> after`) is the one construct here whose portability is not established. It parses and renders correctly under mermaid-cli 11.16.0, which is what was verified; support for edges between subgraph containers has historically varied between renderers, so a reader viewing the plan through a different Mermaid version may not see the transition arrow that carries the "baselines taken AFTER the removals" caption. Inference, not measurement: no second renderer was tested. If that caption is load-bearing at the gate, moving it into the `after` subgraph title removes the dependency.

## What a clean redraw would require

Not applicable. The verdict is acceptable and neither graph needs redrawing. The two changes worth making are a three-sentence correction to the plan's prose so it stops disagreeing with its own diagram on step numbers, and either a split of `HB2` into per-surface bound nodes or four edge labels naming each surface's own floor, so that the picture stops implying a pooled budget the design does not have.
