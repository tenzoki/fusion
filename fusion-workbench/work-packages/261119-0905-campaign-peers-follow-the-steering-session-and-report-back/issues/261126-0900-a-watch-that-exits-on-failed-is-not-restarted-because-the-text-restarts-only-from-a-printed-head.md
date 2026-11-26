# A watch that exits on failed= is not restarted, because the text restarts only from a printed head=

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** analysis `261124-2015-retest-two-checkouts.md` F1, row C5.6

---

`watch --report` exits on the first failure of an outage with `failed=<state>` and prints no `head=` (`hooks/lib/campaign-watch.ts:319-323`; `bin/fusion-campaign` `## probe and watch`). The steering skill's Step 9 says "`failed=`: one sentence. … Else restart it `--since` the printed `head=`" (`catalog/profiles/skill-campaign/parts/09-claude.md:4`, rendered at `skills/campaign/SKILL.md:160`). Read literally, that gives the failed case no restart. The orchestrator's lane wait has the same gap (`catalog/profiles/orchestrator/parts/40a-claude.md:1`, rendered at `agents/orchestrator.md:380`).

**Evidence:** in the retest of 2026-11-25 both watches exited on the block with only `failed=fetch-failed`. The peer restarted from its unchanged `--since` at 06:41:55Z. The steering session read the output at 06:40:05Z, did not restart, and asked its user whether to continue. No steering watch ran from 06:40:00Z until 07:56:59Z.

**Fix:** in both parts, `failed=` gets one sentence, then a restart `--since` the head the watch was started with. Each rendered text must stay within its bound (SKILL_HEAD_ROOM; the dispatch path), by a cut inside the same part where needed.

**Acceptance:** catalog and hooks tests pass, and a narrow live re-check shows both sessions report a blocked remote once and both watches running again after the failure, with no question to the user.
