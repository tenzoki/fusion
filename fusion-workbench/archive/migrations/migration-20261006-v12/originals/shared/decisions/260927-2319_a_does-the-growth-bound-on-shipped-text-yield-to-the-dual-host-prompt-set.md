# Does the growth bound on shipped text yield to the dual-host prompt set?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260927-2304-fusion-dual-host-design-review.md, 260822-1102_*_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md, 260905-1810_*_does-a-growth-bound-re-baseline-after-a-merge-of-two-lines-that-were-each-inside-it.md

---

## Question

`README-hooks.md` `### Growth bounds on the shipped text` bounds how much `agents/*.md`, `skills/*/SKILL.md`, the rule corpus and the hook tests may grow, and charges `CLAUDE.md` to every dispatch path at zero head-room. The dual-host implementation plan (Prior, `docs/design/fusion-dual-host-implementation-plan.md`, FH03) adds five agent prompts and two review profiles. The review (`260927-2304-fusion-dual-host-design-review.md` `## Recommendation` item 4) measured that they do not fit: 18 000 bytes of head-room on `agents/`, the smallest existing prompt at 12 255 bytes, and the dispatch-path bound at zero. `CLAUDE.md` `## Conventions` says the way out of a red bound is a cut, never an edit to a baseline. Three agent merges were already stopped on this bound. The question is whether the bound stops the dual-host work, and if not, by which of the instrument's own moves it yields.

## Options

1. **The bound yields.** The work lands; the bound is adjusted for it through the move `hooks/lib/__tests__/helpers/growth-bound.ts` already names for exactly this case, a head-room raise on a ruling ("when a ruling lets work land that a bound would otherwise stop, raise `headRoom` and leave every baseline untouched"), logged with the figure before and after. Where a raise does not suffice, the surface is restructured so that the added text is not on a bounded surface, and as the last resort the bound is removed. Which of the three is a plan's question, taken at the measured figures when FH03 is planned.
   - Pros: the instrument's own text already provides the move; every baseline stays, so growth stays readable; the work is not blocked on a cut nobody has scoped.
   - Cons: a raise is the "we need room" answer the instrument was built to refuse; the earlier ruling (`260822-1102`) chose a cut first.
2. **The bound stands; a cut-only work package runs first.** As ruled on 2026-08-22 for the multi-user rebuild.
   - Pros: the bound keeps its meaning without exception.
   - Cons: the user states the bound has been in the way throughout; the size of the cut is unknown and five prompts are not paid for by any plausible cut.

## Constraints

- No baseline moves outside the three events named in `growth-bound.ts`; a head-room raise moves none, and is logged in `README-hooks.md` with the figure before and after.
- The measure is chosen against figures measured at the time, not against the review's numbers.
- The dispatch-path bound's gap for a consuming project's `CLAUDE.md` is unchanged by this ruling.

## Recommendation

Option 1, which is what the user ruled.

---
Answered: this record `## Options` option 1 — the growth bound does not stop the dual-host work; it is adjusted, first by the head-room raise the instrument names, otherwise by restructuring, and removed only as the last resort; the concrete measure is decided in the plan for FH03 at measured figures; ruled by user, Kai Stalmann <ks@qantr.com>.
