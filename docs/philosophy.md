# Fusion — Philosophy

Fusion is a multi-agent orchestration framework for Claude Code. It rests on three load-bearing ideas, plus one design parameter that lets the same plumbing serve very different kinds of projects.

## 1. Specialization beats generalists

Instead of one assistant that does everything, fusion ships **13 narrow agents** — coder, ontocoder, planner, shaper, taskplanner, reconciler, coderev, ontorev, analyst, investigator, bugfixer, consultant, and an orchestrator that dispatches the others.

Each agent has:

- A **tight scope** (what it owns, what it must not touch)
- A **prose-enforced boundary** in its prompt (e.g. *"You may NOT edit ontology files"*)
- A **single output shape** (issue files, plan files, review reports, decision records, etc.)

A `coder` cannot edit ontology YAML; an `ontocoder` cannot edit Go; a reviewer never edits the thing it reviews. The cost is dispatch overhead — one task may bounce through three agents before it lands. The benefit is **reasoning quality per pass**: each agent runs against a focused prompt with relevant context only, so it doesn't drift into adjacent layers it shouldn't be touching.

This is the inverse of the "one big assistant" pattern. Fusion is built on the bet that the LLM-context is the bottleneck, and that splitting work across many small contexts beats stuffing everything into one large one.

## 2. Workbench-mediated coordination, not shared memory

Sub-agents in Claude Code share **no context** with their parent or with each other. By default this is a constraint people work around. Fusion turns it into the design.

Every agent reads and writes files under `fusion-workbench/`:

- `planning/` — design documents
- `issues/` — defects ("go fix it")
- `decisions/` — open questions ("decide and record")
- `history/` — session logs
- `codereview/`, `ontoreview/` — review findings
- `analyses/`, `investigations/`, `consult/` — typed reports
- `tasklist.md` — the dependency-ordered work queue

Coordination happens through the filesystem, not through agent memory. Three consequences:

- **Runs are interruptible.** Crash or close the session mid-flight; the next session reads the workbench and resumes from where the last one left off. The orchestrator's `agentstate.yaml` makes this explicit.
- **Runs are auditable.** Every agent's work leaves a paper trail. Decision rationale, issue history, review findings, and reconciliation passes are all on disk and version-controllable.
- **Runs are resumable across humans.** The workbench is the project's shared cross-session memory. A new contributor can read it and pick up where the project is, not just where the codebase is.

This makes fusion well-suited for projects where *what you decided and why* matters as much as *what you shipped*.

## 3. Compliance over speed

A **compliance guard** watches every edit. It tracks per-file churn, detects ping-back loops (A→B→A→B edit cycles that don't trip per-file thresholds), and escalates when an agent revisits the same file too often. Beyond a configurable threshold the guard halts the session and surfaces the pattern.

The guard catches:

- An agent oscillating on a file because it doesn't have enough context to converge
- Scope creep — an executor "improving" things adjacent to its task
- Cross-file edit storms that look like a refactor but aren't governed by a plan

Drift gets caught **at write time**, not at PR review.

This makes fusion well-suited to high-trust domains — ontology, regulatory, multi-domain knowledge work, anything where bad edits cost more than slow edits. It is **less appropriate** for hot-loop prototyping where you want to thrash freely.

## 4. Domain parameterization

Three of the agents (`taskplanner`, `reconciler`, `planner`) accept a **domain parameter** at dispatch time: `code | data | strategic | knowledge`. The orchestrator detects which kind of project it's in (code-heavy, data-heavy, strategic / decision-heavy, knowledge / analysis-heavy) and passes that domain into every dispatch.

Same plumbing, different priorities:

- **`code`** — defaults the priority axis to user-visible features and bug fixes
- **`data`** — prioritises ontology consistency and schema integrity
- **`strategic`** — prioritises decisions blocking implementation
- **`knowledge`** — prioritises analyses whose absence blocks downstream design

This is what lets fusion be both "the framework you'd run on a Go monorepo" and "the framework you'd run on a strategy team's decision archive" without a fork.

## 5. Directive ≠ static Goal

Earlier versions of this plugin called the user's stated outcome the *Goal*. v2.9.0 renames it to **Directive**, after foundation_V3 §1.1.

A Goal in classical project-management vocabulary is fixed at the start and reached at the end. A Directive is different: it *prognosticates* the Artifact's state at completion, but it is **revisable** as the Circle evolves. When a Turn's Coherence Review reveals that the stated Directive cannot be reached as written — because the Grounding turned out wrong, or the world changed, or the team learned something the Directive didn't anticipate — the user can choose to **Rebalance the Directive** rather than push harder against an Artifact that won't converge.

Three Rebalance options exist:

- **Revise Artifact** — the Artifact is not where we want it; do another Turn.
- **Revise Grounding** — the basis we built on was wrong; file a new decision.
- **Revise Directive** — the destination we set was wrong; re-shape.

A fourth option — **Accept Bounded Closure** — applies when the Directive is judged definitively unreachable: what was learned along the way is the Artifact, and the Circle ends acknowledging that.

This is why "Goal → Directive" is not a cosmetic rename. It signals that the orchestrator now treats the user's stated outcome as a *living* element of the work, not a fixed target.

**Note on Circle in v2.9.0.** This plugin does not yet have a first-class `circles/` workbench folder; that arrives with Track C (see `decisions/260509-1556[o]-playmaker-and-circles-folder.md`). Until then, an orchestrator session is the practical proxy for a Circle: the session's history file carries the Directive, accumulates Turns, and concludes with the per-Circle Coherence verdict. When Circle envelopes ship, this section's references to "Circle" become structural, not metaphorical.

## What fusion is not

- **Not an autonomous coding agent.** Fusion stops and asks the user before destructive operations, ontology changes, ambiguous tasks, and structural decisions. It is a *human-in-the-loop* framework, deliberately so.
- **Not a replacement for code review.** Fusion's `coderev` / `ontorev` agents review *during* execution; humans still own the final merge.
- **Not project-specific.** Since v2.x, every agent is project-agnostic; project-specific knowledge lives in `./rules/` (fusion-agent-specific rules) and `.claude/rules/` (project-wide rules every Claude session should respect). The plugin doesn't ship anyone's domain-specific assumptions.

## Where to read more

- `README.md` — install and quickstart
- `README-agents.md` — full agent reference (scope, inputs, outputs, when to invoke)
- `README-hooks.md` — compliance guard configuration
- `CLAUDE.md` — release process, layout, troubleshooting
- `rules/fusion-workbench-conventions.md` — workbench layout, marker vocabularies, decision-record template
- Run `/fusion:help` inside Claude Code for an interactive explainer
