# The Cleanup drift call point claims a single-Turn session reaches no other, and Phase 2 contradicts it

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241-orchestrator-session.md`, Turn 1)
**Affects:** `agents/orchestrator.md` — Phase 2 step 2, Step 3e (the `turn_end` paragraph), Cleanup (the `session_end` bullet)
**Cross-references:** commit `9bad4d6`

---

## The defect

Three sections written in one commit disagree about which drift-check call points a short session
reaches.

Phase 2 attaches the check to **every** Turn's opening emission:

> 2. Emitting a `turn_start` event — and, **in the same command**, running the drift check.

Step 3e then says of the `turn_end` point:

> A session that converges or exits early never reaches this emission at all; for those, the
> `session_end` call point in Cleanup is the one that fires.

And Cleanup says:

> A single-Turn session reaches this call point and no other.

Both of the last two are false as written. A single-Turn session runs Turn 1, so it reaches
`turn_start` and therefore the Phase 2 call point, before it reaches `session_end`. "The one that
fires" and "no other" each exclude a call point the same commit installed two sections earlier.

## Why it is Low, and why it is still worth a record

The substantive point behind the wording is sound: at `turn_start` of Turn 1 there is nothing to have
drifted yet, so `session_end` is the first call point that can *find* anything in a single-Turn
session. That is a true and useful statement, and it is what the prose was reaching for.

But `agents/orchestrator.md` is the file three consumers now treat as a canonical implementation, and
`hooks/lib/__tests__/state-drift-detection-lint.test.ts` asserts the call-point set is complete and
attached. A reader reconciling "four call points" (`### Drift check`, and the event-table row at
`:992`) against "no other" has to decide which sentence to trust. That is the kind of small
contradiction that becomes a wrong edit later.

## Fix direction

Say what is meant rather than what is claimed. In Cleanup: *"in a single-Turn session this is the first
call point at which anything can have drifted — Turn 1's `turn_start` runs before any Turn has
completed."* Adjust the Step 3e sentence the same way: `session_end` is the point that **finds** the
drift, not the only point that fires.

---
Resolved: `agents/orchestrator.md` now says what is true at all three sites instead of what was claimed, and keeps the reason each sentence carried. Cleanup: *"A single-Turn session reaches Turn 1's `turn_start` and then this call point, with nothing in between: at `turn_start` it had no commit and no completed Turn of its own, so this is the first point at which a freeze in its own numbers can show up at all."* Step 3e: the `session_end` point is now the one at which a freeze can first be **found**, not the only one that fires, and the sentence says why (Turn 1's `turn_start` ran, before the session had anything of its own to diverge from). Phase 2 step 2 gained the positive statement the other two are read against — the check fires in every Turn, Turn 1 included, and what it takes there is a baseline. The four-call-point statement is contradicted by none of the three. Verified: `cd hooks && npm test` → 48 files, 1246 tests, exit 0; `state-drift-detection-lint.test.ts` passes, including its skip-licence scan over each call point's window.
