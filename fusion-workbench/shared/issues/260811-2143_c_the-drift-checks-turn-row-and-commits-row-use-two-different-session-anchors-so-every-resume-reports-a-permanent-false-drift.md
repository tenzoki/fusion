# The drift check's Turn row and commits row use two different session anchors, so every resume reports a permanent false DRIFT

---

**Severity:** High — a measurement that speaks on every tool call of a resumed session while nothing is wrong, which is the one failure mode `hooks/tracker.ts`'s own trigger doctrine names as disqualifying
**Domain:** code
**Filed by:** coderev (Turn 4 review, range `b261d83..951c809`)
**Affects:** `hooks/lib/state-drift.ts:244-273` (`turnsRun`), `hooks/lib/state-drift.ts:276-287` (`commitsSince`), `hooks/lib/state-drift.ts:~460` (the row assembly), `agents/orchestrator.md:1095` (the row's user-facing description)
**Cross-references:**
`shared/issues/260811-1614_o_the-drift-checks-turn-row-is-satisfied-by-a-turn-start-alone-so-a-turn-that-emits-nothing-else-reads-clean.md` (the same row, the opposite direction — that one is under-reporting, this one is over-reporting);
`hooks/tracker.ts:776-857` (the trigger doctrine, criterion 2: "On the commonest path, firing at that moment reports NOTHING");
`shared/issues/260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md` (the finding the whole check exists for)

---

## What is wrong

The two numeric rows of the state-drift report answer "since when?" with two different anchors, and a resume makes them disagree by construction.

`commitsSince` (`state-drift.ts:276`) counts against **`session.git_head_at_start`** — a field in `agentstate.yaml`, written once and *not* rewritten by a resume.

`turnsRun` (`state-drift.ts:244-273`) counts `turn_start` events **since the last `session_start` line in `orchestrator-events.jsonl`** — and Setup step 8 emits a fresh `session_start` on every resume.

It compares that count against `progress.turn`, which is the *cumulative* Turn number carried across the interruption. So on a resumed session the row compares a cumulative counter against a post-resume count, and reports DRIFT for as long as the difference stands — which, if the session resumes in its last Turn, is the whole rest of the session.

**Measured, not inferred.** Run in this repository at `951c809`, `fusion-workbench/orchestrator-events.jsonl:1213` carrying a resume `session_start` at `2026-08-11T17:15:17`:

```
$ ./bin/fusion-state-drift
anchor=workbench-root
state=present
rows=4
drift=1
verdict=drift
  progress.commits       surface=32               record=32 (git 7785330..HEAD)
  progress.turn          surface=4                record=0 (turn_start events this session)  DRIFT
  session.history_file   surface=…                record=present (on disk)
  history Directive      surface=…                record=…
```

The commits row is clean at 32 = 32 because it reads the pre-resume anchor `7785330`. The Turn row reads 4 against 0 because it reads the post-resume `session_start`. Nothing is actually stale: ten commits landed in Turn 4 after that resume, and `progress.turn: 4` is correct.

## Why this is the disqualifying shape

`hooks/tracker.ts:776-857` — written in this same range, in `36984d7` — states the criterion a measurement must meet:

> **On the commonest path, firing at that moment reports NOTHING.** This is the disqualifying test … a check that speaks on its commonest path is one its reader learns to read past, which destroys the other measurements' credibility along with its own.

For a resumed session this row speaks on the commonest path — on every guarded tool call, all session. It is not a wrong trigger for the *measurement*; it is a wrong **anchor** for one of its rows.

## Fix direction

Make the row's anchor the same one every other row uses. `session.git_head_at_start` is not the right key for a Turn count, but its *property* is: it survives the resume. Two candidates, in the order I would try them:

1. **Anchor the Turn count on `agentstate.yaml`, not on the event log.** The state file is the thing being measured, and it already carries `session.started`. Count `turn_start` events whose `ts` is at or after `session.started` — a stamp comparison, no session-boundary scan, and a resume does not move it.
2. **Have the resume not write a fresh `session_start`.** A resumed session is the same session — that is what "resume" means, and every other field says so. A distinct `session_resumed` event would keep the log honest without resetting anyone's window. This is the larger change and touches the monitor.

Option 1 is a change inside `turnsRun` and nothing else. Whichever is taken, the row and `commitsSince` must end up meaning the same "this session", and that agreement should be pinned.

**Note on scope.** `turnsRun` is not modified by this range; `36984d7` touched only this module's git wrapper and throttle store. The defect predates the range and is reported here because it is live at HEAD, because the range wrote the doctrine it violates, and because `260811-1614` is already open against the same row from the other side — a fix should take both.

## Acceptance criteria

- Two rows of one report do not disagree about which session they measure.
- A test drives `measureStateDrift` against a fixture workbench whose event log carries two `session_start` lines and whose `progress.turn` is greater than the post-resume `turn_start` count, and asserts the Turn row reads clean.
- The negative control still fails: a genuinely frozen `progress.turn` (fewer Turns recorded than run) still reports DRIFT.

---
Resolved: the Turn row now anchors on the session's own identity rather than on a position in the event log. `session_start` carries `history_file` (Setup step 8 in `agents/orchestrator.md`, Step 5 in `skills/setup/SKILL.md`), a session keeps one history file for its whole life, and `turnsRun` counts `turn_start` events from the **first** `session_start` naming it — so the window survives a resume exactly as `session.git_head_at_start` does, and the two numeric rows now answer "since when?" with one answer.

Neither fix direction in this record was taken, and both were weighed. **Option 1** (compare event `ts` against `session.started`) is not available: `session.started` is written by local `date +%y%m%d-%H%M` and an event `ts` by `date -u`, neither carries an offset, and the two are measurably two hours apart in this very session — `started: "260811-0752"` against that session's own `session_start` at `2026-08-11T05:52:24`. The error's direction would silently drop the session's first Turns. **Option 2** (the resume emits no `session_start`) would work for the count but makes the row depend on an emission the resume path may legitimately make — the resume *is* a new process, and `bin/monitor` keys its orphan-task boundary on that line. Anchoring on identity makes the count indifferent to whether the resume emits anything at all.

A third rule was tried and rejected on the way: "the first `session_start` after the last `session_end`". It is correct for a resume and needs no new field, but it counts a crashed session's Turns into the session that replaced it after a **Restart** — so it relocates the defect rather than closing it. No rule over line positions separates those two cases, because both leave two `session_start` lines with no `session_end` between them; the identity is the input that decides it (`rules/critical-stance.md` §4). It survives as the fallback for a log written before the field existed, and only where exactly one candidate makes it unambiguous. Two or more candidates report `UNCHECKED` with that reason — which is what this repository's own log does right now, in place of the permanent false DRIFT.

Acceptance criteria, each with the case that holds it: the two rows agree ("counts the Turns the interrupted session ran, not the Turns since the resume", which also asserts `record=4` through the CLI); the fixture with two `session_start` lines and a cumulative `progress.turn` reads clean (same case); the negative control still fails, and now catches more than it did — "still reports a surface that froze after the resume" builds nine Turns against a surface stuck at 5, which the old anchor read as **clean** because five `turn_start` events followed the resume. `cd hooks && npm test` — 52 files, 1347 tests, exit 0.
