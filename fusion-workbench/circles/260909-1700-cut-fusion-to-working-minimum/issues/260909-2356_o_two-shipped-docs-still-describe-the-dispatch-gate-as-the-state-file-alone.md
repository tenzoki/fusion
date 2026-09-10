Two shipped docs still describe the dispatch gate as `agentstate.yaml` alone
---
Step B2 widened the machine-row gate in `hooks/lib/orchestrator-events.ts` from `orchestratorSessionInFlight(root)` to `eventRowsAdmitted(root, sessionId)` — the state file OR a session identifier on the payload. Two shipped documentation surfaces still state the old single-term gate as fact. They were outside the step's permitted file set, so the drift was created knowingly rather than discovered.
---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

**Where.** `README-hooks.md` in two places: the sub-agent dispatch paragraph near the top ("written only while an orchestrator session is in flight (`agentstate.yaml` exists)") and the `lib/orchestrator-events.ts` row of the `hooks/lib` table, which repeats the same clause and closes with "the stated residual of the `agentstate.yaml` gate" — a residual the widening replaced with a stated consequence. `rules/commit-lock.md` `## The lock writes the commit event` in one place: "only while an orchestrator session is in flight (`agentstate.yaml` exists)", which `bin/fusion-commit-lock`'s own header no longer says.

**Why it matters more than an ordinary stale sentence.** `README-hooks.md`'s claim that a dispatch "writes nothing under `.guard-state/`" is now false on one path: a dispatch payload with no session identifier writes one `guard_advisory` there. A reader debugging an unexpected advisory row has no way from that document to the condition that produced it.

**Acceptance.** All three passages describe the disjunction and name `eventRowsAdmitted` as the predicate; `README-hooks.md`'s zero-guard-state claim carries the advisory exception. `npm test` stays green — `derivable-enumerations-lint` holds the `hooks/lib` table in set equality with `hooks/lib/*.ts`, and no module was added or removed here, so the row's presence is not at issue, only its text.

---
Reconciliation (260910-0620, reconciler, Turn 2): still open at HEAD `d7b701d2`. Verified: `grep -n
"agentstate.yaml exists" README-hooks.md rules/commit-lock.md` still returns all three passages named
above, unchanged by B1–B4. Correctly carries `_o_` — the fix is a docs pass B2 did not include in its
own file list.
