# The unresolved Turn budget leaves the Phase-2 loop with no monotone bound, while the prompt says it is bounded

---

**Severity:** High — a stated safety property that does not hold, in the branch that exists precisely because the safety property could not be resolved
**Domain:** code
**Filed by:** coderev (Turn 4 review, range `b261d83..951c809`)
**Affects:** `agents/orchestrator.md:127` (the unresolved-budget bullet), `agents/orchestrator.md:436` (the Phase-2 head), `agents/orchestrator.md:591` (the circuit-breaker row), `agents/orchestrator.md:938` (the Rebalance re-entry bound)
**Cross-references:**
`shared/issues/260811-1712_c_max-turns-is-hardcoded-in-eight-places-and-cannot-be-set-per-project.md` (the record this branch was built under);
`hooks/lib/__tests__/turn-budget-lint.test.ts:182-200` (the case that pins the unresolved branch exists, but not what it claims)

---

## What is wrong

`agents/orchestrator.md:127` decides the unresolved-budget case and states a safety property while doing it:

> Treat the **Max Turns reached** row of the circuit-breaker table (Step 3d) as not evaluable, and say so once when the loop starts. The loop is still bounded — the other five conditions and the Step 3e convergence check all still exit it — but the count-based bound is not among them, so watch the Turn count yourself and stop and ask the user if the session runs long.

The sentence contradicts itself inside one clause pair. If the loop were bounded, "watch the Turn count yourself" would buy nothing; the instruction is there because it is not.

**Verified against the table.** `agents/orchestrator.md:588-596` carries six rows. Removing *Max Turns reached* leaves five:

| Condition | Terminates a pathological loop? |
|---|---|
| Net-negative progress — 2 consecutive Turns where `issues_created > tasks_resolved` | No. A Turn that resolves 1 and files 1 satisfies `1 > 1` = false, forever. |
| Zero progress — 1 Turn resolving 0 tasks AND creating 0 issues | No. The same Turn resolves 1 and files 1. |
| Error cascade — 3+ agent errors in one Turn | No. Requires errors. |
| All blocked — every remaining task has unresolved dependencies | No. Requires a blocking graph. |
| Guard halt — `haltActive: true` | No. Requires a halt. |
| Step 3e convergence — the queue is empty | No. Each Turn files as many entries as it resolves, so the queue never empties. |

*Max Turns reached* was the only **monotone** condition in the set — the only one whose satisfaction is guaranteed by the passage of Turns rather than by the work happening to take a particular shape. Removing it removes termination, not merely one exit among six. The remaining five are all *contingent*; a session in a resolve-one-file-one steady state (which is exactly the state the Net-negative row was written to notice, one step short of tripping it) runs forever.

## Why this matters more than the wording

The unresolved branch is reachable three ways the prompt itself enumerates at `agents/orchestrator.md:121`: the helper absent from the installed copy, exit 2, exit 3. The first is the ordinary condition for any project whose install predates this release — which, at the time of writing, is every project. So the branch this defect sits in is not a corner: it is what every consumer meets until it next runs `fusion --update`.

`rules/critical-stance.md` §3 is the standard the sentence fails. "The loop is still bounded" is stated flatly, as a checked fact, and it is an inference that does not survive reading the table it points at.

## Fix direction

Two parts, and the second is the substance.

1. **Correct the claim.** Say what is true: the count-based bound was the only one that fires from the passage of Turns, so an unresolved budget leaves the loop bounded only by conditions that may never be met.
2. **Give the branch a bound of its own.** An unresolved budget is a fact the session knows at Setup; it can carry a fallback *stop-and-ask* count without inventing a *budget*. The distinction matters and is the reason the branch refuses a substituted number: a budget silently exits the loop and reports remaining work, whereas a stop-and-ask hands the decision to the user. "At Turn N with no resolved budget, stop and ask the user whether to continue" is not a Turn budget the prompt invented — it is the human gate that already exists for every other undecidable case, applied at a fixed interval. That keeps `260811-1712`'s answer intact (no number is the bound) and restores termination.

If the user prefers to accept an unterminating loop in this branch, that is a legitimate call — but it should be *stated* as accepted, not described as bounded.

## Acceptance criteria

- `agents/orchestrator.md` no longer claims the loop is bounded when the budget is unresolved.
- Either a stop-and-ask interval is prescribed for that branch, or the absence of a bound is stated as an accepted residual with its reason.
- `hooks/lib/__tests__/turn-budget-lint.test.ts` gains a case pinning whichever sentence is chosen, so it cannot revert to the current claim.
