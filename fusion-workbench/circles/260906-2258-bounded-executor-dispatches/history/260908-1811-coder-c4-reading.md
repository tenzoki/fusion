# Coder — Step 12: the C4 reading

**Status:** Complete
**Agent:** coder
**Date:** 2026-09-08
**Checkout:** 5e8248d7
**Filed by:** Kai Stalmann <ks@qantr.com>
**Source:** `260907-1450_*_plan-bounded-executor-dispatches.md` `### 12`

## What was done

Three files, and no others: `hooks/lib/events-query.ts`, `hooks/events-query.ts`,
`bin/fusion-events`. No new module, so `README-hooks.md`'s `hooks/lib` table is untouched
and `derivable-enumerations-lint.test.ts` has nothing new to hold in set equality.

**The line parser.** `agent`, `task` and `session_id` joined `interface EventLine` and
`STRING_FIELDS`. Both additive; the two existing readings name their fields and are
unaffected.

**`BOUND_AGENTS`**, exported, the seven in `bin/fusion-rules`'s own order, with the comment
saying the pairing test is Step 13 and naming `REVIEW_SENDERS` as the precedent.

**`measureDispatchDurations(text, opts)`**, exported and pure: no file, no subprocess, no
sentence phrased for a user, and no identity — `isOurs` is called nowhere in it, because a
bound dispatch made from another checkout is still a bound dispatch. The filter order is
the plan's: pair on `task`, cut at the cutoff, keep the named agents, then mark what no
`session_start` accounts for. Every timestamp goes through `parseTs`.

**`renderDispatch`**, beside `renderParty` and flattened the same way, so a control
character inside a field cannot shift the record.

**The `dispatches` subcommand**, its `USAGE` line, its two arguments, and the
`BOUND_LANDED = "2026-09-08"` cutoff constant.

**`bin/fusion-events`**: the usage block, the output shape, a section on the reading and
the question it answers instead, and four exit-table amendments.

## Three decisions the plan left to the implementation

**The outcome field carries four values, not two.** The plan spells the fifth field of a
`dispatch=` row as `<longer|within>`. An unattributable pair and an unpaired start each
have to be *reported* per C4's fifth and eighth criteria, and reporting either as `longer`
or as `within` would score a dispatch this reading cannot place. So the field takes
`unattributable` and `unpaired` as well, the four are disjoint, and `counted` is `within`
plus `longer` and nothing else, so the figures and the rows tile. An unpaired row's minutes
field is `-`: C4's eighth criterion forbids the zero, and a blank would read as one.

**The cutoff and the agent filter apply to an unpaired start too.** The plan lists the
`unpaired` finding before the two filters. Scoping it the same way is what keeps the figure
comparable with `counted` beside it; unscoped it would run over the whole file and every
agent, which is the widening the cutoff exists to prevent. Stated in the function's
docstring.

**The `unattributable` stderr line derives this log's coverage rather than asserting it.**
The plan asks for "today's coverage stated in the wording". A number written into shipped
code would be this project's figure on the day it was written, in every consuming project
forever. So `measureDispatchDurations` returns `sessionStarts` and
`sessionStartsWithoutId`, counted from the lines just read, and the sentence states them.
On this project's log that is 83 of 95, which is why the failure is real rather than
hypothetical — and `rules/critical-stance.md` §5 wants a cardinality derived, not asserted.

## What the reading does not do

It labels no dispatch a violation, and the word appears in no output line. It is a gate on
nothing and nothing runs it automatically. It adds no event field and writes to no log.
`curator` and `reconciler` are in `BOUND_AGENTS`.

## One count that is on stderr and not on stdout

`unstamped`: a dispatch carrying no readable `ts` on one of its two rows can neither be
placed against the cutoff nor measured. It is returned by the function and named on stderr
rather than dropped silently, which is `parseLog`'s standing rule and `countTurns`'s
existing treatment of the same condition. It is not a `KEY=value` line, so the stdout block
is exactly the seven keys, three `limit=` lines and `dispatch=` rows the plan spells.

## Verification

- `cd hooks && npm run build` — exit 0.
- `bin/fusion-events dispatches` — exit 0, all three `limit=` lines on stdout,
  `counted=16`, `longer_than_threshold=3`, `unpaired=1` (this session's own in-flight
  dispatch, correctly not counted and not a zero).
- `bin/fusion-events dispatches --minutes 5` — exit 0, `threshold_source=argument`,
  `threshold_minutes=5`.
- `bin/fusion-events dispatches --since 2020-01-01` — exit 0, `cutoff=2020-01-01`,
  `unattributable=164` with the derived-coverage sentence on stderr. The cutoff is
  overridable and the constant is what keeps the default reading off the log's history.
- `cd hooks && npm test` — exit 1 on the first run, on two tests that touch none of these
  files: `fusion-commit-lock.test.ts` (one of the three harness-spawning tests filed as
  intermittent in `260908-1719_*_three-harness-spawning-tests-fail-intermittently-so-the-suite-cannot-answer-the-circles-green-clause.md`) and one
  30-second timeout in `monitor-warnings-panel.test.ts`. Each was re-run alone and passed:
  commit-lock 13/13, monitor 21/21 with the timing-out case finishing at 26.4s of its 30s
  budget. A second agent was working in this checkout throughout, which is the load the
  second failure is consistent with. It is not on the filed list; whether it belongs there
  is a question for that issue rather than for this step.
