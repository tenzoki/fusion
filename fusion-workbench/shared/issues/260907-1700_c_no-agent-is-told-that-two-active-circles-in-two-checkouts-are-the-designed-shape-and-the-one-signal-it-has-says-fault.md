No agent is told that two active Circles in two checkouts are the designed shape, and the one signal it has says fault

---

An orchestrator in a second checkout, offered an `_a_` Circle to activate while another Circle
carries `_t_` and a claim from a different checkout, cannot establish that this is the normal
multi-checkout shape. The sentence that settles it is emitted to no agent, and the one statement
that does reach an agent classifies the condition as a warning. The orchestrator then puts the
question to the user as a cost to be accepted rather than as the arrangement fusion is built for.

---

**Filed by:** consultant, Kai Stalmann <ks@qantr.com>

**What is true.** `rules/workbench-tracking.md` `## The four classes` puts `.active-circle` in
class L and states the purpose: per checkout by construction, and that is what makes two sessions
in two checkouts independent with no lock between them. `rules/circle-records.md`
`### The claim field` gives the claim its job, naming the checkout where a Circle is being worked,
precisely because one person's two checkouts share one git identity.

**What an agent receives.** `bin/fusion-rules orchestrator` emits `agent-setup.md`,
`fusion-workbench-conventions.md`, `critical-stance.md`, `user-facing-output.md`,
`decision-record-examples.md`, `circle-records.md` and `commit-lock.md`, plus the two stylometric
profiles. `workbench-tracking.md` is in no agent's emission: `grep -n workbench-tracking
bin/fusion-rules agents/*.md` returns nothing, and only four skill bodies cite it.

**What the agent does receive points the other way.** `agents/playmaker.md` `### Step 1: Inventory`
lists "More than one Circle record carries marker `_t_`" as `MULTIPLE-ACTIVE`, a mismatch condition
belonging in the portfolio's warnings; `skills/setup/SKILL.md` `## Step 0i` offers nothing and
writes nothing on it. `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` calls
the pointer the single source of truth for the active Circle, in the singular.
`rules/circle-records.md` states no bound on how many records may carry `_t_` at once, so nothing
in the agent's context contradicts the warning.

**Why the condition is ambiguous rather than merely undelivered.** `MULTIPLE-ACTIVE` counts `_t_`
records per project; the independence property is defined per checkout, over a file that never
travels. Two `_t_` records held by two different checkouts satisfy both, and no record decides
which reading governs. Searched: no decision or issue names the case.

**How the gap arose.** `260816-1707_*_to-whom-is-the-new-workbench-tracking-rule-emitted-when-its-consumers-are-a-human-and-a-skill.md`
chose emission to no agent, on the finding stated in its `## Question`: no executor agent applies
the rule. That held on 2026-08-16, when the consumers were a human writing a `.gitignore` and the
archive step. The file has since carried the independence sentence, and an orchestrator deciding on
a second activation applies it. The record is `_i_`, so nothing revisits it.

**Emission alone does not fix it.** The sentence sits in a table row about which root entries belong
in git, written as the justification for a tracking class. An orchestrator that received it would
be reading a `.gitignore` rule at an activation gate.

**Acceptance test.** An orchestrator holding only what `bin/fusion-rules orchestrator` emits can
answer, from that text alone, whether it may activate an `_a_` Circle while another Circle carries
`_t_` under a different checkout's claim, and `MULTIPLE-ACTIVE` states whether it fires when the
holders differ. Verified by reading the emitted set, not by dispatching a session.

**Observed 260907-1700.** A second orchestrator offered three options for
`260907-0829-message-between-checkouts-read-before-pull` while `260906-2258-bounded-executor-dispatches`
stood `_t_` and claimed by checkout `5e8248d7`, naming the two active records as a consequence the
user must accept. Its second option would have pointed that checkout at the claimed Circle.

---

**Resolved 260907-1939 by coder.** The statement is authored in `rules/circle-records.md`
`### How many Circles may be active, and in whose checkout`, and the two per-project counts that
contradicted it now read it.

**Why that file and not the one the issue names.** The issue's own `**Emission alone does not fix
it**` paragraph rules out emitting `rules/workbench-tracking.md`: the sentence sits in a
`.gitignore` justification and would be read at an activation gate. `rules/circle-records.md` is the
definition home for the Circle state vocabulary and for `**Claim:**`, the only field that can
attribute a `_t_` record to a checkout, so the count that reads that field belongs beside its
definition. No emission list changed: `bin/fusion-rules` already emits that file to `orchestrator`,
`playmaker` and `shaper`, which is the set of agents that transition or rank a Circle and therefore
the set that meets this question.

**What the section says.** The bound is one active Circle per checkout and there is no bound per
project, because `.active-circle` is class L and never travels. Every `_t_` record is attributed by
`**Claim:**` before any count is read, which sorts the records into three groups — this checkout's,
another checkout's, and the unattributable — disjoint and complete because the halves-test in
`### The claim field` either matches this checkout, matches some other, or does not resolve. The
first group carries `MULTIPLE-ACTIVE` and all three pointer conditions; the second is
`MULTI-CHECKOUT`, reported as the designed shape and never as a warning; the third is
`CLAIM-UNATTRIBUTED`, which resolves to neither of the others rather than guessing. Attributing per
record rather than per set is what made the split disjoint: an ordered cascade over the *set* let a
three-record workbench satisfy two branches at once.

**The consumers.** `agents/playmaker.md` `### Step 1: Inventory` attributes first and scopes all
four pointer conditions to the records this checkout claims; its `## Active (_t_)` render carries
one entry per `_t_` record with its holder, and more than one entry is no longer a warning. The
portfolio's `## Warnings` list gains `CLAIM-UNATTRIBUTED`. `/fusion:setup` Step 0i's
more-than-one-path branch names the outcome instead of reporting `MULTIPLE-ACTIVE` flat, and still
offers nothing and writes nothing in all three. `MISSING-POINTER` was fixed by the same change and
is not a second fix: a `_t_` record another checkout holds, with no pointer here, was reported as a
missing pointer for exactly the reason `MULTIPLE-ACTIVE` was reported as a fault.

**Not touched.** `/fusion:next`'s already-active gate reads `.active-circle` and so was already
per checkout. `rules/fusion-workbench-conventions.md` `## Path Resolution`'s singular reading of the
pointer is correct as it stands — the pointer answers "active *here*" — and editing it would spend
the blocking always-on budget for no gain in decidability.

**Acceptance test, run as the issue specifies — by reading the emitted set, not by dispatching a
session.** `bin/fusion-rules orchestrator` emits `rules/circle-records.md`. From that text alone an
orchestrator answers the issue's question: it may activate an `_a_` Circle while another Circle
carries `_t_` under a different checkout's claim, because the bound is per checkout and its own
`.active-circle` is empty; and the section states in its own words that `MULTIPLE-ACTIVE` does not
fire when the holders differ.

**Verification:** `cd hooks && npm test` — 910 passed, 1 failed. The failure is
`citation-sweep.test.ts` on a citation in a committed analysis of another Circle, measured identical
with this change stashed and filed as
`260907-1939_*_the-planability-analysis-spells-a-backlog-entrys-marker-and-the-citation-sweep-gate-is-red-on-it.md`.
Two goldens were regenerated and the `reference-resolution-lint` count pin re-approved with the
per-file revert measurement written into it, all three being the documented response to a
deliberate text change.
