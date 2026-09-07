# Shaper session: second rework of the bounded-dispatch specification

**Date:** 2026-09-07 13:05
**Mode:** portfolio-activation, `**Scope:** spec`
**Circle:** 260906-2258-bounded-executor-dispatches
**Initiated by:** the orchestrator put the second planability check's verdict ("rework needed, 9
gaps") to the user on 260907 with the two questions only the user could close. The user answered
"1: Grenze auf 20 Minuten. 2:2" — a fixed 20-minute value, and option 2 on the second question,
exempting the agents that keep no intermediate state on disk.
**Input report:** `260907-0836-second-planability-check-of-the-bounded-dispatch-spec.md`, `## Verdict`

## What changed

Rewrote `260907-0820_*_spec-bounded-executor-dispatches.md` in place and edited
`## Grounding snapshot` in `_t_circle.md`. No other file was touched. No clarification round was
returned to the user: all nine items were closeable from the user's two answers plus evidence in the
tree.

### The two user decisions, rendered

**Point 1, the value.** The property that stood in C1 ("at or above the median duration of the
dispatches already recorded") is replaced by 20 minutes. The population the 11 percent is read
against is now named in the criterion itself, because the earlier text gave a share without one and
the median moved between 9.35 and 11.93 minutes depending on which population was meant. Re-measured
here rather than copied: over the 131 machine-written dispatch pairs, 15 ran past 20 minutes, 11.5
percent; over the 114 made by an agent the bound now covers, 13 did, 11.4 percent.

**Point 3, the exemption.** Recorded as a supersession, not a replacement: the Grounding snapshot
now carries both answers and says which one is in force. The analyst's candidate list was checked
agent by agent at the prompts, and two entries came out differently.

- `planner` was not on the candidate list and is **exempt** here. Its plan document is step 5 of its
  own planning process (`agents/planner.md`), so nothing of the plan exists on disk before the run
  ends. Measured: 4 planner dispatches, median 17.08 minutes, none past 20.
- `curator` was on the candidate list and is **bound** here. Its apply pass writes each approved
  entry and appends that entry's outcome to the run file before moving to the next
  (`agents/curator.md` Pass 2), so a half-finished apply leaves usable partial work on disk.

The sorting criterion is written into the spec so a later reader can re-apply it to an agent the
roster does not yet have: bound when the work product lands on disk as the run proceeds, exempt when
it comes into existence only at the end or is not a file at all. Bound: `coder`, `ontocoder`,
`bugfixer`, `reconciler`, `coderev`, `ontorev`, `curator`. Exempt: `analyst`, `consultant`, `editor`,
`planner`, `playmaker`, `shaper`, `taskplanner`. Fourteen agents, each in exactly one list.

### The seven items that were mine

- **Point 2, no supplier outside a session.** Decided rather than asked: an agent dispatched with no
  stopping time runs to its natural end, as today. A halt would break every skill-dispatched and
  user-dispatched run, and the editor's halt precedent is about a silently wrong deliverable, which
  has no analogue here. C4 is stated to be blind to those dispatches, and the case is added to Out of
  Scope so no plan tries to close it.
- **Point 4, the landing in the loop.** A bounded return is a **fifth case** at Step 3a item 5,
  recognised on the reason for returning before the `Verification:` line is read, so it is disjoint
  from the four and never falls into `did not finish`. The passage declaring there is no fifth is
  amended. The partial work is **not committed** before the continuation: Step 3b commits completed
  tasks, and the tree between a bounded return and its continuation is in the same state it is in
  between any two tool calls of an unbounded run.
- **Point 5, C4's threshold.** The reading takes the stopping time as an explicit input defaulting to
  the configured value, states which value it used, reads only dispatches at or after a cutoff
  constant set when the mechanism lands, and reads only bound-agent dispatches, told apart by the
  `agent` field the rows already carry (verified present).
- **Point 6, the clock trigger and the two claims.** The trigger is named: immediately before the
  agent starts the next unit of its work, and at no finer grain. The first mitigation is labelled
  `inference:` and its measurement is narrowed to what it actually covers. The second is withdrawn
  rather than labelled: moving a sentence into the dispatch prompt changes where it is written, not
  what act it rides, and the dispatch prompt is now described as where the value travels and nothing
  more.
- **Point 7, the figures.** 30.6 percent is gone from both documents, with the four pairing methods
  recorded so nobody re-derives it. 28.6 percent is kept and written as a floor, with the denominator
  argument stated at each site.
- **Point 8, the second stopping condition.** Withdrawn, with the reason written into `## Stops when`
  rather than deleted silently. The duration fact it was reaching for (39.2 percent of 97 handoff
  gaps outlive the cache entry) moved into C5 as a criterion. The off state it named is answered
  without new mechanism: a project sets the one configurable value high enough to reach no dispatch.
- **Point 9, the Directive.** First sentence rewritten to state the request: every bound agent "is
  asked, at the moment it is dispatched, to stop at a named wall-clock time".

### The two corrections taken without a question

Both verified here rather than copied. The handoff distribution (97 machine-written gaps under 24
hours, median 2.37 minutes, 38 past five minutes, 39.2 percent, carrying 97.7 percent of gap
minutes) reproduced exactly once the 24-hour cap was applied. The cache-read note (a read refreshes
the timer, so the five-minute expiry bites between dispatches and not inside one) is in both
documents.

## Measurements re-taken in this session

All over `fusion-workbench/orchestrator-events.jsonl`, and all reproducing the second check exactly:
131 machine-written dispatch pairs, median 9.35 / p75 14.27 / p90 22.28 / max 90.83 minutes; 15 past
20 minutes; per-agent durations for the bound/exempt split; 97 handoff gaps under 24 hours; 177
`task_start` against 248 `task_done` in the 1265-row window before 2026-08-12.

## Verification

`bin/fusion-citation-check`: `edited-violations=0`, `verdict=clean`, no violation in this Circle's
files. `bin/fusion-prose-metric` on both edited files: within the em-dash ceiling.

## Scope kept

The five settled boundaries were not reopened: cost only and no claim about rule adherence, the bound
inside the run itself, the existing arithmetic as evidence, wall clock as the unit, and the minute
measurement of the handoff as sufficient evidence with its limitation written out.
