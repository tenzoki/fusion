# A re-armed watch reports a continuing outage again

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** analysis `261121-1826-live-trial-two-checkouts.md` F3, row C5.6; plan `261123-1000-plan-fix-the-three-trial-causes-and-retest-before-13-6-0.md` step 2

---

`watch` prints `failed=` once per run of failures inside one process. A re-arm starts a new process with no memory of the old run, so an outage that spans a re-arm is reported again.

**Evidence:** steering `failed=fetch-failed` at 17:33:19, reported at 17:33:21; after the re-arm at 17:48:21 printed again at 17:48:23 and reported a second time at 17:48:32.

**Acceptance:** two successive watches of one session over one blocked remote print `failed=` once in all; a watch of another session prints it again (`hooks/lib/__tests__/campaign-watch.test.ts`). Observed in a live run in plan `261123-1000-plan-fix-the-three-trial-causes-and-retest-before-13-6-0.md` step 6.
