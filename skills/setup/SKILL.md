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
mkdir -p ./fusion-workbench/circles ./fusion-workbench/shared/planning ./fusion-workbench/shared/issues ./fusion-workbench/shared/decisions ./fusion-workbench/shared/analyses ./fusion-workbench/shared/reviews ./fusion-workbench/shared/investigations ./fusion-workbench/shared/consult ./fusion-workbench/shared/history ./fusion-workbench/shared/memos ./fusion-workbench/archive ./fusion-workbench/.guard-state
```

This is the Circle-container layout defined in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`. Three things about it are worth knowing here:

- **A Circle is a directory, not a file.** `circles/` starts empty; each unit of work later gets `circles/<YYMMDD-HHMM>-<slug>/` with its own `planning/`, `issues/`, `decisions/`, `history/`, `reviews/` and `analyses/`. Setup does not create any Circle.
- **`shared/` is the home for everything with no Circle affiliation** — the Origin Rule's "unknown origin means shared". `investigations/`, `consult/` and `memos/` exist only there, because none of the three is produced by executing a Directive.
- **The root-anchored surfaces stay at the root.** `agentstate.yaml`, `orchestrator-live.md`, `orchestrator-events.jsonl` and `.guard-state/` are read at fixed root-relative paths by `hooks/tracker.ts:33-36` and `bin/monitor:72-75`. Never create them anywhere else; the tracker and the dashboard have no fallback path.

Before writing the marker, note the version that produced any existing workbench — the marker write below overwrites it, and Step 0c reports it to the user:

```bash
[ -f ./fusion-workbench/.fusion-setup ] && grep -o '"plugin_version":"[^"]*"' ./fusion-workbench/.fusion-setup || echo "(kein früherer Marker)"
```

Write the setup marker (this is the file every agent and hook looks for to confirm fusion is set up here):

```bash
printf '{"setup_at":"%s","setup_pwd":"%s","plugin_version":"%s"}\n' \
  "$(date +%Y-%m-%dT%H:%M:%S%z)" \
  "$(pwd -P)" \
  "$(grep '"version"' "$FUSION_PLUGIN_ROOT/.claude-plugin/plugin.json" | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')" \
  > ./fusion-workbench/.fusion-setup
```

If `./fusion-workbench/` already existed from a prior fusion version, the `mkdir -p` is harmless and existing content is preserved. Pre-v4 content is not yet in the right place, though — Step 0c below moves it.

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


## Step 0c — Migrate a pre-v4 workbench (CRITICAL — never migrate silently)

A workbench created before v4 keeps its artifacts in type folders at the workbench root (`planning/`, `issues/`, `decisions/`, …). The Circle-container layout puts them in `shared/`. This step moves them, and it asks first.

**Detection is by artifact presence, not by version.** A pre-v4 workbench is one where at least one old-layout artifact still exists: a type folder at the workbench root, or a `circles/*.md` file (the old marker-in-filename form). The `plugin_version` in `.fusion-setup` is *not* the detector — Step 0 has already overwritten it by the time this step runs, and it answers the wrong question anyway: a workbench with no old artifacts has nothing to migrate regardless of which version created it. Report the old version to the user as context; key the decision on the artifacts.

**This is also the idempotency guarantee.** A successful migration removes exactly the things the detector looks for. Run this step twice and the second run finds nothing and does nothing. If a move fails, its source stays put, the detector fires again next run, and the user gets another chance — no state flag can drift out of sync with the filesystem, because the filesystem *is* the flag.

### Survey — what would move

Run this first. It is read-only:

```bash
WB=./fusion-workbench; FOUND=0; for d in planning issues decisions history analyses investigations consult memos; do [ -d "$WB/$d" ] || continue; printf '  %-16s -> shared/%-16s %s Eintrag/Einträge\n' "$d/" "$d/" "$(find "$WB/$d" -mindepth 1 -maxdepth 1 | wc -l | tr -d ' ')"; FOUND=1; done; for pair in codereview:coderev ontoreview:ontorev conceptreview:conceptrev; do d="${pair%%:*}"; [ -d "$WB/$d" ] || continue; printf '  %-16s -> shared/%-16s %s Eintrag/Einträge\n' "$d/" "reviews/" "$(find "$WB/$d" -mindepth 1 -maxdepth 1 | wc -l | tr -d ' ')"; FOUND=1; done; for f in "$WB"/circles/*.md; do [ -e "$f" ] || continue; b="$(basename "$f" .md)"; m="$(printf '%s' "$b" | sed -nE 's/^[0-9]{6}-[0-9]{4}\[([a-z])\].*$/\1/p')"; if [ -z "$m" ]; then printf '  circles/%s — KEIN MARKER, wird übersprungen\n' "$(basename "$f")"; else printf '  circles/%s -> circles/%s/[%s]-circle.md\n' "$(basename "$f")" "$(printf '%s' "$b" | sed -E 's/\[[a-z]\]//')" "$m"; fi; FOUND=1; done; if [ -f "$WB/.active-circle" ]; then cur="$(head -n1 "$WB/.active-circle" | tr -d '\r' | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"; case "$cur" in *.md) printf '  .active-circle  %s -> %s\n' "$cur" "$(printf '%s' "$cur" | sed -E 's/\.md$//; s/\[[a-z]\]//')"; FOUND=1 ;; esac; fi; [ "$FOUND" = 0 ] && echo "  (nichts — bereits im neuen Layout)"; if git rev-parse --is-inside-work-tree >/dev/null 2>&1 && [ -n "$(git ls-files "$WB" | head -1)" ]; then echo "MODE=git"; else echo "MODE=plain"; fi; echo "FOUND=$FOUND"
```

**If `FOUND=0`: skip the rest of this step entirely.** The workbench is already in the container layout. Say nothing to the user beyond a one-line note in the Setup summary.

**If `FOUND=1`: ask before moving.** Note `MODE` — the user must know before deciding whether the move will be reviewable:

- `MODE=git` — the workbench is tracked. Moves use `git mv`, history is preserved, the whole migration lands as one reviewable diff, and a retreat is `git revert`.
- `MODE=plain` — the workbench is untracked or gitignored (fusion's own repo is this case), or the project is not a git repo. `git mv` cannot work here. Moves use plain `mv`. **Say this out loud in the question.** The migration will not appear in any diff and cannot be undone with git.

Use `AskUserQuestion`. Write the prompt in the project's language per the `**Language:**` line in `CLAUDE.md` (see `rules/fusion-workbench-conventions.md` `## Project language`), and follow `rules/user-facing-output.md` plus the chat profile at `./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`. Show the survey output above the question so the user sees the actual file counts, not a summary of them. German shape:

> **Frage:** Diese workbench hat noch das alte Layout. Ich stelle sie auf die Circle-Struktur um: die Typ-Ordner wandern nach `shared/`, die drei Review-Ordner werden zu `shared/reviews/` zusammengeführt, und die Circle-Dateien werden zu Circle-Verzeichnissen. Verschoben wird mit `git mv`, der Umzug ist also als ein Diff prüfbar. Gelöscht wird nichts. Die Liste oben zeigt, was sich bewegt.
>
> **Option "Umstellen"** (empfohlen): Verschiebt die Artefakte wie aufgelistet.
> **Option "Erstmal lassen"**: Lässt die Altbestände in der Wurzel liegen. Die Agenten schreiben ab sofort trotzdem nach `shared/`, deine alten Einträge findet dann keine Suche mehr. Setup fragt beim nächsten Lauf erneut.

For `MODE=plain`, replace the `git mv` sentence with the honest one: *"Diese workbench ist nicht versioniert, verschoben wird mit `mv`. Der Umzug taucht in keinem Diff auf und lässt sich nicht per `git revert` zurücknehmen."*

Do not migrate without an explicit choice. The user's own `CLAUDE.md` may declare a different language; the two options and their consequences stay the same.

### Execute — only after the user chose to migrate

```bash
set -u; WB="./fusion-workbench"; FALLBACKS=0; COLLISIONS=0; MOVED=0; if git rev-parse --is-inside-work-tree >/dev/null 2>&1 && [ -n "$(git ls-files "$WB" | head -1)" ]; then MODE=git; else MODE=plain; echo "HINWEIS: workbench nicht versioniert. Verschoben wird mit mv; der Umzug ist nicht als Diff prüfbar und nicht per git revert rücknehmbar." >&2; fi; move_one() { if [ -e "$2" ]; then echo "KOLLISION: $2 existiert bereits. $1 bleibt liegen." >&2; COLLISIONS=$((COLLISIONS+1)); return 1; fi; if [ "$MODE" = git ] && git mv "$1" "$2" 2>/dev/null; then MOVED=$((MOVED+1)); return 0; fi; if mv "$1" "$2"; then if [ "$MODE" = git ]; then echo "HINWEIS: $1 ist nicht versioniert, mit mv verschoben (nicht im Diff)." >&2; FALLBACKS=$((FALLBACKS+1)); fi; MOVED=$((MOVED+1)); return 0; fi; echo "FEHLER: $1 -> $2 fehlgeschlagen." >&2; return 1; }; for d in planning issues decisions history analyses investigations consult memos; do [ -d "$WB/$d" ] || continue; mkdir -p "$WB/shared/$d"; for f in "$WB/$d"/* "$WB/$d"/.[!.]*; do [ -e "$f" ] || continue; move_one "$f" "$WB/shared/$d/$(basename "$f")" || true; done; rmdir "$WB/$d" 2>/dev/null || echo "HINWEIS: $WB/$d ist nicht leer und bleibt bestehen." >&2; done; for pair in codereview:coderev ontoreview:ontorev conceptreview:conceptrev; do src="${pair%%:*}"; sender="${pair##*:}"; [ -d "$WB/$src" ] || continue; mkdir -p "$WB/shared/reviews"; for f in "$WB/$src"/* "$WB/$src"/.[!.]*; do [ -e "$f" ] || continue; b="$(basename "$f")"; case "$b" in *"-$sender-"*) nb="$b" ;; *) nb="$(printf '%s' "$b" | sed -E "s/^([0-9]{6}-[0-9]{4})-/\1-$sender-/")" ;; esac; move_one "$f" "$WB/shared/reviews/$nb" || true; done; rmdir "$WB/$src" 2>/dev/null || echo "HINWEIS: $WB/$src ist nicht leer und bleibt bestehen." >&2; done; for f in "$WB"/circles/*.md; do [ -e "$f" ] || continue; b="$(basename "$f" .md)"; m="$(printf '%s' "$b" | sed -nE 's/^[0-9]{6}-[0-9]{4}\[([a-z])\].*$/\1/p')"; if [ -z "$m" ]; then echo "ÜBERSPRUNGEN: $f trägt keinen Marker im Dateinamen." >&2; continue; fi; dir="$(printf '%s' "$b" | sed -E 's/\[[a-z]\]//')"; mkdir -p "$WB/circles/$dir"; if move_one "$f" "$WB/circles/$dir/[$m]-circle.md"; then mkdir -p "$WB/circles/$dir/planning" "$WB/circles/$dir/issues" "$WB/circles/$dir/decisions" "$WB/circles/$dir/history" "$WB/circles/$dir/reviews" "$WB/circles/$dir/analyses"; fi; done; if [ -f "$WB/.active-circle" ]; then cur="$(head -n1 "$WB/.active-circle" | tr -d '\r' | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"; case "$cur" in *.md) new="$(printf '%s' "$cur" | sed -E 's/\.md$//; s/\[[a-z]\]//')"; if [ -d "$WB/circles/$new" ]; then printf '%s\n' "$new" > "$WB/.active-circle"; echo "Zeiger .active-circle: $cur -> $new"; else echo "WARNUNG: .active-circle zeigt auf $cur, aber circles/$new fehlt. Zeiger unverändert; bitte von Hand prüfen." >&2; fi ;; esac; fi; echo "---"; echo "verschoben=$MOVED kollisionen=$COLLISIONS mv-fallbacks=$FALLBACKS mode=$MODE"
```

What the moves do, and why each is what it is:

- **Type folders move by content, not by directory.** Step 0 has already created `shared/planning/` and friends, so `git mv <dir> shared/<dir>` would nest the source *inside* the destination (`shared/planning/planning/`). Both `git mv` and `mv` behave this way when the destination exists. Moving entry by entry and then `rmdir`-ing the drained folder is what avoids it.
- **Every type folder goes to `shared/` wholesale.** No file is inspected, no Circle affiliation is guessed. Pre-v4 artifacts never recorded which Directive caused them, so under the Origin Rule their origin is unknown, and unknown origin means `shared/`. That is what makes this a mechanical move instead of an act of interpretation. Re-filing anything into a Circle afterwards is a deliberate, separate act by the user.
- **The three review folders merge, and the sender is inserted into the filename.** `codereview/260519-0438-loader-check.md` becomes `shared/reviews/260519-0438-coderev-loader-check.md`. This is not decoration: the conventions make `<sender>` mandatory on a review filename precisely because the three kinds now share one directory, and inserting it makes same-name collisions across the three sources **impossible by construction** rather than merely unlikely. Files that already carry their sender are left alone; files that do not match the `YYMMDD-HHMM-` stamp shape get no insert and can still collide.
- **A real collision never overwrites.** If the destination exists, the source stays where it is, the script says so on stderr, and the drained folder survives the `rmdir`. The next Setup run detects it again. Losing an artifact to a silent clobber is the one outcome this step must never produce (`HYG-NO-SILENT-FAIL`); leaving a file behind with a loud message is recoverable, overwriting it is not.
- **Circle files become Circle directories.** `circles/260716-1847[t]-umbau.md` becomes `circles/260716-1847-umbau/[t]-circle.md`: the marker moves off the filename onto the record inside a stable directory. The six artifact subdirectories are created alongside it, per the Circle record template. A `circles/*.md` file with no parsable marker is skipped loudly and left in place rather than guessed at.
- **`.active-circle` is re-pointed** from the old filename form to the bare directory name `bin/fusion-paths` expects. If the target directory is missing, the pointer is left untouched and flagged — `bin/fusion-paths` exits non-zero on an orphaned pointer, which is the correct loud failure.

Report the tail counters (`verschoben`, `kollisionen`, `mv-fallbacks`) in the Setup summary. Any non-zero `kollisionen` needs the user's attention before work starts.

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

## Step 0e — Ensure stylometric profiles are present locally

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

`fusion-paths` resolves where this session writes and searches, and prints `KEY=value` lines (`OUT_HISTORY`, `OUT_ISSUE`, `SCAN_ISSUES`, …). Hold these values for the rest of the session and use them wherever a later step names a `$OUT_*` or `$SCAN_*` value — they are the only correct answer to "where does this go". A non-zero exit means the workbench state is inconsistent (an orphaned `.active-circle`); fix that before continuing rather than guessing a path.

## Step 3 — Context

- Read `CLAUDE.md` for project context, folder structure, architecture.
- `git log --oneline -20` for recent change context (skip if not a git repo).
- Snapshot open state, using the values `fusion-paths` gave you in Step 2. Every `SCAN_*` may name **two** directories (the active Circle's and the shared one) — count both, or the snapshot silently under-reports:
  - Open issues: for each path in `$SCAN_ISSUES`, count `*[o]*` and `*[p]*` files.
  - Open plan steps: for each path in `$SCAN_PLANS`, skim `*[o]*.md` and `*[p]*.md`.
  - Current git HEAD (if git repo)
- Guard check: read `./fusion-workbench/.guard-state/escalation.json` (if present). If `haltActive: true`, warn the user immediately — all write operations are blocked. Offer to clear or proceed with the halt active. Also read `./fusion-workbench/.guard-state/churn.json` to note high-thrash files.
- Workbench-domain detection: run the heuristic in `agents/orchestrator.md` Setup Step 5 (the `decisions_count`/`analyses_count`/`code_files`/`data_files` block). Report the detected domain in the Setup-complete summary. The orchestrator passes this domain as the default `domain` parameter to `taskplanner` and `reconciler` dispatches; the user may override at any individual dispatch.
- **Circle-count snapshot and hint:** count Circles under `$SCAN_CIRCLES` by the marker on their record, not on the directory — a Circle is `<stamp>-<slug>/[a]-circle.md`, so the glob is `*/[a]-circle.md` and `*/[t]-circle.md`. If any exist, print a one-line advisory pointing to `/fusion:next` for portfolio review. If no Circles exist, no hint is printed — opt-in behaviour preserved. The orchestrator's Setup Step 5 contains the canonical implementation.

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

Only after every step above completes may you begin the user's actual task. Report Setup complete with: workspace path, history file path, snapshot counts, **detected workbench domain**, whether an interrupted session was resumed, and — only when Step 0c actually moved something — what it moved and whether any collisions need the user's attention.
