# Concept Evaluation: Implementation Plan — the shell reachability model

**Date:** 2026-08-07 00:02
**Target:** `260806-2353_*_plan-shell-reachability-model.md`
**Verdict:** tangled
**Diagrams evaluated:** 3  |  **Validation:** by-tool (`npx @mermaid-js/mermaid-cli`, all three blocks rendered)

## Verdict

Two of the three diagrams are clean, and the third contains a substantive modelling gap rather than a drawing defect. Diagram 2, the decision tree titled "How an edge is decided", specifies a dispatch that is neither exhaustive nor mutually exclusive, and its `transparent` edge cannot deliver the relief the plan promises for the multi-line spelling of the flagship case. The plan's own step 2 names that spelling as a required test, so the design as drawn would fail a test the plan itself mandates. The defect is narrow and fixable inside the mechanism the plan already proposes; it is not a hairball, a god-node, or an architectural cycle. Diagram 1 and diagram 3 need no revision.

## Per-diagram measurements

| # | Title | Type | Nodes | Edges | Ratio | Max fan-out | Max fan-in | Cycles | Layered | Verdict |
|---|-------|------|-------|-------|-------|-------------|------------|--------|---------|---------|
| 1 | Where the change sits | flowchart LR | 10 | 10 | 1.00 | 2 (`cmd`) | 2 (`walk`) | 1 (explained) | yes, 3 subgraphs + `direction TB` | clean |
| 2 | How an edge is decided | flowchart TD | 13 | 13 | 1.00 | 4 (`gram`) | 2 (`op`) | 0 | n/a (decision tree) | tangled |
| 3 | Step dependency DAG | flowchart TD | 13 | 13 | 1.00 | 2 (`S3`) | 3 (`G2`) | 0 | n/a (task DAG) | clean |

Orphans: none in any diagram. Density is 1.00 edges per node across all three, which is sparse. No god-node is present anywhere.

## Findings

### 1. Substantive, diagram 2: the `gram` dispatch is not a well-formed decision

The node `gram{"leading grammar word?"}` carries four outgoing edges labelled `none`, `then or do`, `else or elif`, and `yes`. As predicate answers these overlap: a segment leading with `then` satisfies both the `then or do` edge and the `yes` edge, and the two lead to different results (`cond-true` through `head`, or `transparent` through `only`). A flowchart carries no evaluation order, so the graph does not say which edge wins. The intended reading is presumably source order, as an if/elif chain, but that ordering is invisible in the formal representation and therefore not something the reader or the implementing agent can rely on.

The node `only{"grammar words only, no command?"}` is drawn as a decision diamond with exactly one outgoing edge, `only -->|yes| trans`. There is no `no` branch. A segment carrying a grammar word together with a command, whose word is not `then`, `do`, `else` or `elif`, reaches that diamond and terminates nowhere.

The consequence is that the caption at line 168, "Every leaf either names an edge or falls back to `op`, which is invariant 2 drawn", is not what the graph shows. Invariant 2 is the containment property that step 3's measurement is graded against, and diagram 2 is the artifact meant to establish it. As drawn, the procedure is not total.

The repair is small: label the residual edge out of `gram` explicitly, for example "another grammar word", and draw `only -->|no| op`. The tree then becomes total and the caption becomes true.

### 2. Substantive, diagram 2 and the edge vocabulary table: `transparent` types a segment, but the relief it must deliver belongs to the next one

Step 2 (line 209) requires the multi-line spelling as a test case, "where the grammar word is its own segment":

```
if cd X
then
W
fi
```

Trace that through diagram 2. The bare `then` segment carries only a grammar word, so it reaches `trans` and types `transparent`, consistent with the vocabulary table's own row for `transparent` ("`fi`, `}`, `then`, `do` on its own line"). The next segment, `W`, has no leading grammar word and does not follow `fi`, `done` or `esac`, so the tree routes it `gram --none--> term --no--> op`, which resolves to its raw joiner. That joiner is `newline`, which maps to the `seq` edge, whose `carriesCdForward` answer is no. The directory degrades and the write denies.

The single-line spelling `if cd X; then W; fi` allows, because `then W` is one segment that types `cond-true`. The same shell construct therefore receives two different verdicts depending only on where the line breaks fall.

The vocabulary has no room to express the fix. Each row of the edge table is two literal fields, and the plan states at line 298 that `pipe-member` is the one row whose answer is inherited rather than constant. Propagation through a transparent segment is not in the model.

The graph shows the asymmetry that causes this. The node `term{"leaving a compound?"}` gives the tree a lookback for the closing words `fi`, `done` and `esac`. There is no matching lookback for the opening words `then` and `do`, so a bare `then` can type itself but cannot type its successor. Adding that mirror lookback is the structural change the design needs, and it stays inside the mechanism the plan already proposes.

I verified the segmentation premise rather than assuming it: `newline` is a real joiner value in `hooks/lib/shell-parse.ts` (the type at `:139`, emitted by `flush("newline")` at `:749`), and the plan itself asserts at line 209 that the grammar word forms its own segment in this spelling.

### 3. Substantive, diagram 2: two nodes rest on a vocabulary with no single source

The `trans` and `barrier` nodes name `fi`, `done`, `esac` and `}`. None of those four appear in `GRAMMAR_PREFIXES`, which I read at `hooks/lib/command-word.ts:58-70` and which holds exactly `{`, `(`, `!`, `if`, `elif`, `then`, `else`, `while`, `until`, `do`, `coproc`. Line 53 of the plan claims "the grammar vocabulary the parser needs is therefore already enumerated once in this repository, and the new layer reads that set rather than minting a second one", and step 2 repeats the instruction. That claim holds for the opening words and fails for the closing words.

Extending the existing set is not a free repair. `findCommandWord` at `command-word.ts:183-191` skips every member of `GRAMMAR_PREFIXES` when locating the command word, so adding `fi`, `done` or `esac` would change how any segment leading with one of them classifies. That is a behaviour change outside the additive-at-the-parser boundary invariant 1 draws.

### Not findings, stated so they are not mistaken for defects

The cycle in diagram 1 (`walk` to `facts` to `degrade` to `walk`) is explained at line 132 and correctly characterised. It is a state write-back inside a loop that carries a mutable working directory, not a dependency cycle between modules. Under the coherence heuristics an explained cycle is not a finding.

Diagram 1 earns its place structurally rather than decoratively. The two paths out of `cmd` share no node beyond `cmd` itself, which is exactly the insulation property step 6 pins with the 98-command gold fixture. The graph carries the proof of the claim its caption makes.

The three roots in diagram 3 (`S1`, `S9`, `S10`) are not orphans. Steps 9 and 10 both declare "Dependencies: none" in their prose and both reach the sink through `G2`. A multi-root DAG is the correct shape for independent work absorbed into one release.

Diagram 3 matches the prose exactly. I checked all eleven steps' declared dependencies against the thirteen drawn edges and found no discrepancy in either direction. Gates are drawn as diamonds and steps as rectangles, which keeps the two kinds distinguishable.

Diagrams 2 and 3 use no `subgraph` blocks, and neither needs them. A decision tree and a task DAG both satisfy the layering rule through an explicit `TD` direction.

## What a clean redraw would require

Only diagram 2 changes, and the change is to the design rather than to the drawing.

Give the reach layer a lookback for the opening grammar words, mirroring the `term` node that already provides one for the closing words. A segment whose predecessor was a bare `then` or `do` must inherit that predecessor's `cond-true` or `cond-false` edge instead of falling through to its raw `newline` joiner. Expressed in the vocabulary table, `transparent` stops being a two-field row like the others and becomes a propagation rule, which makes it the second inherited row alongside `pipe-member`. The plan should say so explicitly, because line 298 currently asserts that `pipe-member` is the only such row and the grep-checkable one-row-per-edge property in the test suite depends on that count.

Make the `gram` dispatch total and disjoint: name the residual edge rather than labelling it `yes`, and draw `only -->|no| op`. Diagram 2 then demonstrates invariant 2 instead of asserting it.

Resolve the closing-word vocabulary before step 2 begins. Either extend `GRAMMAR_PREFIXES` and accept the `findCommandWord` consequence with its own pinned case, or introduce a separate closing-word set and drop the single-source claim at line 53. Both are defensible; leaving the question to the implementing agent is not, because the plan currently instructs it to read a set that does not contain half the tokens the diagram needs.

---

**Reconciliation 260807-1515 (reconciler, Domain `code`) — Anmerkung, keine Änderung am Befund.**

Der geprüfte Plan ist seit dieser Reconciliation `260806-2353_*_plan-shell-reachability-model.md` mit Status `Superseded`: sein Gegenstand, der statische Klassifizierer, ist mit `ba7ccda` gelöscht und der Circle trägt seit 260807-0923-guard-misst-statt-orakelt den Marker `_s_`. Die hier festgehaltenen Diagramm-Befunde sind damit nicht widerlegt, sondern gegenstandslos.

Ein Ergebnis dieser Prüfkette hat den Circle überlebt und ist die Begründung des Nachfolgers: die zweite Bewertung und die daran anschließende Messung fanden fünf Löcher im bereits genehmigten Entwurf, und diese Kette ist als Belegmaterial in `260807-0825_*_should-the-guard-predict-shell-writes-or-enforce-them.md` eingegangen. Aus derselben Erfahrung stammt der MECE-Abschnitt in `rules/critical-stance.md` (Commit `327d0b6`).
