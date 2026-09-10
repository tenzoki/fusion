The Turn and Phase vocabulary survives in 132 places across the shipped text
---
The cut removed the Turn, the Turn loop, the Turn budget and the numbered phases from the orchestrator's own prompt, and every other shipped surface still describes them. A reader of the docs, the READMEs or any other agent's prompt is told about a mechanism that no longer exists.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md steps C2, C4; e6a0dc67

**Evidence, measured at `e6a0dc67`.** Over `agents/`, `rules/`, `skills/`, `docs/`, the READMEs and `CLAUDE.md`, matching `Turn`, `Turn loop`, `Turn budget` and `Phase <n>` while excluding the ordinary English verb:

```
grep -rniE '\bTurn( loop| budget)?\b|\bPhase [0-9]' agents/ rules/ skills/ docs/ README*.md CLAUDE.md \
  | grep -viE 'turned|turning|turns out|return' | wc -l
```

132 lines. The heaviest surfaces are `README-hooks.md` (11), `agents/playmaker.md` (10), `docs/working-model.md` (9), `agents/bugfixer.md` (9), `rules/circle-records.md` (8) and `rules/orchestrator-rebalance.md` (7).

**Three kinds are mixed in that number and they do not take the same repair.**

1. **Live instructions that cannot be followed.** `agents/playmaker.md`'s "NEVER invoke from inside an active Turn loop" names a thing that cannot happen; `agents/bugfixer.md` describes its dispatch as arriving at a phase step. These are wrong now and mislead an agent at run time.
2. **Descriptions of how fusion works**, in the docs and READMEs. `docs/fusion-intro.md` §4 and §5 describe the removed loop end to end, and its line 73 calls `maxTurns` the only setting in `fusion.json`, which is false twice over: the leaf is retired and `citations.extraPaths` is the only live one.
3. **Release history**, in `docs/upgrading-to-v10*.md`. Correct as it stands and not to be rewritten, per the rule the citation-repair pass followed.

**Why it was left.** Nine steps of the cut were each scoped to their own files, and the pass that collected the fallout fixed this vocabulary only where a dangling reference or a state-file mention forced it into the paragraph. Nothing owns the rest.

**Acceptance.** The count above, re-run, returns only lines of kind 3. Kinds 1 and 2 are gone, `rules/circle-records.md` and `rules/orchestrator-rebalance.md` included — the second describes a gate that survives on a changed trigger, so its Turn references are the ones most likely to be read as live.

---

Reconciliation (260910-2020, reconciler): open, and the headline figure has moved. The record's own
command, re-run at `07961552`, returns **85** lines, not the 132 measured at `e6a0dc67`. The fall is
not repair: four of the six surfaces the record named as heaviest were deleted whole in the two
commits after it was filed — `agents/playmaker.md` (10) and `agents/bugfixer.md` (9) at `2a785ba2`,
`rules/circle-records.md` (8) at `76d833be` — so the kind-1 "live instructions that cannot be
followed" the record leads with are largely gone by deletion rather than by rewriting. What stands
is kind 2 and the untouched kind 3: `README-hooks.md` 11, `rules/orchestrator-rebalance.md` 7,
`docs/working-model.md` 6, `CLAUDE.md` 6, `README.md` 5, `docs/philosophy.md` 4,
`agents/orchestrator.md` 4, `docs/fusion-intro.md` 3. The acceptance is unchanged and unmet; only
its arithmetic is.
