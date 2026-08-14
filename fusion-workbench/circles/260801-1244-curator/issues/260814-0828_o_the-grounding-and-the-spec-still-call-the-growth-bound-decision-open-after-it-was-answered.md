The Grounding snapshot and the spec still call the growth-bound decision open after it was answered

---
`decisions/260814-0738_a_how-is-the-always-on-growth-bound-armed-when-the-corpus-is-already-over-budget.md`
carries the answered marker and an `Answered:` line: the user chose option 1, a one-time
re-baseline at the moment of arming, at an orchestrator gate on 2026-08-14. The Circle's
`## Grounding snapshot` and the spec's `## User Decisions Pending` were written minutes before that
answer and still describe the question as open.

---
**Where.** Three surfaces, all inside this Circle:

- `_t_circle.md`, `## Grounding snapshot` — describes the arming question as still to be settled.
- `planning/260814-0738_o_spec-curator.md`, capability C10 and `## User Decisions Pending` — the
  acceptance criteria for C10 are written against an unmade choice, and the record's own
  recommendation is presented as a recommendation rather than as the answer.
- `portfolio.md` reports the same lag under `## Warnings` as
  `curator-record-and-spec-lag-the-answered-decision`. That file is regenerated on every playmaker
  run and is not evidence anybody plans from.

**Why it matters now.** The planner is the next agent to read the spec, and C10's acceptance
criteria differ between the three options. A planner reading `## User Decisions Pending` will
either plan against an open question or stop and ask one that is already answered. The decision
record is the authority and it is correct; nothing here is wrong about the *answer*, only about
which surfaces know it.

**Why it was not fixed during activation.** The `## Grounding snapshot` is writable in this Circle
only by the shaper's portfolio-activation mode, and the spec is the shaper's own output. The
orchestrator's write access to a Circle record is the Closure note, the Turn log and the three head
fields. `/fusion:next` writes the marker, the `**Status:**` field and the pointer, and nothing else.
The user chose activation over a third shaper round with this lag stated.

**Cheapest resolution.** A shaper pass in portfolio-activation mode, or the planner reading the
decision record first and treating `Answered:` as binding over the spec's pending list. The answer
in one line: the bound is armed by re-baselining once at the moment of arming, with the 2026-08-14
overshoot written into the file as text so the standing cleanup request survives the number moving.

**Filed by:** orchestrator, session `shared/history/260813-2345-orchestrator-session.md`.
