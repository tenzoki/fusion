Does a Circle that repairs the always-on corpus carry a budget for what its own new clauses may spend?

---
**Domain:** code
**Filed by:** reconciler
**Cross-references:**
`circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2324_*_plan-style-rules-arrive-and-get-measured.md`
(`## Risks & Mitigations`, the always-on row, and `## Where this Circle stops`, which names no
byte figure in any of its eight clauses);
`circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0350-coder-the-final-state-is-measured.md`
(the measured outcome); `hooks/lib/__tests__/helpers/growth-bound.ts` (the instrument and the
re-baselining rule); `shared/issues/260816-0740_*_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md`
(the record the repair half serves).

---

## Question

This Circle repaired the always-on rule corpus and grew it. Measured over `7135a19..247abfe`, the
repunctuation returned **470 bytes** across four files and the Circle's new clauses spent **2 608**,
for a net **+2 138** on the five plugin rule files (+2 265 on the six `bin/fusion-rules coder`
emits). The spend is 5.5 times the return, on a corpus whose stated problem is that every byte of it
rides on every dispatch of every agent.

Nothing about that is hidden or unlicensed. Directive outcome 3 asks `rules/user-facing-output.md`
to state a test it did not state, and a test that is stated costs bytes; step 3's mechanism costs a
layout row. What is absent is a **bound**. The Directive names four outcomes and no cost. The plan's
eight stopping clauses name no byte figure. The one place the growth appears before the fact is a
`## Risks & Mitigations` row, which predicts the 470-byte return correctly, names a fallback cut,
and does not budget the spend at all. The fallback was never triggered, because head-room absorbed
the spend, so nothing forced the question to be asked.

It must be answered now rather than later because the head-room that absorbed it is nearly gone. At
HEAD the four budgets stand at 3 566 bytes (always-on), 1 638 (`agents/`), **30** (`skills/`) and
**32 lines** (hook tests). Two of the Circle's own open issues,
`260821-0302` and `260821-0148`, both write into `skills/setup/SKILL.md`, and either turns the
suite red on arrival. The next Circle inherits a tree where the ordinary act of fixing a filed defect
is blocked.

## Options

1. **Nothing changes; the growth bound is the only budget and it did its job.** The four bounds are
   the instrument this project already chose, they were green throughout, and no baseline moved.
   - Pros: no new obligation, no new artifact, no second budget to keep coherent with the first.
   - Cons: a bound that measures the rate of addition cannot distinguish a clause that pays for
     itself from one that does not, and it says nothing until the surface is nearly full. It was
     nearly full at the end of this Circle and silent for all of it.
2. **A repair Circle states its own net target in its Directive or its stopping section.** One
   clause: "the corpus ends at or below the bytes it started at", or "at or below start plus N",
   with N named before the work.
   - Pros: answerable yes or no by one command, which is the form
     `## Where this Circle stops` already requires. Forces the trade to be priced when it is still
     cheap to choose a shorter clause.
   - Cons: a target set before the wording is written is a guess, and a Circle that meets it by
     writing a worse sentence has met nothing. Risks trading register for arithmetic, which is the
     inverse of this Circle's Directive.
3. **The spend is attributed per clause and reported at the gate, with no target.** Each step that
   adds always-on prose reports its byte cost against the remaining head-room, which steps 13, 14 and
   17 already did, and the Circle's closure note carries the ledger.
   - Pros: costs nothing new, since the practice already exists; makes the trade visible at the
     moment a human can still refuse it.
   - Cons: reporting is what happened here, and it did not stop 2 608 bytes from landing against 470
     returned. A ledger nobody is obliged to act on is a ledger.
4. **A repair Circle may not add prose to the surface it repairs.** New clauses go in a separate
   Circle with its own Directive.
   - Pros: keeps the repair's evidence clean, which is this Circle's own argument for one file per
     commit.
   - Cons: this Circle's Directive names both, deliberately, because the opening-sentence test is
     the fix for the defect the register repair only treats symptomatically. Splitting them would
     have shipped the repair without the reason for it.

## Constraints

- No answer may license editing a growth-bound baseline. `hooks/lib/__tests__/helpers/growth-bound.ts`
  fixes the two moments a baseline moves, and neither is "a Circle wanted room".
- No answer may weaken `rules/user-facing-output.md`. The clauses this Circle added are the fix for
  a filed defect, and a byte target that removes them re-opens it.
- Whatever is chosen has to be checkable by one command at a Circle's stopping gate, in the form the
  seven other clauses of that section already take.

## Recommendation

Option 3, strengthened by the one thing it lacks: the ledger goes into `## Where this Circle stops`
as a clause rather than into the closure note, so it is read at the gate that decides whether the
Circle may close rather than after it. That keeps the wording free, which constraint 2 requires, and
still puts a number in front of a human before the marker moves. Option 2's fixed target is the
tempting answer and is the one that trades register for arithmetic; this Circle's whole subject is
that the register is what conditions the output, so a rule that buys bytes with worse sentences is
self-defeating.

This is a recommendation and not an answer. It is filed open because it is a change to how a Circle
is bounded, which is the user's to decide.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:
