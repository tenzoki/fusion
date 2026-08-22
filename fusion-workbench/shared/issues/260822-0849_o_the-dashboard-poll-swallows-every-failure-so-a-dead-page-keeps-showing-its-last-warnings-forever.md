The dashboard poll swallows every failure, so a page that stopped polling keeps showing its last warnings forever

---

**Severity:** Medium. Nothing breaks, and that is the problem: the panel goes on asserting a state that stopped being true, with no way for the reader to tell.
**Domain:** code
**Filed by:** orchestrator, from a user report
**Affects:** `bin/monitor`, the `pollDashboard()` fetch chain and its `.catch`
**Cross-references:** `shared/issues/260817-1217_*_the-monitors-dismiss-keys-are-html-escaped-as-text-so-a-quote-in-a-warning-truncates-the-attribute.md` — the other half of why a stale row cannot be got rid of; the user meets both faults as one symptom

---

## What happens

The user reported one guard warning standing in the panel for days, naming their `fusion.json` as invalid JSON. Measured at the time of the report:

- The file parses. `python3 -c 'import json; json.load(...)'` and `node -e 'JSON.parse(...)'` both succeed.
- The installed guard hook, run against this project, returns `{}` — no advisory, no diagnostic.
- No `guard_advisory` event exists in `fusion-workbench/.guard-state/events.jsonl`, whose window runs from 2026-08-17T17:28 to the moment of the report, nor in the one archived log at `archive/260817-1907-safe-cleanup-scoped/.guard-state/events-260817-1907.jsonl`. The file `fusion.json` was created on 2026-08-16, so those two logs cover its whole life.
- The running monitor's own `/api/dashboard` returns `warnings: 0`.

The row was on the screen and nowhere else.

## Why it can persist

`pollDashboard()` ends its fetch chain with an empty catch:

```js
.catch(function() {});
```

Any failure — the monitor restarted on another port, the machine slept, the tab was suspended and resumed against a closed socket — leaves the last successful render in place. The panel has no age of its own and no connection state, so a frozen render is indistinguishable from a live one that happens to be unchanged.

## Why the user's own observation is the sharpest evidence

They noticed it had been **one** warning for days. That is the diagnostic. An advisory is emitted **per guarded tool call** for as long as its cause stands, which `bin/monitor`'s own comment on `MAX_ADVISORIES_RETURNED` describes as an unbounded stream from a single unfixed configuration line. A genuinely broken `fusion.json` over several days would have produced hundreds of rows, not one that never changes. A single unchanging advisory row is evidence of a frozen page, and nothing in the interface says so.

## What to do

Give the panel a liveness signal rather than a silent catch. Options, not decided here:

1. Record the last successful poll and mark the panel when it ages past a small multiple of the poll interval. Cheapest, and it makes the failure visible exactly where the false claim is.
2. Show a connection state in the header beside the existing `Updated:` clock.
3. Clear the warnings panel on a failed poll rather than holding the last render. Loudest; it also discards rows that are still true, so it is the weakest of the three.

**What is not the answer:** logging the fetch error to the console. The reader of this panel is looking at a dashboard, not at devtools.

## The second half of the symptom

Dismissal exists and is broken for any warning whose text carries a double quote, filed as `shared/issues/260817-1217_*` and open since 2026-08-17. So a user meeting a stale row is told nothing about it being stale and may also be unable to click it away. The two records are independent faults with one shared symptom, and neither closes the other.
