# An unparseable cutoff is reported to the user as unstamped dispatches

**Filed by:** coderev, Kai Stalmann <kai@qantr.com>
**Severity:** Medium
**Found in:** `260908-2110-coderev-bounded-dispatch-closure.md`, finding M2
**Range:** `637d0b04..20796615`

## What is wrong

`hooks/lib/events-query.ts:676` tests two unrelated failures with one condition:

```
    if (startMs === null || cutoffMs === null) {
```

When `cutoffMs` is null the condition holds for **every** `task_start` in the log, so
`unstamped` becomes the total number of dispatch starts and the reading returns no rows.
The empty reading is correct and deliberate — the doc block at
`hooks/lib/events-query.ts:625-627` argues it, and the argument stands. What the doc does
not anticipate is the sentence the wrapper prints in that branch,
`hooks/events-query.ts:525-528`:

```
`${r.unstamped} dispatch(es) carry no readable ts on one of their two rows and could `
  + "neither be placed against the cutoff nor measured. They are in no figure below."
```

The claim is false of every dispatch counted there. The stamps are fine; the cutoff is not.
A reader is told the event log is corrupt and never learns their `--since` value was
rejected downstream of the regex that admitted it.

## Reachability, stated honestly

The CLI guard at `hooks/events-query.ts:617-620` rejects anything not matching
`^\d{4}-\d{2}-\d{2}$`, and `BOUND_LANDED` is a valid constant, so this needs a
regex-shaped but impossible date: `--since 2026-13-45`, `--since 2026-02-31`. I did not
execute the helper to confirm `Date.parse` returns NaN for those. The claim rests on
reading `parseTs` at `hooks/lib/events-query.ts:162-167`, which appends `Z` and returns
null on NaN. Low reachability; the failure mode is a confident false statement about the
project's data, which is the one output class this module's header says it must not
produce.

## Fix direction

Separate the two causes. Test `cutoffMs === null` once before the loop and return a report
that says the cutoff could not be parsed — its own field, or a distinct stderr sentence —
leaving `unstamped` to mean only what its name and its doc comment say. Either that, or
tighten the CLI guard to a real calendar-date check so the branch becomes unreachable and
say so at the site.

## Scope

`bin/fusion-events dispatches` only.
