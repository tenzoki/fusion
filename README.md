# fusion

AI agent orchestration framework for Claude Code. Provides 13 specialized agents with a compliance guard, churn detection, and real-time browser-based monitoring.

## What's Inside

```
fusion/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── agents/                   # 13 specialized agents
│   ├── orchestrator.md       # Multi-task session coordinator (default agent)
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
│   ├── help/SKILL.md         # /fusion:help — explain fusion's daily use, install, configure
│   ├── log-activity/SKILL.md # /fusion:log-activity — generate/update activity log
│   ├── memo/SKILL.md         # /fusion:memo — append a memo to the personal memo log
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
└── tasklist.md    # Current work queue
```

**State markers — issues/ and planning/:** `[o]` open, `[p]` in progress, `[c]` closed, `[d]` deferred.

**State markers — decisions/:** `[o]` open question, `[a]` answered (recorded answer exists), `[i]` implemented (answer realised in code/data), `[d]` deferred, `[s]` superseded by a later decision.

The defect/decision distinction: file in `issues/` if the resolution is "go fix it"; file in `decisions/` if the resolution is "decide and record." See `rules/fusion-workbench-conventions.md` for the full convention and decision-record template.

`/fusion:setup` creates these directories (and writes the `.fusion-setup` marker that all agents and hooks look for). Without setup, agents halt with "no fusion workbench found" and hooks no-op silently — this is intentional, so a Claude session whose cwd happens to land in any non-fusion directory does not spawn a stray workbench. Writes to `fusion-workbench/` are auto-allowed via `settings.json` so the orchestrator's dashboard updates, event logging, and history writes don't prompt the user.

## Project-Specific Configuration

After installing the plugin, configure for your project:

1. Edit `hooks/config.json` to set your protected paths, decision categories, and thresholds
2. Edit rules in `rules/` to match your project's coding and architecture standards
3. Run `/fusion:setup` once at the project root — this creates `fusion-workbench/` (including `.guard-state/`) and writes the `.fusion-setup` marker. All subsequent agents and hooks locate the workbench by walking up from `pwd` to find that marker.
