# The answer step does not say whether it commits

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** analysis `261121-1826-live-trial-two-checkouts.md` F5 a, R4, row C3.3; plan `261123-1000-plan-fix-the-three-trial-causes-and-retest-before-13-6-0.md` step 4

---

`skills/campaign/SKILL.md` Step 8 says the answer "reaches the peer with this session's next commit and push" but not whether the step commits. The steering session asked before committing Q1's answer and not before Q2's or Q3's, so the first answer waited 29 minutes between filing and push.

**Evidence:** steering 15:30:40 and 15:48:10 (asked), 16:14:13 (committed without asking); Q1 filed 15:30, pushed 15:59.

**Acceptance:** Step 8 states what happens after exit 0, and in a live run the answer is pushed in the turn the user chose it.
