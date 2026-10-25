# How to proceed while Prior waits for request 76, and how requirements-designer and implementation-planner ask on Prior

---
**Domain:** code
**Partners:** orchestrator and consultant
**Rounds:** 1
**Ceiling:** 8
**Outcome:** did not converge after 1 rounds
**Cross-references:** 261023-1854-plan-prior-full-surface-handover-h1-to-h9.md; 261023-1915-prior-handover-f-release-and-request-76.md; 261024-2111-agent-span-map-for-entry-profiles.md; 261024-2111-may-an-entry-profiles-prior-part-spell-the-helper-calls-its-host-exec-runs.md

---

## Question

Two questions the orchestrator put to the user on 2026-10-24 after plan step 6 (commits `af5fad9d`, `98a6c2ed`), which the user took to discussion instead of answering:

1. The user reported that Prior is waiting for request 76. Request 76 is plan step 25, the last step of package F, which depends on packages A, B, C and E being terminal. Should the work go on in plan order (B, C, E, F), should an interim note go to Prior, or should the order change?
2. On Prior, do `requirements-designer` and `implementation-planner` put their questions through `host.question.v1` or as chat text? The span map read both as `host.question.v1`; the orchestrator profile (step 6) asks as chat text.

## What held up

### C1 — Request 76 cannot be sent before packages B, C and E are terminal, because its items are their steps' output.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** plan step 25 depends on 24; item 1 comes from 24 (← 23 ← 22 ← 15, 18, 21, 21 being package E's last); item 2 is step 15, depending on 6–10 (B) and 13–14 (C) (plan lines 230–298, graph 306–386); package F's package.json lists A, B, C, E as `terminal` dependencies.

### C2 — Reordering C or E ahead of the rest of B gets request 76 to Prior no sooner; the plan gives no channel for a partial deliverable.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** plan line 387 (step 15 is "the one point where every profile must exist"); `## Where this work stops` names only the complete request; package B's two decisions are answered, so B is not stalled.

### C3 — An interim status note relayed by the user, outside `REQUESTS.md`, conflicts with no constraint in the plan.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** plan line 410 bars only commits to shipped files other than `REQUESTS.md`; no other bound governs talking to Prior. Refinement: the risk table (line 441) scopes that bar to between C and the tag, and C is not yet cut.

### C5 — The orchestrator profile's chat-text choice does not bind requirements-designer or implementation-planner.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the dialog ban is only in `agents/orchestrator.md:28-30`; `catalog/profiles/orchestrator/parts/05-prior.md` replaces that span (span map QCHAT, line 68). It decides nothing about C4.

### C6 — Prior's own hand-over has no use for a partial request: it checks request 76 row by row and installs only when every row is met or ruled.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** Prior `docs/design/fusion-full-surface-handover-to-fusion.md:153,155` (its steps 45 and 28).

### C7 — No interim note to Prior has ever gone outside `REQUESTS.md`; every recorded exchange, including fusion's reply to Prior's intake note on 70, is appended there, so a chat-only note has no precedent and no commit Prior can cite.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `codec/fixtures/prior/REQUESTS.md:5066`, 75(a) at 5911, 75(b) at 5978; chat-only relays outside the record are not visible.

### C8 — A ruling on the ask channel moves both entries together; under "chat" the QNEG spans must also stop naming `host.question.v1`, because the renderer counts a service by substring.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** span map lines 66, 376, 420 (Finding 8, blocker 4).


## What fell

## What could not be decided

### C4 — On Prior, requirements-designer and implementation-planner ask through `host.question.v1`.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** missing input: the user's ruling (span map open question, line 515). Both stated reasons are true but do not discriminate: the catalog's `host.question.v1` comes from the fallback "`asks` implies `host.question.v1`" (span map line 378), which also put it on orchestrator and policy-curator; the Output Style wording recurs in `agents/code-implementer.md:127` and `agents/data-implementer.md:155` from `rules/user-facing-output.md:5`. Against: Tool Discipline says chat (`requirements-designer.md:69`, `implementation-planner.md:67`); Prior's inventory reads `unfixed` and `chat-text`. After round 1 the user supplied the missing input in chat on 2026-10-25: "1", the question tool for both entries.


## Open dissent

## Recommendation

This recommendation binds nothing; it records where the discussion left both questions.

1. **Order of work.** Keep the plan order, B then C then E then F. Request 76 depends on all three packages (C1), Prior reads it only as a whole (C6), and no reorder brings it sooner (C2). If Prior should hear the state before then, the recorded route is a short entry in `codec/fixtures/prior/REQUESTS.md`, which the plan's commit bar exempts (C3, C7); a note relayed only in chat has no precedent and no commit Prior can cite.
2. **Ask channel.** The user's ruling settles C4 for both entries together (C8): on Prior, `requirements-designer` and `implementation-planner` ask through `host.question.v1`. Their `prior` parts name it, the catalog's `requires` for both keep it, and the QNEG spans may say that a dispatched child has no `host.question.v1`. The Tool Discipline sentence "in chat" stays the Claude text, which is unchanged; the orchestrator's chat-text choice does not carry over (C5).
