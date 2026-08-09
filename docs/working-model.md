# Fusion — How the Working Model Operates

This is the *how it works in practice* guide. It walks through the shape of a fusion session — the unit of work, the flow from request to result, the gates where fusion stops and asks you, and the guard that watches every file write.

For *why* fusion is built this way, see [`docs/philosophy.md`](philosophy.md). For install and hands-on usage, see [`README.md`](../README.md). This doc sits between them: it explains the machinery you'll steer.

## 1. The Circle — one unit of work

A **Circle** is one bounded unit of work. It is defined by three things: a **Directive** (the outcome you're aiming for), its **Grounding** (what you know going in — the assumptions and facts the work builds on), and its **Artifact** (what the work produces). When those three hold together, the Circle is done.

A Circle moves through a small set of states. Each state is written as a single letter between underscores in the Circle's record filename (`_t_circle.md` means the active one):

- **anticipated** (`_a_`) — captured as future work, not started. A provisional Directive with no Grounding yet.
- **active** (`_t_`) — being worked on right now. Directive refined, Grounding filled in, the orchestrator running it.
- **closed-coherent** (`_c_`) — finished cleanly; the work matched the goal.
- **bounded** (`_b_`) — stopped short because the goal turned out unreachable; what was learned is the result.
- **superseded** (`_s_`) — replaced by another Circle (scope split, or redirected).
- **deferred** (`_d_`) — an anticipated Circle pushed out indefinitely.

The last four are terminal — a closed Circle is never reopened. If work needs to continue, a new Circle is created that cites the old one.

**A Circle is a directory, not a file.** It lives at `fusion-workbench/circles/<timestamp>-<slug>/` and holds everything that unit of work produces — its plans, issues, decisions, reviews, and session history, each in its own subfolder. The directory name never changes across the Circle's life, so references into it never break; only the state letter on the record file inside moves.

**One Circle is active at a time.** A one-line pointer file, `.active-circle`, names the active Circle's directory. The orchestrator writes it when a Circle goes active and deletes it when the Circle closes. Most sessions run a single Circle implicitly — you don't have to think about Circles at all until you have several units of future work to juggle. When you do, capture them (see the portfolio note in [`README.md`](../README.md)) and run them one at a time.

## 2. Spec-driven flow

Fusion doesn't execute a vague request directly. It turns the request into a written contract first, then judges the work against that contract. The flow:

```
your request → shaper → SPEC GATE → planner → PLAN GATE → execute → report
                (if the request needs sharpening)
```

- **shaper** takes an ambiguous or many-sided request and produces a **spec** — a precise statement of what will be built, with the hidden decisions surfaced. If your request is already clear and single-purpose, the shaper is skipped and fusion goes straight to planning.
- The **spec gate** is where you approve (or revise) what will be built, before any planning happens.
- **planner** turns the approved spec into a **plan** — ordered, dependency-aware steps, each routed to an executor (coder for code, ontocoder for data and ontology).
- The **plan gate** is where you approve *how* it will be built, before any code is written.
- **execute** runs the plan step by step.

The spec and the plan are the contract. Every later check — "is this work still on track?" — is measured against them, not against a fresh reading of your original sentence.

## 3. The gates

Fusion is deliberately not autonomous. It stops and hands you the decision at defined points.

**Human gates — fusion stops and asks before:**

- reviewing a produced **spec** (approve what gets built),
- reviewing a produced **plan** (approve how it gets built),
- any **ontology or structured-data change** (every `ontocoder` task, and especially structural changes to entities, relations, or schemas),
- **destructive operations** — deleting files, removing features, dropping data,
- an **ambiguous task** where scope or acceptance criteria can't be pinned down,
- **switching git branches** — agents never change branch on their own.

At each gate you get plain choices: proceed, skip for later, defer, or modify the instruction.

**The per-Turn Coherence check.** Work runs in **Turns** — one Turn is a batch of tasks plus a review. At the end of each Turn, fusion asks three questions about what just landed:

1. **Grounding** — does the work still match the assumptions it was built on?
2. **Directive** — does it move toward the stated goal?
3. **Reachability** — is that goal still reachable, given what we've learned?

If all three hold, the work continues. If something is off, fusion opens the Rebalance gate rather than pushing ahead.

**The Rebalance gate.** When coherence breaks, you choose among four moves — in plain terms:

- **Revise the work** — the goal and assumptions are fine; the output isn't there yet. Run another Turn.
- **Revise the goal** — the destination was wrong. Re-shape the Directive.
- **Revise the assumptions** — the basis was wrong. Record a new decision (the Grounding changes).
- **Accept a bounded stop** — the goal isn't reachable as stated; what was learned along the way is the result, and the session ends acknowledging that.

That last option is the point of the whole model: the goal can change mid-work when the world or the facts turn out different, instead of being a fixed target you push against until something breaks.

## 4. The hooks

While the gates govern *decisions*, a **compliance guard** governs *file writes*. It runs on every edit an agent attempts, and it is deliberately narrow about what it blocks:

- **Protected paths — blocked.** Agent definitions, rules, and workbench state files are off-limits to agents. A write to one is denied outright.
- **Decision-governed paths — blocked only at high sensitivity.** Files a project decision governs carry a sensitivity level. Only `high` blocks; `medium` and `low` pass. This lets a project ring-fence its most binding areas without freezing everything.
- **Churn — observation only.** The guard counts how often each file is touched in a session. When a file is thrashed past the threshold, it emits a **warning** the monitor and orchestrator can see. The count is taken *after* the write and never blocks it: it signals, it does not stop.
- **Escalation → halt.** Consecutive blocks accumulate. After a threshold (default 3), the guard enters **halt** and blocks all writes until a human clears it. This catches an agent stuck retrying something it's not allowed to do.
- **Git branch switches — blocked.** Agents cannot `git switch`, `git checkout <branch>`, or `git worktree add`. This is enforced at the command level; you can't reword around it. Only you, by setting a session environment variable, can allow it.

So of everything the guard watches, only three things ever block a write: a protected path, a high-sensitivity decision-governed path, and an active halt. Churn only warns.

The guard runs on a spectrum from full enforcement to advisory to fully off. For how to tune or disable it, see the README's [Tuning or disabling the compliance guard](../README.md#tuning-or-disabling-the-compliance-guard); for the full guard model and configuration, see [`README-hooks.md`](../README-hooks.md).

## 5. A worked walkthrough

One session, from request to close, with each gate and hook marked:

1. You say: *"Add rate-limiting to the API and cover it with tests."*
2. The **orchestrator** resolves the scope: this is code work, one clear outcome.
3. The request is specific enough, so the **shaper** is skipped. The **planner** produces a plan — a middleware step, a config step, a test step.
4. **PLAN GATE** — you review the three steps and approve.
5. **Turn 1 begins.** The **coder** edits the middleware. Each write passes through the **guard** — the middleware file isn't protected, sensitivity is normal, so the write lands. The coder edits it twice more while iterating; on the third touch the guard emits a churn *warning* (visible on the monitor) but does not block.
6. **coderev** reviews the Turn's changes and files any findings as issues.
7. The orchestrator **commits** the work (holding the commit lock so parallel agents don't collide on the git index).
8. **Per-Turn Coherence check** — the three questions pass: the work matches the assumptions, moves toward the goal, and the goal is still reachable. The Turn continues.
9. Turn 2 handles the tests the same way. The queue is now empty.
10. **Final reconciliation** — the `reconciler` verifies the tracking files against the actual code and confirms the Circle is coherent.
11. The Circle closes as **closed-coherent** (`_c_`), the `.active-circle` pointer is removed, and the orchestrator **reports** what landed.

Had step 8 shown the work drifting — say the coder had started refactoring an unrelated module — the Coherence check would have flagged it and opened the **Rebalance gate** for you to steer.

## 6. Where to go next

- [`docs/philosophy.md`](philosophy.md) — *why* fusion is built this way (the design ideas behind Circles, file-based coordination, and the guard).
- [`README.md`](../README.md) — install, setup, your first session, best practices, configuration.
- [`README-hooks.md`](../README-hooks.md) — the compliance guard in full: config fields, sensitivities, thresholds, halt clearing.
- [`rules/fusion-workbench-conventions.md`](../rules/fusion-workbench-conventions.md) — the exact workbench layout and the issue, planning and decision marker vocabularies. The Circle state vocabulary and the Circle-record template are next door in [`rules/circle-records.md`](../rules/circle-records.md).
- Run `/fusion:help` inside Claude Code for an interactive explainer.
