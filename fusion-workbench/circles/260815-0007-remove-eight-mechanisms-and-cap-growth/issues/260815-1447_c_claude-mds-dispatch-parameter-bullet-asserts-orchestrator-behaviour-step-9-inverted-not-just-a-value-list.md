# CLAUDE.md's dispatch-parameter bullet asserts orchestrator behaviour step 9 inverted, not just a stale value list

---

**Severity:** Low — one clause in one bullet, and it is already on the curator's ledger under a
narrower description than it deserves.
**Domain:** code
**Filed by:** `coder`, executing step 9
**Owner:** the curator, at gate G1 (after step 12)
**Affects:** `CLAUDE.md:59`
**Cross-references:**
`planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md` step 9, the
`**CLAUDE.md** carries no gate-forced edit for this step` bullet;
`decisions/260815-0029_i_what-triggers-the-analyst-executor-set-once-strategic-and-knowledge-are-gone.md`

---

Step 9's plan text checks `CLAUDE.md:16` and `:59` and classifies both as *"prose carrying no path
token, no `/fusion:` token and no asserted digit"* — domain-value prose, the curator's at gate G1.
That classification is right about what no gate can see and **incomplete about what is false**.

`CLAUDE.md:59` ends its first fact with:

> `planner` takes `**Executors:** coder, ontocoder, analyst` (default `[coder, ontocoder]`), which
> the orchestrator derives from the detected domain.

The last clause is not a stale enumeration. It states how the orchestrator decides what to pass, and
step 9 deleted exactly that derivation: `agents/orchestrator.md:396` now prefixes the three
executors on **every** planner dispatch with no condition, and the detected domain is no longer an
input to the executor set at all. A reader acting on `CLAUDE.md` would reinstate a branch this
Circle removed on a user-answered decision.

`CLAUDE.md:16`'s `code | data | strategic | knowledge` is the milder case and is exactly what the
plan describes: a value list two values too long.

## Why it is filed rather than fixed

Step 9's own instruction is that both passages wait for the curator. That holds, and this record
does not ask for it to be broken. What it asks is that the curator's ledger carry the right item:
`:59` needs its behaviour clause **deleted or rewritten**, not merely its value list trimmed, and
that is a different edit from the one the plan's wording sets up.

## What it would take

At gate G1, in `CLAUDE.md:59`: cut `, which the orchestrator derives from the detected domain` and
say instead that the orchestrator passes all three unconditionally. In `CLAUDE.md:16`: reduce the
value list to `code | data`.

---
Resolved: Both edits landed in e8052e7: CLAUDE.md now says the orchestrator passes all three executors on every planner dispatch with no condition, and the domain value list reads code | data.

Closed as part of the Turn-1 housekeeping batch of session 260815-2147, after a re-verification pass against HEAD confirmed the condition no longer holds.
