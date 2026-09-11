Five deleted agents are still named as live in twelve shipped files
---
Step C8 deleted `coderev`, `ontorev`, `bugfixer`, `taskplanner` and `playmaker`. Twenty-seven sites across nine rule files and three agent prompts still name them, most as live roles with live obligations. The orchestrator's own event table still lists three bugfix row kinds with no bugfixer in the roster.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 2a785ba2 (the deletion); 260910-1809_*_the-turn-and-phase-vocabulary-survives-in-132-places-across-the-shipped-text.md (the neighbouring sweep, which found this and correctly left it as a different subject)

**Evidence, measured at HEAD.**

```
grep -rhoE '\b(coderev|ontorev|bugfixer|taskplanner|playmaker)\b' rules/ agents/ | wc -l
```

27, across `rules/review-contract.md`, `rules/commit-lock.md`, `rules/context-manifest.md`, `rules/design-diagrams.md`, `rules/context-lean-claude-md.md`, `rules/user-facing-output.md`, `rules/workbench-path-resolution.md`, `rules/critical-stance.md`, `rules/fusion-workbench-conventions.md`, `agents/coder.md`, `agents/ontocoder.md` and `agents/orchestrator.md`.

**Three kinds, and they do not take the same repair — the same split the vocabulary sweep needed.** A rule that *addresses* a deleted agent has no audience and its instruction cannot be followed: `rules/review-contract.md` is emitted to the reviewer now, and a sentence in it naming coderev and ontorev as its two audiences is simply false. A rule that *cites* one as an example is stale but harmless, and rewriting it costs bytes on a floor eleven agents pay for. And a sentence whose subject is that the agent is gone is correct as it stands, the way the removal notes in the vocabulary sweep are.

**The event table is the sharpest instance.** `agents/orchestrator.md` lists `bugfix_start`, `bugfix_success` and `bugfix_failure` as event kinds the orchestrator emits. No bugfixer exists to dispatch, so no session can emit them, and a reader of the table cannot tell that from the table. Nothing else in the prompt reaches those rows.

**Why it was left rather than swept.** The pass that cleared the Turn and Phase vocabulary found this and stopped at it, on the ground that it is a different subject with a different split, and that doing half of it inside another sweep is how a repair becomes unattributable. That judgement is right and is why this is a record.

**Acceptance.** The command above returns only sentences of the third kind, and the commit that gets it there says how many of each kind it found. The three bugfix event rows are gone from the orchestrator's table, or the table says what emits them.

Also seen: 260911-1131 by reviewer — the measurement stops at `rules/` and `agents/`; the same grep over `skills/`, `hooks/lib/`, `hooks/*.ts`, `docs/`, `README.md`, `README-agents.md` and `CLAUDE.md` (tests excluded) returns 49 across 22 further files at `1d6103c4`, including the first-kind case in `rules/fusion-workbench-conventions.md` `## Filename Patterns` ("`<sender>` on a review file is `coderev` or `ontorev`") and in `rules/review-contract.md`, whose opening paragraph still addresses two agents that no longer exist while `bin/fusion-rules:284` emits it to `reviewer` alone.

---
Resolved: read site by site rather than swept — `260911-1316-five-retired-agents-and-the-container-contradiction-read-site-by-site.md` carries the reading. The population is 161, not the 27 this record measured: both greps were case-sensitive and missed the three capitalised rows named above as the sharpest instance, and both corpora excluded `bin/` and the extension-less fixtures. The record's three-way split did not hold and was replaced by one cut on truth rather than on grammar: a value a program consumes (43, never touched), a sentence false at HEAD (12, repaired), a sentence true at HEAD (106, left). The 12 landed at `10e7cc15` and the commit after it. This record's acceptance test is superseded by that count, because it asks a grep to return only sentences and 43 of the survivors are not sentences.

The three `bugfix_*` rows were kept rather than deleted, against the reading's own recommendation and on a measurement it could not take: `fusion-workbench/orchestrator-events.jsonl` carries 7 `bugfix_start` rows, so the table is the only thing that explains a kind a reader can still meet. Their `When` columns no longer name a bugfixer. One survivor of a different subject was filed rather than folded in: `260911-1332_*_the-staging-drift-header-says-the-history-entry-is-still-written-and-cites-a-step-3b-the-prompt-no-longer-has.md`.
