# Do the decision-record worked examples stay on the always-on floor?

---
**Domain:** code
**Filed by:** claude-code (direct session, Phase 3 of `refactor/260827-0335-bookkeeping-cost-repair-plan.md`), Kai Stalmann <ks@qantr.com>
**Cross-references:** `bin/fusion-rules` (the emission list this decides) · `rules/decision-record-examples.md` (the file whose audience moves) · `circles/260825-2023-presence-travels-monitor-filters-own-checkout/decisions/260826-1252_*_how-does-this-project-keep-a-cardinality-stated-in-prose-true-when-seven-passes-could-not.md` (the norm whose landing forced the choice)

---

## Question

Realising decision `260826-1252` puts critical-stance §5 (a cardinality is enumerated or derived, never asserted) on the always-on floor, where it must sit to reach every agent's every edit. Even at minimum phrasing the floor then stands 872 bytes past its hard 12,000-byte head-room — the set had grown to within ~50 bytes of its budget before this change (`fusion-workbench-conventions.md` alone +8,749 since the baseline). The bound's rule is a cut, never a baseline move. Where is the cut?

An audience change to the emission list "is a decision, and it may not happen silently" (`hooks/lib/__tests__/rules-emission-golden.test.ts`), which is why this is a record and a gate rather than an edit.

## Options

1. **`decision-record-examples.md` becomes a conditional emission** to the four agents that transition or plan decision transitions (orchestrator, shaper, playmaker, planner). The marker *vocabulary* stays always-on in the conventions; what leaves the floor is the tutorial (4,527 bytes), and a pointer at the template site is how every other agent reaches it on demand. Frees ~3,700 bytes beyond the immediate need.
2. **Cut ~900 bytes of prose** from the two largest growers (`fusion-workbench-conventions.md`, `user-facing-output.md`) by editorial judgement. No audience change, but cuts in text many reviews shaped, with revert risk.
3. **Keep §5 off the floor** — record and CLAUDE.md only. No cut needed, but the norm misses the agents at the moment they edit, which is most of its purpose.

## Answer (260827, user, at the gate)

**Option 1.** Realised in the same change set: the `emit_if_exists` line moves from the unindented always-on list into a `case` block for the transition agents (`bin/fusion-rules`, block 1b2 — orchestrator, shaper, playmaker, planner, and reconciler, whose act worked transition 1 is), the pointer lands at `rules/fusion-workbench-conventions.md` `## Decision Record Template`, and the role map in `rules-emission-golden.test.ts` gains the file as an extra for each. Realising it also removed the duplicate: the five worked transitions that stood in `rules/fusion-workbench-conventions.md` beside the marker table restated the examples file inside the always-on floor, and they collapse onto the authoring home — which is the growth cut the hard bound asked for. Every agent still files records: filing needs the vocabulary and the template, both of which stay always-on.
