A located answer reaches the user only if somebody reads the reconciliation log
---
The reconciler no longer transitions a decision whose answer it finds on disk; it reports the record, the answer's path and a one-line summary in its log. The orchestrator lists open decisions to the user every session, so the *record* surfaces. The *located answer* does not, and a user asked to rule on a question that is already answered somewhere has nothing pointing them at it.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Where it comes from.** The decision `260905-1042_*_may-a-dispatched-agent-perform-the-open-to-answered-transition-at-all-and-under-which-bound.md` was answered option 1: only the orchestrator performs `_o_` → `_a_`, and only to relay a ruling the user gave. That record's own cons name this latency — *"an answer that genuinely exists on disk now waits for a session to notice it"* — and the implementing agent named it again at delivery rather than leaving it to be discovered. It is the accepted cost of the option, not a fault in the realisation.

**What is missing, precisely.** `agents/orchestrator.md` `## Phase 1: Work Queue Construction` step 3 lists the open `*_o_*` decision records across every decision store. Nothing in that step reads a reconciliation log, and nothing joins a listed record to a note somebody wrote about it in an earlier pass. So the two halves exist and never meet: the reconciler knows where the answer is, and the party that asks the user does not.

**Why it is worth repairing rather than tolerating.** The user is asked to rule on a question that has an answer sitting under an analysis or a plan. Either they answer again, possibly differently, or they go looking. The first outcome is worse than the state before the decision was answered, because it manufactures a contradiction the workbench then carries.

**Acceptance.** When a session lists an open decision to the user, and a reconciliation pass has recorded a located answer for that record, the listing names where the answer is. A session with no such note behaves exactly as it does today. Whatever carries the join must survive between sessions, so a note in a log the next session never opens does not satisfy this.
