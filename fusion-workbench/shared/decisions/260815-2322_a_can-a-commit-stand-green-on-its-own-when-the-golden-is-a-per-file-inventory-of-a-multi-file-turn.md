# Can a commit stand green on its own when the golden is a per-file inventory?

---
**Domain:** code
**Status:** answered
**Filed by:** orchestrator
**Cross-references:** hooks/lib/__tests__/surface-growth-bound.test.ts (`## Updating the golden`), hooks/lib/__tests__/fixtures/surface-growth.golden, hooks/lib/__tests__/helpers/growth-bound.ts, shared/history/260815-2147-orchestrator-session.md (`## Turn 1 — a finding that changed the session's rhythm`)

---

## Question

`hooks/lib/__tests__/fixtures/surface-growth.golden` records the byte size of **every file** on
the four growth-bounded surfaces. Any edit to any one of them makes the fixture stale, and the
assertion that compares live measurement against it fails until the fixture is regenerated.

Regeneration is deliberately a separate, flag-guarded operation that fails on purpose to force a
second run. That design is right for its own purpose: it stops a regeneration from ever being
green and makes a growth event something a human reads in a diff.

The consequence nobody has decided about appears when **one Turn changes several bounded files in
several commits**, which is the ordinary shape of an autonomous defect-fixing session. Whatever
order the commits take, the golden can be correct for at most one of them. Measured in this
session: Turn 1 landed four commits, and the regenerated golden rode the commit whose task caused
the byte change, which left the other three carrying a fixture that does not describe the tree at
that commit. Turn 2 has three concurrent tasks editing three bounded files, so at most one of its
commits can stand green alone.

Nothing is *broken* by this — the Turn as a whole is green, the bounds themselves pass throughout,
and no baseline moves. What is lost is the property that any single commit passes its own test
suite, which is what `git bisect` and a per-commit CI both assume.

## Options

1. **Accept it, and say so where the golden is defined.** State that the green unit is the Turn,
   not the commit, and that a bisect over a multi-task Turn will land on commits failing only the
   golden inventory assertion.
   - Pros: no mechanism changes. Honest about a property the design already has.
   - Cons: a reader running the suite at an arbitrary commit meets a failure that means nothing,
     and has to know this rule to dismiss it. The failure text does not currently say it.
2. **Regenerate and stage the golden with every commit that touches a bounded file.** The
   orchestrator would run the regeneration before each commit rather than once per Turn.
   - Pros: every commit stands green alone. No design change to the test.
   - Cons: the regeneration is flag-guarded precisely so it is deliberate and rare; making it
     per-commit routine defeats the reason it fails on purpose. A human reads one diff per Turn
     today and would read one per commit instead, which is how a review becomes a rubber stamp.
3. **Make the assertion range over surface totals rather than per-file sizes**, keeping the
   per-file inventory as data the failure text prints but not as the thing asserted.
   - Pros: a commit that moves bytes within a surface without changing its total stays green, and
     the assertion still catches every real growth event.
   - Cons: loses the property that the fixture diff names the file that grew, which is most of its
     diagnostic value. Two files moving in opposite directions by the same amount would pass.

## Constraints

- Whatever is chosen must not move a baseline or weaken a bound. The bounds are the mechanism;
  the golden is the instrument that shows where the growth went.
- The regeneration must stay unable to be left switched on.
- Any answer has to work for a Turn dispatching several executors concurrently on disjoint files,
  because that is how this session and every autonomous session runs.

## Recommendation

Option 1, with the failure text carrying the sentence. The property is real and the cost of
option 2 is the reason the flag guard exists. What is missing today is not a mechanism but a
sentence: the golden's failure message should say that a stale inventory in the middle of a
multi-commit Turn is expected and names the regeneration as a Turn-end act. Every executor in this
session reported the same failure and each had to be told separately, in its dispatch, that it was
not theirs — which is the cost being paid right now, once per dispatch.

---
Answered: shared/history/260816-1500-orchestrator-session.md `## Decisions answered by the user` — option 1: the green unit is the Turn, and the golden's failure text carries the sentence. User answered inline 2026-08-16.
Implemented: <set when status moves to _i_>
Deferred: <set when status moves to _d_>
Superseded by: <set when status moves to _s_>
Retired: <set when the implementation is removed; the marker stays _i_>
