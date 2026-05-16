# CLAUDE.md — fusion plugin source

This repository is the **source of the fusion Claude Code plugin** (`tenzoki-plugins/fusion`). It is *not* a fusion-consuming project. The plugin self-disables here: `hooks/guard.ts` detects when cwd has `.claude-plugin/plugin.json` matching the plugin's own name and stands down.

## What this is

Plugin published to the `tenzoki-plugins` marketplace (repo: `tenzoki/claude-plugins`). Provides:

- 14 specialized agents — orchestrator (top-level dispatcher) plus coder, ontocoder, coderev, ontorev, planner, shaper, taskplanner, reconciler, analyst, investigator, bugfixer, consultant, playmaker. Three (`reconciler`, `taskplanner`, `planner`) are parameterised by domain (`code | data | strategic | knowledge`) since v1.11.0.
- Compliance guard with churn/escalation tracking (TypeScript hooks, compiled to `hooks/dist/`)
- Real-time HTML monitor dashboard (`bin/monitor`)
- Pattern-based rule discovery helper (`bin/fusion-rules`)
- User-invocable skills: `/fusion:setup`, `/fusion:help`, `/fusion:upgrade`, `/fusion:memo`, `/fusion:commit`, `/fusion:log-activity`, `/fusion:revise-claude-md`, `/fusion:unlock`, `/fusion:archive`, `/fusion:next`, `/fusion:direct`

## Layout

| Path | Purpose |
|---|---|
| `.claude-plugin/plugin.json` | Manifest. **Bump version on every change.** |
| `agents/*.md` | The 13 agent prompts. Only `orchestrator.md` declares a `tools:` allowlist (sub-agent dispatch + permitted tools); the other 12 inherit tools and model from the parent session. |
| `hooks/` | TypeScript source + compiled `dist/`. SessionStart, PreToolUse, PostToolUse hooks. Uses `process.cwd()` not `__dirname` for project-local state. |
| `bin/monitor` | HTML dashboard binary, served by the orchestrator from `fusion-workbench/monitor` (copied at Setup) |
| `bin/fusion-rules` | Per-agent rule discovery helper (used in every agent's Setup) |
| `bin/fu` | Project-local launcher copied to `./.fusion/fu` at Setup. Runs `claude --dangerously-skip-permissions --agent fusion:<name>`; bare arg defaults to `orchestrator` and is auto-namespaced. |
| `bin/fusion-workbench-root` | Walks up from `pwd` to find a directory containing `fusion-workbench/.fusion-setup`. Prints the absolute path or exits 1. The single source of truth for "is this project fusion-set-up, and where". Hooks call the TS equivalent (`hooks/lib/workbench-root.ts`); agents call this script. |
| `bin/fusion-session-mark` | Tracks the active orchestrator session via `fusion-workbench/.session-marker` (file mtime is the heartbeat). Subcommands: `check` / `write` / `heartbeat` / `clear`. Used by `/fusion:setup` Step 0d to warn the user when a second orchestrator is starting against the same project. Advisory only — fusion has no concurrency lock; the warning lets the user notice the collision and decide. |
| `bin/fusion-bus` | User-facing helper for the workbench A2A bus (Python). Subcommands: `list` (per-agent inbox counts) / `show <stem>` (read a message) / `mark-read <stem>` (move to `.processed/`). See `rules/fusion-workbench-conventions.md` `## Bus protocol`. |
| `bin/fusion-bus-session` | Session registry helper for the bus (shell). Subcommands: `register` / `heartbeat` / `clear`. Maintains `fusion-workbench/bus/.sessions/<session-id>.yaml` (where `<session-id>` is `YYMMDD-HHMM-<agent>-<hex>`) so filers can target the right inbox when multiple sessions are live. |
| `rules/fusion-workbench-conventions.md` | Workbench layout, marker vocabularies, decision-record template. Auto-loaded into every agent. |
| `rules/decision-record-examples.md` | Worked examples of the decision-marker transitions ([o]→[a]→[i], [a]→[s], [o]→[d]). Optional; pattern-loaded by `bin/fusion-rules` for agents that need it. |
| `templates/` | Starter files for consuming projects to copy into their own `./rules/`. Currently: `investigator-capture-layout.md` (required by `investigator` to know where its evidence captures live and how to read them). |
| `docs/` | Conceptual docs that are useful both inside Claude Code (pointed at by skills) and as standalone reading. Currently: `philosophy.md` (the three load-bearing ideas + domain parameter, pointed at by `/fusion:help`). |
| `skills/<name>/SKILL.md` | User-invocable skill bodies |
| `README.md`, `README-agents.md`, `README-hooks.md` | User-facing docs |
| `fusion-workbench/` | **Runtime artifact, gitignored.** Created by the plugin's own hooks when Claude runs in this directory. Safe to delete. Layout: `planning/`, `issues/` (defects), `decisions/` (open questions, since v2.0), `history/`, `codereview/`, `ontoreview/`, `analyses/`, `investigations/`, `consult/`, `circles/`, `bus/` (A2A messaging, since v3.4), `tasklist.md`. `.active-circle` is a one-line pointer file (single source of truth for the active `[t]` Circle; written by orchestrator on `[a]→[t]` after user confirmation of playmaker's proposal, cleared by orchestrator on `[t]→[c]/[b]`); see `rules/fusion-workbench-conventions.md`. |

## Conventions

- **Agent dispatch** — always namespaced: `Agent(fusion:coder)`, `Agent(fusion:ontocoder)`, etc. Bare names don't resolve. Any agent with a `tools: Agent(...)` allowlist must list sub-agents in `<plugin>:<name>` form.
- **Domain / executors dispatch parameters (v1.11.0+)** — three agents accept run-time parameters passed via the dispatch prompt as plain markdown lines:
  - `taskplanner` and `reconciler` accept `**Domain:** <code|data|strategic|knowledge>` — the orchestrator detects domain at Setup Step 5 and passes it; agents default to `code` if absent.
  - `planner` accepts `**Executors:** coder, ontocoder, analyst` — pass for `strategic`/`knowledge` so plan steps can route to `analyst`. Defaults to `[coder, ontocoder]`.
  Any caller dispatching these agents from outside the orchestrator should prefix the dispatch prompt with the appropriate parameter line.
- **Rules loading** — agents call `"$FUSION_PLUGIN_ROOT/bin/fusion-rules" <agent-name>` and read every emitted path. Plugin files are NOT auto-loaded into agent context; this helper is the only correct discovery path. `$FUSION_PLUGIN_ROOT` is exported by `hooks/hooks.json` SessionStart. The helper searches three roots (in this order): the plugin's `rules/`, the project's `./rules/` (fusion-agent-specific rules — capture layouts, taskplanner priority overrides, anything no other Claude session would care about), and the project's `.claude/rules/` (project-wide rules every Claude session should respect — coding/ontology/normative guidelines). Filename patterns per agent are unchanged.
- **User-facing output style** — every agent loads `rules/user-facing-output.md` (auto-emitted by `bin/fusion-rules` alongside `fusion-workbench-conventions.md` and `decision-record-examples.md`). It mandates action-first ordering, plain-English option labels, no undefined jargon, and trailing details/references blocks. Applies to status reports, gate prompts, AskUserQuestion text, session summaries — anything the user reads. Agent prompts' "Output Style" sections point at the rule and add only domain-specific bits.
- **Critical procedures** — model as user-invocable skills (e.g. `/fusion:setup`), never as "MUST" directives in agent prompts. A skill body becomes the user prompt; that's the only reliable enforcement.
- **Workbench writes** — agents write only to `fusion-workbench/`. Sub-agents share no memory; everything persists through workbench files.
- **Workbench bootstrap is exclusive to `/fusion:setup`** — since v2.5.0, **only** the setup skill creates a workbench. Setup writes `fusion-workbench/.fusion-setup` (a JSON marker with timestamp + plugin version). Every agent and hook locates the workbench by walking up from `pwd` looking for that marker (`bin/fusion-workbench-root` for agents, `hooks/lib/workbench-root.ts` for hooks). If no marker is found: agents halt with "run /fusion:setup", hooks no-op silently. This prevents stray workbench creation when a Claude session's cwd happens to be in any non-fusion directory.
- **Single orchestrator per project** (advisory) — fusion has no concurrency lock. Two orchestrators running against the same project simultaneously can corrupt `agentstate.yaml` (interrupted-session resume becomes unreliable), double-dispatch tasks from the same `tasklist.md`, race on `.guard-state/{churn,cross-file,escalation}.json` counters, and produce interleaved commit history. The most damaging mode is two parallel sessions each completing half of the same task with overlapping edits. Mitigation since v2.8.0: `/fusion:setup` Step 0d checks for an active-session marker (`fusion-workbench/.session-marker` whose mtime is refreshed at each orchestrator Turn) and **warns** the user when one is detected — `running` if heartbeat ≤ 10 min ago, `stale` if older. The warning is advisory; the user can still proceed but takes responsibility for sequencing.
- **Issues vs decisions (v2.0+)** — defects ("go fix it") in `fusion-workbench/issues/` with markers `[o]/[p]/[c]/[d]`; decisions / open questions ("decide and record") in `fusion-workbench/decisions/` with the richer `[o]/[a]/[i]/[d]/[s]` vocabulary. See `rules/fusion-workbench-conventions.md` for the decision rule and the decision-record template.
- **SessionStart hook output** — `systemMessage` JSON for user-visible banners; plain stdout is `additionalContext` for the model only.
- **`.gitignore`** — for shipped binaries inside excluded dirs use `dir/*` (file pattern) so `!path` exceptions work for new files. `dir/` (trailing slash) blocks all re-inclusion of files added later.
- **Circles (v3+ via Track C)** — projects may opt in to portfolio-level work tracking by populating `fusion-workbench/circles/`. Empty or absent `circles/` preserves single-Circle v2.9.0 behaviour. Playmaker is the dispatchable agent for portfolio ranking; `/fusion:next` is the user surface. See `rules/fusion-workbench-conventions.md` "State Markers — circles/" for the vocabulary.
- **Bus protocol (v3.4+)** — projects may opt in to workbench-mediated A2A messaging by populating `fusion-workbench/bus/`. Empty or absent `bus/` preserves pre-v3.4 single-terminal behaviour. The protocol is spec'd in `rules/fusion-workbench-conventions.md` `## Bus protocol`. Helper: `./.fusion/fusion-bus list|show|mark-read`. See `agents/orchestrator.md` Bus-filing pre-gate pattern for the four orchestrator gates that may file bus consultations.

## Release process

Two repos involved: the **plugin** (this repo, `tenzoki/fusion`) and the **marketplace** (`tenzoki/claude-plugins`). Both must be cloned locally; this CLAUDE.md assumes the marketplace clone is reachable (pass its path explicitly when running release commands).

Every release:

1. Bump `.claude-plugin/plugin.json` `version`
2. `git -C <marketplace> pull --rebase origin main` (it can drift if edited from elsewhere)
3. Bump fusion's `version` in `<marketplace>/.claude-plugin/marketplace.json`
4. Commit and push **both** repos
5. To pick up the new version locally:
   ```bash
   git -C ~/.claude/plugins/marketplaces/tenzoki-plugins pull origin main
   ```
   Then in Claude Code: `/plugin install fusion@tenzoki-plugins` and `/reload-plugins`.

The marketplace **clone** at `~/.claude/plugins/marketplaces/<name>/` is the source-of-truth `/plugin install` reads — not the GitHub remote. Without the manual `git pull` on that clone, version bumps don't propagate locally even after uninstall/reinstall.

## Testing during development

Use `claude --plugin-dir /path/to/this/repo` to load directly from disk — no install, no cache, no version bumping required. Reserve the marketplace flow for releases.

## Where to look when something breaks

| Symptom | Likely cause |
|---|---|
| `Agent type 'X' not found` / `denied by permission rule 'Agent(...)' from settings` | Agent dispatch with bare name, or `tools:` allowlist missing namespace prefix. Every dispatch must use `<plugin>:<name>` form. |
| Agent reports it can't find a rule file | Rule discovery not run, or the expected file is project-specific (only `fusion-workbench-conventions.md` and `decision-record-examples.md` ship with the plugin) — domain rules must live in `./rules/` or `.claude/rules/` of the consuming project. Problem 10. |
| Investigator halts at Setup with "no investigator rules found" | The project hasn't copied `templates/investigator-capture-layout.md` to `./rules/investigator-capture-layout.md` and filled it in. The investigator is fully project-agnostic since v2.1; it requires this rule to know where captures live. |
| Agent halts at Setup with "no fusion workbench found above pwd" | The project never ran `/fusion:setup`, or setup ran in a different directory. Run `/fusion:setup` at the project root once. The setup skill writes `fusion-workbench/.fusion-setup` which all subsequent agents and hooks look for. |
| Stray empty `fusion-workbench/.guard-state/` directories appearing in random folders | Pre-v2.5 behavior. Hooks bootstrapped the workbench from any `process.cwd()` they fired in. Fixed in v2.5: hooks no-op when no `.fusion-setup` marker is found upward. Safe to delete the stray directories. |
| All sub-agents fail to load after a fusion upgrade | Likely a frontmatter-syntax breakage. v2.8.1 added `disallowedTools: [Agent]` to 12 agents based on docs that turned out incorrect for our parser; agent loading broke entirely. Rolled back in v2.8.3. **Lesson:** changes to agent frontmatter beyond `name`/`description`/`tools` need empirical verification (run a sub-agent dispatch end-to-end) before release, not just docs-driven inference. |
| Orchestrator skipped Setup, dashboard never refreshed | "MUST run Setup" in agent prompt was overridden by user task urgency. The fix is `/fusion:setup`. Problem 11. |
| `/plugin install` keeps returning an old version | Marketplace cache clone at `~/.claude/plugins/marketplaces/` is stale; manual git pull required. Problem 12. |
| SessionStart banner not visible | Hook used plain stdout instead of `systemMessage` JSON. Problem 13. |
| Orchestrator skips the portfolio hint when `[a]` Circles exist | `/fusion:setup` not re-run since Track C landed (so `circles/` isn't pre-created) OR `.active-circle` corruption preventing the count snapshot |
| `/fusion:next` errors with "no Circles yet" but `circles/` has files | All Circle files have terminal markers (`[c]`, `[b]`, `[s]`, `[d]`) — `/fusion:next` short-circuits when no `[a]` or `[t]` exist. File a fresh `[a]` Circle via shaper or the user's own request to the orchestrator. |
| Orchestrator falls back to `Agent(general-purpose)` (denied) when trying to ask the user — at interrupted-session prompt, Coherence gate, Rebalance Grounding sub-flow, etc. | `AskUserQuestion` missing from `agents/orchestrator.md` `tools:` allowlist. Fixed in v3.0.1. The skill body (`/fusion:setup`) had `AskUserQuestion` in its `allowed-tools` so the skill path worked, but the orchestrator agent itself was denied — and sub-agents (shaper, planner) inheriting from the orchestrator would also have been denied if reached. **Lesson:** when adding `AskUserQuestion` references to the orchestrator prompt, also verify the frontmatter allowlist. The orchestrator is the only agent with an explicit `tools:` line; every tool sub-agents need has to be listed there. |
| Agent doesn't see bus messages | The workbench hasn't enabled the bus. **Primary fix:** rerun `/fusion:setup` — it creates the `bus/` tree (`.sessions/` plus per-agent `inbox/.processed/` for orchestrator, consultant, coderev, ontorev) and is idempotent; bus tree creation has been part of every setup since v3.4. **Manual fallback** if rerunning setup is undesired: `mkdir -p fusion-workbench/bus/.sessions fusion-workbench/bus/{orchestrator,consultant,coderev,ontorev}/inbox/.processed`. |
