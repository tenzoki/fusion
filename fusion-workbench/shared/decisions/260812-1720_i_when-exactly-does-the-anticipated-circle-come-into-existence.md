# When exactly does the anticipated Circle come into existence — before the shaper's first question, or before its first write?

---
**Domain:** code
**Status:** implemented
**Filed by:** planner
**Cross-references:** `260812-0254_*_where-do-a-circles-spec-and-plan-belong-when-the-circle-exists-before-them.md` (the answered decision this refines); `260812-1720_*_circle-first-placement-and-the-backlog-store.md` step 8; `agents/shaper.md` mode 4 (anticipated-circle); `skills/direct/SKILL.md`

---

## Question

The answered placement decision says: *"A Circle exists as anticipated before the shaper runs,
and shaper and planner work inside it."* Implementing that requires fixing one thing the sentence
leaves open — the moment of creation — because the Circle's directory name is derived from a slug
and the slug is derived from a Directive that clarification is there to sharpen.

The shaper's anticipated-circle mode today derives the slug from the **refined** Directive, after
clarification, and creates the Circle as its last act. Moving creation earlier is the whole point
of the decision. But "earlier" has two defensible positions, and they produce different
directory names for the same idea.

## Options

1. **Before the first question — the literal reading of "before the shaper runs."** `/fusion:direct`
   (or the promoting surface) creates the Circle directory and an `_a_circle.md` skeleton, then
   dispatches the shaper with the directory as a target. The shaper resolves its paths once, at
   Setup, exactly as every other agent does.
   - Pros: one resolution per run, no exception to "resolve once at Setup". The Circle exists
     before the shaper is even dispatched, which is unambiguous.
   - Cons: the slug comes from the raw draft, so a Circle named from a half-formed sentence keeps
     that name for its whole life — and the directory name is deliberately immutable, so there is
     no correcting it later. A clarification that concludes "this is not a Circle" leaves an empty
     directory behind, and deleting it is the one recovery that touches a Circle directory.
2. **Before the first write.** Clarification rounds produce no files, so the shaper asks its first
   round, then creates the Circle as its first write, then re-resolves its paths against it, then
   writes everything else inside it. Where round 1 itself would file a deferred decision, the
   Circle is created first and that record lands inside it too. One rule: *nothing this mode
   writes ever lands outside the Circle.*
   - Pros: the slug comes from a Directive that has survived one round of questions. No empty
     directory is ever created, because the Circle is created only once something needs a home.
     The Origin Rule is satisfied exactly — every artifact's origin genuinely is this Circle.
   - Cons: the shaper resolves its paths twice in one run, which is an exception to the
     conventions' "resolve once at Setup, use the values for the rest of the session". The
     exception has to be written into the rule text or it reads as drift the next time someone
     audits it.
3. **Before the first write, and the directory name is allowed one rename** before anything cites
   it.
   - Cons: it chips the invariant that a Circle directory name never changes, which is what makes
     every reference into a Circle valid for its whole life and is the immutable natural key the
     Plane mirror depends on. Buying a better slug with that invariant is a bad trade, and the
     "before anything cites it" window is exactly the kind of condition that is true until it is
     not.

## Constraints

- The Circle directory name is immutable for the Circle's whole life
  (`rules/circle-records.md` `## State Markers — circles`). Whatever produces the slug produces
  it once.
- No option may add a writer to the `.active-circle` enumeration. None of the three does — an
  anticipated Circle is not active.
- The answer must be one rule with no per-case branches, per `rules/critical-stance.md` §4.

## Recommendation

Option 2. The plan filed alongside this record is written for it, and step 8 names it. The cost
is one documented exception in one place, and the exception is genuinely conditional on a fact —
a consumer that *creates* a Circle re-resolves immediately after creating it — rather than on
judgement. Option 1 buys a cleaner resolution story with a permanently worse directory name for
every Circle fusion ever creates, and the name is the thing that cannot be fixed afterwards.

If the user prefers option 1, step 8 of the plan changes and step 3's exception paragraph is
dropped; nothing else in the plan moves.

---
Answered:
Implemented:
Deferred:
Superseded by:

---

## Answer, 260812-1745, by the user

**Option 2: before the first write.** The shaper asks its first round of questions, creates the
Circle as its first write, re-resolves its paths against it, and everything it writes thereafter
lands inside. One rule, no per-case branch: *nothing this mode writes ever lands outside the
Circle.*

Two consequences accepted with it. The directory name comes from a Directive that has survived one
round of clarification, which is the whole reason for not taking the literal reading — the name is
immutable and a Circle named from a half-formed sentence carries that name for life. And the
shaper resolves its paths twice in one run, which is a real exception to "resolve once at Setup".
That exception is **conditional on a fact rather than on judgement** — a consumer that *creates* a
Circle re-resolves immediately after creating it — and it must be written into the rule text, or
the next audit reads it as drift.

No empty directory is ever created, because the Circle comes into existence only when something
needs a home.

---
Answered: this record `## Answer, 260812-1745` — the Circle is created at the shaper's first write,
after one round of clarification, and the resolver exception is written into the rule text.
Implemented: `3c6ec4e` and `406ec0d` — `rules/fusion-workbench-conventions.md` `## Path Resolution`
→ *Where the call belongs* carries the one permitted second resolution (a consumer that **creates**
a Circle re-resolves immediately after creating it) with its reason beside it, and `agents/shaper.md`
mode 4 creates the Circle as its first write, re-resolves against it, and writes everything
thereafter inside it.
