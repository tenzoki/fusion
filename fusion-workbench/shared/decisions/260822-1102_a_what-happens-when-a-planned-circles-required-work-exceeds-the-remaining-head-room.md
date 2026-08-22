# What happens when a planned Circle's required work exceeds the remaining head-room on a bounded surface?

---
**Domain:** code
**Filed by:** shaper
**Cross-references:**
`circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260821-0414_*_does-a-corpus-repair-circle-carry-a-budget-for-what-its-own-new-clauses-may-spend.md`
(the sibling question, still open, and the reason this one is filed separately rather than folded in);
`hooks/lib/__tests__/helpers/growth-bound.ts` (the instrument and the two re-baselining moments);
`hooks/lib/__tests__/surface-growth-bound.test.ts` (the three surface budgets and their head-room figures);
`shared/decisions/260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md`
(the standing answer the multi-user work would overturn, and the work this question was raised by).

---

## Question

The multi-user rebuild now being shaped writes into three of the four bounded surfaces by
construction. Full attribution changes the record templates and every agent's filing path.
Partitioned session state changes `agents/orchestrator.md`, several skill bodies and the hook
tests that assert the current single-writer shape. Measured at HEAD on 2026-08-22, the remaining
head-room is **1 638 bytes** on `agents/*.md`, **30 bytes** on `skills/*/SKILL.md` and **12 lines**
on the hook test suite. Thirty bytes does not hold one sentence, and twelve lines does not hold one
test case.

So the surface bound is not merely a cost to be priced here. It is a precondition that fails before
the first step. Any spec that promises this work without saying how the room is obtained is
promising something the suite refuses on arrival, and the four defects already open against
`skills/setup/SKILL.md` and the hook tests are the standing evidence that this is not hypothetical.

The sibling record `260821-0414` asks whether a Circle carries a budget for what its own new clauses
may spend. That question presumes room exists and asks how much of it a Circle may take. This one
asks what a project does when the room is gone and the required work is not optional. Answering the
sibling one way or the other leaves this open, which is why it is filed rather than folded in.

## Options

1. **A cut-only Circle runs first, and the rebuild starts against the room it produces.** Its
   Directive is a reduction of the three surfaces, with the four already-open defects as its test:
   it has produced enough room when those four can be fixed.
   - Pros: the bound keeps its meaning without exception; the reduction is measurable by the same
     command that measures the bound; it clears work already blocked, so the room is bought by
     something with independent value.
   - Cons: it puts a whole Circle in front of the work the user actually asked for, and the size of
     the cut needed is unknown until somebody attempts it. If the surfaces cannot be cut far enough,
     this option has consumed a Circle and answered nothing.
2. **Each step of the rebuild pays for its own additions with a cut in the same surface, in the same
   commit.** No net growth anywhere; the ledger is per step and read at the step's own gate.
   - Pros: no separate Circle and no baseline movement; the trade is priced at the moment it is
     made, which is where a human can still refuse it.
   - Cons: it makes every step of the rebuild also a reduction task in text that step has no other
     reason to touch, which is how unrelated cuts get made under deadline pressure. The measured
     room is so small that the first step already faces this, so the cost is immediate rather than
     eventual.
3. **The user declares a third re-baselining moment, in writing, scoped to this rebuild.**
   `growth-bound.ts` fixes two moments a baseline moves and says a Circle wanting room is neither.
   A third would name this rebuild, state what it absolves as text, and expire with it.
   - Pros: honest about what is happening rather than dressing a raise as a cleanup; the instrument
     keeps working for every other surface and every later Circle.
   - Cons: it is the silent raise the helper was written to prevent, made loud. Once a third moment
     exists, the argument for a fourth is the argument for the third. The instrument's whole value is
     that the answer to "we need room" has so far been no.

## Constraints

- No answer may edit a baseline outside a moment that is written down first. `growth-bound.ts` fixes
  the two that exist, and its own text states that a Circle wanting room is not one of them.
- Whatever is chosen must be checkable by the same command that measures the bound, so that the
  claim "this Circle stayed inside its terms" is verified rather than asserted.
- The measured figures above are the starting point and will move. Any answer has to survive being
  re-measured at the moment the rebuild begins rather than resting on this record's numbers.

## Recommendation

None. The three options trade the instrument's credibility against the delivery of work the user has
asked for, and that trade is the user's. What the shaper can state is the fact that forces the
question: this rebuild cannot begin on any of the three bounded surfaces at the room now available,
so the answer has to precede the first implementation step rather than follow it.

---
Answered: shared/history/260822-1009-orchestrator-session.md — user decision at the Phase-0b
shaping gate, 260822: **Option 1, a cut-only Circle runs first.** The multi-user rebuild starts
against the room that Circle produces, and its own test is the four defects already open against
`skills/setup/SKILL.md` and the hook tests: it has produced enough room when those four can be
fixed. The user took this over paying per step (option 2) and over declaring a third re-baselining
moment (option 3), so no baseline moves and the instrument keeps its meaning.
Implemented:
Deferred:
Superseded by:
Retired:

---
**Reconciliation 260822-1556 (reconciler, domain `code`, HEAD `9f65463`) — marker held at `_a_`.
The answer's own stated test is met; the transition to `_i_` was considered and not taken.**

*What the tree shows.* Option 1's test was "it has produced enough room when those four defects can
be fixed". All four carry `_c_` and each fix was verified at its own site rather than from its note.
Head-room summed with each bound's own collector: `agents/*.md` 16 601 bytes, `skills/*/SKILL.md`
4 661, hook tests 302 lines, always-on rule core 3 509 unchanged. The four baseline maps are
byte-identical to `370bfc5` by diff, so the room was cut rather than absolved, which is the property
the user bought by rejecting options 2 and 3. Range `370bfc5..9f65463`, twelve commits.

*Why the marker does not move.* `_i_` is terminal, and the answer has a second half the tree cannot
yet show: "the multi-user rebuild starts against the room that Circle produces". C1 has not started,
and nothing in the range touches a record template, `.gitignore` or the event log. Renaming now
would assert a realisation that is half on disk. The transition belongs to whoever opens C1 against
this room; the citation is ready and is the range above.
