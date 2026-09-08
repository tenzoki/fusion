No dispatch of this session reaches an executor with the bounded-dispatch rule attached by Setup

---
The installed copy of the plugin at `$FUSION_PLUGIN_ROOT` predates the `IS_BOUND_AGENT` case arm:
`grep -c IS_BOUND_AGENT` reads 0 there and 4 in the work tree. Every sub-agent resolves its rules by
running `"$FUSION_PLUGIN_ROOT/bin/fusion-rules" <self>` at its own Setup, so no executor dispatched in
this session receives `rules/bounded-dispatch.md` through the emission this Circle built. Measured by
the coder executing plan step 13, which read the file from the work tree because the dispatch prompt
pointed it there.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**This is a known standing cost, not a new defect in the mechanism.** The class is
`260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`
in the shared store, closed: a session's helpers come from the installed copy, pinned for the whole
session, so anything this repository adds to `bin/` is absent until `fusion --update` and a restart.
`CLAUDE.md` states the same shape one level up for agents and skills, and calls a Circle that builds
one and proves it by running it a two-session shape. The emission itself is verified: `./bin/fusion-rules`
returns the path for each of the seven and for none of the other eight, and the golden pins it.

**Why it is filed here rather than left to the class record.** One of this Circle's closure clauses
asks whether an orchestrator dispatch of each of the seven bound agents carries a `**Stop by:**` line.
The supply half is answerable in this session and is being answered: the orchestrator computes the
value and writes the line, and the first such dispatch was step 13's. The receipt half is not, if
receipt is read as *the rule arrived through the agent's own Setup emission*. Anyone answering that
clause off a Setup emission in this session will read a false negative.

**What the evidence from step 13 does establish.** The executor was given the stopping time on the
dispatch prompt, read the rule from the path the prompt named, worked inside the bound and reported
finishing at 16:27Z against a 16:39Z stopping time. So the contract is followed when the agent has the
text; what is unproven here is the delivery route, not the contract.

**Acceptance test.** After `fusion --update` and a session restart, `"$FUSION_PLUGIN_ROOT/bin/fusion-rules" coder`
emits `rules/bounded-dispatch.md`, and a dispatch of one bound agent that names no rule-file path in
its prompt still returns a bounded return when it passes its stopping time. Neither half is reachable
from this session.

---
Reconciliation 2026-09-08: verified against the tree at `de94102f` and still open. The passage this record is about is unchanged in its source file, so the defect stands whatever the plan step's marker says.

---
Reconciliation 2026-09-08: confirmed on the tree. `"$FUSION_PLUGIN_ROOT"/bin/fusion-rules reconciler` emitted four rule paths and no `bounded-dispatch.md`, while the work tree's `bin/fusion-rules reconciler` emits it. This reconciler dispatch is the sixth of the session to reach an executor without the rule attached by Setup, and it read the file only because the dispatch prompt named it. The marker stays `_o_`.
