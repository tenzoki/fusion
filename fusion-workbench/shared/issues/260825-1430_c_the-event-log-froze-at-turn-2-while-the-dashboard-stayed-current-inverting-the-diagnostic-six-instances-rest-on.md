The event log froze at Turn 2 while the dashboard stayed current, inverting the diagnostic six instances rest on

---
`fusion-workbench/orchestrator-events.jsonl` ends at `task_start` for Turn 2 and carries no
`task_done`, no `commit` and no `turn_end` for it, although Turn 2 finished and committed
`3d4b181` an hour earlier. `fusion-workbench/orchestrator-live.md` is fully current over the
same period. Every prior record of session-bookkeeping freeze names the event log as the one
surface that always keeps up and the dashboard among the surfaces that freeze. This session
reverses both, which falsifies the premise the whole record family reasons from and the
premise the referral that closed it rests on.
---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md` (the original, closed then revised); `260822-2236_*_the-four-session-bookkeeping-surfaces-froze-again-and-the-detection-that-closed-the-first-record-has-been-removed.md` (the re-filing, closed as referred, whose referral this contradicts); `260825-0858-orchestrator-session.md` (the session measured)

## What was measured

At HEAD `3d4b181`, session `260825-0858-orchestrator-session.md`, range
`a99e680..3d4b181`, three commits. Events counted from the last `session_start` in the log,
which is line 2311 of 2327:

| Event | In the log | On disk |
|---|---|---|
| `turn_start` | 2 | 2 Turns ran |
| `turn_end` | 1 | 2 Turns ended; the second at 13:51 local |
| `task_start` | 2 | 2 reconciler tasks dispatched |
| `task_done` | 1 | both tasks completed |
| `commit` | 1 | 3 commits in the range |
| `session_end` | 0 | the Turn loop exited and cleanup is running |

The log's last line is
`{"ts":"2026-08-25T11:35:57","event":"task_start","turn":2,"task":"R2","agent":"reconciler","detail":"backfill 28 records"}`.
That timestamp is UTC written without the `Z` designator, per the emit convention, so it is
13:35:57 local, and `3d4b181` was committed at 13:51:43 local. The gap is not a pending write
at the moment of measurement: Turn 2's own boundary events are past-tense and 55 minutes
overdue. `session_end` is the one absence that is legitimately still pending, because cleanup
emits it at its last step.

**The dashboard is not stale.** `orchestrator-live.md` reads `**Turn:** 2/12 | **Tasks:** 2/2
| **Commits:** 3`, `**Session:** Complete`, and lists both reconciler tasks `[DONE]` with the
hashes they landed. It is correct on every field.

## Why this is a new record and not a seventh instance

`260801-2038` states the diagnostic in terms:

> The event log staying current while the other three froze is the diagnostic: event emission
> is a per-action call that cannot be forgotten without the action failing, whereas the other
> three are end-of-Turn writes that a session can skip without anything breaking.

Six measured instances repeat it, each naming the event log as *the one surface that kept up*
and counting the instance by that asymmetry. Here the asymmetry runs the other way. The claim
that event emission "cannot be forgotten without the action failing" is now false on disk: the
commit succeeded, the task completed, the Turn ended, and none of the three emitted.

**The referral that closed the class names the missing surface as an input.**
`260822-2236_*_the-four-session-bookkeeping-surfaces-froze-again-and-the-detection-that-closed-the-first-record-has-been-removed.md`'s `Resolved:` note refers the work to the backlog as *"a freeze detection over
the surviving surfaces (`work_queue` statuses, the Circle record's Turn-log entries, the
`turn_end` events)"*. Two of those three are unavailable in this session, because
`agentstate.yaml` is deleted and no Circle is active. The third, `turn_end`, is exactly the
event that did not fire. A detection built to that description would read this session as still inside
Turn 2 and report no freeze. The referred idea is not merely unbuilt here; it is unsound as
described, and that is worth knowing before somebody builds it.

## What it costs

Two shipped programs read this file and neither recomputes what it says:

- `bin/fusion-review-coverage` anchors on `session.git_head_at_start` and reports per commit;
  it survived here because it reads git for the commit list. It is the near miss rather than
  the casualty.
- `bin/monitor` renders the log directly. A dashboard binary reading this log would show the
  session parked in Turn 2. The workbench's own `orchestrator-live.md` disagrees with it, and
  nothing reconciles the two.

Beyond the programs, the log is the durable surface: `orchestrator-live.md` is class L in
`rules/workbench-tracking.md` and does not travel, while `orchestrator-events.jsonl` is the
one workbench file every checkout appends to and the one another person sees after a pull. So
the surface that stayed correct is the one nobody else will read, and the surface that froze
is the one that travels.

## What this does not claim

*Inference, not verified:* I did not establish why the emissions were skipped. The pattern is
consistent with the Turn-2 writes being batched behind a boundary the session never reached,
but nothing in the log or the tree distinguishes that from any other cause, and the session
that would know is over.

I also make no claim that the dashboard staying current is a repair. One session is one data
point, and the six prior instances measured the opposite pairing. What is established is that
the pairing is not a law, and every record that reasoned from it as one now has a
counter-example.

## What to consider

1. **Restate the diagnostic as a measurement rather than a property.** The record family
   treats "the event log always keeps up" as structural. It is an observed frequency with a
   counter-example. Any detection built on it needs a second, independent anchor, and git is
   the only surface in the workbench that no session can skip.
2. **Say which surface is authoritative when two disagree.** `orchestrator-live.md` and
   `orchestrator-events.jsonl` now contradict each other on one session with no rule for
   reading them together. This is a decision, not a fix, and it is not filed as one here
   because it belongs with whoever takes up the referral.

**Severity:** Medium. Nothing malfunctioned in the session itself. What is damaged is the
premise a future detection would be built on, and it is damaged quietly: the counter-example
is one line of absence in a 2327-line file.

**Found by:** reconciler, session-end pass over `a99e680..3d4b181`, HEAD `3d4b181`.

---
Also seen: 260826-0904 by coder — a second instance in the same Circle: the log's Turn-2 block ends at a `task_start` for P-5 while the commit for that task had already landed, so the resuming session read its own progress from git rather than from the log.

**Second instance, read off the file.** `fusion-workbench/orchestrator-events.jsonl` line 2357 is
`task_start` turn 2 task P-5 at `2026-08-25T23:58:18`, and the next line is the resuming session's
`session_start` at `2026-08-26T04:47:27`. Between the two, `dad5042` was committed at
`2026-08-26T00:11:57Z`. The work was done, the commit was in the tree, and the log said the task had
started and nothing more. The resuming session had to derive how far Turn 2 got from `git rev-list`
and the working tree, and the `task_done` line at 04:51:19 says so in its own `detail` field: *state
write missed by the interrupted session*.

This is the record's own inversion and not a new fault. The durable diagnostic was the stale one, and
what the instance adds is that it recurred inside the very Circle that repaired the log's other
reading faults. `bin/monitor` and `bin/fusion-events` both now scope the file by checkout, and
scoping a file that stopped being written repairs nothing about this.

**Not discharged by `260825-2023-presence-travels-monitor-filters-own-checkout`.** Its
Directive is per-checkout attribution and reading, which is orthogonal to whether a line is emitted
at all; nothing in its range makes an emit durable across an interruption, and both items under
`## What to consider` are untaken, the second of them explicitly a decision for whoever picks up the
referral. The marker stays `_o_`. This note records a sighting, not a closure.

---
Reconciliation 260827-1528-reconciliation.md: still open, and the ground has moved under it since filing. v10.8.0 made two of the three missing row kinds machine-written: the `task_start`/`task_done` pair is written by the PreToolUse/PostToolUse hooks (`hooks/lib/orchestrator-events.ts`, commits `94ad2f4` and `d7cdfa7`), and the `commit` row by `bin/fusion-commit-lock with` (`2bea3ac`; `hooks/lib/orchestrator-events.ts:23-24`). `turn_start`/`turn_end` stay prompt-emitted (`hooks/lib/orchestrator-events.ts:28`), so the freeze mode this record measured is repaired for tasks and commits and still reachable for Turn boundaries. The record's diagnostic-inversion argument is untouched by the repair.

---
Resolved: closed on the v10.8.0 repair. `task_start`/`task_done` are written by the hooks (`hooks/lib/orchestrator-events.ts`, commits `94ad2f4`, `d7cdfa7`) and the `commit` row by `bin/fusion-commit-lock with` (`2bea3ac`); the three row kinds this record measured as missing are no longer prompt-emitted. `turn_start`/`turn_end` remain prompt-emitted by construction, since no hook sees a Turn, so the freeze mode stays reachable at Turn boundaries and this note does not claim otherwise. The diagnostic the record family reasoned from is restated here as an observed frequency, not a law: six sessions saw the event log keep up while the other surfaces froze, and this session is the one counter-example in which the log froze and the dashboard stayed current. Item 2 of `## What to consider` is filed as decision R3, `260827-1756_*_which-surface-is-authoritative-when-the-event-log-and-the-dashboard-disagree.md`. Plan `260827-1756_*`, step 11.
