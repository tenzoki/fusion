# fusion

AI agent orchestration framework for Claude Code. Provides 16 specialized agents with a compliance guard, churn detection, and real-time browser-based monitoring.

## What's Inside

```
fusion/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── agents/                   # 16 specialized agents
│   ├── orchestrator.md       # Multi-task session coordinator (default agent)
│   ├── playmaker.md          # Circle portfolio management — ranks anticipated Circles
│   ├── shaper.md             # Requirements engineering — vague → precise Directive
│   ├── planner.md            # Implementation planning — spec → step-by-step plan
│   ├── taskplanner.md        # Work queue builder — plans + issues → ordered tasklist
│   ├── coder.md              # Application code executor — Go, TS, Python, tests
│   ├── ontocoder.md          # Structured data executor — YAML, JSON, ontology
│   ├── coderev.md            # Code reviewer — findings + issue filing
│   ├── ontorev.md            # Ontology reviewer — findings + issue filing
│   ├── conceptrev.md         # Design-diagram evaluator — advisory coherence verdict
│   ├── bugfixer.md           # Diagnostic repair — one bug, one fix, verified
│   ├── reconciler.md         # Ground-truth reconciliation of tracking files
│   ├── investigator.md       # Forensic analysis of captured runs
│   ├── analyst.md            # Document study and problem analysis
│   ├── consultant.md         # On-demand expert consultation
│   └── editor.md             # Produce-only Redakteur — deliverables, decks, translation
├── skills/                   # Slash commands
│   ├── archive/SKILL.md      # /fusion:archive — archive completed/aged workbench files
│   ├── circle-pop/SKILL.md   # /fusion:circle-pop — restore a stashed Circle, with drift detection
│   ├── circle-stash/SKILL.md # /fusion:circle-stash — freeze the active Circle's complete state
│   ├── cleanup/SKILL.md      # /fusion:cleanup — autonomous session wrap-up (issues, commit+push, reconcile, archive, revise, log)
│   ├── commit/SKILL.md       # /fusion:commit — AI-generated conventional commit
│   ├── direct/SKILL.md       # /fusion:direct — draft a Directive into an anticipated Circle (shaper)
│   ├── help/SKILL.md         # /fusion:help — explain fusion's daily use, install, configure
│   ├── log-activity/SKILL.md # /fusion:log-activity — generate/update activity log
│   ├── memo/SKILL.md         # /fusion:memo — append a memo (or a task to tasks-<user>.md)
│   ├── migrate/SKILL.md      # /fusion:migrate — migrate a pre-v4 type-folder workbench to the Circle-container layout
│   ├── next/SKILL.md         # /fusion:next — portfolio briefing
│   ├── revise-claude-md/SKILL.md # /fusion:revise-claude-md — update project memory
│   ├── setup/SKILL.md        # /fusion:setup — bootstrap workbench + load rules
│   └── unlock/SKILL.md       # /fusion:unlock — write permissive .claude/settings.local.json
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
├── rules/                    # Framework rules auto-loaded into every agent
│   ├── fusion-workbench-conventions.md
│   ├── decision-record-examples.md
│   └── user-facing-output.md
├── stilwerk/                 # Stylometric voice profiles (copied into the workbench at setup)
│   ├── default-voice-{en,de}.yaml  # long-form writing profile (prose agents)
│   └── chat-voice-{en,de}.yaml     # short-form chat profile (every agent)
├── templates/                # Starter files projects copy into their own ./rules/
│   └── investigator-capture-layout.md
├── docs/                     # Conceptual docs (also pointed at by skills)
│   └── philosophy.md
├── bin/
│   ├── monitor               # Real-time browser-based monitoring dashboard
│   ├── fusion-rules          # Per-agent rule discovery helper (plugin + project)
│   ├── fusion-paths          # Per-consumer workbench path resolver (Circle vs shared/)
│   ├── fusion-workbench-root # Walks up from pwd to find fusion-workbench/.fusion-setup
│   ├── fusion-session-mark   # Tracks active orchestrator session via .session-marker
│   └── fusion-commit-lock    # Cross-agent commit serialization lock
├── install.sh                # HTTPS curl|bash installer (writes ~/.fusion + the fusion launcher)
├── settings.json             # Plugin defaults, agent, and auto-allowed permissions
├── README-agents.md          # Agent architecture overview
├── README-hooks.md           # Guard system documentation
└── README.md                 # This file
```

## Installation

### Recommended — HTTPS installer (no git, no SSH, no marketplace cache)

```bash
curl -fsSL https://raw.githubusercontent.com/tenzoki/fusion/main/install.sh | bash
```

This downloads fusion over plain HTTPS into `~/.fusion` and installs a `fusion`
launcher that loads the plugin straight from that folder. It avoids the three
ways the marketplace path breaks for end users: it never clones over git (so a
git-on-SSH setup or a missing SSH key can't stop it), it doesn't rely on Claude
Code's plugin cache (which isn't reliably replaced on update/uninstall), and
uninstall is a plain `rm -rf`.

```bash
fusion              # start an orchestrator session (loads ~/.fusion via --plugin-dir)
fusion --update     # re-download the latest over HTTPS, overwrite ~/.fusion
fusion --uninstall  # remove ~/.fusion and the launcher
fusion --where      # print the install dir
```

Overrides: `FUSION_REF` (git ref, e.g. `FUSION_REF=tags/v3.20.0` to pin a
release), `FUSION_HOME` (install dir, default `~/.fusion`), `FUSION_BIN`
(launcher dir, default `~/.local/bin`).

### Alternative — Claude Code marketplace

```bash
# Via the tenzoki marketplace
/plugin marketplace add tenzoki/claude-plugins
/plugin install fusion@tenzoki-plugins

# Or directly from GitHub
/plugin install tenzoki/fusion

# Or from a local directory
/plugin install ./
```

## Where fusion installs

The HTTPS installer is self-contained and git-free:

- **Plugin files** → `~/.fusion/` (override with `FUSION_HOME`). Contains the full
  plugin: `.claude-plugin/plugin.json`, `agents/`, `skills/`, `rules/`, `hooks/`
  (including the pre-compiled `hooks/dist/*.js` guard), `bin/`, `stilwerk/`,
  `templates/`, `docs/`. No `node_modules` — the compiled hooks are self-contained.
- **Launcher** → `~/.local/bin/fusion` (override with `FUSION_BIN`). A one-line
  wrapper: `exec claude --plugin-dir "$HOME/.fusion" --agent fusion:orchestrator "$@"`.

`--update` re-runs the installer (fresh HTTPS download, overwrites `~/.fusion`).
`--uninstall` removes both the install dir and the launcher. Because the plugin
loads via `--plugin-dir`, there is no Claude Code cache entry to go stale.

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

- **Capture work ahead of time** with `/fusion:direct <one-line draft>`. The skill dispatches the `shaper` agent in anticipated-circle mode; shaper clarifies the draft with you and writes a new `_a_` (anticipated) Circle file.
- **Decide what to work on next** with `/fusion:next`. The skill dispatches `playmaker`, which ranks the anticipated Circles by a domain-biased heuristic (see `agents/playmaker.md`), warns about dependency cycles, and proposes one to activate. You confirm the proposal or pick a different Circle.
- **Run the active Circle** in the orchestrator until the per-Circle Coherence verdict closes it as `_c_` (closed-coherent) or `_b_` (Bounded Closure — the Directive is judged unreachable and what was learned is the Artifact).
- **Pick the next one** with `/fusion:next` again.

### When to use which

| You have... | Use |
|---|---|
| One clear task to execute now; obvious priority | Mode A (direct) |
| Multiple anticipated units of work and you want explicit ranking | Mode B (portfolio) |
| A small project where "what's next" is self-evident | Mode A |
| A project large enough that dependency tracking and cycle detection are worth the overhead | Mode B |
| A queue thick enough that you want a visible roadmap in `portfolio.md` | Mode B |

**Mixed use is fine.** Most projects start in Mode A, accumulate `_a_` Circle files over time as future work is captured via `/fusion:direct`, and shift toward Mode B once the queue is thick enough to deserve ranking. The two modes share the same workbench, the same agents, and the same conceptual model — only the surface for choosing the next Directive differs.

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

## fusion — the launcher

The HTTPS installer writes a `fusion` launcher (to `~/.local/bin`). It runs Claude Code with the plugin loaded from `~/.fusion` and a chosen agent:

```bash
fusion                   # --agent fusion:orchestrator (default)
fusion coder             # --agent fusion:coder
fusion consultant        # --agent fusion:consultant
fusion fusion:planner    # already-namespaced names pass through
fusion --yolo            # add --dangerously-skip-permissions (no approval prompts)
fusion --yolo coder      # same, for a specific agent
fusion coder -p "..."    # extra args after the agent go straight to claude
fusion --help            # full usage
```

Bare agent names are auto-prefixed with `fusion:`. `--yolo` is opt-in per run — it clears the "approve every tool call" prompt storm. For a permanent setup that doesn't bypass approval, see `/fusion:unlock` instead — it writes a permissive `.claude/settings.local.json` that survives across sessions.

If you installed via the Claude Code marketplace instead of the HTTPS installer, there is no `fusion` launcher; start an agent directly with `claude --agent fusion:orchestrator` (the plugin must be enabled in the project).

## fusion-workbench

The plugin uses `fusion-workbench/` at the project root as the shared workspace for all agents. Since v4.0.0 the layout is **Circle-as-container**: a Circle is a directory holding everything one unit of work produces; work with no Circle affiliation lives in `shared/`; session and hook state stays at the root.

```
fusion-workbench/
├── circles/
│   └── <stamp>-<slug>/     # one directory per unit of work (stable name, NO marker)
│       ├── _t_circle.md   #   the Circle record — carries the state marker
│       ├── planning/       #   spec + plan of THIS unit of work
│       ├── issues/         #   defects that arose from this Circle's Directive
│       ├── decisions/      #   decision records raised inside this Circle
│       ├── history/        #   session logs
│       ├── reviews/        #   codereview + ontoreview + conceptreview, merged (sender in filename)
│       └── analyses/       #   analyst output
├── shared/                 # everything with no Circle affiliation (same kinds, plus three of its own)
│   ├── planning/  issues/  decisions/  history/  reviews/  analyses/
│   ├── investigations/     #   shared-only — an investigation never originates in a Circle
│   ├── consult/            #   shared-only — a consultation never originates in a Circle
│   └── memos/              #   shared-only — one file per OS user (created on demand by /fusion:memo)
├── portfolio.md            # playmaker output
├── tasklist.md             # taskplanner work queue
├── .active-circle          # pointer holding the active Circle's directory name
└── (root-anchored session/hook state: agentstate.yaml, orchestrator-live.md,
     orchestrator-events.jsonl, .guard-state/, .commit-lock/, .session-marker, monitor)
```

**Where an artifact goes is the Origin Rule:** it belongs to the Circle whose Directive caused it to exist; with no active Circle it goes to `shared/`; cross-cutting relevance is cited, not placed. Agents never hard-code these paths — they resolve write/scan targets through `bin/fusion-paths <name>` at Setup and cite `rules/fusion-workbench-conventions.md`, which is the single home for the full layout and the resolution contract.

**Human-retrospection skills.** The workbench is a durable record, not just an agent-coordination substrate. Two skills surface it for the user directly: `/fusion:memo` appends short personal notes ("don't forget X") to `fusion-workbench/shared/memos/memos-<username>.md`; `/fusion:log-activity` scans git commits and the workbench and writes a per-day activity log at the project root (`activity-log-<username>.md`) — useful for the "what did I actually do in the last four weeks?" question. See `docs/philosophy.md` §2 for the conceptual treatment.

**State markers — issues/ and planning/:** `_o_` open, `_p_` in progress, `_c_` closed, `_d_` deferred.

**State markers — decisions/:** `_o_` open question, `_a_` answered (recorded answer exists), `_i_` implemented (answer realised in code/data), `_d_` deferred, `_s_` superseded by a later decision.

**State markers — circles/:** `_a_` anticipated, `_t_` active/in-Turn, `_c_` closed-coherent, `_b_` Bounded Closure, `_s_` superseded, `_d_` deferred. See `rules/fusion-workbench-conventions.md` for transitions.

The defect/decision distinction: file in `issues/` if the resolution is "go fix it"; file in `decisions/` if the resolution is "decide and record." See `rules/fusion-workbench-conventions.md` for the full convention and decision-record template.

`/fusion:setup` creates these directories (and writes the `.fusion-setup` marker that all agents and hooks look for). Without setup, agents halt with "no fusion workbench found" and hooks no-op silently — this is intentional, so a Claude session whose cwd happens to land in any non-fusion directory does not spawn a stray workbench. Writes to `fusion-workbench/` are auto-allowed via `settings.json` so the orchestrator's dashboard updates, event logging, and history writes don't prompt the user.

## Project-Specific Configuration

After installing the plugin, configure for your project:

1. Edit `hooks/config.json` to set your protected paths, decision categories, and thresholds
2. Edit rules in `rules/` to match your project's coding and architecture standards
3. Run `/fusion:setup` once at the project root — this creates `fusion-workbench/` (including `.guard-state/`) and writes the `.fusion-setup` marker. All subsequent agents and hooks locate the workbench by walking up from `pwd` to find that marker.
