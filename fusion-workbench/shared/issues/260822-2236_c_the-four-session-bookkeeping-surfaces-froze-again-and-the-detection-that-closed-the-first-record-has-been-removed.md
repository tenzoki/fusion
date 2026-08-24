The four session-bookkeeping surfaces froze again, and the detection that closed the first record has been removed

---

`agentstate.yaml`, `orchestrator-live.md`, the active Circle record's `## Turn log` and the session
history file's `## Session log` all still describe the state before Turn 1 of session
`circles/260822-1921-measure-what-two-checkouts-share/history/260822-2204-orchestrator-session.md`, while
that Turn ran two tasks to completion and produced two commits. `orchestrator-events.jsonl` is current, as
it was in all four previous instances. This is the failure of
`shared/issues/260801-2038_c_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md`, which was
closed on 260811 by a detection mechanism that was deleted on 2026-08-15. Nothing measures the condition
any more, so the fifth instance was found by a reconciliation reading the files, exactly as the first four
were.

---

**Severity:** Medium. Nothing breaks in-session. What breaks is resume, and the Circle's durable record of
what happened in it.
**Domain:** code
**Filed by:** reconciler, Phase-3 pass over `f90de0c..b938f68`
**Affects:** `agents/orchestrator.md` (the Turn-boundary write, and the two places at `:109` and `:238`
that now state the absence of detection as a fact the orchestrator must compensate for by care)
**Cross-references:**
`shared/issues/260801-2038_c_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md` (the closed
predecessor, now carrying a `Revised by:` line pointing here);
`shared/issues/260801-1020_o_plane-mirror-circle-closed-with-empty-turn-log.md` (the Turn-log half of the
same failure, open since 260801, whose part 2 asks for exactly the detection that has since been removed)

## What was measured, at HEAD `b938f68`

| Surface | Says | Reality |
|---|---|---|
| `fusion-workbench/agentstate.yaml` | `# Updated: 260822-2210`; `current_task.id: T-1`, `status: running`; `work_queue` holds T-1 `running` and T-2 `queued` | `orchestrator-events.jsonl` carries `task_done` for T-1 and for T-2, both at `2026-08-22T20:28:48`, and `turn_end` for Turn 1 at the same second |
| `fusion-workbench/orchestrator-live.md` | `**Tasks:** 0/2 \| **Commits:** 0`; `## Current` shows T-1 `[RUNNING]`; `## Up Next` shows T-2 `[QUEUED]`; `## Blocked` shows T-2 blocked on T-1 | 2 of 2 tasks resolved, 2 commits (`06d1bd1`, `b938f68`) |
| `circles/260822-1921-measure-what-two-checkouts-share/_*_circle.md` | `## Turn log` is empty: the section header with nothing under it | one Turn ran, converged, and produced the Circle's only two artifacts |
| the session history file | `**Mode:** (not yet resolved — Phase 0 pending)`; `**Status:** In progress`; `## Session log` → `(Turn entries appended as the session runs.)` | `scope_resolved` at `20:10:01` records `mode=custom`; the Turn loop exited at `20:28:48` |
| `fusion-workbench/orchestrator-events.jsonl` | `session_start`, `scope_resolved`, `queue_built`, `turn_start`, `task_start`, two `task_done`, `turn_end` | current |

The event log staying current while the other four freeze is the same diagnostic the first record named:
event emission rides an action that cannot succeed without it, and the other four are end-of-Turn writes a
session can skip with nothing breaking.

## What is new since the first record

**The detection is gone.** `hooks/lib/state-drift.ts`, `hooks/lib/__tests__/state-drift.test.ts` and
`hooks/dist/state-drift.js` do not exist; `bin/` holds no `fusion-state-drift`; no code under `hooks/`,
`bin/`, `agents/` or `skills/` emits or reads a `state_drift` event, and `bin/monitor` renders only the
events already in the log. `hooks/tracker.ts:246` records the removal in its own header, and
`agents/orchestrator.md:238` states the consequence in the prompt, naming record `260801-2038` while doing
so: a frozen Turn log "is now a thing you avoid rather than a thing you are told about".

**One of the two checks the first record proposed is no longer expressible.** Its candidate 2 compared
`agentstate.yaml`'s `progress.commits` against `git rev-list --count <anchor>..HEAD`. `agentstate.yaml`
stopped carrying counters on 2026-08-15, so there is no number left to compare. What survives is
`session.git_head_at_start` and `control.turn_start_head`, which are anchors rather than tallies. A
replacement check has to read the `work_queue` statuses and the Circle record's Turn-log entry count
against the `turn_end` events in the log, which is a different computation from the one that was removed.

## Why it is worth a record rather than an entry in a history log

A Circle's `## Turn log` is where its history lives once the session state is deleted. This Circle is one
phase away from closure with an empty one, which is the condition `260801-1020` has tracked as open since
260801 and which its part 2 asked to make detectable. The removal of the state-drift measurement did not
retire that request; it removed the only thing that had ever satisfied any part of it.

## What to consider

Not costed here, and the first record's three candidates are the starting point rather than the answer,
because one of them has since been built and removed.

1. **Make the Turn-boundary write ride the commit**, which is candidate 1 of the first record and was never
   built. It stays prompt text either way; what changes is which step it sits in.
2. **Re-derive a detection that fits what `agentstate.yaml` still carries.** The removed one keyed on
   counters that no longer exist. A check over `work_queue` statuses, the Circle record's Turn-log entries
   and the `turn_end` events is cheap and reads only surfaces that survive.
3. **Accept it and stop promising otherwise.** Delete the obligation from the four surfaces and let the
   event log be the session record, which is what it already is in practice on every instance measured.
   This is the honest option if nothing is going to be built, and it would need
   `260801-1020` answered with it.

The three differ in whether the four surfaces are load-bearing at all, which is the question under all of
them and which nothing has asked since the counters left.

---

**Follow-up 260822-2245, by the orchestrator this record is about.** All four surfaces were written
at Phase 4 of the same session, after this record was filed and because it was filed: the state
file's queue, the dashboard's counters, the Circle record's `## Turn log`, and the session history's
`**Mode:**` and `## Session log`. The observed column above is therefore a description of a state
that no longer exists, which is what a defect record's evidence is supposed to be.

**That does not close this record**, and the reason is in its own title. What was missing was never
the writing; it was the detection. The four surfaces were written because a reconciler pass happened
to look, and a reconciler pass is not run at every session. The measurement that used to catch this
was removed on 2026-08-15 with the counters it watched, and nothing replaced it — so the next session
that does not dispatch a reconciler freezes the same four surfaces with nothing to say so.

Two of the four citations in the table went stale within minutes of being written, when the Circle
record moved from `_t_` to `_c_` at closure. They are wildcarded now. That is a second instance of
the class `260801-1020` is filed on, arriving inside the record that reports the first.

---

**Also seen: 260823-1446 by reconciler — sixth instance, in the very next session, and the diagnostic
holds exactly.** Measured at HEAD `7cd79f1` for session
`circles/260823-0023-settle-what-travels-between-checkouts/history/260823-0721-orchestrator-session.md`,
which ran three Turns and produced 19 commits.

| Surface | Says | Reality |
|---|---|---|
| `fusion-workbench/agentstate.yaml` | `# Updated: 260823-0823`; `current_task.id: T1`, `status: queued`; `work_queue` holds T9 and T14 `queued` | T9's report is on disk (`analyses/260823-1302-*.md`) and T14 landed in `a2a18f9`; the plan is `_c_` while `plan_context.plan_file` still spells the `_o_` name it carried at 08:00 |
| `fusion-workbench/orchestrator-live.md` | `**Turn:** 2/12 \| **Tasks:** 9/15 \| **Commits:** 10`; `## Current` shows T10 `[RUNNING]`; five tasks `[QUEUED]`; `## Up Next` reads "Turn 2 is the last planned Turn" | three Turns ran and closed, 19 commits, every listed task resolved |
| the Circle record's `## Turn log` | empty: the section header with nothing under it | three Turns, each with a review and a `turn_end` event |
| the session history file | `**Directive:** (not yet stated — awaiting the user's scope)`; `**Mode:** (unresolved — Phase 0 not yet run)`; `**Status:** In progress`; no `## Session log` section at all, 25 lines in total | `agentstate.yaml` carries the Directive and `mode: plan`; the Turn loop exited at `2026-08-23T12:36:03Z` |
| `fusion-workbench/orchestrator-events.jsonl` | `session_start`, three `turn_start`/`turn_end` pairs, `scope_resolved`, `queue_built`, task and review events, `coherence_review`, `gate_hit`/`gate_response`, commits | current and complete through Turn 3 |

The asymmetry this record names is reproduced without a single exception: the one surface that stays
current is the one whose writes ride actions that cannot succeed without them, and the four that freeze
are end-of-Turn writes a session can skip with nothing breaking.

**Two things are new in this instance and neither weakens the record.** The history file froze harder than
in the fifth: it never received a Directive at all, so a reader with no `agentstate.yaml` could not
recover what this session was for. That is a live instance of
`shared/issues/260817-1836_o_the-three-edge-verdict-has-no-case-for-a-session-that-stated-no-directive-and-two-of-its-three-edges-are-then-unevaluable.md`,
and this pass could compute its Artifact↔Directive edge only because `agentstate.yaml` survived — a file
that is class L and is deleted on a clean exit. And the fifth instance's follow-up said the four surfaces
were written at Phase 4 "because this record was filed"; one session later they froze again, which is the
record's own point restated by the tree: what is missing is the detection, not the writing.

Marker stays `_o_`. Nothing in this range builds any of the three options under `## What to consider`.

---
Resolved: referred (backlog) — a freeze detection over the surviving surfaces (`work_queue` statuses, the Circle record's Turn-log entries, the `turn_end` events) is the idea, one with part 2 of 260801-1020, and nothing this Circle can build without re-adding a removed mechanism; backlog entry to be filed by the user
