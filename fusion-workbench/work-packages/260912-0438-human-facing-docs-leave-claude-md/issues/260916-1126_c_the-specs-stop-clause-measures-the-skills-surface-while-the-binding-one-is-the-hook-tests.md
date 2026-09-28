The spec's stop clause measures the skills surface, while the binding one for this work is the hook tests at nine lines
---
`260916-1058_*_spec-human-facing-docs-leave-claude-md.md` `## Stops when` names one size surface: the skill bodies, at 612 bytes of room. Measured at the same commit `92cd2491`, the surface this work actually runs out of first is the hook-test line surface.

`hooks/lib/__tests__/**.ts` measures 21 814 lines against a floor of 19 228 plus `TEST_LINE_HEAD_ROOM` 2 595 = 21 823. **Nine lines.** `hooks/lib/__tests__/reference-resolution-lint.test.ts:464` states the same figure in its own re-approval entry, so this is corroborated and not a lone count.

Consequence: C4's check cannot ship with a test, and C5's parser retargets cannot add a net line, unless lines are freed or the head-room is raised. The spec's C4 stop clause does not reach that case, so a run following the spec alone would meet the bound as a red suite rather than as a stop.

**Acceptance test:** the spec's `## Stops when` names the hook-test line surface with its measured margin, or a superseding record states why it does not need to.
---
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
Cross-references: 260916-1126_*_implementation-human-facing-docs-leave-claude-md.md (which carries the missing stop clause), 260827-0410_*_the-machine-written-event-rows-ship-with-wiring-asserts-only-because-the-hook-test-surface-is-full.md (the same surface, an earlier instance).

---
Resolved: `## Stops when` in `260916-1058_*_spec-human-facing-docs-leave-claude-md.md` gains a bullet
naming the hook-test line surface as the binding one, with its figure stamped to the commit it was
measured at — at `git:e8b455d0`, 21 921 lines against a budget of 21 921, floor 19 228 plus head-room
2 693, no margin. The stamp is not decoration: that margin read 9, then 33, then 0 in the course of
one day, so an unstamped number there is false within the hour.

The bullet says what happened rather than repairing a prediction. The work met this bound as a stop,
the shortfall was measured at 98 lines rather than estimated, and the user ruled the head-room raise
2 595 to 2 693 over hunting a cut of that size elsewhere or shipping the helper untested. A spec
amended after the fact is worth more as the record of what actually bound the work. Nothing else in
the spec was touched.
