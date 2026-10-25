| `$WORKBENCH/.guard-state/events.jsonl` | the live log, whenever it is non-empty | append-only evidence — **rolled**, not selected. See *Rolling the guard event log* below |

### Rolling the guard event log

`$WORKBENCH/.guard-state/events.jsonl` is the guard's append-only record across every session, classified as evidence rather than telemetry (`rules/workbench-tracking.md`, read in full at Step 1, and fusion's own record `260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md`). This roll is the only thing that bounds its size; no line or byte ceiling may be added anywhere.

**It is the one target that is rolled rather than selected.** It has no state and no age, so no tier survey finds it: it is included whenever the live log is non-empty, skipped silently otherwise, and still waits for confirmation where Step 6 asks. Safety filter 1's `.guard-state/` entry covers the state files beside it, not the log.

The destination keeps the path relative to `$WORKBENCH`; the filename carries the archive folder's stamp:

```
<archive store>/<YYMMDD-HHMM>-<slug>/.guard-state/events-<YYMMDD-HHMM>.jsonl
```

### Tier 2 — Tier 1 + aged shared reviews

