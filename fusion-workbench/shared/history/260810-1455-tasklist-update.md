# Tasklist rebuild — 260810-1455

**Agent:** taskplanner
**Domain:** code
**Active Circle:** none (unaffiliated backlog)
**Git HEAD:** `430d73a`
**Output:** `fusion-workbench/tasklist.md` (rebuilt from scratch, not amended)

---

## What was asked and what was produced

The queue was stale and had to be replaced. It now covers the 45 open defect records in
`fusion-workbench/shared/issues/` — 43 execution tasks plus 2 that need no work — ordered by dependency
and then by priority.

## Scanned

| Store | Read | Queued |
|---|---|---|
| `shared/issues/*_o_*.md` | 45 | 43 (2 closed without work) |
| `circles/*/issues/*_o_*.md` | 16 counted, not read | 0 — excluded by the dispatch, stated in the queue |
| `shared/planning/*_o_*.md` | 1 counted | 0 — excluded, stated |
| `shared/decisions/*_o_*.md` | 5 counted; 2 answered records read in full | 0 as tasks; two answers carried into tasks 2 and 4 |
| `shared/reviews/` | 13 counted, 2 read for verification | 0 — excluded, stated |
| `shared/analyses/` | 9 counted | 0 — excluded, stated |
| previous `tasklist.md` (260810-0249, built at `8960e1a`) | read in full | reused as a starting point, re-verified throughout |

All five exclusions are named in the queue's `## Scope of this queue`, so their absence is a recorded
fact rather than something a later reader has to infer.

## Ready versus blocked

- **43 open tasks**, of which **0 are blocked on a missing prerequisite task** — every dependency in the
  graph is another task in this same queue.
- **18 need a human decision** before an executor can start. Two of the eighteen are partial: part of
  the work is ungated and is named separately in the task body.
- **22 tasks carry no dependency edge at all** and can be dispatched in any order.

## Drift measured against the previous queue

The queue this replaces named 34 source records. Measured against the store at `430d73a`:

- **22 still open** — their earlier verification was used as a starting point and then re-run, never
  carried forward unchecked. Seventeen commits landed in between.
- **12 have closed** — all twelve verified to carry the `_c_` marker on disk. No renames, no losses.
- **23 currently-open records were unknown to it.**

22 + 23 = 45, which is the current open set.

## Four records changed materially since `8960e1a`, and one measurement no longer holds

1. **Two human gates were discharged.** The user answered
   `shared/decisions/260810-0921_a_*` (how a prompt calls a `bin/` helper the installed copy may not
   have) and `shared/decisions/260810-0920_a_*` (what a churn key is anchored to, and what happens to the
   entries already recorded). Both moved `_o_` → `_a_`. The tasks that consume them — task 2 and task 4 —
   are now dispatchable, and each quotes the recorded answer in full so no executor re-opens the question.
2. **Task 24's first acceptance criterion was met by `430d73a` itself.** The six records HEAD carried
   twice are gone: `git ls-tree` and `ls` now both return 45 open records, the duplicated-stem query
   returns nothing, and there are no unstaged deletions. What remains is entirely the class fix the record
   says was deferred to a decision nobody filed.
3. **Task 23's first criterion was met by a human clearing the guard halt.** `escalation.json` reads
   `haltActive: false, consecutiveBlocks: 0` against the `true / 24` the record quotes. Its second
   criterion is unmet and may be moot, since the policy it names was deleted — that one question is the
   whole remaining task.
4. **Task 31's cited measurement did not reproduce.** Three consecutive runs of
   `hooks/lib/__tests__/fusion-plane.test.ts` reported 123 tests each time, against the 96/93 variance the
   record measured. Three runs is evidence, not proof, so the record stays open — but its first question
   changed from "which three tests" to "does this still happen at all, and if not, which commit stopped
   it".

## How verification was done

Every one of the 45 was checked against the working tree at `430d73a` by reading the file or running the
command the record cites, never by trusting the record's own reconciliation notes. Each task carries a
`**Verified open:**` line naming what was read or run and what it said, and each says where a prior
verification was reused and what was re-checked on top of it.

**Suite baseline measured rather than assumed:** `cd hooks && npm test` → 39 files, 1040 tests, all
passing, 85.67s. That number is in the queue head so a task reporting a red suite is reporting its own
regression.

**Two live instances of an open defect were found while verifying others**, and are recorded in the queue
rather than only argued: the exempt-surface block that task 13 cites at `:204-213` now sits at `:217`, and
the Plane key paragraph that task 27 cites at `:251` now sits at `:271`. Both are the stale-line-citation
defect that task 40 is filed against, which is producing new instances faster than reconciliation repairs
them.

## Conventions carried and added

Three conventions the previous queue got right were kept: a `**Verified open:**` line per task naming what
was read or run; an explicit `**Human gate:**` line on any task an executor cannot start, collected in one
section; and an explicit statement, for each look-alike pair, of why two records of the same class are not
duplicates. That last one now covers six groups rather than two.

One convention was added, per
`shared/issues/260810-0431_o_the-work-queue-does-not-record-the-ground-it-was-built-on.md`: the queue head
carries `**Active Circle:** none (unaffiliated backlog)`. Writing it by hand here does not close that
record — it asks that the producer be required to write it, which is task 3 in the queue.

## Dependency graph

14 edges over 43 nodes: 9 are file collisions turned into sequencing, 5 carry genuine content
dependencies and are labelled as such in the Mermaid. Subgraph membership carries the collision statement,
so no edge is drawn for a shared file alone. Two honest readings are stated in the queue:
`agents/orchestrator.md` (8 tasks) and `rules/fusion-workbench-conventions.md` (6 tasks) are contended
god-files and the graph shows that rather than hiding it; and the 22 unconnected nodes are parallelisable
work, not forgotten work.

## Files written

- `/Users/k1/Projects/productive/fusion/fusion-workbench/tasklist.md`
- `/Users/k1/Projects/productive/fusion/fusion-workbench/shared/history/260810-1455-tasklist-update.md`

Nothing else was touched. No planning, issue, decision or review file was edited.
