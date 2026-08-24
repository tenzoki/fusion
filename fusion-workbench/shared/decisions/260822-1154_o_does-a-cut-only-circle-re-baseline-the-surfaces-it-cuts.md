# Does a cut-only Circle re-baseline the surfaces it cuts?

---
**Domain:** code
**Filed by:** planner
**Cross-references:** `shared/planning/260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md` `## Current State` (the arithmetic below); `shared/planning/260822-1136_o_spec-fusion-becomes-a-multi-user-tool.md` `### C0` (the acceptance criterion that permits the re-baseline); `shared/decisions/260822-1102_a_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md` (the user rejected declaring a third re-baselining moment); `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining` (the authoring home of the two events)

---

## Question

C0 is a cut-only Circle. Event 1 of `## Re-baselining` in `hooks/lib/__tests__/helpers/growth-bound.ts` says a baseline map moves after a cleanup: somebody has done the cut the bound asked for, and the per-file sizes from the regenerated golden are copied into the baseline map with a comment naming the cut that produced them. C0 is a cleanup by that description, so the question is live the moment its first cut lands, and the spec's own acceptance criterion for C0 anticipates it: no baseline map is edited "except where a re-baseline follows an actual cut and the cut is named in the same commit."

The question has to be answered before C0's first cut, because a re-baseline taken at the end of the Circle changes what the cut had to achieve, and therefore changes how large a cut the Circle plans.

**The arithmetic, which is what makes this a real question rather than a formality.** Head-room is `floor + headRoom − total`. Cutting X bytes from `agents/*.md` with no re-baseline gives `399 843 + 18 000 − (416 205 − X)`, which is `1 638 + X`. Re-baselining onto the post-cut sizes sets the floor to the post-cut total, so head-room becomes a flat 18 000 whatever X is. The two agree only at `X = 16 362`, the whole of that surface's growth since the 2026-08-15 arming. Below that, the re-baseline absolves `16 362 − X` bytes that nobody cut. All four surfaces currently stand above their floors, so the same holds on each.

The 2026-08-17 precedent went the other way and is not a counter-example. There the surface stood *below* its baseline, so re-baselining onto the post-cut sizes lowered head-room from 2 869 to 2 554, and the entry says so in its own words: the shrink is not banked. Re-baselining is a raise exactly when the surface has grown, which is the state all four are in today.

## Options

1. **A cut-only Circle never re-baselines. Head-room is whatever the cut leaves.** The baseline maps stay as they are and the Circle's success is measured as bytes removed.
   - Pros: cannot absolve growth nobody cut, under any size of cut. Keeps the instrument's reference fixed, which is what makes a later reading of "how much has this surface grown since it was last settled" answerable at all. Needs no new rule text, because it is what the maps already do when left alone.
   - Cons: the head-room a Circle can buy is capped by how much it can honestly cut, so a surface can end a cut Circle with less room than its head-room constant grants. The spec's exception clause goes unused, which reads as if the plan ignored it unless the reason is written down.
2. **Re-baseline only a surface cut back to or below its floor.** The re-baseline is permitted where it changes nothing, and refused where it would raise.
   - Pros: keeps event 1 alive as a written rule without letting it absolve anything, and matches what the 2026-08-17 entry actually did. States a condition a reader can check.
   - Cons: adds a condition to a rule whose whole value is that it has two events and no exceptions. And it buys nothing: where the condition holds, option 1 gives the same or a larger head-room, so the re-baseline is work with no effect.
3. **Re-baseline after any cut the Circle names, which is event 1 read literally.**
   - Pros: the plainest reading of the rule as written, and of the spec's acceptance criterion. A Circle that cuts gets its full head-room constant back on the surface it cut.
   - Cons: at the current numbers this absolves growth nobody removed, in proportion to how little was cut. A one-byte cut named in a commit would hand `agents/*.md` 16 361 bytes it did not earn. That is the silent raise `hooks/lib/__tests__/helpers/growth-bound.ts` was written to prevent, arriving through the door the rule left open rather than around it.

## Constraints

- The user has already rejected declaring a third re-baselining moment (`260822-1102`, option 3). Any answer works inside the two events that exist, or changes one of them.
- Whatever is answered has to survive the numbers moving. The arithmetic above is a fact about the four surfaces on 2026-08-22; the answer must state a rule, not a number.
- `hooks/lib/__tests__/helpers/growth-bound.ts` is the authoring home for the re-baselining rule. An answer that changes the rule changes that file and nothing else, and the change costs lines on the hook test surface.

## Recommendation

Option 1. It is the only one of the three that cannot absolve growth under any input, and options 2 and 3 differ from it only where option 1 is already at least as good. Option 2's condition is checkable but buys nothing; option 3 is the raise the instrument exists to refuse, and the fact that it is also the literal reading of event 1 is an argument for tightening event 1's wording rather than for taking it.

Plan `260822-1154` proceeds on option 1 and states the arithmetic in its `## Current State`, so C0 is not blocked on this record. What the record settles is whether the next cut-only Circle has to re-derive it.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:

---
**Reconciliation 260822-1556 (reconciler, domain `code`, HEAD `9f65463`) — marker unchanged at
`_o_`. C0 acted on the recommendation without the question being answered, which is what the record
predicted.**

The plan proceeded on option 1 and no baseline moved: `AGENT_BASELINE`, `SKILL_BASELINE` and
`TEST_LINE_BASELINE` in `hooks/lib/__tests__/surface-growth-bound.test.ts` and `RULE_BASELINE` in
`hooks/lib/__tests__/rules-emission-golden.test.ts` are byte-identical to `370bfc5`, re-extracted by
the same slice and diffed at this pass (413, 389, 1 554 and 1 042 bytes). `## Re-baselining` in
`hooks/lib/__tests__/helpers/growth-bound.ts` is also unchanged in the range, so event 1's wording
still reads the way this record says invites the raise. One Circle's practice is not an answer:
the record binds the next cut-only Circle and nothing on disk settles it.

---
Also seen: 260824-2022 by ontocoder — `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1942_*_nothing-detects-a-raised-growth-baseline-and-the-only-bound-on-one-is-a-comment.md` asks the neighbouring question, whether a baseline *raise* is meant to be detectable by anything other than a human reading a diff: the doctrine names two events at which a baseline moves and nothing asserts that a third has not happened. Referred here at its closure.
