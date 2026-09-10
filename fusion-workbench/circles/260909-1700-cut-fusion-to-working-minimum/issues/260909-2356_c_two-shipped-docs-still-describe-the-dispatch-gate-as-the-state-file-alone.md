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

---

Reconciliation (260910-2020, reconciler): open, and the acceptance as written is now unreachable in
its first clause. `grep -n "agentstate.yaml exists\|orchestratorSessionInFlight\|eventRowsAdmitted"
README-hooks.md rules/commit-lock.md` returns nothing at `07961552`: all three passages were
rewritten, two of them describing the gate as the payload's session identifier and the third as
`FUSION_SESSION_ID` being exported. There is no disjunction left to describe — step C1 (`6357ebfc`)
dropped the `existsSync` arm — so "all three passages describe the disjunction and name
`eventRowsAdmitted`" cannot be satisfied and should not be. **The second clause is unmet and is now
the whole of this record**: `README-hooks.md` still says a dispatch "writes nothing under
`.guard-state/`", while `ABSENT_SESSION_ID_ADVISORY` in `hooks/lib/orchestrator-events.ts` still
emits one `guard_advisory` when a dispatch payload carries no session identifier. A reader debugging
that row still has no route from the document to the condition.

---
Resolved: the second clause — the only one left, per the 260910-2020 reconciliation — is
answered. `README-hooks.md`'s sub-agent-dispatch paragraph no longer claims a dispatch writes
nothing under `.guard-state/`. It now says the ordinary path writes nothing there, names the
one condition that breaks it (a payload carrying no session identifier), says what the hook
does instead of dropping the row in silence (one `guard_advisory` appended to
`.guard-state/events.jsonl`, naming the condition and what became of the row), and names
`ABSENT_SESSION_ID_ADVISORY` in `hooks/lib/orchestrator-events.ts` as its stable prefix — so a
reader debugging that row has a route from the document to the code that emits it.

The first clause is answered by being unreachable and is deliberately not re-imposed: step C1
(`6357ebfc`) dropped the `existsSync` arm, so there is no disjunction to describe and no
`eventRowsAdmitted` to name. All three passages the record originally listed already describe
the surviving single-term gate correctly.

`npm test` stays green — `derivable-enumerations-lint` holds the `hooks/lib` table in set
equality with `hooks/lib/*.ts` and no module moved here, only row text.
