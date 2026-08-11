# The Revise Artifact path exits a Turn at Step 3c-bis, so the Unresolved-budget check-in it is said to meet never runs

---

**Severity:** Medium — a sentence added to fix a false bound claim states a second one, on the path it describes
**Domain:** code
**Filed by:** coderev (review of `e3da397..a6b4928`, Turn 5)
**Affects:** `agents/orchestrator.md:974`, `agents/orchestrator.md:976`
**Cross-references:**
`shared/issues/260811-2142_c_the-unresolved-turn-budget-leaves-the-phase-2-loop-with-no-monotone-bound-while-the-prompt-says-it-is-bounded.md` (the finding `500f51f` closed; this is the same class of claim, one paragraph further down)

---

## What is wrong

`500f51f` rewrote the Rebalance-bounding paragraph so that the unresolved-budget branch names a bound instead of disclaiming one. `agents/orchestrator.md:974` now reads:

> Each Revise Artifact choice still creates a Turn, and **every Turn boundary in such a session runs the Unresolved-budget check-in (Step 3d)** — that is what bounds the retries, and it is where the user ends them.

`:976` says the same for the Phase-3 re-entry:

> the fresh Turn runs and meets the **Unresolved-budget check-in** at its own boundary instead.

Not every Turn boundary reaches Step 3d. The prompt says so itself two places:

- `agents/orchestrator.md:450` — "When the Turn ends (via Step 3e convergence/refresh, **Step 3d circuit breaker, or Step 3c-bis early exit**)". Three exit routes; only one of them is Step 3d.
- `agents/orchestrator.md:591` (Step 3c-bis, *On Rebalance*) — "Dispatch the **Rebalance Gate** … **The Turn exits without emitting `turn_end`.** … **Revise Artifact** is the exception — it re-enters Phase 2 with a new Turn (counter increments)."

Step 3c-bis sits *before* Step 3d in the Turn. A Turn that exits at 3c-bis through Revise Artifact never evaluates the circuit-breaker table and never reaches the check-in placed under it at `:625`. So the cycle

    Turn N: 3a → 3b → 3c → 3c-bis → Rebalance → Revise Artifact → Turn N+1 → …

runs indefinitely without the gate that `:974` says bounds it, in exactly the branch (`unresolved` budget) where no count-based exit exists either.

## Why the resolved-budget half does not have this hole

In the resolved case the same paragraph bounds the retries differently: "When the Turn counter reaches `progress.max_turns` … **the next per-Turn or per-Circle gate** forces Bounded Closure". That test is evaluated *at the gate*, which the Revise Artifact path does reach. The unresolved half was written pointing at Step 3d instead, and Step 3d is the one thing this path skips. The asymmetry is new with `500f51f`.

## What this does and does not cost

Stated with the confidence the evidence supports. The user is still asked something at every one of these boundaries — the Coherence gate at 3c-bis is itself an `AskUserQuestion`, and three of its four Rebalance options terminate the loop. So this is **not** a silent runaway. What is wrong is the sentence: it names a gate the path does not reach, and a reader (or a future editor) trusting it will believe the unresolved branch is covered where it is not. That is the same defect `260811-2142` was filed for, one paragraph further down the same section.

## Fix direction

Either

1. **Move the check-in to a place every Turn boundary reaches** — for instance make it a Turn-*start* obligation alongside the `turn_start` emission at Phase 2 step 2, which the Revise Artifact re-entry does run; or
2. **Qualify the two sentences** to say that the Revise Artifact path meets the Coherence gate rather than the check-in, and that the terminating choices there are the three non-Revise-Artifact options.

Direction 1 is the integral one — one gate, one call point, no per-path carve-out — and it also removes the ordering problem filed alongside this (`_o_` record on the check-in firing before Step 3e). Direction 2 keeps two mechanisms and needs the reader to hold both.

## Acceptance criteria

- No sentence in `agents/orchestrator.md` claims a Turn boundary runs the Unresolved-budget check-in unless every route to that boundary does.
- `hooks/lib/__tests__/turn-budget-lint.test.ts` gains a case over the Rebalance-bounding section in the shape its existing `CLAIM` scan uses, so the claim cannot return.
