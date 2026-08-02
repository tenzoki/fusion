# Concept Evaluation: Spec: Provenance header on rule files (C8)

**Date:** 2026-08-02 11:08
**Sender:** conceptrev
**Target:** `circles/260801-1244-rule-provenance-header/planning/260802-1103_o_spec-rule-provenance-header.md`
**Verdict:** acceptable
**Diagrams evaluated:** 1  |  **Validation:** by-reading (no `mmdc` on this machine, and `npx @mermaid-js/mermaid-cli` refused to install without network consent)

## Verdict

The graph is structurally sound and one omission short of clean. It is sparse (10 nodes, 9 edges), acyclic, free of orphans, and has a maximum fan-out of 3, so nothing in it points at a god-object or a hidden dependency loop, and the `flowchart TD` type is the right one for a component-and-scope shape. The single substantive defect is a missing edge rather than a wrong one: `rules/fusion-workbench-conventions.md` appears as the node `CONV`, standing outside the ten files the gate reads, with no edge saying it is also one of them. That is precisely the fact the spec devotes a section to correcting (the backfill set is ten files, not nine), and it is the fact the Directive's self-demonstration criterion rests on. A reader who works from the graph alone would rebuild the nine-file error the prose already fixed. Two further points are minor authoring misses that cost readability without misleading anyone.

## Per-diagram measurements

| # | Type | Nodes | Edges | Edge/node | Max fan-out | Max fan-in | Cycles | Orphans | Subgraphs | Depth | Verdict |
|---|------|-------|-------|-----------|-------------|------------|--------|---------|-----------|-------|---------|
| 1 (line 14) | `flowchart TD` | 10 | 9 | 0.9 | 3 (`HEADER`) | 2 (`PROJ`, `HEADER`) | 0 | 0 | 0 | 4 | acceptable |

Roots (no incoming edge): `GATE`, `CONV`, `CURATOR`. Leaves: `CIRCLE`, `COMMIT`, `RECORD`, `D3`, `PROJ`. Unlabeled edges: 5 of 9.

Measured by transcribing the nine edges into a graph script and running degree, reachability, and depth-first cycle detection over them, not by eye.

## Findings

**1. The conventions file is drawn as the documenter of the header and not as a subject of the gate. (Medium, substantive)**

`CONV` ("fusion-workbench-conventions.md documents the convention") is a root node with fan-in 0. Its only outgoing edges are `CONV --> HEADER` and the dotted `CONV -.->|section note cites| D3`. Nothing connects it to `RULES` ("plugin rules/, ten files"), and nothing connects it to `COMMIT`, although the backfill table at line 111 assigns it the admission form `git:b05b423`.

The consequence is an aliasing problem. The same file is present twice in the graph, once anonymously inside the aggregate "ten files" and once as a named node, with no edge tying the two occurrences together. The spec's section at line 96 exists to correct exactly this reading, and the Directive at line 10 states the payoff that depends on it: the rule mandating provenance should demonstrate the practice it mandates. That self-demonstration is invisible in the graph. So is the reason the spec gives at line 123 for keeping the file header and the section note as two separate mechanisms, because the graph shows only one of the conventions file's two roles.

The correction is one or two edges, not a redesign. Either place `CONV` inside `RULES` as a member and give it its own `CONV --> COMMIT` citation edge, or add a labelled edge such as `CONV -->|is itself one of the ten, admission form| HEADER`. The design underneath is right; the drawing under-reports it.

**2. Three different relations share one arrow glyph, and five of nine edges carry no label. (Low)**

`RULES --> HEADER` means each file carries a header. `HEADER --> CIRCLE`, `HEADER --> COMMIT` and `HEADER --> RECORD` mean the header takes one of three alternative forms. `CONV --> HEADER` means the conventions file defines the header. Those are containment, alternation, and definition, drawn identically. In a `flowchart TD` a plain arrow reads as flow or dependency, so the three form-edges currently read as "the header produces a Circle citation", which is not the relation the spec describes at lines 54 to 66. Labelling them, or grouping the three forms under one subgraph, restores the distinction. Authoring rule 2 in `rules/design-diagrams.md` covers this.

**3. The design's one real boundary is carried by an edge label rather than by structure. (Low)**

There are no `subgraph` blocks. The design has a genuine two-region split, stated as the first constraint at line 150: the gate reaches the plugin's own `rules/` and cannot reach a consuming project's `rules/` or `.claude/rules/`, where the header is convention backed by the curator's discipline. In the graph that split lives entirely inside the dotted edge label "out of reach". Two subgraphs, one for what the gate enforces and one for what only discipline enforces, would make the scope boundary structural. At 10 nodes this is a readability gain rather than a correction, which is why it is Low.

**Correctly handled, and worth naming so the planner does not treat it as a defect.** `RECORD` is labelled "cites a decision record (0 files today, the form new rules use)". A node representing a form with no instances is the kind of thing that looks like a modelling error, and here it is not: the spec discloses it as an accepted limitation at line 163 and explains why no file in the backfill can be upgraded to that form at line 115. The graph and the prose agree. Leave it drawn.

**Density is not a problem here.** At 0.9 edges per node and a maximum fan-out of 3, this graph is well under any hairball threshold, and the absence of cycles is a real property of the design rather than an artefact of a small drawing. The gate reads files, files carry a header, the header takes one of three forms. That chain is genuinely acyclic.

**No missing diagram.** The document has one diagram where structure is worth showing. The remaining sections that could invite a second one, notably "Open for Planner", are open questions rather than structure, so no further graph is warranted.

## Notes on scope of this evaluation

Prior `conceptrev` verdicts in `shared/reviews/` cover the Plane integration spec and the Circle-container plan. None of them touches this document, so nothing here re-litigates an earlier accepted graph.

This evaluation judges the diagram against `rules/design-diagrams.md`. It does not verify the spec's factual claims, such as the commit hashes in the backfill table or the line numbers of the four checked decoys.
