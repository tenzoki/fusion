# The campaign watch wakes its session on that session's own pushes

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** analysis `261121-1826-live-trial-two-checkouts.md` F1, rows C5.4, C2.4; plan `261123-1000-plan-fix-the-three-trial-causes-and-retest-before-13-6-0.md` step 2

---

`bin/fusion-campaign watch` prints `moved=` for every change of the upstream head, including a head this checkout just pushed through `sync`. Each such line wakes the session for nothing it needs to tell its user.

**Evidence:** steering watch fired on its own answer push at 16:03:09, the peer's on its own pushes at 16:07:27 and 16:22:27; each produced a "that was my own push" message (report F1, second bullet).

**Acceptance:** with `watch --report steering|lane`, a push carrying no row this session must act on, its own included, prints nothing and the watch keeps running (`hooks/lib/__tests__/campaign-watch.test.ts`).
