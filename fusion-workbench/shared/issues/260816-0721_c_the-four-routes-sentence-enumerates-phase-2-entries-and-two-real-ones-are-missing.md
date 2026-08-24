The "four routes, one entry" sentence enumerates Phase-2 entries and two real ones are missing
---
`b00a7a4`'s load-bearing claim for putting the check-in in the Turn-start sequence is that every route
into Phase 2 runs that sequence. As written the sentence enumerates entries into Phase 2, and two entries
that exist are not in it — both of which must **not** run the sequence.
---
**Severity:** Low — both omitted entries are governed correctly elsewhere in the same prompt, so an agent
that reads the whole file behaves right. The sentence is the one a reader is meant to reason from, though,
and reasoning from it as an enumeration produces a double `turn_start`.
**Domain:** code
**Filed by:** coderev, session `260816-0713`, reviewing range `3a0408a..f77633f`
**Owner:** coder
**Affects:** `agents/orchestrator.md:470`

## Evidence

`agents/orchestrator.md:470`:

> **This sequence is what every route that creates a Turn runs** … Phase 2 **is entered here** from Phase
> 1, from Step 3e's refresh, from the *Revise Artifact* answer at Step 3c-bis, and from *Revise Artifact*
> at Phase 3 — four routes, one entry, no per-route carve-out.

Two further entries into Phase 2 exist:

- **Interrupted-session resume** (`:111`) — re-enters Phase 2 mid-Turn and must emit no `turn_start`.
- **Rebalance / Revise Grounding** (`:931`) — "resumes Phase 2 at the recorded `paused_at_task` **without
  incrementing the Turn counter**", so it creates no Turn either.

The first half of the sentence is exact ("every route that **creates a Turn**"); the second half switches
predicate to "Phase 2 is entered" and is then incomplete.

## Fix

Keep the predicate: either say "four routes create a Turn" and name the two that enter Phase 2 without
creating one, or drop the enumeration and rely on the criterion, which is the part that is actually true.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `agents/orchestrator.md:470` still says four routes; the interrupted-session resume at `:111` and the Revise Grounding resume at `:929` are both real Phase 2 entries and neither is named. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
Resolved: fixed — the sentence keeps its predicate ("four routes create a Turn") and names the two entries that create none; agents/orchestrator.md:550
