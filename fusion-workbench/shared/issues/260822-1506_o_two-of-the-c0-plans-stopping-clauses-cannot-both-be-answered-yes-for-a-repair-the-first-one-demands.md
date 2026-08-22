Two of the C0 plan's stopping clauses cannot both be answered yes for a repair the first one demands

---

`shared/planning/260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`
`## Where this Circle stops` carries these two clauses back to back (`:180` and `:181`):

> - Every cut that landed carries, in the ledger or in its step report, either a named authoring home
>   that now holds the claim or a stated reason the text is not load-bearing. A cut that carries
>   neither is not a cut this Circle may make, and its presence stops the Circle even if every byte
>   target is met.
> - Nothing was added to any of the four bounded surfaces beyond the four defect fixes. A cut Circle
>   that also lands a feature has spent the room it bought, and that stops the Circle whatever the
>   final measurement says.

`620e737` is the case where they meet. The first clause was tripped by a real cut and demanded a
repair; the repair added bytes to a bounded surface, and the second clause admits only the four defect
fixes as additions.

---

**What actually happened.** The previous review's High finding
(`shared/issues/260822-1421_c_two-skill-bodies-lost-the-x-guard-rationale-to-a-header-that-does-not-carry-it.md`)
was clause `:180` firing: a cut in `c2ad89c` moved a claim to a home that did not hold it. `620e737`
repaired it, and the repair widened the replacement pointer in two bodies:

> **Why the branch, and why it is a call:** → **Why the branch, why it is a call, and why the call is guarded:**

`+25` bytes each in `skills/cleanup/SKILL.md:29` and `skills/help/SKILL.md:31`, `+50` on
`skills/*/SKILL.md`. That is an addition to a bounded surface and it is not one of the four defect
fixes: it is a review-finding repair, which the clause's enumeration does not have a slot for.

**Why this is a defect in the clauses and not in the commit.** The repair was correct and was required
by the clause above it. The Circle cannot both satisfy `:180`, which demands the repair, and answer
`:181` yes under its literal reading, which forbids the bytes the repair costs. Since v10.3 the
orchestrator reads these clauses back to the user at closure and asks whether each holds
(`docs/upgrading-to-v10-3.md`), so this is not an abstract tension — somebody has to answer `:181`
out loud, and the honest answer today is "no, by 50 bytes, for a reason clause `:180` required."

**Magnitude, stated so nobody over-reads this.** 50 bytes against 4 016 of head-room. Nothing is at
risk; the suite is green and no bound is near. The defect is that a stopping clause has no true answer,
not that the Circle overspent.

---

**Found by:** coderev, reviewing `c2ad89c..6781814`, review file
`shared/reviews/260822-1506-coderev-the-guard-rationale-repair-and-the-capped-help-topic.md`.
**Owner:** `coder`.
**Severity:** Low.
**Affects:** `shared/planning/260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md:180-181`.
**Filed in the shared store:** no Circle is active.
**Cross-references:**
`shared/issues/260822-1421_c_two-skill-bodies-lost-the-x-guard-rationale-to-a-header-that-does-not-carry-it.md`
(the repair the tension is about);
`shared/issues/260822-1228_*_plan-step-8-asks-for-a-closure-that-was-already-made-and-the-record-already-carries-the-note.md`
(a different defect in the same plan, already open).

**The fix.** Widen clause `:181`'s enumeration by one category rather than raising a number: *"beyond
the four defect fixes and any repair a review finding under the clause above required"*. That keeps the
clause's teeth — a feature is still forbidden — and makes it answerable. Editing a live plan's stopping
section is permitted; `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` judges presence only, so
the edit cannot redden the suite. It costs nothing against any bounded surface: the plan is a workbench
record.
