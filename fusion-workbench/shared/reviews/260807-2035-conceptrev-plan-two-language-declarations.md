# Concept Evaluation: Plan — split the language declaration into chat language and artifact language

**Date:** 2026-08-07 20:35
**Target:** `260807-2024_*_two-language-declarations.md`
**Verdict:** acceptable
**Diagrams evaluated:** 2  |  **Validation:** by-tool (mmdc 11.16.0, both blocks rendered to SVG and PNG)

## Verdict

Both diagrams are structurally sound and the document is acceptable: no cycle, no god-node, no hairball, correct type in both cases, and the design reads off the picture. The two claims the author makes about the diagrams do not survive intact, though neither failure is a design defect. The detached component in Diagram 1 is genuinely deliberate and is explained in prose, so a reader does not meet an unexplained orphan, but the explaining sentence points to "the bottom" of a picture where the renderer puts the component at the **top left**, so the one sentence that resolves the orphan sends the reader to the wrong place. The step DAG in Diagram 2 is acyclic and dependency-ordered as claimed, with one real gap: step S12 states a dependency on the commit that lands S1 through S11, and S7 and S8 have no path to S12 at all, which the caption then compounds by asserting that no later step depends on them. Fan-out is healthy in both graphs and is not the problem anywhere.

## Per-diagram measurements

| # | Type | Nodes | Edges | Ratio | Max fan-out | Max fan-in | Cycles | Components | Layered | Verdict |
|---|------|-------|-------|-------|-------------|------------|--------|------------|---------|---------|
| 1 | `flowchart TD`, 5 subgraphs | 12 | 10 | 0.83 | 2 (`DEC`, `ART`) | 2 (`DEC`) | 0 | 2 (10 + 2) | yes, 4 visible tiers | acceptable |
| 2 | `flowchart TD` | 12 | 14 | 1.17 | 5 (`S1`) | 4 (`S10`) | 0 | 1 | implicit, 7 levels deep | acceptable |

Supporting counts. Diagram 1: sources `L1`, `L2`, `REASON`; sinks `TERM`, `FPROSE`, `FPLAIN`, `EXEMPT`; no isolated node; 8 of 10 edges labeled. Diagram 2: single source `S1`; out-degree-zero nodes `S7`, `S8`, `S12`; longest path `S1→S2→S3→S4→S10→S11→S12`; 2 of 14 edges labeled.

## Findings

### Diagram 1, claim 1: the deliberate detached component

**The claim holds, and the diagram is not defective.** The graph measures as two weakly connected components, one of ten nodes carrying the declaration-to-surface flow and one of two nodes (`REASON`, `EXEMPT`) carrying the exempt surfaces. The prose immediately below the block states that the detachment is the design and says why: no declaration edge reaches the shipped text, and the unreachability is the exempt-surface rule. That is exactly what `rules/design-diagrams.md` asks for when a structural oddity is intentional, applied to an orphan rather than to a cycle. A reader who reads the caption does not meet an unexplained orphan. The reasoning is also correct on its merits: drawing `EXEMPT` as a fifth consumer of `DEC` would assert the opposite of what the answered decision settled.

Three things weaken the execution, in descending order of how likely each is to mislead a reader.

**The positional anchor does not match the render.** The caption says "the disconnected component at the bottom". Rendered with mmdc 11.16.0 the `shipped` subgraph lands at the **top left** of the canvas, above and to the left of the `decl` subgraph, which is where a reader's eye starts. The practical effect is that a reader meets the exempt surfaces first, before any declaration, and then reads a sentence directing them to the bottom of the picture. Mermaid does not guarantee placement for a component with no edges into the rest of the graph, and different renderer versions may place it differently, which is the underlying reason a positional reference is unreliable here. Naming the component by its subgraph title ("text that ships to every consumer") instead of by position removes the dependency on layout entirely.

**`REASON` is a justification wearing the shape of an entity.** Every other node in the graph is a thing: a declaration line, a resolved variable, an emitted path, a surface. `REASON["reaches projects of any language"]` is the reason a rule holds, and its outgoing arrow means "therefore", while all nine other arrows mean "flows into" or "governs". The same glyph carries two relation kinds. The design's actual claim is that nothing reaches these surfaces, and the most honest formalisation of that claim is a single node with no edges, with the reason moved into the subgraph title. As drawn, the two-node component has an internal edge that makes it look connected in miniature, which slightly softens the very unreachability the component exists to assert.

**Two unlabeled edges where every neighbour is labeled.** `CHAT --> CP` and `ART --> DP` carry no verb while the other eight edges do. The meaning is recoverable from the node names, since `CHAT_LANG` obviously selects `chat-voice-CHAT_LANG.yaml`, so this is cosmetic rather than a hidden relation.

**Two things the diagram gets right and should keep.** The edge `ART -->|language only, no profile| FPLAIN` visibly skips the `emitted` tier in the render, running from the resolution tier straight down to the surfaces tier past the profile paths. The skip is the point: no emitted path carries that language, and the graph shows the bypass rather than describing it. That single edge is the clearest thing in the diagram, and it is the residual the Decidability line names. Separately, the four-tier layering (declaration, resolution, emitted paths, surfaces) reads cleanly top-down with no edge fighting the grain.

One cosmetic note, verified by rendering the block a second time with the `direction` lines stripped: `direction LR` orders nothing inside `decl`, `emitted` and `surfaces`, because none of those three subgraphs contains an internal edge, so their members render as a vertical stack regardless. That is not a defect. Those three subgraphs are tiers, and a tier legitimately has no internal relations. The declaration is simply inert there.

### Diagram 2, claim 2: the dependency-ordered step DAG

**Acyclic, confirmed by traversal.** Every edge runs forward in step numbering and a depth-first search finds no back-edge. The graph is a single connected component with one source, `S1`, and all twelve steps reachable from it. The claim of dependency ordering is substantially correct: eleven of the twelve steps have their stated dependencies represented as edges.

**The one substantive gap: S12 depends on S7 and S8, and the graph shows no path.** Step S12's dependency line reads "S11, and the commit that lands S1-S11". S7 and S8 are inside that range. In the graph both are out-degree-zero leaves with no path to S12, so the DAG permits S12 to run before either of them. The failure is concrete rather than theoretical: an executor following the graph runs S12 after S11, appends an `Implemented:` line citing that commit hash to the decision record, and then lands S7 (the second declaration line in `CLAUDE.md`) and S8 (the chat-profile sibling pointers) afterwards, so the cited hash does not contain them. The caption makes this harder to catch rather than easier, because it asserts that "S7 and S8 are the two leaves that no later step depends on", which contradicts S12's own dependency line in the same document. The severity is bounded by S12's own text, which names S1 and S5 as the steps that discharge the decision record's stated condition, and both of those do precede S12. The damage is therefore an under-reporting commit citation, not a broken transition. Two edges, `S7 --> S12` and `S8 --> S12`, close the gap and make the caption true.

**The layer count is wrong.** The caption states "four layers". The longest path through the graph is seven levels: `S1` at level 0; `S2`, `S5`, `S6`, `S8`, `S9` at level 1; `S3` at 2; `S4` and `S7` at 3; `S10` at 4; `S11` at 5; `S12` at 6. If "four layers" is meant as four conceptual phases rather than as graph depth, the sentence should say so, because it sits in a list of graph metrics ("Acyclic, four layers, one source and one sink") and reads as one.

**"One source and one sink" is half right.** One source is correct and verified: `S1` is the only node with in-degree zero. Three nodes have out-degree zero, namely `S7`, `S8` and `S12`. The next sentence names `S7` and `S8` as leaves, so the paragraph does not actually mislead, but the metric as stated is inaccurate.

**A precision note on S10, not a defect.** Step S10 lists S1 among its dependencies and the graph carries no `S1 --> S10` edge. The ordering constraint survives, because S1 reaches S10 through `S5`, `S6` and `S9`, and also through `S2 → S3 → S4`. The graph is drawn as a transitive reduction, which is correct practice for a DAG this size and keeps the picture readable. The plan never says so, so a reader diffing the step text against the graph finds one dependency apparently missing that is not. One clause in the caption would settle it.

**Fan-out is not a problem, and the question deserves a direct answer.** `S1` has fan-out 5 against a 12-node graph, which is the highest concentration anywhere in either diagram. It is not a god-node. In a step DAG a wide fan at the first step means five independent pieces of work can proceed in parallel once the authoring home exists, which is a property of a well-decomposed plan rather than a symptom of one step owning too much. The rendered picture confirms the ordering stays readable: the five children spread across one rank with no edge crossings. The mirror-image `S10` fan-in of 4 is a join gate where the four byte-changing steps meet the golden regeneration, which is exactly the shape a test gate should have. Neither number warrants a change.

**Edge labeling is correct here, and the contrast with Diagram 1 is deliberate rather than sloppy.** Twelve of fourteen edges carry no label, which would be a finding on a semantic graph. In a step DAG the bare arrow means "must precede" uniformly, so a label adds nothing. The two edges that do carry labels, `S2 -->|lock must stay green| S3` and `S3 -->|code before the claim| S7`, are precisely the two whose ordering reason is non-obvious. That is the right use of the label budget.

### Document-level

Both diagram types fit their content per the type table in `rules/design-diagrams.md`: a `flowchart` for the resolution and surface structure, a `flowchart TD` for the step DAG. Neither diagram is overloaded. Diagram 1 shows one concern, how a declaration reaches a surface, with the exempt surfaces drawn as that concern's negative space rather than as a second subject. Density is low in both cases (0.83 and 1.17 edges per node), and no measurement anywhere in this document points at a tangled design. The verdict is held at acceptable rather than clean by the two caption-versus-graph mismatches and by the missing S12 dependency, all three of which are corrections to the plan text and the DAG rather than evidence that the design needs rethinking.

---

**Reconciliation 260808-0030 (reconciler, domain `code`).** The corrections this pass asked for
landed in commit `c1b72fc` and are present in the plan at `c54ead9`: both diagrams in
`260807-2024_*_two-language-declarations.md` carry the corrected edge set, and the
prose at line 116 now states why the `shipped` subgraph has no edge into the rest of the graph
rather than leaving the orphan unexplained. The step-dependency DAG at lines 195-226 is acyclic
with one source (`S1`) and one sink (`S12`), as the plan's own closing paragraph claims; all twelve
steps were verified implemented in this pass.
