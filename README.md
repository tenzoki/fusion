# fusion

AI agent orchestration framework for Claude Code. Provides 14 specialized agents with a compliance guard, churn detection, and real-time browser-based monitoring.

## What's Inside

```
fusion/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── agents/                   # 14 specialized agents
│   ├── orchestrator.md       # Multi-task session coordinator (default agent)
│   ├── playmaker.md          # Circle portfolio management — ranks anticipated Circles
│   ├── shaper.md             # Requirements engineering — vague → precise Directive
│   ├── planner.md            # Implementation planning — spec → step-by-step plan
│   ├── taskplanner.md        # Work queue builder — plans + issues → ordered tasklist
│   ├── coder.md              # Application code executor — Go, TS, Python, tests
│   ├── ontocoder.md          # Structured data executor — YAML, JSON, ontology
│   ├── coderev.md            # Code reviewer — findings + issue filing
│   ├── ontorev.md            # Ontology reviewer — findings + issue filing
│   ├── bugfixer.md           # Diagnostic repair — one bug, one fix, verified
│   ├── reconciler.md         # Ground-truth reconciliation of tracking files
│   ├── investigator.md       # Forensic analysis of captured runs
│   ├── analyst.md            # Document study and problem analysis
│   └── consultant.md         # On-demand expert consultation
├── skills/                   # Slash commands
│   ├── archive/SKILL.md      # /fusion:archive — archive completed/aged workbench files
│   ├── commit/SKILL.md       # /fusion:commit — AI-generated conventional commit
│   ├── direct/SKILL.md       # /fusion:direct — draft a Directive into an anticipated Circle (shaper)
│   ├── help/SKILL.md         # /fusion:help — explain fusion's daily use, install, configure
│   ├── log-activity/SKILL.md # /fusion:log-activity — generate/update activity log
│   ├── memo/SKILL.md         # /fusion:memo — append a memo to the personal memo log
│   ├── next/SKILL.md         # /fusion:next — portfolio briefing
│   ├── revise-claude-md/SKILL.md # /fusion:revise-claude-md — update project memory
│   ├── setup/SKILL.md        # /fusion:setup — bootstrap workbench + load rules
│   ├── unlock/SKILL.md       # /fusion:unlock — write permissive .claude/settings.local.json
│   └── upgrade/SKILL.md      # /fusion:upgrade — refresh the local marketplace clone
├── hooks/                    # Compliance guard system
│   ├── hooks.json            # Hook wiring: SessionStart + PreToolUse + PostToolUse
│   ├── guard.ts              # PreToolUse — blocks writes to protected paths
│   ├── tracker.ts            # PostToolUse — churn detection + event logging
│   ├── clear-halt.ts         # Manual halt reset utility
│   ├── config.json           # Guard rules, decisions, thresholds
│   ├── config.example.json   # Example config with project-specific decisions
│   ├── lib/                  # Shared libraries
│   │   ├── paths.ts          # Glob-to-regex pattern matching
│   │   ├── config.ts         # JSON configuration loader
│   │   ├── escalation.ts     # Escalation state machine (block → halt)
│   │   ├── events.ts         # JSONL event logger
│   │   ├── churn.ts          # Per-file churn heatmap tracker
│   │   ├── cross-file.ts     # Cross-file ping-back / circular edit detector
│   │   ├── workbench-root.ts # Walks up from cwd to find fusion-workbench/.fusion-setup
│   │   └── self-detect.ts    # Detects when cwd is the fusion plugin's own repo (guard stand-down)
│   ├── dist/                 # Compiled JS (committed, used at runtime)
│   ├── lib/__tests__/        # 30 tests
│   ├── package.json          # TypeScript dependencies
│   └── tsconfig.json         # TypeScript config
├── rules/                    # Framework rule shipped by the plugin
│   └── fusion-workbench-conventions.md
├── templates/                # Starter files projects copy into their own ./rules/
│   └── investigator-capture-layout.md
├── docs/                     # Conceptual docs (also pointed at by skills)
│   └── philosophy.md
├── bin/
│   ├── monitor               # Real-time browser-based monitoring dashboard
│   ├── fusion-rules          # Per-agent rule discovery helper (plugin + project)
│   ├── fusion-workbench-root # Walks up from pwd to find fusion-workbench/.fusion-setup
│   ├── fusion-session-mark   # Tracks active orchestrator session via .session-marker
│   └── fu                    # Project-local launcher: claude --dangerously-skip-permissions --agent fusion:<name>
├── settings.json             # Plugin defaults, agent, and auto-allowed permissions
├── README-agents.md          # Agent architecture overview
├── README-hooks.md           # Guard system documentation
└── README.md                 # This file
```

## Installation

```bash
# Via the tenzoki marketplace
/plugin marketplace add tenzoki/claude-plugins
/plugin install fusion@tenzoki-plugins

# Or directly from GitHub
/plugin install tenzoki/fusion

# Or from a local directory
/plugin install ./
```

## Requirements

- Claude Code v2.1.63 or higher (orchestrator uses the `Agent(...)` tool-restriction syntax introduced in 2.1.63; on older versions use fusion v1.9.3 or earlier)
- Node.js 18+ (for TypeScript hooks)
- Python 3 (for the monitor dashboard)

The hooks are pre-compiled to JavaScript in `hooks/dist/` — no `npm install` needed at runtime. Only `node` (18+) is required.

To rebuild after editing TypeScript sources:

```bash
cd hooks && npm install && npm run build
```

## Agent Architecture

The orchestrator is the top-level coordinator. It dispatches specialized agents across a sequence of **Turns** (the iteration unit) until the **Directive** (the user's stated outcome) converges or the session ends:

```
orchestrator
├── playmaker     → Circle portfolio brief (when /fusion:next is invoked)
├── shaper        → Directive document (when request is vague)
├── planner       → implementation plan (when Directive is ready)
├── taskplanner   → ordered work queue
├── coder         → code changes (Go, TS, Python)
├── ontocoder     → data changes (YAML, JSON, ontology)
├── coderev       → code review + issue filing
├── ontorev       → ontology review + issue filing
├── bugfixer      → self-healing on test failure
├── reconciler    → ground-truth pass at session end
├── analyst       → document study and problem analysis
└── consultant    → on-demand expert consultation
```

Each agent has strict scope boundaries — a reviewer never edits code, a coder never edits ontology, the orchestrator never implements directly.

Since v2.9.0, every Turn ends with a **Coherence Review** (a per-Turn gate that checks the Turn's output against the Directive) and the session as a whole is judged by a per-Circle three-edge verdict at the end. When a Turn's Coherence Review reveals the Directive is unreachable as written, the orchestrator opens a **Rebalance gate** offering four options: Revise Artifact, Revise Directive, Revise Grounding, or Accept Bounded Closure. See `docs/philosophy.md` §5 for the full model.

## Two ways to use fusion

Fusion supports two operational modes. Both share the same conceptual model — a session works on a Directive (your stated outcome) against a Grounding (the assumptions you bring in) to produce an Artifact (code, data, analysis), with Coherence between the three as the criterion for finishing. The difference is whether you track future work as files on disk. See `docs/philosophy.md` for the conceptual treatment; this section is the operational guide.

### Mode A — Direct orchestrator

You give the orchestrator a scope at session start and it runs through to closure. No portfolio files are created; the `fusion-workbench/circles/` folder may be empty or absent.

- **What you say:** *"process all open work,"* *"execute plan 0511-track-c,"* *"fix this bug,"* or any one-line custom request.
- **What the orchestrator does:** runs Phase 0 (resolve scope) → Phase 1 (build work queue) → Phase 2 (Turn loop, with a Coherence Review at the end of each Turn) → Phase 3 (final reconciliation) → Phase 4 (report).
- **Supported Phase 0 modes:** `all`, `plan`, `bundle`, `issues`, `review`, `custom`. See `agents/orchestrator.md` Phase 0 for the trigger phrases.
- **What's on disk:** plans, issues, decisions, history, reviews — the normal `fusion-workbench/` artefacts described below. The work cycle is implicit in the session log, not reified as a Circle file.

### Mode B — Portfolio-managed (Circles)

You capture future units of work as files in `fusion-workbench/circles/` and let the `playmaker` agent rank them. Each file is one Directive captured ahead of execution, in one of six lifecycle states (anticipated, active, closed-coherent, bounded, superseded, deferred — see the marker table in `## fusion-workbench` below).

- **Capture work ahead of time** with `/fusion:direct <one-line draft>`. The skill dispatches the `shaper` agent in anticipated-circle mode; shaper clarifies the draft with you and writes a new `[a]` (anticipated) Circle file.
- **Decide what to work on next** with `/fusion:next`. The skill dispatches `playmaker`, which ranks the anticipated Circles by a domain-biased heuristic (see `agents/playmaker.md`), warns about dependency cycles, and proposes one to activate. You confirm the proposal or pick a different Circle.
- **Run the active Circle** in the orchestrator until the per-Circle Coherence verdict closes it as `[c]` (closed-coherent) or `[b]` (Bounded Closure — the Directive is judged unreachable and what was learned is the Artifact).
- **Pick the next one** with `/fusion:next` again.

### When to use which

| You have... | Use |
|---|---|
| One clear task to execute now; obvious priority | Mode A (direct) |
| Multiple anticipated units of work and you want explicit ranking | Mode B (portfolio) |
| A small project where "what's next" is self-evident | Mode A |
| A project large enough that dependency tracking and cycle detection are worth the overhead | Mode B |
| A queue thick enough that you want a visible roadmap in `portfolio.md` | Mode B |

**Mixed use is fine.** Most projects start in Mode A, accumulate `[a]` Circle files over time as future work is captured via `/fusion:direct`, and shift toward Mode B once the queue is thick enough to deserve ranking. The two modes share the same workbench, the same agents, and the same conceptual model — only the surface for choosing the next Directive differs.

## Compliance Guard

The guard intercepts every file-writing tool call (Write, Edit, MultiEdit, NotebookEdit):

- **SessionStart**: Exports `$FUSION_PLUGIN_ROOT` to the shell environment so agents can locate plugin assets (e.g. the monitor binary).
- **PreToolUse** (`guard.ts`): Checks writes against protected paths and decision rules. Blocks disallowed writes with a reason citing the violated decision. Only high-sensitivity categories block; low/medium emit advisory events.
- **PostToolUse** (`tracker.ts`): Records file changes in a churn heatmap. Warns when a file is being modified too frequently (thrashing detection).

Escalation: Block → Halt (3 consecutive blocks trigger halt). Low/medium sensitivity writes are advisory-only.

Configuration: `hooks/config.json` — protected paths, category-to-path mappings, decisions, escalation thresholds, churn thresholds. See `hooks/config.example.json` for a project-specific example. Guard state is stored per-project in `fusion-workbench/.guard-state/`.

## Monitor

The orchestrator copies the monitor binary into `fusion-workbench/` on first run. Launch the dashboard from the project root:

```bash
./fusion-workbench/monitor "My Session" 8099
```

The monitor reads `fusion-workbench/orchestrator-live.md` and `orchestrator-events.jsonl`, serving a live-updating HTML dashboard on `http://localhost:<port>`.

Arguments:
- `name` (required) — session name, shown in browser tab title
- `port` (required) — HTTP port
- `-n <N>` — max event lines (default 100)
- `-i <sec>` — refresh interval (default 2)

## fu — project-local launcher

`/fusion:setup` copies a small bash launcher into `./.fusion/fu`. It runs Claude Code with `--dangerously-skip-permissions` and a fusion agent, so the typical "approve every tool call" prompt storm at session start goes away.

```bash
./.fusion/fu              # launches with --agent fusion:orchestrator
./.fusion/fu coder        # launches with --agent fusion:coder
./.fusion/fu fusion:planner   # already-namespaced names pass through
./.fusion/fu --help
```

Bare names are auto-prefixed with `fusion:`. For a permanent setup that doesn't bypass approval, see `/fusion:unlock` instead — it writes a permissive `.claude/settings.local.json` that survives across sessions.

## fusion-workbench

The plugin uses `fusion-workbench/` at the project root as the shared workspace for all agents:

```
fusion-workbench/
├── planning/      # Plans (with state markers)
├── issues/        # Defects filed by any agent
├── decisions/     # Open questions / decision records (richer marker vocabulary)
├── history/       # Session logs
├── codereview/    # Code review output
├── ontoreview/    # Ontology review output
├── investigations/ # Forensic analysis reports
├── analyses/      # Analyst output
├── consult/       # Consultation reports
├── circles/       # Circles — anticipated, active, closed, bounded, superseded, deferred (richer marker vocabulary)
├── memos/         # Personal memo logs, one file per OS user (created on demand by /fusion:memo)
├── bus/           # Workbench-mediated agent-to-agent messaging — file-based inbox per agent, see docs/philosophy.md or /fusion:help bus
└── tasklist.md    # Current work queue
```

**Human-retrospection skills.** The workbench is a durable record, not just an agent-coordination substrate. Two skills surface it for the user directly: `/fusion:memo` appends short personal notes ("don't forget X") to `fusion-workbench/memos/memos-<username>.md`; `/fusion:log-activity` scans git commits and every workbench subdirectory and writes a per-day activity log at the project root (`activity-log-<username>.md`) — useful for the "what did I actually do in the last four weeks?" question. See `docs/philosophy.md` §2 for the conceptual treatment.

**Bus protocol.** The `bus/` subdirectory is a workbench-mediated A2A messaging surface — file-based inboxes per agent, used when the user asks the orchestrator for a consultation, and by any agent that needs to leave a message for another. Opt-in: the tree is created at `/fusion:setup` but only carries traffic when an agent or skill actually files into it. See `/fusion:help bus` for the user-facing summary.

**State markers — issues/ and planning/:** `[o]` open, `[p]` in progress, `[c]` closed, `[d]` deferred.

**State markers — decisions/:** `[o]` open question, `[a]` answered (recorded answer exists), `[i]` implemented (answer realised in code/data), `[d]` deferred, `[s]` superseded by a later decision.

**State markers — circles/:** `[a]` anticipated, `[t]` active/in-Turn, `[c]` closed-coherent, `[b]` Bounded Closure, `[s]` superseded, `[d]` deferred. See `rules/fusion-workbench-conventions.md` for transitions.

The defect/decision distinction: file in `issues/` if the resolution is "go fix it"; file in `decisions/` if the resolution is "decide and record." See `rules/fusion-workbench-conventions.md` for the full convention and decision-record template.

`/fusion:setup` creates these directories (and writes the `.fusion-setup` marker that all agents and hooks look for). Without setup, agents halt with "no fusion workbench found" and hooks no-op silently — this is intentional, so a Claude session whose cwd happens to land in any non-fusion directory does not spawn a stray workbench. Writes to `fusion-workbench/` are auto-allowed via `settings.json` so the orchestrator's dashboard updates, event logging, and history writes don't prompt the user.

## Project-Specific Configuration

After installing the plugin, configure for your project:

1. Edit `hooks/config.json` to set your protected paths, decision categories, and thresholds
2. Edit rules in `rules/` to match your project's coding and architecture standards
3. Run `/fusion:setup` once at the project root — this creates `fusion-workbench/` (including `.guard-state/`) and writes the `.fusion-setup` marker. All subsequent agents and hooks locate the workbench by walking up from `pwd` to find that marker.
