---
description: Run the mandatory orchestrator Setup procedure — workspace, dashboard, interrupted-session check, rules, history, event log
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Orchestrator Setup

The active agent MUST be `fusion:orchestrator`. This skill inlines the full Setup procedure so it cannot be skipped.

Execute every step below in order. Do not begin the user's task work until Setup is complete and any Step 1 decision has been resolved.

## CRITICAL — Workbench is anchored to pwd, NOT the git toplevel

The fusion workbench is created **in the user's current working directory** — the directory `pwd` reports. This is intentional: a subfolder may legitimately need its own independent workbench, separate from any workbench at the git root.

**Do NOT prepend `cd <git-toplevel> && …` (or any other `cd`) to the commands below.** Run them exactly as written so the workbench lands at `./fusion-workbench/`. The plugin's hooks resolve `process.cwd()` directly — they will follow whichever directory you operate in.

If `git rev-parse --show-toplevel` returns a path different from `pwd`, that is fine and expected when fusion is being set up in a subfolder of a git project. Do not "correct" it.

## Step 0 — Confirm and create workspace

```bash
pwd
```

Note the path. The workbench will be created here. Then:

```bash
mkdir -p ./fusion-workbench/planning ./fusion-workbench/issues ./fusion-workbench/decisions ./fusion-workbench/history ./fusion-workbench/codereview ./fusion-workbench/ontoreview ./fusion-workbench/investigations ./fusion-workbench/analyses ./fusion-workbench/.guard-state
```

Obtain current time: `date +%H:%M`.

Overwrite `./fusion-workbench/orchestrator-live.md` with (substitute `<HH:MM>`):

```markdown
# Orchestrator — Live

**Cycle:** --/-- | **Tasks:** --/-- | **Commits:** 0 | **Errors:** 0
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

## Step 1 — Interrupted-session check (CRITICAL — do not skip)

Read `./fusion-workbench/agentstate.yaml`.

- **If it does not exist:** fresh session — continue to Step 2.
- **If it exists:** a prior session was interrupted. You MUST do ALL of:
  1. Read the file completely.
  2. Present a summary to the user:
     - Session goal and mode
     - Progress (cycle number, tasks completed vs total)
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

## Step 4 — History file

Timestamp: `date +%y%m%d-%H%M`.

Create `./fusion-workbench/history/YYMMDD-HHMM-orchestrator-session.md` and write the initial entry: session goal and snapshot counts from Step 3.

## Step 5 — Event log and live dashboard

- Create/overwrite `./fusion-workbench/orchestrator-events.jsonl` (empty — the orchestrator appends events).
- Append a `session_start` event.
- Overwrite `./fusion-workbench/orchestrator-live.md` with the real session goal and snapshot counts (replace the placeholder `Initializing` line). The dashboard is now live for the monitor.

## Done

Only after every step above completes may you begin the user's actual task. Report Setup complete with: workspace path, history file path, snapshot counts, **detected workbench domain**, and whether an interrupted session was resumed.
