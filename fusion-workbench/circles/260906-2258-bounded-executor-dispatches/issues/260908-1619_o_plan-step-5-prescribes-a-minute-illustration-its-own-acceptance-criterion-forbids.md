Plan step 5 prescribes a minute illustration that its own acceptance criterion forbids

---
`260907-1450_*_plan-bounded-executor-dispatches.md` `### 5. Write rules/bounded-dispatch.md` states two
things that cannot both be satisfied. Its `## When you read the clock.` bullet prescribes the sentence
*"an agent that enters a 30-minute unit at minute 19 returns at minute 49"*. Its **Acceptance criterion**
three bullets later requires that *nothing in the file states a number of minutes*, and its **Do not:**
line says the same in the imperative.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence path.** The two halves are in one section of one file, at `## Changes` bullet 3 and at
`**Acceptance criterion:**`. The specification's C2 carries the illustration in the same wording, so the
contradiction originates there and the plan inherited it.

**How it was resolved in the artifact, and by whom.** The coder executing step 5 met it, took the
acceptance criterion, and stated the overshoot residual without numerals: an agent that reads the clock
just short of its stopping time and then enters a unit longer than its whole bound returns well past
that time, with nothing bounding or measuring the overshoot. It reported the deviation rather than
resolving it silently. The orchestrator let that stand, for a reason the coder also gave: `minute 19`
silently encodes the current default of exactly the value step 14 exists to keep out of the prose, and
the numberless phrasing scales with whatever the bound is configured to.

**Why the record exists even though the artifact is right.** The plan and the specification still carry
both halves, so the next reader of either meets the same contradiction with no note that it was met
before. Step 14's lint will not catch it: that gate reads `agents/orchestrator.md` and
`skills/setup/SKILL.md`, and neither the plan, the specification nor `rules/bounded-dispatch.md` is in
its corpus.

**Acceptance test.** `grep -n 'minute 19\|minute 49\|30-minute' ` over the plan and the specification
returns nothing, or returns only text that names the contradiction and says which half governs. The
choice of which half to repair is not made here: striking the illustration and stating the criterion's
intent are both open, and the specification is the upstream copy.

---
Reconciliation 2026-09-08: verified against the tree at `de94102f` and still open. The passage this record is about is unchanged in its source file, so the defect stands whatever the plan step's marker says.
