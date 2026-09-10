Session 2's own additions do not fit the hook-test growth bound, and the plan does not say so

---

The plan's session 2 adds four steps of hook behaviour, each of which the same plan requires to be
tested. The hook test surface had **9 lines of head-room** at the session's start (23 266 budget =
20 766 floor + 2 500 head-room). B1 spent 150, B2 about 265, B3 241, and the suite now stands 232
lines over. B4 has not been written and has nothing to spend.

Reverting B3 restores green at 9 lines of head-room, which is the measurement that shows the
shortfall is structural rather than B3's: **a test file of zero lines would still leave B3 over**,
and B4 would still have 9 lines for a step that touches four readers and a renderer.

`hooks/lib/__tests__/helpers/growth-bound.ts` names three events at which a baseline moves and this
is none of them, so the number may not be raised. The plan's own step D3 re-baselines this surface,
but only under event 1, after the cut, and its verification requires the baseline diff to show
**only downward movement** — so D3 is not a home for this either.

The plan's `## Risks & Mitigations` table anticipates the C7 merge budgets and the head-room the cut
creates. It does not anticipate that session 2's additions collide with the existing bound on the
surface they land in, which is the one surface whose budget the cut does not pay: each surface has
its own, by construction, so removing prompt text at C1 buys the hook tests nothing.

One fact bears on every way out: `hooks/lib/__tests__/turn-budget-lint.test.ts` is 525 lines and its
subject, `bin/fusion-turn-budget` and `hooks/turn-budget.ts`, is deleted at step C1.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
Found when step B3 returned complete and verified with the suite red on this bound alone, 978 of 979
passing. B3's own report refused to move the baseline and returned the choice, which was correct.

**Acceptance test:** session 2's four steps are all committed with `cd hooks && npm test` green, and
the route taken is named in the plan so a later reader can tell a decision from a drift.

---
Reconciliation (260910-0620, reconciler, Turn 2): open, correctly filed. Verified the closing
sentence's inference was falsified by the coder's own follow-on issue
(`260910-0445_*_deleting-a-test-file-at-its-baseline-frees-no-head-room-so-the-turn-budget-cut-cannot-pay-the-bound.md`);
`npx vitest run surface-growth-bound` is green at HEAD `d7b701d2` (R1+R2 bought the head-room instead).
Fix part 1 of the cross-referenced issue (correct the closing sentence) is not yet done — the
sentence still stands as filed. Still open.
