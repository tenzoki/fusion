---
name: circle-pop
description: Restore a stashed Circle from fusion-workbench/stashes/<id>/, with HEAD-hash drift detection and per-file conflict resolution for any spec/plan that diverged during the interruption. Pairs with /fusion:circle-stash.
argument-hint: "[stash-id]"
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Fusion — circle-pop (restore a stashed Circle)

The user invoked `/fusion:circle-pop [stash-id]`. This skill restores the complete state of a previously-stashed Circle into the workbench — the Circle file goes back to `circles/`, `.active-circle` is rewritten, `agentstate.yaml` is restored (when the stash carried one), and the git working tree is re-applied via `git stash apply` (not `pop` — the stash entry is preserved until the user explicitly drops it).

The skill mutates state only after the user explicitly confirms in Step 5. Until then it is read-only.

**Invocation forms:**

- `/fusion:circle-pop` — discovers stashes; if exactly one is poppable, defaults to it; if multiple, asks the user to pick.
- `/fusion:circle-pop 260519-1200-stash-smoke` — explicit stash id (the directory name under `fusion-workbench/stashes/`).

## Step 1 — Pre-flight: locate the workbench

```bash
WORKBENCH="$("$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root" 2>/dev/null)" || WORKBENCH=""
```

If `$WORKBENCH` is empty:

> **No fusion workbench found above $(pwd).** Run `/fusion:setup` at the project root first.

Exit cleanly.

## Step 2 — Stash discovery

A stash is "poppable" if its directory exists under `$WORKBENCH/fusion-workbench/stashes/`, contains a readable `manifest.yaml`, and does NOT contain a `STASH_IN_PROGRESS` lock file (a lock file means the stash was written incompletely; pop refuses).

### 2a — Explicit `[stash-id]` argument

If the user passed an argument:

```bash
STASH_ID="<argument verbatim>"
STASH_DIR="$WORKBENCH/fusion-workbench/stashes/$STASH_ID"
```

Validate:

- If `$STASH_DIR` does not exist:

  > **Stash not found.** No directory at `fusion-workbench/stashes/<STASH_ID>/`. List available stashes with `ls fusion-workbench/stashes/`.

  Exit cleanly.

- If `$STASH_DIR/STASH_IN_PROGRESS` exists:

  > **The stash is incomplete.** A `STASH_IN_PROGRESS` lock file is present at `fusion-workbench/stashes/<STASH_ID>/`; the stash was not finished writing. To recover: inspect the directory manually, then either `rm -rf` it or remove the lock file once you've verified the contents are intact.

  Exit cleanly.

- If `$STASH_DIR/manifest.yaml` is missing or unreadable:

  > **The stash manifest is unreadable.** `fusion-workbench/stashes/<STASH_ID>/manifest.yaml` is missing or cannot be parsed. The stash directory may be corrupt; inspect it manually before restoring.

  Exit cleanly.

Otherwise proceed to Step 3 with `STASH_ID` set.

### 2b — No argument (discovery mode)

Enumerate candidate stashes:

```bash
STASHES_DIR="$WORKBENCH/fusion-workbench/stashes"
if [ ! -d "$STASHES_DIR" ]; then
  echo "no-stashes"
else
  for d in "$STASHES_DIR"/*/; do
    [ -d "$d" ] || continue
    [ -f "$d/manifest.yaml" ] || continue
    [ -f "$d/STASH_IN_PROGRESS" ] && continue
    basename "$d"
  done
fi
```

Branch on the count of candidates:

- **Zero candidates:**

  > **No stashes available to pop.** Either nothing has been stashed yet, or every stash directory is incomplete (carries a `STASH_IN_PROGRESS` lock). Run `/fusion:circle-stash [reason]` to freeze an active Circle first, or inspect `fusion-workbench/stashes/` to find incomplete stashes.

  Exit cleanly.

- **One candidate:** default to it. Print the choice so the user can see what's about to happen:

  > **One stash available — defaulting to it.** Restoring `<STASH_ID>`.

  Set `STASH_ID` and proceed.

- **Multiple candidates:** use `AskUserQuestion` to let the user pick. For each candidate, read `manifest.yaml` and surface `timestamp` + `reason` alongside the id.

  - Question: *"Pick a stash to restore. There are `<N>` poppable stashes in `fusion-workbench/stashes/`."*
  - Options: one per candidate, formatted as `<STASH_ID> — <reason> (stashed <timestamp>)`. Add a final **Cancel** option.

  If the user picks **Cancel**, exit cleanly with no state change. Otherwise set `STASH_ID` to the chosen id and proceed.

## Step 3 — Pre-flight: workspace must be free

Two distinct refusals; the user needs to know which condition tripped.

### 3a — `.active-circle` already exists

```bash
[ -f "$WORKBENCH/fusion-workbench/.active-circle" ] && [ -s "$WORKBENCH/fusion-workbench/.active-circle" ]
```

If true:

> **The workspace already has an active Circle.** `.active-circle` points to `<contents>`. Close the current Circle, accept what's been learned and end the session (Bounded Closure), or stash it with `/fusion:circle-stash` before popping `<STASH_ID>` — pop refuses to overwrite an in-flight active Circle.

Exit cleanly.

### 3b — `agentstate.yaml` already exists

```bash
[ -f "$WORKBENCH/fusion-workbench/agentstate.yaml" ]
```

If true:

> **A session is in flight.** `agentstate.yaml` exists in the workbench — the orchestrator is mid-session (or was, and the file was not cleaned up). Exit that session cleanly (let it run to completion, accept Bounded Closure, or restart) before popping `<STASH_ID>`. Pop refuses to overlay a stashed session over a live one.

Exit cleanly.

## Step 4 — Drift detection (warning, not blocker)

Per Decision Fork 6, the only drift signal computed is the HEAD short-hash delta and the list of stashed-path-touching commits.

Parse the manifest:

```bash
STASH_HEAD="$(grep -E '^head_short_hash:' "$STASH_DIR/manifest.yaml" | head -1 | sed -E 's/^head_short_hash:[[:space:]]*"?([^"[:space:]]+)"?.*/\1/')"
CURRENT_HEAD="$(cd "$WORKBENCH" && git rev-parse --short HEAD 2>/dev/null)"
```

If `STASH_HEAD == CURRENT_HEAD`: skip the warning block entirely; HEAD has not moved.

Otherwise compute the drift summary:

```bash
COMMIT_DELTA="$(cd "$WORKBENCH" && git rev-list --count "${STASH_HEAD}..HEAD" 2>/dev/null)"
# For each path in manifest's has_spec_plan list:
#   git log "${STASH_HEAD}..HEAD" --oneline -- "<path>"
```

Present the drift as a warning block before the confirmation gate, action-first:

> **HEAD has moved since this Circle was stashed — review before restoring.**
>
> - **At stash time:** `<STASH_HEAD>`
> - **Now:** `<CURRENT_HEAD>`
> - **Commits since:** `<COMMIT_DELTA>`
> - **Stashed paths touched by those commits:**
>   - `<path>` — `<commit list, one-line each, or "no changes">`
>   - …
>
> Restoring with drift present is supported (the stashed spec/plan files will be offered alongside their current versions in Step 6, per file). This warning is informational — proceed if you have inspected the commits and they look compatible.

If no `has_spec_plan` paths are listed, omit the "Stashed paths touched" sub-block.

## Step 5 — Confirmation gate

`AskUserQuestion`:

- Question: *"Restore stash `<STASH_ID>`? <one-line summary: reason + timestamp from manifest>"*
- Options:
  - **Restore anyway** (recommended, default) — proceed with the moves in Step 6.
  - **Cancel** — exit cleanly; nothing is changed.
  - **Inspect first** — print the stash directory tree (`ls -R "$STASH_DIR"`) and the full `manifest.yaml` contents, then re-ask this question with the same three options.

The Inspect-first branch loops back to the same prompt; it does not advance. After two consecutive inspects, lead with a hint: *"Inspect again, or pick Restore/Cancel."*

## Step 6 — Restore in reverse-stash order

Each sub-step is independently idempotent on retry. Do not re-order; the order mirrors the stash sequence in reverse so partial-failure recovery stays predictable.

Parse the rest of the manifest into variables:

```bash
ORIGINAL_FILENAME="$(grep -E '^original_circle_filename:' "$STASH_DIR/manifest.yaml" | head -1 | sed -E 's/^original_circle_filename:[[:space:]]*"?([^"]+)"?.*/\1/')"
ACTIVE_CONTENT="$(grep -E '^active_circle_content:' "$STASH_DIR/manifest.yaml" | head -1 | sed -E 's/^active_circle_content:[[:space:]]*"?([^"]+)"?.*/\1/')"
GIT_STASH_REF="$(grep -E '^git_stash_ref:' "$STASH_DIR/manifest.yaml" | head -1 | sed -E 's/^git_stash_ref:[[:space:]]*"?([^"]+)"?.*/\1/')"
GIT_STASH_SHA="$(grep -E '^git_stash_sha:' "$STASH_DIR/manifest.yaml" | head -1 | sed -E 's/^git_stash_sha:[[:space:]]*"?([^"[:space:]]+)"?.*/\1/')"
if [ "$GIT_STASH_SHA" = "null" ]; then GIT_STASH_SHA=""; fi
HAS_AGENTSTATE="$(grep -E '^has_agentstate:' "$STASH_DIR/manifest.yaml" | head -1 | sed -E 's/^has_agentstate:[[:space:]]*([a-z]+).*/\1/')"
MANIFEST_BUS_SESSION_ID="$(grep -E '^bus_session_id:' "$STASH_DIR/manifest.yaml" | head -1 | sed -E 's/^bus_session_id:[[:space:]]*"?([^"[:space:]]+)"?.*/\1/')"
if [ "$MANIFEST_BUS_SESSION_ID" = "null" ]; then MANIFEST_BUS_SESSION_ID=""; fi
SPEC_PLAN_PATHS="$(awk '/^has_spec_plan:/{f=1; next} /^[^[:space:]-]/{f=0} f && /^[[:space:]]+- /{sub(/^[[:space:]]+- ?/, ""); gsub(/^"|"$/, ""); print}' "$STASH_DIR/manifest.yaml")"
```

`SPEC_PLAN_PATHS` is a newline-separated list of originating paths (possibly empty); each path is unquoted. The awk parser enters the `has_spec_plan:` block, emits one line per `  - "<path>"` entry, and exits the block on the next non-indented key. Inline `has_spec_plan: []` produces an empty result.

### 6.1 — Move the Circle file back

Refuse if a Circle file with the same name already exists in `circles/` — `mv` would silently overwrite. The Step 3a pre-flight catches the `.active-circle` case, but a same-named anticipated `[a]` or closed `[c]` Circle can collide here.

```bash
mkdir -p "$WORKBENCH/fusion-workbench/circles"
DEST_CIRCLE="$WORKBENCH/fusion-workbench/circles/$ORIGINAL_FILENAME"
if [ -e "$DEST_CIRCLE" ]; then echo "ERROR: A Circle file named $ORIGINAL_FILENAME already exists in fusion-workbench/circles/. Move it aside (e.g. rename or archive), then re-run /fusion:circle-pop $STASH_ID. Pop will not silently overwrite it." >&2; exit 1; fi
mv "$STASH_DIR/circle.md" "$DEST_CIRCLE"
```

If the refusal triggers, the stash directory is left untouched — the user can move the conflicting Circle aside and rerun pop with the same stash id.

### 6.2 — Restore `.active-circle`

```bash
echo "$ACTIVE_CONTENT" > "$WORKBENCH/fusion-workbench/.active-circle"
```

### 6.3 — Restore `agentstate.yaml` (if the stash carried one)

If `HAS_AGENTSTATE == true`:

```bash
cp "$STASH_DIR/agentstate.yaml" "$WORKBENCH/fusion-workbench/agentstate.yaml"
```

If `HAS_AGENTSTATE != true`: skip. The popped session has no in-flight state; `/fusion:setup` will create a fresh one on next run (Decision Fork 4).

### 6.4 — Register a fresh bus session (if bus is enabled and stash had one)

If `fusion-bus-session register` returns empty (binary missing, registration failed), do NOT patch the field with an empty string — write the unquoted YAML literal `null` instead. An empty quoted string `""` corrupts the bus-aware code paths in the orchestrator, which treat it as a valid session id.

```bash
NEW_BUS_ID=""
if [ -d "$WORKBENCH/fusion-workbench/bus" ] && [ -n "$MANIFEST_BUS_SESSION_ID" ]; then
  if [ -f "$WORKBENCH/fusion-workbench/agentstate.yaml" ]; then
    NEW_BUS_ID="$("$FUSION_PLUGIN_ROOT/bin/fusion-bus-session" register orchestrator 2>/dev/null)"
    if [ -n "$NEW_BUS_ID" ]; then
      sed -i.bak -E "s|^([[:space:]]+bus_session_id:[[:space:]]*).*$|\\1\"$NEW_BUS_ID\"|" "$WORKBENCH/fusion-workbench/agentstate.yaml"
      rm -f "$WORKBENCH/fusion-workbench/agentstate.yaml.bak"
    else
      sed -i.bak -E "s|^([[:space:]]+bus_session_id:[[:space:]]*).*$|\\1null|" "$WORKBENCH/fusion-workbench/agentstate.yaml"
      rm -f "$WORKBENCH/fusion-workbench/agentstate.yaml.bak"
      echo "WARNING: bus session registration failed; agentstate.yaml bus_session_id set to null. The next /fusion:setup will register a fresh session." >&2
    fi
  fi
fi
```

If `agentstate.yaml` was not restored (Step 6.3 skipped), skip this — there's no field to patch. If `bus/` does not exist, skip — the workbench has not opted in to the bus protocol.

### 6.5 — Restore `tasklist.md` and `orchestrator-live.md`

```bash
[ -f "$STASH_DIR/tasklist.md" ] && cp "$STASH_DIR/tasklist.md" "$WORKBENCH/fusion-workbench/tasklist.md"
[ -f "$STASH_DIR/orchestrator-live.md" ] && cp "$STASH_DIR/orchestrator-live.md" "$WORKBENCH/fusion-workbench/orchestrator-live.md"
```

`orchestrator-live.md` was overwritten with a stash notice at stash time; the snapshot in the stash carries the true pre-stash dashboard state, which is what we want to restore. `/fusion:setup` will refresh it again on the next session start.

### 6.6 — Restore spec/plan files (per-file conflict resolution)

Iterate the `$SPEC_PLAN_PATHS` list parsed at the top of Step 6. The loop branches per file into copy-silently, no-op, or `AskUserQuestion`-prompted-overwrite.

```bash
CONFLICT_COUNT=0
RESOLVED_FILES=""
if [ -n "$SPEC_PLAN_PATHS" ]; then
  while IFS= read -r rel_path; do
    [ -z "$rel_path" ] && continue
    DEST="$WORKBENCH/fusion-workbench/$rel_path"
    STASHED="$STASH_DIR/$(basename "$rel_path")"
    if [ ! -f "$STASHED" ]; then echo "warning: stash is missing $(basename "$rel_path") for path $rel_path; skipping." >&2; continue; fi
    DEST_DIR="$(dirname "$DEST")"
    mkdir -p "$DEST_DIR"
    if [ ! -e "$DEST" ]; then
      cp "$STASHED" "$DEST"
      RESOLVED_FILES="${RESOLVED_FILES}${rel_path} (restored — destination was absent); "
    elif cmp -s "$STASHED" "$DEST"; then
      :  # byte-identical, no-op
    else
      # AskUserQuestion gates the overwrite. The skill body issues the question; the loop receives the user's choice.
      # Question: "Spec/plan file <rel_path> changed during the interruption. Which version should win?"
      # Options: Overwrite (use the stashed version) | Keep current | Show diff (loops)
      # On Overwrite: cp "$STASHED" "$DEST"; RESOLVED_FILES="${RESOLVED_FILES}${rel_path} (overwrote with stashed version); "
      # On Keep current: leave DEST; RESOLVED_FILES="${RESOLVED_FILES}${rel_path} (kept current version); "
      # On Show diff: run `diff -u "$DEST" "$STASHED"` and re-ask the same question.
      CONFLICT_COUNT=$((CONFLICT_COUNT+1))
    fi
  done <<< "$SPEC_PLAN_PATHS"
fi
```

Three cases the loop body covers explicitly:

- **DEST does not exist.** Copy without prompting (the urgent work removed the file or never touched it; the stash version is the only candidate).
- **DEST exists and is byte-identical to STASHED.** No-op. `cmp -s` is the byte-identity test.
- **DEST exists and differs from STASHED.** Use `AskUserQuestion` to gate the resolution:
  - Question: *"Spec/plan file `<rel_path>` changed during the interruption. Which version should win?"*
  - Options:
    - **Overwrite (use the stashed version)** — the version the Circle was paused against. `cp "$STASHED" "$DEST"`.
    - **Keep current (the version the urgent work edited)** — leave `DEST` unchanged. The popped Circle resumes against the drifted spec; orchestrator's Coherence check will catch any inconsistency.
    - **Show diff** — runs `diff -u "$DEST" "$STASHED"` and re-asks this same question.
  - Loop on **Show diff** as many times as the user wants; advance on **Overwrite** or **Keep current**. Each resolved file appends to `RESOLVED_FILES` so the report and the appended Resumed-from-stash block can name what was decided.

If the manifest's `has_spec_plan` was empty (the parsed `$SPEC_PLAN_PATHS` is empty), the whole loop is skipped — `CONFLICT_COUNT` stays 0 and `RESOLVED_FILES` stays empty.

### 6.7 — Apply the git stash (NOT pop)

Apply against the stable commit SHA (`$GIT_STASH_SHA`) when available — positional refs like `stash@{0}` are renumbered by any intervening `git stash push` during the urgent work, and applying the wrong positional ref silently restores unrelated content. The SHA in the manifest is captured at stash time and never moves.

```bash
APPLY_TARGET=""
if [ -n "$GIT_STASH_SHA" ]; then APPLY_TARGET="$GIT_STASH_SHA"; elif [ -n "$GIT_STASH_REF" ] && [ "$GIT_STASH_REF" != "(no changes)" ]; then APPLY_TARGET="$GIT_STASH_REF"; fi
if [ -n "$APPLY_TARGET" ]; then
  cd "$WORKBENCH" && git stash apply "$APPLY_TARGET"
fi
```

If the manifest carries no `git_stash_sha` (stashes written before H3 fix, or `(no changes)` stash), fall back to the positional ref. If neither is usable (the `(no changes)` sentinel), skip the apply entirely.

`git stash apply` (not `pop`) is a binding constraint — the stash entry stays in `git stash list` until the user explicitly drops it. If `git stash apply` reports merge conflicts:

> **The git stash apply produced conflicts.** Resolve them manually before continuing. The stashed working tree has been applied on top of the current HEAD; `git status` will show the conflicted files. Do NOT `git stash drop` until you have either resolved or discarded the conflicting changes — the stash entry is your safety net.

Surface the conflicts; do NOT auto-revert. The Circle file is already moved back to `circles/`, so the user can inspect the popped Circle alongside the conflict.

### 6.8 — Write a fresh active-session marker

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-session-mark" write fusion:orchestrator || true
```

Tolerate non-zero exit (the helper writes the marker; `/fusion:setup` writes another if needed).

### 6.9 — Append `## Resumed from stash` to the Circle file

Use the `Edit` tool to append the following block to `$WORKBENCH/fusion-workbench/circles/$ORIGINAL_FILENAME`:

```markdown

## Resumed from stash

**Resumed at:** <RFC 3339 UTC timestamp>
**Stash id:** <STASH_ID>
**Drift summary:** HEAD at stash `<STASH_HEAD>` → now `<CURRENT_HEAD>` (<COMMIT_DELTA> commits since); `<RESOLVED_FILES — semicolon-separated list of per-file decisions, or "no conflicts">`.
**Git stash apply:** `<clean | conflicts surfaced — see message above>`
```

Substitute the resolved values from Step 4 and Step 6.6. `RESOLVED_FILES` is the accumulator built by the conflict loop above; if empty, render as `no conflicts`.

## Step 7 — Emit the `circle_popped` event

```bash
[ -f "$WORKBENCH/fusion-workbench/orchestrator-events.jsonl" ] || touch "$WORKBENCH/fusion-workbench/orchestrator-events.jsonl"
TS="$(date -u +%Y-%m-%dT%H:%M:%S)"
echo "{\"ts\":\"${TS}\",\"event\":\"circle_popped\",\"stash_id\":\"${STASH_ID}\"}" >> "$WORKBENCH/fusion-workbench/orchestrator-events.jsonl"
```

## Step 8 — Report to the user

Action-first per `rules/user-facing-output.md`:

> **Circle restored.** Run `/fusion:setup` to resume — the interrupted-session prompt will offer to continue from where you left off.
>
> **Note:** The stash directory was not deleted (mirrors `git stash apply` behaviour). To prune: `rm -rf fusion-workbench/stashes/<STASH_ID>/ && git stash drop <GIT_STASH_REF>`.
>
> **Details:**
> - Circle file: `fusion-workbench/circles/<ORIGINAL_FILENAME>`
> - Active-Circle pointer: restored
> - Agent state: `<restored | not in stash (no session)>`
> - Bus session: `<re-registered as <NEW_BUS_ID> | bus not enabled | stash had no session>`
> - Git stash: applied (entry kept at `<GIT_STASH_REF>`)
> - Spec/plan conflicts resolved: `<count, or "no conflicts">`

Exit. Do not chain into `/fusion:setup` automatically — the user runs that themselves so the interrupted-session prompt is visible and the user picks Continue / Restart / Modify deliberately.

## Boundaries

- The skill mutates state only inside Step 6 and the event-log append in Step 7. Steps 1–5 are read-only.
- The skill never deletes the stash directory. The final message tells the user the exact prune command; deletion is the user's call.
- The skill never auto-resolves a `git stash apply` conflict — the user fixes it manually.
- The skill never overwrites a spec/plan file silently when it differs from the stashed version — every differing file is gated by an explicit `AskUserQuestion`.
- The skill never `git stash pop`s — only `git stash apply`. The stash entry stays in `git stash list` until the user explicitly drops it.

## Tone

User-facing output follows `rules/user-facing-output.md`. For this skill specifically:

- Refusals in Steps 1–3 lead with the user action ("Close the current Circle first", "Exit the in-flight session") before explaining why.
- The drift warning in Step 4 leads with "HEAD has moved" and surfaces the actionable bits (commit delta, paths touched) before any meta-commentary.
- The per-file conflict prompt in 6.6 names the file path and asks one clear question per file. Use the file's basename in the question text when the path is long.
- The Step 8 success report leads with "Circle restored" and the next command (`/fusion:setup`), then the prune-command hint, then trailing details.
- Marker syntax stays in filenames; in prose use "active Circle" rather than "[t] Circle".
