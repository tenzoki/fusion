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

---
**Reconciliation, 2026-08-14 (reconciler, verified at HEAD `18173e1`). The instance is cleared; the
defect this record describes is not.**

**What changed.** `/Users/k1/.fusion/agents/` now holds 17 prompts including `curator.md`, and both
`.claude-plugin/plugin.json` files read `8.2.0`. The user ran `fusion --update` and restarted, the
session resumed at 260814-1311, and T7 completed — the survey proposed 28 corrections and the apply
pass landed all 28 (`1a36fe4`, `0301909`).

**Why it stays open.** The record's own subject is the general shape, not this Circle's blocked
task: any Circle whose Directive is "build an agent and prove it by running it" cannot finish in one
session, because the session's agent roster is read at start from the installed copy and pinned for
its whole life. The record names three candidate answers — a documented two-session pattern, a
mid-session roster reload, or something else — and settles none. Nothing in the tree settles it
either: `CLAUDE.md` `## Release process` still states the remedy as "run `fusion --update` and
restart the session", which is the workaround this instance used, not a fix for the shape.

**One thing the workaround left behind, noticed while verifying this.** The install was updated to
`8.2.0` at 13:11, and three further commits (`1a36fe4`, `0301909`, `18173e1`) have since changed
shipped files under the same version number. The installed `8.2.0` and the source `8.2.0` are no
longer the same bytes. The Turn-3 review names this and declines to file it as belonging to the
release process rather than to this Circle; recorded here so the observation is not lost.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Documentation half stands; the mechanism half is still unmeasurable from inside a session.**

`grep -rn -i 'two-session\|roster reload' agents/ skills/ rules/ docs/ README*.md CLAUDE.md` returns nothing. The general shape — that an agent built in a session cannot be dispatched by that session — is written down nowhere; the only related instruction is `CLAUDE.md:96`, which tells a developer to `fusion --update` and restart, and is about stale *rules*, not about a roster that has grown a member.

The divergence the record's first note flagged is present again today: the installed copy at `~/.fusion` reads `10.2.0` and this tree reads `10.3.0`. Whether a session's agent roster is still pinned at start cannot be settled by reading the tree; it needs a launched session, which is what makes this record's own subject the obstacle to closing it.

---
Resolved: fixed — the between-releases paragraph now states the two-session shape (an agent built in a session is dispatched from the next, or headlessly against the work tree) as a documented pattern; `CLAUDE.md:99`
