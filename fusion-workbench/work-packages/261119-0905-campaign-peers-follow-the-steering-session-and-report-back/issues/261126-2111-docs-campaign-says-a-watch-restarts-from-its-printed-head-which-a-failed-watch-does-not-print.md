# docs/campaign.md says a watch restarts from its printed head=, which a failed watch does not print

---
`docs/campaign.md` `## The two watches` says the watch "exits only when there is something for the session to act on, or on the first failure of an outage" and that the woken turn "starts the watch again from the `head=` it printed". After `failed=` there is no `head=`; since the fix of issue `261126-0900-a-watch-that-exits-on-failed-is-not-restarted-because-the-text-restarts-only-from-a-printed-head.md` both texts restart with the same `--since`. The page also leaves out the `state=already-watching` exit, which every use of `/fusion:campaign` meets while a watch runs.
---
**Domain:** code
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** review `261126-2111-reviewer-closing-pass-over-13-6-0.md`

**Evidence:** `docs/campaign.md:42`; `skills/campaign/SKILL.md:160` and `agents/orchestrator.md:380` ("`failed=`: one sentence, then restart it with the same `--since`"); `hooks/campaign.ts:408-410`; analysis `261124-2015-retest-two-checkouts.md` `## 7`, the already-watching note.

**Acceptance:** the paragraph states the restart after `failed=` with the unchanged `--since` and names the already-watching exit, or cites the helper header for both instead of restating them.
