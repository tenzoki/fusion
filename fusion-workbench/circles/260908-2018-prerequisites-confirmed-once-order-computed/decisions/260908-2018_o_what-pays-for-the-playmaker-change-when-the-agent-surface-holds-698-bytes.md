# What pays for the playmaker's change when the agent surface holds 698 bytes?

---
**Domain:** code
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`260822-1102_*_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md`
(the same question, asked by the multi-user rebuild, answered option 1);
`hooks/lib/__tests__/surface-growth-bound.test.ts` (the three surface budgets);
`hooks/lib/__tests__/helpers/growth-bound.ts` (the three re-baselining moments and the refusal of a
fourth).

---

## Question

The Directive requires one consumer inside an agent prompt: the recommendation of what to work on
next must read the computed figures instead of weighing prose signals. Measured at `de94102f`,
`agents/*.md` holds **698 bytes** of head-room against its baseline map. A sentence instructing
`agents/playmaker.md` to call `bin/fusion-order` under an `[ -x ]` guard, to read its figures, and
to say what happens when the helper is absent, is plausibly 300 to 700 bytes. It may fit and it may
not, and nobody can know until the sentence is written.

The question has to be answered before the first prompt edit rather than at the moment the suite
turns red, because the answer changes what the plan looks like. It is the same question
`260822-1102` asked for a different Circle, and that record's answer does not transfer: it bought
room with a cut-only Circle whose test was four specific open defects, and those defects are closed.

## Options

1. **Write the sentence first and measure it, then decide.** The plan's first step is the prompt
   edit and its measurement; the remaining options are opened only if it does not fit.
   - Pros: the question may be moot, and answering a moot question costs a gate. The measurement is
     one command.
   - Cons: it defers the answer into the plan, which is where `260822-1102` says an unanswered
     precondition fails on arrival. If it does not fit, the plan is rewritten at step one.
2. **Pay for it with a cut in `agents/playmaker.md` in the same commit.** The prompt gains the call
   and loses an equal weight of text somewhere in its own body.
   - Pros: no baseline moves, no separate Circle, and the trade is priced where a human can refuse
     it. `agents/playmaker.md` carries a ranking step with no stated arithmetic, and this Circle
     supplies the arithmetic, so a cut there is not unrelated text.
   - Cons: this Circle then also becomes an edit to the ranking prose, in text it has no other
     reason to touch beyond the byte count.
3. **Drop the ranker consumer from this Circle and ship only the on-demand command.** The user
   answered that both consumers are wanted; this option keeps the second and defers the first to a
   Circle that has room.
   - Pros: the Circle spends nothing on the tightest surface, and the helper is provable on its own.
   - Cons: it delivers the reporting half without the half that changes what fusion does by itself,
     which is the half the consultation identified as the integral embedding.

## Constraints

- No baseline may move outside the three moments `growth-bound.ts` names, and a Circle wanting room
  is not one of them.
- The four budgets are independent: shrinking `skills/*/SKILL.md` or the hook tests buys
  `agents/*.md` nothing.
- Whatever is chosen has to be checkable by the same command that measures the bound.
- The 698 bytes will have moved by the time the plan runs, and any answer has to survive being
  re-measured then rather than resting on this record's figure.

## Recommendation

Option 1, and only because the measurement is a single command whose cost is far below a gate. The
plan's first step writes the sentence and measures the surface, and the plan carries options 2 and 3
as its named branches rather than discovering them. That is not a deferral of this question: it is
an answer that says the input needed to choose between 2 and 3 does not exist yet and is cheap to
obtain.
