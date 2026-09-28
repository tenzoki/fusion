# Concept Evaluation: Implementation Plan — the shell reachability model (confirmation pass)

**Date:** 2026-08-07 01:58
**Target:** `260806-2353_*_plan-shell-reachability-model.md` (revised 260807-0130-planner-plan-repair-after-conceptrev.md)
**Verdict:** tangled
**Diagrams evaluated:** 3  |  **Validation:** by-tool (`npx @mermaid-js/mermaid-cli`, all three blocks rendered)
**Supersedes:** `260807-0002-conceptrev-plan-shell-reachability-model.md`

## Verdict

All three findings of the prior pass are closed, and the repair opened one new hole
of the same kind. The candidate/pending rule does close the multi-line gap, diagram
2 is now genuinely total and disjoint, and the planner's argument for rejecting the
mirror lookback is correct on both counts it claims. The new defect is the
`hasCmd --no--> trans --> out` path: it reaches the sink without passing the
pipeline substitution, and a grammar-only segment can be a pipeline head. The
consequence is a deny-to-allow transition the shell does not justify, in a shape
that neither the S1 corpus nor the S4 pin set contains. That is one drawn edge away
from a fix, and diagrams 1 and 3 are clean.

## Per-diagram measurements

| # | Title | Type | Nodes | Edges | Ratio | Max fan-out | Max fan-in | Cycles | Layered | Verdict |
|---|-------|------|-------|-------|-------|-------------|------------|--------|---------|---------|
| 1 | Where the change sits | flowchart LR | 10 | 10 | 1.00 | 2 (`cmd`) | 2 (`walk`) | 1 (explained) | yes, 4 subgraphs + `direction TB` | clean |
| 2 | How an edge is decided | flowchart TD | 14 | 19 | 1.36 | 5 (`cand`) | 5 (`hasCmd`) | 0 | n/a (decision tree) | tangled |
| 3 | Step dependency DAG | flowchart TD | 13 | 13 | 1.00 | 2 (`S3`) | 3 (`G2`) | 0 | n/a (task DAG) | clean |

Orphans: none. Every node in diagram 2 is reachable from `seg` and every path
terminates at `out`. Diagram 3 is byte-identical to the version measured at 0002,
as the revision header states.

## The three questions asked

### 1. The candidate/pending rule closes the multi-line gap

Traced through the redrawn diagram 2, with the segmentation verified against the
real parser rather than assumed (`node` against `hooks/dist/lib/shell-parse.js`,
`parseCommand("if cd X\nthen\nW\nfi", { quoted: "capture" })` returns exactly four
segments with joiners `start`, `newline`, `newline`, `newline`):

| Segment | `cand` exit | `hasCmd` | Result |
|---|---|---|---|
| `if cd X` | nothing recognised → `cNone` | yes | `consume` → raw operator `start`, carries |
| `then` | then, do → `cTrue` | no | `trans` → `transparent`, pending = `cond-true` |
| `W` | nothing recognised → `cNone` | yes | `consume` → pending edge, so `cond-true`, **carries** |
| `fi` | fi, done, esac → `cBarrier` | no | `trans` → `transparent`, pending = `barrier` |

`W` lands on `cond-true`, which is the same edge the single-line spelling gives
`then W` through its own candidate. The line break no longer decides the verdict,
which was the defect. The deferred degrade also arrives where the plan says it
does: the pending `barrier` left by `fi` is consumed by the next command position,
so `if cd hooks; then :; fi && rm -rf dist` still denies.

The planner's two reasons for rejecting the mirror lookback both hold. A lookback
would have made `transparent` a row whose answer is inherited, and the one-row-
per-edge grep in `bash-mutation-guard.test.ts:3771-3818` is pinned against exactly
that. And a lookback reaches one predecessor, where `if` / `then` / `fi` on three
lines needs an edge to survive an arbitrary run of grammar-only segments. The
pending edge is the better mechanism. I withdraw the recommendation.

### 2. Diagram 2 is total and disjoint

`cand` partitions on the leading grammar words with `nothing recognised` as a drawn
catch-all, so every segment leaves it by exactly one edge. `hasCmd` and `pipe` both
draw both exits. Every leaf reaches `out`. The caption at line 207 is now what the
graph shows.

Disjointness holds on the actual predicate, not merely on the labels. Two edges out
of `cand` both read `do` (`then, do` and `do over until`), but the node bodies
qualify them by the top of the unclaimed head stack, which admits one answer per
segment. That is a label-brevity matter, not an overlap.

One documentation gap, cosmetic: `cNone` enumerates "brace, subshell, negation,
coproc, a head already claimed, or no grammar word at all" and omits `if`, `while`
and `until`. Those words imply no candidate and do land in `cNone` through the
catch-all, so the graph is right; a reader checking the node text for the plan's
own flagship word will not find it. The prose candidate rule at line 106 carries
the same omission.

### 3. One new defect, in diagram 2

The `trans` path bypasses the pipeline substitution, and a grammar-only segment
can be a pipeline head.

Verified segmentation, again by running the parser rather than reading it:

```
{ cd build; } | grep x && rm out.js
  "start" | "{ cd build"
  ";"     | "}"
  "|"     | "grep x"
  "&&"    | "rm out.js"
```

The `}` is the segment adjacent to the `|`, and it carries no command word. Through
diagram 2 it takes `hasCmd --no--> trans --> out`, typing `transparent` and never
reaching `pipe` or `sub`. `transparent` answers yes to the carry question, so the
directory taken by `{ cd build` survives; `grep x` then reads its head's edge as
carrying and types `pipe-member`, which also carries; `rm out.js` consumes its own
`&&` and resolves against `build/`.

The shell does not agree. A brace group that is a pipeline element runs in a
subshell, which `shell-parse.ts:102-131` states in its own docstring ("a pipeline
element runs in a bash subshell"). The calling shell never leaves, and the write
lands on `./out.js`. Today the same command denies, because `}` carries the raw
joiner `;`, which resolves to `seq` and degrades. So this is a deny-to-allow
transition with no shell justification, which is the one thing constraint 1 as
restated at line 20 forbids.

The plan's rule for this is line 100, "`pipe-member` and `pipe-unproven` never move
the calling shell, head included". The rule is right and the graph cannot deliver
it, for two reasons both visible in the drawing. `sub` is the only node expressing
the subshell fact, and `trans` reaches the sink without passing it. And the segment
that actually takes the directory, `{ cd build`, is not adjacent to the `|` at all,
so no node in diagram 2 can see that it ran inside a subshell.

Neither safety net catches it. The S1 generator renders wrappers one-dimensionally
(`reachability-corpus.ts:461-486`, read): `brace` is always `{ mover; } && write`
and `pipe-head` is always `mover | cat && write`, so a brace group inside a pipeline
is a cross of two wrappers that the 24,304 rows do not contain. Step 2's added
spelling dimension varies line breaks within a wrapper, not wrapper composition. S4
pins `cd build | grep x && rm out.js`, which is the bare mover and denies correctly,
not the brace variant. So the S5 differential would report nothing and the gate
would see a clean sheet.

Certainty, stated plainly: the segmentation and today's verdict path are verified by
running the code. The reach assignments are my reading of the diagram and the prose,
because the layer does not exist yet. The subshell semantics are cited from the
repository's own docstring, not executed by me.

### Not findings

Diagram 1 gained a fourth subgraph for `shell-reach.ts` and reads better than the
version it replaces. The two paths out of `cmd` still share no node, which is the
insulation property, and the new module makes it a whole subgraph the git classifier
can be forbidden from importing rather than three identifiers. The `walk` / `facts`
/ `degrade` cycle is explained at line 169 and remains a state write-back, not a
dependency cycle.

Diagram 2's fan-out of 5 on `cand` is a switch over disjoint outcomes, not a
god-node. Density of 1.36 is well inside honest complexity for a two-phase decision.

Diagram 3 is unchanged and still matches the prose. I re-checked all eleven steps'
declared dependencies against the thirteen drawn edges after the revision and found
no drift.

The closing-word resolution (prior finding 3) is settled correctly. Step 2.1 adds
`GRAMMAR_TERMINATORS` as a second disjoint set, cites the `GRAMMAR_PREFIXES`
docstring's own exclusion at `command-word.ts:44-52`, and forbids extending the
existing set. The module-cycle consequence the planner found on the way is real and
the move to a third module is the right response.

## What a clean redraw would require

Only diagram 2 changes, and again the change is to the design rather than the
drawing.

Route the grammar-only segment through the pipeline question. `trans --> out`
becomes `trans --> pipe`, so a segment that runs nothing but sits in a pipeline is
typed by the pipeline rows rather than by `transparent`. That alone makes
`{ cd build; } | grep x && rm out.js` deny again, because `}` then answers no to
the move question and the carry answer stops being unconditional.

Then decide what a pipeline element means when the element is a compound whose
interior spans several segments. Segment-level membership marks only the segment
adjacent to the `|`, and the directory is taken two segments earlier. The plan needs
one sentence saying whether a pipeline's subshell fact reaches every segment of the
element or only the one the operator touches. Both answers are defensible; leaving
it implicit is what produced this finding, and it is the same shape of omission the
first pass found, an asymmetry that types one segment correctly and hands the next
one nothing.

Give S1 the wrapper cross. A brace group, an `if` and a `while` each need a piped
variant, or S5 measures a corpus that does not contain the shape the fix is about.
S4 needs `{ cd build; } | cat && rm out.js` as its own denying case beside the
`pipe-head` row it already pins.

---

**Reconciliation 260807-1515 (reconciler, Domain `code`) — Anmerkung, keine Änderung am Befund.**

Der geprüfte Plan ist seit dieser Reconciliation `260806-2353_*_plan-shell-reachability-model.md` mit Status `Superseded`: sein Gegenstand, der statische Klassifizierer, ist mit `ba7ccda` gelöscht und der Circle trägt seit 260807-0923-guard-misst-statt-orakelt den Marker `_s_`. Die hier festgehaltenen Diagramm-Befunde sind damit nicht widerlegt, sondern gegenstandslos.

Ein Ergebnis dieser Prüfkette hat den Circle überlebt und ist die Begründung des Nachfolgers: die zweite Bewertung und die daran anschließende Messung fanden fünf Löcher im bereits genehmigten Entwurf, und diese Kette ist als Belegmaterial in `260807-0825_*_should-the-guard-predict-shell-writes-or-enforce-them.md` eingegangen. Aus derselben Erfahrung stammt der MECE-Abschnitt in `rules/critical-stance.md` (Commit `327d0b6`).
