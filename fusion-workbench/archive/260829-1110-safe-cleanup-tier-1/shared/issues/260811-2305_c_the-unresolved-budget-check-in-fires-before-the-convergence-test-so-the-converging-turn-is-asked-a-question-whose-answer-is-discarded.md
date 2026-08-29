# The unresolved-budget check-in fires before the convergence test, so the converging Turn is asked a question whose answer is discarded

---

**Severity:** Medium — a human gate that fires where there is nothing to decide, and whose "Continue" is then not honoured
**Domain:** code
**Filed by:** coderev (review of `e3da397..a6b4928`, Turn 5)
**Affects:** `agents/orchestrator.md:625` (the check-in's stated position), `agents/orchestrator.md:635` (Step 3e)

---

## What is wrong

`agents/orchestrator.md:625` places the gate explicitly:

> At the end of every Turn, **after the circuit-breaker table has been evaluated and before Step 3e**, emit `gate_hit` with reason `unresolved Turn budget` and ask with `AskUserQuestion`

Step 3e, at `:635`, is the convergence check:

> If all tasks in the queue are `[x] done` or `_d_ deferred`, the loop converges. Exit to Phase 4.

So on the Turn that empties the queue, the sequence is: ask the user "run another Turn?", the user answers **Continue** ("run another Turn" — `:627`), and Step 3e then exits to Phase 4 regardless. The answer is collected, a `gate_response` is emitted recording it, and nothing acts on it.

Two costs, and the second is the one that matters:

- Every unresolved-budget session pays one spurious gate — the last one, where the loop was going to end on its own.
- The gate's contract is broken in that instance. `user-facing-output.md` `## Questions and gates` asks that options be plain and actionable; an option labelled "run another Turn" that does not run another Turn is neither.

## Why the ordering was chosen, as far as the record shows

`260811-2205-coder-unresolved-turn-budget-check-in.md` states the placement as "after the circuit-breaker table, before Step 3e" without giving a reason for the *before*. The circuit-breaker half is clearly right — a tripped breaker must exit without asking. The Step 3e half looks like it inherited that ordering rather than being decided.

## Fix direction

Move the gate to fire **after** Step 3e's convergence test and only on the branch where the loop would otherwise continue. Then it fires exactly when the question has an effect, which is the property the gate was built for, and the spurious last question disappears.

This composes with the Revise-Artifact hole filed alongside it: if the check-in becomes a Turn-*start* obligation instead, both problems close together — a Turn that is about to start is by definition a Turn the user can decline, and a converged loop never starts one.

## Acceptance criteria

- The check-in does not fire on a Turn boundary at which the loop exits for another reason.
- The prompt states which of Step 3d, Step 3e and Step 3c-bis the gate sits relative to, and why that position and not the neighbouring one.

---
Resolved: Fixed by the same move as `260811-2304_*_the-revise-artifact-path-exits-a-turn-at-step-3c-bis-so-the-unresolved-budget-check-in-it-is-said-to-meet-never-runs.md`: the gate sits at the start of a Turn, after Step 3e has already decided whether another Turn is entered. `agents/orchestrator.md:655` carries the reasoning explicitly — "on the Turn that empties the queue, Step 3e exits to Phase 4 whatever the user answered, so a Continue there would be collected, logged, and then not acted on. At the start of a Turn both faults go at once." The discarded-answer case this record measured can no longer occur. Verified by reconciliation pass 260817-1836 at HEAD `2552586`.
