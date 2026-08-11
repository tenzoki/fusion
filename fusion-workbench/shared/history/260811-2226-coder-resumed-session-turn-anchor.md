# coder — one anchor for "this session", and a resumed Turn that keeps its start

**Status:** Complete
**Date:** 260811-2230
**Agent:** coder
**Records:** `shared/issues/260811-2143_c_…` (High), `shared/issues/260811-2144_c_…`
**Verification:** `cd hooks && npm test` — 52 files, 1347 tests, exit 0

## What was wrong

Two rows of the state-drift report answered "since when?" with two different anchors.
`commitsSince` counts from `session.git_head_at_start`, which a resume does not rewrite.
`turnsRun` counted `turn_start` events from the last `session_start` **line**, which a
resume does write. So from this session's 19:00 resume onward the check printed
`progress.turn surface=4 record=0 DRIFT` on every guarded tool call with nothing stale —
and worse than noisy: on a resumed session it said DRIFT whether or not there was drift,
so the row carried no information at all.

The companion: a resume re-enters a Turn already in flight, so the `turn_start` that
Phase 2 step 2's drift check rides never comes round, while the prompt said it "fires in
**every** Turn".

## What was done

**One anchor, and it is the session's own identity.** The event log carries no session
identity, so *which* `session_start` began the session `agentstate.yaml` describes is not
decidable from the log — every rule over line positions gets a real shape wrong ("the
last one" on a resume; "the first since the last `session_end`" on a Restart after a
crash, where it counts the dead session's Turns into the live one). That is
`rules/critical-stance.md` §4, so the mechanism obtains the input instead of approximating
it: `session_start` now carries `history_file`, a session keeps one history file for its
whole life, and `turnsRun` counts from the **first** `session_start` naming it. The window
then survives a resume exactly as `session.git_head_at_start` does.

`sessionAnchor` in `hooks/lib/state-drift.ts` is three disjoint cases: the identity when
the log carries it; otherwise a single unambiguous `session_start` since the last
`session_end` (every pre-field log of a session that was not resumed — unchanged
behaviour); otherwise `unchecked` with the reason. No log shape yields a wrong number.

**A resumed Turn keeps the one start it has.** Setup step 1 gained **What a resumed
session inherits** — same session, same `history_file` / `git_head_at_start` / `started` /
`progress.turn`, no second `turn_start` for the Turn being re-entered, and step 3's drift
check (the one the *user* sees, in the resume summary) is that Turn's boundary read.
Phase 2 step 2 now says "every Turn **this session starts**" and points there. Shape 1 of
`260811-2144` — emit a second `turn_start` — was rejected because it would count that Turn
twice under the new anchor: the two halves have to agree, and this is the shape in which
they do.

## Files

- `hooks/lib/state-drift.ts` — `sessionAnchor` (new), `turnsRun(root, historyRel)`,
  `historyRel` hoisted in `measureStateDrift`, row-2 record text.
- `agents/orchestrator.md` — Setup step 1 (Continue + the inherits paragraph), Setup step 8
  (the `history_file` field), Phase 2 step 2, `### Drift check` (anchor paragraph +
  `progress.turn` condition), event schema (field note + table row).
- `skills/setup/SKILL.md` — Step 5's emission, matched to the prompt's.
- `hooks/lib/__tests__/state-drift.test.ts` — five cases under "the Turn row across a resume".
- `hooks/lib/__tests__/state-drift-detection-lint.test.ts` — four cases pinning that the
  prompt's two sentences and the module's anchor agree; each measured to fail against the
  four files as `500f51f` left them.
- `fusion-workbench/tasklist.md` — entry 25 told that the text it will pin has moved.

## What it detects now, and what it does not

Detects, and did not before: a `progress.turn` that froze **after** a resume. Nine Turns
run against a surface stuck at 5 read *clean* under the old anchor, because five
`turn_start` events followed the resume. Still detects the original freeze
(`260801-2038`) unchanged. No longer reports: the resume itself.

Does not decide, and says so: a log written before the `history_file` field that also
carries a resume. This repository's own log is that case right now — the row prints
`UNCHECKED (2 session_start lines since the last session_end and none names …)` and
`verdict=clean`, in place of the permanent false DRIFT. It becomes exact from this
project's next session, when the first `session_start` carrying the field is written.

Unchanged and still true: the module measures and never repairs. Nothing here makes the
bookkeeping write happen.
