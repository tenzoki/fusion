The three per-task surfaces disagree with each other, and one field re-dangled at the plan transition

---

**Domain:** code
**Filed by:** reconciler (reconciliation 260820-0830-reconciliation.md, HEAD `04db0b0`)
**Related:** `260820-0805_*_the-session-bookkeeping-froze-at-the-planning-step-while-ten-commits-landed.md` — closed at `bbfc912`; this is what the next commit and a closer reading found

---

## What is wrong

The record above was closed with "the three surfaces are current at `bbfc912`". That claim was true
of the commit it named. Three things are wrong at HEAD, and only the first is a consequence of the
commit that landed after it.

**1. `agentstate.yaml` points at a file that no longer exists.**
`current_task.source_file` reads, verbatim and fenced because the dead spelling is the datum:

```
circles/260819-1645-four-constraints-on-deep-change/planning/260819-2016_o_four-constraints-on-deep-change.md
```

The plan was renamed to `_c_` in `04db0b0`, one commit after the bookkeeping was brought current, so
the pointer now resolves to nothing. `plan_context.plan_file` is the empty string beside it, while a
plan exists and is named two fields up.

This is the coupling the new citation gate was built to catch, arriving in the one surface the gate
cannot read: `agentstate.yaml` is YAML, and `markdownFilesUnder` takes `.md` only. The gate caught
the same transition in two Markdown records and reddened for it — the corpus decision's footer
records that — and missed this one silently. The resume path is the consumer: an interrupted-session
resume reads `source_file` and finds nothing there.

**2. The event log carries no task events for this session at all.**
Counting from this session's `session_start` (`orchestrator-events.jsonl:1802`): `turn_start` 1,
`commit` 10, `review_done` 1, **`task_start` 0, `task_done` 0**. The closure note says the log
"carries the nine commit events and the review that were missing", which is accurate and is not the
same as the log being current — fourteen executor tasks ran and none of them is in it. The monitor
renders from this file.

**3. Three surfaces give three different counts of one quantity.**
`orchestrator-live.md:3` reads `**Tasks:** 11/11`. Its own `## This Turn` list below carries
**14** executor rows plus the review. `agentstate.yaml`'s `work_queue` carries **9** entries, S1
through S9. The closure note itself says "all fourteen executor tasks", which agrees with the list
and with neither counter. The 9 is defensible (the plan has nine live steps; S6b, S8b, S8c, S9a and
S9b were added as work split out of them); the 11 matches nothing.

`**Commits:** 9` on the same line is one behind at HEAD for the ordinary reason — `04db0b0` landed
after the refresh — and is not part of this record.

## Why it is worth a record rather than a fix in passing

The previous record's fix direction said "bring the three per-task surfaces up to the settled tree in
one pass", and one pass is exactly what produced this: the pass reconciled the three surfaces against
the tree and not against each other, and then the next commit moved the tree again. The counts
disagreeing is the part no re-run fixes, because nothing says which of the three is the quantity.

## What would close this

- Point `source_file` at the plan with the marker starred, `260819-2016_*_…`, which is the form the
  workbench already uses for a citation whose marker moves, and fill `plan_context.plan_file`.
- Decide whether `agentstate.yaml` is required to survive a marker move at all, or whether the
  resume path should resolve by stamp. That question is wider than this record.
- Say what `Tasks: n/m` counts — queue entries or dispatches — and make the dashboard's counter and
  its list report the same one.
- Task events: either the orchestrator emits them at dispatch, or the surface stops claiming to
  carry them. Re-arming a check that would have noticed is a decision nobody has filed, and this
  record does not propose one.

---
Resolved: all three are current at Turn 2's close. `agentstate.yaml` carries the closure task and no dangling source file, the event log carries the four executor tasks of this Turn, and the dashboard's counter agrees with its own list. The re-dangling this record found — a field declared current one commit before its target transitioned — is the same coupling the corpus decision accepted, met a second time on a surface the gate does not judge.
