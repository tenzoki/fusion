# Concept Evaluation: Plan: rules-write flag and project-level guard configuration (C5a, C5b)

**Date:** 2026-08-02 19:09
**Sender:** conceptrev
**Target:** `260802-1856_*_plan-guard-rules-write.md`
**Verdict:** acceptable
**Diagrams evaluated:** 3  |  **Validation:** by-reading (no `mmdc` on this machine, and `npx @mermaid-js/mermaid-cli` refused to install without network consent; metrics computed by transcribing the parsed edge lists into a graph script)

## Verdict

The work-order graph supports the Turn boundary the plan argues for, and it supports it by measurement rather than by assertion. Cutting the ten steps between Step 5 and Step 6 leaves zero backward edges, so `{S1…S5}` is a dependency-closed prefix and the split is topologically valid. Among the three balanced cut points the graph admits, that cut is also the minimum-coupling one: four crossing edges after Step 4, three after Step 5, four after Step 6. The plan's stated reason for the boundary is visible in the graph as an absence, since no edge runs from Step 6 into Steps 2, 3 or 4. None of the three diagrams carries a cycle, an orphan, or a god-node, and at 1.23, 1.08 and 1.40 edges per node with a maximum fan-out of three, none is dense enough for density to be the question.

Three substantive defects keep the document from clean, and all three are omissions rather than wrong structure. The work-order graph is missing the edge from Step 4 to Step 9, which is the one dependency running to the sentence Step 9 exists to correct. It does not draw the Turn boundary that is the reason a reader opens it. And the architecture graph omits the loader's own advisory path, which makes its single advisory node assert a pairing that holds for one producer and not the other. The configuration-resolution graph is sound, with one low note about a predicate it tests twice.

## Per-diagram measurements

| # | Where | Type | Nodes | Edges | Edge/node | Max fan-out | Max fan-in | Cycles | Orphans | Subgraphs | Longest path | Verdict |
|---|-------|------|-------|-------|-----------|-------------|------------|--------|---------|-----------|--------------|---------|
| 1 (line 112) | `### Q2` config resolution | `flowchart TD` | 13 | 16 | 1.23 | 2 (`PROJ`, `FILE`, `PARSE`, `FLOOR`) | 3 (`MERGE`) | 0 | 0 | 0 | 9 | clean |
| 2 (line 175) | `### The shape of the change` | `flowchart TD` | 12 | 13 | 1.08 | 2 (`LOADER`, `EXEMPT`, `ADV`) | 3 (`LOADER`) | 0 | 0 | 3 | 4 | acceptable |
| 3 (line 240) | `### Work order` | `flowchart TD` | 10 | 14 | 1.40 | 3 (`S1`) | 3 (`S9`) | 0 | 0 | 0 | 5 | acceptable |

Diagram 1: single root `START`, single leaf `OUT`. Unlabeled edges 8 of 16, all of them sequence edges; every branch edge carries `yes` or `no`.

Diagram 2: five roots (`PROJCFG`, `PLUGCFG`, `DEF`, `ENVFLAG`, `RULEPATH`), two leaves (`MON`, `LOG`). Unlabeled edges 2 of 13.

Diagram 3: two roots (`S1`, `S2`), one leaf (`S10`). Unlabeled edges 10 of 14. Proposed cut `{S1,S2,S3,S4,S5} | {S6,S7,S8,S9,S10}`: backward edges 0, forward edges 3 (`S1→S6`, `S3→S9`, `S5→S10`).

Syntax was checked by reading, with attention to the constructs that actually break Mermaid: quoted labels containing parentheses, `?`, `??`, `:` and `/` (`loadConfig(sources?)`, `per top-level key: project ?? plugin ?? DEFAULTS`, `Step 8 — /fusion:setup seeds the file`); an apostrophe inside a double-quoted label (`this repo's own copy`); quoted `subgraph` titles with an id; and `direction LR` nested inside a `TD` parent. None of these is a parse error. One authoring wrinkle worth knowing: in diagram 1 the node `MERGE` is referenced bare at lines 122 to 124 and only gets its label at line 126. Mermaid attaches the label wherever it first appears, so this parses, but a reader scanning top-down meets three edges into an unnamed node.

## Findings

**1. The dependency edges corroborate the proposed Turn boundary. They do not contradict it. (Not a defect; the answer the diagram was drawn to give.)**

This was the question put to the evaluation, so it gets stated first and with its evidence. The cut between Step 5 and Step 6 has no backward edge, meaning nothing in Turn 1 depends on anything in Turn 2. Steps 3 and 4 depend on Steps 1 and 2 only, Step 5 depends on Steps 3 and 4 only, and Steps 1 and 2 depend on nothing. The prefix is closed.

The plan's argument at line 463 is that the boundary is clean "because the flag does not depend on the project configuration". That claim has a graph-shaped form: there should be no edge from Step 6 into the flag's own steps. There is none. Step 6 reaches Steps 7, 8, 9 and 10 and nothing else.

The graph also adds something the prose does not claim. Walking every prefix cut, the crossing-edge count runs 3, 5, 5, 4, 3, 4, 4, 4, 2 for k = 1 through 9. Among the cuts that split the work anywhere near evenly, k = 5 is the minimum. Cutting one step earlier or one step later costs an extra crossing edge. The proposed boundary is not merely admissible; it is the least-coupled of the plausible ones.

**2. The graph is missing the edge from Step 4 to Step 9, and it is missing on the sentence Step 9 exists to correct. (Medium, substantive)**

`S9` has three in-edges: `S3`, `S6`, `S8`. `S4` reaches only `S5` and `S10`, so there is no path at all from Step 4 to Step 9. The graph transcribes the plan's own declaration at line 366, "Dependencies: Steps 3, 6, 8", faithfully. The declaration is what is incomplete.

Step 9 rewrites `rules/protected-path-discipline.md`. That file is titled "Protected-Path Discipline (shell writes)", it opens by naming itself "the shell half of the compliance guard's protected-path policy", and the sentence the plan says must be corrected reads, at line 168 of the installed rule, "There is no override for a protected-path shell write." The shell write surface is Step 4, the Bash path, not Step 3, the write-tool path. Step 3 makes the flag exist; Step 4 is what makes that specific sentence false.

Read literally, the graph therefore permits Step 9 to run before Step 4, which is documenting the Bash-side exemption before the Bash-side exemption is built. The defect is latent rather than live, because the proposed Turn split happens to place Step 4 in Turn 1 and Step 9 in Turn 2 and so enforces the ordering the missing edge should enforce. If the user takes the single-Turn option the plan offers at line 465, that accidental protection disappears with the split.

The correction is one edge, `S4 --> S9`, plus the matching repair to the dependency line at 366.

**3. The Turn boundary the diagram is read for is not drawn in it. (Medium)**

The work-order graph has no `subgraph` blocks. Ten nodes sit flat, and the split lives in one sentence below the graph at line 269 and in an argument 190 lines further down under `## Sizing`. The reader at the plan gate is being asked to judge a partition of these ten nodes while holding the partition in their head.

Two subgraphs, one per Turn, would put the cut into the graph and would make the three crossing edges legible as what they are, the coupling between the two Turns. The figures that matter for the decision, zero backward edges and three forward ones, become visible instead of needing a separate calculation. Authoring rule 3 in `rules/design-diagrams.md` covers this, and it applies with unusual force here because the boundary is the diagram's whole reason for existing at the gate.

**4. The three edges crossing the boundary do not carry the same kind of obligation, and all three are unlabeled. (Medium)**

`S1→S6` and `S5→S10` are ordinary precedence: Turn 1 produces something Turn 2 consumes, the extended harness and the monitor change respectively. `S3→S9`, together with the `S4→S9` edge that finding 2 says is missing, is a different relation. Steps 3 and 4 make a statement in a shipped rule file false, and Step 9 repairs it in the other Turn. The plan is explicit about this at line 368: the sentence "becomes false in this Circle and must be corrected rather than supplemented."

The consequence is that Turn 1 ends with `rules/protected-path-discipline.md` still telling every agent that no environment override waives the protected-path check, while the override exists in the code. The exposure is bounded, and the bound is itself in the graph: Step 10, which bumps the plugin version and rebuilds `hooks/dist`, sits in Turn 2 after Step 9, so no consuming project receives the flag before it receives the corrected rule. Agents running inside this repository read the installed copy under `~/.fusion/rules/` rather than the working tree, which bounds it a second time. Neither bound is stated in the plan, and neither is visible in the graph.

Ten of the fourteen edges are unlabeled. The four that are labeled are well chosen, each sitting on an ordering whose reason is not self-evident. The gap is that the one crossing edge with unusual semantics is among the ten. Labelling `S3→S9` and the new `S4→S9` with what they carry, something like "falsifies the shipped rule text, repaired here", would make the debt window visible at the point where the user decides whether to accept the split.

**5. The architecture graph omits the loader's own advisory path, and its advisory node asserts a pairing that holds for only one producer. (Medium, substantive)**

In diagram 2, `ADV` reads "guard_advisory event + clear-level escalation entry" and has fan-in 2, from `WT` and `BASH`, both labeled as exempted writes. Step 6 at line 339 has `guard.ts` emit one `guard_advisory` per diagnostic immediately after `loadConfig()`, and line 236 states that this diagnostic "pushes no escalation entry and no counter movement. It is a diagnostic, not an exemption."

So `LOADER` produces a second stream of `guard_advisory` events with a different shape, the graph draws no edge for it, and the node label states a pairing of event and escalation entry that is true for the exemption path and false for the diagnostic path. The `diagnostics` half of what `loadConfig` returns has no outgoing edge anywhere in the graph, although the plan gives it a section of its own and a noise-bound argument.

This costs the gate reader something concrete. Judging Step 5 from this graph, the monitor warnings panel appears to gain exempted rule writes. It will also gain unparseable-config diagnostics, one per guarded tool call in a misconfigured project, which is the noise the plan accepts at line 234 and bounds by "the user fixing the file". The plan does call out the third new arrival, the pre-existing branch-switch override advisory, at lines 90 and 447; the config diagnostic is the one that reaches the panel without being named as reaching it.

An edge `LOADER -->|"one per diagnostic, no escalation entry"| ADV`, or splitting `ADV` into the exemption note and the diagnostic, closes it.

**6. The configuration graph tests one predicate twice. (Low)**

`FILE` asks "fusion-guard.json present?" and `FLOOR`, seven nodes later, asks "fusion-guard.json exists on disk?". `FLOOR`'s answer is fully determined by which branch reached it: yes on the `LAYER` and `DIAG` paths, no on both paths into `PLUGINONLY`. The two decisions can never disagree.

They can, however, be unanswerable. `PLUGINONLY` is reached from `PROJ` when no project root was found at all, and on that path `FLOOR`'s subject does not exist, since there is no root against which "on disk" means anything. The intended answer is presumably no, and the graph does route it to `SKIP`, so the outcome is right and the predicate's subject is implicit.

Read literally the graph specifies two independent disk probes for one fact inside a single `loadConfig` call. Carrying the boolean out of the `FILE` branch is one probe and no ambiguity. Recorded as Low because the part of this graph that is load-bearing, the ordering of merge, then leaf normalisation, then floor, is right.

**Correctly handled, and worth naming so the planner does not treat these as defects.**

Diagram 1 keeps presence and parseability apart, and that separation earns its keep. The path `FILE` yes, `PARSE` no, `DIAG`, `FLOOR` yes shows an unparseable `fusion-guard.json` still arming the self-protection floor. That is precisely the case where a project could otherwise lose protection of its own configuration file by breaking it, and the graph shows the protection holding. Collapsing the two decisions into one would destroy that.

Diagram 1's `PROJ -->|no| PLUGINONLY` edge is transitively redundant in pure reachability terms, since `PROJ → FILE → PLUGINONLY` exists. Transitive reduction is a meaningless measure on a decision flowchart, where two branch edges into one node are alternatives rather than duplicates. Not a finding, recorded so the metric is not misread.

Diagram 3's `S6 --> S9` is transitively redundant through `S6 → S7 → S8 → S9`, and it is a faithful transcription of the plan's declared dependency set for Step 9. It is why `S9`'s fan-in reads 3, which should not be taken as three independent inputs.

The step annotations inside diagram 2's subgraph titles and node labels ("Configuration — Step 6", "guard.ts CHECK 2 — Step 3") add a second concern to an architecture graph, which authoring rule 5 warns about. Here it is the useful kind of cross-reference: it lets the gate reader map the shape onto the work order without holding both diagrams at once. The annotation is partial, since Steps 1, 7, 8, 9 and 10 do not appear, and that is correct because those steps have no place in this graph's concern.

**Density is not the issue in any of the three.** Maximum fan-out is 2, 2 and 3. The only node approaching a hub is `S1`, the harness extension, whose fan-out of 3 reflects three steps that genuinely need the fixture before they can assert anything. That is the plan's own sequencing argument at line 287, drawn correctly.

**No missing diagram.** The three graphs cover the three places in this plan where structure is worth seeing: the resolution chain, the shape of the change, and the step ordering. The candidate for a fourth is the coverage map from the eleven acceptance criteria onto the ten steps. Each step already names the criteria it serves and Step 10 walks all eleven, so a bipartite graph would add twenty-one nodes and no relation the prose is missing. The `## Data Structures` section is a type listing without relations between its members and is better as the code block it already is.

## Notes on scope of this evaluation

Two earlier documents in this body of work were evaluated today, the spec and the plan for `260801-1244-rule-provenance-header`, both acceptable. Neither is re-litigated here; these three graphs are new work in a different Circle. The prior `conceptrev` verdict inside this Circle's predecessor, `260801-1301-conceptrev-plan-guard-bash-inspection.md`, covers the plan that left the `MutationOptions.exempt` seam this plan consumes, and is not disturbed.

This evaluation judges the three diagrams against `rules/design-diagrams.md`. It does not verify the plan's factual claims about the codebase, with two exceptions checked because a finding rests on them: `rules/protected-path-discipline.md` is the shell-write half of the policy and carries the sentence "There is no override for a protected-path shell write" (finding 2), and the plan places the version bump and the `dist` rebuild in Step 10 (finding 4). The line numbers the plan cites in `hooks/`, its four verified claims table, and its account of the existing test harness were not re-checked.
