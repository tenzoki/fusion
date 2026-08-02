Prompt gaps surfaced by the fusion-paths key-set derivation

---
**Domain:** code
**Filed by:** `coder` in T3-A
**Cross-references:** `fusion-workbench/decisions/260717-0033[a]-derive-fusion-paths-key-sets-from-prompts-instead-of-declaring-them.md`, `fusion-workbench/issues/260717-0031[o]-p8-lint-gate-scope-open-questions-from-conversions.md` (item 4), `bin/fusion-paths`, `rules/fusion-workbench-conventions.md` `## Path Resolution`

---

## Why this exists

The decision to derive `fusion-paths` key sets from the prompts (`260717-0033[a]`) left one thing open and said so: derivation makes over-emission structurally impossible, and the over-emission signal goes silent with it. Several of those cases were **prompt gaps**, not spare keys. This is the "eigener Ort" the decision asked for. It is filed before the derivation is committed, so the signal survives the change rather than dissolving into it.

## What the derivation actually dropped

Measured, not estimated: the declared key sets at `HEAD` versus the derived sets, over all 15 agents.

**16 keys dropped across 9 agents. Zero gained.** The derived set is a strict subset of the declared set for every agent — so no prompt lost a path it names, and the change carries no under-emission risk. Every dropped key is one no prompt referenced.

| Agent | Dropped | Verdict |
|---|---|---|
| `orchestrator` | `OUT_CIRCLE`, `OUT_MEMO`, `SCAN_HISTORY` | **Not a gap — resolved.** These are the three T2-B flagged as "used by hosted skills, do not delete". Under the skill namespace (`260716-1940[a]`) they now sit with their real consumers: `OUT_MEMO` → `memo`, `OUT_CIRCLE` → `direct` + `circle-pop`, `SCAN_HISTORY` → `circle-stash`. Verified by running each. |
| `bugfixer` | `SCAN_PLANS` | **Not a gap — correct drop.** The prompt says twice that it does not follow plans. T2-B classified this as the one clear-cut spare. |
| `coder` | `OUT_DECISION`, `SCAN_ISSUES` | **Not a gap — correct drop.** `coder.md:47` edits a decision record *in place*, reached via `$SCAN_DECISIONS`; it files no new record, so it needs no write key. It reaches an issue by the path `$TASKLIST` gives it (`:44-46`), not by scanning. |
| `ontocoder` | `OUT_DECISION` | **Not a gap — correct drop.** Same in-place edit pattern as `coder`. |
| `coderev`, `ontorev` | `OUT_HISTORY` | **Gap.** 13 of 15 agents log a session history entry. These two have no history-log step at all. Either the step is missing, or these two are deliberately exempt and nothing says so. |
| `coderev`, `ontorev` | `OUT_DECISION` | **Probable gap.** Both were declared able to file decision records; neither prompt names the act. |
| `planner` | `OUT_ISSUE` | **Gap.** `planner.md:23` says its output is "planning documents only, plus history and **issue entries** per conventions", and `:63` says "file an issue referencing the spec" — the act is named twice, the path never. |
| `planner` | `OUT_DECISION`, `SCAN_ANALYSES` | **Probable gap.** The prompt reads decisions (`:53`) but never names filing one; and an analyst's report is a planning input the prompt does not name a path for. |
| `shaper` | `SCAN_PLANS` | **Probable gap.** It writes `$OUT_PLAN` but names no path for reading prior specs and plans. |
| `analyst` | `SCAN_ANALYSES` | **Probable gap.** It skims history (`:18`) but names no path for prior analyses. |

## What to do

Each row marked **Gap** or **Probable gap** is a question about the prompt, and the answer is either "add the step and the `$KEY`" or "the prompt is right and the key was speculative". Both are decided by reading the prompt, not by editing `bin/fusion-paths` — the resolver has no key list to edit any more.

Not fixed in T3-A on purpose: that task's mandate excluded re-editing the prompts, which had just been converted across five commits. A prompt change is also not a path-resolution change, and mixing them is how the two got confused in the first place.

## Consequence for P-8

`260717-0031[o]` item 4 is answered by this and by the derivation:

- **Under-emission** — impossible now. The prompt naming a key is what creates it. Nothing left to gate.
- **Over-emission** — impossible now, and its signal is this file.
- The gate's remaining job is the one it was always really for: **no store-path literal in a prompt** (items 1, 2 and 3 of that issue, which are untouched by this).

---
Filed by `coder` in T3-A, from the delta between the declared key sets at `HEAD` and the sets derived from the prompts.

---
Reconciliation 260731-2324 (reconciler, domain `code`) — **stays `_o_`. Not resolved by the v5.7.0 cadence work, and not overlapping with it.**

Checked directly against the current prompts. **Five of the seven rows are still gaps; two are settled and should be struck from the table.** A bare `grep -c '$KEY'` returns 0 for all seven — that count alone is not the answer, because a key can be legitimately absent when the prompt has *decided* the agent does not perform the act.

| Row | Key named? | Verdict now |
|---|---|---|
| `coderev` / `ontorev` → `$OUT_HISTORY` | no / no | **Settled — not a gap.** Decision `circles/260718-1924-v5x-overhaul/decisions/260718-2150_i_reviewers-history-log-step.md` ruled the three reviewers *exempt*, and the exemption is documented in the prompts: `agents/coderev.md:69` and `agents/ontorev.md:62` both read "You write no separate session-history entry — your review file under `$OUT_REVIEW` is this session's durable record, and a history log would only duplicate it." (`agents/conceptrev.md:32` likewise.) Absence of the key is the correct realisation of a decided answer. |
| `coderev` / `ontorev` → `$OUT_DECISION` | no / no | **Settled — not a gap.** `agents/coderev.md:22` and `agents/ontorev.md:19` both instruct: check `*_o_*.md` and `*_a_*.md` under `$SCAN_DECISIONS`, then "Don't refile; cross-reference instead". The reviewers read the decision store and never write to it, so a read key without a write key is the intended shape. `inference:` the original "probable gap" verdict was reached from the declared-set delta alone, before the prompt line was read. |
| `planner` → `$OUT_ISSUE` | no | **Still a gap, and the most consequential of the five.** `agents/planner.md:23` says the output is "planning documents only (in `$OUT_PLAN`), plus history and **issue entries** per conventions" and `:72` says "file an issue referencing the spec rather than guessing". The act is named twice; the write path is named nowhere. Planner's full derived set is `$OUT_HISTORY $OUT_PLAN $SCAN_DECISIONS $SCAN_ISSUES $SCAN_PLANS` — a planner filing an issue today has no resolved target. |
| `planner` → `$OUT_DECISION` | no | Still a probable gap. The prompt reads decisions (`:176`) and never names filing one. |
| `planner` → `$SCAN_ANALYSES` | no | Still a probable gap. |
| `shaper` → `$SCAN_PLANS` | no | Still a gap. Shaper's derived set has `$OUT_PLAN` but no read key for prior specs and plans. |
| `analyst` → `$SCAN_ANALYSES` | no | Still a gap. Analyst has `$SCAN_PLANS` and `$SCAN_HISTORY` but no path for prior analyses. |

**Correcting an error in an earlier draft of this note:** I first recorded coderev's silence in `shared/history/` this session as live corroboration of the `$OUT_HISTORY` row. That was wrong, and wrong in the direction of confirming the issue rather than testing it — coderev wrote no history entry because its prompt tells it not to, per a decision already implemented. The behaviour is correct. Checking the reviewer prompts' own text, rather than only the key-set delta, is what turned two "gaps" into two settled rows.

**On the overlap the reconciliation brief asked about:** the cadence skill is a *new consumer* of the derivation mechanism, not a fix to it. `skills/cadence/SKILL.md` names `$OUT_MEMO` and `$SCAN_HISTORY`, and `bin/fusion-paths cadence` correctly emits `WORKBENCH`, `OUT_MEMO`, `SCAN_HISTORY` and nothing else (verified against `./bin/fusion-paths`, exit 0). That is a positive datapoint for the derivation design — a prompt authored long after the change got its key set right with no resolver edit, which is the property the design was chosen for. But this issue is about **agent prompts missing a step they are documented to perform**, and the v5.7.0 diff (`git diff 47c4398..HEAD`, seven files) touches nothing under `agents/`. No row moved.

Remaining work is smaller than filed: five rows, four of them one-line prompt additions, one (`planner` → `$OUT_ISSUE`) a real inconsistency between what the prompt promises and what it can resolve.

---

**Reconciliation 260802-1413 (reconciler, domain `code`) — stays `_o_`. Live corroboration for four of the five remaining rows, from a session that was not looking for it.**

The planner reported during `circles/260801-1244-rule-provenance-header` that `bin/fusion-paths planner` emits no `OUT_DECISION` key. The reconciler re-ran the resolver against this repository rather than taking the report, and the output corroborates more rows than the one reported.

```
$ FUSION_PLUGIN_ROOT=$PWD ./bin/fusion-paths planner
WORKBENCH=…  CIRCLE=…  OUT_PLAN=…  OUT_HISTORY=…
SCAN_PLANS=…  SCAN_ISSUES=…  SCAN_DECISIONS=…

$ FUSION_PLUGIN_ROOT=$PWD ./bin/fusion-paths shaper
… OUT_PLAN=…  OUT_ISSUE=…  OUT_DECISION=…  OUT_CIRCLE=…
SCAN_ISSUES=…  SCAN_DECISIONS=…  SCAN_CIRCLES=…
```

Four rows confirmed against the resolver's actual output, not against a grep of the prompt:

| Row | Confirmed how |
|---|---|
| `planner` → `$OUT_ISSUE` | Absent from the emitted set. A planner that files an issue today has no resolved write target. Still the most consequential row. |
| `planner` → `$OUT_DECISION` | Absent. This is the row the planner surfaced. |
| `planner` → `$SCAN_ANALYSES` | Absent. |
| `shaper` → `$SCAN_PLANS` | Absent, and the contrast is sharp in the same output: shaper gets `OUT_PLAN` and every other store it writes, and no read key for prior specs and plans. |

**Why this is evidence and not just a restatement.** The 260731-2324 pass reached its verdicts by reading prompts for a named `$KEY`, which is the right test for distinguishing a gap from a decided absence but tells you nothing about what an agent actually receives at run time. Running the resolver closes that loop from the other end: these four keys are not merely unnamed in the prompt, they are not in the emitted environment, so the gap is live rather than probable. The distinction matters because the derivation design makes the prompt the *only* source of the key set — an unnamed key cannot be supplied by any other route.

`analyst` → `$SCAN_ANALYSES`, the fifth row, was not exercised this session and is unchanged.

The two rows the previous pass struck (`coderev`/`ontorev` → `$OUT_HISTORY` and `$OUT_DECISION`) stay struck. Nothing this session touched `agents/`; `git diff --name-only e8988d9..b568ad9 -- agents/` returns nothing.
