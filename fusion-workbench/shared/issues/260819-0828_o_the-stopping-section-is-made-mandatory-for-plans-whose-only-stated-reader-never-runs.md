The stopping section is made mandatory for plans whose only stated reader never runs

---

`agents/planner.md:160` now declares `## Where this Circle stops` mandatory and extends it to the
no-Circle case, in the same parenthesis that states its enforcement is the orchestrator's Phase 4
question. Phase 4 runs only when a Circle is being closed, so for the case just added there is no
reader, and the paragraph does not say so.

---

`agents/planner.md:160`, the sentence added at `06ab15b`:

> **`## Where this Circle stops` is mandatory and is never left as the angle-bracket placeholder**,
> the same standing `**Decidability:**` has; with no Circle active it says where this plan's own work
> stops. **Nothing reads it mechanically.** … Its whole enforcement is a human answering the
> orchestrator's question at Phase 4, which reads the section back clause by clause before the Circle
> closes

`agents/orchestrator.md:856`, the Phase 4 preamble:

> run this step if a Circle is being closed in this session. Otherwise (no `.active-circle`, or a
> Rebalance branch that continues the Circle), **skip cleanly**.

So a plan written with no Circle active carries a mandatory section, and the only mechanism the
paragraph names for it is unreachable by construction. The two halves of the same sentence
contradict each other for exactly the population the first half was widened to cover.

**Why this is the review's own finding coming back one step further on.** The Turn-1 review raised the
scope question — "the heading says 'this Circle' and the format is used for plans written with no
Circle active" — as a rider on M4. The fix answered the *wording* (what the section means with no
Circle) and did not touch the *enforcement* (who reads it then). The mandate grew; the reader did not.

**This is not an argument for building one.** `260817-1613` answered option 2 with option 1's
honesty, and `rules/critical-stance.md` §4 is explicit that a question undecidable from the inputs a
mechanism has does not get an approximation. The honest move is to say what holds: for a plan with no
Circle in scope the section is written for the human reading the plan, and nothing reads it back.

Verified at HEAD `83488e9` by reading `agents/planner.md:157-160` and `agents/orchestrator.md:854-870`.

**Fix direction.** One clause in `agents/planner.md`'s parenthesis: name Phase 4 as the reader for a
Circle-scoped plan and say that a plan with no Circle in scope has no automated reader at all, so the
section stands on being read by whoever opens the plan. Costs a line and removes a contradiction; it
does not weaken the mandate, which was never mechanical.

Found in the coderev pass over `5ec26b2..83488e9`, session `260818-2301`, Turn 2. No Circle active,
so it is filed in the shared store under the Origin Rule.
