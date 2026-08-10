# Coder — Session-state drift detection (task T6)

**Status:** Complete
**Task:** T6 — detect the session bookkeeping freezing, instead of only prescribing that it must not
**Source:** `260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md`
**Origin:** shared store; no Circle active

## What the defect actually is

Three of the four session-state surfaces stop being written after the first Turn while the
session runs on. It has been measured four times, and a fifth instance was running live in
this very workbench while the work was being done. The prompt already prescribes the
Turn-boundary writes, so prescribing harder reproduces the defect: an instruction in an agent
prompt is overridable under task pressure, and this project has its own worked case of that
("Problem 11" in `CLAUDE.md`).

The record's own diagnostic is the design. `orchestrator-events.jsonl` never froze in any of
the four instances, because emitting an event is a call that either happens or visibly does
not. Git never froze either, because a commit is the work rather than a note about it. The
other three surfaces are end-of-Turn writes a session can skip with nothing breaking.

## What was built

A **Drift check** in `agents/orchestrator.md`, under `## Persistent State File`, between
`### Write Points` and `### Write mechanics`. One shell block reads the two un-freezable
records and prints five rows, each pairing a bookkeeping surface with the record that can
contradict it:

| Row | Surface | Record |
|---|---|---|
| `progress.commits` | `agentstate.yaml` | `git rev-list --count <git_head_at_start>..HEAD` |
| `progress.turn` | `agentstate.yaml` | count of `turn_start` events since the last `session_start` |
| `session.history_file` | `agentstate.yaml` | whether the named file is on disk |
| history Directive | the session history file's `**Directive:**` line | the state file's `session.directive` |
| Circle Turn log | the Circle record's `## Turn log` | the number of Turns run |

A condition table follows, one condition per row, so a value that legitimately differs is not
reported as a fault — the `commits` row allows a divergence of one for the commit in flight,
and the Directive row fires on a placeholder rather than on different wording.

On drift the orchestrator emits a new `state_drift` event **first** (the event log outlives
`agentstate.yaml`, which is deleted at Cleanup), tells the user in one line naming what
diverged and from what, then performs the writes `### Write Points` already required. It is
not a second writer repairing the surfaces — the orchestrator is the sole writer of all three,
so this is the skipped write done late, and the event keeps the fact of the freeze visible
after the correction.

## Why it is attached to the event emissions

The check runs **in the same command as** `turn_start` (Phase 2), `turn_end` (Step 3e) and
`session_end` (Cleanup), plus the resume path at Setup Step 1. That is the whole point: a
detection standing on its own at the Turn boundary would be a fifth end-of-Turn obligation,
which is the exact shape that got skipped four times. It rides the one call that empirically
never was.

`session_end` is not redundant. Two of the four measured instances were single-Turn sessions;
those reach no second `turn_start`, and a converging session emits no `turn_end` at all, so
Cleanup is their only boundary.

## Verified against live drift

The snippet was run against this workbench at 260810-0400 and against a sandbox with an active
Circle, a dangling `session.history_file` and a short Turn log. Live result:

```
  progress.commits       surface=0              record=12 (git 8960e1a..HEAD)
  progress.turn          surface=0              record=1 (turn_start events this session)
  session.history_file   surface=...            record=present (on disk)
```

`agentstate.yaml` said `commits: 0` while git counted 12 — a fifth instance of the defect,
caught by the check being built for it. The sandbox run exercised the two rows the live
workbench could not: `MISSING` for the resume anchor, and a Turn log with fewer entries than
Turns run.

## The gate

`hooks/lib/__tests__/state-drift-detection-lint.test.ts` — nine assertions. It pins the five
surfaces, their five drift conditions, the two un-freezable records the check reads, the
`state_drift` event row, the attachment at all four call points (anchored on the *emissions*,
never on the check, so a check that drifts away from its carrier fails), and the section's own
honesty paragraph. Three negative controls feed it the pre-fix call points, a half-fix where
the detection exists as a standalone step, and a check that reads the turn number back out of
the frozen surface.

## What this is, and what it is not

A **convention**, not an enforcement. Nothing executes the Drift check; the lint checks the
contract is in the prompt, not that any session ran it. What it buys over the prescription it
replaces: the freeze becomes visible from evidence rather than merely forbidden, the evidence
is the record measured never to freeze, and the check costs one command at a boundary the
session already stops at. An enforcement would have to run unasked — a PostToolUse hook, or a
`bin/` helper called by `/fusion:setup`, the monitor and the reconciler alike. That is the
shape I would argue for next, and it was out of this task's scope.

## Left open

- Candidate 1 of the record (make the Turn-boundary write ride the commit) is not built.
- `skills/setup/SKILL.md` carries the same Setup steps for the user-triggered path and was out
  of scope, so resume-time detection currently exists only on the self-initiated path.
- `bin/monitor` computes nothing (protected path, own release consequence).
- The issue record stays `_o_` and the tasklist entry stays `[ ]`; two of its four acceptance
  clauses are unmet.

## Files changed

- `agents/orchestrator.md` — Setup Step 1 (new item 3, renumbering 3-5 to 4-6, and the schema
  branch's "Skip steps 2-5" to "2-6"); Phase 2 Turn-start item 2; Step 3e; the `session_end`
  and `agentstate.yaml`-delete bullets in Cleanup; the new `### Drift check` section; the
  `state_drift` row in the event-type table.
- `hooks/lib/__tests__/state-drift-detection-lint.test.ts` — new.
- `fusion-workbench/shared/issues/260801-2038_o_...` — appended a partial-resolution section.

## Verification

`cd hooks && npm test` — 943 passed, 2 failed, neither from this change:

- `rules-emission-golden` — known, fixture regenerated at the end of the session
  (`fusion-workbench-conventions.md` grew by 2151 bytes under another task).
- `path-literal-lint` — `skills/circle-stash/SKILL.md:276` cites
  `issues/260717-0030_*_...` with a store prefix. That file is a concurrent task's edit,
  unmodified by this one; `agents/orchestrator.md` is clean under the same gate.

The new test file passes on its own: 9/9.
