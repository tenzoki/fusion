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

Note the path. The workbench will be created here.

### Pre-v4 layout check (CRITICAL — refuse, do not migrate)

**This runs before the `mkdir` below, and the order is the whole point.** A workbench created before v4 keeps its artifacts in type folders at the workbench root (`planning/`, `issues/`, `decisions/`, …); the container layout puts them in `shared/`. Setup does **not** migrate — `/fusion:migrate` does. Setup's job here is to notice and stop.

Stopping *before* the `mkdir` is what makes this worth doing. The `mkdir -p` below creates `shared/planning/` and friends; run it against a pre-v4 workbench and the workbench is now split across two layouts — old artifacts at the root, an empty new store beside them — and every agent dispatched afterwards writes into the new one while every old artifact sits unreachable in the old. That is not hypothetical: it is filed as `fusion-workbench/issues/260717-0115[o]-live-workbench-split-across-two-layouts-during-conversion.md`. The marker write further down is the second reason: it overwrites `plugin_version`, destroying the only record of which version produced the workbench.

Detection is by artifact presence, not by version — a workbench with no old artifacts has nothing to migrate regardless of which version created it. Read-only:

```bash
WB=./fusion-workbench; OLD=0; if [ -d "$WB" ]; then for d in planning issues decisions history analyses investigations consult memos codereview ontoreview conceptreview; do [ -d "$WB/$d" ] && { echo "  $d/ (Typ-Ordner der Wurzel)"; OLD=1; }; done; for f in "$WB"/circles/*.md; do [ -e "$f" ] || continue; printf '%s' "$(basename "$f" .md)" | grep -qE '^[0-9]{6}-[0-9]{4}\[[a-z]\]' && { echo "  circles/$(basename "$f") (Circle-Datei im alten Marker-Format)"; OLD=1; }; done; fi; echo "OLD=$OLD"
```

- **`OLD=0`** — nothing pre-v4 here. Continue with the `mkdir` below. Say nothing about it.
- **`OLD=1`** — **stop Setup here.** Do not run the `mkdir`. Do not write the marker. Do not proceed to any later step. Tell the user, in the project's language per the `**Language:**` line in `CLAUDE.md` (see `rules/fusion-workbench-conventions.md` `## Project language`), following `rules/user-facing-output.md` and the chat profile at `./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`. Show the detected entries above the message so the user sees what was found. German shape:

  > **Setup abgebrochen.** Diese workbench hat noch das Layout vor v4 — die oben genannten Artefakte liegen in Typ-Ordnern der Wurzel statt in `shared/`. Setup legt die neue Struktur nicht daneben an, weil die workbench damit über zwei Layouts verteilt wäre und die alten Einträge keine Suche mehr fände.
  >
  > **Nächster Schritt:** `/fusion:migrate` ausführen, dann `/fusion:setup` erneut starten. Die Migration zeigt vorher an, was sie verschiebt, und fragt nach.

  This is a refusal, not a question — there is nothing for the user to choose here, and `AskUserQuestion` would imply otherwise. `/fusion:migrate` is where the choice lives.

Only when `OLD=0`:

```bash
mkdir -p ./fusion-workbench/circles ./fusion-workbench/shared/planning ./fusion-workbench/shared/issues ./fusion-workbench/shared/decisions ./fusion-workbench/shared/analyses ./fusion-workbench/shared/reviews ./fusion-workbench/shared/investigations ./fusion-workbench/shared/consult ./fusion-workbench/shared/history ./fusion-workbench/shared/memos ./fusion-workbench/archive ./fusion-workbench/.guard-state
```

This is the Circle-container layout defined in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`. Three things about it are worth knowing here:

- **A Circle is a directory, not a file.** `circles/` starts empty; each unit of work later gets `circles/<YYMMDD-HHMM>-<slug>/` with its own `planning/`, `issues/`, `decisions/`, `history/`, `reviews/` and `analyses/`. Setup does not create any Circle.
- **`shared/` is the home for everything with no Circle affiliation** — the Origin Rule's "unknown origin means shared". `investigations/`, `consult/` and `memos/` exist only there, because none of the three is produced by executing a Directive.
- **The root-anchored surfaces stay at the root.** `agentstate.yaml`, `orchestrator-live.md`, `orchestrator-events.jsonl` and `.guard-state/` are read at fixed root-relative paths by `hooks/tracker.ts:33-36` and `bin/monitor:72-75`; `.commit-lock/` by `bin/fusion-commit-lock` and `.session-marker` by `bin/fusion-session-mark`. Never create them anywhere else; none of these consumers has a fallback path. Only `.guard-state/` is pre-created above — the rest appear when their consumer first writes them. The full list is in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`.

Write the setup marker (this is the file every agent and hook looks for to confirm fusion is set up here):

```bash
printf '{"setup_at":"%s","setup_pwd":"%s","plugin_version":"%s"}\n' \
  "$(date +%Y-%m-%dT%H:%M:%S%z)" \
  "$(pwd -P)" \
  "$(grep '"version"' "$FUSION_PLUGIN_ROOT/.claude-plugin/plugin.json" | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')" \
  > ./fusion-workbench/.fusion-setup
```

If `./fusion-workbench/` already existed from a prior fusion version, the `mkdir -p` is harmless and existing content is preserved. Pre-v4 content is caught by the layout check above, which stops Setup before this point and routes the user to `/fusion:migrate` — so a workbench reaching this `mkdir` is already in the container layout.

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

## Step 0b — Refresh the monitor binary locally

Always re-copy the monitor from the installed plugin so the project's copy matches the current plugin version (a stale local monitor from an earlier install is the most common dashboard bug). Copy to a temp file and atomically `mv` it into place — this overwrites cleanly even when a monitor process is currently running (avoids `Text file busy` / `ETXTBSY`):

```bash
[ -n "$FUSION_PLUGIN_ROOT" ] && [ -f "$FUSION_PLUGIN_ROOT/bin/monitor" ] && { cp "$FUSION_PLUGIN_ROOT/bin/monitor" ./fusion-workbench/monitor.new && chmod +x ./fusion-workbench/monitor.new && mv -f ./fusion-workbench/monitor.new ./fusion-workbench/monitor; }
```

If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, note it in the history file later but do not block Setup.


## Step 0c — Concurrent-session check (advisory)

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

## Step 0d — Ensure stylometric profiles are present locally

Two profile families seed the project's user-facing voice, both at `./fusion-workbench/stilwerk/` so each project can edit them without affecting other projects or the plugin:

- `default-voice-{en,de}.yaml` — the long-form **writing** profile (cadence, vocabulary, structural patterns for narrative outputs: session summaries, consultant reports, analysis reports, spec/plan prose).
- `chat-voice-{en,de}.yaml` — the short-form **chat** profile (anti-pattern blacklist plus a minimal terse-and-direct whitelist for gate prompts, AskUserQuestion text, status reports, chat replies).

```bash
mkdir -p ./fusion-workbench/stilwerk
[ -f ./fusion-workbench/stilwerk/default-voice-en.yaml ] || { cp "$FUSION_PLUGIN_ROOT/stilwerk/default-voice-en.yaml" ./fusion-workbench/stilwerk/default-voice-en.yaml && echo "default-voice-en.yaml copied"; }
[ -f ./fusion-workbench/stilwerk/default-voice-de.yaml ] || { cp "$FUSION_PLUGIN_ROOT/stilwerk/default-voice-de.yaml" ./fusion-workbench/stilwerk/default-voice-de.yaml && echo "default-voice-de.yaml copied"; }
[ -f ./fusion-workbench/stilwerk/chat-voice-en.yaml ] || { cp "$FUSION_PLUGIN_ROOT/stilwerk/chat-voice-en.yaml" ./fusion-workbench/stilwerk/chat-voice-en.yaml && echo "chat-voice-en.yaml copied"; }
[ -f ./fusion-workbench/stilwerk/chat-voice-de.yaml ] || { cp "$FUSION_PLUGIN_ROOT/stilwerk/chat-voice-de.yaml" ./fusion-workbench/stilwerk/chat-voice-de.yaml && echo "chat-voice-de.yaml copied"; }
```

Both copies are idempotent — existing files are left untouched, so any project-local edits to the profiles survive subsequent setups.

If `$FUSION_PLUGIN_ROOT` is not set or the copy fails, note it in the history file later but do not block Setup.

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
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" orchestrator
```

Read every path `fusion-rules` emits. The helper emits `fusion-workbench-conventions.md` (always) plus any project-local rules from `./rules/`.

`fusion-paths` resolves where this session writes and searches, and prints `KEY=value` lines (`OUT_HISTORY`, `OUT_ISSUE`, `SCAN_ISSUES`, …).

**Pass `orchestrator`, not `setup`.** Every other skill passes its own name, because `fusion-paths` reads a consumer's key set out of its prompt and each skill is its own consumer (`rules/fusion-workbench-conventions.md` `## Path Resolution`). This skill is the exception: it *is* the orchestrator's Setup, and the values resolved here are held by the **orchestrator** for the whole session — including steps that live in `agents/orchestrator.md` and not in this file. Passing `setup` would yield only the keys this file happens to name, and the orchestrator would be short the rest.

Hold these values for the rest of the session and use them wherever a later step names a `$OUT_*` or `$SCAN_*` value — they are the only correct answer to "where does this go". Never guess a path when the resolver fails; stop and report.

On a non-zero exit, read the code — it says whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes):

- **Exit 3** — the workbench state is inconsistent: `.active-circle` is orphaned or corrupt. Tell the user to fix or delete the pointer before continuing.
- **Exit 4** — an internal error in `fusion-paths`. The user's workbench is fine; do **not** send them to check `.active-circle`. Report it as a fusion bug and file an issue.

## Step 3 — Context

- Read `CLAUDE.md` for project context, folder structure, architecture.
- `git log --oneline -20` for recent change context (skip if not a git repo).
- Snapshot open state, using the values `fusion-paths` gave you in Step 2. Every `SCAN_*` may name **two** directories (the active Circle's and the shared one) — count both, or the snapshot silently under-reports:
  - Open issues: for each path in `$SCAN_ISSUES`, count `*[o]*` and `*[p]*` files.
  - Open plan steps: for each path in `$SCAN_PLANS`, skim `*[o]*.md` and `*[p]*.md`.
  - Current git HEAD (if git repo)
- Guard check: read `./fusion-workbench/.guard-state/escalation.json` (if present). If `haltActive: true`, warn the user immediately — all write operations are blocked. Offer to clear or proceed with the halt active. Also read `./fusion-workbench/.guard-state/churn.json` to note high-thrash files.
- Workbench-domain detection: run the heuristic in `agents/orchestrator.md` Setup Step 5 (the `decisions_count`/`analyses_count`/`code_files`/`data_files` block). Report the detected domain in the Setup-complete summary. The orchestrator passes this domain as the default `domain` parameter to `taskplanner` and `reconciler` dispatches; the user may override at any individual dispatch.
- **Circle-count snapshot and hint:** count Circles under `$SCAN_CIRCLES` by the marker on their record, not on the directory. Enumerate the records and read the marker from the name — one pass, no bracket expression, no glob per state:

  ```bash
  for f in ./fusion-workbench/circles/*/*-circle.md; do [ -e "$f" ] || continue; basename "$f" | sed -nE 's/^\[([a-z])\].*/\1/p'; done | sort | uniq -c
  ```

  Output is one `<count> <marker>` line per state (`2 a`, `1 t`); no Circles prints nothing. The `[ -e "$f" ] || continue` guard is what makes the empty case count zero instead of counting the unexpanded pattern.

  **Do not write `circles/*/[a]-circle.md`.** `[a]` is a shell bracket expression matching the single character `a`; the glob searches for `a-circle.md`, matches nothing, and reports zero Circles on a workbench full of them — silently. If a single state must be globbed, escape it: `circles/*/\[a\]-circle.md`. See `rules/fusion-workbench-conventions.md` `## State Markers — circles`.

  If any Circles exist, print a one-line advisory pointing to `/fusion:next` for portfolio review. If none exist, no hint is printed — opt-in behaviour preserved. The orchestrator's Setup Step 5 contains the canonical implementation.

## Step 4 — History file

Timestamp: `date +%y%m%d-%H%M`.

Create `$OUT_HISTORY/YYMMDD-HHMM-orchestrator-session.md` (the value `fusion-paths` gave you in Step 2 — the active Circle's `history/` when one is active, `shared/history/` when none is) and write the initial entry: session Directive and snapshot counts from Step 3.

## Step 5 — Event log and live dashboard

- **Create if missing, never overwrite.** `./fusion-workbench/orchestrator-events.jsonl` is append-only across all sessions. Use a touch-or-append pattern, never a truncating `>` redirect:
  ```bash
  [ -f ./fusion-workbench/orchestrator-events.jsonl ] || touch ./fusion-workbench/orchestrator-events.jsonl
  ```
- Append a `session_start` event (one line, appended — never overwrite the file):
  ```bash
  TS="$(date -u +%Y-%m-%dT%H:%M:%S)"
  echo "{\"ts\":\"${TS}\",\"event\":\"session_start\"}" >> ./fusion-workbench/orchestrator-events.jsonl
  ```
- Overwrite `./fusion-workbench/orchestrator-live.md` with the real session Directive and snapshot counts (replace the placeholder `Initializing` line). The dashboard is now live for the monitor.

## Done

Only after every step above completes may you begin the user's actual task. Report Setup complete with: workspace path, history file path, snapshot counts, **detected workbench domain**, and whether an interrupted session was resumed. (Setup no longer migrates — a pre-v4 workbench is caught by the layout check in Step 0, which refuses and routes the user to `/fusion:migrate` before any of this runs.)
