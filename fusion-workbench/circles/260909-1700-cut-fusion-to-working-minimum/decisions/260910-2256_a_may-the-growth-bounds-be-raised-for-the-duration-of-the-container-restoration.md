# May the growth bounds be raised for the duration of the container restoration?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260910-2145_*_restore-the-per-work-item-container.md; 9b792042 (S1); f50b9aa4 (S2); hooks/lib/__tests__/helpers/growth-bound.ts

---

## Question

After two of the plan's eleven steps the two binding budgets are nearly closed: the tightest dispatch path has 44 bytes of head-room and the hook-test surface has 41 lines. Seven steps remain, several of which add resolver cases and rule text. The plan's own instruction, and the instrument's, is that a red bound is answered by a cut and never by moving a baseline, with a baseline moving at exactly two written-down moments — after a cleanup, or at a one-time arming.

Neither moment applies here, so the question is whether the restoration proceeds under the standing rule or the rule is suspended for it.

## Options

1. **Hold the rule.** Every step funds its own additions from a cut in the same commit, or lands without them and defers to D3, where the four baselines move anyway.
   - Pros: the instrument keeps measuring for the whole restoration, which is when the additions actually happen.
   - Cons: seven steps against 44 bytes and 41 lines means most of them stop or defer, and the deferral pile is itself unmeasured.
2. **Raise the bounds as needed, attempt a reduction afterwards.**
   - Pros: the restoration lands as designed, and the ruling that produced it was a correctness ruling rather than a cost one.
   - Cons: the instrument stops measuring precisely while the additions are made, and the reduction is a promise rather than a mechanism.
3. **Raise them by a fixed amount decided now.**
   - Pros: bounded, and the instrument keeps measuring against the new figure.
   - Cons: the figure would be invented, and nothing in the plan predicts the remaining seven steps' size well enough to pick one.

## Constraints

`hooks/lib/__tests__/helpers/growth-bound.ts` authors the rule the options depart from, and its own history is the argument against option 2: the 2026-08-27 cut lasted thirteen days because its baseline was armed at the cut, which is the same shape as raising a baseline to fit the change being measured.

## Recommendation

Option 1 while it is affordable, then option 2 named per step. The recommendation is superseded by the ruling below.

---
Answered: 260910-0900-orchestrator-session.md `## Ruling on the growth bounds` — option 2. The user's words: the budgets are raised for now as far as needed, and a reduction is attempted afterwards. Ruled by user, Kai Stalmann <ks@qantr.com>.

The residual is recorded rather than argued away. The instrument stops measuring during exactly the work it exists to measure, and this project has one instance on record of that shape lasting thirteen days. What makes the reduction checkable rather than a promise: the pre-raise figures are copied into this commit as the two fixture files at `9b792042..f50b9aa4`, every raise is written into its own step's commit message with the figure before and after, and the reduction is read on **2026-10-10**, the same date step C6's deferred measurement already carries, so one reading answers both.

Two things this ruling does not license, and no later reader should take from it. A baseline is still never edited to make a red bound pass *silently* — every raise names itself in the commit that makes it. And the always-on floor is still the surface eleven agents pay on every dispatch, so a raise there is a per-dispatch cost the ruling permits rather than a cost it abolishes.
