---
name: circle-stash
description: Freeze the complete state of the active Circle (its whole directory, the pointer, agent state, dashboard, queue, git working tree) into a self-contained stash directory. Use when an urgent interruption demands the workspace and the active Circle must be preserved for later restoration.
argument-hint: "[reason]"
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Fusion — circle-stash (freeze the active Circle)

The user invoked `/fusion:circle-stash [reason]`. This skill freezes the complete state of the currently-active Circle — the Circle directory, the `.active-circle` pointer, the orchestrator's in-flight state, the dashboard, the task queue, and the git working tree — into a self-contained directory under the workbench's stash store. Once stashed, the workspace is free for unrelated urgent work; `/fusion:circle-pop` restores the Circle later.

**A Circle is a directory, and capturing it captures its contents.** Its spec, plan, issues, decisions, history, reviews and analyses all live inside it (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`), so the capture is one move of one directory. There is no hunt through type directories for files the Circle happens to reference, and nothing the Circle owns is left behind where the urgent work could edit it.

The shared store is the deliberate exception: it belongs to no Circle and is never captured (`rules/fusion-workbench-conventions.md` `## Stashes` → What stash does NOT touch). Step 4 surfaces this when the Circle's record cites a spec or plan that lives there.

The skill writes nothing outside the stash directory, the workbench root files it relocates, and a single `circle_stashed` event line. Every mutation is gated by an explicit user confirmation in Step 6.

**Invocation forms:**

- `/fusion:circle-stash` — prompts the user for a one-line reason.
- `/fusion:circle-stash "urgent customer call"` — uses the argument as the reason; still confirms before mutating.

## Step 1 — Pre-flight: resolve paths

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" orchestrator
```

Hold the emitted `KEY=value` values for the rest of the skill. `$WORKBENCH` is absolute; every other value is workbench-relative. Never guess a path when the resolver fails — read the exit code, it says whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes):

- **Exit 1** — no workbench above `pwd`. Halt:

  > *Keine fusion-workbench über `$(pwd)` gefunden. Führe zuerst `/fusion:setup` im Projektwurzelverzeichnis aus.*

  Exit cleanly. Do NOT bootstrap a workbench from here — `/fusion:setup` is the single point of workbench creation.

- **Exit 3** — `.active-circle` is orphaned or corrupt. The workbench state is inconsistent. Report the resolver's stderr message verbatim and tell the user to fix or delete the pointer. Do not proceed — stashing against an inconsistent pointer is how a Circle gets lost.

- **Exit 4** — an internal error in `fusion-paths`. The user's workbench is fine; do **not** send them to check `.active-circle`. Report it as a fusion bug and stop.

Derive the git root. The workbench is anchored to the directory setup ran in; every git command in this skill runs there, not inside the workbench:

```bash
PROJECT_ROOT="$(dirname "$WORKBENCH")"
STASH_STORE="$WORKBENCH/stashes"
```

## Step 2 — Pre-flight: an active Circle must exist

`fusion-paths` emits a `CIRCLE=` line exactly when a Circle is active, and it has already verified the pointer resolves to a real directory. That line is the test — do **not** read `.active-circle` yourself to decide.

If no `CIRCLE=` line was emitted:

> **Es gibt keinen aktiven Circle zum Wegpacken.** Aktiviere zuerst einen mit `/fusion:next`, dann komm wieder, falls du ihn immer noch wegpacken willst.

Exit cleanly.

Otherwise resolve the Circle's directory and its record:

```bash
CIRCLE_PATH="$WORKBENCH/$CIRCLE"
CIRCLE_DIRNAME="$(basename "$CIRCLE")"
REC=""; REC_COUNT=0; for f in "$CIRCLE_PATH"/*-circle.md; do [ -e "$f" ] || continue; REC="$f"; REC_COUNT=$((REC_COUNT+1)); done
CIRCLE_RECORD="$(basename "${REC:-}")"
```

Enumerate the record; never glob the marker. `*/[t]-circle.md` is a **bracket expression matching the single character `t`**, so it searches for `t-circle.md`, matches nothing, and reports zero records for a Circle that has one — silently, because the unmatched pattern expands to itself and the `[ -e "$f" ] || continue` guard drops it. `find -name '[t]-circle.md'` has the identical bug: `find` globs the pattern itself. See `rules/fusion-workbench-conventions.md` `## State Markers — circles`.

If `REC_COUNT` is 0 or greater than 1, halt and say which it is — a Circle directory holding no record, or more than one, is a workbench-state fault the user must resolve:

> **Der aktive Circle hat keinen eindeutigen Datensatz.** `<CIRCLE>` enthält `<REC_COUNT>` Dateien der Form `*-circle.md`; genau eine wird erwartet. Bring das in Ordnung, bevor du wegpackst — sonst weiß `/fusion:circle-pop` nicht, was es zurückholen soll.

Exit cleanly.

Record the record's marker verbatim but do **not** refuse on its value. A rescue tool preserves what it finds; the manifest carries the filename byte-for-byte and pop restores it unchanged. If the marker is not `t`, note it in the Step 6 preview so the user sees the inconsistency before confirming.

## Step 3 — Pre-flight: no task may be mid-flight

The binding decision (Fork 1) forbids stashing while an executor is running, so any half-completed task does not get carried into the stash inconsistently. `agentstate.yaml` is root-anchored — the hooks read it there (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`).

```bash
if [ -f "$WORKBENCH/agentstate.yaml" ]; then TASK_STATUS="$(grep -E '^[[:space:]]+status:' "$WORKBENCH/agentstate.yaml" | head -1 | sed -E 's/.*status:[[:space:]]*"?([a-z]+)"?.*/\1/')"; else TASK_STATUS=""; fi
```

If `TASK_STATUS == "running"`:

> **Warte, bis die laufende Aufgabe fertig ist, und pack dann zwischen zwei Turns weg.** Laut `agentstate.yaml` läuft gerade eine Aufgabe; jetzt wegzupacken würde sie halbfertig einfrieren. Der Orchestrator setzt `running` nur, solange ein Executor mitten im Schreiben ist — das springt binnen Sekunden zurück auf `queued` oder ist durch. Versuch es noch mal, sobald der Turn zurückgemeldet hat.

Exit cleanly.

If `agentstate.yaml` is absent entirely (no orchestrator session running but a Circle is active — Decision Fork 4): continue. The manifest records `has_agentstate: false` and the agentstate copy is skipped in Step 7.

```bash
[ -f "$WORKBENCH/agentstate.yaml" ] && HAS_AGENTSTATE=true || HAS_AGENTSTATE=false
```

## Step 4 — Build the preview block

Gather the facts to show the user before any mutation runs. None of these reads modify state.

- **Directive line.** Read the `## Directive` section of the record and extract the first non-empty paragraph.

  ```bash
  DIRECTIVE_LINE="$(awk '/^## Directive$/{flag=1; next} /^## /{flag=0} flag && NF' "$REC" | head -1)"
  ```

- **Cited spec/plan, and whether it travels.** Read the `**Active spec/plan:**` field. The literal string `(none yet)` means nothing is cited. Nothing is copied — this read exists solely to tell the user what is and is not captured.

  ```bash
  SPEC_PLAN_RAW="$(grep -E '^\*\*Active spec/plan:\*\*' "$REC" | head -1 | sed -E 's#^\*\*Active spec/plan:\*\*[[:space:]]*##')"
  TRAVELS=""; STAYS=""
  if [ -n "$SPEC_PLAN_RAW" ] && [ "$SPEC_PLAN_RAW" != "(none yet)" ]; then
    for p in $(printf '%s' "$SPEC_PLAN_RAW" | tr ',' ' '); do case "$p" in "$CIRCLE"/*) TRAVELS="$TRAVELS $p" ;; *) STAYS="$STAYS $p" ;; esac; done
  fi
  ```

  The sed substitution uses `#` as delimiter — the pattern itself contains `/` (in `spec/plan`), which collides with the default `/` delimiter and produces `bad flag in substitute command`.

  A path under `$CIRCLE` is inside the Circle directory and travels with it; anything else is a shared artifact that stays where it is. That test needs no path literal, and it is the only classification this skill makes. `$STAYS` is what Step 6 warns about: those files remain live and editable during the interruption, and pop will not restore them because the stash never took them.

- **Turn progress.** If `HAS_AGENTSTATE`, read `progress.turn` and `progress.max_turns`.

  ```bash
  if [ "$HAS_AGENTSTATE" = true ]; then
    TURN_N="$(grep -E '^[[:space:]]+turn:' "$WORKBENCH/agentstate.yaml" | head -1 | sed -E 's/.*turn:[[:space:]]*([0-9]+).*/\1/')"
    TURN_MAX="$(grep -E '^[[:space:]]+max_turns:' "$WORKBENCH/agentstate.yaml" | head -1 | sed -E 's/.*max_turns:[[:space:]]*([0-9]+).*/\1/')"
  fi
  ```

- **Git status.**

  ```bash
  GIT_DIRTY_LINES="$(cd "$PROJECT_ROOT" && git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
  HEAD_SHORT="$(cd "$PROJECT_ROOT" && git rev-parse --short HEAD 2>/dev/null)"
  ```

- **Stash id.** The Circle directory is named `YYMMDD-HHMM-<slug>`; the stash id is `YYMMDD-HHMM-<slug>` with the **current** time, so multiple stashes of the same Circle stay distinguishable.

  ```bash
  STASH_TS="$(date +%y%m%d-%H%M)"
  SLUG="$(printf '%s' "$CIRCLE_DIRNAME" | sed -E 's/^[0-9]{6}-[0-9]{4}-//')"
  STASH_ID="${STASH_TS}-${SLUG}"
  STASH_DIR="$STASH_STORE/$STASH_ID"
  ```

## Step 5 — Capture the reason

If the user passed `[reason]` as the skill argument, use it verbatim. Otherwise ask via `AskUserQuestion`:

- Question: *"Wofür schaffst du Platz? Eine Zeile reicht — sie landet im Manifest und in der README des Stashes."*
- Options:
  - **Grund eingeben** (default) — open text; the user types one line.
  - **Überspringen** — proceeds with the literal string `(not specified)`.

Treat the captured text as `REASON`. Strip leading and trailing whitespace.

## Step 6 — Confirm with the user

Present the preview block, action-first:

> **Bereit zum Wegpacken.** Danach ist der Arbeitsbereich frei für die dringende Sache; `/fusion:circle-pop <STASH_ID>` holt alles zurück.
>
> - **Circle:** `<CIRCLE_DIRNAME>` (Datensatz `<CIRCLE_RECORD>`)
> - **Directive:** `<DIRECTIVE_LINE>`
> - **Turn:** `<TURN_N>/<TURN_MAX>` (oder "keine Sitzung im Flug", wenn `HAS_AGENTSTATE=false`)
> - **Wandert mit:** das ganze Circle-Verzeichnis samt Spec, Plan, Issues, Entscheidungen, Protokollen, Reviews und Analysen. Dazu `agentstate.yaml` (falls vorhanden), die Aufgabenliste (falls vorhanden) und der Stand des Dashboards.
> - **Arbeitsbaum:** `<GIT_DIRTY_LINES>` nicht committete Zeile(n), gesichert per `git stash push --include-untracked`.
> - **Stash-Kennung:** `<STASH_ID>`

Add these two lines only when they apply:

- When `$STAYS` is non-empty:

  > - **Bleibt liegen:** `<STAYS>` — liegt in der gemeinsamen Ablage und gehört keinem Circle. Diese Datei wird nicht mitgenommen und beim Zurückholen auch nicht wiederhergestellt; sie bleibt während der Unterbrechung bearbeitbar.

- When the record's marker is not `t`:

  > - **Achtung:** Der Datensatz heißt `<CIRCLE_RECORD>` und trägt damit nicht den Marker für "aktiv", obwohl der Zeiger auf ihn zeigt. Wird unverändert übernommen und zurückgeholt.

Then `AskUserQuestion`:

- Options:
  - **Jetzt wegpacken** (recommended) — proceed with the moves below.
  - **Abbrechen** — exit cleanly; nothing is changed.

If **Abbrechen**, exit. Do NOT mutate anything.

## Step 7 — Execute the moves (order is load-bearing)

The order below is required for crash-recoverability. Each sub-step is independently idempotent; if the skill is interrupted partway, the user can either rerun stash (the `mkdir -p` calls tolerate existing dirs) or reverse the partial move by hand. **Do not re-order these sub-steps.**

### 7.0 — Create the stash skeleton

```bash
mkdir -p "$STASH_DIR/git"
```

### 7.1 — Write the in-progress lock

A `STASH_IN_PROGRESS` file signals to `/fusion:circle-pop` that the stash is half-written and must not be read. Pop refuses such stashes.

```bash
echo "Started: $(date -u +%Y-%m-%dT%H:%M:%S)" > "$STASH_DIR/STASH_IN_PROGRESS"
```

### 7.2 — Copy the root-anchored files

These live at the workbench root because the hooks read them there; they are copied, not moved, until the rest of the move has succeeded (the `rm` comes in 7.7).

```bash
[ "$HAS_AGENTSTATE" = true ] && cp "$WORKBENCH/agentstate.yaml" "$STASH_DIR/agentstate.yaml"
[ -f "$WORKBENCH/orchestrator-live.md" ] && cp "$WORKBENCH/orchestrator-live.md" "$STASH_DIR/orchestrator-live.md"
[ -f "$WORKBENCH/$TASKLIST" ] && cp "$WORKBENCH/$TASKLIST" "$STASH_DIR/tasklist.md"
```

Nothing else is collected. Everything the Circle owns is inside the Circle directory and is captured wholesale by 7.4.

### 7.3 — Append `## Stashed Circle` to the session history file (best-effort)

This runs **before** the Circle moves, because the session's history file lives inside the Circle and travels with it (`rules/fusion-workbench-conventions.md` `## Stashes` → What stash does NOT touch). Appending after the move would either miss the file or write into the stash.

The path is recorded in `agentstate.yaml.session.history_file`; if that is absent or does not resolve, fall back to the newest orchestrator-session log across the stores `$SCAN_HISTORY` names. If neither is found, skip silently — the manifest's `has_agentstate: false` already records the no-session case.

```bash
HIST_FILE=""
if [ "$HAS_AGENTSTATE" = true ]; then HIST_FILE="$(grep -E '^[[:space:]]+history_file:' "$WORKBENCH/agentstate.yaml" | head -1 | sed -E 's/.*history_file:[[:space:]]*"?([^"]+)"?.*/\1/')"; fi
if [ -n "$HIST_FILE" ] && [ -f "$WORKBENCH/$HIST_FILE" ]; then HIST_FILE="$WORKBENCH/$HIST_FILE"; else HIST_FILE=""; fi
if [ -z "$HIST_FILE" ]; then for d in $SCAN_HISTORY; do for f in "$WORKBENCH/$d"/*-orchestrator-session.md; do [ -e "$f" ] || continue; [ -z "$HIST_FILE" ] && HIST_FILE="$f"; [ "$f" -nt "$HIST_FILE" ] && HIST_FILE="$f"; done; done; fi
```

If `$HIST_FILE` resolves to an existing file, append via the `Edit` tool:

```markdown

## Stashed Circle

**Time:** <RFC 3339 UTC timestamp>
**Stash id:** <STASH_ID>
**Reason:** <REASON>

The active Circle was stashed mid-session. Resume with `/fusion:circle-pop <STASH_ID>`.
```

If no history file is found, do not invent one and do not touch the manifest.

### 7.4 — Move the Circle directory into the stash

```bash
mv "$CIRCLE_PATH" "$STASH_DIR/circle"
```

One move, one directory, everything the Circle owns. It is moved rather than copied so the Circle store correctly shows no active Circle while stashed, and so nothing the Circle owns stays behind where the urgent work could edit it. The manifest records the original directory name and the record filename so pop restores both byte-for-byte.

`$STASH_DIR/circle` must not already exist — it cannot, because 7.0 just created its parent and the stash id carries the current minute. If a rerun after a partial failure finds it there, the earlier attempt already moved the Circle; do not move again, and continue from 7.5.

### 7.5 — Clear the active-Circle pointer

```bash
rm -f "$WORKBENCH/.active-circle"
```

Its content is already captured in `CIRCLE_DIRNAME` for the manifest.

### 7.6 — Stash the git working tree

Capture the stash-stack depth before and after the push so we can tell whether `git stash push` actually created an entry — the "no local changes" branch is detected by an unchanged count, not by parsing stdout (which varies by git version).

```bash
STASH_COUNT_BEFORE="$(cd "$PROJECT_ROOT" && git stash list 2>/dev/null | wc -l | tr -d ' ')"
cd "$PROJECT_ROOT" && git stash push --include-untracked -m "fusion:circle-stash $STASH_ID" || true
STASH_COUNT_AFTER="$(cd "$PROJECT_ROOT" && git stash list 2>/dev/null | wc -l | tr -d ' ')"
HEAD_SHORT="$(cd "$PROJECT_ROOT" && git rev-parse --short HEAD 2>/dev/null)"
echo "$HEAD_SHORT" > "$STASH_DIR/git/head"
if [ "$STASH_COUNT_AFTER" = "$STASH_COUNT_BEFORE" ]; then
  GIT_STASH_REF="(no changes)"; GIT_STASH_SHA=""; echo "(no changes)" > "$STASH_DIR/git/stash-ref"
else
  STASH_REF_LINE="$(cd "$PROJECT_ROOT" && git stash list | head -1)"
  echo "$STASH_REF_LINE" > "$STASH_DIR/git/stash-ref"
  GIT_STASH_REF="$(printf '%s' "$STASH_REF_LINE" | sed -E 's/^(stash@\{[0-9]+\}).*/\1/')"
  GIT_STASH_SHA="$(cd "$PROJECT_ROOT" && git rev-parse stash@{0} 2>/dev/null)"
fi
```

Two refs are captured intentionally:

- `GIT_STASH_REF` (the positional `stash@{N}` line) is human-readable and goes into the manifest and README for the user to recognise. Positional refs are unstable — any subsequent `git stash push` during the urgent work renumbers them.
- `GIT_STASH_SHA` (the underlying commit SHA) is stable across renumbering. Pop applies against the SHA, so the right working tree always restores.

If `git stash push` had nothing to save, the count is unchanged: `GIT_STASH_REF` becomes the sentinel `(no changes)` and `GIT_STASH_SHA` stays empty. Pop's apply step skips both branches.

`HEAD_SHORT` is re-captured here (not just at Step 4) to close the race window between the preview and the actual freeze — if a commit happened during the confirmation gate, the manifest records the post-commit hash.

### 7.7 — Delete the now-copied originals

```bash
[ "$HAS_AGENTSTATE" = true ] && rm -f "$WORKBENCH/agentstate.yaml"
[ -f "$WORKBENCH/$TASKLIST" ] && rm -f "$WORKBENCH/$TASKLIST"
```

Do NOT delete `orchestrator-live.md` — 7.8 overwrites it with a stash notice (the monitor reads this file continuously).

### 7.8 — Overwrite the dashboard with a stash notice

Use the `Write` tool to overwrite `$WORKBENCH/orchestrator-live.md`:

```markdown
# Orchestrator — Live

**Status:** Stashed (paused)
**Stashed Circle:** <CIRCLE_DIRNAME>
**Stash id:** <STASH_ID>
**Reason:** <REASON>
**Stashed at:** <RFC 3339 UTC timestamp>

## Current

The workspace is free for urgent work. Run `/fusion:circle-pop <STASH_ID>` to restore the Circle.
```

### 7.9 — Clear the active-session marker

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-session-mark" clear || true
```

Releases the marker so the urgent work's `/fusion:setup` does not see a "running" session and warn.

### 7.10 — Append `## Stashed (paused)` to the record inside the stash

Use the `Edit` tool to append to `$STASH_DIR/circle/$CIRCLE_RECORD` — the record is inside the stash now, not in the Circle store:

```markdown

## Stashed (paused)

**Stashed at:** <RFC 3339 UTC timestamp>
**Stash id:** <STASH_ID>
**Reason:** <REASON>

This Circle was stashed by `/fusion:circle-stash`. The complete state lives in the workbench's stash store under `<STASH_ID>`. Restore with `/fusion:circle-pop <STASH_ID>`.
```

### 7.11 — Write the manifest and README

Build the manifest in bash via a block redirect so every field comes from a real shell variable — no implementer substitution of `<placeholder>` tokens at runtime. The one branch is `git_stash_sha` (quoted SHA vs unquoted `null`).

```bash
STASH_TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
if [ -n "$GIT_STASH_SHA" ]; then SHA_FIELD="\"$GIT_STASH_SHA\""; else SHA_FIELD="null"; fi
if [ "$HAS_AGENTSTATE" = true ]; then AGENTSTATE_FIELD="true"; else AGENTSTATE_FIELD="false"; fi
{
  echo "stash_id: $STASH_ID"
  echo "timestamp: \"$STASH_TIMESTAMP\""
  echo "reason: \"$REASON\""
  echo "original_circle_dirname: \"$CIRCLE_DIRNAME\""
  echo "original_circle_record: \"$CIRCLE_RECORD\""
  echo "active_circle_content: \"$CIRCLE_DIRNAME\""
  echo "head_short_hash: \"$HEAD_SHORT\""
  echo "git_stash_ref: \"$GIT_STASH_REF\""
  echo "git_stash_sha: $SHA_FIELD"
  echo "has_agentstate: $AGENTSTATE_FIELD"
} > "$STASH_DIR/manifest.yaml"
```

The schema is defined in `rules/fusion-workbench-conventions.md` `## Stashes` → Manifest schema; the fields above are that list, in that order. Field semantics:

| Field | Type | When | Notes |
|---|---|---|---|
| `stash_id` | string (unquoted, slug-shape) | always | `YYMMDD-HHMM-<slug>` |
| `timestamp` | quoted RFC 3339 UTC | always | with `Z` |
| `reason` | quoted string | always | `(not specified)` if the user skipped |
| `original_circle_dirname` | quoted string | always | the Circle's directory name — no marker, no `.md` |
| `original_circle_record` | quoted string | always | the record's filename, marker included — pop restores it verbatim |
| `active_circle_content` | quoted string | always | verbatim content of `.active-circle`, which is the directory name |
| `head_short_hash` | quoted string | always | empty quoted string when the project is not a git repo |
| `git_stash_ref` | quoted string | always | positional `stash@{N}`, or the `(no changes)` sentinel |
| `git_stash_sha` | quoted string or `null` | always | underlying commit SHA — load-bearing for pop's apply step |
| `has_agentstate` | unquoted bool | always | `true` when the stash captured a running session |

`has_spec_plan` is **not** written. It used to enumerate spec and plan files copied in from foreign directories; the Circle now contains them, so the field has nothing to enumerate. Pop tolerates it on stashes written by earlier versions.

Use the `Write` tool to create `$STASH_DIR/README.md`, substituting the captured values:

```markdown
# Stash <STASH_ID>

**Stashed:** <STASH_TIMESTAMP>
**Reason:** <REASON>
**Circle:** <CIRCLE_DIRNAME>
**Git stash ref:** <GIT_STASH_REF>

This directory holds the complete frozen state of an active Circle. `circle/` is the Circle
directory verbatim — its record, spec, plan, issues, decisions, history, reviews and analyses.
To restore: run `/fusion:circle-pop <STASH_ID>` from anywhere in the project.

See `manifest.yaml` for the machine-readable index of what's captured here.
```

### 7.12 — Remove the in-progress lock

```bash
rm -f "$STASH_DIR/STASH_IN_PROGRESS"
```

The stash is now complete and poppable.

## Step 8 — Emit the `circle_stashed` event

The event log is root-anchored and append-only across all sessions; touch-or-append, never `>` truncate.

```bash
[ -f "$WORKBENCH/orchestrator-events.jsonl" ] || touch "$WORKBENCH/orchestrator-events.jsonl"
TS="$(date -u +%Y-%m-%dT%H:%M:%S)"
echo "{\"ts\":\"${TS}\",\"event\":\"circle_stashed\",\"stash_id\":\"${STASH_ID}\",\"reason\":\"${REASON}\"}" >> "$WORKBENCH/orchestrator-events.jsonl"
```

## Step 9 — Report to the user

Action-first per `rules/user-facing-output.md`:

> **Weggepackt. Der Arbeitsbereich ist frei.** Fang die dringende Sache in dieser Sitzung an, oder starte mit `/fusion:setup` eine frische. Wenn du so weit bist, holt `/fusion:circle-pop <STASH_ID>` alles zurück.
>
> **Details:**
> - Stash: `<STASH_ID>` im Stash-Speicher der workbench
> - Circle `<CIRCLE_DIRNAME>` liegt vollständig darin — Datensatz, Spec, Plan, Issues, Entscheidungen, Protokolle, Reviews, Analysen
> - Arbeitsbaum: gesichert als `<GIT_STASH_REF>` (oder `(no changes)`, wenn er sauber war)

When `$STAYS` was non-empty, add one line naming those files and stating they stayed in the shared store.

Exit. Do not chain into another command.

## Boundaries

- The skill never writes outside the stash directory, the workbench root files it relocates (`.active-circle`, `agentstate.yaml`, the task queue, `orchestrator-live.md`), the Circle directory it moves out of the Circle store, the event log it appends to, and (when found) the session history file it annotates before the move.
- The skill never touches the shared store. A spec or plan the Circle cites there is named in the preview and left alone.
- The skill never touches `.guard-state/` or truncates the event log — both are root-anchored and project-wide.
- The skill is safe to invoke in any directory inside a fusion workbench tree — `fusion-paths` resolves the root.
- The skill is NOT safe to run concurrently with another orchestrator session against the same workbench. Step 3 catches the most common collision (a running task), but the active-session marker is advisory; the user is responsible for sequencing.

## Tone

User-facing output follows `rules/user-facing-output.md` plus the chat profile for the project's language (`./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`; the language comes from the `**Language:**` line in `CLAUDE.md`). For this skill specifically:

- Every refusal in Steps 1–3 leads with the user action ("Aktiviere zuerst einen mit `/fusion:next`", "Warte, bis die laufende Aufgabe fertig ist") before explaining why.
- The Step 6 preview leads with what the user is about to do, then the details block. No leading metadata.
- The Step 9 report leads with the action that just completed and the next command, then the details.
- Marker syntax stays in filenames; in prose say "aktiver Circle", not "[t] Circle".
