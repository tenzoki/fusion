The record's Dependencies section states a sibling Circle is active, and that Circle closed before the record was written

---
This Circle's own record says `circles/260819-1645-four-constraints-on-deep-change` "is active".
That Circle's record is `_c_circle.md` — closed-coherent — and it was already closed when this
Circle was shaped. No party may correct the section: `## Dependencies` is absent from the
orchestrator's closed Circle-record write list, and the shaper's portfolio-activation mode writes
`## Directive` and `## Grounding snapshot` only.

---

**Domain:** code
**Filed by:** orchestrator
**Cross-references:** `shared/issues/260813-0913_*_a-dependency-between-two-circles-can-only-be-recorded-on-one-side-because-nobody-may-write-the-other.md`

## How it surfaced

At the activation of this Circle on 260820, the orchestrator read the record's `## Dependencies`
section before renaming `_a_circle.md` to `_t_circle.md`. The section reads:

> `circles/260819-1645-four-constraints-on-deep-change` is active and independent in subject, and
> it is cited here for one shared constraint rather than as a precondition

The cited Circle's record is `circles/260819-1645-four-constraints-on-deep-change/_c_circle.md`.
It was closed by commit `5faed26`, whose subject line is "the four-constraints Circle closes
coherent, with what it did not reach written into the note". That commit is the fifth entry in
`git log` at the time this Circle was shaped, so the closure preceded the shaping rather than
overtaking it.

## Why it is not merely a stale line

The claim is false at the moment it was written, not merely aged into falsity. A reader of this
record is told that a second Circle is running concurrently, and the sentence that follows draws a
consequence from exactly that: "Where the two run close together, the second one to write pays the
tighter bill." With one of the two closed, the shared-budget reasoning still holds but its stated
occasion does not.

The substance survives. Both Circles do spend from the same four growth budgets, and that is why
the citation was made. What fails is the tense, and the tense is what the consequence rests on.

## Why nobody may fix it in place

Three write boundaries meet here, and the section falls outside all of them.

- **The orchestrator.** `agents/orchestrator.md` `## Scope` enumerates the four places it may write
  Circle-record content, each with "and nowhere else": the `## Closure note`, the `## Turn log`
  entry for the Turn just ended, the two head fields, and the `## Directive` pointer literal.
  `## Dependencies` is not among them.
- **The shaper.** Its portfolio-activation mode is the sanctioned writer of Directive prose and the
  only writer of `## Grounding snapshot`. `## Dependencies` is named in neither.
- **The playmaker.** It appends activation-proposal, dependency-warning and stale-Grounding
  sections, and reads dependency edges for cycle detection without authoring them.

This is the same ownership gap that
`shared/issues/260813-0913_*_a-dependency-between-two-circles-can-only-be-recorded-on-one-side-because-nobody-may-write-the-other.md`
records, reached from a second direction. That record's instance is a **missing** edge: a
relationship recorded on one side because nobody could write the other. This instance is a
**false** edge: a relationship recorded with a state claim that was wrong on arrival and that
nobody may correct. The four candidate fixes listed in that record are the candidates here too,
and this record proposes none of them — the choice between them is a decision, not a defect.

## What makes this instance worth its own record

The earlier record's acceptance criteria are about a dependency being *readable from both sides*.
Satisfying every one of them would leave this defect untouched: a two-sided edge whose state claim
is false is still false. A fix aimed only at the one-sided case would close that record and leave
this one open, which is the test for whether a second record is warranted.

## Acceptance

- The record of an active Circle does not assert a state for a sibling Circle that contradicts that
  sibling's own marker, or some party is named who may correct it when it does.
- Whatever party gains the write, its prompt's scope enumeration says so, and the other two prompts
  do not leave a reader believing they own it.
- The check is available at activation, which is the moment the orchestrator already reads the
  section and the last moment before the claim starts being read as current.
