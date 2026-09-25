# Shaper session: settle what travels between checkouts

**Date:** 2026-08-23
**Agent:** shaper (anticipated-circle mode, dispatched via `/fusion:direct`)
**Domain:** code
**Product:** `260823-0023-settle-what-travels-between-checkouts`

## The draft

"Settle what travels between checkouts: apply the four-class state partition, stop tracking `portfolio.md`, and decide how the tracked event log behaves when two checkouts have both appended to it."

The draft arrived as prose rather than as a backlog entry, so no backlog entry was promoted and none was touched.

## What was clarified

Six questions were put to the user and answered. The answers are recorded in full in the Circle's `## Grounding snapshot`; what follows is the shape of each decision and the cost the user accepted with it.

1. **Event-log merge behaviour.** Option 1 of `260822-1136_*_how-does-the-tracked-event-log-behave-when-two-checkouts-both-appended-to-it.md`: a union merge driver in a root `.gitattributes`. The C1 pass had already measured the option end to end, both the clean merge and the loss of chronological order. Accepted cost: every reader of the log must sort by `ts`.

2. **A pulled Circle record marked active.** Option 3 of `260822-2219_*_what-does-a-second-checkout-do-with-a-circle-record-marked-active-that-it-never-activated.md`: `/fusion:setup` reports the state and offers activation as the user's own act. Accepted cost: one more gate on the setup surface, and a gate that informs without preventing.

3. **The setup marker.** The write in `skills/setup/SKILL.md` changes rather than the classification in `rules/workbench-tracking.md` or the specification's class R3 paragraph. Write only when the file is missing or the plugin version changes, and drop `setup_pwd`. Accepted cost: bytes on the surface C0 has just cleared.

4. **The filename convention under several checkouts.** Kept out of this Circle. `260822-1556_*_does-the-record-filename-convention-hold-when-several-checkouts-file-into-one-store.md` stays open and is answered before C3, where the record templates are opened anyway.

5. **How the merge driver reaches a consuming project.** `/fusion:setup` creates or amends the `.gitattributes` line. This went **against** the shaper's own suggestion, which was to leave the line to the project's maintainer. Two costs accepted: bytes on the skill surface, and the fact that Setup would for the first time write a file outside `fusion-workbench/`. The user asked for the second to be treated expressly in the Grounding as an expansion of what Setup touches rather than as a byte question, and it is.

6. **Which event-log readers this Circle repairs.** The driver plus the sequence-diagram generator. The Turn count stays with C4, where its defect is already filed. Accepted cost: `agents/orchestrator.md` is opened twice across the two Circles.

**One default the shaper did not ask about**, raised by the user unprompted and confirmed: `setup_at` stays in the marker. The consequence is that two checkouts running Setup after a fusion release can still conflict on that one-line file, once per release rather than once per Setup. It is recorded in the Grounding as a residual risk rather than solved.

## What this pass did not write

Two decision records are answered in the Grounding and still carry the `_o_` marker and an empty `Answered:` line on disk: the event-log merge decision and the second-checkout activation decision. Anticipated-circle mode writes only inside the Circle it creates, so neither was edited. Closing both, each citing this Circle's record, is work for the Circle's first Turn. The Grounding says so plainly, so that a reconciler meeting the open markers finds the reason rather than a contradiction.

No spec was written; in this mode the Circle record is the artifact. No issue was filed: every defect this Circle closes was already on disk.

## Result

Circle `260823-0023-settle-what-travels-between-checkouts`, marker `_a_`, six artifact subdirectories created, no Turn started. It is capability C2 of `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` and depends on the closed C1 Circle `260822-1921-measure-what-two-checkouts-share`. Activation is the user's separate act via `/fusion:next`.
