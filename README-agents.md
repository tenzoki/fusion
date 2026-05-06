# agents/ — Claude Code sub-agents

This folder holds the plugin's Claude Code sub-agent definitions. Each `*.md` file (except this README) is one role: YAML frontmatter declares the agent's name and description, the body is the operating prompt.

Claude Code scans `agents/*.md` at session start, reads each frontmatter block, and makes the agents available as specialized sub-agents for the parent session. This README file is ignored by the scanner — only files with a valid `name`/`description` frontmatter count.

The agents are deliberately small and single-purpose. They divide labor across planning, implementation, review, reconciliation, and forensic investigation, and they share the same workbench layout (`fusion-workbench/`) and the same rule set (auto-loaded from the plugin's `rules/` directory).

## Quickstart

Three ways to invoke an agent from a Claude Code session at the project root:

1. **Natural-language delegation.** Describe the work — e.g. "plan a refactor of the orchestrator" or "review pkg/ai for error handling". Claude reads each agent's `description` and routes automatically.
2. **Explicit mention.** Name the agent — e.g. `@coderev scan pkg/designer` or "use the `planner` agent to…". Use this when auto-routing picks the wrong one.
3. **Inline read.** Ask Claude to read the file directly — e.g. "read `agents/planner.md` and follow it". This loads the prompt into the current context instead of spawning a sub-agent, so you keep one shared scratchpad. Useful for quick one-offs when context isolation isn't wanted.

Options 1 and 2 launch a sub-agent with its own context window (see [How to invoke an agent](#how-to-invoke-an-agent) below). Option 3 runs the prompt inline in the parent session.

## The agents

| Agent | Role | Reads | Writes | Output goes to |
|-------|------|-------|--------|----------------|
| `shaper` | Turns vague/brittle user requests into precise specs with user involvement | Anything | `fusion-workbench/planning/` (spec files), `fusion-workbench/issues/`, `fusion-workbench/history/` | Spec document with capabilities, acceptance criteria, and user decisions |
| `planner` | Designs implementation plans from specs or clear requests, no code changes | Anything | `fusion-workbench/planning/`, `fusion-workbench/issues/`, `fusion-workbench/history/` | Markdown plan with explicit step-by-step executor routing |
| `coder` | Implements **application code** per a plan or task | Anything | `.go`, `.ts`, `.tsx`, `.py`, `.js`, build files, tests, `fusion-workbench/{history,issues}/` | Code edits + history log |
| `ontocoder` | Implements **structured-data and ontology** changes per a plan or task | Anything | `.yaml`, `.yml`, `.json`, `.toml`, `.csv`, ontology, manifests, schemas, fixture data, derived stats/index files, data documentation, `fusion-workbench/{history,issues}/` | Data edits + history log |
| `coderev` | Reviews Go / TS / Python code, files findings | Anything | `fusion-workbench/codereview/`, `fusion-workbench/issues/`, `fusion-workbench/history/` | Review report + issue files |
| `ontorev` | Reviews ontology, manifests, verb hierarchies, files findings | Anything | `fusion-workbench/ontoreview/`, `fusion-workbench/issues/`, `fusion-workbench/history/` | Review report + issue files |
| `reconciler` | Reconciles plans / issues / reviews against the actual codebase | Anything | Tracking files in `fusion-workbench/` (status markers, reconciliation logs only) | Updated tracking files + history log |
| `taskplanner` | Builds the dependency-ordered work queue from open plans, issues, reviews | All `fusion-workbench/` tracking files | `fusion-workbench/tasklist.md`, `fusion-workbench/history/` | A single, executable task list |
| `bugfixer` | Diagnoses and fixes a specific bug: autonomous investigation, minimal targeted fix, verification | Anything | Any file type (code, data, ontology), `fusion-workbench/{history,issues}/` | Verified fix + history log |
| `investigator` | Forensic analysis of captured project runs (capture layout supplied by a project-local `./rules/investigator-capture-layout.md`) | Anything (esp. logs, prompts, ontology, code, image files via vision) | `fusion-workbench/investigations/`, `fusion-workbench/issues/`, `fusion-workbench/history/` | Investigation report + issue files |
| `analyst` | Document study and problem analysis — comparative, gap, risk, feasibility, impact | Anything | `fusion-workbench/analyses/`, `fusion-workbench/issues/`, `fusion-workbench/history/` | Analysis report + issue files |
| `orchestrator` | Automates multi-task work sessions: cycles through execution, review, and reconciliation until convergence or circuit breaker | Anything | Dispatches agents, creates commits, writes `fusion-workbench/history/` | Progress report + commits + updated tracking files |

**Hard rule across all agents:** read-only on layers outside the agent's primary scope. A reviewer never edits code. A `coder` never edits ontology yaml. An `ontocoder` never edits Go. The investigator never edits anything inside its evidence captures. The orchestrator never edits code or data directly — it dispatches executors. Cross-layer findings are filed as issues and routed to the right executor. The scope is enforced by prose in each agent's prompt, not by a `tools:` allowlist. **Exception:** `bugfixer` may edit both code and data because bugs cross layer boundaries — but ontology edits require a human gate.

**Dispatch is the orchestrator's monopoly.** Only `orchestrator` invokes other agents via the `Agent` tool. Every non-orchestrator agent has `disallowedTools: [Agent]` in its frontmatter (since v2.8.1) so the capability is enforced at tool level — the prose rules across each agent reinforce it. Sub-agents that identify work for another agent **recommend** the dispatch in their output (issue file, plan step, consultation report) but never call `Agent` directly. This prevents cycles (e.g. consultant→orchestrator→consultant) and keeps the dependency tree shallow.

## How to invoke an agent

Claude Code offers two ways to delegate to a sub-agent from the parent session:

1. **Natural-language delegation.** Ask for the kind of work the agent handles — e.g. "plan a refactor of the orchestrator's term-resolution path" or "review pkg/ai for error handling". Claude reads each agent's `description` and routes the request automatically.
2. **Explicit mention.** Name the agent directly — e.g. "use the `coderev` agent to scan pkg/designer" or "@ontorev verify the verb hierarchy after the last UEO bump". Use this when auto-delegation picks the wrong agent or when you want to be unambiguous.

Sub-agents run in their own context window with the role prompt loaded. They do not inherit the parent session's scratchpad — all durable state goes to `fusion-workbench/`.

### Inheritance model

Each agent in this folder declares only `name` and `description` in its frontmatter. The `tools:` and `model:` fields are deliberately omitted:

- **Tools** — inherited from the parent session. Every sub-agent gets the same tool set the parent Claude Code invocation has. Per-path write restrictions (e.g. "reviewer never writes source") are enforced by the prose rules inside each agent prompt.
- **Model** — inherited from the parent session. Whichever model is driving the Claude Code session drives the sub-agent too.

This keeps the definitions minimal and avoids drift between agent-specific and session-wide configuration.

## Workflow patterns

Most non-trivial work follows a chain. Each step is handled by one sub-agent invocation:

```
shaper        →  fusion-workbench/planning/<spec>.md      (when request is brittle/vague)
   ↓
planner       →  fusion-workbench/planning/<plan>.md
   ↓
taskplanner   →  fusion-workbench/tasklist.md             (queue of work for executors)
   ↓
coder         →  application code edits
ontocoder     →  data / ontology edits                (run in parallel with coder when independent)
   ↓
coderev       →  fusion-workbench/codereview/<review>.md   + new issue files
ontorev       →  fusion-workbench/ontoreview/<review>.md   + new issue files
   ↓
reconciler    →  ground-truth pass over all tracking files in fusion-workbench/
```

**Automated outer loop:** The `orchestrator` agent wraps the full pipeline — from shaping through execution, review, and reconciliation — in a managed session. It invokes `shaper` and `planner` (with human gates) when the input needs specification, then dispatches `taskplanner`, executors (`coder`/`ontocoder`), reviewers (`coderev`/`ontorev`), and `reconciler`, committing after each task and feeding review findings back into the next cycle. The orchestrator is the **only** agent that dispatches other agents.

```
                          ┌──────────────────────────────┐
                          │        orchestrator           │
                          └──────┬───────────────┬────────┘
                                 │               │
                    ┌────────────▼──┐   ┌────────▼────────┐
                    │   shaper      │   │   reconciler     │
                    │ (if needed)   │   │   (once, end)    │
                    └────────┬──────┘   └─────────────────┘
                    ← human gate: spec review
                    ┌────────▼──────┐
                    │   planner     │
                    │ (if needed)   │
                    └────────┬──────┘
                    ← human gate: plan review
                    ┌────────▼──────┐
                    │  taskplanner  │
                    └────────┬──────┘
                             │
              ┌──────────────▼──────────────┐
              │  convergence loop (max 5)    │
              │  ┌────────┐  ┌───────────┐  │
              │  │ coder  │  │ ontocoder │  │ ← human gate on ontocoder
              │  └───┬────┘  └─────┬─────┘  │
              │      │  validate   │        │
              │      ├─── fail? ───┤        │
              │      │  ┌────────┐ │        │
              │      │  │bugfixer│ │        │ ← one self-healing attempt
              │      │  └───┬────┘ │        │
              │      │  commit(s)  │        │
              │      └──────┬──────┘        │
              │      ┌──────▼──────┐        │
              │      │ coderev /   │        │
              │      │ ontorev     │        │
              │      └──────┬──────┘        │
              │             │ new issues    │
              │             │ → next cycle  │
              └─────────────┴───────────────┘
```

### Orchestrator observability

When the orchestrator runs, it produces three artifacts so the human can follow along and review afterward:

| Artifact | File | What it shows | How to view |
|----------|------|---------------|-------------|
| **Live dashboard** | `fusion-workbench/orchestrator-live.md` | Current task, cycle progress, queue, blocked items — overwritten at every transition | `watch cat fusion-workbench/orchestrator-live.md` in a second terminal |
| **Event log** | `fusion-workbench/orchestrator-events.jsonl` | Append-only JSONL with timestamped events (task start/done/error, gate hits, commits, reviews, circuit breakers) | `tail -f fusion-workbench/orchestrator-events.jsonl` for streaming, or `jq` for queries |
| **Sequence diagram** | Appended to the session's history file | Mermaid diagram of all agent dispatches, gate interactions, commits, and reviews | Open the history file in any Markdown viewer with Mermaid support |

**Combined view:** Run `./fusion-workbench/progress.sh` in a second terminal to see the dashboard and recent events together, refreshing every 2 seconds. Use `-n 25` for more event lines or `-i 1` for faster refresh.

The sequence diagram is the retrospective summary, appended to the history file at session end.

Two side loops feed into the chain at any point (outside the orchestrator's scope):

- **investigator** — when a captured project run shows inadequate output, the investigator walks the logs, vision-analyzes any screenshots, traces the failure across prompts / orchestrator / ontology / source material, files issues, and writes a report to `fusion-workbench/investigations/`. Capture location and structure are project-specific and described by the project's `./rules/investigator-capture-layout.md` (template at `templates/`).
- **reconciler** — periodically run between sessions to make sure plan and issue states reflect what is actually in the codebase (file headers lie, the codebase doesn't). Also invoked by the orchestrator at session end.

## Plugin structure

The plugin ships exactly one rule file: `rules/fusion-workbench-conventions.md` — the framework conventions every agent must follow (state markers, filename patterns, issue filing, history logging). Domain-specific rules (coding standards, ontology constraints, etc.) are **supplied by the consuming project** in its own `./rules/` directory.

Agents discover their applicable rules via the helper `bin/fusion-rules <agent-name>`, which runs in each agent's Setup. The helper:

1. Always emits `$FUSION_PLUGIN_ROOT/rules/fusion-workbench-conventions.md`.
2. Globs filename patterns against both `$FUSION_PLUGIN_ROOT/rules/` (plugin-shipped extras, if any) and `./rules/` (project-local).
3. Returns each match on its own line. The agent reads every emitted path.

`$FUSION_PLUGIN_ROOT` is exported by the plugin's `SessionStart` hook.

### Pattern → agent mapping

| Agent | Domain patterns matched | Typical project-local rule files |
|---|---|---|
| `coder`, `coderev`, `bugfixer` | `*coding*` | `rules/coding-guidelines.md`, `rules/coding-architecture.md` |
| `ontocoder`, `ontorev` | `*ontology*`, `*normative*`, `*verb*` | `rules/ontology-rules.md`, `rules/verb-ontology.md`, `rules/normative.md` |
| `planner` | `*coding*`, `*ontology*` | both groups above |
| `orchestrator`, `shaper`, `taskplanner`, `reconciler`, `analyst`, `investigator`, `consultant` | (workbench conventions only) | — |

If a pattern has no match in either directory, the agent operates on workbench conventions alone — agents skip missing rules silently rather than failing. Consuming projects can add their own rule files at any time and the next session picks them up automatically.

### Adding rules

In a consuming project, drop a markdown file into `./rules/` whose name contains the agent's domain pattern. Examples:

- `./rules/my-coding-style.md` → loaded by `coder`, `coderev`, `bugfixer`, `planner`
- `./rules/ontology-r-rules.md` → loaded by `ontocoder`, `ontorev`, `planner`
- `./rules/normative-sources.md` → loaded by `ontocoder`, `ontorev`

### `skills/` — user-invocable slash commands

| Slash command | File | What it does |
|---------------|------|--------------|
| `/commit` | `skills/commit/SKILL.md` | Stages, generates a conventional-commit message from the diff, asks the user to confirm, then commits |
| `/revise-claude-md` | `skills/revise-claude-md/SKILL.md` | Updates the project's `CLAUDE.md` with learnings discovered during the current session |

Slash commands are independent of sub-agent routing — invoke them from the parent session when you need to commit or revise project-level rules.

## Where the work persists

Every agent writes to `fusion-workbench/` and never to its own scratchpad — a sub-agent's context window does not survive the parent session, and even within a session the agents share no memory with each other.

```
fusion-workbench/
├── planning/        # planner output
├── issues/          # filed by every agent that finds something actionable
├── history/         # every session's log; the durable record
├── codereview/      # coderev output
├── ontoreview/      # ontorev output
├── investigations/  # investigator output
├── analyses/        # analyst output
└── tasklist.md      # taskplanner output (dependency-ordered work queue)
```

State markers and inline progress tracking are defined once in `fusion-workbench-conventions.md` (auto-loaded from the plugin's `rules/` directory). Every agent confirms the rule is in context during Setup so the conventions are uniform.

## Invariants

- **No agent modifies its own definition file.** Updates to `agents/*.md` are made by the user or via a normal code change — never by the agent itself.
- **No agent edits files outside its declared scope.** Cross-layer findings flow through `fusion-workbench/issues/`, not direct edits. Scope is enforced by prose in each agent prompt.
- **Only the orchestrator dispatches other agents.** All other agents are leaf nodes — they do their work and return. The orchestrator is the sole coordinator. It never recurses (no self-invocation), and it never invokes `investigator` (user-initiated only).
- **Issues live in `fusion-workbench/issues/`, never embedded in plans, reviews, or chat output.** This is enforced in `fusion-workbench-conventions.md` and applies to every agent.
- **Timestamps come from the system clock** (`date +%y%m%d-%H%M`), never from estimation. All tracking filenames carry an `YYMMDD-HHMM` prefix.
- **`.secret` files are never read.** If an agent needs a secret, it asks the user for an environment variable.

## Adding a new agent

1. Create `agents/<short-name>.md` with a minimal frontmatter block:
   ```yaml
   ---
   name: <short-name>
   description: <when to use, what it produces, what it never does>
   ---
   ```
2. Write the prompt body following the structure of the existing agents (Setup, Scope, Process, Output Style).
3. Setup must confirm that `fusion-workbench-conventions.md` and any other relevant rule files from the plugin's `rules/` directory are present in context (they are auto-loaded by the plugin system).
4. Declare what the agent may read and what it may write — be explicit and exclusive.
5. Register the agent in:
   - `CLAUDE.md` folder structure block (if it introduces a new `fusion-workbench/` subfolder)
   - `CLAUDE.md` key-documentation table
   - The agent table at the top of this README

## Migration note

These agents were previously stored as plain prompts in `ccagents/` and later in `.claude/agents/`. Both paths are now legacy. Historical session logs in `fusion-workbench/history/` may reference old paths; those are immutable records.
