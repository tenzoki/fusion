The stub guard holds only for a section that is *nothing but* the stub, and the closure claims otherwise

---

`260819-0039_c_the-new-plan-section-is-neither-mandatory-nor-guarded-against-the-unfilled-template-stub.md`
closed with:

> adding "the section is empty or still holds only its angle-bracket placeholder" to the do-nothing
> branch, **so a stub is never read aloud as a clause**.

The clause added is a whole-section test. A section holding one real clause *and* the leftover
placeholder does not match it, falls to *Otherwise*, and the placeholder is read aloud to the user
as a clause. The guarantee is narrower than the sentence stating it.

---

`agents/orchestrator.md:864`, Phase 4 step 2b:

> If no plan is in scope, if the plan carries no such section, or if the section is empty or still
> holds **only** its angle-bracket placeholder, do nothing and go to step 3 — no question is put to
> the user. Otherwise read the section's clauses aloud, one at a time, and ask whether each holds.

**The split itself is sound.** Two branches, one disjunctive antecedent, `Otherwise` for the rest —
disjoint and complete in the sense `rules/critical-stance.md` §4 requires, and the three
do-nothing sub-conditions reaching one action makes their mutual overlap harmless. Nothing to fix in
the shape.

**The residual is the partially-filled section.** `agents/planner.md:133` ships the section as a
single angle-bracket paragraph:

> `<The conditions under which this Circle is finished, and any precondition a later act — a release,
> a tag, a closure — must satisfy first. One clause per condition, each answerable yes or no.>`

A writer who replaces it wholesale leaves nothing behind and the guard fires. A writer who *appends*
a first clause and leaves the paragraph above it produces a section that is not empty and is not
"only" the placeholder — and the placeholder text, which reads as an instruction to the plan's
author, is then put to the user as a stop condition to answer yes or no.

**Why it is worth recording rather than shrugging at.** The record this closed was filed on exactly
this class, and cited the measured precedent in this repository: twelve decision records keeping the
unfilled template stub
(`260811-2146_c_half-the-decision-records-carry-a-status-that-disagrees-with-their-marker-and-twelve-keep-the-unfilled-template-stub.md`).
A half-filled section is the more likely shape of that failure than an untouched one, because the
author who touched the section at all is the author who left the rest.

Verified at HEAD `83488e9` by reading `agents/orchestrator.md:864` and `agents/planner.md:131-133`.

**Fix direction.** Two shapes, and the choice is small.
1. Change the clause from a whole-section test to a per-clause one: skip any clause that is wholly
   inside angle brackets, and put nothing to the user if that leaves none. Recognising `<…>` is a
   look at the text, not a parse — the same standing the closure claims for the existing test.
2. Leave the step and correct the closure sentence to state what it guarantees. Cheaper, and honest.

Found in the coderev pass over `5ec26b2..83488e9`, session `260818-2301`, Turn 2. No Circle active,
so it is filed in the shared store under the Origin Rule.

---
Resolved: fixed — shape 1: Phase 4 step 2b skips any clause wholly inside angle brackets and asks nothing when none is left; agents/orchestrator.md:918
