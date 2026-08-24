The /fusion:next handoff still asserts a Directive read the orchestrator does not perform, and the precedence is unstated

---

**Severity:** Low
**Domain:** code
**Filed by:** orchestrator, re-filing a residual the closing change named
**Affects:** `skills/next/SKILL.md` (the activation handoff), `agents/orchestrator.md` (the Coherence gate's Directive resolution)
**Cross-references:** `shared/issues/260818-1512_c_the-next-skills-activation-handoff-tells-the-orchestrator-to-read-the-circle-records-directive-and-no-orchestrator-step-does.md` — the record this residual outlived, closed by plan `260818-1512` step 4

---

## Why this exists as a second record

Plan `260818-1512` step 4 corrected *which* Directive the handoff sentence names, because the
pointer invariant changed what the record's `## Directive` holds. It did not touch the two things
the original record was about, and the coder executing the step said so rather than letting the
closure imply otherwise. Closing a record whose substance is unresolved leaves the residual with
no open home, so it gets one here.

## The two residuals

1. **The sentence asserts a read that no step performs.** `skills/next/SKILL.md` tells the
   orchestrator to take the activated Circle's Directive as the session Directive. No step in
   `agents/orchestrator.md` reads a Circle record for that purpose. Setup does not, and the
   Coherence gate resolves the Directive from the active plan, then the active spec, then the
   session history file's `**Directive:**` line — the record is not in that chain at all.

2. **The precedence is unstated.** If a later step did read the record, nothing says how that
   reading relates to the three sources the Coherence gate already ranks. A fourth source with no
   stated position is worse than none.

## Note on scope

This is a contract mismatch between a skill body and an agent prompt, not a defect in either taken
alone. Whoever fixes it decides one of two things: the handoff stops asserting the read, or the
orchestrator gains the step and the resolution chain gains a documented fourth entry.

---
Resolved: fixed — the Step 6.5 message no longer asserts a Directive read, and the line under it says the Coherence gate's three-source chain is the whole resolution; `skills/next/SKILL.md:249-251`
