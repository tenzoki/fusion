# B4 — the four readers prefer the row and fall back to the file

**Agent:** coder
**Status:** Complete
**Plan:** `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md`, step B4
**Stop by:** 2026-09-10T06:10Z (returned inside it)

## What landed

Additive throughout: every reader keeps the file it read before, and C1 is what
removes them.

- `hooks/lib/orchestrator-events.ts` gains the reading side of the row it
  already writes: `readCheckoutId(root)` and `newestHookSessionStart(root)`.
  Three filters decide a row — `writer` (the model writes a `session_start` of
  its own for the same session, carrying none of the mechanical facts),
  `checkout` (a `merge=union` pull interleaves another checkout's block with
  ours), and newest by `ts`. An unreadable log, an unparseable line and a
  missing field are each skipped: every caller has a file behind it.
- `hooks/lib/review-coverage.ts` — `sessionAnchor` reads that row's
  `git_head_at_start` first and `agentstate.yaml` second. With both absent the
  `why=` line now names both sources instead of the file alone.
- `bin/fusion-session-domain` — `source=event-log` ahead of `source=agentstate`
  ahead of `source=default`; exit 3 with no workbench is unchanged, and a
  default still names on stderr which of the two sources failed and how.
- `bin/monitor` — the dashboard panel derives its markdown from
  `orchestrator-events.jsonl`: the running task is the newest `task_start` with
  no matching `task_done`, paired by identifier rather than by position; beside
  it that row's `work_item`, or the line saying the dispatch named none. The
  counters are dispatches (paired rows) and commits, scoped to the session
  identifier; there is no error counter. Nothing renders under Up Next — one
  line saying so, no list. `/api/state` renders the newest hook-written
  `session_start` row as the `session:` block the state file carried. Both
  panels fall back to the two files when the log yields no session of ours.
  `_read_events` was split so the panel sees the whole scoped log rather than
  the last 100 rows: a dispatch running for a hundred events is exactly the one
  the panel most needs to name.
- `bin/fusion-staging-drift` — unchanged, as the step requires. A line was added
  to the existing in-flight case pinning that `agentstate.yaml` is still
  classified in-flight.

## Verification

`cd hooks && npm run build && npm test` — exit 0, 987 of 987.
`npx vitest run review-coverage fusion-session-domain staging-drift` — 73 of 73.
`bin/fusion-review-coverage` with `agentstate.yaml` present returns byte-identical
output to the pre-change run (`since=a1ecf86e`, `commits=15`): empty diff.

Two generated pins moved and were re-approved rather than widened:
`fixtures/surface-growth.golden` regenerated (does not move a baseline), and
`reference-resolution-lint.test.ts` BASELINE `paths` 1732 -> 1733, attributed by
single-file revert to `bin/monitor` alone.

## Cost

Hook test surface 23 001 -> 23 172 lines, +171 against a 265-line budget; 94
lines of head-room left. Every case went into a file that already had a baseline
entry, per the step's constraint.

## What C0 must still check

The monitor is served from the workbench copy `/fusion:setup` Step 0b writes out
of the *installed* plugin, so this file cannot be exercised until
`fusion --update` and the next session's Setup. C0 has to: `shasum` the workbench
copy against `$FUSION_PLUGIN_ROOT/bin/monitor` to prove it is this version; then,
with `orchestrator-live.md` and `agentstate.yaml` renamed away, confirm the
dashboard panel names the running dispatch, renders the work item (or the line
saying none was named), shows both counters, and shows the one Up Next line with
no list — and that `/api/state` renders the session fields — with no panel dark.
