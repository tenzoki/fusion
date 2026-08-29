# The `unmeasured` cause list assigns "a project outside git" to the branch that cannot reach it

---

**Severity:** Low — the prose taxonomy of the two `why=` causes overlaps the code's branch split, in a paragraph whose subject is naming the cause correctly
**Domain:** code
**Filed by:** coderev (Turn 3 review, range `7d9efc8..adaa545`)
**Affects:** `agents/orchestrator.md:649` (the "Two bounds" paragraph), `agents/orchestrator.md:626-628` (the branches)
**Cross-references:**
`shared/issues/260811-1406_c_*` (the record whose whole complaint was that the prompt directed the model to name a cause that was not the cause);
`rules/critical-stance.md` §4 (a case split is disjoint and complete)

---

## What is wrong

`agents/orchestrator.md:649` enumerates the causes behind each `why=` value:

> `no-anchor-in-agentstate` when the state file is missing or carries no `git_head_at_start` and
> `started`, and `workbench-not-in-anchor-commit` when the anchor resolves to no workbench tree — an
> untracked workbench, **a project outside git**, or an anchor that has left this repository's
> history.

Two mismatches with the code.

**1. "A project outside git" lands in the other branch.** Setup Step 5 records the anchor
conditionally — *"Note current git HEAD (if git repo)"* — so a project outside git writes no
`git_head_at_start`, `[ -z "$A" ]` is true, and branch 1 fires. Measured, block extracted verbatim,
`/bin/bash`, no `.git` anywhere:

```
--- no git, empty anchor ---
records=unmeasured why=no-anchor-in-agentstate anchor=none start=260811-1000
--- no git, anchor present ---
records=unmeasured why=workbench-not-in-anchor-commit anchor=abc1234 start=260811-1000
```

Branch 2 reaches "outside git" only when a valid-looking anchor was recorded and the repository
disappeared mid-session, which is not the case a reader of that sentence pictures.

**2. Branch 1's prose reads as a conjunction, the code is a disjunction.** *"carries no
`git_head_at_start` and `started`"* describes a state file lacking both; the code is
`[ -z "$A" ] || [ -z "$T" ]` and fires on either.

## Why it is worth a record rather than a wording pass

The instruction attached to the list is *"name the cause the block reported, never one you
inferred"*, and the model does copy the `why=` field through, so no wrong cause reaches the user
today. The cost is on the next reader of this paragraph: it is the one place the two causes are
explained, and a session diagnosing `no-anchor-in-agentstate` on a project outside git will not find
that case listed under the value it got. That is precisely the failure `260811-1406` was filed
against, one layer up — a stated cause list that does not correspond to the branch that fires.

## Suggested direction

Move "a project outside git" to branch 1's list with the reason (Setup records no HEAD outside a git
repository), leave branch 2 with the two causes it can actually reach, and change *"carries no
`git_head_at_start` and `started`"* to *"missing either `git_head_at_start` or `started`"*.

## Acceptance criteria

- [ ] Every cause named under a `why=` value is reachable by the branch that emits that value.
- [ ] Branch 1's description matches its `||`.
- [ ] Cases in `record-counts-measurement.test.ts` cover a project outside git in both anchor states.


---

Resolved: The cause list now matches the branches. `no-anchor-in-agentstate` reads "`agentstate.yaml`
is missing or unreadable, or is missing either `git_head_at_start` or `started` — either one alone is
enough, and a project outside git belongs here rather than below, because Setup Step 5 records the
anchor only in a git repository, so no `git_head_at_start` is written at all";
`workbench-not-in-anchor-commit` keeps the two causes it can reach, an untracked workbench and an
anchor that has left this repository's history. The conjunction is gone.

Landed on top of `260811-1610`, which split the block's gate, so the branch a project outside git
reaches now also prints its filed counts.

Gated twice in `hooks/lib/__tests__/record-counts-measurement.test.ts`. Behaviour: a fixture with no
`.git` anywhere, run in both shells in both anchor states — nothing recorded (the shape Setup
actually leaves outside git) reports `no-anchor-in-agentstate`, a recorded hash with the repository
gone reports `workbench-not-in-anchor-commit`. Prose: one case asserts "outside git" falls between
the two backticked cause names in the section (so it cannot drift back under the branch that cannot
reach it), one asserts the disjunction wording and the absence of the old conjunction.
`cd hooks && npm test` — 50 files, 1301 passed, exit 0.
