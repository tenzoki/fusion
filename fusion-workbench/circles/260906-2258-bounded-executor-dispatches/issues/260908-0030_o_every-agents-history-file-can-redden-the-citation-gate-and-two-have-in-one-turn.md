Every agent's own history file can redden the citation gate, and two did inside one Turn

---
A dispatched agent writes a history file at the end of its run and routinely cites the plan, the
issue or the decision it worked from. When it spells the state marker (`_o_`) instead of writing the
wildcard (`_*_`) the citation grammar reads the token as a bare record, and
`hooks/lib/__tests__/citation-sweep.test.ts` fails the whole suite. The gate runs the sweep with
`cwd: REPO_ROOT` and no `--root`, so it reads the **working tree**: an untracked file written thirty
seconds ago reddens it exactly as a committed one does.

Measured in one Turn of `260906-2258-bounded-executor-dispatches` on 260908:

- `260907-0710-planability-of-the-bounded-dispatch-spec.md` lines 21 and 331 — filed separately as
  `260907-1939_*_the-planability-analysis-spells-a-backlog-entrys-marker-and-the-citation-sweep-gate-is-red-on-it.md`,
  repaired by a bugfixer dispatch.
- `260908-0003-coder-dispatch-minutes-config-leaf.md` lines 8 and 41 — written by the coder executing
  plan step 2, after the first record was filed, in the same fault class.

Two files, two agents, two dispatches, one Turn. The first was treated as a one-off; the second says
it is not.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Why this is worth a record of its own.** The plan this Turn is executing has fifteen steps left,
and every one of them ends with an agent writing a history file that cites the plan. On the rate
observed the suite reddens repeatedly, and each occurrence costs a bugfixer dispatch that fixes two
characters. The cost is not the repair; it is that a red suite is indistinguishable at a glance from
a real regression, so every occurrence has to be read before it can be dismissed.

**What this record does not claim.** It does not say the gate is wrong to read the working tree, and
it does not propose relaxing it. Reading the working tree is what lets it catch a bad citation before
the commit rather than after, and `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
accepted the cost of a gate that reddens for somebody who touched nothing. The defect is that the
writers keep producing the fault, not that the reader keeps noticing it.

**Evidence path.** `rules/fusion-workbench-conventions.md` `## Filename Patterns` carries the rule
and the reason: the wildcard is what makes a citation survive its target's next marker move.

**The coder was asked whether the rule reaches it, and answered that it does.** Verbatim: *"die Regel
kommt an, sie wurde übergangen."* `bin/fusion-rules coder` emits `fusion-workbench-conventions.md`
as its second path, `rules/agent-setup.md` is emitted first and says to read every emitted path, and
the citation rule sits on the always-on floor of every single coder dispatch. So this is not a gap in
what an agent is given.

Its diagnosis of why it was overridden is the part worth keeping. The rule is one sentence inside a
long running paragraph of a 350-line file. Nothing between reading it and writing the history file
asks about it: `agents/coder.md` names the conventions as a whole at the write step, and the report
form that closes every dispatch has no field in which a citation form would show up. The only reader
that notices runs at the end of the test suite, by which time the history file is already written.

**That makes this an instance of a fault class this project has already measured**, and the record
that holds it is `260814-1733_*_attach-the-rule-to-the-act.md` in the shared backlog: an obligation
that stands alone and has to be recalled at the right moment is dropped, while one riding an act the
agent performs anyway holds. The measured contrast in
`260812-0303-simplify-speed-and-why-rules-do-not-hold.md` is 28.6 percent dropped against an attached
obligation that did not fail once. This defect is that contrast arriving twice in one Turn, in the
same workbench that filed it.

**Consequence for this plan:** expect recurrence at each of the remaining steps. Repairing each one
after the fact costs a dispatch; naming the citation form in every dispatch prompt is itself the
standalone obligation the class is about, moved one level up.

**Acceptance test.** Run the plan's remaining steps and count how many end with a history file the
citation gate rejects. The defect is closed when that count is zero for a run of steps in which no
dispatch prompt mentioned the citation form — a dispatch that has to warn about it every time is a
standalone obligation, which this project measures being dropped.
