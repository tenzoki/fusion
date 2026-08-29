# "Continue without check-ins" falsifies the Rebalance section's two bounding claims, and neither carries the qualification

---

**Severity:** Medium — the third gate answer removes the bound two nearby sentences assert
**Domain:** code
**Filed by:** coderev (review of `e3da397..a6b4928`, Turn 5)
**Affects:** `agents/orchestrator.md:972`, `agents/orchestrator.md:974`
**Cross-references:**
`shared/issues/260811-2142_c_the-unresolved-turn-budget-leaves-the-phase-2-loop-with-no-monotone-bound-while-the-prompt-says-it-is-bounded.md`

---

## What is wrong

`500f51f` gave the unresolved-budget check-in a third answer (`agents/orchestrator.md:629`):

> **Continue without check-ins** — the user accepts a Phase-2 loop with no count-based exit for the rest of the session. Stop asking. … **do not call the loop bounded from that point on**: an accepted residual is stated, not described away.

That bullet is careful and correct. Two sentences in the Rebalance-bounding section, one of them rewritten by the same commit, are not:

- `:972` — "Each option has bounded post-action mechanics. **No option is allowed to loop unboundedly.**"
- `:974` — "every Turn boundary in such a session runs the **Unresolved-budget check-in** (Step 3d) — **that is what bounds the retries**, and it is where the user ends them."

Once the user has answered "Continue without check-ins", the check-in stops firing. In a session whose budget was unresolved, Revise Artifact re-entries are then bounded by nothing: no `progress.max_turns` to reach (the key is deliberately omitted), no check-in, and the Max-Turns row not evaluated. Both sentences above are false in that state, and `:974` is false while pointing at the very mechanism that was switched off.

The commit author saw the residual — the bullet at `:629` states it plainly. What did not happen is carrying the qualification to the two sites that assert the opposite. That is the same shape as the finding this commit closed: the mechanism is honest, one paragraph away the prose is not.

## Why "the user accepted it" is not an answer here

It is an answer for the *user*, who chose it with the residual named. It is not an answer for the *prompt*, which is read by an orchestrator that did not see the choice being made and which `:972` tells, flatly, that no option loops unboundedly. An agent reading `:972` after the opt-out has been taken has been told something untrue about the state it is in.

## Fix direction

Qualify both sentences on the opt-out, in the register `:629` already uses — name the state, do not describe it away. For example: `:972` becomes "Each option has bounded post-action mechanics, except where the user has explicitly accepted an unbounded loop at the Unresolved-budget check-in"; `:974` names the same exception.

An alternative worth weighing rather than assuming: make the opt-out *narrower* — "stop asking for the next N Turns" rather than "for the rest of the session" — so no state in which the claim is false is reachable at all. That trades a user convenience for a property the prompt can then state without a carve-out, and which of the two is right is a decision, not a defect.

## Acceptance criteria

- No sentence in `agents/orchestrator.md` asserts a bound that the "Continue without check-ins" state removes, or the opt-out no longer produces such a state.
- `hooks/lib/__tests__/turn-budget-lint.test.ts`'s `CLAIM` scan is widened to reach the Rebalance-bounding section's phrasing (`bounded post-action mechanics`, `bounds the retries`), which its current `loop is bounded` pattern does not match.

---
Resolved: Fixed as asked: the qualification is now stated rather than described away. `agents/orchestrator.md:915` reads "no option is allowed to loop unboundedly, with one exception that is stated here rather than described away", followed by the sentence naming the unresolved-budget plus Continue-without-check-ins state that is the exception. Verified by reconciliation pass 260817-1836 at HEAD `2552586`.
