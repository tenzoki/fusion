The curator is not in the orchestrator's dispatch allowlist, so two of its three invocation shapes cannot be reached

---
`agents/orchestrator.md:4` lists thirteen namespaced sub-agents in its `tools:` line and
`fusion:curator` is not among them. The orchestrator is the only agent that dispatches, so the
"dispatched by another agent" shape in `agents/curator.md` `## Tool Discipline` has no possible
caller, and the spec's C7 acceptance criterion — "The agent is dispatchable directly, without the
skill, for a user **or an orchestrator** that wants it mid-session"
(`260814-0738_*_spec-curator.md:245`) — is not met.

---
**What is verified.** `agents/orchestrator.md:4` reads
`tools: Agent(fusion:coder, fusion:ontocoder, fusion:planner, fusion:shaper, fusion:coderev,
fusion:ontorev, fusion:conceptrev, fusion:reconciler, fusion:taskplanner, fusion:analyst,
fusion:bugfixer, fusion:playmaker, fusion:editor), Bash, Read, Write, Edit, Glob, Grep, Skill,
AskUserQuestion`. The curator is absent, and so is it from the `description` line above it, which
enumerates the same set for the model. `agents/curator.md` `## Tool Discipline` nonetheless
describes a third shape in full: "Dispatched by another agent. You run non-interactively … return
the gate question to the dispatcher … The dispatcher proxies it to the user and re-dispatches you
in `apply` mode with the approvals." `README-agents.md` `## Dispatch parameters` carries the same
claim in the `Passed by` cell of the `**Ledger:**` row, "or an agent that proxied the gate question
to the user" — in a column whose preamble states that every cell was read against `agents/*.md` and
every skill body.

**The plan did not ask for the registration and the spec did.** Plan step 2's file list
(`260814-0845_*_plan-curator.md`) does not name
`agents/orchestrator.md`, so the implementation followed the plan exactly. The unmet criterion is
the spec's, and the gap entered at planning time rather than at execution time.

**A second consequence, labelled `inference:` because it is not measured.** `install.sh` writes a
launcher that runs `claude --agent fusion:orchestrator`, so the default fusion session *is* the
orchestrator agent and its `tools:` line is that session's allowlist. `/fusion:curate` dispatches
`Agent(fusion:curator)` (`skills/curate/SKILL.md:3`), and every other agent-dispatching skill in
the tree dispatches an allowlisted agent — `reconciler` from `/fusion:cleanup`, `shaper` from
`/fusion:direct` and `/fusion:seed-from-plane`, `playmaker` from `/fusion:next` (verified by grep
over `skills/*/SKILL.md`). `/fusion:curate` is the first that does not. Whether a skill body's own
`allowed-tools` grant overrides the agent allowlist is the open question: `CLAUDE.md`'s
troubleshooting table records one measured case reading each way, the `AskUserQuestion` row where
"the skill path worked" while the orchestrator agent was denied, and the row above it where a
missing namespace in the allowlist produced `denied by permission rule 'Agent(...)' from settings`.
This is cheap to settle empirically and expensive to guess at, and `CLAUDE.md`'s release step 0
already requires an end-to-end dispatch for exactly this class of change.

**Two candidate resolutions, neither chosen here.** Add `fusion:curator` to the orchestrator's
`tools:` allowlist and to its `description`, which satisfies C7 and removes the doubt about the
skill path in one edit. Or, if the orchestrator is deliberately not to reach a gated rewriter of
binding rules mid-session, delete the third invocation shape from `agents/curator.md`
`## Tool Discipline` and the `or an agent that proxied` clause from `README-agents.md`, and record
the exclusion against C7. What is not tenable is the present state, where the prose describes a
path the configuration forbids.

**Filed by:** coderev, reviewing `d7786eb..5b81f5a`. Circle store per the Origin Rule — the gap
arose from this Circle's Directive.

---
Resolved: Took the first of the two candidate resolutions — the curator is registered, not the third invocation shape deleted, because the spec's C7 requires orchestrator dispatchability. Four sites in `agents/orchestrator.md`: `fusion:curator` added to the `tools:` `Agent(...)` allowlist and to the `description:` enumeration (lines 3-4), added to the `## Scope` "Invoke sub-agents" list, and given a row in `## Agents the Orchestrator Invokes` whose When column reads "outside every phase, only when the user asks mid-session" — it is not a Turn-loop executor and is not in the Agent Routing Table, which routes queue tasks. A paragraph under that table states why the curator is not in the never-invokes class (the third shape in `agents/curator.md` `## Tool Discipline` is written for a dispatching agent and the orchestrator is the only one) and spells out the proxy obligation: dispatch survey, put the returned gate question to the user, re-dispatch apply with `**Ledger:**` and `**Approved:**`, never approve on the user's behalf, never dispatch apply on an empty approval set.
The `inference:` in this record is now measured, and it reads the safe way. A headless smoke run in a scratch directory (`claude --plugin-dir <repo> --agent fusion:orchestrator`, permissions NOT skipped) dispatched `Agent(fusion:curator)` successfully and got the sub-agent's reply back; the control dispatch of `fusion:consultant`, which is deliberately not allowlisted, failed with "Agent type 'fusion:consultant' not found" and listed the 14 available `fusion:*` agents with `curator` among them. So the allowlist grants the dispatch, the fleet still loads after the frontmatter change (the v2.8.1 failure mode did not recur), and `claude plugin validate .` passes with only the pre-existing CLAUDE.md warning. No count claim moved: the affected enumerations are name lists, not digits, and the enumeration lint's five digit claims are about the agent tree, which is unchanged.
