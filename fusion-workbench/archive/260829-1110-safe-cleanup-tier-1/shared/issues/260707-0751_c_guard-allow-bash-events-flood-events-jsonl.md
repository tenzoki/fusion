# Guard now appends a guard_allow event to events.jsonl on every Bash call

---
**Status:** open
**Filed by:** coderev (review of the 3.25.0 guard-wiring fix)
---

## Symptom

After widening the `PreToolUse` matcher to include `Bash` (3.25.0), the guard's Bash allow
path calls `emitEvent("guard_allow", "Bash")` on **every** Bash tool call
(`hooks/guard.ts:166`). `emitEvent` unconditionally appends a line to `events.jsonl`
(`hooks/lib/events.ts:63`). Because agents run Bash constantly, `events.jsonl` — the feed the
`bin/monitor` dashboard consumes — is now flooded with `guard_allow Bash` entries.

## Impact

- `events.jsonl` grows much faster and is dominated by uninteresting `guard_allow Bash`
  lines, burying the guard_block / guard_halt / guard_advisory events the monitor exists to
  surface.
- One `appendFileSync` per Bash call (plus the `saveEscalation` rewrite from the sibling
  issue) is added I/O on the hot path of nearly every agent action.

Non-blocking — cosmetic/operational, not a correctness or security defect. Filed so it is
decided deliberately rather than by omission.

## Fix options

1. Do not emit `guard_allow` for the innocuous-Bash allow path (only emit on Bash
   deny/override, which are the interesting events). Write-tool `guard_allow` behaviour is
   unchanged.
2. Or have the monitor / any `events.jsonl` consumer filter `guard_allow` + `Bash`, and add a
   size/rotation bound on `events.jsonl`.

Option 1 is the smaller change and keeps the event log meaningful.

## Verification

Run a handful of innocuous Bash calls through `dist/guard.js` and confirm no `guard_allow`
Bash lines are appended to `events.jsonl` (option 1), while a denied `git switch` still emits
`guard_block`.

---
Resolved: bf18fc0 — Bash guard allow-path no longer emits guard_allow. Verified: coderev clean; guard_allow now emitted only on write-tool allow (guard.ts:349) and self-detect standing-down. Hooks suite 91 pass.
