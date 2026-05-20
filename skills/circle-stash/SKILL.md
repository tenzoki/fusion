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
  SPEC_PLAN_RAW="$(grep -E '^\*\*Active spec/plan:\*\*' "$ACTIVE_CIRCLE_PATH" | head -1 | sed -E 's#^\*\*Active spec/plan:\*\*[[:space:]]*##')"
  SPEC_PLAN_PATHS=""
  if [ -n "$SPEC_PLAN_RAW" ] && [ "$SPEC_PLAN_RAW" != "(none yet)" ]; then SPEC_PLAN_PATHS="$(echo "$SPEC_PLAN_RAW" | tr ',' ' ' | xargs -n1 2>/dev/null)"; fi
  ```

  The sed substitution uses `#` as delimiter — the pattern itself contains `/` (in `spec/plan`), which collides with the default `/` delimiter and produces `bad flag in substitute command`. Treat `SPEC_PLAN_RAW == "(none yet)"` as "no files to copy". Otherwise `$SPEC_PLAN_PATHS` is a whitespace-separated list (comma- or space-separated input both work). Verify each path exists under `$WORKBENCH/fusion-workbench/`; ignore (with a warning to the user) any that do not.

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
HAS_SPEC_PLAN_LIST=""
MOVED_COUNT=0
for f in "$WORKBENCH/fusion-workbench/agentstate.yaml" "$WORKBENCH/fusion-workbench/orchestrator-live.md" "$WORKBENCH/fusion-workbench/tasklist.md"; do [ -f "$f" ] && MOVED_COUNT=$((MOVED_COUNT+1)); done
MOVED_COUNT=$((MOVED_COUNT+1))  # the Circle file itself, moved in 7.3
if [ -n "$SPEC_PLAN_PATHS" ]; then
  for rel_path in $SPEC_PLAN_PATHS; do
    src="$WORKBENCH/fusion-workbench/$rel_path"
    if [ -f "$src" ]; then
      cp "$src" "$STASH_DIR/$(basename "$rel_path")"
      HAS_SPEC_PLAN_LIST="${HAS_SPEC_PLAN_LIST}${rel_path}"$'\n'
      MOVED_COUNT=$((MOVED_COUNT+1))
    else
      echo "warning: spec/plan path '$rel_path' referenced by the Circle does not exist under fusion-workbench/; skipping." >&2
    fi
  done
fi
```

`HAS_SPEC_PLAN_LIST` holds the originating paths (one per newline, possibly empty); `MOVED_COUNT` is the running count of files going into the stash. Both feed the manifest in 7.11 and the report in Step 10.

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

Capture the stash-stack depth before and after the push so we can tell whether `git stash push` actually created an entry — the "no local changes" branch is detected by an unchanged count, not by parsing stdout (which varies by git version).

```bash
STASH_COUNT_BEFORE="$(cd "$WORKBENCH" && git stash list 2>/dev/null | wc -l | tr -d ' ')"
cd "$WORKBENCH" && git stash push --include-untracked -m "fusion:circle-stash $STASH_ID" || true
STASH_COUNT_AFTER="$(cd "$WORKBENCH" && git stash list 2>/dev/null | wc -l | tr -d ' ')"
HEAD_SHORT="$(cd "$WORKBENCH" && git rev-parse --short HEAD 2>/dev/null)"
echo "$HEAD_SHORT" > "$STASH_DIR/git/head"
if [ "$STASH_COUNT_AFTER" = "$STASH_COUNT_BEFORE" ]; then
  GIT_STASH_REF="(no changes)"
  GIT_STASH_SHA=""
  echo "(no changes)" > "$STASH_DIR/git/stash-ref"
else
  STASH_REF_LINE="$(cd "$WORKBENCH" && git stash list | head -1)"
  echo "$STASH_REF_LINE" > "$STASH_DIR/git/stash-ref"
  GIT_STASH_REF="$(echo "$STASH_REF_LINE" | sed -E 's/^(stash@\{[0-9]+\}).*/\1/')"
  GIT_STASH_SHA="$(cd "$WORKBENCH" && git rev-parse stash@{0} 2>/dev/null)"
fi
```

Two refs are captured intentionally:

- `GIT_STASH_REF` (the positional `stash@{N}` line) is human-readable and goes into the manifest + README for the user to recognise. Positional refs are unstable — any subsequent `git stash push` (e.g. the user dropping dirty edits during the urgent work) renumbers them.
- `GIT_STASH_SHA` (the underlying commit SHA from `git rev-parse stash@{0}`) is stable across renumbering. Pop applies against the SHA, not the positional ref, so the right working tree always restores.

If `git stash push` had nothing to save, the stash-count is unchanged: `GIT_STASH_REF` is set to the sentinel `(no changes)`, `GIT_STASH_SHA` is empty, and `stash-ref` records the sentinel. Pop's apply-step skips both branches.

`HEAD_SHORT` is re-captured here (not just at Step 4) to close the small race window between the preview and the actual freeze — if a commit happened during the confirmation gate, the manifest records the post-commit hash.

### 7.6 — Clear the bus session and snapshot pending consultations (if bus enabled)

The snapshot is written with pure shell (awk over the JSONL event log) — no Python dependency, no quoting-injection surface on paths or session ids, and any failure is surfaced instead of swallowed.

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
  if [ -n "$BUS_SESSION_ID" ]; then echo "bus_session_id: \"$BUS_SESSION_ID\"" > "$STASH_DIR/bus/snapshot.yaml"; else echo "bus_session_id: null" > "$STASH_DIR/bus/snapshot.yaml"; fi
  EVENTS="$WORKBENCH/fusion-workbench/orchestrator-events.jsonl"
  if [ -f "$EVENTS" ]; then
    UNPAIRED_LINES="$(awk 'BEGIN{FS="\""} { rp=""; ev=""; for (i=1;i<=NF;i++) { if ($i=="event") { ev=$(i+2) } if ($i=="request_path") { rp=$(i+2) } } if (rp=="") next; if (ev=="consultation_filed"||ev=="gate_filed_consultation") { filed[rp]=$0 } else if (ev=="consultation_consumed"||ev=="consultation_cancelled"||ev=="gate_consultation_consumed"||ev=="gate_consultation_cancelled") { paired[rp]=1 } } END { for (p in filed) if (!(p in paired)) print filed[p] }' "$EVENTS")"
    if [ -n "$UNPAIRED_LINES" ]; then
      echo "unpaired_consultations:" >> "$STASH_DIR/bus/snapshot.yaml"
      while IFS= read -r line; do printf '  - %s\n' "$line" >> "$STASH_DIR/bus/snapshot.yaml"; done <<< "$UNPAIRED_LINES"
    else
      echo "unpaired_consultations: []" >> "$STASH_DIR/bus/snapshot.yaml"
    fi
  else
    echo "unpaired_consultations: []" >> "$STASH_DIR/bus/snapshot.yaml"
  fi
else
  BUS_SESSION_ID=""
fi
```

If `bus/` does not exist (the workbench has not opted in to the bus protocol): skip every bus-related operation. `BUS_SESSION_ID` stays empty; no `bus/snapshot.yaml` is written; the bus subdirectory of the stash is empty (and harmless).

Notes on the snapshot format:

- `bus_session_id` is the YAML unquoted literal `null` when there was no session, or a quoted string when there was.
- `unpaired_consultations` is a YAML list of one entry per unpaired event. Each entry is the raw JSON event line embedded as a YAML scalar (block-style `- <line>`). Pop does not currently re-feed these into anything; they're a forensic record. If snapshot parsing is added later, the JSON line is round-trippable.
- The awk parser is tolerant: it extracts `event` and `request_path` by string scanning the quote-delimited JSONL line — robust enough for the orchestrator-emitted shape but not a full JSON parser. Events without both fields are skipped.

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

Build the manifest in bash via heredoc so every field comes from a real shell variable — no implementer-substitution of `<placeholder>` tokens at runtime. Branches for `bus_session_id` (quoted string vs. unquoted `null`), `git_stash_sha` (quoted SHA vs. unquoted `null`), and `has_spec_plan` (inline `[]` vs. YAML list block) are explicit:

```bash
STASH_TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
if [ -n "$BUS_SESSION_ID" ]; then BUS_FIELD="\"$BUS_SESSION_ID\""; else BUS_FIELD="null"; fi
if [ -n "$GIT_STASH_SHA" ]; then SHA_FIELD="\"$GIT_STASH_SHA\""; else SHA_FIELD="null"; fi
if [ "$HAS_AGENTSTATE" = true ]; then AGENTSTATE_FIELD="true"; else AGENTSTATE_FIELD="false"; fi
{
  echo "stash_id: $STASH_ID"
  echo "timestamp: \"$STASH_TIMESTAMP\""
  echo "reason: \"$REASON\""
  echo "original_circle_filename: \"$ACTIVE_CIRCLE_FILENAME\""
  echo "active_circle_content: \"$ACTIVE_CIRCLE_FILENAME\""
  echo "head_short_hash: \"$HEAD_SHORT\""
  echo "git_stash_ref: \"$GIT_STASH_REF\""
  echo "git_stash_sha: $SHA_FIELD"
  echo "bus_session_id: $BUS_FIELD"
  echo "has_agentstate: $AGENTSTATE_FIELD"
  if [ -z "$HAS_SPEC_PLAN_LIST" ]; then echo "has_spec_plan: []"; else echo "has_spec_plan:"; while IFS= read -r p; do [ -n "$p" ] && printf '  - "%s"\n' "$p"; done <<< "$HAS_SPEC_PLAN_LIST"; fi
  echo "unpaired_consultations: ${UNPAIRED_CONSULTATIONS:-0}"
} > "$STASH_DIR/manifest.yaml"
```

The resulting `manifest.yaml` is a twelve-field index. Field semantics:

| Field | Type | When | Notes |
|---|---|---|---|
| `stash_id` | string (unquoted, slug-shape) | always | `YYMMDD-HHMM-<slug>` |
| `timestamp` | quoted RFC 3339 UTC | always | with `Z` |
| `reason` | quoted string | always | `(not specified)` if user skipped |
| `original_circle_filename` | quoted string | always | the file under `circles/` before move |
| `active_circle_content` | quoted string | always | same as filename — content of `.active-circle` |
| `head_short_hash` | quoted string | always | empty quoted string if workbench is not a git repo |
| `git_stash_ref` | quoted string | always | positional `stash@{N}` line, or `(no changes)` sentinel |
| `git_stash_sha` | quoted string or `null` | always | underlying commit SHA — load-bearing for pop's apply step |
| `bus_session_id` | quoted string or `null` | always | unquoted `null` literal when bus disabled or no session |
| `has_agentstate` | unquoted bool | always | `true` when stash captured a running session |
| `has_spec_plan` | inline `[]` or YAML list | always | one quoted path per entry under `fusion-workbench/` |
| `unpaired_consultations` | unquoted integer | always | count, not the list (the list lives in `bus/snapshot.yaml`) |

Use the `Write` tool to create `$STASH_DIR/README.md` (5–10 lines, plain prose) — substitute the captured values:

```markdown
# Stash <STASH_ID>

**Stashed:** <STASH_TIMESTAMP>
**Reason:** <REASON>
**Circle:** <ACTIVE_CIRCLE_FILENAME>
**Git stash ref:** <GIT_STASH_REF>

This directory holds the complete frozen state of an active Circle. To restore: run `/fusion:circle-pop <STASH_ID>` from the workbench root.

See `manifest.yaml` for the machine-readable index of what's captured here.
```

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

If an orchestrator session history file exists at the conventional path, append a brief boundary marker. The path is recorded in `agentstate.yaml.session.history_file`; if `HAS_AGENTSTATE=false`, fall back to the newest file matching `fusion-workbench/history/*-orchestrator-session.md`. If neither is found: skip the append silently — the manifest's `has_agentstate: false` already records the no-session case.

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

If no history file is found, do not invent one and do not touch the manifest. The manifest's `has_agentstate` flag already captures whether the stash was taken inside a running session.

## Step 10 — Report to the user

Action-first per `rules/user-facing-output.md`:

> **Stashed. The workspace is free.** Start your urgent work in this session, or run `/fusion:setup` to begin a fresh one. When you're ready, `/fusion:circle-pop <STASH_ID>` restores everything.
>
> **Details:**
> - Stash directory: `fusion-workbench/stashes/<STASH_ID>/`
> - Files moved into the stash: `<MOVED_COUNT>` (Circle file, agent state, dashboard snapshot, queue, plus any spec/plan files)
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
