# Concept Evaluation: Implementation Plan — fusion's documentation agrees with the plugin at v8.1.0

**Date:** 2026-08-13 18:31
**Target:** `260813-1820_*_documentation-matches-shipped-plugin.md`
**Verdict:** acceptable
**Diagrams evaluated:** 2  |  **Validation:** by-tool (`@mermaid-js/mermaid-cli@11`, with a negative control)

## Verdict

The design both graphs describe is sound, and neither graph hides anything. There is no cycle, no god-node, no hairball, and no type mismatch; both diagrams parse and render, and the second one uses exactly the layered `flowchart TD` the rubric prescribes for a task DAG. The verdict stops short of clean for one reason, and it is a reason worth the human's attention at the gate: the dependency DAG in diagram 2 disagrees with the step list it draws. One stated dependency is missing from the picture, and one claim the plan makes about its own dependency structure is refuted by the graph the plan itself supplies. Neither breaks the schedule. Both are the kind of small factual drift this Circle exists to eliminate elsewhere in the repository, which is what makes them worth correcting here rather than waving through.

## Per-diagram measurements

| # | Type | Nodes | Edges | Edge/node | Max fan-out | Max fan-in | Cycles | Layered | Orphans | Verdict |
|---|------|-------|-------|-----------|-------------|------------|--------|---------|---------|---------|
| 1 | flowchart LR | 10 | 9 | 0.90 | 2 (`R`, `D`, `S`) | 2 (`B`) | 0 | direction only, no subgraph | 0 | clean |
| 2 | flowchart TD | 10 steps + 5 subgraphs | 8 (4 Turn chain, 4 dependency) | 0.53 | 1 (`S2`, `S3`, `S4`, `S6`) | 2 (`S6`) | 0 | yes, 5 `subgraph` + explicit `direction` | 0 substantive (see F3) | acceptable |

Validation detail: both blocks were extracted and rendered to SVG and PNG with `mermaid-cli` 11 at exit 0. A deliberately malformed block was fed to the same binary and produced no output, so the two clean renders are evidence rather than an absent failure.

## Findings

**F1 — Diagram 2 omits one stated dependency (Medium, substantive).** Step 4 declares `Dependencies: step 3` at line 129, and no edge `S3 --> S4` appears in the graph. The omission is not a deliberate economy, because the drawing rule everywhere else in the diagram is to render cross-Turn dependencies as labeled dotted edges: `S3 -.-> S6`, `S4 -.-> S6` and `S6 -.-> S7` are all drawn even though the `T1 --> T2 --> T3 --> T4` chain already implies each of them. Step 4's dependency on step 3 is implied the same way and is the only one left to containment. A reader reconstructing the DAG from the picture gets a graph missing an edge, and gets a shorter critical path than the plan actually has: with the edge restored the chain is `S2 → S3 → S4 → S6 → S7`, five steps rather than four. The Turn packing still absorbs it, since `S2 → S3` sits inside Turn 1, so this costs the schedule nothing. It costs the diagram its completeness.

**F2 — The graph refutes the plan's "only step" claim (Medium, substantive).** The Risks table at line 193 justifies step 10 as the deferral candidate on the grounds that it "is the only step with no dependency in either direction". The DAG shows five such steps, not one: `S1`, `S5`, `S8`, `S9` and `S10` all have in-degree and out-degree zero, and each step entry confirms it with `Dependencies: none` and no other step naming it. The conclusion survives — step 10 is still the right thing to defer, because it is last in the packing and the other four are early and cheap — but the reason given for it is false, and the diagram is what makes that visible. Line 210's narrower phrasing, that step 10 "depends on nothing and nothing depends on it", is accurate and needs no change. Only the word "only" at line 193 does.

**F3 — Four zero-degree nodes in diagram 2 are honest, not orphans (no action).** `S5`, `S8`, `S9` and `S10` carry no edges, and `S1` carries none either. A naive orphan metric would flag all five. Each one's step entry independently states `Dependencies: none`, and containment inside an ordered Turn subgraph places every one of them in the schedule. This is a correction pass over a bounded list of largely independent documentation defects, so a sparse DAG is the truthful shape of the work. Recorded here so the measurement is not mistaken for a defect on a later reading.

**F4 — Dotted-versus-solid carries no declared meaning, and shifts between the two diagrams (Low, cosmetic).** In diagram 2, `S2 -->|table complete before the parser| S3` is solid while the three cross-Turn dependencies are dotted, yet all four are hard dependencies of identical force in the step list; the line style tracks whether the edge crosses a Turn boundary, which no legend or prose states. In diagram 1 the single dotted edge `G -.->|search aid, never a verdict| B` means something different again, closer to a caveat on an input that must never become a verdict. Both readings are recoverable from the labels, which is why this is cosmetic. It is worth a sentence of prose or a consistent convention rather than a redraw.

**Diagram 1 is clean, and it earns its place.** The decision tree is the plan's method constraint made checkable. All three diamonds split disjointly and completely — `artifact-side referent?`, `do they agree?`, `does the claim decay silently?` — and the tree's four terminals map onto the Decidability head paragraph without drift: `P` carries the undecidable class that gets authored rather than verdicted, and `M` carries the sub-class that decays silently and moves to a gate or gets deleted. The `G` node is the sharpest element in either diagram. It is a source with no incoming edge whose only edge points at "read both sides" under the label "search aid, never a verdict", which encodes in the graph the withdrawn grep-count claim this Circle was shaped around. Fan-out never exceeds 2 and the rendered layout has no crossing edges.

**Diagram coverage is right.** Two diagrams for this plan is the correct number. The method procedure and the ordered work queue are the two structural things worth seeing, and both are drawn. The three-layer configuration merge described inside step 5 is a fact about an existing mechanism rather than a shape this plan proposes, and forcing a third diagram onto it would add noise. No structural content in the document is left undrawn.

## What a clean redraw would require

The verdict is not tangled, so no redraw is called for. Two edits would take the document to clean, and both are corrections to text rather than to the design:

1. Add `S3 -.->|"gate in place before README-agents is reshaped"| S4` to diagram 2, matching the label style already used on the other three cross-Turn dependencies. Nothing else in the graph moves.
2. Correct the Risks table at line 193 so the justification for deferring step 10 rests on its position at the end of the packing rather than on a uniqueness that four other steps share.

Optionally, one sentence under diagram 2 stating what a dotted edge means would close F4.

---

**Reconciled 260813-2258-reconciliation.md. Neither recommendation was applied, and the second one matters more now than it did when it was written.** Recommendation 1, the `S3 -.-> S4` edge in diagram 2: the plan's diagram at `:96-97` still carries only the two edges into `S6`. Recommendation 2, the risk row at `:197`: it still reads "It is the only step with no dependency in either direction". Counted from the plan's own `Dependencies:` lines, steps 1, 5, 8, 9 and 10 each have none, and none of them has a dependent — five steps share the property. Step 10 was in fact deferred at the Turn 4 gate, so that sentence is now the written justification for a decision that was taken, and it is wrong about the uniqueness while right about the consequence: nothing depends on step 10, so deferring it blocked nothing. This review is advisory and no issue was filed against it; the finding is restated in the plan's `## Reconciliation Log`.
