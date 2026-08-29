# Session: apply the design-diagram review's three corrections to the two-language-declarations plan

**Date:** 2026-08-07 21:15
**Agent:** coder
**Status:** Complete
**Task:** T0 — documentation-only edit to one plan file
**Source:** `260807-2035-conceptrev-plan-two-language-declarations.md`
**Target:** `260807-2024_*_two-language-declarations.md`

## What changed

One file edited. No code, no rules, no tests, no commit.

**Correction 1 — the detached component (diagram 1, `### Resolution and surfaces`).** The `REASON` node and its `REASON -->|English, unconditionally| EXEMPT` edge are gone; the reason moved into the subgraph title, which now reads `text that ships to every consumer — English unconditionally, because it reaches projects of any language`. The `direction LR` line went with the edge — the subgraph now holds one node, so it ordered nothing. The exempt surfaces are now what the design actually claims: a single node with no edges. The caption names the component by its subgraph title instead of by canvas position, and says why (Mermaid guarantees no placement for a component with no edge into the rest of the graph), plus why the reason belongs in a title rather than a node (it is a justification; every other arrow means "flows into" or "governs").

**Correction 2 — the two missing edges (diagram 2, `### Step dependencies`).** Added `S7 --> S12` and `S8 --> S12`. S12's stated dependency is "S11, and the commit that lands S1-S11", which contains both; as drawn the DAG permitted S12 to cite a commit holding neither. The caption's contradicting sentence ("S7 and S8 are the two leaves that no later step depends on") is replaced: both steps still sit outside the S10 test gate, for the same two reasons as before, but both now precede S12.

**Correction 3 — the two miscounts.** "Acyclic, four layers, one source and one sink" is now "Acyclic, seven levels deep on the longest path (`S1 → S2 → S3 → S4 → S10 → S11 → S12`), one source (`S1`) and one sink (`S12`)". Both numbers derived from the graph as left, not copied from the prompt. The sink count became true *because* of correction 2: before it, three nodes had out-degree zero.

No step content, no prose dependency line, no `**Decidability:**` head line touched.

## Verification

Render-checked with mermaid-cli 11.16.0 via `npx -y @mermaid-js/mermaid-cli@11.16.0` (not installed locally; `mmdc` is not on PATH). Both blocks extracted from the file as edited and rendered to SVG, exit 0, no warnings.

Graph properties re-measured from the edited blocks by script rather than by eye:

| Property | Diagram 1 | Diagram 2 |
|---|---|---|
| Nodes / edges | 11 / 9 | 12 / 16 |
| Components | 2 — one of 10, one of 1 (`EXEMPT`, isolated) | 1 |
| Cycles | — | none |
| Sources (in-degree 0) | — | `S1` only |
| Sinks (out-degree 0) | — | `S12` only |
| Longest path | — | 7 levels, `S1→S2→S3→S4→S10→S11→S12` |

Node levels in diagram 2: S1=0; S2, S5, S6, S8, S9=1; S3=2; S4, S7=3; S10=4; S11=5; S12=6. Seven distinct levels, which is the number the caption now states.

## Not done, and deliberately

The review's precision note on S10 (the graph is a transitive reduction, so S10's stated dependency on S1 holds through `S5`/`S6`/`S9` and through `S2→S3→S4` without a direct edge, and one caption clause would settle it) was outside T0's three-correction mandate and is not applied. It is a readability improvement to the same caption, so it costs nothing to fold into a later pass over this file if the user wants it.

The review's cosmetic finding on the two unlabeled edges `CHAT --> CP` and `ART --> DP` is likewise untouched — the review classed it as cosmetic and it was not in the mandate.
