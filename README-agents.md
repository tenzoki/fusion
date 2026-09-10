# agents/ — Claude Code sub-agents

The `agents/` folder holds the plugin's Claude Code sub-agent definitions. Each `agents/*.md` file is one role: YAML frontmatter declares the agent's name and description, the body is the operating prompt. (This README lives at the repo root, outside the scanned folder.)

Claude Code scans `agents/*.md` at session start, reads each frontmatter block, and makes the agents available as specialized sub-agents for the parent session — only files with a valid `name`/`description` frontmatter count.

The agents are deliberately small and single-purpose. They divide labor across planning, implementation, review, reconciliation, and forensic analysis, and they share the same workbench layout (`fusion-workbench/`) and the same rule set (auto-loaded from the plugin's `rules/` directory).

## Quickstart

Three ways to invoke an agent from a Claude Code session at the project root:

1. **Natural-language delegation.** Describe the work — e.g. "plan a refactor of the orchestrator" or "review pkg/ai for error handling". Claude reads each agent's `description` and routes automatically.
2. **Explicit mention.** Name the agent — e.g. `@reviewer scan pkg/designer` or "use the `planner` agent to…". Use this when auto-routing picks the wrong one.
3. **Inline read.** Ask Claude to read the file directly — e.g. "read `agents/planner.md` and follow it". This loads the prompt into the current context instead of spawning a sub-agent, so you keep one shared scratchpad. Useful for quick one-offs when context isolation isn't wanted.

Options 1 and 2 launch a sub-agent with its own context window (see [How to invoke an agent](#how-to-invoke-an-agent) below). Option 3 runs the prompt inline in the parent session.

## The agents

Since v4.0.0 the **Writes** column names artifact *kinds*, not fixed root paths. Each kind resolves at run time through `bin/fusion-paths` into the active Circle (`<circle>/planning/`, `<circle>/issues/`, …) or into `shared/` when no Circle is active — the Origin Rule decides which. The former review folders (`codereview/`, `ontoreview/`, `conceptreview/`) are merged into one `reviews/`, with the reviewing sender named in the filename.

| Agent | Role | Reads | Writes | Output goes to |
|-------|------|-------|--------|----------------|
| `shaper` | Turns vague/brittle user requests into precise specs with user involvement. Four invocation modes: user-direct, in-Circle clarification, portfolio-activation (re-clarifies an anticipated **or active** Circle's Directive), anticipated-circle (captures a draft Directive as a new anticipated Circle) | Anything, including the shared backlog store — a backlog entry is a valid draft | `planning/` (spec files), `decisions/` (decisions the user defers), `issues/`, `history/`. In portfolio-activation mode also the cited Circle record's `## Directive` and `## Grounding snapshot` sections in place — on an `_a_` **or** a `_t_` record, never a terminal one — plus, under `**Scope:** spec`, its `**Active spec/plan:**` head field and, in the same command, the Directive pointer literal in place of the prose. In anticipated-circle mode a new Circle directory `circles/<stamp>-<slug>/` holding its `_a_circle.md` record and the six artifact subdirectories, plus — only when that entry holds a single idea — the marker rename to closed and the `Promoted:` line on the backlog entry the draft came from; an entry holding several is left untouched and reported back | Spec document with capabilities, acceptance criteria, and user decisions — or, in anticipated-circle mode, an anticipated Circle record instead of a spec |
| `planner` | Designs implementation plans from specs or clear requests, no code changes; every plan step names exactly one executor agent | Anything, and specifically the specs and plans under `planning/`, the reports under `analyses/`, the open and answered records under `decisions/`, and the defect records under `issues/` | `planning/`, `decisions/` (choice points that planning surfaces, cited from the plan rather than held inside it), `issues/`, `history/` | Markdown plan whose head carries the mandatory `**Decidability:**` line and whose every step declares its executor, files, changes and dependencies |
| `coder` | Implements **application code** per a plan or task | Anything | `.go`, `.rs`, `.ts`, `.tsx`, `.py`, `.js`, `.java`, build manifests and build configuration whatever the extension (`Makefile`, `go.mod`, `package.json`, `Cargo.toml`, `tsconfig.json`), build scripts, tests, code-level documentation (architecture notes, API docs, code READMEs), `history/`, `issues/` | Code edits + history log |
| `ontocoder` | Implements **structured-data and ontology** changes per a plan or task | Anything | `.yaml`, `.yml`, `.json`, `.toml`, `.csv`, `.tsv`, `.xml`, `.ndjson` where they carry data, ontology, manifests, schemas, fixture data, derived stats/index files, data documentation, `history/`, `issues/` | Data edits + history log |
| `reviewer` | Reviews **application code, prompts, build/packaging and tooling** and **ontology, manifests and verb hierarchies** — one agent, two domains, selected by `**Review domain:**`; files findings | Anything | `reviews/`, `issues/` (`$OUT_REVIEW` and `$OUT_ISSUE`, resolved per-Circle or `shared/`) | Review report + issue files |
| `reconciler` | Reconciles plans / issues / reviews against the actual codebase | Anything | Tracking files under `planning/`, `issues/` and `reviews/` (status markers, marker renames, reconciliation logs and evidence citations — never the descriptions themselves), `history/`, new `issues/` and `decisions/`, plus the `## Coherence` section appended to the orchestrator's session-history file | Updated tracking files + Coherence verdict + history log |
| `consultant` | On-demand expert consultation — answers a specific question from a referenced corpus, files issues for whatever work the answer reveals | Anything | `consult/` (shared-only), `issues/`, `decisions/`, `history/` (history entries only when explicitly asked) | Consultation report + issue and decision files |
| `analyst` | Document study and problem analysis — comparative, gap, risk, feasibility, impact, plus decision records, architectural snapshots and forensic investigation of a captured failure | Anything (esp. logs, prompts, ontology, code, image files via vision) | `analyses/`, `issues/`, `decisions/`, `history/` | Analysis report + issue files |
| `editor` | Produce-only Redakteur — writes, revises, translates (en↔de), and renders **customer-ready deliverables**; branded decks via `dl-brand-pptx` + `pptx`. Never reviews, files issues, or dispatches. The dispatch must name the deliverable's language or the agent halts — see **Dispatch parameters** below | Anything | **Project-side deliverables** (Markdown, branded pptx, translations), `history/` (session log only) | Finished deliverable + history log |
| `orchestrator` | Runs the session's dispatch loop: reads one task, dispatches it, reads the return, commits it, and says where things stand | Anything except `.secret` | Dispatches agents and creates commits. Writes `issues/` (out-of-scope reverts, fusion bugs); `decisions/` (a new open record raised at a human gate); the two root-anchored session files `orchestrator-events.jsonl` and `.active-circle`; state-marker renames on issues, plans and the Circle record; and exactly three parts of the active Circle record (`## Closure note`, the two head fields, and the `## Directive` section written only as the fixed pointer literal riding a head-field write) | Progress report + commits + updated tracking files |
| `curator` | Reconciles the three **normative surfaces** — decision records, the project's own `./rules/` and `.claude/rules/` files, and `CLAUDE.md` — against the project's recorded history. Removes what history retired, resolves what the surfaces state in contradiction. Every change carries an evidence tier and a citation; nothing lands before a user gate. It advances no marker on ground-truth verification (reconciler) and proposes nothing on the strength of what the current session did | Anything except `.secret` — plus the whole workbench, the archive store and the full git history as evidence | The three surfaces themselves (gated); `history/` (the run file, which is also the change ledger), `decisions/` (an open record for a contradiction it may not resolve), `issues/` (work outside its remit) | Change ledger + applied edits + history log |

**"Anything" in the Reads column is the project tree minus `.secret`.** These prompts state that exclusion in their own Scope section — `analyst`, `consultant`, `curator`, `orchestrator`, `planner`, `reviewer`, `shaper`. The rest (`coder`, `ontocoder`, `reconciler`, `editor`) say nothing about `.secret` either way.

**The reviewer writes no session history.** Its prompt states it: the review file under `$OUT_REVIEW` is that session's durable record, and a history log would only duplicate it. That is why `history/` is absent from its Writes column and why `bin/fusion-paths` values it no `OUT_HISTORY` key.

**What decides the `coder` / `ontocoder` split is the file's role, not its extension.** `agents/orchestrator.md` `## Agent Routing Table` is the authority for it: a `.json` or `.toml` that configures the build or declares the project's dependencies (`package.json`, `Cargo.toml`, `tsconfig.json`) is the `coder`'s, and the same extension holding ontology entries, manifest data or a schema is the `ontocoder`'s. Stated once here rather than as an exception clause in each row, so a new build manifest or a new data format needs no edit to the table.

**Hard rule across all agents:** read-only on layers outside the agent's primary scope. A reviewer never edits code. A `coder` never edits ontology yaml. An `ontocoder` never edits Go. Nobody edits anything inside an evidence capture. The orchestrator never edits code or data directly — it dispatches executors. Cross-layer findings are filed as issues and routed to the right executor. The scope is enforced by prose in each agent's prompt, not by a `tools:` allowlist. **One exception went at v11 and its guard went with it:** `bugfixer` was the one agent permitted to edit both code and data, because bugs cross layer boundaries, and its ontology edits needed a human gate.

**Dispatch is the orchestrator's monopoly.** Only `orchestrator` invokes other agents via the `Agent` tool. The constraint is **prose-enforced** in each non-orchestrator agent's prompt — sub-agents that identify work for another agent **recommend** the dispatch in their output (issue file, plan step, consultation report) but never call `Agent` directly. This prevents cycles and keeps the dependency tree shallow. (A v2.8.1 attempt to enforce this via `disallowedTools: [Agent]` in frontmatter broke agent loading entirely and was rolled back in 2.8.3 — the canonical syntax remains TBD.)

## Dispatch parameters

Six agents read run-time parameters off the dispatch prompt: plain markdown lines of the form `**<Keyword>:** <value>`, one per line, ahead of the directive body. A value may run past its own line, and the three that do are bounded differently. `**Draft:**` and `**Answers:**` each end at the next `**<Keyword>:**` line or at the end of the prompt (`agents/shaper.md:70`). `**Initiated by:**` is a quotation and may wrap; it ends at the next `**<Keyword>:**` line or at the end of the parameter block, and no prompt states a one-line bound for it. **This table is the roster's single authoring home** — the agent rows above name no parameters, and `CLAUDE.md` cites this section rather than restating it. `Declared at` names the prompt lines each row was read against. `Passed by` has its own ground truth, and it is not the agent prompts: a skill can pass a parameter no agent prompt mentions, so every cell in that column was read against `agents/*.md` **and** every `skills/*/SKILL.md` body, and names the line it was read against wherever the passer is a skill.

| Agent | Parameter line | Accepted values | If absent | Passed by | Declared at |
|-------|----------------|-----------------|-----------|-----------|-------------|
| `reconciler` | `**Domain:**` | the same two | defaults to `code`; selects the ground-truth verification protocol | the orchestrator, when the user asks for a reconciliation (`agents/orchestrator.md` `## Reconciliation, and the one gate it opens`); `/fusion:reconcile` Step 4 (`skills/reconcile/SKILL.md` `## Step 2 — The three values the dispatch carries`), which obtains the domain from `bin/fusion-session-domain` and never decides one | `agents/reconciler.md:28-30`, `:41-43` |
| `reviewer` | `**Review domain:**` | `code` \| `ontology` \| `both` | defaults to `both` — the pass covers each domain it finds, which is the safe direction: an omitted line costs reading time, never a skipped domain | the orchestrator, at a Circle's closure, from what the uncovered commits changed (`agents/orchestrator.md` `## Closing a Circle` step 2); or the user on a direct dispatch | `agents/reviewer.md` `## Two review domains, one agent` |
| `planner` | `**Executors:**` | comma-separated, each one of `coder` \| `ontocoder` \| `analyst` | defaults to `[coder, ontocoder]`; unrecognised names are ignored | orchestrator, on **every** planner dispatch, with no condition in front of it (`agents/orchestrator.md:434`) | `agents/planner.md:47-51` |
| `planner` | `**Circle:**` | a Circle directory name — no marker, no `.md`, no prefix | resolves as usual: the active Circle when one is active, `shared/` when none is | the user, on a direct planner dispatch, to plan an anticipated Circle before it is activated. No agent prompt and no skill body passes it: the orchestrator's only planner dispatch (`agents/orchestrator.md:434`) passes `**Executors:**` alone. A name matching no directory exits 1 from the resolver and the planner halts rather than re-resolving | `agents/planner.md:53-55` |
| `shaper` | `**Mode:**` | `portfolio-activation` \| `anticipated-circle` | falls back to the existing mode-detection heuristic, i.e. user-direct | the user directly, or the orchestrator on the one dispatch decision `260813-0027_*_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md` permits (`agents/orchestrator.md:342`), for `portfolio-activation`; `/fusion:direct` (`skills/direct/SKILL.md:64`) for `anticipated-circle` | `agents/shaper.md:39-47`, `:70` |
| `shaper` | `**Circle file:**` | workbench-relative path to a Circle's record — `_a_circle.md` or `_t_circle.md` | **halts** whenever `**Mode:** portfolio-activation` was given and this line is missing or unreadable, and again when the record it names carries a terminal marker (`_c_`, `_b_`, `_s_`, `_d_`) | the user running shaper top-level, or the orchestrator when the user's answer at a gate named this mode and the dispatch carries `**Initiated by:**` (`agents/shaper.md:47`, `agents/orchestrator.md:343`). No other agent and no skill dispatches it | `agents/shaper.md:47`, `:49`, `:68` |
| `shaper` | `**Scope:**` | `directive-only` \| `spec` | defaults to `spec`, which is what every dispatch written before the line existed meant. Under `directive-only` the run also **halts** when the record's `**Active spec/plan:**` reads anything but `(none yet)` — a Circle with a spec states its Directive there | the same passer as `**Circle file:**`: the user running shaper top-level, or the orchestrator quoting the user's gate answer (`agents/orchestrator.md:344`). The dispatcher states it because the shaper holds no input that separates a Directive correction from a re-shaping | `agents/shaper.md:51`, `:53-64`, `:68` |
| `shaper` | `**Initiated by:**` | the question the user was asked, the option they chose, and the date — quoted, not paraphrased (may span lines; ends at the next `**<Keyword>:**` line or the end of the parameter block) | **halts** whenever `**Mode:** portfolio-activation` was given and this line is missing or empty — on every such run, dispatched or top-level, with no case exempt. The self-test that used to waive it for a top-level run was deleted: it read the absence of `AskUserQuestion` as proof of dispatch, and a top-level `--agent fusion:shaper` run holds none either (`agents/shaper.md:66`) | orchestrator, on the portfolio-activation dispatch and on every re-dispatch of it (`agents/orchestrator.md:345`); a top-level user run passes it too, and no skill passes it | `agents/shaper.md:66`, `:68` |
| `shaper` | `**Draft:**` | the user's raw draft text (may span lines), or a path to a backlog entry | **halts** whenever `**Mode:** anticipated-circle` was given and this line is missing or empty | `/fusion:direct <draft>` (`skills/direct/SKILL.md:65`, `:101`) | `agents/shaper.md:70`, `:73`, `:117` |
| `shaper` | `**Domain:**` | the same two | defaults to `code` | `/fusion:direct`, on the first dispatch and on every relay re-dispatch (`skills/direct/SKILL.md:66`, `:102`). Anticipated-circle mode only, and a pass-through: it fills the new Circle record's `**Domain:**` frontmatter and changes nothing about how the shaper itself works | `agents/shaper.md:70`, `:93` |
| `shaper` | `**Answers:**` | a block, one line per question of the previous round with the user's answer in their own words (may span lines; ends at the next `**<Keyword>:**` line or the end of the prompt) | a first-round dispatch, which is the ordinary case; absence is not an error | `/fusion:direct` Step 4b, on every re-dispatch after a clarification round (`skills/direct/SKILL.md:103`) | `agents/shaper.md:70` |
| `shaper` | `**Parent task:**` | path to the active task file | no parent-task context; the spec output is the same either way | orchestrator, in in-Circle clarification mode, per the declaring prompt (`agents/shaper.md:45`) — the orchestrator's own prompt names no such line | `agents/shaper.md:45` |
| `editor` | `**Deliverable language:**` | `de` \| `en` | **halts and produces nothing.** This is the one parameter with no default and no fallback | orchestrator (`agents/orchestrator.md:485`, `:1321`), or the user | `agents/editor.md:18-30` |
| `curator` | `**Mode:**` | `survey` \| `apply` | defaults to `survey`, the pass that writes to none of the three surfaces | `/fusion:curate`, on both of its dispatches (`skills/curate/SKILL.md` `## Step 2 — Dispatch the curator to survey`, `## Step 6 — Dispatch the curator to apply`); or the user on a direct dispatch | `agents/curator.md` `## Dispatch parameters` |
| `curator` | `**Ledger:**` | workbench-relative path to a run file this agent wrote | **halts** whenever `**Mode:** apply` was given and this line is missing | whoever held the gate, on the apply dispatch: `/fusion:curate` (`skills/curate/SKILL.md` `## Step 6 — Dispatch the curator to apply`), or an agent that proxied the gate question to the user | `agents/curator.md` `## Dispatch parameters` |
| `curator` | `**Approved:**` | entry ids, comma-separated (`L01,L04`), or `all` | **halts** whenever `**Mode:** apply` was given and this line is missing. An empty approval set is a rejection, not an omission | the same passer as `**Ledger:**` — the two travel together or not at all (`skills/curate/SKILL.md` `## Step 6 — Dispatch the curator to apply`) | `agents/curator.md` `## Dispatch parameters` |
| `curator` | `**Scope:**` | `anchored` \| `full` | defaults to `anchored`, the evidence pass bounded by `last_curator_run` (decision `260827-0745_*_may-the-curators-evidence-pass-be-bounded-by-its-own-previous-run.md`); `full` forces the unbounded pass | `/fusion:curate`, only when the user passed `--full` (`skills/curate/SKILL.md` `## Step 2 — Dispatch the curator to survey`) | `agents/curator.md` `## Dispatch parameters`, `## Evidence` |
| `analyst`, `coder`, `ontocoder`, `planner`, `reconciler`, `reviewer` | `**Audience:**` | `user` — the only value there is; any other, and any other `--` option, exits 1 from `bin/fusion-rules` with nothing on stdout | the agent calls `fusion-rules` unflagged, so it receives `rules/user-facing-output.md` only if the helper's own name list covers it. Absence is never an error and never a halt | nobody yet: no agent prompt and no skill body writes this line. The mechanism landed ahead of the roles that need it (decision `260909-1843_*_what-are-the-conditional-rule-emissions-keyed-on-once-they-are-not-keyed-on-the-agent-name.md`), and until then a dispatcher that wants a sub-agent's output read by the user writes it by hand. **Three roles rely on it since v11**: the `planner` (which absorbed no shaper but still runs clarification rounds), the `analyst` and the `reviewer` each hold the user's attention on some dispatches and report to the orchestrator on the rest | `agents/planner.md:13`, and the same Setup line in the other five — `agents/analyst.md:15`, `agents/coder.md:13`, `agents/ontocoder.md:13`, `agents/reconciler.md:13`, `agents/reviewer.md:15` |

**The audience row is the only one that is not keyed on the agent name, and the only one no agent is obliged to receive.** Every other conditional emission in `bin/fusion-rules` asks the roster what a role *always* is. That question cannot answer who reads one particular run's output, so a role that holds a gate on some dispatches and reports to the orchestrator on the rest carries the full user-facing style contract — 10 884 bytes, the largest conditional there is — on every one of them. `**Audience:** user` asks the dispatch instead, and the agent turns it into `--audience=user` on its own Setup call. The helper's name list (`orchestrator`, `consultant`, `shaper`, `editor`, `curator`) stays as the fallback, so no role that is user-facing by nature can lose `rules/user-facing-output.md` by omission; only a role that is not user-facing by nature gains the ability to ask for it. The clause is absent from those five prompts for that reason: for them the flag is a no-op, and 81 bytes on a dispatch path buys nothing. The parameter reaches exactly this one rule file and no other emission moves with it, which `hooks/lib/__tests__/rules-emission-golden.test.ts` `describe("the audience argument")` asserts over the whole roster.

**The editor's halt is the deliberate exception, not an oversight.** Every other absent parameter has a defined default, so a dispatch that omits it still runs. A customer deliverable follows neither the project's chat language nor its artifact language — it is written for a reader outside the project, so its language is a per-deliverable fact the dispatcher has to state. A silent default would hand the customer a *finished* document in the wrong language, discovered by the customer rather than by a stop. The editor therefore refuses to start and says what to re-dispatch. Ruled in decision `260807-2131_*_which-language-governs-a-customer-deliverable.md`; the customer-deliverable case is in `rules/fusion-workbench-conventions.md` `## Project language`.

**One agent is parameterised by domain, and `planner` is not it.** The behaviour-changing `**Domain:**` parameter is read by `reconciler` alone since v11, when `taskplanner` and `playmaker` were removed. `shaper` accepts the same line in anticipated-circle mode but only copies it into the record it writes. `agents/planner.md` parses no `**Domain:**` line at all; what it takes is `**Executors:**`, which the orchestrator passes on **every** planner dispatch with no condition in front of it. The domain-conditional derivation was deleted on 2026-08-15: whether a step needs `analyst` is a question the plan answers, and no caller upstream of the plan holds the input to answer it. Several fusion surfaces described the planner as domain-parameterised until 260813; they were corrected against the prompt, and whether the planner *should* take a domain parameter is an open design question filed as a decision record, not a documented fact.

## How to invoke an agent

Claude Code offers two ways to delegate to a sub-agent from the parent session:

1. **Natural-language delegation.** Ask for the kind of work the agent handles — e.g. "plan a refactor of the orchestrator's term-resolution path" or "review pkg/ai for error handling". Claude reads each agent's `description` and routes the request automatically.
2. **Explicit mention.** Name the agent directly — e.g. "use the `reviewer` agent to scan pkg/designer" or "@reviewer verify the verb hierarchy after the last UEO bump". Use this when auto-delegation picks the wrong agent or when you want to be unambiguous.

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
   ↓
coder         →  application code edits
ontocoder     →  data / ontology edits                (run in parallel with coder when independent)
   ↓
reviewer      →  reviews/<review>.md                       + new issue files
   ↓
reconciler    →  ground-truth pass over all tracking files in fusion-workbench/
```

**The session's dispatch loop:** The `orchestrator` agent runs the work one task at a time. It invokes `shaper` and `planner` (with human gates) when the input needs specification, then dispatches executors (`coder`/`ontocoder`), the `reviewer` and, when the user asks for it, `reconciler` — committing after each task and reporting before it takes the next one. The orchestrator is the **only** agent that dispatches other agents.

**Coherence is judged when a person asks for it, and never on a schedule.** A reconciliation the user runs by hand returns a three-edge verdict against the Directive; on anything but `coherent` the orchestrator opens a **Rebalance gate** with four moves (Revise Artifact, Revise Directive, Revise Grounding, Accept Bounded Closure). That is the gate's only trigger — the per-round Coherence check that used to reach it was removed on 2026-09-10, so a session that runs no reconciliation never meets it. See `docs/working-model.md` for the gates and the Rebalance model.

```
                          ┌──────────────────────────────┐
                          │        orchestrator           │
                          └──────┬───────────────┬────────┘
                                 │               │
                    ┌────────────▼──┐   ┌────────▼────────┐
                    │   shaper      │   │   reconciler     │
                    │ (if needed)   │   │  (when asked)    │
                    └────────┬──────┘   └─────────────────┘
                    ← human gate: spec review
                    ┌────────▼──────┐
                    │   planner     │
                    │ (if needed)   │
                    └────────┬──────┘
                    ← human gate: plan review
              ┌──────────────▼──────────────┐
              │  dispatch loop              │ ← one task at a time (see below)
              │  ┌────────┐  ┌───────────┐  │
              │  │ coder  │  │ ontocoder │  │ ← human gate on ontocoder
              │  └───┬────┘  └─────┬─────┘  │
              │      │  validate   │        │
              │      ├─── fail? ───┤        │
              │      │  ┌────────┐ │        │
              │      │  │re-send │ │        │ ← one self-healing attempt,
              │      │  └───┬────┘ │        │   back to the same executor
              │      │  commit(s)  │        │
              │      └──────┬──────┘        │
              │      ┌──────▼──────┐        │
              │      │  reviewer   │        │
              │      │             │        │
              │      └──────┬──────┘        │
              │      ┌──────▼──────┐        │
              │      │ report, and │        │ ← the user says what is next
              │      │ ask         │        │
              │      └──────┬──────┘        │
              │             │ new issues    │
              │             │ → next task   │
              └─────────────┴───────────────┘
```

**The loop is bounded by the user, and by nothing else.** One task is in flight at a time; when it is committed the orchestrator reports and asks what is next. There is no Turn count, no configured ceiling and no circuit breaker: the Turn budget, the `orchestrator.maxTurns` setting behind it and the helper that resolved it all went on 2026-09-10, and the setting is a retired leaf that earns one advisory in any project still declaring it. `citations.extraPaths` is the one setting fusion's configuration loader resolves now. **Do not read the removal as "the loop is unbounded"** — it is bounded by a person paying attention, which is a real bound and a different one.

### Orchestrator observability

When the orchestrator runs, one artifact records what happened, and one program renders it:

| Artifact | File | What it shows | How to view |
|----------|------|---------------|-------------|
| **Event log** | `fusion-workbench/orchestrator-events.jsonl` | Append-only JSONL with timestamped events (task start/done/error, gate hits, commits, reviews), each line naming the person, the checkout and the session that wrote it | `tail -f fusion-workbench/orchestrator-events.jsonl` for streaming, or `jq` for queries |
| **Dashboard** | rendered from that log | The dispatch in flight, recent events, commits and the hooks' write trail | `./fusion-workbench/monitor "<session-name>" <port>` in a second terminal, then open `http://localhost:<port>` |

Use `-n 200` for more event lines (default 100) or `-i 1` for faster refresh. Two artifacts stood beside the log until 2026-09-10 and both went: a dashboard **file** the model overwrote by hand, replaced by the monitor reading the log directly, and a Mermaid sequence diagram appended to the session's history file, which went with the history store.

One side loop feeds into the chain at any point (outside the orchestrator's scope):

- **reconciler** — run by hand, by the user, to make sure plan and issue states reflect what is actually in the codebase (file headers lie, the codebase doesn't). `/fusion:reconcile` is the command; the orchestrator dispatches it when the user asks and never on a schedule of its own.

## Plugin structure

The plugin ships a set of framework rule files under `rules/`, split into an always-on core and conditionally-emitted extras:

- **Always-on core** (every agent, in this order): `agent-setup.md` — emitted **first**, the factored Setup contract every one of the 11 prompts points at (read-every-emitted-path, the `bin/fusion-paths` `OUT_*`/`SCAN_*` semantics, exit-code handling) — then `fusion-workbench-conventions.md` (layout, state markers, filename patterns, issue filing, history logging) and `critical-stance.md`, plus the project's short-form `chat-voice-<lang>.yaml` stylometric profile. The authoritative list is the `emit_if_exists` block in `bin/fusion-rules`.
- **Conditional:** `design-diagrams.md` for the design-diagram agents (`planner`, `analyst`, `shaper`); the long-form `default-voice-<lang>.yaml` for the prose agents; `circle-records.md` for the Circle-transitioning agents (`orchestrator`, `shaper`); `decision-record-examples.md` for the decision-transition agents (`orchestrator`, `shaper`, `planner`, `reconciler` — moved off the always-on floor at the `260827-0830_*_do-the-decision-record-worked-examples-stay-on-the-always-on-floor.md` user gate); `user-facing-output.md` for the agents the user reads directly (`orchestrator`, `consultant`, `shaper`, `editor`, `curator` — gate `260827-0910_*_does-every-dispatch-carry-the-full-user-facing-style-contract.md`; everyone else keeps the chat profile's anti-patterns via `agent-setup.md`); `commit-lock.md` for the `orchestrator`; `project-language.md` for the `editor` and `backlog-entries.md` for the `orchestrator` (decision `260827-1056_*_which-parts-of-the-language-and-backlog-rules-does-every-dispatch-still-carry.md` — the operative cores stay always-on in the conventions); `review-contract.md` for the review-writing agent (`reviewer`); and per-agent domain patterns (below).
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
| `coder` | `*coding*` | `./rules/coding-guidelines.md`, `./rules/coding-architecture.md` |
| `ontocoder` | `*ontology*`, `*normative*`, `*verb*` |
| `reviewer` | `*coding*`, `*ontology*`, `*normative*`, `*verb*` | both sets, because one agent covers both review domains | `./rules/ontology-rules.md`, `./rules/verb-ontology.md`, `./rules/normative.md` |
| `planner` | `*coding*`, `*ontology*` | both groups above |
| `analyst` | `*analyst*` | `./rules/analyst-capture-layout.md` |
| `orchestrator`, `shaper`, `reconciler`, `consultant`, `editor`, `curator` | (no domain patterns — always-on core plus any conditional emissions listed above) | — |

If a pattern has no match in either directory, the agent operates on workbench conventions alone — agents skip missing rules silently rather than failing. Consuming projects can add their own rule files at any time and the next session picks them up automatically.

**Plus a shared rubric:** the plugin-shipped `rules/design-diagrams.md` is emitted (independent of the patterns above) to the design-diagram group — `planner`, `analyst`, `shaper`. It defines how technical design is expressed as formal, parseable Mermaid and the coherence heuristics each producer self-checks against, so one definition of "coherent" governs every diagram the fleet draws.

### Adding rules

In a consuming project, drop a markdown file into `./rules/` whose name contains the agent's domain pattern. Examples:

- `./rules/my-coding-style.md` → loaded by `coder`, `reviewer`, `planner`
- `./rules/ontology-r-rules.md` → loaded by `ontocoder`, `reviewer`, `planner`
- `./rules/normative-sources.md` → loaded by `ontocoder`, `reviewer`

### `skills/` — one file per slash command

**The administrative surface is three names: `/fusion:setup`, `/fusion:cleanup`, `/fusion:cadence`.** Setup at the start of a session, cleanup at the end, cadence to see what happened. Four more bodies in the table — `archive`, `log-activity`, `curate` and `post` — are steps of the cleanup pipeline rather than commands of their own, reached with `/fusion:cleanup --only <step>`; they keep their own files because a procedure copied into a caller is a procedure that drifts from it. The rest of the table is situational: `check`, `commit`, `memo`, `migrate`, `next`, `direct`, `news`, `help`. `/fusion:check` is where the ramp-up went: the installation checks Setup used to run every session, now run on demand or when Setup says one is due.

| Slash command | File | What it does |
|---------------|------|--------------|
| `/fusion:setup` | `skills/setup/SKILL.md` | Bootstraps `fusion-workbench/`, writes the `.fusion-setup` marker, seeds the stylometric profiles, and names the periodic checks that are due. Since v4.0.0 it detects a pre-v4 type-folder workbench and refuses, pointing at `/fusion:migrate` |
| `/fusion:check` | `skills/check/SKILL.md` | Runs fusion's ten periodic installation checks — the monitor copy, the concurrent-session warning, the shipped assets, `fusion.json`, the permission file, the event log's merge driver, this checkout's identity, the `.gitignore` partition, the upstream distance and legacy leftovers. `--only <selector>` runs exactly one. Each ran check is stamped into `.fusion-setup`, and `/fusion:setup` asks for it again only when the plugin version differs or the stamp is over 30 days old |
| `/fusion:migrate` | `skills/migrate/SKILL.md` | Migrates a pre-v4 type-folder workbench to the v4.0.0 Circle-container layout: moves the old root type-folders wholesale into `shared/` (unknown origin → `shared/`) and stands up the `circles/` scaffold. Idempotent |
| `/fusion:help` | `skills/help/SKILL.md` | Explains what fusion is, daily use, install/update/configure paths, and where deeper docs live |
| `/fusion:commit` | `skills/commit/SKILL.md` | Stages, generates a conventional-commit message from the diff, asks the user to confirm, then commits |
| `/fusion:archive` | `skills/archive/SKILL.md` | Archives completed/aged workbench files into `fusion-workbench/archive/<YYMMDD-HHMM>-<slug>/`. Surveys, proposes, and asks before it moves anything |
| `/fusion:log-activity` | `skills/log-activity/SKILL.md` | Scans project activity — git and the whole workbench tree — and generates/updates this checkout's activity log |
| `/fusion:memo` | `skills/memo/SKILL.md` | Appends a memo to the user's personal memo log or a task to the task list, both in `fusion-workbench/shared/memos/`; or files an idea as a new backlog entry in `fusion-workbench/shared/backlog/` |
| `/fusion:cadence` | `skills/cadence/SKILL.md` | Digests the session histories, the activity log, and git into three ranked topic lists — since yesterday, last 7 days, and recurring themes by churn — written to `fusion-workbench/shared/memos/cadence-<checkout>.md` (overwritten each run) |
| `/fusion:cleanup` | `skills/cleanup/SKILL.md` | Session wrap-up, and nothing but: commits the work in meaningful splits under the commit lock, then pushes. Dispatches no agent and runs no other pass — the five passes it used to carry are the commands below, each invoked by name |
| `/fusion:reconcile` | `skills/reconcile/SKILL.md` | Dispatches `reconciler` once against ground truth, reports what it changed and the three-edge Coherence verdict it returned, and advances this checkout's reconcile mark. Holds no gate, writes no record, commits nothing |
| `/fusion:direct` | `skills/direct/SKILL.md` | Drafts a Directive as an anticipated (`_a_`) Circle — `shaper` refines a one-line draft via clarifying questions and writes the Circle record without starting a Turn loop |
| `/fusion:news` | `skills/news/SKILL.md` | Shows what other checkouts left for this one: fetches, reads the new entries of the shared message store out of the fetched ref without touching the working tree, renders each with its writer resolved to a name, advances the read mark on render, then offers a `git pull --ff-only` once. Reads a store and holds no thread — there is nothing to reply to here. The mechanism is `bin/fusion-forum`'s own header |
| `/fusion:curate` | `skills/curate/SKILL.md` | The one path to `CLAUDE.md`. Reconciles the three normative surfaces — decision records, the project's own `./rules/` and `.claude/rules/` files, and `CLAUDE.md` — against the project's recorded history. Dispatches `curator` to survey, holds the change-ledger gate, dispatches it again to apply only what was approved. Writes nothing itself |
| `/fusion:post` | `skills/post/SKILL.md` | Composes one short note for whoever pulls this work next — the commit range and the records this session filed — and writes it into the shared message store. Writes exactly one file, commits nothing, holds no thread. The read side is `/fusion:news` on the other checkout |

Slash commands are independent of sub-agent routing — invoke them from the parent session when you need to set up, wrap up, or commit.

## Where the work persists

Every agent writes to `fusion-workbench/` and never to its own scratchpad — a sub-agent's context window does not survive the parent session, and even within a session the agents share no memory with each other.

Since v4.0.0 the workbench is **Circle-as-container**: a Circle is a directory holding everything one unit of work produces, and work with no Circle affiliation lives in `shared/`. Agents do not hard-code these paths — they resolve their write and scan targets through `bin/fusion-paths <name>` at Setup (alongside `bin/fusion-rules`) and where an artifact lands follows the Origin Rule (it belongs to the Circle whose Directive caused it; with no active Circle it goes to `shared/`).

```
fusion-workbench/
├── circles/<stamp>-<slug>/     # one directory per unit of work; _t_circle.md carries the marker (all states glob as *_circle.md)
│   ├── planning/  issues/  decisions/  history/  analyses/
│   └── reviews/                # reviewer output (sender in filename)
├── shared/                     # everything with no Circle affiliation
│   ├── planning/  issues/  decisions/  history/  reviews/  analyses/
│   ├── investigations/         # write-frozen since the investigator fold — shared-only
│   ├── consult/                # consultant reports — shared-only
│   ├── memos/                  # personal memo logs — shared-only
│   └── backlog/                # ideas not yet units of work — shared-only
└── portfolio.md                # legacy portfolio brief; nothing writes it since v11
```

The layout, the Origin Rule, the operative half of the `bin/fusion-paths` resolution contract, the issue/planning and decision state markers, marker globs, and inline progress tracking are all defined once in `fusion-workbench-conventions.md` (auto-loaded from the plugin's `rules/` directory). Its header table names the five topics that have their own authoring homes next door — the resolver's key table (`workbench-path-resolution.md`), the Circle state vocabulary and record templates (`circle-records.md`), rule-file provenance (`rule-file-provenance.md`), the commit lock (`commit-lock.md`), and which workbench entries a tracked workbench tracks (`workbench-tracking.md`) — each emitted only to the agents that apply it, which for three of them (`workbench-path-resolution.md`, `rule-file-provenance.md`, `workbench-tracking.md`) means no agent at all: those are reached by citation rather than by emission. Every agent confirms the rule is in context during Setup so the conventions are uniform.

## Invariants

- **No agent modifies its own definition file.** Updates to `agents/*.md` are made by the user or via a normal code change — never by the agent itself.
- **No agent edits files outside its declared scope.** Cross-layer findings flow through the `issues/` store (in the active Circle or `shared/`), not direct edits. Scope is enforced by prose in each agent prompt.
- **Only the orchestrator dispatches other agents.** All other agents are leaf nodes — they do their work and return. The orchestrator is the sole coordinator. It never recurses (no self-invocation), and it never invokes `consultant` (user-initiated only).
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
