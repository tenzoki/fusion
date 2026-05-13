# Fusion — Philosophy

Fusion is a multi-agent orchestration framework for Claude Code. Its conceptual core is the **hermeneutic circle**: the idea that pre-understanding and subject matter reshape each other through every encounter. You begin with what you already assume (a *Grounding*), orient toward something you mean to produce (a *Directive*), work on it, and end up understanding both the thing and your own assumptions differently. Fusion ports this principle into AI-assisted project work — every fusion session is implicitly a hermeneutic circle, moving from Directive toward closure across one or more *Turns*, with **Coherence** between the three poles (Directive, Grounding, Artifact) as the criterion for finishing.

This conceptual lens — Directive / Grounding / Artifact / Coherence — applies to **every** way of using fusion, whether or not you ever create a file in `fusion-workbench/circles/`. There are two operational paths into it. In the **direct** path, you drive the orchestrator at a single Directive at a time; the Circle is implicit in the session and never reified on disk. In the **portfolio** path, you populate `fusion-workbench/circles/` with one file per anticipated unit of work, and the `playmaker` agent ranks and proposes which one to activate next. Both are first-class. See README.md's "Two ways to use fusion" section for the operational distinction. Empty or absent `circles/` preserves the direct, single-Circle path; the hermeneutic-circle framing throughout this document still applies to it.

The framework rests on a few load-bearing ideas, plus one design parameter that lets the same plumbing serve very different kinds of projects.

## 1. Specialization beats generalists

Instead of one assistant that does everything, fusion ships **14 narrow agents** — coder, ontocoder, planner, shaper, taskplanner, playmaker, reconciler, coderev, ontorev, analyst, investigator, bugfixer, consultant, and an orchestrator that dispatches the others.

Each agent has:

- A **tight scope** (what it owns, what it must not touch)
- A **prose-enforced boundary** in its prompt (e.g. *"You may NOT edit ontology files"*)
- A **single output shape** (issue files, plan files, review reports, decision records, etc.)

A `coder` cannot edit ontology YAML; an `ontocoder` cannot edit Go; a reviewer never edits the thing it reviews. The cost is dispatch overhead — one task may bounce through three agents before it lands. The benefit is **reasoning quality per pass**: each agent runs against a focused prompt with relevant context only, so it doesn't drift into adjacent layers it shouldn't be touching.

This is the inverse of the "one big assistant" pattern. Fusion is built on the bet that the LLM-context is the bottleneck, and that splitting work across many small contexts beats stuffing everything into one large one.

## 2. Workbench-mediated coordination — and human-readable memory

Sub-agents in Claude Code share **no context** with their parent or with each other. By default this is a constraint people work around. Fusion turns it into the design.

Every agent reads and writes files under `fusion-workbench/`:

- `planning/` — design documents
- `issues/` — defects ("go fix it")
- `decisions/` — open questions ("decide and record")
- `circles/` — the portfolio of Circles (anticipated, active, closed)
- `history/` — session logs
- `codereview/`, `ontoreview/` — review findings
- `analyses/`, `investigations/`, `consult/` — typed reports
- `tasklist.md` — the dependency-ordered work queue
- `portfolio.md` — the playmaker-regenerated view across all Circles

Coordination happens through the filesystem, not through agent memory. Three consequences:

- **Runs are interruptible.** Crash or close the session mid-flight; the next session reads the workbench and resumes from where the last one left off. The orchestrator's `agentstate.yaml` makes this explicit.
- **Runs are auditable.** Every agent's work leaves a paper trail. Decision rationale, issue history, review findings, and reconciliation passes are all on disk and version-controllable.
- **Runs are resumable across humans.** The workbench is the project's shared cross-session memory. A new contributor can read it and pick up where the project is, not just where the codebase is.

**Traceability is a first-class human-facing output, not just an agent-coordination side-effect.** Every plan, decision, issue, review, and session log lands on disk in the same workbench, in plain markdown, navigable directly by the user — no tool needed to read what the project decided last month or which review filed which issue. Two skills surface this material for the human explicitly:

- **`/fusion:memo`** — a personal capture slot for things the user doesn't want to forget but doesn't want to file as an issue or decision either ("Stefan is travelling next week," "check the loader assumption before the next planning pass"). Memos land in `fusion-workbench/memos/memos-<username>.md`, one file per OS user, append-only, verbatim. Not for acting on — for keeping.
- **`/fusion:log-activity`** — a retrospective. The skill scans git commits and every workbench subdirectory (history, planning, issues, decisions, reviews, analyses, investigations, consult), groups what it finds by calendar date, and writes a per-user activity log at the project root (`activity-log-<username>.md`) with hours worked, a one-line arc per day, and a summary table. The answer to "what did I actually do in the last four weeks?"

This makes fusion well-suited for projects where *what you decided*, *what you did*, and *what you mustn't forget* all matter as much as *what you shipped*.

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

## 5. The Coherence triangle

Every Circle has three substantive poles and a process that connects them:

- **Directive** — what the Circle is for; the prognosticated end-state of the Artifact.
- **Grounding** — what the Circle builds on; the body of assumptions, prior decisions, and conventions you bring in.
- **Artifact** — what the Circle produces; the code, the analysis, the document.

**Coherence** is the reciprocal consistency of these three poles. It is not a checklist on the Artifact alone — it is a property of the triangle. Three edges, three questions:

| Edge | Question |
|---|---|
| **Artifact ↔ Grounding** | Does the Artifact respect the Grounding we said we were building on? |
| **Artifact ↔ Directive** | Does the Artifact move toward the Directive we set? |
| **Grounding ↔ Directive** | Is our Grounding still adequate for the Directive — or has the world changed under us? |

Fusion checks this triangle at two cadences.

**Per Turn** — the orchestrator runs a lightweight Coherence gate at the end of every Turn (after commits, before circuit-breaker check). The gate produces a three-line prose summary, one line per edge, and offers a binary choice: **Continue** (keep working) or **Open Rebalance gate** (something is off — let's revisit). The Turn-level gate is fast and advisory; its job is to catch drift before the next Turn compounds it.

**Per Circle** — when the Circle's work feels done, the `reconciler` agent runs the full three-edge check and emits a `## Coherence` section with a verdict: `coherent`, `review-needed`, or `bounded-closure-proposed`. This is the per-Circle aggregate. A `coherent` verdict closes the Circle as `[c]` (closed-coherent — the bracketed marker appears in the Circle's filename); the other two verdicts route into the Rebalance gate.

Coherence is ultimately a human judgement — the framework's job is to surface the triangle clearly enough that the human can decide, not to grade it automatically. See `fusion-workbench/foundation_V3.md` §1.3 for the conceptual treatment.

## 6. Directive ≠ static Goal

A Goal in classical project-management vocabulary is fixed at the start and reached at the end. A Directive is different: it *prognosticates* the Artifact's end-state, but it is **revisable** as the Circle evolves. When a Coherence check (per-Turn or per-Circle) reveals that the stated Directive cannot be reached as written — because the Grounding turned out wrong, or the world changed, or the team learned something the Directive didn't anticipate — the user enters the **Rebalance gate** rather than push harder against an Artifact that won't converge.

The Rebalance gate maps directly onto the triangle from §5. Each option corrects one pole, or accepts that the corner can't be reached:

- **Revise Artifact** — the Artifact is not where we want it; do another Turn against the same Directive and Grounding.
- **Revise Grounding** — the basis we built on was wrong; file a new `decisions/[o]` entry (an open question), or supersede an existing implemented decision.
- **Revise Directive** — the destination we set was wrong; re-shape the Directive with the orchestrator's `shaper` agent.
- **Accept Bounded Closure** — the Directive is judged definitively unreachable under the current conditions. What was learned along the way is the Artifact, and the Circle ends acknowledging that. The Circle's filename marker becomes `[b]` (Bounded Closure — preserved as an explicit terminal state, not a session error).

"Goal → Directive" is not a cosmetic rename. It signals that the orchestrator treats the user's stated outcome as a *living* element of the work, not a fixed target — and that the framework has a structured way to revise it without abandoning the Circle.

## 7. The Circle portfolio and the playmaker

This section describes the **portfolio-managed mode** — opt-in, surfaced by populating `fusion-workbench/circles/`. For the direct-orchestrator path (no `circles/` files, one Directive per session), see README.md's "Two ways to use fusion."

Most software-process vocabulary assumes a single linear sequence — a backlog, a sprint, a roadmap. Fusion projects that adopt the portfolio mode accumulate a different shape: a **portfolio of Circles**, each in one of six lifecycle states.

| Marker | State |
|---|---|
| `[a]` | **Anticipated** — provisional Directive, no Grounding yet. The portfolio's roadmap layer. |
| `[t]` | **Active** — Directive refined, Grounding crystallising, orchestrator running it (one at a time). |
| `[c]` | **Closed-coherent** — three-edge Coherence verdict passed. |
| `[b]` | **Bounded Closure** — Directive judged unreachable; what was learned is the Artifact. |
| `[s]` | **Superseded** — replaced by a Circle that captures revised intent. |
| `[d]` | **Deferred** — anticipated, then indefinitely postponed. |

(Markers `[c]`, `[b]`, `[s]`, `[d]` are terminal. Continuation happens through a new Circle that cites the terminal one as a dependency.)

The **playmaker** agent is fusion's goal-management layer. It manages the portfolio, not any single Circle. On dispatch (via `/fusion:next`, or by the orchestrator at Phase 4 after a Circle closes) it does four things:

1. **Inventories** every Circle file in `fusion-workbench/circles/` and classifies by marker.
2. **Ranks** anticipated Circles using domain-biased heuristics — for `code` projects it favours Circles whose Grounding snapshot cites few unresolved decisions and whose dependencies are all closed; for `strategic` projects it favours Circles that would unblock the most open decisions when activated.
3. **Detects dependency cycles** between non-terminal Circles and warns about them — without auto-decomposing or forcing serial activation.
4. **Flags parent-Grounding-stale conditions** when a Circle closes with Bounded Closure and other Circles cited it as Grounding.

Playmaker is deliberately **advisory and write-narrow**. It proposes activation but never commits the marker rename. It writes its ranked view into `fusion-workbench/portfolio.md` and appends a `## Activation proposal` block to the top-ranked anticipated Circle file — but the actual `[a] → [t]` transition is committed by the user (via `/fusion:next` interactive confirm) or by the orchestrator (at Phase 4). The same separation keeps `.active-circle` (the single-source-of-truth pointer to the currently active Circle) under the orchestrator's exclusive write.

Playmaker is **never invoked from inside an active Turn loop**. Portfolio-level ranking belongs to the boundary between Turns — between Circles, really. Mixing it with execution would conflate "what should we work on next" with "how is the current work going", and the two questions deserve separate contexts.

Playmaker is also distinct from `consultant`: the consultant handles user-direct conversational topics ("project health?", "compare X and Y") and writes opinionated reports to `consult/`. Playmaker handles portfolio mechanics — ranking, cycle detection, propagation flags. The boundary is intentional. See `agents/playmaker.md` for the full agent spec and `fusion-workbench/decisions/260509-1556[i]-playmaker-and-circles-folder.md` for the architectural decision that introduced it.

## What fusion is not

- **Not an autonomous coding agent.** Fusion stops and asks the user before destructive operations, ontology changes, ambiguous tasks, and structural decisions. It is a *human-in-the-loop* framework, deliberately so.
- **Not a replacement for code review.** Fusion's `coderev` / `ontorev` agents review *during* execution; humans still own the final merge.
- **Not project-specific.** Since v2.x, every agent is project-agnostic; project-specific knowledge lives in `./rules/` (fusion-agent-specific rules) and `.claude/rules/` (project-wide rules every Claude session should respect). The plugin doesn't ship anyone's domain-specific assumptions.

## Where to read more

- `README.md` — install and quickstart
- `README-agents.md` — full agent reference (scope, inputs, outputs, when to invoke)
- `README-hooks.md` — compliance guard configuration
- `CLAUDE.md` — release process, layout, troubleshooting
- `rules/fusion-workbench-conventions.md` — workbench layout, marker vocabularies, Circle file template, portfolio.md template
- `fusion-workbench/foundation_V3.md` — the conceptual foundation (German) behind the hermeneutic-circle framing, Coherence triangle, and Bounded Closure
- `agents/playmaker.md` — full playmaker agent spec
- Run `/fusion:help` inside Claude Code for an interactive explainer
