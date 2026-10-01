One record_change row with a non-string ts breaks the monitor dashboard
---
`bin/monitor` `_record_changes` sorts every `record_change` row of the log with `rows.sort(key=lambda e: e.get("ts") or "")`. The pass reads rows from every checkout and from the Prior host. If one row carries a number or an object as `ts`, Python raises `TypeError` comparing it with a string, and `/api/dashboard` fails as a whole. Nothing in the reader enforces the fixed-width UTC string that the decision record and item 32 require.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260930-1451_*_where-does-the-monitor-take-a-records-status-from-and-how-does-an-event-name-a-record-and-its-host.md, 260930-1451_*_plan-fj03b-observers-checkers-citations-and-the-monitor-on-json.md (step 6), 261001-0837-reviewer-fj03b-initialize-and-fj03c.md

Severity: Low. Scope: `bin/monitor` (`_record_changes`; also `_scoped_events` and the merge sort, which predate this range).

**Evidence:**

- `bin/monitor` `_record_changes`: `rows = [ev for ev in _EVENTS_TAIL.rows() if isinstance(ev, dict) and ev.get("event") == RECORD_CHANGE]` then `rows.sort(key=lambda e: e.get("ts") or "")`. The type of `ts` is not checked.
- The same key appears in `_scoped_events` and at the merged sort.
- inference: the crash follows from Python 3's refusal to order `int` against `str`. The monitor was not run with such a row.

**Fix direction:** sort on `ts if isinstance(ts, str) else ""` at all three sites. Better, drop a `record_change` row whose `ts` is not a string and count it in the warnings panel.

**Acceptance:** a case in `hooks/lib/__tests__/monitor-warnings-panel.test.ts` seeds one `record_change` row with `"ts": 5` beside valid rows. `/api/dashboard` answers 200, and the running item's last-observed line comes from the valid rows. The case is red against the current monitor.
