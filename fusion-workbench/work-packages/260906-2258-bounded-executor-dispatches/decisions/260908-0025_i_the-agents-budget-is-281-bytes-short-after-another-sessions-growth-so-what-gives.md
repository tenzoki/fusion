# The `agents/` budget is 281 bytes short after another session's growth — which of the three gives?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260907-1450_*_plan-bounded-executor-dispatches.md` (Step 14 and `## Current State`), `260907-0820_*_spec-bounded-executor-dispatches.md` (`## Stops when`, `## Constraints`), `260822-1102_*_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md`, `hooks/lib/__tests__/helpers/growth-bound.ts`

---

## Question

The bounded-dispatch plan budgets 3 790 bytes of new text across ten edits to `agents/orchestrator.md`. It was written against 4 618 bytes of head-room measured at `abcaa823`. Re-measured on 2026-09-07 at `223f916a`, with the working tree as it then stood, the head-room is 3 509 bytes: `agents/*.md` sums to 414 334 against an `AGENT_BASELINE` sum of 399 843, so the delta is 14 491 against `AGENT_HEAD_ROOM` of 18 000. The build is 281 bytes over before its first byte is written.

The whole 1 109-byte difference is one file, `agents/playmaker.md`, grown and not yet committed by a second session running in this checkout. No other file in that directory moved from `abcaa823`. So the shortfall did not arrive from this Circle's own work, and the choice has to be made before Step 8 writes anything, because Step 8 and Step 9 are where the bytes land.

## Options

1. **Take the cut Step 14 names up front, before Step 8 rather than after Step 9.** Move the two "why this is a rule and not a preference" narratives out of `agents/orchestrator.md` Step 3b steps 3 and 4 into `rules/commit-lock.md`, leaving a one-line pointer at each site.
   - Pros: the orchestrator already receives `rules/commit-lock.md` by emission, so no information leaves any reader's context; the bytes land on a surface that warns and never fails; the specification's `## Stops when` explicitly rules this cut a pass rather than a stop; it is already planned, named and justified, so nothing new is designed.
   - Cons: it spends the cut on somebody else's growth, so this Circle has none in reserve if its own budgets overrun; the two sites gain an indirection a reader must follow.
2. **Leave the plan as it stands and let Step 14 discover the red suite.** Step 14 already says to re-measure and already names the cut.
   - Pros: no decision now; the plan's mechanism handles it exactly as written.
   - Cons: the cut then lands under a red suite at the end of the build rather than as a planned edit, which is the shape this project's own history says produces baseline edits; and an executor reaching Step 8 reads a margin figure the tree has already falsified.
3. **Cut a budget instead.** Reduce what `agents/orchestrator.md` carries — the `### Bounded dispatches` block at 900 bytes and the Step 3a guard at 550 are the two largest.
   - Pros: keeps the named cut in reserve for a later overrun.
   - Cons: those bytes are the ones the plan argues cannot wait for a rule-file read; cutting them moves the obligation to a file the orchestrator reads on demand, which is the failure mode Step 8 is written against.
4. **Treat the other session's growth as the thing to review.** Ask whether `agents/playmaker.md` needed 1 109 bytes, on that work's own merits.
   - Pros: the shortfall is that work's, and the growth bound exists to make exactly this question get asked.
   - Cons: it is a question about another Circle's work and blocks this one on an answer nobody here can give; and the growth may well be right, in which case this Circle is where it stands anyway.

## Constraints

- A baseline edit is not among the options. `hooks/lib/__tests__/helpers/growth-bound.ts` permits one at three named moments and none of them is this; a Circle that needed room asked for a fourth on 2026-08-22 and did not get it.
- The specification's `## Stops when` closes this Circle unbuilt only on a cut that drops something a reader would otherwise have had, or on a baseline edit. None of the four options above is either, so none of them fires that condition.
- Whatever is chosen has to be settled before Step 8, not at Step 14.

## Recommendation

Option 1. It is the cut the plan already names, already justifies and already proves loses no information, and taking it as a planned edit rather than as a repair under a red suite is the difference the project's own re-baselining history turns on. Option 4 is worth asking in parallel and does not block: if the other session's growth is trimmed later, the room comes back and this Circle is not holding anything hostage for it.

---
Answered: 260907-0657-orchestrator-session.md `### What gives, now that the agents/ budget is 281 bytes short` — option 1, take the plan's named cut up front before step 8; the two commit-lock narratives move to `rules/commit-lock.md`, which the orchestrator already receives by emission, so no reader loses information and the Circle keeps no cut in reserve; ruled by user, Kai Stalmann <ks@qantr.com>

Implemented: bb5dbda4 — the named cut was taken up front as plan Step 8: the two commit-procedure narratives moved from `agents/orchestrator.md` to `rules/commit-lock.md` `## Two measured defects behind this procedure` before Step 9 wrote a byte, and the byte reckoning at Step 15 closed with 698 bytes of `agents/` head-room.
