The always-on gate_response ban is written without a scope and forbids the orchestrator the event its own prompt mandates

---
`rules/fusion-workbench-conventions.md:234` states the ban over every agent. `agents/orchestrator.md` mandates the same event in three places. The conventions file is always-on for all eleven agents, the orchestrator included, so the orchestrator reads both on every dispatch.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**The two statements.**

`rules/fusion-workbench-conventions.md:234`: "The answer is not, because it is consent — **no agent writes a `gate_response` event, and no agent answers a gate on the user's behalf.**" No clause narrows "agent" to a nested or non-orchestrator one.

`agents/orchestrator.md:238`: "If the task meets any condition in **Human Gate Rules**, emit `gate_hit`, put the gate to the user, and emit `gate_response` with their decision."
`agents/orchestrator.md:435`: "one `gate_response` per clause (`holds`/`does not hold`), from the one answer".
`agents/orchestrator.md:564`: the event table's own row for `gate_response`.

**What the ruling said.** `260913-0909_*_may-the-orchestrator-reach-every-tool-and-may-an-agent-dispatch-another.md`, the `Answered:` block: "an agent deciding it leaves a `gate_response` in the log with nobody having been asked". The prohibition there is on writing the event *without a human having answered*. The rule as written dropped that qualifier and turned a conditional ban into an absolute one.

**Why it is not only prose.** `gate_response` is a measured corpus. `agents/orchestrator.md:435` pins two literal strings because `260817-1613_*_does-a-plan-stated-precondition-get-any-mechanism-or-is-it-read-by-a-human-or-not-at-all.md` reserves a future measurement over them and says a renamed string splits the corpus in two. `skills/cadence/SKILL.md:184` reads gate answers per session off the same event. An orchestrator that resolves the contradiction in favour of the always-on rule stops writing the event, and both readings silently go to zero on a corpus whose own record says an absent figure must never read as a zero.

**Acceptance test.** The sentence at `rules/fusion-workbench-conventions.md:234` names the party it binds (the dispatched agent, or the agent that has not put the question to a human) rather than "no agent", and `grep -n "gate_response" agents/orchestrator.md rules/fusion-workbench-conventions.md` shows no statement that contradicts another. `cd hooks && npx vitest run lib/__tests__/reference-resolution-lint.test.ts lib/__tests__/surface-growth-bound.test.ts lib/__tests__/dispatch-bytes.test.ts` green; the conventions file is always-on, so any lengthening is charged to all eleven dispatch paths at zero head-room.
