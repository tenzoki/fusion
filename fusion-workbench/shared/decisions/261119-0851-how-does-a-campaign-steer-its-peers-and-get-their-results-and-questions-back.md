# How does a campaign steer its peers, and how do their results and questions get back to the steering session?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** analysis `261119-0737-campaign-steering-binding-handover-and-the-route-back.md`; adoption decision `261108-1927-does-the-claude-side-adopt-the-campaign-as-its-one-frame-for-work-spread-over-several-checkouts.md` (line 40, the out-of-scope bullet on polling)

---

## Question

The user observed on 2026-11-19 that peers working a campaign do not accept the steering session's instructions and ask the user to intervene, and that their results and questions do not reliably reach the steering session. The user's expectation, in their words (translated from German): "fusion can steer a campaign. If a peer is not in autonomous mode or has a question it cannot decide, it should be routed to the centre and answered there. In general a campaign should be steerable from the centre." The analysis found that a peer reads only `paused=` from its campaign read, that the git route back is read only when the user asks, and that a cross-session message is never consent under the harness. Three points were put to the user.

## Options

1. **Who answers a peer's question at the centre.**
   - (a) The user, in the steering session; the record carries the answer to the peer.
   - (b) The steering session itself when it runs autonomously, which would reverse `260913-0909_*` for campaign members.
2. **Does the steering session watch git on its own?**
   - (a) Yes, by a poll of the upstream while its session is open, superseding the "no polling" bullet of the adoption decision.
   - (b) No, it reads when the user invokes it.
3. **Release.**
   - (a) Minor, 13.6.0, solving both problems.
   - (b) Patch, 13.5.2, the binding handover only.

## Recommendation

The analysis recommended 1(a) and 3(a), and put 2 to the user without recommending either answer. On top of the ruling, it recommended these approaches:

- **The handover rests on the campaign record.** A peer reads its own lane and claims the next member, where that member carries `mode` `autonomous`, without asking.
- **Peer questions travel as decision records, in both directions.** A peer files the question it cannot decide as a decision record, and picks the answer up from it.
- **A same-machine message, if one is used later, only wakes a peer** so that it reads the record again. It carries no instruction.

---
Answered: this record — 1(a) the user answers a peer's question in the steering session, the record carries it back, no agent answers for the user; 2(a) the steering session watches the upstream by a poll while its session is open, superseding the adoption decision's "no polling" bullet for this watch; 3(a) a minor release, 13.6.0, solving both problems; the user answered "1a 2a 3a" in chat on 2026-11-19; ruled by user, Kai Stalmann <ks@qantr.com>
