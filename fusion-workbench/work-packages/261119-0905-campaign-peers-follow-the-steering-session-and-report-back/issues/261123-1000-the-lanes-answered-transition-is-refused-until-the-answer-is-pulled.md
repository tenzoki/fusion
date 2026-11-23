# The lane's answered transition is refused until the answer is pulled

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** analysis `261121-1826-live-trial-two-checkouts.md` F5 b, R5, row C4.2; plan `261123-1000-plan-fix-the-three-trial-causes-and-retest-before-13-6-0.md` step 3

---

5a's lane clause says to read the answer at the fetched head and transition the question with `--answer-ref`. The wait re-reads with `sync --read`, which fetches but does not bring the answer record into the working tree, so the codec refuses the reference.

**Evidence:** peer 16:02:48 `unresolved-reference/record-not-found`; recovered at 16:03:19 through a full `sync`.

**Acceptance:** `agents/orchestrator.md` says the answer is pulled before the transition, and in a live run the peer's first `transition --to answered` lands.
