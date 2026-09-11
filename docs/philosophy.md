# Fusion — Why It's Built This Way

Fusion is a multi-agent orchestration framework for Claude Code. Instead of one assistant doing everything, it runs a session as a team of small, tightly-scoped agents that coordinate through files on disk, with a human at the decisions that matter.

The problem it solves is context. An LLM's working context is the bottleneck: the more a single agent has to hold at once — the plan, the code, the ontology, the review criteria, the history — the more it drifts. Fusion splits the work across many narrow agents, each running against a focused prompt with only the context it needs, and puts a review pass and a coherence check behind the work so drift is caught while the session can still steer.

This doc explains *why* fusion is shaped the way it is and *how* a session runs behind the scenes. For hands-on install and usage, see `README.md`.

## Why it's built this way

**1. Specialization beats generalists.** Fusion ships **a fleet of narrow agents** — an orchestrator that dispatches the rest, plus coder, ontocoder, planner, shaper, reconciler, reviewer, analyst, consultant, editor, and curator. Each has a tight scope enforced in its prompt: a `coder` cannot edit ontology YAML, an `ontocoder` cannot edit Go, a reviewer never edits what it reviews. The cost is dispatch overhead — one task may pass through three agents before it lands. The payoff is reasoning quality per pass, because no agent strays into a layer it shouldn't touch.

**2. Coordination through files, not shared memory.** Sub-agents in Claude Code share no context with each other or their parent. Fusion turns that constraint into its design: every agent reads and writes files under `fusion-workbench/` — plans, issues, decisions, reviews, history. So runs are **interruptible** (close the session mid-flight and the next one reads the workbench and resumes), **auditable** (every agent leaves a paper trail), and **resumable across people** (a new contributor reads the workbench and picks up where the project is, not just where the code is).

**3. Traceability is a first-class output.** Every plan, decision, issue, review, and session log lands on disk as plain markdown you can read directly — no tool needed to see what the project decided last month or which review filed which issue. Three user surfaces feed and read that trail. `/fusion:memo` captures personal notes and todos into a per-user log. It also files an idea as its own new entry in the project backlog, and it is the one surface a user files such an entry from; the entry then waits in the store until somebody promotes it. The activity-log step of `/fusion:cleanup` scans commits and the workbench into a per-day activity log. `/fusion:cadence` digests the session histories, that activity log and the git history into three ranked lists: what was touched since yesterday, what the last seven days were about, and which themes recur across the most sessions. Fusion suits projects where *what you decided* and *what you did* matter as much as *what you shipped*.

**4. Observation, because enforcement was tried and measured.** A hook layer sees every write an agent makes. It **blocks nothing**. What it produces is a trace — one row per write-tool call, naming the tool and the file, in a log the monitor renders live — and a diagnostic when a project's own configuration file is broken or names something fusion has retired.

It was built the other way first, and this principle is what the measurements left. A **protected-path deny** held a list of files agents could never write; across roughly 450 records in fusion's own project and its largest consumer there was no instance of the failure it existed to prevent, and it cost 53 records in one project that exist only because agents could not write files that project owned. A **decision-governed deny** let a project name its own binding areas and blocked writes into them, escalating to a halt after three blocks; not one measured installation ever configured such an area, and all 50 recorded blocks in the larger consuming project read "Protected path" rather than a decision of its own. A **branch policy** read the text of a shell command to decide whether it was about to move HEAD; in one afternoon it produced 24 consecutive false blocks against the agents' own verification commands and no true positive, because the question it asked cannot be decided from a command's text.

Each removal is written up with its figures rather than quietly dropped, and the write trace and the diagnostic are what survived the arithmetic: they answer questions that are decidable from what a hook can actually see. Drift is caught by the reviewers and the coherence gates, which read what landed — not by a pre-check guessing at what a call is about to do.

**5. One framework, many project shapes.** The `reconciler` takes a **domain parameter** at dispatch: `code | data`. It picks that agent's ground-truth protocol; two further agents took the same parameter until v11 removed them. Same plumbing, different priorities — `code` favours user-visible features and bugs, `data` favours schema and ontology integrity. This lets fusion run on a Go monorepo and on an ontology project without a fork.

## How a session runs

The **orchestrator** is the only agent that dispatches others. It runs a five-step loop, once per task: **read the task** → **dispatch it** → **read what comes back** → **commit it** → **say where things stand, and ask what is next**. There is no queue and no phase count: one task is in flight at a time, and the next one comes from you, from the plan or issue the session is working through, or from what the last return uncovered. Sub-agents do focused work and return; everything they produce travels as files, so nothing is lost between dispatches.

**How it decides it's done.** When you ask for a reconciliation, and again when a unit of work wraps up, three consistency questions are checked:

- **Grounding** — does the work match what we said we were building on?
- **Directive** — does it move toward the stated outcome?
- **Reachability** — is that outcome still reachable given what we've learned?

If all three hold, the work continues or closes cleanly. If something is off, the orchestrator opens the **Rebalance gate** and hands the choice to the user: revise the work (another execution pass), revise the goal, revise the assumptions it was built on, or accept a bounded stop — the goal is judged unreachable, and what was learned along the way is the result.

That last option matters because the **Directive is revisable** — a stated outcome that can change mid-work when the assumptions turn out wrong or the world moves, not a fixed target to push against until it breaks.

A unit of work is a **work item**: one directory in the project's backlog, holding the record that carries its Directive and its state, and everything the item produces. Most sessions never need one — you tell the orchestrator a task and it runs it. When you have several units of future work, you file each as an item and claim one by hand. Nothing ranks them: a ranking agent and its command did until v11, when both were removed. `README.md` owns the operational detail.

## What fusion is not

- **Not autonomous.** Fusion stops and asks before destructive operations, ontology changes, ambiguous tasks, and structural decisions. Human-in-the-loop, deliberately.
- **Not a replacement for human review.** The `reviewer` agent reviews what a unit of work landed, at its close; the human still owns the final merge.
- **Not project-specific.** Every agent is project-agnostic. Domain knowledge lives in the consuming project's `./rules/` (fusion-agent rules) and `.claude/rules/` (project-wide rules) — the plugin ships nobody's assumptions.

## Where to read more

- `README.md` — install, setup, first session, best practices, configuration.
- [`working-model.md`](working-model.md) — how the working model operates: the work item's life, the spec-driven pipeline, the gates, and the compliance guard, walked end to end (the "how" companion to this "why").
- `README-agents.md` — the full agent reference (scope, inputs, outputs, when to invoke).
- `README-hooks.md` — the compliance guard in detail.
- `CLAUDE.md` — layout, release process, troubleshooting (for plugin developers).
- `rules/fusion-workbench-conventions.md` — workbench layout, the work-item grammar, and the issue/planning and decision marker vocabularies.
- Run `/fusion:help` inside Claude Code for an interactive explainer.
