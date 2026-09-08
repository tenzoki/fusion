# Shaper: third rework of the bounded-dispatch specification

**Date:** 2026-09-07 14:17
**Mode:** portfolio-activation, `**Scope:** spec`
**Circle:** `260906-2258-bounded-executor-dispatches`
**Initiated by:** the orchestrator put the third planability verdict ("rework needed, 7 gaps", three
of them blocking) to the user on 260907 and offered a small rework with a short targeted re-check, a
plan with no further check, or a plan on the state reached. The user chose the first on 260907.
**Tree read:** HEAD `abcaa823`, branch `main`, no ahead or behind marker.

## What was asked

A deliberately small third round. Repair the seven items in the third check's Verdict, change nothing
about the cut, the 20 minutes, the seven-and-seven agent assignment or the three decisions the user
had accepted, and do not rewrite the specification. Return a question round rather than guess if
anything was left that only the user could close.

## What was changed

Two files, both inside this Circle: the specification
`260907-0820_*_spec-bounded-executor-dispatches.md` and the `## Grounding snapshot` of `_t_circle.md`.
No other file was touched, no issue was filed and no decision record was written.

**The three blocking items.**

1. *Five return sites, one specified.* C3 now carries the roster of five dispatch sites, one rule
   covering all of them, a diagram of the fan-in, and a five-row table saying per site where the
   continuation is dispatched, what must not happen in between, and which existing not-completed path
   the stall guard falls through to. The three conditions the second revision stated (not entering
   Step 3b, not reaching step 6, continuing inside the same Turn) are restated as the general rule's
   reading at the first site rather than as the rule itself, because four of the five sites have
   neither those steps nor a Turn.
2. *The bugfixer branch reverted a bounded return.* Step 3b step 2d is now excluded by name in its
   own table row and in a paragraph under the table. A continuation is stated to be the same attempt
   continued, so step 2e's one-attempt budget is not consumed by one.
3. *Three dispatch populations, split in two.* C1 criterion 1 is scoped to the orchestrator's own
   dispatches, a new criterion covers everything else, and the decision bullet carries a three-row
   table of the populations. C4 is rewritten around the question the rows can answer: it reports
   durations against a configured value, calls no dispatch a violation, restricts to dispatches whose
   `session_id` matches a `session_start` row, and states in its own output that inside one session
   no field separates a skill body's dispatch from the orchestrator's own.

**The four riding items.** The Step 3a placement is settled on one reading, the guard in front of the
`Verification:` switch, with the argument that the two tests read different inputs and are orthogonal
rather than exclusive. Events, dashboard and `work_queue` are settled as "nothing is written", which
follows from C2 and the existing dashboard cadence rule. The sorting criterion is re-cut in two parts
so that re-applying it reproduces the same seven and seven, and `playmaker` now fails it twice. Two
overstated claims are corrected: the cache sentence is made conditional on request cadence, and the
roster criterion names what `consultant` and `orchestrator` actually are.

**Two additions the check asked for.** A `## Residuals` section gathers the four residuals the user
bought, two of which were not on the page (the two longest non-`coder` dispatches leaving the bound's
reach, and the unbounded overshoot that follows from reading the clock between units). A Constraint
records the `agents/` growth bound and forbids the obligation being written as eight prompt
paragraphs; Open for Planner names the conditional-rule-file shape and the two lint gates that ride
it.

## Measurements taken during this run

- `agents/` growth bound: 413 225 bytes measured against a 399 843-byte baseline, so 13 382 above it
  and **4 618** of the 18 000-byte head-room left. Computed over the working tree at `abcaa823`
  against `AGENT_BASELINE` in `hooks/lib/__tests__/surface-growth-bound.test.ts`.
- `agents/` holds 15 prompt files; the two lists name 14 and `orchestrator` is in neither.
- `agents/orchestrator.md` names no `fusion:consultant` anywhere, confirming the check's reading of
  the allowlist.
- The machine-written dispatch row's field set, read at `hooks/lib/orchestrator-events.ts`: `ts`,
  `event`, `task`, `agent`, `person`, `checkout`, `session_id`, `detail`. Nothing names the
  dispatcher, which is what makes the same-session attribution undecidable.
- Both edited files pass `bin/fusion-prose-metric`; `bin/fusion-citation-check` reports
  `verdict=clean` and names no path inside this Circle.

## What was not done

No question was put to the user. Each of the seven items followed from a decision already taken or
from the Directive itself, and the two blocking ones had only one non-damaging answer each. No
capability was added or removed, no value moved, no agent changed lists, and no scope line was
widened.
