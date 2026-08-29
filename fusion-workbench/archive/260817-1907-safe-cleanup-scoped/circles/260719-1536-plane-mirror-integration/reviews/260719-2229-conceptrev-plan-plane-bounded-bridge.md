# Concept Evaluation: Plane bounded bridge plan

**Date:** 2026-07-19 22:29
**Target:** `260719-2223_*_plan-plane-bounded-bridge.md`
**Verdict:** acceptable
**Diagrams evaluated:** 3  |  **Validation:** by-tool (mmdc, all three exit 0)

## Verdict

The design's formal representation is coherent. The step-dependency DAG is acyclic and its 14 edges match the per-step "Dependencies:" lines exactly — no phantom edge, no missing prerequisite. The architecture and sequence diagrams both express the plan's single-`reconcile(circle)` design faithfully: every trigger point calls the same `push --circle <dir>`, and `reconcile` sits as a deliberate hub, not an accidental god-node. Two soft spots keep this from clean: the push-sequence (diagram 2) draws only the happy path and never shows the never-silent deferred-status return that C4 makes load-bearing, and the seeding flow (agenda item 4) has no diagram of its own — it is prose plus a partial appearance inside diagram 1. Both are completeness gaps covered elsewhere in the document, not structural defects, so the verdict is acceptable, not tangled.

Note on the brief: the dispatch named four diagrams. The document contains three Mermaid blocks. There is no dedicated "seeding flow" diagram — that is one of the two findings below.

## Per-diagram measurements

| # | Type | Nodes | Edges | Max fan-out | Max fan-in | Cycles | Layered | Verdict |
|---|------|-------|-------|-------------|------------|--------|---------|---------|
| 1 | flowchart TB | 10 | 10 | 3 (`REC`) | 6 (`REC`) | 2 (both explained) | yes (3 subgraphs) | clean |
| 2 | sequenceDiagram | 4 | 11 msgs + 3 notes | — | — | — (linear) | n/a | acceptable |
| 3 | flowchart TD (DAG) | 8 | 14 | 4 (`S2`,`S3`) | 5 (`S8`) | 0 (acyclic) | yes | clean |

## Findings

**Diagram 3 (step DAG) — acyclic and edge-exact against the Dependencies lines. Confirmed clean.**
Every edge in the graph is backed by a "Dependencies:" line and vice versa:

| Step | DAG incoming | Plan "Dependencies:" | Match |
|---|---|---|---|
| S1 | — | none | yes |
| S2 | S1 | Step 1 | yes |
| S3 | S2 | Step 2 | yes |
| S4 | S3 | Step 3 | yes |
| S5 | S2, S3 | Step 2, Step 3 | yes |
| S6 | S3, S4 | Step 3, Step 4 | yes |
| S7 | S1, S2 | Step 1, Step 2 | yes |
| S8 | S2, S3, S4, S5, S6 | Steps 2–6 | yes |

No back edges; the graph flows strictly S1→…→S8. Max fan-in 5 on `S8` (the test step) is expected — tests depend on everything they exercise, so this is honest structure, not a hairball. This diagram is the strongest of the three.

**Diagram 1 (architecture) — the two cycles are both explained; the `REC` hub is the stated design, not a god-node. Clean.**
`reconcile` (`REC`) carries fan-in 6 (`CR`, `ISS`, `DEC`, `CFG`, `ST`, and the bidirectional `MAP`). On a normal graph a fan-in of 6 flags a god-node. Here the prose is explicit that the whole bridge *is* "one idempotent reconcile function" (Approach section), so the concentration is the intended architecture — a pure function that reads all sources and computes desired Plane state. The two cycles are both intentional and documented, so neither reads as silent:
- `MAP <-->|lookup + record UUID| REC` — a 2-cycle, but it is read-map-then-write-back-UUID, labelled as such.
- `SEED --> CR --> REC --> PI -.-> SEED` — a 4-node cycle, which is the deliberate round-trip named in the prose ("seed from story → work → status/PR/closure pushed back to that story… the read happened once"). The dotted edges mark the one-shot seeding path, distinguishing it from the continuous push. This is a cycle drawn honestly with its intent stated, exactly what the cycles heuristic asks for.

Layering is visible (three `subgraph` tiers FILES → HELPER → PLANE, `direction TB`); the only against-grain edge, `SEED --> CR`, is the documented reverse seeding read. No orphans.

**Diagram 2 (push sequence) — consistent with single-reconcile, but the never-silent return path is invisible. Substantive-but-mild.**
Consistency with the stated design is good: all three trigger points (activation, per-Turn, Phase 4 closure) invoke the identical `push --circle <dir>` message, which is exactly what "two trigger surfaces, one reconcile" predicts. What the diagram does *not* show is the C4 never-silent-on-failure behaviour: there are no return arrows (`FP -->> O`) anywhere, no failure branch, no outbox append, and — most consequentially — no "deferred" status flowing back to the orchestrator that it then surfaces. The plan makes that return load-bearing ("every failure produces… a non-error status the orchestrator prints in its dashboard/report"). A reader studying only this sequence would not see the mechanism that satisfies C4. It is covered elsewhere (diagram 1's `REC -.-> OUT`, and the C4 prose table), so this is a single-concern/completeness gap in a timing diagram, not a broken design — hence the diagram is acceptable, not tangled. Cheap fix if the author chooses: add the `FP -->> O: OK | deferred(N of M)` return and one `alt`/failure fragment.

**Missing seeding-flow diagram — Medium, prose-only where a small flow would help.**
Agenda item 4 (the one seeding read) describes a four-step control flow with a fallback branch (resolve seq→UUID → GET once → hand to shaper → record origin UUID; else manual-paste) entirely in prose and a numbered list. Per `design-diagrams.md` ("control or data flow… would a reader understand faster with the graph"), this is the kind of small branching flow a diagram serves well, and the dispatch brief expected one. It is only partially covered by diagram 1's `PI -.-> SEED -.-> CR` fragment, which shows the round-trip but not the one-shot-then-inert sequence or the absent-key fallback. This is a Medium finding — a diagram would sharpen it — not a defect in the design itself.

## Notes for the human at the gate

Nothing here blocks the plan on structure. If you want the diagrams to fully carry the design without leaning on prose, two low-cost additions would lift this to clean: (1) a return arrow + failure fragment in the push sequence so C4's never-silent path is visible where the transfer mechanism is drawn, and (2) a short `flowchart`/`sequenceDiagram` for the seeding read's one-shot-plus-fallback flow. Neither changes the architecture — the DAG, the single-reconcile hub, and the round-trip are already sound.
