# fusion

A multi-agent orchestration framework for Claude Code. Fusion runs a work session as a team of **15 specialized agents** — an orchestrator that dispatches the rest, plus coders, reviewers, planners, and analysts — coordinating through files on disk, with a human at the decisions that matter and a hook layer that traces every write the agents make.

See [`docs/philosophy.md`](docs/philosophy.md) for why it's built this way, [`docs/working-model.md`](docs/working-model.md) for how a session runs (the Circle flow, the gates, and the guard), and [`README-agents.md`](README-agents.md) for the full agent reference.

## Install

### Recommended — HTTPS installer

No git, no SSH, no marketplace cache:

```bash
curl -fsSL https://raw.githubusercontent.com/tenzoki/fusion/main/install.sh | bash
```

This downloads fusion over plain HTTPS into `~/.fusion` and installs a `fusion` launcher that loads the plugin straight from that folder. It sidesteps the three ways the marketplace path breaks for end users: it never clones over git, it doesn't rely on Claude Code's plugin cache, and uninstall is a plain `rm -rf`.

```bash
fusion              # start an orchestrator session
fusion --update     # re-download the latest, overwrite ~/.fusion
fusion --uninstall  # remove ~/.fusion and the launcher
fusion --where      # print the install dir
```

Overrides: `FUSION_REF` (git ref, e.g. `FUSION_REF=tags/v10.3.0` to pin a release — every release since v5.5.0 is tagged), `FUSION_HOME` (install dir, default `~/.fusion`), `FUSION_BIN` (launcher dir, default `~/.local/bin`).

**Upgrading from v10.2?** v10.3 takes the `**Status:**` head field off the decision-record template as well, and adds one question at a Circle closure: the orchestrator reads the plan's `## Where this Circle stops` clauses back to you and asks whether each holds. Nothing is rewritten for you and there is nothing to migrate. `docs/upgrading-to-v10-3.md` is the note.

**Upgrading from v10.0 or v10.1?** v10.2 changes what a Circle record holds: the `**Status:**` head field leaves the template, and `## Directive` stops carrying prose once the Circle has a spec. Nothing is rewritten for you and no workbench file breaks. `docs/upgrading-to-v10-2.md` names the one case that needs a decision, and the v10.3 note above applies as well.

**Upgrading from v9?** v10 removes a file every consuming project has at its root: `fusion-guard.json` is no longer read, and `fusion.json` replaces it. A Turn budget left in the old file is silently not applied, so move it across before deleting anything. `docs/upgrading-to-v10.md` is the two-check migration.

**Upgrading from v8 or earlier?** v9 is a removal release: eight mechanisms, two agents and five skills left the plugin. Nothing breaks and no migration step is required, but a project set up under an older version may still hold configuration and workbench files that nothing reads any more. `docs/upgrading-to-v9.md` is the cleanup checklist, and `docs/upgrading-to-v10.md` above applies as well.

### Alternative — Claude Code marketplace

```bash
/plugin marketplace add tenzoki/claude-plugins
/plugin install fusion@tenzoki-plugins
```

The marketplace path has no `fusion` launcher; start an agent directly with `claude --agent fusion:orchestrator` (the plugin must be enabled in the project).

### The `fusion` launcher

The HTTPS installer writes `fusion` to `~/.local/bin`. It runs Claude Code with the plugin loaded and a chosen agent:

```bash
fusion                   # --agent fusion:orchestrator (default)
fusion coder             # --agent fusion:coder (bare names auto-prefixed)
fusion --yolo            # add --dangerously-skip-permissions (skip approval prompts)
fusion coder -p "..."    # extra args after the agent pass straight to claude
fusion --help            # full usage
```

### Requirements

- **Claude Code v2.1.63+** (the orchestrator uses the `Agent(...)` tool-restriction syntax introduced there; on older Claude Code, use fusion v1.9.3 or earlier).
- **Node.js 18+** for the TypeScript hooks. The hooks ship pre-compiled to `hooks/dist/` — no `npm install` needed at runtime, only `node`.
- **Python 3** for the monitor dashboard.

## Setup

Run once at the project root:

```bash
/fusion:setup
```

This creates `fusion-workbench/` (the shared workspace, including `.guard-state/`), copies in the monitor binary and the stylometric voice profiles, seeds `fusion.json` at the **project root** (your project's own fusion settings, git-tracked, so commit it), and writes a `.fusion-setup` marker. Every agent and hook locates the workbench by walking **up** from its working directory until it finds that marker — so agents run correctly from any subdirectory of the project.

Setup is the only thing that creates a workbench. Without it, agents halt with "no fusion workbench found" and hooks no-op silently — intentional, so a session whose working directory happens to land elsewhere never spawns a stray workbench.

## Your first session

Start the orchestrator and give it a task:

```bash
fusion                                   # or: claude --agent fusion:orchestrator
```

Then, in the chat, state what you want — for example *"implement the plan in planning, then review it"* or *"fix the failing test in the parser."* The orchestrator resolves the scope, builds a work queue, and runs a **Turn loop**: each Turn dispatches executor agents (coder, ontocoder) and then reviewers (coderev, ontorev), commits the work, and ends with a quick **Coherence check** — does the work still match the goal and the assumptions it was built on? If something is off, it opens a **Rebalance gate** and asks you how to proceed. At session end it runs a final reconciliation pass and reports.

You'll hit **gates** — points where the orchestrator stops and asks — before ontology changes, destructive operations, and ambiguous decisions. That's the design; answering them is how you steer.

Watch it live. In a second terminal at the project root:

```bash
./fusion-workbench/monitor "My Session" 8099
```

This serves a live HTML dashboard at `http://localhost:8099` (reading `orchestrator-live.md` and `orchestrator-events.jsonl`). Arguments: `name` and `port` are required; `-n <N>` sets max event lines (default 100), `-i <sec>` the refresh interval (default 2).

## Best practices

- **One Directive per session.** Give the orchestrator a single, clear outcome. If you find yourself describing three unrelated goals, that's three sessions — or capture the extras as Circles (below) and run them one at a time.
- **Let the gates do their job.** The human gates before ontology edits and destructive operations are where fusion earns its keep. Don't `--yolo` through them out of habit; `--yolo` is for a throwaway loop where nothing is at stake, not for real work on a shared tree.
- **Trust tracking files only after reconciliation.** Status markers in plans and issues can lag reality mid-session. Let Phase 3 (final reconciliation) run, or dispatch the `reconciler` explicitly, before you rely on what the tracking files claim.
- **Keep the working tree clean.** The orchestrator commits per task. Start a session from a clean tree so its commits are legible; don't mix hand-edits into a running session, or you'll blur which change came from where.
- **Direct mode vs. portfolio.** For one obvious task, just tell the orchestrator (direct mode). When you have several units of future work whose priority isn't obvious, capture them as Circles with `/fusion:direct` and let `/fusion:next` rank them. Small projects rarely need the portfolio; large ones benefit from the dependency and cycle detection.
- **Keep `CLAUDE.md` and `./rules/` current.** Agents load your project rules every session through `fusion-rules`. Stale rules mean stale behavior — treat them as living config, not documentation.
- **Say yes to Setup's permission question rather than reaching for `--yolo`.** `/fusion:setup` offers once to write a permissive `.claude/settings.local.json` for the project. It persists across sessions, it is a considered choice you made once, and it keeps the catastrophic-operation backstop that `--yolo` removes. `--yolo` is per-run, unconditional, and worth keeping for throwaway loops. Decline the question and the project simply keeps its per-tool approval prompts; Setup will offer again next run.
- **Nothing blocks your writes.** fusion's hook layer is observation-only: it allows every tool call, traces the write-tool ones into the event log the monitor renders, and tells you when your `fusion.json` is broken. It used to enforce — a protected-path deny, a decision-governed deny, and a halt after three blocks — and each was removed on its own measurement. See [Configuration](#configuration) for the one setting that is left, and [`README-hooks.md`](README-hooks.md) for what each check was and why it went.

## Configuration

- **Your project's settings** — one file, `fusion.json` at your project root, which `/fusion:setup` seeds from [`templates/fusion.json`](templates/fusion.json). It declares nothing and documents each key you can set in its own notes. **It configures exactly one thing today:** `orchestrator.maxTurns`, the Turn budget below. The merge is two layers, per leaf key — your file, then the built-in defaults in `hooks/lib/config.ts` — so a key you declare wins outright and a key you leave out falls straight through. It is git-tracked on purpose: how many Turns fusion may run against your project should show in a diff. Runtime state lives per-project in `fusion-workbench/.guard-state/` (gitignored). See [`README-hooks.md`](README-hooks.md) for what the hooks do with it.

### Settings

| Goal | Change |
|---|---|
| More (or fewer) Turns per session | `orchestrator.maxTurns`, declared as `{"orchestrator": {"maxTurns": <n>}}`. No hook reads it: `bin/fusion-turn-budget` resolves it once at the orchestrator's Setup. The default is defined in exactly one place, `DEFAULTS` in `hooks/lib/config.ts`. A value that is not a whole number of 1 or more is dropped, named in an advisory, and inherits as if absent |
| Stop the advisory naming `fusion-guard.json` | **Copy your Turn budget into `fusion.json` first**, then delete `fusion-guard.json`. That file is **retired**: fusion replaced it and no longer reads a byte of it, so a budget left in it is silently not applied. The advisory repeats on every guarded tool call until the file is gone. Full account in [`README-hooks.md`](README-hooks.md#per-project-configuration-fusionjson) |
| Turn the guard down | There is nothing to turn down. The hooks block nothing and decide nothing — see [`README-hooks.md`](README-hooks.md) for what each removed check was and the measurement that removed it |

- **Rules** — three layers, all discovered by `bin/fusion-rules` at each agent's Setup: the plugin's own `rules/` (framework ground truth, always loaded), the project's `./rules/` (fusion-agent-specific rules — capture layouts, priority overrides), and the project's `.claude/rules/` (project-wide rules every Claude session should respect — coding and ontology standards). Missing files are skipped silently; add what your project needs.
- **Language and voice** — set `**Language:** en` (or `de`) in your project `CLAUDE.md`. Setup copies four stylometric profiles into `fusion-workbench/stilwerk/`: `default-voice-{en,de}.yaml` (long-form writing, for prose agents) and `chat-voice-{en,de}.yaml` (short-form chat, for every agent). The `**Language:**` line selects the chat pair. A project whose written files use a different language than its chat adds an optional second line, `**Artifact language:** en` (or `de`), which then selects the writing pair — leave it out and one language governs everything, as before. Both lines are defined in `rules/fusion-workbench-conventions.md` `## Project language`.

## fusion-workbench

`fusion-workbench/` at the project root is the shared workspace for all agents. The layout is **Circle-as-container**: a Circle is a *directory* holding everything one unit of work produces; work with no Circle affiliation lives in `shared/`; session and hook state stays at the root.

```
fusion-workbench/
├── circles/
│   └── <stamp>-<slug>/      # one directory per unit of work (stable name, no marker)
│       ├── _t_circle.md     #   the Circle record — carries the state marker
│       ├── planning/  issues/  decisions/  history/  analyses/
│       └── reviews/          #   code + onto + concept reviews, merged (sender in filename)
├── shared/                   # everything with no Circle affiliation (same kinds, plus:)
│   ├── planning/  issues/  decisions/  history/  reviews/  analyses/
│   ├── investigations/  consult/  memos/  backlog/   # shared-only
├── portfolio.md             # playmaker output
├── .active-circle           # pointer to the active Circle's directory name
└── (root-anchored state: agentstate.yaml, orchestrator-live.md,
     orchestrator-events.jsonl, .guard-state/, .commit-lock/, monitor)
```

**The Origin Rule** decides where an artifact goes: it belongs to the Circle whose Directive caused it to exist; with no active Circle it goes to `shared/`; cross-cutting relevance is cited, not placed. Agents never hard-code these paths — they resolve write and scan targets through `bin/fusion-paths` at Setup.

**State markers** (encoded as `_x_` in filenames):

- **issues / planning:** `_o_` open · `_p_` in progress · `_c_` closed · `_d_` deferred
- **decisions:** `_o_` open question · `_a_` answered · `_i_` implemented · `_d_` deferred · `_s_` superseded
- **circles:** `_a_` anticipated · `_t_` active · `_c_` closed-coherent · `_b_` bounded closure · `_s_` superseded · `_d_` deferred

Rule of thumb: file in `issues/` when the resolution is "go fix it," in `decisions/` when it's "decide and record." The full layout and the issue, planning and decision marker transitions live in [`rules/fusion-workbench-conventions.md`](rules/fusion-workbench-conventions.md); the Circle state vocabulary and the Circle-record template live in [`rules/circle-records.md`](rules/circle-records.md).

Three surfaces open the workbench for you directly: `/fusion:memo` appends personal notes to `shared/memos/` and files ideas as entries in `shared/backlog/`, the activity-log step of `/fusion:cleanup` scans commits and the workbench into a per-day activity log at the project root, and `/fusion:cadence` reads that log together with the session histories and git to write a digest of what you have actually been working on — topics since yesterday, topics of the last seven days, and the themes that keep recurring ranked by how many sessions they show up in. The digest lands next to the memos as `cadence-<username>.md` and is overwritten on each run; it summarizes the activity log rather than replacing it, so run `/fusion:cleanup --only log-activity` first when you want the underlying record fresh.
