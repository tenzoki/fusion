The spec's stop clause measures the skills surface, while the binding one for this work is the hook tests at nine lines
---
`260916-1058_*_spec-human-facing-docs-leave-claude-md.md` `## Stops when` names one size surface: the skill bodies, at 612 bytes of room. Measured at the same commit `92cd2491`, the surface this work actually runs out of first is the hook-test line surface.

`hooks/lib/__tests__/**.ts` measures 21 814 lines against a floor of 19 228 plus `TEST_LINE_HEAD_ROOM` 2 595 = 21 823. **Nine lines.** `hooks/lib/__tests__/reference-resolution-lint.test.ts:464` states the same figure in its own re-approval entry, so this is corroborated and not a lone count.

Consequence: C4's check cannot ship with a test, and C5's parser retargets cannot add a net line, unless lines are freed or the head-room is raised. The spec's C4 stop clause does not reach that case, so a run following the spec alone would meet the bound as a red suite rather than as a stop.

**Acceptance test:** the spec's `## Stops when` names the hook-test line surface with its measured margin, or a superseding record states why it does not need to.
---
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
Cross-references: 260916-1126_*_implementation-human-facing-docs-leave-claude-md.md (which carries the missing stop clause), 260827-0410_*_the-machine-written-event-rows-ship-with-wiring-asserts-only-because-the-hook-test-surface-is-full.md (the same surface, an earlier instance).
