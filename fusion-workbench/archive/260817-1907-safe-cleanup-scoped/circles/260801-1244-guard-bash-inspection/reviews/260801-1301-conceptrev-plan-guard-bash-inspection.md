# Concept Evaluation: Implementation Plan — guard inspects Bash for file mutation (C5c)

**Date:** 2026-08-01 13:01
**Target:** `260801-1253_*_plan-guard-bash-inspection.md`
**Verdict:** acceptable
**Diagrams evaluated:** 3  |  **Validation:** by-tool (mmdc 
`/opt/homebrew/bin/mmdc`, all three render)

## Verdict

The design these three graphs show is sound: one lexer, two sibling
classifiers, one wiring point, no cycles anywhere, and a step DAG that matches
the declared step dependencies edge for edge. The control-flow diagram, which
carried the highest risk because it redraws a branch that already exists in
`hooks/guard.ts`, is faithful to the code. I checked every node against the
source and found no misrepresentation. One diagram falls short of clean: the
module diagram uses its arrow to mean two different relations, so a reader
cannot tell dependency direction from it. A second, smaller gap sits in the
step DAG, which omits the ordering constraint the plan's own Q3 human gate
imposes. Neither defect points at a tangled design, and neither is a reason to
withhold approval.

## Per-diagram measurements

| # | Subject | Type | Nodes | Edges | Ratio | Max fan-out | Max fan-in | Cycles | Layered | Verdict |
|---|---------|------|-------|-------|-------|-------------|------------|--------|---------|---------|
| 1 | Module dependencies | flowchart LR | 6 | 6 | 1.00 | 2 (`SP`, `HOOK`) | 3 (`MUT`) | 0 | yes (3 subgraphs) | acceptable |
| 2 | Bash control flow after the change | flowchart TD | 8 | 8 | 1.00 | 3 (`B` classifyGitCommand) | 2 (`G` allow) | 0 | implicit (TD chain) | clean |
| 3 | Step dependency DAG | flowchart TD | 8 | 10 | 1.25 | 3 (`S2`) | 2 (`S4`, `S6`, `S8`) | 0 | implicit (topological) | clean |

No orphans in any diagram. All six edges in diagram 1 are labeled. Density is
low throughout; nothing here is a hairball.

## Findings

### 1. Diagram 1 — the arrow means two different relations (substantive, bounded)

The module diagram carries six edges, and the direction is not consistent
across them under a dependency reading:

```
SP  ──blank mode──────────>  GIT      shell-parse is imported BY git-branch-guard
SP  ──capture mode────────>  MUT      shell-parse is imported BY bash-mutation-guard
PM  ──protectedPaths──────>  MUT      paths.ts is imported BY bash-mutation-guard
SD  ──gates───────────────>  HOOK     self-detect is imported BY guard.ts
HOOK ──always, incl. repo─>  GIT      guard.ts imports git-branch-guard
HOOK ──only when not repo─>  MUT      guard.ts imports bash-mutation-guard
```

The first four edges point from provider to consumer. The last two point from
consumer to provider. Read as a module dependency graph, which is what the
subgraph captions ("one lexer", "two sibling classifiers", "existing guard
primitives") invite, four of six arrows run backwards against the import
direction.

To be fair to the diagram: there is a reading under which all six are correct,
namely "X feeds or invokes Y". The parser feeds parsed segments to the
classifiers, `paths.ts` feeds glob matching to the mutation classifier,
self-detect feeds a boolean to the hook, and the hook invokes both classifiers.
That reading is internally consistent. It also makes diagram 1 a control-flow
graph rather than a structure graph, and diagram 2 already covers control flow
with more precision. The two conditional edge labels ("always, incl. plugin
repo" and "only when not plugin repo") are the runtime gate that diagram 2
renders correctly as decision node `E`. Carrying the same condition in both
places, less precisely in one of them, is the mild single-concern violation
that produced the direction mixing in the first place.

The `SD -->|gates| HOOK` edge is imprecise at a second level. Self-detect does
not gate `guard.ts`; it gates the `HOOK --> MUT` call specifically, and (in the
existing code at `hooks/guard.ts:274`) the write-tool path. Diagram 2 gets this
right and diagram 1 flattens it.

**On redraw:** drop the two `HOOK -->` conditional edges and the `SD` edge from
diagram 1, or reverse the other four. Either choice gives one uniform relation.
The condition belongs to diagram 2, where it already lives.

This is a representation defect, not a design defect. The underlying structure
is a clean three-tier acyclic arrangement with the primitives injected rather
than reached for, and the graph does show that much correctly.

### 2. Diagram 3 — the Q3 human gate has no edge (medium)

The step DAG is a faithful rendering of the eight steps' declared
`**Dependencies:**` lines. I checked all ten edges against them:

| Step | Declared dependencies | Edges in the DAG | Match |
|---|---|---|---|
| 1 | none | (no incoming) | yes |
| 2 | step 1 | `S1 --> S2` | yes |
| 3 | step 2 | `S2 --> S3` | yes |
| 4 | steps 2 and 3 | `S2 --> S4`, `S3 --> S4` | yes |
| 5 | step 2 | `S2 --> S5` | yes |
| 6 | steps 4 and 5 | `S4 --> S6`, `S5 --> S6` | yes |
| 7 | step 5 | `S5 --> S7` | yes |
| 8 | steps 6 and 7 | `S6 --> S8`, `S7 --> S8` | yes |

Ten declared prerequisites, ten edges, no extras and no omissions. As a
dependency rendering this is exact.

The gap is against the plan's own Open Question Q3, which reads: "Human gate
after step 3. Review the table and the allow-side test cases before step 5
wires it into the hook." No `S3 --> S5` edge exists, and step 5 declares only
step 2 as a prerequisite. The DAG therefore permits step 5 to begin
immediately after step 2, in parallel with step 3. An executor following the
graph can wire the classifier into the live hook before the verb table has been
reviewed.

That matters here more than it usually would, because the plan's own risk table
names a false positive across all sixteen agents as "the largest blast radius in
the Circle" and calls Q3 "the cheapest point to catch an over-broad row". The
constraint is stated in prose and absent from both the dependency lines and the
graph, so the one artifact an executor is most likely to follow does not carry
it.

**On redraw:** add `S3 --> S5` (or a gate node between them) and add step 3 to
step 5's declared dependencies, so the prose constraint and the graph agree.

### 3. Diagram 2 — verified against the source, three cosmetic elisions

I read `hooks/guard.ts` and traced each node. The diagram is accurate about the
branch it modifies:

| Node | Code | Verified |
|---|---|---|
| `B` classifyGitCommand (unchanged) | `guard.ts:156` | yes |
| `C` guard_advisory + allow | `guard.ts:159-177` override path | yes |
| `D` recordBlock git_branch_switch, guard_block or guard_halt, block | `guard.ts:180-199` | yes |
| `E` isFusionPluginCwd? | new call site per step 5; `self-detect.ts` resolves against `process.cwd()` with no upward walk | yes |
| `F` classifyBashMutation vs protectedPaths | new, inserted before the final `allow()` per step 5 | yes |
| `G` allow, no counter reset, no guard_allow event | `guard.ts:201-214`, the comment block states exactly this | yes |
| `H` recordBlock protected_path | step 5 specifies the `protected_path` trigger, matching the write-tool path at `guard.ts:312` | yes |

The branch order in the diagram (override first, then deny, then the new gate,
then allow) matches the code's order. The insertion point the diagram implies
is the one step 5 names.

Three elisions, all cosmetic:

- The `A --> B` edge skips the `config.guard.enabled` check at `guard.ts:251`,
  which runs upstream in `main()` before `guardBashCommand` is reached. A
  reader could infer the mutation check runs even with the guard disabled. It
  does not.
- Node `C` shows `guard_advisory + allow` but omits the
  `escalation.recentEvents` push and `saveEscalation` that accompany it at
  `guard.ts:165-173`. The allow-path zero-side-effect property in node `G` is
  about the *final* allow, so no contradiction arises, but the override path
  does write state.
- The `exempt` predicate from step 2's `MutationOptions`, checked after a
  protected match and before the deny, has no branch in the diagram. Since it
  defaults to none in this Circle, showing the shipped behaviour is defensible.

None of these change the branch structure. I would not redraw for them.

## Notes on plan accuracy (outside the diagram remit)

The plan states its Current State was read from source rather than inferred. I
spot-checked the citations that the control-flow diagram depends on, and they
hold: `guard.ts:265-268` is the Bash route and unconditional return,
`guard.ts:214` is the final `allow()`, `guard.ts:201-213` is the
zero-side-effect comment, `guard.ts:309` is the protected-path check,
`guard.ts:274` is the self-detect call, `git-branch-guard.ts` is 649 lines with
`stripDataRegions` at 169, `extractCommandSegments` at 335 and `tokenize` at
409, and its suite is 84 cases in 512 lines. One citation is off by one:
`self-detect.ts:20` is blank, and the `resolve(process.cwd(), ...)` call the
plan refers to is at line 21. The substance of the claim, no upward walk, is
correct.

No missing-diagram finding. The verb table is tabular content and correctly a
table. The three testing layers have no interconnection worth a graph.

---

## Reconciliation annotation — 260801-2029 (reconciler)

The plan this evaluated is now `_c_` (renamed to `260801-1253_*_plan-guard-bash-inspection.md`); the `**Target:**` path above no longer resolves. Left uncorrected, since a review records what it read.

Two of the three diagrams held against the code that was built. Diagram 2, the control flow, is faithful to `hooks/guard.ts` at HEAD `9ab5a2a`. Diagram 3's step DAG was executed edge for edge — all eight steps landed, none was cut, and the S3→S4 ordering it drew was honoured.

Diagram 1, the module dependency graph, is now **out of date rather than merely ambiguous**: the implementation grew a third shared module, `hooks/lib/command-word.ts`, which sits under both classifiers and is not on the diagram. That module is what closed the two High findings of the later code review. The reviewer's complaint that the arrow means two different relations therefore compounded — the diagram is now both ambiguous and incomplete. Recorded here rather than redrawn; the plan is closed and the code is the authority.
