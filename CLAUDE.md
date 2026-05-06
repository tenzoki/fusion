# CLAUDE.md — fusion plugin source

This repository is the **source of the fusion Claude Code plugin** (`tenzoki-plugins/fusion`). It is *not* a fusion-consuming project. The plugin self-disables here: `hooks/guard.ts` detects when cwd has `.claude-plugin/plugin.json` matching the plugin's own name and stands down.

## What this is

Plugin published to the `tenzoki-plugins` marketplace (repo: `tenzoki/claude-plugins`). Provides:

- 13 specialized agents — orchestrator (top-level dispatcher) plus coder, ontocoder, coderev, ontorev, planner, shaper, taskplanner, reconciler, analyst, investigator, bugfixer, consultant. Three (`reconciler`, `taskplanner`, `planner`) are parameterised by domain (`code | data | strategic | knowledge`) since v1.11.0.
- Compliance guard with churn/escalation tracking (TypeScript hooks, compiled to `hooks/dist/`)
- Real-time HTML monitor dashboard (`bin/monitor`)
- Pattern-based rule discovery helper (`bin/fusion-rules`)
- User-invocable skills: `/fusion:setup`, `/fusion:help`, `/fusion:upgrade`, `/fusion:memo`, `/fusion:commit`, `/fusion:log-activity`, `/fusion:revise-claude-md`, `/fusion:unlock`, `/fusion:archive`

## Layout

| Path | Purpose |
|---|---|
| `.claude-plugin/plugin.json` | Manifest. **Bump version on every change.** |
| `agents/*.md` | The 13 agent prompts. Frontmatter declares `tools:` allowlist. |
| `hooks/` | TypeScript source + compiled `dist/`. SessionStart, PreToolUse, PostToolUse hooks. Uses `process.cwd()` not `__dirname` for project-local state. |
| `bin/monitor` | HTML dashboard binary, served by the orchestrator from `fusion-workbench/monitor` (copied at Setup) |
| `bin/fusion-rules` | Per-agent rule discovery helper (used in every agent's Setup) |
| `bin/fu` | Project-local launcher copied to `./.fusion/fu` at Setup. Runs `claude --dangerously-skip-permissions --agent fusion:<name>`; bare arg defaults to `orchestrator` and is auto-namespaced. |
| `bin/fusion-workbench-root` | Walks up from `pwd` to find a directory containing `fusion-workbench/.fusion-setup`. Prints the absolute path or exits 1. The single source of truth for "is this project fusion-set-up, and where". Hooks call the TS equivalent (`hooks/lib/workbench-root.ts`); agents call this script. |
| `bin/fusion-session-mark` | Tracks the active orchestrator session via `fusion-workbench/.session-marker` (file mtime is the heartbeat). Subcommands: `check` / `write` / `heartbeat` / `clear`. Used by `/fusion:setup` Step 0d to warn the user when a second orchestrator is starting against the same project. Advisory only — fusion has no concurrency lock; the warning lets the user notice the collision and decide. |
| `rules/fusion-workbench-conventions.md` | Workbench layout, marker vocabularies, decision-record template. Auto-loaded into every agent. |
| `rules/decision-record-examples.md` | Worked examples of the decision-marker transitions ([o]→[a]→[i], [a]→[s], [o]→[d]). Optional; pattern-loaded by `bin/fusion-rules` for agents that need it. |
| `templates/` | Starter files for consuming projects to copy into their own `./rules/`. Currently: `investigator-capture-layout.md` (required by `investigator` to know where its evidence captures live and how to read them). |
| `docs/` | Conceptual docs that are useful both inside Claude Code (pointed at by skills) and as standalone reading. Currently: `philosophy.md` (the three load-bearing ideas + domain parameter, pointed at by `/fusion:help`). |
| `skills/<name>/SKILL.md` | User-invocable skill bodies |
| `README.md`, `README-agents.md`, `README-hooks.md` | User-facing docs |
| `fusion-workbench/` | **Runtime artifact, gitignored.** Created by the plugin's own hooks when Claude runs in this directory. Safe to delete. Layout: `planning/`, `issues/` (defects), `decisions/` (open questions, since v2.0), `history/`, `codereview/`, `ontoreview/`, `analyses/`, `investigations/`, `consult/`, `tasklist.md`. |

## Conventions

- **Agent dispatch** — always namespaced: `Agent(fusion:coder)`, `Agent(fusion:ontocoder)`, etc. Bare names don't resolve. Any agent with a `tools: Agent(...)` allowlist must list sub-agents in `<plugin>:<name>` form.
- **Domain / executors dispatch parameters (v1.11.0+)** — three agents accept run-time parameters passed via the dispatch prompt as plain markdown lines:
  - `taskplanner` and `reconciler` accept `**Domain:** <code|data|strategic|knowledge>` — the orchestrator detects domain at Setup Step 5 and passes it; agents default to `code` if absent.
  - `planner` accepts `**Executors:** coder, ontocoder, analyst` — pass for `strategic`/`knowledge` so plan steps can route to `analyst`. Defaults to `[coder, ontocoder]`.
  Any caller dispatching these agents from outside the orchestrator should prefix the dispatch prompt with the appropriate parameter line.
- **Rules loading** — agents call `"$FUSION_PLUGIN_ROOT/bin/fusion-rules" <agent-name>` and read every emitted path. Plugin files are NOT auto-loaded into agent context; this helper is the only correct discovery path. `$FUSION_PLUGIN_ROOT` is exported by `hooks/hooks.json` SessionStart. The helper searches three roots (in this order): the plugin's `rules/`, the project's `./rules/` (fusion-agent-specific rules — capture layouts, taskplanner priority overrides, anything no other Claude session would care about), and the project's `.claude/rules/` (project-wide rules every Claude session should respect — coding/ontology/normative guidelines). Filename patterns per agent are unchanged.
- **Critical procedures** — model as user-invocable skills (e.g. `/fusion:setup`), never as "MUST" directives in agent prompts. A skill body becomes the user prompt; that's the only reliable enforcement.
- **Workbench writes** — agents write only to `fusion-workbench/`. Sub-agents share no memory; everything persists through workbench files.
- **Workbench bootstrap is exclusive to `/fusion:setup`** — since v2.5.0, **only** the setup skill creates a workbench. Setup writes `fusion-workbench/.fusion-setup` (a JSON marker with timestamp + plugin version). Every agent and hook locates the workbench by walking up from `pwd` looking for that marker (`bin/fusion-workbench-root` for agents, `hooks/lib/workbench-root.ts` for hooks). If no marker is found: agents halt with "run /fusion:setup", hooks no-op silently. This prevents stray workbench creation when a Claude session's cwd happens to be in any non-fusion directory.
- **Single orchestrator per project** (advisory) — fusion has no concurrency lock. Two orchestrators running against the same project simultaneously can corrupt `agentstate.yaml` (interrupted-session resume becomes unreliable), double-dispatch tasks from the same `tasklist.md`, race on `.guard-state/{churn,cross-file,escalation}.json` counters, and produce interleaved commit history. The most damaging mode is two parallel sessions each completing half of the same task with overlapping edits. Mitigation since v2.8.0: `/fusion:setup` Step 0d checks for an active-session marker (`fusion-workbench/.session-marker` whose mtime is refreshed at each orchestrator cycle) and **warns** the user when one is detected — `running` if heartbeat ≤ 10 min ago, `stale` if older. The warning is advisory; the user can still proceed but takes responsibility for sequencing.
- **Issues vs decisions (v2.0+)** — defects ("go fix it") in `fusion-workbench/issues/` with markers `[o]/[p]/[c]/[d]`; decisions / open questions ("decide and record") in `fusion-workbench/decisions/` with the richer `[o]/[a]/[i]/[d]/[s]` vocabulary. See `rules/fusion-workbench-conventions.md` for the decision rule and the decision-record template.
- **SessionStart hook output** — `systemMessage` JSON for user-visible banners; plain stdout is `additionalContext` for the model only.
- **`.gitignore`** — for shipped binaries inside excluded dirs use `dir/*` (file pattern) so `!path` exceptions work for new files. `dir/` (trailing slash) blocks all re-inclusion of files added later.

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
