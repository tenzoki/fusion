# Shaper session: the isolation premise becomes a Circle

**Date:** 2026-08-22
**Agent:** shaper, anticipated-circle mode
**Dispatched by:** `/fusion:direct`
**Result:** `260822-1921-measure-what-two-checkouts-share`

## The draft

The user's draft asked for verification, by measurement rather than by reasoning, of what two checkouts of one project actually share and what they do not. The dispatch named the source material: capability `### C1` of `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, and the answer that capability either supports or refutes, `260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md`.

## What the shaping had to establish before writing a Directive

C1 as written in the specification has two halves. The second of them, superseding the record that forbade concurrency, was already discharged: `260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md` carries the superseded marker at HEAD, the reframed answer was filed at the Rebalance gate of `260822-1009-orchestrator-session.md`, and commit `02dff51` landed it. A Directive restating that half would have promised work already done, so the Directive covers the verification half alone and the Grounding snapshot records why.

Read during exploration: the specification's C1 section and its `## The state partition`; the answered decision record and the superseded one; `260822-1556_*_the-spec-names-five-circles-and-the-workbench-holds-none-of-them-so-c0-closed-with-nothing-to-transition.md`, which records that C0 of the same specification ran with no Circle directory and whose first fix direction this Circle begins; and the workbench's Circle inventory, which held fourteen terminal Circles and no anticipated one.

## Clarifications and what each foreclosed

Four questions, answered in one round. Each answer carries a cost the user accepted, and all four are recorded in the Circle's Grounding snapshot rather than only here.

1. **Form of the measurement.** An analyst pass producing a report, not an executable check that ships. Cost accepted: the report says nothing about behaviour after a change to `bin/fusion-workbench-root`.
2. **What is measured against.** A throwaway project created for the purpose. Cost accepted: findings that surface only at realistic size can be missed.
3. **A negative result in the nested case.** Document it and continue. Nesting is not an arrangement the user intends to use. Cost accepted: somebody who does set it up that way is not warned.
4. **What closure requires besides the report.** An addendum to the answered decision record, whose closing paragraph today records the arrangement as chosen but not proven. A how-to for setting up a second checkout was offered and declined.

The open question the specification left to planning, whether the measurement ships as code, was therefore settled at shaping instead. Nothing was deferred, so no decision record was filed.

## What was written

The Circle directory `260822-1921-measure-what-two-checkouts-share`, its record `_a_circle.md` in the anticipated state, and the six artifact subdirectories. No spec, per anticipated-circle mode: the record is the artifact. The draft was raw text rather than a backlog entry, so no backlog entry was promoted or closed.

Activation is the user's separate step.
