# `staging_drift` and `review_coverage` events are emitted into a log nothing reads

---
**Severity:** Medium
**Domain:** code
**Filed by:** coderev, review of `7785330..cac41ef` (Turn 1)
**Affects:** `bin/monitor:120-133`, `:1081`; `hooks/tracker.ts:923`, `:1005`; `hooks/lib/events.ts:41-43`
**Cross-references:** commits `afd7c2e`, `cac41ef`

---

## The defect

`hooks/lib/events.ts` gained three event types in this range: `state_drift`, `review_coverage`,
`staging_drift`. `bin/monitor` gained handling for **one** of them.

```
bin/monitor:120   WARNING_EVENT_TYPES = {
bin/monitor:125       "state_drift",
```

and at `bin/monitor:1081`, in the reader for `.guard-state/events.jsonl`:

```python
if event not in WARNING_EVENT_TYPES:
    continue
```

`review_coverage` (emitted at `tracker.ts:923`) and `staging_drift` (emitted at `tracker.ts:1005`)
are written to `.guard-state/events.jsonl` and then dropped. They are not in the warnings panel and
they are not in the event list either — the event list is rendered from
`orchestrator-events.jsonl`, a different file, which these emissions never touch.

## Why it matters

`staging_drift` is the one of the three whose subject can be **lost**. A record that missed its
commit survives only in the working tree; `git checkout -- fusion-workbench/` takes it. The whole
argument in `staging-drift.ts:1-14` is that nothing was looking. After this change, the hook looks
and tells the model — once, in a tool result the model may or may not act on — and then records the
fact in a log with no reader. The user has no surface at all.

The asymmetry is also inconsistent with the family's own stated design.
`hooks/lib/state-drift.ts:47-48` lists `bin/monitor` as its **third caller**, "surfaces the
`state_drift` events this module's callers emit, rather than computing the divergence a second
time". The two later siblings were written against that model and did not get the third caller.

## Fix direction

Add both types to `WARNING_EVENT_TYPES` and give each its own subset budget and label, exactly as
`state_drift` got:

- `DRIFT_EVENT_TYPES` already exists — either widen it to all three (one shared 8-row budget) or add
  `STAGING_EVENT_TYPES` / `COVERAGE_EVENT_TYPES` with their own caps. The budget comment at
  `bin/monitor:174-181` argues for per-class caps from a measured rate; the same argument applies
  here, and the rate is the same (throttled on signature, so once per distinct miss).
- Add the two `levelLabel` branches beside `bin/monitor:561`. Suggested labels: `Unstaged record`
  and `Review gap` — the point of the `state_drift` label is that "Warning" beside a drift row
  invites the wrong reading, and the same holds here.

`bin/monitor` is on `guard.protectedPaths`, so this is a change a human makes or approves.
