The declined second-order cut is declined on a reason the same commit made false

---

`620e737` repaired the previous review's High finding by moving the `[ -x ]` guard rationale into
`bin/fusion-source-root`'s header. In the same commit it **declined** the second-order cut the review
suggested — dropping the surviving paragraph at `skills/setup/SKILL.md:32` and `skills/next/SKILL.md:33`
— and the reason it gave for declining is false in both of its halves, one of them falsified by the
commit's own change.

---

**The stated reason.** From the commit message, and repeated in the closure note of
`shared/issues/260822-1421_c_two-skill-bodies-lost-the-x-guard-rationale-to-a-header-that-does-not-carry-it.md`:

> Each surviving paragraph in setup and next opens by naming a call site inside its own body and then
> describes that body's own three-branch block. A helper header cannot author that: it is caller code,
> not helper code.

**Half one is false for `next`.** `skills/setup/SKILL.md:32` opens *"The `[ -x ]` guard is the one
Step 3's domain detection carries"* — Step 3 is in that body, so the claim holds there.
`skills/next/SKILL.md:33` opens *"The `[ -x ]` guard is the one the orchestrator's Setup carries
around every `bin/` helper"*. That names `agents/orchestrator.md`, not a call site inside
`skills/next/SKILL.md`. The body says so itself at `:27`: *"the one executable check in this file
calls the helper again"* — `next` has exactly one guarded call, the source-root one at the top, so it
has no own second call site to name and points outside itself instead. The closure note's own wording
(*"`next` the orchestrator's Setup"*) records this without treating it as a departure.

**Half two is falsified by the same commit.** The two sentences that follow the opening clause are:

> The absent branch falls to `$FUSION_PLUGIN_ROOT`, which is the behaviour that preceded the helper,
> and says so on stderr rather than resolving in silence. An unset `FUSION_PLUGIN_ROOT` does not fall
> anywhere, because there is nothing to fall to, and it is the branch that prints `UNRESOLVED`.

`bin/fusion-source-root:52-56`, added by `620e737`, now says:

> The absent branch falls back to the install root, which is the behaviour that preceded this helper,
> and says so on stderr rather than resolving in silence. An unset FUSION_PLUGIN_ROOT does not fall
> back anywhere, because there is nothing to fall to, and it is the branch a caller reports as
> UNRESOLVED.

Two sentences, same order, same claims, near-identical wording. The header does author it. So the
reason "a helper header cannot author that" was written in a commit whose own diff had just authored
it, four lines further up the same paragraph. The first half of the paragraph is duplicated too:
*"a helper added to the plugin's work tree between releases is simply absent from an older install,
and a bare call is exit 127"* is `bin/fusion-source-root:50-52` verbatim in substance.

**And the "own three-branch block" is not own.** The first `bash` block is byte-identical in all four
bodies — `setup`, `next`, `cleanup`, `help`. `cleanup` and `help` carry that identical block with no
describing paragraph at all, only the pointer, which is the direct demonstration that the header is
sufficient for it.

**Cost.** Each surviving paragraph is about 460 bytes, ~920 across the two files, on `skills/*/SKILL.md`,
which is one of the four bounded surfaces this Circle exists to buy room on. The Circle's own clause is
that every cut carries either a home that holds the claim or a stated reason the text is not
load-bearing; here the home does hold the claim and the stated reason does not.

**What is not claimed.** Nothing behaves differently. The guard is in every block it was in before,
and the header repair itself is correct: it states all three claims the removed sentence carried.

---

**Found by:** coderev, reviewing `c2ad89c..6781814`, review file
`shared/reviews/260822-1506-coderev-the-guard-rationale-repair-and-the-capped-help-topic.md`.
**Owner:** `coder`.
**Severity:** Medium.
**Affects:** `skills/setup/SKILL.md:32`, `skills/next/SKILL.md:33`, `bin/fusion-source-root:46-56`.
**Filed in the shared store:** no Circle is active.
**Cross-references:**
`shared/issues/260822-1421_c_two-skill-bodies-lost-the-x-guard-rationale-to-a-header-that-does-not-carry-it.md`
(the repaired record, whose `Resolved:` note carries the same reasoning);
`shared/reviews/260822-1421-coderev-c0-cut-only-circle.md` (the High finding, which proposed exactly
this second-order cut).

**The fix, and the decision inside it.** Two paths, and the difference is what the opening clause is
worth:

1. **Cut the paragraph's tail from both bodies, keep one clause.** Leave `setup:32` as a single
   sentence naming its own second call site (Step 3's domain detection) and pointing at the header
   for the rest; `next:33` has no own second site, so it can drop the paragraph outright. Saves
   roughly 800 bytes on the bounded surface.
2. **Keep both paragraphs and correct the record.** If the duplication is wanted, then the closure
   note and the commit message state a reason that is not the reason, and the record should say the
   real one instead — that a reader pasting the block should not have to open a helper header to
   learn what the branch does.

Whichever is taken, `next:33`'s opening clause should stop describing `agents/orchestrator.md` as
this body's own call site.
