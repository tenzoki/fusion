# Concept Evaluation: Plan: close the C5b configuration boundary, close the two git routes, and ship

**Date:** 2026-08-04 16:44
**Sender:** conceptrev
**Target:** `260804-1633_*_plan-c5b-remediation-and-ship.md`
**Verdict:** tangled
**Diagrams evaluated:** 2  |  **Validation:** by-tool (`mmdc` 11.16.0, both blocks render, exit 0)

## Verdict

The work-order graph gives the wrong answer to the one question it is being shown for. The user's judgement at this gate is which steps can start while two decisions stay open, and the graph answers that from its source nodes: Steps 1, 3 and 5 have no inbound edge, and Step 4 hangs off decision `260803-1314` alone. That last reading is false. Step 4's own dependency line names Step 2 as well, and Step 2 is blocked on the two decisions that have not been answered. There is no path from `S2` to `S4` anywhere in the graph, so a reader who answers only `260803-1314` is told to start work that cannot proceed. A second edge is missing on the same question in the other direction: Step 7 declares Step 5 among its dependencies while the graph, Step 5's own heading, and Open Question 1 all say Step 5 gates nothing.

Neither defect is a matter of density or shape. Both graphs are acyclic, orphan-free, carry a maximum fan-out of 3 and 2, and sit at 0.94 and 1.36 edges per node. The loader graph is cleanly layered into two labelled subgraphs with explicit directions, and its one concentration point is `MERGE` at fan-in 6, which the prose names as the intersection that matters and which resolves to three configuration layers plus three defect annotations. Nothing here is a hairball or a god-node. The document is tangled because its dependency claims and its dependency graph were not derived from one another, and the gap falls exactly on the decision the user is about to make.

## Per-diagram measurements

| # | Where | Type | Nodes | Edges | Edge/node | Max fan-out | Max fan-in | Cycles | Orphans | Subgraphs | Longest path | Verdict |
|---|-------|------|-------|-------|-----------|-------------|------------|--------|---------|-----------|--------------|---------|
| 1 (line 47) | `### Where the eight new defects sit` | `flowchart TD` | 18 | 17 | 0.94 | 3 (`ENAB`) | 6 (`MERGE`) | 0 | 0 | 2 (`resolve`, `enforce`, both `direction TB`) | 7 | acceptable |
| 2 (line 130) | `### Work order` | `flowchart TD` | 11 | 15 | 1.36 | 2 (`D3`, `S1`, `S2`, `S3`, `S4`) | 5 (`S7`) | 0 | 0 | 0 | 3 | tangled |

Counts are the renderer's, not an estimate: `mmdc` emitted 18 node groups and 17 edge paths for diagram 1, and 11 and 15 for diagram 2, matching the parse exactly.

Diagram 1: nine sources (`CWD`, `PLUG`, `DEF`, and the six defect nodes), three sinks (`OUT`, `BASH`, `WRITE`). Unlabeled edges 6 of 17. No transitively redundant edge. The two subgraphs render with their labels, and the single edge `FLOOR --> DIAG` is the whole coupling between loading and enforcing.

Diagram 2: six sources (`D1`, `D2`, `D3`, `S1`, `S3`, `S5`), one sink (`S8`). Unlabeled edges 5 of 15. Three transitively redundant edges: `D3 --> S7`, `S1 --> S7`, `S3 --> S8`.

## Findings

**1. The graph omits `S2 --> S4`, and that omission overstates what answering one decision buys. (High, substantive)**

Step 4's dependency line at 221 reads "decision `260803-1314`, and Step 2, where the effective list is assembled." The graph draws only the first half. `S4`'s in-edges are `{D3}`; `S2`'s out-edges are `{S6, S7}`; there is no path from `S2` to `S4` at all. The dependency is real rather than decorative: Step 4's option 2 subtracts a project's declared protected entries from the exempt set, and the effective list it subtracts from is what Step 2 assembles.

The consequence lands precisely on this gate. The plan splits four open decisions into two that block code and two that do not, and it tells the user at 395 to answer the second pair "so the shipped documentation states a chosen boundary." A user who takes that advice, answers `260803-1314` with option 2 or 3, and reads the graph to see what opened up will find `S4` with its one prerequisite satisfied. Nothing opened up. Step 4 still waits on Step 2, which waits on `260804-1630_*_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md` and `260804-1631_*_may-a-project-file-set-guard-enabled-and-switch-the-whole-guard-off.md`.

The correction is one edge, `S2 --> S4`. It does not create a cycle: `S4` reaches only `S6` and `S7`, and neither reaches `S2`.

**2. Step 5's relationship to Step 7 is stated four times and three of the statements disagree with the fourth. (High, substantive)**

Step 7's dependency line at 257 reads "Steps 1, 2, 3, 4 and 5." The graph draws `S7`'s in-edges as `{D3, S1, S2, S3, S4}` with no `S5`. Step 5's own heading at 235 is "Does not gate the ship, and the reason is worth stating." Open Question 1 at 404 says "The plan orders it before and does not gate on it." The single edge leaving `S5` is `S5 --> S8`, labelled "should precede, does NOT gate."

The two readings are not cosmetically different. `S7 --> S8` is labelled "gates," so if Step 7 genuinely depended on Step 5, Step 5 would gate the ship transitively, and the plan's stated position that the dashboard row can follow the ship would collapse. The graph and the step heading would both be wrong.

*Inference, not verified against the code:* the dependency line is the error and the graph is right. Step 7's files are three Markdown documents, its eleven enumerated obligations never mention the dashboard, `bin/monitor`, or `guard_error`, and Step 5 changes only `bin/monitor`. On that reading Step 7 has no content that waits on Step 5. But the plan does not let a gate reader settle it, and the resolution decides whether Step 5 is on the critical path to the ship or off it.

**3. The graph uses one arrow for three different relations, and labels them inconsistently. (Medium, substantive)**

Fifteen edges carry three distinct obligations with no visual distinction between them.

- **Hard gates:** `S6 --> S8`, `S7 --> S8`, `S3 --> S8`, `S2 --> S6`, `S4 --> S6`.
- **A soft preference:** `S1 --> S2`, labelled "same function." Step 2's dependency line at 189 says the opposite of a dependency — "Step 1 need not precede it, but the two edit the same function and land more cheaply in order." The graph asserts an ordering the prose explicitly disclaims.
- **A second soft preference in different clothing:** `S5 --> S8`, labelled "should precede, does NOT gate."
- **Conditional alternatives:** `D3 --> S7` and `D3 --> S4` are mutually exclusive branches on the answer to one decision, drawn identically to the conjunctive pair `D1 --> S2` and `D2 --> S2`, where both are required.

Five edges carry no label at all, and among them are `S2 --> S7` and `S4 --> S7`, which are hard gates, while the soft `S5 --> S8` is labelled. A reader cannot recover the gating set from the graph's shape; they have to read every label and then check the prose anyway. The document already owns the vocabulary that fixes this, since diagram 1 uses `-.->` for its annotation edges and solid arrows for its real ones.

**4. The transitive-reduction policy is inconsistent, which is what makes findings 1 and 2 unreadable as deliberate. (Medium)**

Step 6's dependency line names Steps 1, 2 and 4, and the graph draws only `S2 --> S6` and `S4 --> S6`. That omission is harmless on its own, because `S1 --> S2 --> S6` already orders them. But the graph draws three redundant edges elsewhere: `S1 --> S7` is implied by `S1 --> S2 --> S7`, `S3 --> S8` by `S3 --> S7 --> S8`, and `D3 --> S7` by `D3 --> S4 --> S7` under options 2 and 3.

So redundant edges are drawn in three places and dropped in a fourth, and the graph gives a reader no rule for telling a deliberate reduction from a forgotten edge. That is the cost: findings 1 and 2 are individually small corrections, but a reader who spots the `S1 --> S6` gap has no way to know whether the `S2 --> S4` gap is the same benign kind. Pick one policy — for a work order at a gate, drawing every declared dependency is the safer one, since the reader is checking declarations rather than admiring the shape.

**5. The fourth open decision is not in the graph. (Medium)**

The plan states at 388 that "Four decision records are open and each one bears on this plan," and the graph has three decision nodes. `260803-1402` is missing. It is not an oversight in the prose: it appears four times, is listed under "Ship-gating but not code-blocking," and is closed by Step 7 per both the step's own line at 258 and the closes table at 365.

The graph is the surface a user scans to ask "what am I deciding, and what does each answer unblock." It currently answers that for three of the four. One node and one edge, `D4 --> S7`, closes it.

**6. Diagram 1 draws six of the eight defects under a heading that promises eight. (Medium)**

The section heading at 43 is "Where the eight new defects sit," and the prose at 45 says the assessment "filed eight defects." The graph carries six: `F1`, `F2`, `F3`, `F4`, `F6`, `F7`, for `260804-1601_*_a-partial-guard-object-silently-removes-every-protected-path.md` through `-1604`, `-1606` and `-1607`. Absent are `260804-1605_*_the-seeded-template-states-two-properties-the-loader-does-not-have.md`, which the closes table routes to Step 6, and `260804-1608_*_plan-step-7-is-unmarked-and-the-plan-header-contradicts-its-own-step-markers.md`, which the same table records as already closed by this planning session.

The scoping is defensible. Both omitted defects sit outside the loader-and-enforce path the graph draws, one being a template-text defect and the other a marker correction. What misleads is the pairing of a heading that says eight with a picture that shows six, compounded by the node identifiers running `F1, F2, F3, F4, F6, F7`. The gap where `F5` would sit reads as an authoring slip rather than a scope decision, so a reader who counts cannot tell whether two defects were placed elsewhere or forgotten. Either name the two in a sentence under the graph, or retitle it for the path it actually draws.

**7. Diagram 1's three inbound merge edges hide the precedence that one open decision is about. (Low)**

`PFILE --> MERGE` is labelled "JSON.parse, then CAST." The two edges beside it, `PLUG --> MERGE` and `DEF --> MERGE`, are bare. What separates those three layers is their precedence, and precedence is the entire subject of decision `260804-1630_*_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md`. The `MERGE` node label does carry it in text, "merge per TOP-LEVEL KEY then per-leaf fallback to DEFAULTS," so the fact is recoverable, and the graph is drawing current behaviour under a "Current State" heading, which is correct. Recorded Low because ordinal labels on the three edges would put the disputed rule on the edges that embody it.

**Correctly handled, and worth naming so the planner does not treat these as defects.**

`MERGE`'s fan-in of 6 is not a god-node. Three in-edges are the configuration layers, which is exactly the arity a three-layer merge should have, and the other three are defect annotations drawn with dotted edges and a `classDef`. The prose at 85 names the concentration deliberately and cites `hooks/lib/config.ts:149` and `:277-292` for it. A merge point is supposed to be where lines meet.

`S7`'s fan-in of 5 is likewise correct rather than a hub. Documentation that describes settled behaviour depends on every step that settles behaviour, and the plan argues at 259 for keeping the three files in one step because splitting them is what produced the current self-contradiction. Splitting `S7` to reduce its fan-in would reintroduce the defect the step exists to close.

Diagram 1's two-subgraph layering with explicit `direction TB` on each, coupled by the single edge `FLOOR --> DIAG`, is the shape authoring rule 3 asks for, and it makes the load-then-enforce boundary legible at a glance.

Both graphs are acyclic. For a work order gated on user decisions and for a configuration resolution chain, that is the property that matters most, and it holds without qualification in both.

**No missing diagram.** The two graphs cover the two places in this plan where structure is worth seeing. The candidate third, a mapping from the twenty closed defects onto the eight steps, is already carried by the closes table at 356 and would add twenty-eight nodes and no relation the table lacks.

## What a clean redraw would require

The topology is sound in both graphs, so this is edge repair rather than a redesign. Five changes, all in diagram 2 except the last.

1. **Add `S2 --> S4`.** This is the finding-1 correction and the one that changes the gate answer. Once drawn, `S4` is visibly blocked by the same two decisions that block `S2`, and the honest reading of the graph becomes: answering `260803-1314` alone unblocks nothing, and Steps 1, 3 and 5 are the whole of the available work until `260804-1630_*_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md` and `260804-1631_*_may-a-project-file-set-guard-enabled-and-switch-the-whole-guard-off.md` are answered.

2. **Settle Step 5 against Step 7, then make all four statements agree.** Either add `S5 --> S7` and correct Step 5's heading, Open Question 1 and the `S5 --> S8` label, or strike Step 5 from Step 7's dependency line and leave the graph as drawn. The second is the likely correct one on the evidence in the document, but it is the planner's call, not the evaluator's.

3. **Separate gates from preferences with a distinct arrow.** Solid for a hard gate, dotted for a preferred order, matching what diagram 1 already does. `S1 --> S2` and `S5 --> S8` become dotted, and the reader can then derive the blocking set from shape alone instead of from five labels and a cross-check against eight step bodies.

4. **Add the fourth decision node and `D4 --> S7`**, so the graph and the "four decision records are open" sentence agree.

5. **In diagram 1, reconcile the caption with the six drawn defects** by naming `260804-1605_*_the-seeded-template-states-two-properties-the-loader-does-not-have.md` and `260804-1608_*_plan-step-7-is-unmarked-and-the-plan-header-contradicts-its-own-step-markers.md` and where they went, or by retitling the section to the path the graph draws.

One structural addition is worth considering beyond the repairs. The partition the user actually needs, startable now against blocked on a decision, lives only in the sentence at 168. Two `subgraph` blocks around `{S1, S3, S5}` and the rest would put it in the picture. This is the same finding the prior evaluation of the predecessor plan raised as its finding 3, where the Turn boundary the diagram existed to justify was drawn nowhere in it. The recurrence is worth naming: in both plans the work-order graph is read at a gate for a partition it does not draw.

## Notes on scope of this evaluation

The prior `conceptrev` verdict in this Circle, `260802-1909-conceptrev-plan-guard-rules-write.md`, covers the predecessor plan at `260802-1856_*_plan-guard-rules-write.md` and returned acceptable. Its finding 2 was a single missing dependency edge whose declaration was incomplete, judged latent because the proposed Turn split happened to enforce the ordering anyway. That verdict is not re-litigated. This plan's Steps 7 and 8 supersede the predecessor's Steps 9 and 10, so the earlier work-order graph is no longer the live one. The escalation from acceptable to tangled rests on the difference the earlier report itself drew: the missing edge here is live rather than latent, and it falls on the question the gate is convened to answer.

This evaluation judges the two diagrams against `rules/design-diagrams.md` and against the plan's own dependency declarations at lines 178, 189, 205, 221, 233, 245, 257 and 281. Both Mermaid blocks were rendered with `mmdc` 11.16.0 and the node and edge counts above are the renderer's. The plan's factual claims about the codebase were not re-checked, with one exception load-bearing for finding 2: Step 7's file list and its eleven obligations were read and contain no reference to `bin/monitor`, the dashboard, or `guard_error`. The line numbers the plan cites in `hooks/`, its verified-claims table at 97, and its account of the harness were not verified.
