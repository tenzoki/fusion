# The monitor's whole-file parse is the repair, and a three-line fixture cannot see it

---
`bin/monitor:_read_events` documents its change as three operations in a fixed order: parse **every**
line rather than the last `MAX_EVENTS`, drop the foreign ones, sort, then take the last
`MAX_EVENTS`. The two new cases assert the drop against a three-line fixture with `MAX_EVENTS` at
100, so a regression to the pre-change slice-then-parse form passes both, and so does one that drops
the sort.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Medium.

**Cross-references:**
`bin/monitor:1246-1307` (`_read_events` and its docstring);
`hooks/lib/__tests__/monitor-warnings-panel.test.ts:1104-1136` (the two new cases);
`circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1302_*_the-monitor-attributes-a-merged-event-log-to-one-session-and-reports-another-checkouts-state.md`
(the four false readings the repair removes).

## What the docstring claims and what the fixture reaches

`bin/monitor:1270-1274` states the reason the parse widened to the whole file: "a foreign block can
stand anywhere in the file". That is the property under a union merge — the other checkout's block
lands wherever git puts it, not at the end — and it is why `lines[-MAX_EVENTS:]` had to go.

The fixture is `EVENT_ROWS`, three lines (`monitor-warnings-panel.test.ts:1104-1108`), and
`MAX_EVENTS` defaults to 100 (`bin/monitor:47`). Three properties therefore go unmeasured:

1. **The whole-file parse.** Restore `for line in content.strip().split("\n")[-MAX_EVENTS:]` and both
   cases still pass, because three is less than a hundred.
2. **The sort.** Delete `events.sort(...)` at `:1306` and both cases still pass: the fixture is
   already in timestamp order.
3. **The truncation after the sort rather than before it.** The whole point of the ordering is that
   the window is taken from the *scoped and sorted* array; nothing distinguishes that from taking it
   from the raw one.

The filter itself — the one thing the two cases do assert, in both directions — is well covered.

## Fix direction

One fixture longer than `MAX_EVENTS`, with a foreign block at the **head** of the file and this
checkout's oldest lines behind it, and one out-of-order stamp among ours. Assert that the served
array holds this checkout's newest `MAX_EVENTS` in timestamp order. That one case closes all three
gaps at once, and it is the shape the issue it repairs was measured in.

`startMonitor` and `seedWorkbench` already exist in that file, so the cost is the fixture, not the
harness. The hook-test surface is at its bound, so this addition falls under
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/decisions/260825-2140_*_where-do-c4s-hook-test-lines-come-from-when-the-cut-only-circles-room-is-spent.md`
option 2 like the last one: an equal cut in the same Turn, no baseline moved.

Resolved: 2026-08-27 — one generated fixture in `hooks/lib/__tests__/monitor-warnings-panel.test.ts` ("the event window"): five foreign lines at the head, 105 of ours behind them with o50 stamped latest, default MAX_EVENTS 100. The served array is asserted as o5..o49, o51..o104, o50 — the whole-file parse, the sort, and the window-after-sort each fail it separately. +17 lines.
