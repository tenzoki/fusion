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

---
Resolved: kinds 1 and 2 are gone from the shipped text. The record's own command, re-run over
the same corpus, returns **59** lines where it returned 85 at `07961552` and 132 at `e6a0dc67`.

**The acceptance as written — "returns only lines of kind 3" — is not reachable, and the
reason is a property of the command rather than of the text.** The regex cannot separate a
live claim from four other things that carry the same token, and 36 of the 59 survivors are
one of those four. Classified in full, so that nobody re-opens this against a number:

- **23 release history** (kind 3), all in `docs/upgrading-to-v*.md`. Untouched, per the rule.
- **24 removal notes** — sentences whose subject is that the mechanism is gone
  (`rules/orchestrator-rebalance.md` 7, `README-hooks.md` 6, `CLAUDE.md` 4, `README.md` 3, and
  one each in `docs/working-model.md`, `docs/fusion-intro.md`, `README-agents.md`,
  `skills/cadence/SKILL.md`). Several were written by this pass: a reader who remembers the
  Turn loop needs to be told it went, and deleting the sentence would leave them guessing.
- **8 the ordinary English verb** the record's own exclusion list does not catch — "Turn
  brittle input into a spec", "turn vague requests", "Turn the guard down", "turn out wrong",
  "turn `npm test` red". Rewriting English to satisfy a grep was not done.
- **2 record citations** of `260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md`
  in `agents/orchestrator.md`. The record exists and the citation must not move.
- **2 legacy-data descriptions** in `skills/migrate/SKILL.md`: a pre-v11 Circle record may
  carry a Turn log, and the migration says it is carried across verbatim. True as it stands.

What was actually repaired, by surface: the numbered-phase and step references in
`agents/analyst.md`, `agents/planner.md`, `agents/coder.md`, `agents/ontocoder.md`,
`agents/reconciler.md`, `rules/commit-lock.md` and `CLAUDE.md`, each rewritten as a heading
anchor of the section that carries the procedure now; the "work queue" claim in
`agents/coder.md` and `agents/ontocoder.md`, where the orchestrator holds no queue; `Turn` as
a forbidden noun in `rules/user-facing-output.md`; `docs/fusion-intro.md` §4 (the `### Turn`
section replaced by the dispatch loop and a Coherence/Rebalance section on its real trigger)
and §5 (the eight-step cleanup pipeline, which is five commands and a two-step commit-and-push
now); `docs/working-model.md` §3 and §5a; `docs/philosophy.md` (including the phases sentence
the record's own exclusion filter hid, because the line also contains "return");
`README.md`'s Phase-3 reconciliation advice; `README-hooks.md`'s configuration sections, its
ASCII diagram, and the `events-query.ts` rows that still documented the removed `turns`
subcommand and `countTurns`; `skills/help/SKILL.md`'s configure and older-releases topics,
which told a reader to copy a Turn budget that no longer exists; `skills/cadence/SKILL.md`'s
gate-answers-per-Turn metric, which read the `turn_start` event nothing emits.

Two adjacent falsehoods in passages this pass was already rewriting were corrected with them
and are named rather than smuggled: `docs/fusion-intro.md` said fifteen agents where the
roster is eleven, and `docs/philosophy.md` named `coderev` / `ontorev` where the roster has
one `reviewer`.

Verification: `cd hooks && npm run build && npm test` — exit 0, 895 tests in 52 files.
`bin/fusion-citation-check` — `verdict=clean`, `edited-violations=0`.
