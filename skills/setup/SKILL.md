---
description: Run the mandatory orchestrator Setup procedure — workspace, dashboard, interrupted-session check, rules, history, event log
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Orchestrator Setup

The active agent MUST be `fusion:orchestrator`. This skill inlines the full Setup procedure so it cannot be skipped.

Execute every step below in order. Do not begin the user's task work until Setup is complete and any Step 1 decision has been resolved.

## CRITICAL — Setup is the ONLY place a workbench is created

Setup is the single point where a fusion workbench is bootstrapped. The workbench lands at `./fusion-workbench/` relative to the directory `pwd` reports when this skill runs. After setup completes, every subsequent fusion agent and hook locates the workbench by walking *upward* from its working directory until it finds the marker file `fusion-workbench/.fusion-setup` (written in Step 0 below). Without that marker, agents halt and hooks no-op — fusion does NOT bootstrap a workbench in any directory other than the one setup ran in.

This makes setup deliberately strict: run it once, at the project root you want fusion to govern. If you accidentally run setup in a subfolder, the result is two independent fusion projects — one at the subfolder and one at the parent (if it had setup before). Walk up to the intended root before running setup.

**Never** prepend `cd <something>` to the commands below. Run them exactly as written so the workbench lands at `./fusion-workbench/` relative to the directory the user invoked setup from.

## Step 0 — Confirm and create workspace

```bash
pwd
```

Note the path. The workbench will be created here. Then:

```bash
mkdir -p ./fusion-workbench/planning ./fusion-workbench/issues ./fusion-workbench/decisions ./fusion-workbench/history ./fusion-workbench/codereview ./fusion-workbench/ontoreview ./fusion-workbench/investigations ./fusion-workbench/analyses ./fusion-workbench/consult ./fusion-workbench/.guard-state ./fusion-workbench/circles
mkdir -p ./fusion-workbench/bus/.sessions ./fusion-workbench/bus/orchestrator/inbox/.processed ./fusion-workbench/bus/consultant/inbox/.processed ./fusion-workbench/bus/coderev/inbox/.processed ./fusion-workbench/bus/ontorev/inbox/.processed
```

The second line creates the bus directory tree (see `rules/fusion-workbench-conventions.md` `## Bus protocol`). Bus behaviour activates only when `fusion-workbench/bus/` exists, so every setup run — fresh or rerun — provisions it. The four agent inboxes (orchestrator, consultant, coderev, ontorev) match the initial participating set; future-agent participants get their inbox added when their participation lands. The `.processed/` subdirs are pre-created so the move target always exists on day one. `mkdir -p` is idempotent: pre-existing dirs are untouched, missing ones are added — so rerunning setup on a pre-bus workbench just fills in the bus tree.

Write the setup marker (this is the file every agent and hook looks for to confirm fusion is set up here):

```bash
printf '{"setup_at":"%s","setup_pwd":"%s","plugin_version":"%s"}\n' \
  "$(date +%Y-%m-%dT%H:%M:%S%z)" \
  "$(pwd -P)" \
  "$(grep '"version"' "$FUSION_PLUGIN_ROOT/.claude-plugin/plugin.json" | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')" \
  > ./fusion-workbench/.fusion-setup
```

If `./fusion-workbench/` already existed from a prior fusion version (no `.fusion-setup` marker yet), the `mkdir -p` is harmless and the marker write is the only meaningful change — existing content is preserved.

Obtain current time: `date +%H:%M`.

Overwrite `./fusion-workbench/orchestrator-live.md` with (substitute `<HH:MM>`):

```markdown
# Orchestrator — Live

**Turn:** --/-- | **Tasks:** --/-- | **Commits:** 0 | **Errors:** 0
**Started:** <HH:MM> | **Session:** Initializing | **Guard:** checking...

## Current
  [SETUP] orchestrator -> New session starting...
```

This makes the monitor show the new session immediately, even while the rest of Setup runs.

## Step 0b — Ensure the monitor binary is present locally

```bash
[ -f ./fusion-workbench/monitor ] || { cp "$FUSION_PLUGIN_ROOT/bin/monitor" ./fusion-workbench/monitor && chmod +x ./fusion-workbench/monitor; }
```

If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, note it in the history file later but do not block Setup.

## Step 0c — Ensure the `fu` launcher is present locally

The `fu` script is a project-local convenience for launching Claude Code preconfigured for fusion (no permission prompts, default agent = `fusion:orchestrator`). It lives at `./.fusion/fu` so the user can run `./.fusion/fu` or alias it.

```bash
mkdir -p ./.fusion
[ -f ./.fusion/fu ] || { cp "$FUSION_PLUGIN_ROOT/bin/fu" ./.fusion/fu && chmod +x ./.fusion/fu; }
```

If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, note it in the history file later but do not block Setup.

## Step 0d — Concurrent-session check (advisory)

Fusion has no concurrency lock. Two orchestrators on the same project can corrupt `agentstate.yaml`, double-dispatch tasks, and race on `.guard-state/` counters. Setup checks for an active session marker and warns the user.

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-session-mark" check
```

The helper prints `running`, `stale`, or `none` on stdout, and (when running/stale) the marker contents on stderr.

- **`none` or `stale`:** no active session detected. Write a fresh marker for this orchestrator session and continue:
  ```bash
  "$FUSION_PLUGIN_ROOT/bin/fusion-session-mark" write fusion:orchestrator
  ```
- **`running`:** another fusion orchestrator session has updated the marker within the last 10 minutes. **Warn the user** with the marker contents (start time, cwd, agent label) and use `AskUserQuestion` to offer:
  - **Proceed anyway** — overwrite the marker for this session. Document the risk: parallel orchestrators may corrupt workbench state. The user takes responsibility for sequencing.
  - **Abort** — stop Setup. Tell the user where the other session appears to be running.

  Do not silently overwrite. The whole point of this step is the warning.

## Step 1 — Interrupted-session check (CRITICAL — do not skip)

Read `./fusion-workbench/agentstate.yaml`.

- **If it does not exist:** fresh session — continue to Step 2.
- **If it exists:** a prior session was interrupted. You MUST do ALL of:
  0a. **Schema check (v2.9.0).** If the saved `agentstate.yaml` contains the legacy fields `cycle:` or `goal:` (instead of the current `turn:` / `directive:`), it is a pre-v2.9.0 snapshot that cannot be replayed against v2.9.0 fields. The schema rename is a hard break — there is no soft alias. Tell the user "schema mismatch — please restart", offer **Restart only** (delete `agentstate.yaml` and proceed with fresh setup), and do not attempt to resume. Skip the remaining sub-steps once Restart is chosen.
  1. Read the file completely.
  2. Present a summary to the user:
     - Session Directive and mode
     - Progress (Turn number, tasks completed vs total)
     - The task that was active when the session stopped
     - Remaining tasks (with their status)
     - Plan file and user directive, if any
  3. Use `AskUserQuestion` to offer:
     - **Continue** — resume from the saved queue, skipping completed tasks
     - **Restart** — discard state, delete `agentstate.yaml`, fresh setup
     - **Modify** — user provides updated instructions before resuming
  4. **STOP. Do not proceed until the user has chosen.** Even if the user's original prompt implied resuming a specific task, the choice must be explicit.

## Step 2 — Rules check

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-rules" orchestrator
```

Read every path emitted. The helper emits `fusion-workbench-conventions.md` (always) plus any project-local rules from `./rules/`.

## Step 3 — Context

- Read `CLAUDE.md` for project context, folder structure, architecture.
- `git log --oneline -20` for recent change context (skip if not a git repo).
- Snapshot open state:
  - Open issues: `ls ./fusion-workbench/issues/*\[o\]* ./fusion-workbench/issues/*\[p\]* 2>/dev/null | wc -l`
  - Open plan steps: skim `./fusion-workbench/planning/*[o]*.md` and `*[p]*.md`
  - Current git HEAD (if git repo)
- Guard check: read `./fusion-workbench/.guard-state/escalation.json` (if present). If `haltActive: true`, warn the user immediately — all write operations are blocked. Offer to clear or proceed with the halt active. Also read `./fusion-workbench/.guard-state/churn.json` to note high-thrash files.
- Workbench-domain detection: run the heuristic in `agents/orchestrator.md` Setup Step 5 (the `decisions_count`/`analyses_count`/`code_files`/`data_files` block). Report the detected domain in the Setup-complete summary. The orchestrator passes this domain as the default `domain` parameter to `taskplanner` and `reconciler` dispatches; the user may override at any individual dispatch.
- **Circle-count snapshot and hint:** count files in `fusion-workbench/circles/` by marker (`[a]` anticipated, `[t]` active). If any exist, print a one-line advisory pointing to `/fusion:next` for portfolio review. If `circles/` is empty or absent, no hint is printed — opt-in behaviour preserved. The orchestrator's Setup Step 5 contains the canonical implementation.

## Step 4 — History file

Timestamp: `date +%y%m%d-%H%M`.

Create `./fusion-workbench/history/YYMMDD-HHMM-orchestrator-session.md` and write the initial entry: session Directive and snapshot counts from Step 3.

## Step 5 — Event log and live dashboard

- Create/overwrite `./fusion-workbench/orchestrator-events.jsonl` (empty — the orchestrator appends events).
- Append a `session_start` event.
- Overwrite `./fusion-workbench/orchestrator-live.md` with the real session Directive and snapshot counts (replace the placeholder `Initializing` line). The dashboard is now live for the monitor.

## Done

Only after every step above completes may you begin the user's actual task. Report Setup complete with: workspace path, history file path, snapshot counts, **detected workbench domain**, and whether an interrupted session was resumed.
