# The cut spec removes `agentstate.yaml`, whose existence gates every machine-written event row

---
`260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` C1 deletes `agentstate.yaml`, treating it as a
carrier of three values. Its *existence* is also the gate on five machine-written recording surfaces.
With the file gone, the event log that C4 makes the only session trace stops being written at all, and
the acceptance criteria of C4, C8 and C9 become unsatisfiable together.

---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260909-1628-adversarial-review-of-the-cut-fusion-to-a-working-minimum-spec.md` (finding 6.1, MF-1); `260909-1454_*_a-dispatch-outside-a-recorded-session-writes-no-event-row-and-nothing-reports-it.md` (the same condition measured against the current design); `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` (C1, C4, C8, C9)

## The defect

C1 states: "The three values `agentstate.yaml` still carries have live readers", and names
`bin/fusion-review-coverage`, `bin/fusion-session-domain` and `bin/fusion-events turns`. Verified at
`bb341360`, five further surfaces read the file's existence rather than its contents.

`orchestratorSessionInFlight()` is `existsSync(fusion-workbench/agentstate.yaml)`
(`hooks/lib/orchestrator-events.ts:87-89`). It gates:

| Surface | Gate | Effect when the file is gone |
|---|---|---|
| `task_start` / `task_done` per dispatch | `hooks/lib/orchestrator-events.ts:322` | no dispatch rows written |
| async dispatch pairing | `hooks/lib/orchestrator-events.ts:235` | no pairing parked |
| `SubagentStop` row | `hooks/lib/orchestrator-events.ts:263` | no row |
| session-marker heartbeat | `hooks/lib/orchestrator-events.ts:108` | `/fusion:setup` Step 0c's concurrency warning goes permanently stale |
| `commit` row per commit | `bin/fusion-commit-lock:299` | no commit rows |

## Why it matters here rather than only in the abstract

The spec concentrates the whole session trace into this log. C4 criterion 5: "The event log carries
enough per dispatch to answer what ran, when, for how long, and by which checkout." C8 criterion 6:
"every dispatch writes a row carrying the three byte counts." C1 moves the git head, the domain and the
session identifier onto the `session_start` row. C9 keeps the presence and dispatch readers over the
log. Every one of those depends on rows that stop being written the moment C1's first acceptance
criterion is satisfied.

## What would resolve it

C1 names the sentinel role and specifies what replaces it. The condition is already computed in the
PreToolUse dispatch branch (`hooks/guard.ts:162-165`) and discarded there, which is the observation
`260909-1454_*_...` already made. Any replacement has to be written before a dispatch can emit, which
puts it on the ramp-up path C2 is clearing, so the two capabilities have to answer this together.

## State

`_o_` open. Belongs to the spec revision, not to the code. No code change is warranted until the
spec says what replaces the sentinel.
