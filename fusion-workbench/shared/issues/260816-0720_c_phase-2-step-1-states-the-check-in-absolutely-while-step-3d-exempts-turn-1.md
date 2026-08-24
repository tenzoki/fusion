Phase 2 step 1 states the check-in absolutely while Step 3d exempts Turn 1
---
The two places that describe the Unresolved-budget check-in disagree about whether it fires before the
session's first Turn. Both were written by `b00a7a4`.
---
**Severity:** Medium — the difference is user-visible at the very start of a session: either an
`AskUserQuestion` gate fires before any work has been done, or it does not.
**Domain:** code
**Filed by:** coderev, session `260816-0713`, reviewing range `3a0408a..f77633f`
**Owner:** coder
**Affects:** `agents/orchestrator.md:465`, `:655`

## Evidence

`agents/orchestrator.md:465` (Phase 2 step 1), stated without exception:

> **Running the Unresolved-budget check-in** — but only when this session's Turn budget came back
> unresolved at Setup Step 2. … It **gates the emission in step 3**: no `turn_start` is emitted until the
> check-in has been answered *Continue*.

`agents/orchestrator.md:655` (the definition under Step 3d):

> It is counted from the loop's start, which puts that first question **at the start of Turn 2**: Turn 1
> is the Turn the session was started to run, and at its start no Turn has yet elapsed to check in on.

The only qualifier at `:465` is the budget's resolution state. An agent reading Phase 2 in order meets the
absolute form first, and `:465` does point at Step 3d for the definition — so the fact is reachable, but
the two sentences as written cannot both be executed.

## Fix

State the Turn-1 exemption at `:465`, where the step runs, in one clause. The reasoning stays at `:655`.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `agents/orchestrator.md:465` still states the check-in with only the budget qualifier while `:653` puts the first question at the start of Turn 2. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
Resolved: fixed — Phase 2 step 1 states the Turn-1 exemption in one clause; agents/orchestrator.md:545
