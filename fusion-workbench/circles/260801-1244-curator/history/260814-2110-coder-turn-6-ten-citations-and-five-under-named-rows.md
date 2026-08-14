# Turn 6 — ten stale citations repointed, five root-anchored rows brought onto the criterion

**Agent:** coder
**Circle:** `circles/260801-1244-curator`
**Task:** T12, Turn 6
**Status:** Complete
**Date:** 2026-08-14

## What was asked

Two findings from the Turn-5 incremental review, one pass, one commit, sharing
`rules/fusion-workbench-conventions.md` and a fixture regeneration:

- `issues/260814-2022_c_ten-citations-that-bf9553f-staled-still-stand-…` (High)
- `issues/260814-2022_c_five-of-the-eight-root-anchored-rows-still-under-name-…` (Medium)

## Finding 1 — ten stale line-number citations

`bf9553f` inserted 2 lines into `agents/shaper.md` (at `@@ -52,7 +52,9 @@`) and 57 into
`agents/orchestrator.md` (at `@@ -307,6 +307,63 @@`). `9f4cdac` repaired only the six
`agents/shaper.md` citations in the `README-agents.md` roster.

**Group A — seven instances, `README-agents.md`, +57 into `agents/orchestrator.md`:**

| Citing line | Was | Now | What the new target holds at HEAD |
|---|---|---|---|
| `:59` `taskplanner` | `:392` | `:449` | the taskplanner dispatch passing `**Domain:**` |
| `:60` `reconciler` | `:649` | `:706` | the reconciler dispatch passing `**Domain:**` |
| `:61` `playmaker` | `:850` | `:907` | the Phase-4 playmaker dispatch with the `**Domain:**` prefix |
| `:64` `planner` `**Executors:**` | `:377` | `:434` | the planner dispatch prefixing `**Executors:**` |
| `:65` `planner` `**Circle:**` | `:377` | `:434` | the same planner dispatch |
| `:72` `editor` | `:438` | `:495` | the `**Deliverable language:**` no-default halt paragraph |
| `:72` `editor` | `:1397` | `:1454` | the `editor` row of the dispatch-routing table |

**Group B — three instances, +2 into `agents/shaper.md`:**

| Citing line | Was | Now | What the new target holds at HEAD |
|---|---|---|---|
| `rules/fusion-workbench-conventions.md:217` | `:87` | `:89` | "Rename its marker `_o_` or `_p_` to `_c_` — only the marker changes" |
| `agents/playmaker.md:114` | `:88` | `:90` | the `Promoted: circles/<dir> — …` append line |
| `agents/playmaker.md:282` | `:88` | `:90` | the same |

**Every corrected value was re-verified before it was written**, by `sed -n '<n>p'` on the
file at HEAD and confirming the line supports the claim the citing text makes about it.
The task required this rather than trusting the record's table, and it was the right
instruction to give — though in the event **all ten matched the record's prediction
exactly**, so there is no correction to report against it.

**The sweep the record's own §"Why this was not caught" asked for.** The Turn-5 miss was a
search on the topic axis where the citation form was what mattered. So the axis was
searched: `grep -ron "agents/shaper\.md:[0-9]*"` and the same for `agents/orchestrator.md`
across `agents/`, `rules/`, `skills/`, `docs/`, `README*.md`, `CLAUDE.md`. Outside the
workbench the ten repaired here were the only stale ones. Two results worth recording:

- `README-agents.md:66-68` cite `agents/orchestrator.md:337`, `:338`, `:339`, all of which
  are ≥ 307 and therefore *look* like they should have moved. They did not: they cite the
  block `bf9553f` itself inserted, and they resolve at HEAD to the `**Mode:**`,
  `**Circle file:**` and `**Initiated by:**` lines of that dispatch. Checked, not assumed.
- `README-agents.md:72`'s second instance is written as a bare `` `:1397` `` continuation,
  not as `agents/orchestrator.md:1397`. A grep keyed on the full path misses it. It is in
  the repaired set because the record enumerated it; a form-keyed sweep alone would not
  have found it, which is worth knowing for the next pass.

## Finding 2 — five under-named rows in the layout tree

`9f4cdac` generalised the criterion in the prose under the tree — *a consumer that only
names the path, in an exclusion or classification list, is as much a dependency as one that
reads the file* — and applied it to three of the rows. The rest were still named by the
older criterion.

Consumers were established **by searching the tree**, per the task: a `grep -rn` over
`hooks/*.ts`, `hooks/lib/*.ts` and `bin/*` for every root-anchored path, then reading each
hit to decide whether it is a real naming of the path or only prose. Result:

| Row | Added | Evidence |
|---|---|---|
| `.guard-state/` | `hooks/lib/churn.ts`, `hooks/lib/staging-drift.ts` | `churn.ts:126` `TRACKER_NOISE_FILES`; `staging-drift.ts:188` `LIVE_PREFIXES` |
| `.commit-lock/` | `hooks/lib/staging-drift.ts` | `staging-drift.ts:189` `LIVE_PREFIXES` |
| `.session-marker` | `hooks/lib/staging-drift.ts` | `staging-drift.ts:177` `LIVE_STATE` |
| `.plane-map.json` | `hooks/lib/staging-drift.ts` | `staging-drift.ts:182` `LIVE_STATE` |
| `.plane-outbox.jsonl` | `hooks/lib/staging-drift.ts` | `staging-drift.ts:183` `LIVE_STATE` |

Three findings from reading the whole block rather than the five named rows:

- **`plane.config.yaml` is correct as it stood.** `staging-drift.ts:84` mentions it, but in
  a doc comment, not in `LIVE_STATE`, `LIVE_PREFIXES`, `STORES` or `ROOT_RECORDS`. A prose
  mention does not break on a move, so it is not a dependency and was not added. The line
  the criterion draws is *named in a list*, not *mentioned in the file*.
- **The three rows `9f4cdac` already fixed need nothing further.** `agentstate.yaml`,
  `orchestrator-live.md` and `orchestrator-events.jsonl` were re-read against the criterion
  and their columns are complete.
- **`bin/` adds nothing beyond what is already there.** `.session-marker`, `.commit-lock/`
  and the two `.plane-*` files are each named by exactly one `bin/` helper, already in the
  column; `bin/monitor` names `.guard-state/` and none of the other four.

The parenthetical annotations (`(created and removed per commit)`, `(file ↔ Plane id map)`,
`(deferred pushes; …)`) describe the *surface*, not a consumer, so the new module was
inserted into the comma list ahead of the parenthesis rather than after it. That keeps every
row reading as "consumer list, then annotation", the shape the three fixed rows already had.

## Growth bound

`rules/fusion-workbench-conventions.md` is always-on, so its delta is charged.

| | bytes |
|---|---|
| Core floor (`RULE_BASELINE`, 2026-08-14 arming) | 86 573 |
| `GROWTH_BUDGET` | 12 000 |
| Hard ceiling | 98 573 |
| Core before this change | 87 510 |
| Core after | 87 670 |
| **Spent this change** | **+160** |
| **Head-room left** | **10 903** |

Finding 1 group B cost 0 — `87`→`89` and `88`→`90` are digit substitutions. The whole +160
is finding 2, against the ~150 the record estimated. `hooks/lib/__tests__/fixtures/rules-emission.golden`
was regenerated with `UPDATE_RULES_GOLDEN=1`; its diff is the one file's size and the
per-agent totals, with no change to the path set or the emission order.

## Verification

`cd hooks && npm test` — **exit 0**, 49 files, 1030/1030.

**Recorded because it cost three runs to establish, and the next agent should not have to.**
`npm test` is **flaky under full-suite parallel load**, in a way that is not caused by any
change here. Three consecutive full runs against this working tree failed differently:
first `legacy-halt-clearing.test.ts` (4 tests), then
`clear-halt-concurrent-halt.test.ts` + `fusion-commit-lock.test.ts`, then
`fusion-commit-lock.test.ts` alone. All three files pass in isolation
(`npx vitest run <the three files>` — 24/24, exit 0).

Rather than assume the flakiness was pre-existing, it was **measured**: the four changed
files were backed up, `git checkout --` reverted them, and `npm test` was run on clean HEAD.
It exited **1**, failing `fusion-commit-lock.test.ts` and `legacy-halt-clearing.test.ts` —
more failures than this change ever produced. The changes were then restored and the suite
run again: exit 0. So the red is load-dependent timing in the lock/reap harnesses, present
at HEAD, and this change neither caused nor fixed it.

The failing assertions are of the form "the creator never created a holder-less lock
directory" and a `clear-halt` exit of 1 — both windows a loaded machine can miss. This is a
real defect in the tests' timing assumptions and there is no record open on it; whether it
earns one is the orchestrator's call, not this task's scope.

## Files changed

- `/Users/k1/Projects/productive/fusion/README-agents.md` — 6 lines, 7 citation instances (group A)
- `/Users/k1/Projects/productive/fusion/agents/playmaker.md` — 2 lines (group B)
- `/Users/k1/Projects/productive/fusion/rules/fusion-workbench-conventions.md` — 1 line (group B), 5 lines (finding 2)
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/rules-emission.golden` — regenerated
- both issue records — `Resolved:` appended, `_o_` → `_c_`

Not committed; the orchestrator commits.
