# Lane sessions narrate every Monitor wake, against Step 9's "say nothing"

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** analysis `261121-1826-live-trial-two-checkouts.md` F1, rows C2.4, C5.3, C5.4, C5.5; plan `261123-1000-plan-fix-the-three-trial-causes-and-retest-before-13-6-0.md` steps 1 to 4, 6

---

Every `Monitor` notification gives the session a turn, and in the trial every such turn ended with text to the user: twelve expiry messages at the steering side (seven restating Q1), twelve "still waiting" messages at the peer, and "nothing new" lines after moves. `skills/campaign/SKILL.md` Step 9 says "say nothing" for `already-watching` and for a move with no new rows; the model spoke both times. Expiries have no silence instruction at all.

**Evidence:** report `### 4` rows C2.4, C5.3, C5.4, C5.5 with their times.

**Acceptance:** in a live run, over at least 35 minutes with a 30-minute mark passed and no question or ready package arising, neither session writes anything to its user; when the remote moves, the steering user hears only new questions and ready packages. Observed in plan `261123-1000-plan-fix-the-three-trial-causes-and-retest-before-13-6-0.md` step 6.
