# `unstamped` counts over the whole log while every other dispatch figure is filtered

**Filed by:** coderev, Kai Stalmann <kai@qantr.com>
**Severity:** Medium
**Found in:** `260908-2110-coderev-bounded-dispatch-closure.md`, finding M1
**Range:** `637d0b04..20796615`

## What is wrong

In `measureDispatchDurations`, `hooks/lib/events-query.ts:675-681`, the `unstamped`
increment sits above both of the reading's filters:

```
    const startMs = parseTs(line.ts);
    if (startMs === null || cutoffMs === null) {
      unstamped++;
      continue;
    }
    if (startMs < cutoffMs) continue;
    if (line.agent === undefined || !agents.has(line.agent)) continue;
```

A `task_start` whose `ts` cannot be read is therefore counted whatever its agent and
whatever its date. A `planner` dispatch predating the cutoff with a truncated stamp raises
`unstamped`, though `planner` is not in `BOUND_AGENTS` and the date is outside every
reachable cutoff, so that dispatch could not have appeared in the reading under any
outcome.

The second increment of the same counter, at `hooks/lib/events-query.ts:697`, is below
both filters. One counter, two populations: the printed figure is a whole-log count plus a
filtered count and follows no single stated rule.

## Why it is a defect and not a choice

The module states the opposite principle for itself at
`hooks/lib/events-query.ts:617-621`, about `unpaired`: without applying steps 2 and 3 the
figure "would run over the whole file and over every agent, which is the exact widening
the cutoff exists to prevent, and it would not be comparable with `counted` beside it."
Every word applies to `unstamped`. Nothing in the range argues an exception for it.

The consequence reaches the user. `hooks/events-query.ts:524-528` prints the figure with
"They are in no figure below", which invites the reader to add it to `counted` +
`unattributable` + `unpaired` to recover the dispatches in scope. That sum is wrong by
however many out-of-scope malformed starts the log holds.

## Fix direction

Move the `unstamped++`/`continue` below the cutoff and agent filters. That needs a
reordering, since the cutoff test currently depends on the parse: the natural order is
agent filter, then parse, then cutoff test, with `unstamped` on a null parse. Check C4's
criterion naming `unstamped` before changing what the figure counts, and update the
`bin/fusion-events` header block and the wrapper's sentence to match.

## Scope

`bin/fusion-events dispatches` only. Reported figure, no gate, no other subcommand.
