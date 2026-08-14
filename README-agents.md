# agents/ — Claude Code sub-agents

The `agents/` folder holds the plugin's Claude Code sub-agent definitions. Each `agents/*.md` file is one role: YAML frontmatter declares the agent's name and description, the body is the operating prompt. (This README lives at the repo root, outside the scanned folder.)

Claude Code scans `agents/*.md` at session start, reads each frontmatter block, and makes the agents available as specialized sub-agents for the parent session — only files with a valid `name`/`description` frontmatter count.

The agents are deliberately small and single-purpose. They divide labor across planning, implementation, review, reconciliation, and forensic investigation, and they share the same workbench layout (`fusion-workbench/`) and the same rule set (auto-loaded from the plugin's `rules/` directory).

## Quickstart

Three ways to invoke an agent from a Claude Code session at the project root:

1. **Natural-language delegation.** Describe the work — e.g. "plan a refactor of the orchestrator" or "review pkg/ai for error handling". Claude reads each agent's `description` and routes automatically.
2. **Explicit mention.** Name the agent — e.g. `@coderev scan pkg/designer` or "use the `planner` agent to…". Use this when auto-routing picks the wrong one.
3. **Inline read.** Ask Claude to read the file directly — e.g. "read `agents/planner.md` and follow it". This loads the prompt into the current context instead of spawning a sub-agent, so you keep one shared scratchpad. Useful for quick one-offs when context isolation isn't wanted.

Options 1 and 2 launch a sub-agent with its own context window (see [How to invoke an agent](#how-to-invoke-an-agent) below). Option 3 runs the prompt inline in the parent session.

## The agents

Since v4.0.0 the **Writes** column names artifact *kinds*, not fixed root paths. Each kind resolves at run time through `bin/fusion-paths` into the active Circle (`<circle>/planning/`, `<circle>/issues/`, …) or into `shared/` when no Circle is active — the Origin Rule decides which. The three former review folders (`codereview/`, `ontoreview/`, `conceptreview/`) are merged into one `reviews/`, with the reviewing agent named in the filename.

| Agent | Role | Reads | Writes | Output goes to |
|-------|------|-------|--------|----------------|
| `shaper` | Turns vague/brittle user requests into precise specs with user involvement. Four invocation modes: user-direct, in-Circle clarification, portfolio-activation (re-clarifies an anticipated Circle's Directive before activation), anticipated-circle (captures a draft Directive as a new anticipated Circle) | Anything, including the shared backlog store — a backlog entry is a valid draft | `planning/` (spec files), `decisions/` (decisions the user defers), `issues/`, `history/`. In portfolio-activation mode also the cited Circle record's `## Directive` and `## Grounding snapshot` sections in place, plus its `**Active spec/plan:**` head field. In anticipated-circle mode a new Circle directory `circles/<stamp>-<slug>/` holding its `_a_circle.md` record and the six artifact subdirectories, plus — only when that entry holds a single idea — the marker rename to closed and the `Promoted:` line on the backlog entry the draft came from; an entry holding several is left untouched and reported back | Spec document with capabilities, acceptance criteria, and user decisions — or, in anticipated-circle mode, an anticipated Circle record instead of a spec |
| `planner` | Designs implementation plans from specs or clear requests, no code changes; every plan step names exactly one executor agent | Anything, and specifically the specs and plans under `planning/`, the reports under `analyses/`, the open and answered records under `decisions/`, and the defect records under `issues/` | `planning/`, `decisions/` (choice points that planning surfaces, cited from the plan rather than held inside it), `issues/`, `history/` | Markdown plan whose head carries the mandatory `**Decidability:**` line and whose every step declares its executor, files, changes and dependencies |
| `coder` | Implements **application code** per a plan or task | Anything | `.go`, `.rs`, `.ts`, `.tsx`, `.py`, `.js`, `.java`, build manifests and build configuration whatever the extension (`Makefile`, `go.mod`, `package.json`, `Cargo.toml`, `tsconfig.json`), build scripts, tests, code-level documentation (architecture notes, API docs, code READMEs), `history/`, `issues/` | Code edits + history log |
| `ontocoder` | Implements **structured-data and ontology** changes per a plan or task | Anything | `.yaml`, `.yml`, `.json`, `.toml`, `.csv`, `.tsv`, `.xml`, `.ndjson` where they carry data, ontology, manifests, schemas, fixture data, derived stats/index files, data documentation, `history/`, `issues/` | Data edits + history log |
| `coderev` | Reviews **application code, prompts, build/packaging, and tooling**, files findings | Anything | `reviews/`, `issues/` (`$OUT_REVIEW` and `$OUT_ISSUE`, resolved per-Circle or `shared/`) | Review report + issue files |
| `ontorev` | Reviews ontology, manifests, verb hierarchies, files findings | Anything | `reviews/`, `issues/` | Review report + issue files |
| `conceptrev` | Evaluates the formal Mermaid design diagrams in plans, specs, analyses, tasklists and investigations — measures graph structure (fan-out, cycles, layering, orphans), returns an advisory coherence verdict. Read-only; files nothing | Anything (esp. planning/analysis docs) | `reviews/` | Coherence verdict (clean/acceptable/tangled) + findings |
| `reconciler` | Reconciles plans / issues / reviews against the actual codebase | Anything | Tracking files under `planning/`, `issues/` and `reviews/` (status markers, marker renames, reconciliation logs and evidence citations — never the descriptions themselves), `history/`, new `issues/` and `decisions/`, plus the `## Coherence` section appended to the orchestrator's session-history file | Updated tracking files + Coherence verdict + history log |
| `taskplanner` | Builds the dependency-ordered work queue from open plans, issues, reviews and answered (`_a_`) decisions | All `fusion-workbench/` tracking files — plans, issues, decisions, reviews, history | `tasklist.md`, `history/` | A single, executable task list |
| `bugfixer` | Diagnoses and fixes a specific bug: autonomous investigation, minimal targeted fix, verification | Anything | Any file type (code, data, ontology), `history/`, `issues/` | Verified fix + history log |
| `consultant` | On-demand expert consultation — answers a specific question from a referenced corpus, files issues for whatever work the answer reveals | Anything | `consult/` (shared-only), `issues/`, `decisions/`, `history/` (history entries only when explicitly asked) | Consultation report + issue and decision files |
| `investigator` | Forensic analysis of captured project runs (capture layout supplied by a project-local `./rules/investigator-capture-layout.md`) | Anything (esp. logs, prompts, ontology, code, image files via vision) | `investigations/` (shared-only), `issues/`, `decisions/`, `history/` | Investigation report + issue files |
| `analyst` | Document study and problem analysis — comparative, gap, risk, feasibility, impact, plus decision records and architectural snapshots | Anything | `analyses/`, `issues/`, `decisions/`, `history/` | Analysis report + issue files |
| `editor` | Produce-only Redakteur — writes, revises, translates (en↔de), and renders **customer-ready deliverables**; branded decks via `dl-brand-pptx` + `pptx`. Never reviews, files issues, or dispatches. The dispatch must name the deliverable's language or the agent halts — see **Dispatch parameters** below | Anything | **Project-side deliverables** (Markdown, branded pptx, translations), `history/` (session log only) | Finished deliverable + history log |
| `orchestrator` | Automates multi-task work sessions: runs Turns of execution, review, and reconciliation until the Directive converges or a circuit breaker fires | Anything except `.secret` | Dispatches agents and creates commits. Writes `history/`; `issues/` (out-of-scope reverts, fusion bugs); `decisions/` (a new open record raised at a human gate); the retired task queue moved into `planning/` at Circle closure; the four root-anchored session files `orchestrator-live.md`, `orchestrator-events.jsonl`, `agentstate.yaml` and `.active-circle`; state-marker renames on issues, plans and the Circle record; and exactly three parts of the active Circle record (`## Closure note`, this Turn's `## Turn log` entry, the three head fields) | Progress report + commits + updated tracking files |
| `playmaker` | Circle portfolio management — ranks anticipated Circles, proposes next activation, detects dependency cycles, flags parent-Grounding-stale; also **maintains** the shared backlog store: it ranks the entries and renames one between open (`_o_`) and recommended (`_p_`) on its own, and splits, merges, closes or defers one only with a user confirmation the run holds for that operation. It never originates an entry | All of `fusion-workbench/` except the frozen stores (`archive/`, `stashes/`, `.migration-v2-backup/`), plus `CLAUDE.md` and the codebase | Circle records — appended `## Activation proposal`, `## Dependency warning` and `## Parent grounding stale` sections only, on a record of any marker, never a rename — `portfolio.md` (regenerated in full), `backlog/`, `history/` | Updated Circle records + portfolio brief + ranked backlog + history log |
| `curator` | Reconciles the three **normative surfaces** — decision records, the project's own `./rules/` and `.claude/rules/` files, and `CLAUDE.md` — against the project's recorded history. Removes what history retired, resolves what the surfaces state in contradiction. Every change carries an evidence tier and a citation; nothing lands before a user gate. It advances no marker on ground-truth verification (reconciler) and runs no session-learnings pass (`/fusion:revise-claude-md`) | Anything except `.secret` — plus the whole workbench, the archive store and the full git history as evidence | The three surfaces themselves (gated); `history/` (the run file, which is also the change ledger), `decisions/` (an open record for a contradiction it may not resolve), `issues/` (work outside its remit) | Change ledger + applied edits + history log |

**"Anything" in the Reads column is the project tree minus `.secret`.** These prompts state that exclusion in their own Scope section — `analyst`, `bugfixer`, `conceptrev`, `coderev`, `consultant`, `curator`, `investigator`, `ontorev`, `orchestrator`, `planner`, `shaper`. The rest (`coder`, `ontocoder`, `reconciler`, `taskplanner`, `playmaker`, `editor`) say nothing about `.secret` either way.

**The three reviewers write no session history.** `coderev`, `ontorev` and `conceptrev` each state it in their own prompt: the review or assessment file under `$OUT_REVIEW` is that session's durable record, and a history log would only duplicate it. That is why `history/` is absent from their Writes column and why `bin/fusion-paths` values them no `OUT_HISTORY` key.

**What decides the `coder` / `ontocoder` split is the file's role, not its extension.** `agents/orchestrator.md` `## Agent Routing Table` is the authority for it: a `.json` or `.toml` that configures the build or declares the project's dependencies (`package.json`, `Cargo.toml`, `tsconfig.json`) is the `coder`'s, and the same extension holding ontology entries, manifest data or a schema is the `ontocoder`'s. Stated once here rather than as an exception clause in each row, so a new build manifest or a new data format needs no edit to the table.

**Hard rule across all agents:** read-only on layers outside the agent's primary scope. A reviewer never edits code. A `coder` never edits ontology yaml. An `ontocoder` never edits Go. The investigator never edits anything inside its evidence captures. The orchestrator never edits code or data directly — it dispatches executors. Cross-layer findings are filed as issues and routed to the right executor. The scope is enforced by prose in each agent's prompt, not by a `tools:` allowlist. **Exception:** `bugfixer` may edit both code and data because bugs cross layer boundaries — but ontology edits require a human gate.

**Dispatch is the orchestrator's monopoly.** Only `orchestrator` invokes other agents via the `Agent` tool. The constraint is **prose-enforced** in each non-orchestrator agent's prompt — sub-agents that identify work for another agent **recommend** the dispatch in their output (issue file, plan step, consultation report) but never call `Agent` directly. This prevents cycles and keeps the dependency tree shallow. (A v2.8.1 attempt to enforce this via `disallowedTools: [Agent]` in frontmatter broke agent loading entirely and was rolled back in 2.8.3 — the canonical syntax remains TBD.)

## Dispatch parameters

Seven agents read run-time parameters off the dispatch prompt: plain markdown lines of the form `**<Keyword>:** <value>`, one per line, ahead of the directive body. A value may run past its own line, and the two that do are bounded differently. `**Draft:**` ends at the next `**<Keyword>:**` line or at the end of the prompt (`agents/shaper.md:57`). `**Confirmed operations:**` is a block of operation lines whose declaring prompt states no termination rule; both sides write it with `**Proposal source:**` on the line after the last operation (`agents/playmaker.md:209-217`, `skills/next/SKILL.md:170-176`). **This table is the roster's single authoring home** — the agent rows above name no parameters, and `CLAUDE.md` cites this section rather than restating it. `Declared at` names the prompt lines each row was read against. `Passed by` has its own ground truth, and it is not the agent prompts: a skill can pass a parameter no agent prompt mentions, so every cell in that column was read against `agents/*.md` **and** every `skills/*/SKILL.md` body, and names the line it was read against wherever the passer is a skill.

| Agent | Parameter line | Accepted values | If absent | Passed by | Declared at |
|-------|----------------|-----------------|-----------|-----------|-------------|
| `taskplanner` | `**Domain:**` | `code` \| `data` \| `strategic` \| `knowledge` | defaults to `code`; selects the Priority Axis 1 logic | orchestrator at Phase 1 (`agents/orchestrator.md:392`) | `agents/taskplanner.md:19`, `:34-36` |
| `reconciler` | `**Domain:**` | the same four | defaults to `code`; selects the ground-truth verification protocol | orchestrator at Phase 3 (`agents/orchestrator.md:649`); `/fusion:cleanup` Step 3 (`skills/cleanup/SKILL.md:147`), which obtains the domain from `agentstate.yaml` and never decides one | `agents/reconciler.md:28-30`, `:45-47` |
| `playmaker` | `**Domain:**` | the same four | defaults to `code`; biases the ranking heuristics | orchestrator at Phase 4 (`agents/orchestrator.md:850`), `/fusion:next` Step 3 (`skills/next/SKILL.md:103`) and again on Step 5b's second dispatch (`skills/next/SKILL.md:170`), or a direct user dispatch | `agents/playmaker.md:25-27`, `:36-38` |
| `playmaker` | `**Confirmed operations:**` | a block of `- split …` / `- merge …` / `- close …` / `- defer …` lines, one backlog operation per line, copied verbatim from the first run's own proposals | no confirmation travels on the prompt, so the run performs none of the four operations. It may still perform one it confirmed the other way, by asking the user itself — which a dispatched sub-agent cannot do | `/fusion:next` Step 5b's dispatch (`skills/next/SKILL.md:167-176`) | `agents/playmaker.md:207-215` |
| `playmaker` | `**Proposal source:**` | the portfolio path, plus the `**Generated:**` stamp that portfolio carried when the operations were proposed | the stamp check has nothing to read. `agents/playmaker.md:219` defines the refusal for a stamp that differs, a portfolio that is gone, and a portfolio whose header carries no `**Generated:**` value; an omitted line is not among the three | `/fusion:next` Step 5b's dispatch (`skills/next/SKILL.md:176`, contract restated at `:179`) | `agents/playmaker.md:207`, `:216`, `:219` |
| `planner` | `**Executors:**` | comma-separated, each one of `coder` \| `ontocoder` \| `analyst` | defaults to `[coder, ontocoder]`; unrecognised names are ignored | orchestrator, when the detected domain is `strategic` or `knowledge` (`agents/orchestrator.md:377`) | `agents/planner.md:47-51` |
| `planner` | `**Circle:**` | a Circle directory name — no marker, no `.md`, no prefix | resolves as usual: the active Circle when one is active, `shared/` when none is | the user, on a direct planner dispatch, to plan an anticipated Circle before it is activated. No agent prompt and no skill body passes it: the orchestrator's only planner dispatch (`agents/orchestrator.md:377`) passes `**Executors:**` alone. A name matching no directory exits 1 from the resolver and the planner halts rather than re-resolving | `agents/planner.md:53-55` |
| `shaper` | `**Mode:**` | `portfolio-activation` \| `anticipated-circle` | falls back to the existing mode-detection heuristic, i.e. user-direct | the user directly for `portfolio-activation`; `/fusion:direct` (`skills/direct/SKILL.md:70`) and `/fusion:seed-from-plane` (`skills/seed-from-plane/SKILL.md:92`) for `anticipated-circle` | `agents/shaper.md:39-47`, `:57` |
| `shaper` | `**Circle file:**` | workbench-relative path to a Circle's `_a_circle.md` record | **halts** whenever `**Mode:** portfolio-activation` was given and this line is missing or unreadable | the user running shaper top-level — no skill and no agent dispatches this mode (`agents/shaper.md:47`) | `agents/shaper.md:47`, `:55` |
| `shaper` | `**Draft:**` | the user's raw draft text (may span lines), or a path to a backlog entry | **halts** whenever `**Mode:** anticipated-circle` was given and this line is missing or empty | `/fusion:direct <draft>` (`skills/direct/SKILL.md:71`) and `/fusion:seed-from-plane`, which passes the Plane story's title and description (`skills/seed-from-plane/SKILL.md:93`, `:97`) | `agents/shaper.md:57`, `:60`, `:104` |
| `shaper` | `**Domain:**` | the same four | defaults to `code` | `/fusion:direct` (`skills/direct/SKILL.md:72`) and `/fusion:seed-from-plane` (`skills/seed-from-plane/SKILL.md:94`). Anticipated-circle mode only, and a pass-through: it fills the new Circle record's `**Domain:**` frontmatter and changes nothing about how the shaper itself works | `agents/shaper.md:57`, `:80` |
| `shaper` | `**Parent task:**` | path to the active task file | no parent-task context; the spec output is the same either way | orchestrator, in in-Circle clarification mode, per the declaring prompt (`agents/shaper.md:45`) — the orchestrator's own prompt names no such line | `agents/shaper.md:45` |
| `editor` | `**Deliverable language:**` | `de` \| `en` | **halts and produces nothing.** This is the one parameter with no default and no fallback | orchestrator (`agents/orchestrator.md:438`, `:1397`), or the user | `agents/editor.md:18-30` |
| `curator` | `**Mode:**` | `survey` \| `apply` | defaults to `survey`, the pass that writes to none of the three surfaces | `/fusion:curate`, on both of its dispatches (`skills/curate/SKILL.md` `## Step 2 — Dispatch the curator to survey`, `## Step 6 — Dispatch the curator to apply`); or the user on a direct dispatch | `agents/curator.md` `## Dispatch parameters` |
| `curator` | `**Ledger:**` | workbench-relative path to a run file this agent wrote | **halts** whenever `**Mode:** apply` was given and this line is missing | whoever held the gate, on the apply dispatch: `/fusion:curate` (`skills/curate/SKILL.md` `## Step 6 — Dispatch the curator to apply`), or an agent that proxied the gate question to the user | `agents/curator.md` `## Dispatch parameters` |
| `curator` | `**Approved:**` | entry ids, comma-separated (`L01,L04`), or `all` | **halts** whenever `**Mode:** apply` was given and this line is missing. An empty approval set is a rejection, not an omission | the same passer as `**Ledger:**` — the two travel together or not at all (`skills/curate/SKILL.md` `## Step 6 — Dispatch the curator to apply`) | `agents/curator.md` `## Dispatch parameters` |

**The playmaker's last two rows are one relay, and they carry the four destructive backlog operations.** On the `/fusion:next` path the playmaker runs twice: the first run ranks the backlog and writes its proposals into the portfolio, the skill puts them to the user, and the second run is dispatched with the answer. That is the only way a confirmation reaches a playmaker sub-agent at all — the `AskUserQuestion` grant belongs to the skill body in the main session and does not travel to a dispatched agent. `**Proposal source:**` is what makes the second dispatch safe rather than decorative: the run compares the stamp in that line against the portfolio's `**Generated:**` header and, when the two differ, performs no operation, writes no file, and returns saying so. Anything that rewrote the portfolio inside the window between the two dispatches — a Phase 4 closure, a second `/fusion:next` — is caught there.

**The editor's halt is the deliberate exception, not an oversight.** Every other absent parameter has a defined default, so a dispatch that omits it still runs. A customer deliverable follows neither the project's chat language nor its artifact language — it is written for a reader outside the project, so its language is a per-deliverable fact the dispatcher has to state. A silent default would hand the customer a *finished* document in the wrong language, discovered by the customer rather than by a stop. The editor therefore refuses to start and says what to re-dispatch. Ruled in decision `260807-2131_*_which-language-governs-a-customer-deliverable.md`; the customer-deliverable case is in `rules/fusion-workbench-conventions.md` `## Project language`.

**Three agents are parameterised by domain, and `planner` is not one of them.** The behaviour-changing `**Domain:**` parameter is read by `taskplanner`, `reconciler` and `playmaker`. `shaper` accepts the same line in anticipated-circle mode but only copies it into the record it writes. `agents/planner.md` parses no `**Domain:**` line at all; what it takes is `**Executors:**`, which the orchestrator derives *from* the detected domain and passes as a named executor set. Several fusion surfaces described the planner as domain-parameterised until 260813; they were corrected against the prompt, and whether the planner *should* take a domain parameter is an open design question filed as a decision record, not a documented fact.

**One dispatch instruction is not a parameter line.** The orchestrator may pre-authorise `bugfixer`'s ontology gate by writing "ontology edits pre-approved" into the dispatch prompt as ordinary prose (`agents/bugfixer.md:42`, `:146`). It carries no `**<Keyword>:**` form and is not parsed, so it is out of the table.

## How to invoke an agent

Claude Code offers two ways to delegate to a sub-agent from the parent session:

1. **Natural-language delegation.** Ask for the kind of work the agent handles — e.g. "plan a refactor of the orchestrator's term-resolution path" or "review pkg/ai for error handling". Claude reads each agent's `description` and routes the request automatically.
2. **Explicit mention.** Name the agent directly — e.g. "use the `coderev` agent to scan pkg/designer" or "@ontorev verify the verb hierarchy after the last UEO bump". Use this when auto-delegation picks the wrong agent or when you want to be unambiguous.

Sub-agents run in their own context window with the role prompt loaded. They do not inherit the parent session's scratchpad — all durable state goes to `fusion-workbench/`.

### Inheritance model

With one exception, each agent declares only `name` and `description` in its frontmatter; the `tools:` and `model:` fields are deliberately omitted. The exception is the `orchestrator`, which declares a `tools:` allowlist (the namespaced sub-agent dispatches plus its permitted tools) — it is the only agent that dispatches, so it is the only agent whose tool set is pinned. For the rest:

- **Tools** — inherited from the parent session. Every sub-agent gets the same tool set the parent Claude Code invocation has. Per-path write restrictions (e.g. "reviewer never writes source") are enforced by the prose rules inside each agent prompt.
- **Model** — inherited from the parent session. Whichever model is driving the Claude Code session drives the sub-agent too.

This keeps the definitions minimal and avoids drift between agent-specific and session-wide configuration.

## Workflow patterns

Most non-trivial work follows a chain. Each step is handled by one sub-agent invocation:

```
shaper        →  planning/<spec>.md                       (when request is brittle/vague)
   ↓
planner       →  planning/<plan>.md
   ↓
taskplanner   →  fusion-workbench/tasklist.md             (queue of work for executors)
   ↓
coder         →  application code edits
ontocoder     →  data / ontology edits                (run in parallel with coder when independent)
   ↓
coderev       →  reviews/<review>.md                       + new issue files
ontorev       →  reviews/<review>.md                       + new issue files
   ↓
reconciler    →  ground-truth pass over all tracking files in fusion-workbench/
```

**Automated outer loop:** The `orchestrator` agent wraps the full pipeline — from shaping through execution, review, and reconciliation — in a managed session. It invokes `shaper` and `planner` (with human gates) when the input needs specification, then dispatches `taskplanner`, executors (`coder`/`ontocoder`), reviewers (`coderev`/`ontorev`), and `reconciler`, committing after each task and feeding review findings back into the next Turn. The orchestrator is the **only** agent that dispatches other agents.

Since v2.9.0, every Turn closes with a **Coherence Review** (per-Turn gate against the Directive); when a Turn's review concludes the Directive is unreachable as written, the orchestrator opens a **Rebalance gate** with four user options (Revise Artifact, Revise Directive, Revise Grounding, Accept Bounded Closure). At session end a **per-Circle three-edge verdict** judges the whole arc. See `docs/working-model.md` (the gates, Coherence Review, and Rebalance model) for the full model.

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
              │  Turn loop                  │ ← Turn budget (see below)
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
              │      ┌──────▼──────┐        │
              │      │ Coherence   │        │ ← per-Turn gate (v2.9.0+)
              │      │ Review      │        │   may open Rebalance gate
              │      └──────┬──────┘        │
              │             │ new issues    │
              │             │ → next Turn   │
              └─────────────┴───────────────┘
```

**The Turn budget is configuration, not a constant.** `bin/fusion-turn-budget` resolves it once per session, at the orchestrator's Setup, from `{"orchestrator": {"maxTurns": N}}` in the project's `fusion-guard.json`, merged per leaf over the plugin's `hooks/config.json` and then the built-in default, which is defined once in `hooks/lib/config.ts` `DEFAULTS`. No count is written into the orchestrator prompt or into the diagram above. When the resolution fails, the orchestrator substitutes none: it omits the maximum from `agentstate.yaml`, shows the dashboard's Turn field as `<current>/--`, treats the Max-Turns circuit breaker as not evaluable, and asks the user at every Turn boundary instead.

### Orchestrator observability

When the orchestrator runs, it produces three artifacts so the human can follow along and review afterward:

| Artifact | File | What it shows | How to view |
|----------|------|---------------|-------------|
| **Live dashboard** | `fusion-workbench/orchestrator-live.md` | Current task, Turn progress, queue, blocked items — overwritten at every transition | `watch cat fusion-workbench/orchestrator-live.md` in a second terminal |
| **Event log** | `fusion-workbench/orchestrator-events.jsonl` | Append-only JSONL with timestamped events (task start/done/error, gate hits, commits, reviews, circuit breakers) | `tail -f fusion-workbench/orchestrator-events.jsonl` for streaming, or `jq` for queries |
| **Sequence diagram** | Appended to the session's history file | Mermaid diagram of all agent dispatches, gate interactions, commits, and reviews | Open the history file in any Markdown viewer with Mermaid support |

**Combined view:** Run `./fusion-workbench/monitor "<session-name>" <port>` (e.g. `./fusion-workbench/monitor "My Session" 8099`) in a second terminal to see the live dashboard and recent events together in a browser. Use `-n 200` for more event lines (default 100) or `-i 1` for faster refresh.

The sequence diagram is the retrospective summary, appended to the history file at session end.

Two side loops feed into the chain at any point (outside the orchestrator's scope):

- **investigator** — when a captured project run shows inadequate output, the investigator walks the logs, vision-analyzes any screenshots, traces the failure across prompts / orchestrator / ontology / source material, files issues, and writes a report to `shared/investigations/` (investigations are always shared — they never originate in a Circle). Capture location and structure are project-specific and described by the project's `./rules/investigator-capture-layout.md` (template at `templates/`).
- **reconciler** — periodically run between sessions to make sure plan and issue states reflect what is actually in the codebase (file headers lie, the codebase doesn't). Also invoked by the orchestrator at session end.

## Plugin structure

The plugin ships a set of framework rule files under `rules/`, split into an always-on core and conditionally-emitted extras:

- **Always-on core** (every agent, in this order): `agent-setup.md` — emitted **first**, the factored Setup contract every one of the 17 prompts points at (read-every-emitted-path, the `bin/fusion-paths` `OUT_*`/`SCAN_*` semantics, exit-code handling) — then `fusion-workbench-conventions.md` (layout, state markers, filename patterns, issue filing, history logging), `decision-record-examples.md`, `user-facing-output.md`, and `critical-stance.md`, plus the project's short-form `chat-voice-<lang>.yaml` stylometric profile. The authoritative list is the `emit_if_exists` block in `bin/fusion-rules`.
- **Conditional:** `design-diagrams.md` for the design-diagram agents (the five producers + `conceptrev`); the long-form `default-voice-<lang>.yaml` for the prose agents; `circle-records.md` for the Circle-transitioning agents (`orchestrator`, `playmaker`, `shaper`); `workbench-stash-and-lock.md` for the `orchestrator`; and per-agent domain patterns (below).
- **Mechanism docs:** `context-manifest.md` and `context-lean-claude-md.md` author the optional topic-scoped loading convention (below); they are shipped, not auto-emitted.

Domain-specific rules (coding standards, ontology constraints, etc.) are **supplied by the consuming project** in its own `./rules/` (fusion-agent-specific) or `.claude/rules/` (project-wide) directory.

Agents discover their applicable rules via the helper `bin/fusion-rules <agent-name> [<topic>]`, which runs in each agent's Setup. The helper:

1. Emits the always-on core first — `agent-setup.md` ahead of everything, so an agent reads *how Setup works* before the detailed conventions — then the conditional extras for its agent kind.
2. Globs domain filename patterns against `$FUSION_PLUGIN_ROOT/rules/`, `./rules/` (fusion-agent-specific), and `.claude/rules/` (project-wide).
3. If the consuming project ships `./rules/context-manifest.yaml`, additionally emits the manifest units whose agent **and** topic match — a `path` unit as a file to read, a `skill:<name>` unit as an on-demand pointer. The topic comes from the optional `<topic>` argument, else the active Circle (an explicit `Topic:`/`Tags:` line, else the Circle slug). With the manifest **absent**, output is byte-identical to the pre-manifest behaviour.
4. Returns each match on its own line. The agent reads every emitted path.

`$FUSION_PLUGIN_ROOT` is exported by the plugin's `SessionStart` hook.

### Pattern → agent mapping

| Agent | Domain patterns matched | Typical project-local rule files |
|---|---|---|
| `coder`, `coderev`, `bugfixer` | `*coding*` | `./rules/coding-guidelines.md`, `./rules/coding-architecture.md` |
| `ontocoder`, `ontorev` | `*ontology*`, `*normative*`, `*verb*` | `./rules/ontology-rules.md`, `./rules/verb-ontology.md`, `./rules/normative.md` |
| `planner` | `*coding*`, `*ontology*` | both groups above |
| `investigator` | `*investigator*` | `./rules/investigator-capture-layout.md` |
| `orchestrator`, `shaper`, `taskplanner`, `reconciler`, `analyst`, `consultant`, `playmaker`, `conceptrev`, `editor`, `curator` | (no domain patterns — always-on core plus any conditional emissions listed above) | — |

If a pattern has no match in either directory, the agent operates on workbench conventions alone — agents skip missing rules silently rather than failing. Consuming projects can add their own rule files at any time and the next session picks them up automatically.

**Plus a shared rubric:** the plugin-shipped `rules/design-diagrams.md` is emitted (independent of the patterns above) to the design-diagram group — `planner`, `analyst`, `taskplanner`, `shaper`, `investigator` (the producers) and `conceptrev` (the evaluator). It defines how technical design is expressed as formal, parseable Mermaid and the coherence heuristics `conceptrev` judges by, so producer and evaluator share one definition of "coherent".

### Adding rules

In a consuming project, drop a markdown file into `./rules/` whose name contains the agent's domain pattern. Examples:

- `./rules/my-coding-style.md` → loaded by `coder`, `coderev`, `bugfixer`, `planner`
- `./rules/ontology-r-rules.md` → loaded by `ontocoder`, `ontorev`, `planner`
- `./rules/normative-sources.md` → loaded by `ontocoder`, `ontorev`

### `skills/` — user-invocable slash commands

| Slash command | File | What it does |
|---------------|------|--------------|
| `/fusion:setup` | `skills/setup/SKILL.md` | Bootstraps `fusion-workbench/`, writes the `.fusion-setup` marker, copies the monitor binary, and runs the orchestrator's mandatory Setup procedure. Since v4.0.0 it detects a pre-v4 type-folder workbench and refuses, pointing at `/fusion:migrate` |
| `/fusion:migrate` | `skills/migrate/SKILL.md` | Migrates a pre-v4 type-folder workbench to the v4.0.0 Circle-container layout: moves the old root type-folders wholesale into `shared/` (unknown origin → `shared/`) and stands up the `circles/` scaffold. Idempotent |
| `/fusion:help` | `skills/help/SKILL.md` | Explains what fusion is, daily use, install/update/configure paths, and where deeper docs live |
| `/fusion:commit` | `skills/commit/SKILL.md` | Stages, generates a conventional-commit message from the diff, asks the user to confirm, then commits |
| `/fusion:archive` | `skills/archive/SKILL.md` | Archives completed/aged workbench files into `fusion-workbench/archive/<YYMMDD-HHMM>-<slug>/` |
| `/fusion:log-activity` | `skills/log-activity/SKILL.md` | Scans project activity and generates/updates the activity log |
| `/fusion:memo` | `skills/memo/SKILL.md` | Appends a memo to the user's personal memo log or a task to the task list, both in `fusion-workbench/shared/memos/`; or files an idea as a new backlog entry in `fusion-workbench/shared/backlog/` |
| `/fusion:cadence` | `skills/cadence/SKILL.md` | Digests the session histories, the activity log, and git into three ranked topic lists — since yesterday, last 7 days, and recurring themes by churn — written to `fusion-workbench/shared/memos/cadence-<username>.md` (overwritten each run) |
| `/fusion:revise-claude-md` | `skills/revise-claude-md/SKILL.md` | Revises `CLAUDE.md` with learnings discovered during the current session (three-pass: add / update / prune) |
| `/fusion:unlock` | `skills/unlock/SKILL.md` | Writes a permissive `.claude/settings.local.json` so future sessions skip per-tool approval prompts |
| `/fusion:cleanup` | `skills/cleanup/SKILL.md` | Autonomous session wrap-up: files issues for open tasks, commits + pushes the work in meaningful splits, reconciles, archives (tier-1), revises `CLAUDE.md`, logs activity, then commits + pushes the housekeeping artifacts |
| `/fusion:next` | `skills/next/SKILL.md` | Portfolio briefing — dispatches `playmaker`, renders the next-recommended Circle, and offers interactive activation |
| `/fusion:direct` | `skills/direct/SKILL.md` | Drafts a Directive as an anticipated (`_a_`) Circle — `shaper` refines a one-line draft via clarifying questions and writes the Circle record without starting a Turn loop |
| `/fusion:circle-stash` | `skills/circle-stash/SKILL.md` | Freezes the complete state of the active Circle (its directory, the pointer, agent state, dashboard, queue, working tree) into a self-contained stash for later restoration |
| `/fusion:circle-pop` | `skills/circle-pop/SKILL.md` | Restores a stashed Circle into the workbench, with HEAD-hash drift detection. Pairs with `/fusion:circle-stash` |
| `/fusion:seed-from-plane` | `skills/seed-from-plane/SKILL.md` | Seeds a new anticipated Circle from a Plane issue — one bounded read of the story's title + description, then the standard `/fusion:direct` → `shaper` Circle-creation path |
| `/fusion:curate` | `skills/curate/SKILL.md` | Reconciles the three normative surfaces — decision records, the project's own `./rules/` and `.claude/rules/` files, and `CLAUDE.md` — against the project's recorded history. Dispatches `curator` to survey, holds the change-ledger gate, dispatches it again to apply only what was approved. Writes nothing itself |

Slash commands are independent of sub-agent routing — invoke them from the parent session when you need to commit, set up, or revise project-level rules.

## Where the work persists

Every agent writes to `fusion-workbench/` and never to its own scratchpad — a sub-agent's context window does not survive the parent session, and even within a session the agents share no memory with each other.

Since v4.0.0 the workbench is **Circle-as-container**: a Circle is a directory holding everything one unit of work produces, and work with no Circle affiliation lives in `shared/`. Agents do not hard-code these paths — they resolve their write and scan targets through `bin/fusion-paths <name>` at Setup (alongside `bin/fusion-rules`) and where an artifact lands follows the Origin Rule (it belongs to the Circle whose Directive caused it; with no active Circle it goes to `shared/`).

```
fusion-workbench/
├── circles/<stamp>-<slug>/     # one directory per unit of work; _t_circle.md carries the marker (all states glob as *_circle.md)
│   ├── planning/  issues/  decisions/  history/  analyses/
│   └── reviews/                # coderev + ontorev + conceptrev output, merged (sender in filename)
├── shared/                     # everything with no Circle affiliation
│   ├── planning/  issues/  decisions/  history/  reviews/  analyses/
│   ├── investigations/         # investigator output — shared-only
│   ├── consult/                # consultant reports — shared-only
│   ├── memos/                  # personal memo logs — shared-only
│   └── backlog/                # ideas not yet units of work — shared-only
├── portfolio.md                # playmaker output
└── tasklist.md                 # taskplanner output (dependency-ordered work queue)
```

The layout, the Origin Rule, the operative half of the `bin/fusion-paths` resolution contract, the issue/planning and decision state markers, marker globs, and inline progress tracking are all defined once in `fusion-workbench-conventions.md` (auto-loaded from the plugin's `rules/` directory). Its header table names the four topics that have their own authoring homes next door — the resolver's key table (`workbench-path-resolution.md`), the Circle state vocabulary and record templates (`circle-records.md`), rule-file provenance (`rule-file-provenance.md`), and stashes plus the commit lock (`workbench-stash-and-lock.md`) — each emitted only to the agents that apply it. Every agent confirms the rule is in context during Setup so the conventions are uniform.

## Invariants

- **No agent modifies its own definition file.** Updates to `agents/*.md` are made by the user or via a normal code change — never by the agent itself.
- **No agent edits files outside its declared scope.** Cross-layer findings flow through the `issues/` store (in the active Circle or `shared/`), not direct edits. Scope is enforced by prose in each agent prompt.
- **Only the orchestrator dispatches other agents.** All other agents are leaf nodes — they do their work and return. The orchestrator is the sole coordinator. It never recurses (no self-invocation), and it never invokes `investigator` (user-initiated only).
- **Issues live in an `issues/` store (resolved into the active Circle or `shared/`), never embedded in plans, reviews, or chat output.** This is enforced in `fusion-workbench-conventions.md` and applies to every agent.
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
3. Setup must confirm that `fusion-workbench-conventions.md` and any other relevant rule files from the plugin's `rules/` directory are present in context (discovered by running `bin/fusion-rules <agent-name>` at Setup — nothing is auto-loaded).
4. Declare what the agent may read and what it may write — be explicit and exclusive.
5. Register the agent in:
   - The agent listing bullet under `## What this is` in `CLAUDE.md` — it names every agent and states the count
   - The `## Layout` table in `CLAUDE.md` — its `agents/*.md` row states how many prompts ship
   - The agent table at the top of this README

   `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` checks the **digit counts** in the two `CLAUDE.md` surfaces against `agents/*.md` — the listing bullet's "N specialized agents", and the Layout row's "The N agent prompts" and "the other N inherit" — so an agent added without bumping them fails the test suite. It checks no **names**: nothing enumerates the agents named in the listing bullet, and nothing checks this README's own agent table row by row, so an agent whose name reaches none of the three surfaces still passes as long as the counts agree. The registration is yours to get right; the gate only holds the counts to the tree.

## Migration note

These agents were previously stored as plain prompts in `ccagents/` and later in `.claude/agents/`. Both paths are now legacy. Historical session logs — in `shared/history/`, and in each Circle's own `history/` — may reference old paths; those are immutable records.
