# An `unchecked` drift row is silent on the tracker path and invisible in the CLI header, while the population that lands there just grew

---

**Severity:** Low — the row that cannot be measured is reported as nothing rather than as a gap, on the caller that runs unasked
**Domain:** code
**Filed by:** coderev (review of `e3da397..a6b4928`, Turn 5)
**Affects:** `hooks/lib/state-drift.ts:661` (`driftSentence`), `hooks/state-drift.ts` (the CLI header), `hooks/lib/state-drift.ts:64` (the docstring claim)

---

## What is wrong

`hooks/lib/state-drift.ts:64` states the module's contract:

> every row that cannot be decided is reported as `unchecked` with its reason, **never dropped**. A drift check that exists to catch a silent skip must not perform one.

On the CLI path that holds: `renderRow` prints `UNCHECKED (<reason>)` and the row is visible. On the **tracker** path it does not. `driftSentence` is built from `report.drifted` alone:

```ts
const rows = report.drifted
  .map((r) => `${r.surface} says ${r.says}, the record says ${r.record}`)
```

and `hooks/tracker.ts` says nothing when `drifted` is empty. So an `unchecked` row produces silence on the caller the module's own header calls the one that "needs no cooperation from the session" and fires on every guarded tool call.

The CLI's `KEY=value` header has the same shape of gap one level down: it prints `rows=`, `drift=` and `verdict=`, with no `unchecked=`. Measured in this repository just now:

```
rows=4
drift=0
verdict=clean
  progress.turn  surface=5  record=?  UNCHECKED (2 session_start lines since the last session_end and none names …)
```

`verdict=clean` over a report in which one of four rows could not be taken. The row itself is printed and a reader who reads rows sees it; a reader who scans the header does not.

## Why this is filed now rather than as a standing property

`unchecked` rows existed before `e61e24a`. What changed is how many reports carry one: `turnsRun` used to find an anchor on essentially every log (the last `session_start`), and now returns `null` for any log that predates the `history_file` field and carries more than one `session_start` since the last `session_end`. That is this repository's own log today, and it is every consuming project's log for its first resumed session after the upgrade — plus, indefinitely, any session whose `agentstate.yaml` carries no `history_file`.

The fix's own reasoning is that "a row that speaks on its commonest path is one its reader learns to read past". Correct, and the replacement on the tracker path is not a quieter statement but no statement.

## What is not claimed

The Turn boundary is still covered: `agents/orchestrator.md` runs `bin/fusion-state-drift` at `turn_start` and `turn_end` and reads the rows, so an orchestrator following the prompt does see the `UNCHECKED` line. This record is about the two surfaces where it does not appear, and about the header claiming `clean` for a report that is partly unmeasured.

## Fix direction

- Add `unchecked=<n>` to the CLI header beside `drift=`, so the summary lines are complete over the row verdicts. Cheap, and it is the same shape as `records=partial` in the orchestrator's record-counts block — a report that says which half it could take.
- Decide, deliberately, whether the tracker should speak once for a row that turned `unchecked`. It should be throttled the way the drift signature already is (`lastReported` / `recordReported`) so it cannot become the every-call noise the module exists to avoid; the signature currently covers only drifted rows.

## Acceptance criteria

- `bin/fusion-state-drift`'s header distinguishes a report with no drift from a report with no drift and an unmeasured row.
- The module docstring's "never dropped" is either true of all three callers or names the caller it is not true of.
