# A reopened lane peer asks its own user for a brief before it arms its watch

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** analysis `261121-1826-live-trial-two-checkouts.md` F2, rows C2.1, C4.1; plan `261123-1000-plan-fix-the-three-trial-causes-and-retest-before-13-6-0.md` step 3

---

`agents/orchestrator.md` STEP 1 asks a bare opening (or a lone setup request) what to work on, before Setup step 5 reads the campaign. It has no exception for a checkout a running lane names, so a reopened peer put a "what next?" question to its own user, against C2 criterion 1, and armed its watch only after the reply.

**Evidence:** session 2adac84e, `/fusion:setup` at 15:21:47, question at 15:23:44 "Was soll diese Sitzung tun?", watch armed after the reply at 15:57:11.

**Acceptance:** a peer whose checkout a running lane names, opened with a bare message, asks no brief question, reads its lane and, with a question open, starts its watch in its first turn. Observed in plan `261123-1000-plan-fix-the-three-trial-causes-and-retest-before-13-6-0.md` step 6.
