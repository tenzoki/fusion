# Concept Evaluation: Plan — Plane bridge spec-comment (opt-in)

**Date:** 2026-07-22 20:26
**Target:** `260722-2021_*_plan-plane-spec-comment.md`
**Verdict:** clean
**Diagrams evaluated:** 2  |  **Validation:** by-tool (mmdc)

## Verdict

Both diagrams are coherent, and the document is clean. The live control-flow graph (13 nodes, 14 edges) is a strict acyclic flowchart that reads straight down: the DRYRUN split forks first, the state write is wrapped so noop and create/update both converge on a single `state_ok`-gated comment tail, and every failure path returns before that tail. The step DAG (5 nodes, 4 edges) is a small acyclic ordering with one fork at Step 2 and no back-edge. No cycle, no god-node, no orphan in either; both parse under `mmdc`; both types fit their content. This plan's control-flow graph is the implementation-level refinement of the clean spec graph reviewed at `260722-1947-conceptrev-spec-plane-spec-comment.md` and preserves its C4 property — a failed comment self-heals on the next push, never by looping inside this one.

## Per-diagram measurements

| # | Type | Nodes | Edges | Max fan-out | Max fan-in | Cycles | Layered | Verdict |
|---|------|-------|-------|-------------|------------|--------|---------|---------|
| 1 | flowchart TD | 13 | 14 | 2 (`mode`/`isnoop`/`code`/`tail`) | 2 (`tail`, `done`) | 0 | TD, reads clean | clean |
| 2 | flowchart LR | 5 | 4 | 2 (`S2` → S3, S4) | 2 (`S2` ← S1, S5) | 0 | LR, DAG | clean |

## Findings

No substantive findings. Detail per axis:

**Diagram 1 — live control flow.**
- **Acyclicity** — strict DAG. Every edge runs forward: `start → mode → {dry→ret1 | isnoop} → {statewrite→code→(success|deferred) | noopok} → tail → {upsert→done | done}`. No back-edge, so the C4 self-heal-on-next-push discipline is exactly what the graph shows.
- **Convergence** — the restructure the plan describes in Approach §1 is visible as a clean join: `success` and `noopok` both feed `tail`, the single comment gate. That is one merge point, not a tangle; it is the graphical form of the "one comment tail gated by `state_ok`" claim.
- **Fan-out** — flat at 2. Every 2-out node is a decision (`mode`, `isnoop`, `code`, `tail`); no node concentrates control, so no god-object candidate.
- **Branch completeness** — each decision covers both outcomes with a labelled edge (`mode` yes/no, `isnoop` no/yes, `code` 2xx / 429·other·transport, `tail` yes/no). Sequential edges (`start→mode`, `statewrite→code`, `upsert→done`) are correctly bare — pure sequence, no verb to carry.
- **Orphans / terminals** — none floating. Three terminal leaves (`ret1`, `deferred`, `done`), each a legitimate exit; `deferred` carries the explicit "NO comment" label matching the C4-4 defer-before-tail invariant.

**Diagram 2 — step dependency DAG.**
- **Acyclicity & orphans** — clean DAG, all 5 nodes connected, no cycle. S1→S2→{S3,S4} is the real dependency spine; the single fork at S2 matches the prose (Steps 3 and 4 both depend on Step 2, nothing else).
- **One cosmetic note, not a defect** — `S5 -.->|independent| S2` draws a dotted, labelled edge to express that Step 5 has *no* dependency on Step 2. In a dependency DAG an arrow normally means "precedes / is required by", so drawing one to say "independent" is mildly self-contradictory read edge-first. The dotted style plus the explicit `independent` label neutralise the ambiguity, and the prose (Step 5 "Dependencies: none") is unambiguous, so it does not mislead. If a redraw ever happens, leaving S5 as a disconnected node with a prose note would read more literally — but this is stylistic, not a structural flaw, and no redraw is warranted.
- **Direction** — `LR` rather than the table's suggested `TD` for a DAG. Authoring rule 3 permits either explicit direction; LR reads cleanly here. Cosmetic only.

**Cross-document.** Neither diagram uses `subgraph` layering, and neither needs it: Diagram 1 is a single control-flow spine and Diagram 2 has 5 nodes. Same reasoning the spec review applied. Every structural element described in prose (the noop-wrap, the single gated tail, the Step-2 fork, Step 5's independence) has a matching graph element, so an honest reading of both pictures confirms the plan rather than contradicting it.

---

**Reconciliation annotation — 260817-1836, reconciler, domain `code`.** The subject of this review
no longer exists. The Plane mirror was removed on 2026-08-15 in Circle
`260815-0007-remove-eight-mechanisms-and-cap-growth`: `bin/fusion-plane` is gone from
`bin/` (`ls bin/` at HEAD `2552586` lists twelve helpers and none of them is it), the
`plane.config.yaml` template left `templates/`, and the only surviving mention of the bridge in
shipped text is the migration note `docs/upgrading-to-v9.md`. The findings below are preserved as
written and are no longer actionable: nothing they cite can be fixed, because nothing they cite is
shipped. No finding was rewritten in this pass.
