---
name: circle-pop
description: Restore a stashed Circle into the workbench, with HEAD-hash drift detection. Pairs with /fusion:circle-stash.
argument-hint: "[stash-id]"
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Fusion — circle-pop (restore a stashed Circle)

The user invoked `/fusion:circle-pop [stash-id]`. This skill restores the complete state of a previously-stashed Circle — the Circle directory goes back to the Circle store, `.active-circle` is rewritten, `agentstate.yaml` is restored (when the stash carried one), and the git working tree is re-applied via `git stash apply` (not `pop` — the stash entry is preserved until the user explicitly drops it).

**The Circle travels as a directory, and that is what makes restoring it simple.** Everything the Circle owns — record, spec, plan, issues, decisions, history, reviews, analyses — went into the stash inside `circle/` and was absent from the workbench for the whole interruption. Nothing could edit it, so nothing can have diverged, and there is no per-file merge to negotiate. The one collision still possible is a Circle directory of the same name having appeared meanwhile; 6.1 refuses on it rather than merging.

The skill mutates state only after the user explicitly confirms in Step 5. Until then it is read-only.

**Invocation forms:**

- `/fusion:circle-pop` — discovers stashes; if exactly one is poppable, defaults to it; if multiple, asks the user to pick.
- `/fusion:circle-pop 260519-1200-stash-smoke` — explicit stash id (the directory name in the stash store).

## Step 1 — Pre-flight: resolve paths

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" circle-pop
```

Hold the emitted `KEY=value` values. `$WORKBENCH` is absolute; every other value is workbench-relative. On a non-zero exit, read the code — it says whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes):

- **Exit 1** — no workbench above `pwd`. Halt:

  > *Keine fusion-workbench über `$(pwd)` gefunden. Führe zuerst `/fusion:setup` im Projektwurzelverzeichnis aus.*

  Exit cleanly.

- **Exit 3** — `.active-circle` is orphaned or corrupt. The workbench state is inconsistent. Report the resolver's stderr verbatim and tell the user to fix or delete the pointer. Do not proceed: pop is about to write that pointer, and it will not do so over a state it does not understand.

- **Exit 4** — an internal error in `fusion-paths`. The user's workbench is fine; do **not** send them to check `.active-circle`. Report it as a fusion bug and stop.

Derive the git root and the stash store — every git command in this skill runs at the project root, not inside the workbench:

```bash
PROJECT_ROOT="$(dirname "$WORKBENCH")"
STASH_STORE="$WORKBENCH/stashes"
```

## Step 2 — Stash discovery

A stash is "poppable" if its directory exists in the stash store, contains a readable `manifest.yaml`, and does NOT contain a `STASH_IN_PROGRESS` lock file (a lock means the stash was written incompletely; pop refuses).

### 2a — Explicit `[stash-id]` argument

```bash
STASH_ID="<argument verbatim>"
STASH_DIR="$STASH_STORE/$STASH_ID"
```

Validate:

- If `$STASH_DIR` does not exist:

  > **Stash nicht gefunden.** Im Stash-Speicher der workbench gibt es kein Verzeichnis `<STASH_ID>`. Ruf `/fusion:circle-pop` ohne Argument auf — dann listet es dir, was da ist.

  Exit cleanly.

- If `$STASH_DIR/STASH_IN_PROGRESS` exists:

  > **Der Stash ist unvollständig.** Er trägt noch die Sperrdatei `STASH_IN_PROGRESS`, das Wegpacken wurde also nie fertig. So kommst du weiter: sieh dir das Verzeichnis an, und lösch es entweder ganz oder entferne die Sperrdatei, sobald du geprüft hast, dass der Inhalt vollständig ist.

  Exit cleanly.

- If `$STASH_DIR/manifest.yaml` is missing or unreadable:

  > **Das Manifest des Stashes ist nicht lesbar.** `manifest.yaml` fehlt in `<STASH_ID>` oder lässt sich nicht auswerten. Das Verzeichnis ist womöglich beschädigt — sieh es dir an, bevor du zurückholst.

  Exit cleanly.

Otherwise proceed to Step 3 with `STASH_ID` set.

### 2b — No argument (discovery mode)

```bash
CANDIDATES=""
if [ -d "$STASH_STORE" ]; then while IFS= read -r d; do [ -f "$d/manifest.yaml" ] || continue; [ -f "$d/STASH_IN_PROGRESS" ] && continue; CANDIDATES="$CANDIDATES $(basename "$d")"; done < <(find "$STASH_STORE" -mindepth 1 -maxdepth 1 -type d); fi
```

Branch on the count:

- **Zero candidates:**

  > **Es gibt nichts zum Zurückholen.** Entweder wurde noch nie etwas weggepackt, oder jeder Stash ist unvollständig (trägt die Sperrdatei `STASH_IN_PROGRESS`). Mit `/fusion:circle-stash [Grund]` packst du einen aktiven Circle weg.

  Exit cleanly.

- **One candidate:** default to it and print the choice so the user sees what is about to happen:

  > **Ein Stash vorhanden — er wird genommen.** Zurückgeholt wird `<STASH_ID>`.

- **Multiple candidates:** use `AskUserQuestion`. For each candidate, read `manifest.yaml` and surface `timestamp` + `reason` alongside the id.

  - Question: *"Welchen Stash willst du zurückholen? Es sind `<N>` vorhanden."*
  - Options: one per candidate, formatted as `<STASH_ID> — <reason> (weggepackt <timestamp>)`. Add a final **Abbrechen** option.

  On **Abbrechen**, exit cleanly with no state change.

## Step 3 — Pre-flight: the workspace must be free

Two distinct refusals; the user needs to know which condition tripped.

### 3a — A Circle is already active

`fusion-paths` emitted a `CIRCLE=` line in Step 1 exactly when one is. That line is the test — do not read `.active-circle` yourself. (An orphaned pointer never reaches here; it exits 3 in Step 1.)

If a `CIRCLE=` line was emitted:

> **Der Arbeitsbereich hat schon einen aktiven Circle:** `<CIRCLE>`. Schließ ihn ab, beende die Sitzung mit dem, was gelernt wurde (Bounded Closure), oder pack ihn mit `/fusion:circle-stash` weg — dann kannst du `<STASH_ID>` zurückholen. Über einen laufenden Circle schreibt pop nicht.

Exit cleanly.

### 3b — A session is in flight

`agentstate.yaml` is root-anchored (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`).

```bash
[ -f "$WORKBENCH/agentstate.yaml" ]
```

If true:

> **Eine Sitzung ist im Flug.** `agentstate.yaml` liegt in der workbench — der Orchestrator ist mitten in einer Sitzung (oder war es, und die Datei blieb liegen). Beende sie sauber, bevor du `<STASH_ID>` zurückholst: laufen lassen, Bounded Closure annehmen oder neu starten. Über eine lebende Sitzung legt pop keine eingefrorene.

Exit cleanly.

## Step 4 — Read the manifest and check the stash's shape

```bash
ORIGINAL_DIRNAME="$(grep -E '^original_circle_dirname:' "$STASH_DIR/manifest.yaml" | head -1 | sed -E 's/^original_circle_dirname:[[:space:]]*"?([^"]+)"?.*/\1/')"
ORIGINAL_RECORD="$(grep -E '^original_circle_record:' "$STASH_DIR/manifest.yaml" | head -1 | sed -E 's/^original_circle_record:[[:space:]]*"?([^"]+)"?.*/\1/')"
ACTIVE_CONTENT="$(grep -E '^active_circle_content:' "$STASH_DIR/manifest.yaml" | head -1 | sed -E 's/^active_circle_content:[[:space:]]*"?([^"]+)"?.*/\1/')"
GIT_STASH_REF="$(grep -E '^git_stash_ref:' "$STASH_DIR/manifest.yaml" | head -1 | sed -E 's/^git_stash_ref:[[:space:]]*"?([^"]+)"?.*/\1/')"
GIT_STASH_SHA="$(grep -E '^git_stash_sha:' "$STASH_DIR/manifest.yaml" | head -1 | sed -E 's/^git_stash_sha:[[:space:]]*"?([^"[:space:]]+)"?.*/\1/')"
[ "$GIT_STASH_SHA" = "null" ] && GIT_STASH_SHA=""
HAS_AGENTSTATE="$(grep -E '^has_agentstate:' "$STASH_DIR/manifest.yaml" | head -1 | sed -E 's/^has_agentstate:[[:space:]]*([a-z]+).*/\1/')"
STASH_HEAD="$(grep -E '^head_short_hash:' "$STASH_DIR/manifest.yaml" | head -1 | sed -E 's/^head_short_hash:[[:space:]]*"?([^"[:space:]]*)"?.*/\1/')"
```

Any other field in the manifest is ignored, `has_spec_plan` included. Stashes written before the container layout carry it; reading a field this skill has no use for is not an error, and pop must not choke on its presence. The schema is defined in `rules/workbench-stash-and-lock.md` `## Stashes` → Manifest schema.

**Shape check.** A stash written before the container layout holds a flat `circle.md` and no `circle/` directory. Its Circle was a loose file, its spec and plan were copies of files that still live in the shared store after migration, and reconstructing a Circle directory out of that would mean guessing which of those copies belong inside it. Pop does not guess:

```bash
if [ ! -d "$STASH_DIR/circle" ]; then SHAPE=legacy; else SHAPE=container; fi
```

If `SHAPE=legacy`, halt — before any mutation, and without touching the stash:

> **Dieser Stash stammt aus der Zeit vor der Circle-Verzeichnis-Struktur und lässt sich nicht automatisch zurückholen.** Er enthält `circle.md` als lose Datei statt eines `circle/`-Verzeichnisses; seine Spec- und Plan-Kopien gehören zu Dateien, die heute in der gemeinsamen Ablage liegen. Welche davon in den Circle gehören, kann pop nicht erraten — und rät auch nicht.
>
> *So holst du ihn von Hand zurück:* Leg unter dem Circle-Speicher ein Verzeichnis mit dem Circle-Namen aus dem Manifest an — Feld `original_circle_dirname`; trägt ein Alt-Manifest stattdessen den vollen Dateinamen, nimm Zeitstempel und Slug daraus, ohne Marker und ohne `.md` —, leg `circle.md` als `_t_circle.md` hinein, erzeuge daneben die Unterverzeichnisse aus der Vorlage in `rules/fusion-workbench-conventions.md`, schreib den Verzeichnisnamen in `.active-circle` und wende den Arbeitsbaum mit `git stash apply <git_stash_sha aus dem Manifest>` an. Nichts im Stash wird dabei angefasst; er bleibt dein Sicherheitsnetz.
>
> *Fürs nächste Mal:* Stashes vor einem Versionssprung zurückholen, nicht danach.

Exit cleanly. Nothing has been mutated; the stash is intact.

If `ORIGINAL_DIRNAME` or `ORIGINAL_RECORD` is empty on a `container`-shaped stash, the manifest is inconsistent with the directory. Halt and say so — do not fall back to a guessed name.

## Step 5 — Drift detection (warning, not blocker)

Per Decision Fork 6, the only drift signal computed is the HEAD short-hash delta.

```bash
CURRENT_HEAD="$(cd "$PROJECT_ROOT" && git rev-parse --short HEAD 2>/dev/null)"
```

If `STASH_HEAD == CURRENT_HEAD`, skip this block entirely; HEAD has not moved.

Otherwise:

```bash
COMMIT_DELTA="$(cd "$PROJECT_ROOT" && git rev-list --count "${STASH_HEAD}..HEAD" 2>/dev/null)"
```

Present the drift before the confirmation gate, action-first:

> **HEAD hat sich bewegt, seit der Circle weggepackt wurde — sieh es dir an, bevor du zurückholst.**
>
> - **Beim Wegpacken:** `<STASH_HEAD>`
> - **Jetzt:** `<CURRENT_HEAD>`
> - **Commits seither:** `<COMMIT_DELTA>`
>
> Der Circle selbst ist unverändert — er lag die ganze Zeit im Stash und konnte nicht bearbeitet werden. Was sich bewegt haben kann, ist der Code, gegen den sein Plan geschrieben wurde. Zurückholen ist unterstützt; diese Warnung ist ein Hinweis.

The Circle's own files carry no per-path drift sub-block, because they cannot drift: they were inside the stash for the whole interruption. If the commits look relevant, the place that catches a stale plan is the orchestrator's Coherence check on resume, not this skill.

## Step 6 — Confirmation gate

`AskUserQuestion`:

- Question: *"Stash `<STASH_ID>` zurückholen? <one-line summary: reason + timestamp from the manifest>"*
- Options:
  - **Zurückholen** (recommended, default) — proceed with Step 7.
  - **Abbrechen** — exit cleanly; nothing is changed.
  - **Erst ansehen** — print the stash directory tree (`ls -R "$STASH_DIR"`) and the full `manifest.yaml`, then re-ask this question with the same three options.

**Erst ansehen** loops back to the same prompt; it does not advance. After two consecutive inspects, lead with a hint: *"Nochmal ansehen, oder Zurückholen / Abbrechen wählen."*

## Step 7 — Restore in reverse-stash order

Each sub-step is independently idempotent on retry. Do not re-order; the order mirrors the stash sequence in reverse so partial-failure recovery stays predictable.

### 7.1 — Move the Circle directory back

Refuse if a Circle directory of the same name already exists — `mv` would nest the restored directory *inside* it rather than replace it, which is worse than either outcome the user expects. Step 3a catches the active-Circle case; a same-named anticipated or closed Circle can still collide here.

```bash
mkdir -p "$WORKBENCH/$OUT_CIRCLE"
DEST_CIRCLE="$WORKBENCH/$OUT_CIRCLE/$ORIGINAL_DIRNAME"
if [ -e "$DEST_CIRCLE" ]; then echo "ERROR: A Circle directory named $ORIGINAL_DIRNAME already exists in the Circle store. Move it aside (rename or archive it), then re-run /fusion:circle-pop $STASH_ID. Pop will not merge into it or overwrite it." >&2; exit 1; fi
mv "$STASH_DIR/circle" "$DEST_CIRCLE"
```

One move restores the record, the spec, the plan, the issues, the decisions, the history, the reviews and the analyses. If the refusal triggers, the stash is left untouched — the user moves the conflicting Circle aside and reruns pop with the same id.

### 7.2 — Restore `.active-circle`

The pointer holds the bare directory name — no marker, no prefix, no `.md`:

```bash
printf '%s\n' "$ACTIVE_CONTENT" > "$WORKBENCH/.active-circle"
```

### 7.3 — Restore `agentstate.yaml` (if the stash carried one)

If `HAS_AGENTSTATE == true`:

```bash
cp "$STASH_DIR/agentstate.yaml" "$WORKBENCH/agentstate.yaml"
```

Otherwise skip. The popped session has no in-flight state; `/fusion:setup` creates a fresh one on the next run (Decision Fork 4).

### 7.4 — Restore the task queue and the dashboard

```bash
[ -f "$STASH_DIR/tasklist.md" ] && cp "$STASH_DIR/tasklist.md" "$WORKBENCH/$TASKLIST"
[ -f "$STASH_DIR/orchestrator-live.md" ] && cp "$STASH_DIR/orchestrator-live.md" "$WORKBENCH/orchestrator-live.md"
```

`orchestrator-live.md` was overwritten with a stash notice at stash time; the snapshot in the stash carries the true pre-stash dashboard state, which is what we restore. `/fusion:setup` refreshes it again at the next session start.

### 7.5 — Apply the git stash (NOT pop)

Apply against the stable commit SHA when available — positional refs like `stash@{0}` are renumbered by any intervening `git stash push` during the urgent work, and applying the wrong positional ref silently restores unrelated content. The SHA is captured at stash time and never moves.

```bash
APPLY_TARGET=""
if [ -n "$GIT_STASH_SHA" ]; then APPLY_TARGET="$GIT_STASH_SHA"; elif [ -n "$GIT_STASH_REF" ] && [ "$GIT_STASH_REF" != "(no changes)" ]; then APPLY_TARGET="$GIT_STASH_REF"; fi
if [ -n "$APPLY_TARGET" ]; then cd "$PROJECT_ROOT" && git stash apply "$APPLY_TARGET"; fi
```

If the manifest carries no `git_stash_sha`, fall back to the positional ref. If neither is usable (the `(no changes)` sentinel), skip the apply entirely.

`git stash apply` (not `pop`) is a binding constraint — the entry stays in `git stash list` until the user explicitly drops it. If the apply reports merge conflicts:

> **Das Anwenden des Arbeitsbaums hat Konflikte erzeugt.** Löse sie von Hand, bevor du weitermachst: der eingefrorene Stand liegt jetzt über dem aktuellen HEAD, `git status` zeigt dir die betroffenen Dateien. Mach kein `git stash drop`, solange die Konflikte nicht aufgelöst oder verworfen sind — der Eintrag im git-Stash ist dein Sicherheitsnetz.

Surface the conflicts; do NOT auto-revert. The Circle directory is already restored, so the user can inspect the popped Circle alongside the conflict.

### 7.6 — Write a fresh active-session marker

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-session-mark" write fusion:orchestrator || true
```

Tolerate a non-zero exit; `/fusion:setup` writes another if needed.

### 7.7 — Append `## Resumed from stash` to the record

Use the `Edit` tool to append to `$DEST_CIRCLE/$ORIGINAL_RECORD`:

```markdown

## Resumed from stash

**Resumed at:** <RFC 3339 UTC timestamp>
**Stash id:** <STASH_ID>
**Drift summary:** HEAD at stash `<STASH_HEAD>` → now `<CURRENT_HEAD>` (<COMMIT_DELTA> commits since).
**Git stash apply:** `<clean | conflicts surfaced — see message above>`
```

Substitute the values resolved in Step 5. When HEAD did not move, render the drift summary as `HEAD unchanged at <STASH_HEAD>`.

## Step 8 — Emit the `circle_popped` event

The event log is root-anchored and append-only; touch-or-append, never `>` truncate.

```bash
[ -f "$WORKBENCH/orchestrator-events.jsonl" ] || touch "$WORKBENCH/orchestrator-events.jsonl"
TS="$(date -u +%Y-%m-%dT%H:%M:%S)"
echo "{\"ts\":\"${TS}\",\"event\":\"circle_popped\",\"stash_id\":\"${STASH_ID}\"}" >> "$WORKBENCH/orchestrator-events.jsonl"
```

## Step 9 — Report to the user

Action-first per `rules/user-facing-output.md`:

> **Circle zurückgeholt.** Mit `/fusion:setup` machst du weiter — die Abfrage zur unterbrochenen Sitzung bietet dir an, dort anzuknüpfen, wo du aufgehört hast.
>
> **Hinweis:** Das Stash-Verzeichnis wurde nicht gelöscht (wie bei `git stash apply`). Zum Aufräumen: das Verzeichnis `<STASH_ID>` im Stash-Speicher entfernen und `git stash drop <GIT_STASH_REF>`.
>
> **Details:**
> - Circle: `<ORIGINAL_DIRNAME>` — vollständig zurück im Circle-Speicher, samt Spec, Plan, Issues, Entscheidungen, Protokollen, Reviews und Analysen
> - Zeiger `.active-circle`: gesetzt
> - Sitzungszustand: `<wiederhergestellt | nicht im Stash (keine Sitzung)>`
> - Arbeitsbaum: angewendet (Eintrag bleibt als `<GIT_STASH_REF>` erhalten)

Exit. Do not chain into `/fusion:setup` automatically — the user runs that themselves so the interrupted-session prompt is visible and they pick Continue / Restart / Modify deliberately.

## Boundaries

- The skill mutates state only inside Step 7 and the event-log append in Step 8. Steps 1–6 are read-only.
- The skill never deletes the stash directory. The final message names the prune command; deletion is the user's call.
- The skill never auto-resolves a `git stash apply` conflict — the user fixes it manually.
- The skill never merges into or overwrites an existing Circle directory. A name collision is a refusal, not a resolution.
- The skill never restores anything into the shared store. The stash never captured shared artifacts, so there is nothing there to put back — a spec the Circle cites in the shared store simply stayed live the whole time.
- The skill never `git stash pop`s — only `git stash apply`. The entry stays in `git stash list` until the user drops it.

## Tone

User-facing output follows `rules/user-facing-output.md` plus the chat profile for the project's language (`./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`; the language comes from the `**Language:**` line in `CLAUDE.md`). For this skill specifically:

- Refusals in Steps 1–4 lead with the user action ("Schließ ihn ab", "Beende sie sauber") before explaining why.
- The drift warning in Step 5 leads with "HEAD hat sich bewegt" and the actionable numbers, and says plainly that the Circle itself did not drift.
- The legacy-shape refusal in Step 4 leads with the fact that it cannot be automated, then gives the manual recipe. It never half-restores.
- The Step 9 report leads with "Circle zurückgeholt" and the next command, then the prune hint, then details.
- Marker syntax stays in filenames; in prose say "aktiver Circle", not "_t_ Circle".
