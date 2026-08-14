The proof run cannot be dispatched from the session that built the agent

---
C11, the Circle's proof half, is a run of the `curator` agent. The orchestrator session that built
that agent cannot dispatch it: `Agent(fusion:curator)` returns `Agent type 'fusion:curator' not
found` and lists thirteen `fusion:*` agents, the curator absent. `/fusion:curate` is equally
unavailable. A session's agent and skill roster is read at session start from the **installed**
plugin copy, which is pinned for the session's whole life, and the curator exists only in the work
tree.

---
**Verified 2026-08-14, after commit `2a8a2f7`.** `/Users/k1/.fusion/agents/` holds 16 files and no
`curator.md`; `/Users/k1/.fusion/skills/` holds 16 directories and no `curate/`. The work tree holds
both, committed at `6ba9d77` and `44b9967`. Both `.claude-plugin/plugin.json` files disagree on
version now, the work tree having been bumped to 8.2.0 in `6ba9d77`.

**This is not a defect in the Circle's work.** The agent is registered correctly and was proved
loadable: Turn 2 ran a headless dispatch against `--plugin-dir <repo>` with permissions enabled, the
curator replied, and a control dispatch of a deliberately unlisted agent was refused by name
(`circles/260801-1244-curator/reviews/260814-1128-coderev-curator-turn-2.md`). What cannot reach it
is *this* session.

**It is the standing release gap arriving at the one moment it costs something.** `portfolio.md`
has carried `installed-copy-predates-the-backlog-mandate` across six playmaker runs, and `CLAUDE.md`
`## Release process` states the remedy in the paragraph beginning "And between releases": run
`fusion --update` and restart the session. Until now the cost was a playmaker that could not write
to the backlog store. Here it is a Circle whose Directive names a proof run that the building
session cannot perform.

**The general shape, which outlives this Circle.** Any Circle whose Directive is "build an agent and
prove it by running it" is structurally unable to finish in one session, because the session that
builds the agent predates it. Nothing in fusion says so, and the plan for this Circle did not
foresee it — `## Validation Run (C11)` names the run without naming who can invoke it. Whether the
answer is a documented two-session pattern, a mid-session roster reload, or something else is not
settled here.

**Two ways out, neither chosen by this record.** Run `fusion --update`, restart, and perform C11 in
a fresh session with the Circle still active. Or invoke the curator headlessly against the work tree
(`claude --plugin-dir <repo> --agent fusion:curator`), which is the shape Turn 2's smoke test used
and which does reach the agent, at the cost of running outside the orchestrator's dispatch.

**Filed in the Circle's store** per the Origin Rule: it arose from executing this Directive, at the
step the Directive itself names.

**Filed by:** orchestrator, session `shared/history/260813-2345-orchestrator-session.md`.
