---
name: circle-stash
description: Freeze the complete state of the active Circle (file, pointer, agent state, dashboard, queue, referenced spec/plan, git working tree, bus session) into a self-contained stash directory at fusion-workbench/stashes/<id>/. Use when an urgent interruption demands the workspace and the active Circle must be preserved for later restoration.
argument-hint: "[reason]"
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Fusion — circle-stash (freeze the active Circle)

The user invoked `/fusion:circle-stash [reason]`. This skill freezes the complete state of the currently-active Circle — the Circle file, the `.active-circle` pointer, the orchestrator's in-flight state, the dashboard, the task queue, any referenced spec/plan files, the git working tree, the bus session, and unpaired consultations — into a self-contained directory at `fusion-workbench/stashes/<id>/`. Once stashed, the workspace is free for unrelated urgent work; `/fusion:circle-pop` restores the Circle later.

The skill writes nothing outside `fusion-workbench/stashes/<id>/`, the workbench top-level files it relocates, and a single `circle_stashed` event line at the end of `orchestrator-events.jsonl`. Every mutation is gated by an explicit user confirmation in Step 6.

**Invocation forms:**

- `/fusion:circle-stash` — prompts the user for a one-line reason.
- `/fusion:circle-stash "urgent customer call"` — uses the argument as the reason; still confirms before mutating.

## Step 1 — Pre-flight: locate the workbench

```bash
WORKBENCH="$("$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root" 2>/dev/null)" || WORKBENCH=""
```

If `$WORKBENCH` is empty:

> **No fusion workbench found above $(pwd).** Run `/fusion:setup` at the project root first.

Exit cleanly. Do NOT bootstrap a workbench from here — `/fusion:setup` is the single point of workbench creation.

## Step 2 — Pre-flight: an active Circle must exist

```bash
[ -f "$WORKBENCH/fusion-workbench/.active-circle" ] && [ -s "$WORKBENCH/fusion-workbench/.active-circle" ]
```

If `.active-circle` is absent or empty:

> **There's no active Circle to stash.** Run `/fusion:next` to activate one first, then come back if you still want to stash it.

Exit cleanly.

Read the pointer:

```bash
ACTIVE_CIRCLE_FILENAME="$(cat "$WORKBENCH/fusion-workbench/.active-circle" | head -1 | tr -d '\n')"
ACTIVE_CIRCLE_PATH="$WORKBENCH/fusion-workbench/circles/$ACTIVE_CIRCLE_FILENAME"
```

If the Circle file the pointer cites does not exist on disk:

> **The active Circle pointer is stale.** `.active-circle` points to `<filename>` but that file is not in `fusion-workbench/circles/`. Resolve the pointer mismatch before stashing — `/fusion:next` will reset state if needed.

Exit cleanly.

## Step 3 — Pre-flight: no task may be mid-flight

The binding decision (Fork 1) forbids stashing while an executor is running, so any half-completed task does not get carried into the stash inconsistently.

```bash
if [ -f "$WORKBENCH/fusion-workbench/agentstate.yaml" ]; then
  TASK_STATUS="$(grep -E '^[[:space:]]+status:' "$WORKBENCH/fusion-workbench/agentstate.yaml" | head -1 | sed -E 's/.*status:[[:space:]]*"?([a-z]+)"?.*/\1/')"
else
  TASK_STATUS=""
fi
```

If `TASK_STATUS == "running"`:

> **Wait for the in-flight task to finish, then stash between Turns.** A task is currently running per `agentstate.yaml`; stashing now would freeze a half-completed task. The orchestrator marks tasks `running` only while the executor is mid-edit — it flips back to `queued` or completes within seconds. Try again once the current Turn has reported back.

Exit cleanly.

If `agentstate.yaml` is absent entirely (no orchestrator session running but `.active-circle` exists — Decision Fork 4): continue. The manifest will record `session: none` and the bus-session clear + agentstate copy steps are skipped in Step 7.

Record `HAS_AGENTSTATE`:

```bash
[ -f "$WORKBENCH/fusion-workbench/agentstate.yaml" ] && HAS_AGENTSTATE=true || HAS_AGENTSTATE=false
```

## Step 4 — Build the preview block

Gather the facts to show the user before any mutation runs. None of these reads modify state.

- **Directive line.** Read the `## Directive` section of `$ACTIVE_CIRCLE_PATH` and extract the first non-empty paragraph.

  ```bash
  DIRECTIVE_LINE="$(awk '/^## Directive$/{flag=1; next} /^## /{flag=0} flag && NF' "$ACTIVE_CIRCLE_PATH" | head -1)"
  ```

- **Active spec/plan paths.** Read the `**Active spec/plan:**` frontmatter line. The literal string `(none yet)` means no files to copy.

  ```bash
  SPEC_PLAN_RAW="$(grep -E '^\*\*Active spec/plan:\*\*' "$ACTIVE_CIRCLE_PATH" | head -1 | sed -E 's/^\*\*Active spec/plan:\*\*[[:space:]]*//')"
  ```

  Treat `SPEC_PLAN_RAW == "(none yet)"` as "no files to copy". Otherwise the field is a single path (per the Circle template); split on whitespace or comma if the project's convention has expanded it. Verify each path exists under `$WORKBENCH/fusion-workbench/`; ignore (with a warning to the user) any that do not.

- **Turn progress.** If `HAS_AGENTSTATE`, read `progress.turn` and `progress.max_turns` from `agentstate.yaml`.

  ```bash
  if [ "$HAS_AGENTSTATE" = true ]; then
    TURN_N="$(grep -E '^[[:space:]]+turn:' "$WORKBENCH/fusion-workbench/agentstate.yaml" | head -1 | sed -E 's/.*turn:[[:space:]]*([0-9]+).*/\1/')"
    TURN_MAX="$(grep -E '^[[:space:]]+max_turns:' "$WORKBENCH/fusion-workbench/agentstate.yaml" | head -1 | sed -E 's/.*max_turns:[[:space:]]*([0-9]+).*/\1/')"
  fi
  ```

- **Git status.** Compose a one-liner: `git status --porcelain | wc -l` for the count of uncommitted lines; `git rev-parse --short HEAD` for the head hash.

  ```bash
  GIT_DIRTY_LINES="$(cd "$WORKBENCH" && git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
  HEAD_SHORT="$(cd "$WORKBENCH" && git rev-parse --short HEAD 2>/dev/null)"
  ```

- **Unpaired consultations count.** Only relevant if `bus/` exists. Read `orchestrator-events.jsonl`; count `consultation_filed` (and pre-v3.7.0 `gate_filed_consultation`) events whose `detail.request_path` is not paired with a later `consultation_consumed` / `consultation_cancelled` (or pre-v3.7.0 `gate_consultation_consumed` / `gate_consultation_cancelled`) event referencing the same path.

  ```bash
  if [ -d "$WORKBENCH/fusion-workbench/bus" ] && [ -f "$WORKBENCH/fusion-workbench/orchestrator-events.jsonl" ]; then
    UNPAIRED_CONSULTATIONS="$(python3 -c "
import json,sys
filed={}
paired=set()
for ln in open('$WORKBENCH/fusion-workbench/orchestrator-events.jsonl'):
    try: e=json.loads(ln)
    except: continue
    ev=e.get('event')
    rp=(e.get('detail') or {}).get('request_path')
    if not rp: continue
    if ev in ('consultation_filed','gate_filed_consultation'):
        filed[rp]=ln
    elif ev in ('consultation_consumed','consultation_cancelled','gate_consultation_consumed','gate_consultation_cancelled'):
        paired.add(rp)
print(len([p for p in filed if p not in paired]))
")"
  else
    UNPAIRED_CONSULTATIONS=0
  fi
  ```

- **Stash id.** Derive from the Circle filename's slug. The Circle filename is `YYMMDD-HHMM[t]-<slug>.md`; the stash id is `YYMMDD-HHMM-<slug>` where `YYMMDD-HHMM` is the current time (not the Circle's birth time — multiple stashes against the same Circle remain distinguishable).

  ```bash
  STASH_TS="$(date +%y%m%d-%H%M)"
  SLUG="$(echo "$ACTIVE_CIRCLE_FILENAME" | sed -E 's/^[0-9]{6}-[0-9]{4}\[t\]-(.+)\.md$/\1/')"
  STASH_ID="${STASH_TS}-${SLUG}"
  STASH_DIR="$WORKBENCH/fusion-workbench/stashes/$STASH_ID"
  ```

## Step 5 — Capture the reason

If the user passed `[reason]` as the skill argument, use it verbatim. Otherwise ask via `AskUserQuestion`:

- Question: *"What's the urgent work this stash makes room for? A one-line label is fine — it goes into the manifest and the stash README."*
- Options:
  - **Type a reason** (default) — open-text. Default response field; the user types one line.
  - **Skip** — proceeds with the literal string `(not specified)` as the reason.

Treat the captured text as `REASON`. Strip leading/trailing whitespace.

## Step 6 — Confirm with the user

Present the preview block, action-first:

> **Ready to stash the active Circle.** The workspace will be free for unrelated urgent work; `/fusion:circle-pop <stash-id>` restores everything later.
>
> - **Circle:** `<ACTIVE_CIRCLE_FILENAME>`
> - **Directive:** `<DIRECTIVE_LINE>`
> - **Turn:** `<TURN_N>/<TURN_MAX>` (or "no session in flight" if `HAS_AGENTSTATE=false`)
> - **Files to be moved into the stash:** the Circle file, `agentstate.yaml` (if any), `tasklist.md` (if any), `orchestrator-live.md`, plus any referenced spec/plan paths (`<list-or-"none">`).
> - **Git working tree:** `<GIT_DIRTY_LINES>` uncommitted line(s) will be captured via `git stash push --include-untracked`.
> - **Pending consultations:** `<UNPAIRED_CONSULTATIONS>` unpaired (will be snapshotted into the stash).
> - **Stash id:** `<STASH_ID>` — directory `fusion-workbench/stashes/<STASH_ID>/`.
> - **Reason:** `<REASON>`

Then `AskUserQuestion`:

- Options:
  - **Stash now** (recommended) — proceed with the moves below.
  - **Cancel** — exit cleanly; nothing is changed.

If **Cancel**, exit. Do NOT mutate anything.

## Step 7 — Execute the moves (order is load-bearing)

The order below is required for crash-recoverability. Each step is independently idempotent; if the skill is interrupted partway, the user can either rerun stash (the `mkdir -p` calls tolerate existing dirs) or manually reverse the partial move. **Do not re-order these sub-steps.**

### 7.0 — Create the stash skeleton

```bash
mkdir -p "$STASH_DIR/git" "$STASH_DIR/bus"
```

### 7.1 — Write the in-progress lock

A `STASH_IN_PROGRESS` file in the stash dir signals to `/fusion:circle-pop` that the stash is half-written and must not be read. The pop skill refuses such stashes.

```bash
echo "Started: $(date -u +%Y-%m-%dT%H:%M:%S)" > "$STASH_DIR/STASH_IN_PROGRESS"
```

### 7.2 — Copy `agentstate.yaml`, dashboard, tasklist, spec/plan files

For each file that exists, copy (not move yet — `rm` comes later in 7.7 once the rest of the move has succeeded).

```bash
if [ "$HAS_AGENTSTATE" = true ]; then
  cp "$WORKBENCH/fusion-workbench/agentstate.yaml" "$STASH_DIR/agentstate.yaml"
fi
[ -f "$WORKBENCH/fusion-workbench/orchestrator-live.md" ] && cp "$WORKBENCH/fusion-workbench/orchestrator-live.md" "$STASH_DIR/orchestrator-live.md"
[ -f "$WORKBENCH/fusion-workbench/tasklist.md" ] && cp "$WORKBENCH/fusion-workbench/tasklist.md" "$STASH_DIR/tasklist.md"
```

For each spec/plan path collected in Step 4 (skipping the `(none yet)` placeholder), copy from `$WORKBENCH/fusion-workbench/<path>` into `$STASH_DIR/<basename>`. Record the originating path (relative to `fusion-workbench/`) so pop can copy them back to the right location.

```bash
# For each path in $SPEC_PLAN_PATHS (when not "(none yet)"):
#   cp "$WORKBENCH/fusion-workbench/<path>" "$STASH_DIR/$(basename <path>)"
```

Build the `HAS_SPEC_PLAN_LIST` array of originating paths in memory; written into the manifest in 7.10.

### 7.3 — Move the Circle file into the stash

```bash
mv "$ACTIVE_CIRCLE_PATH" "$STASH_DIR/circle.md"
```

The Circle file is moved (not copied) so `fusion-workbench/circles/` correctly shows no `[t]` Circle while stashed. The manifest records the original filename so pop can restore it byte-for-byte.

### 7.4 — Clear the active-Circle pointer

```bash
rm "$WORKBENCH/fusion-workbench/.active-circle"
```

`.active-circle` content is already captured in `ACTIVE_CIRCLE_FILENAME` for the manifest.

### 7.5 — Stash the git working tree

```bash
cd "$WORKBENCH" && git stash push --include-untracked -m "fusion:circle-stash $STASH_ID"
STASH_REF_LINE="$(cd "$WORKBENCH" && git stash list | head -1)"
echo "$STASH_REF_LINE" > "$STASH_DIR/git/stash-ref"
echo "$HEAD_SHORT" > "$STASH_DIR/git/head"
GIT_STASH_REF="$(echo "$STASH_REF_LINE" | sed -E 's/^(stash@\{[0-9]+\}).*/\1/')"
```

If `git stash push` reports "No local changes to save", the stash entry is not created — record `GIT_STASH_REF` as the literal string `(no changes)` and skip the line write to `stash-ref` (write `(no changes)` instead). This is not an error.

### 7.6 — Clear the bus session and snapshot pending consultations (if bus enabled)

```bash
if [ -d "$WORKBENCH/fusion-workbench/bus" ]; then
  if [ "$HAS_AGENTSTATE" = true ]; then
    BUS_SESSION_ID="$(grep -E '^[[:space:]]+bus_session_id:' "$WORKBENCH/fusion-workbench/agentstate.yaml" | head -1 | sed -E 's/.*bus_session_id:[[:space:]]*"?([^"[:space:]]+)"?.*/\1/')"
    if [ -n "$BUS_SESSION_ID" ] && [ "$BUS_SESSION_ID" != "null" ]; then
      "$FUSION_PLUGIN_ROOT/bin/fusion-bus-session" clear "$BUS_SESSION_ID" || true
    else
      BUS_SESSION_ID=""
    fi
  else
    BUS_SESSION_ID=""
  fi
  # Snapshot the list of unpaired consultations into stash. The event log itself is NOT moved.
  python3 -c "
import json
filed={}
paired=set()
try:
    for ln in open('$WORKBENCH/fusion-workbench/orchestrator-events.jsonl'):
        try: e=json.loads(ln)
        except: continue
        ev=e.get('event')
        rp=(e.get('detail') or {}).get('request_path')
        if not rp: continue
        if ev in ('consultation_filed','gate_filed_consultation'):
            filed[rp]=e
        elif ev in ('consultation_consumed','consultation_cancelled','gate_consultation_consumed','gate_consultation_cancelled'):
            paired.add(rp)
except FileNotFoundError:
    pass
import yaml
out={'bus_session_id': '$BUS_SESSION_ID' or None, 'unpaired_consultations': [filed[p] for p in filed if p not in paired]}
open('$STASH_DIR/bus/snapshot.yaml','w').write(yaml.safe_dump(out, sort_keys=False))
" 2>/dev/null || echo "bus_session_id: null" > "$STASH_DIR/bus/snapshot.yaml"
else
  BUS_SESSION_ID=""
fi
```

If `bus/` does not exist (the workbench has not opted in to the bus protocol): skip every bus-related operation. `BUS_SESSION_ID` stays empty; no `bus/snapshot.yaml` is written; the bus subdirectory of the stash is empty (and harmless).

### 7.7 — Delete the now-copied originals

```bash
[ "$HAS_AGENTSTATE" = true ] && rm "$WORKBENCH/fusion-workbench/agentstate.yaml"
[ -f "$WORKBENCH/fusion-workbench/tasklist.md" ] && rm "$WORKBENCH/fusion-workbench/tasklist.md"
```

Do NOT delete `orchestrator-live.md` — it gets overwritten in 7.8 with a stash notice (the monitor reads this file continuously). Do NOT delete the spec/plan originals in `planning/` — they are shared artifacts that other Circles may reference (binding constraint).

### 7.8 — Overwrite the dashboard with a stash notice

Replace `orchestrator-live.md` with a short notice that names the stash id and the reason, so the monitor and any human inspecting the file knows the Circle is paused.

Use the `Write` tool to overwrite `$WORKBENCH/fusion-workbench/orchestrator-live.md` with:

```markdown
# Orchestrator — Live

**Status:** Stashed (paused)
**Stashed Circle:** <ACTIVE_CIRCLE_FILENAME>
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

### 7.10 — Append a `## Stashed (paused)` section to the Circle file in the stash

Use the `Edit` tool to append (not overwrite) the following block to `$STASH_DIR/circle.md`:

```markdown

## Stashed (paused)

**Stashed at:** <RFC 3339 UTC timestamp>
**Stash id:** <STASH_ID>
**Reason:** <REASON>

This Circle was stashed by `/fusion:circle-stash`. The complete state lives at `fusion-workbench/stashes/<STASH_ID>/`. Restore with `/fusion:circle-pop <STASH_ID>`.
```

### 7.11 — Write the manifest and README

Use the `Write` tool to create `$STASH_DIR/manifest.yaml` with the schema below (substitute the captured values):

```yaml
stash_id: <STASH_ID>
timestamp: "<RFC 3339 UTC, e.g. 2026-05-19T12:00:00Z>"
reason: "<REASON>"
original_circle_filename: "<ACTIVE_CIRCLE_FILENAME>"
active_circle_content: "<ACTIVE_CIRCLE_FILENAME>"
head_short_hash: "<HEAD_SHORT>"
git_stash_ref: "<GIT_STASH_REF or '(no changes)'>"
bus_session_id: <BUS_SESSION_ID or null>
has_agentstate: <true|false>
has_spec_plan:
  - <each path from HAS_SPEC_PLAN_LIST; omit the key's value entirely (use [] inline) if the list is empty>
unpaired_consultations: <UNPAIRED_CONSULTATIONS integer>
```

Quote string values; emit `null` literal (unquoted) for absent `bus_session_id`. The `has_spec_plan` list is YAML's `[]` (inline empty list) when no paths were copied.

Use the `Write` tool to create `$STASH_DIR/README.md` (5–10 lines, plain prose):

```markdown
# Stash <STASH_ID>

**Stashed:** <RFC 3339 UTC timestamp>
**Reason:** <REASON>
**Circle:** <ACTIVE_CIRCLE_FILENAME>
**Git stash ref:** <GIT_STASH_REF or '(no changes)'>

This directory holds the complete frozen state of an active Circle. To restore: run `/fusion:circle-pop <STASH_ID>` from the workbench root.

See `manifest.yaml` for the machine-readable index of what's captured here.
```

### 7.12 — Remove the in-progress lock

```bash
rm "$STASH_DIR/STASH_IN_PROGRESS"
```

The stash is now complete and poppable.

## Step 8 — Emit the `circle_stashed` event

The event log is append-only across all sessions; touch-or-append, never `>` truncate.

```bash
[ -f "$WORKBENCH/fusion-workbench/orchestrator-events.jsonl" ] || touch "$WORKBENCH/fusion-workbench/orchestrator-events.jsonl"
TS="$(date -u +%Y-%m-%dT%H:%M:%S)"
echo "{\"ts\":\"${TS}\",\"event\":\"circle_stashed\",\"stash_id\":\"${STASH_ID}\",\"reason\":\"${REASON}\"}" >> "$WORKBENCH/fusion-workbench/orchestrator-events.jsonl"
```

## Step 9 — Append `## Stashed Circle` to the session history file (best-effort)

If an orchestrator session history file exists at the conventional path, append a brief boundary marker. The path is recorded in `agentstate.yaml.session.history_file`; if `HAS_AGENTSTATE=false`, fall back to the newest file matching `fusion-workbench/history/*-orchestrator-session.md`. If neither is found: skip the append and add a top-level `session_history_file: null` field to the manifest (re-edit `manifest.yaml`) so the audit trail records the omission.

```bash
HIST_FILE=""
if [ "$HAS_AGENTSTATE" = true ]; then
  HIST_FILE="$(grep -E '^[[:space:]]+history_file:' "$STASH_DIR/agentstate.yaml" | head -1 | sed -E 's/.*history_file:[[:space:]]*"?([^"]+)"?.*/\1/')"
fi
if [ -z "$HIST_FILE" ] || [ ! -f "$WORKBENCH/$HIST_FILE" ]; then
  HIST_FILE="$(ls -t "$WORKBENCH/fusion-workbench/history/"*-orchestrator-session.md 2>/dev/null | head -1)"
fi
```

If `$HIST_FILE` resolves to an existing file, append (via the `Edit` tool):

```markdown

## Stashed Circle

**Time:** <RFC 3339 UTC timestamp>
**Stash id:** <STASH_ID>
**Reason:** <REASON>
**Files moved into stash:** <count>

The active Circle was stashed mid-session. Resume with `/fusion:circle-pop <STASH_ID>`.
```

If no history file is found, do not invent one. Edit `$STASH_DIR/manifest.yaml` to add `session_history_file: null` at the bottom.

## Step 10 — Report to the user

Action-first per `rules/user-facing-output.md`:

> **Stashed. The workspace is free.** Start your urgent work in this session, or run `/fusion:setup` to begin a fresh one. When you're ready, `/fusion:circle-pop <STASH_ID>` restores everything.
>
> **Details:**
> - Stash directory: `fusion-workbench/stashes/<STASH_ID>/`
> - Files moved into the stash: `<count>` (Circle file, agent state, dashboard snapshot, queue, plus any spec/plan files)
> - Git working tree: captured as `<GIT_STASH_REF>` (or `(no changes)` if the tree was clean)
> - Bus session: `<cleared <BUS_SESSION_ID> | not enabled | no session>`

Exit. Do not chain into another command.

## Boundaries

- The skill never writes outside `fusion-workbench/stashes/<id>/`, the four top-level workbench files it relocates (`.active-circle`, `agentstate.yaml`, `tasklist.md`, `orchestrator-live.md`), the Circle file it moves out of `circles/`, the event log it appends to, and (when found) the session history file it annotates.
- The skill never deletes spec/plan files in `planning/` — they are shared artifacts; only copies live in the stash.
- The skill is safe to invoke in any directory inside a fusion workbench tree — it resolves the workbench root via `bin/fusion-workbench-root`.
- The skill is NOT safe to run concurrently with another orchestrator session against the same workbench. The pre-flight in Step 3 catches the most common collision (a running task), but the active-session marker is advisory; the user is responsible for sequencing.

## Tone

User-facing output follows `rules/user-facing-output.md`. For this skill specifically:

- Every refusal in Steps 1–3 leads with the user action ("Run `/fusion:next` first", "Wait for the in-flight task to finish") before explaining why.
- The Step 6 confirmation preview leads with what the user is about to do ("Ready to stash"), then the details block. No leading metadata.
- The Step 10 success report leads with the action that just completed ("Stashed. The workspace is free.") and the next-step command, then the details.
- Marker syntax stays in filenames; in prose use "active Circle" rather than "[t] Circle".
