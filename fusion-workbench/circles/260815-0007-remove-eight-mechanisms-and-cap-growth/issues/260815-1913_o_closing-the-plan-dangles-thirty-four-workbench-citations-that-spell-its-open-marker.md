# Closing the plan dangles thirty-four workbench citations that spell its open marker

---
**Severity:** Low — nothing breaks; the cost is that a reader following a citation gets nothing
**Domain:** code
**Filed by:** reconciler, Phase-3 pass `history/260815-1913-reconciliation.md`, HEAD `9306f0a`
**Owner:** none assigned — this is a class question, not a repair
**Cross-references:** `rules/fusion-workbench-conventions.md` `## State Markers — issues and planning` (state change is a rename); `issues/260815-1247_o_a-backlog-entrys-related-line-points-at-a-marker-the-playmaker-has-since-moved.md` (same class, one entry); `shared/issues/260812-1720_o_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md` (why no gate sees it)

---

This pass renamed `planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md` to `_c_`,
which the conventions require once every step carries `[DONE]`. Measured immediately before the
rename:

```
$ grep -rl '260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth' fusion-workbench/ | wc -l
34
```

Twelve in this Circle's `history/`, fourteen in its `issues/`, one each in its `decisions/`,
`reviews/` and record, one in `shared/history/`, one in `shared/planning/`, one in `.guard-state/`
and two at the workbench root. Every one spells the `_o_` marker literally rather than the `_*_`
glob form the conventions use throughout their own worked examples. No file outside
`fusion-workbench/` cites it, so no lint and no test is affected.

---

## Why this is filed rather than repaired

Rewriting 34 files to chase one rename is a worse trade than leaving them: the citations were
correct when written, the target is one directory away under a one-character difference, and a
reconciliation pass that mass-edits historical records is doing something other than reconciling.

The class is what is worth deciding. Three positions are visible in the corpus and none is written
down:

1. A citation of a marked artifact spells `_*_`, so it survives every transition. This is what
   `rules/fusion-workbench-conventions.md` does in its own examples and what the Circle record's
   `## Dependencies` bullets do.
2. A citation spells the marker it saw, and going stale is the record's honesty about when it was
   written.
3. Something reads the workbench and repoints them, which is
   `shared/issues/260812-1720_o_…` from the other side.

The same class already has an instance in this Circle at
`issues/260815-1247_o_a-backlog-entrys-related-line-points-at-a-marker-the-playmaker-has-since-moved.md`,
filed against one entry rather than thirty-four. Whether it is a defect at all depends on which of
the three positions holds, which makes it a decision this record does not take.

---

**Re-measured 260815-2109 at HEAD `d2b45e1`** (reconciler, `history/260815-2109-reconciliation.md`).
The count in the title is stale and the record stays open. `grep -ro` across `fusion-workbench/`
now returns **57** occurrences, or **41** once the two append-only event streams
(`orchestrator-events.jsonl`, `.guard-state/events.jsonl`) are excluded — those two legitimately
hold the name the plan carried when the event was written and must never be rewritten.

The title was not corrected, deliberately: renaming the file to carry a new number would itself
create the dangling-citation class this record is about, in the four places that already cite it.
The number in a title is a filing timestamp of the measurement, not a live figure; this annotation
is where the live figure goes.

**One of the 41 was repaired by this pass** rather than left: `agentstate.yaml:26`
`current_task.source_file`, which named the `_o_` path while its sibling `plan_context.plan_file`
named the `_c_` one. That is a live session-state field a resume reads, not a historical record,
so it is in a different class from the other 40 and was fixed on sight. The remaining 40 are
history files, closed issue records and review files that name the plan under the marker it
carried at the time — correct as written.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Grown again, from 34 to 55.**

```
grep -ro '260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth' fusion-workbench/ | wc -l   → 56
… excluding the two event streams                                                              → 55
ls circles/260815-0007-…/planning/  →  260815-0029_c_plan-remove-eight-mechanisms-and-cap-growth.md
```

34 → 41 → 55 citations of a filename that carries `_c_`, none of which resolves. Every reconciliation pass that annotates a record in this store adds more, this one included — which is the record's own point made mechanically.

The record is filed as a class question and not a repair: which of the three citation positions holds — rewrite each to `_*_`, leave literal markers as historical, or require the wildcard at write time. No decision record in any store answers it. Until one does, mass-rewriting 55 citations would be one agent's judgement applied at scale, which is the outcome the record was filed to prevent.
