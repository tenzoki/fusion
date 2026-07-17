---
description: Portfolio briefing — dispatches playmaker, renders the next-recommended Circle, and offers interactive activation.
argument-hint: "[<circle-dirname>]"
allowed-tools: [Bash, Read, Write, AskUserQuestion, Agent(fusion:playmaker)]
---

# Fusion — next (portfolio briefing + interactive activation)

The user invoked `/fusion:next`. This skill is the user-facing surface for the Circle portfolio: it dispatches the `playmaker` agent, reads the regenerated portfolio file, renders the inline summary (top-recommended Circle + counts + warnings), and offers an interactive activation prompt for the recommended Circle.

The skill writes nothing on the briefing path. The only writes it performs are part of the activation branch (Step 6): the `_a_→_t_` record rename, the `.active-circle` write, and a dashboard placeholder write. All writes are gated by an explicit user confirmation.

**A Circle is a directory, and the state marker sits on the record inside it** — `circles/<dirname>/_a_circle.md` → `_t_circle.md`. The directory name never changes. See `rules/fusion-workbench-conventions.md` `## State Markers — circles`.

**Invocation forms:**

- `/fusion:next` — briefing + interactive confirm on the top-recommended Circle (default).
- `/fusion:next <circle-dirname>` — explicit form. Skips the proposal step and goes straight to the confirm for that specific Circle. `<circle-dirname>` is the **directory name** of an anticipated Circle (e.g. `260716-1847-workbench-umbau`) — no marker, no `.md`.
- `/fusion:next --write-activation <circle-dirname>` — back-compat alias for the explicit form. The explicit form is preferred.

## Step 1 — Pre-flight: resolve paths

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" next
```

Hold the emitted `KEY=value` values for the rest of the skill. `$WORKBENCH` is absolute; every other value is workbench-relative. Never guess a path when the resolver fails — read the exit code, it says whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes):

- **Exit 1** — no workbench above `pwd`. Halt:

  > *Keine fusion-workbench über `$(pwd)` gefunden. Führe zuerst `/fusion:setup` im Projektwurzelverzeichnis aus.*

  Exit cleanly. Do NOT bootstrap a workbench from here — `/fusion:setup` is the single point of workbench creation.

- **Exit 3** — `.active-circle` is orphaned or corrupt. The workbench state is inconsistent. Report the resolver's stderr message verbatim and tell the user to fix or delete the pointer. Do not proceed.

- **Exit 4** — an internal error in `fusion-paths`. The user's workbench is fine; do **not** send them to check `.active-circle`. Report it as a fusion bug and stop.

`CIRCLE` is emitted only when a Circle is active. Its presence or absence is how this skill tells the two states apart — do not read `.active-circle` yourself to decide.

Then check whether any Circle exists at all:

```bash
if [ ! -d "$WORKBENCH/$SCAN_CIRCLES" ] || [ -z "$(ls -A "$WORKBENCH/$SCAN_CIRCLES" 2>/dev/null)" ]; then echo empty; fi
```

If empty or absent, print exactly one line and exit — do NOT dispatch playmaker, do NOT create the directory (that is `/fusion:setup`'s job):

> *Noch keine Circles vorhanden. Tipp dem Orchestrator eine Anfrage, dann entsteht der erste.*

Otherwise proceed to Step 2.

## Step 2 — Detect domain

Decide which `**Domain:**` value to pass to playmaker.

- If the parent context is an orchestrator session and `$WORKBENCH/agentstate.yaml` exists, read its `session.domain` field. That value is the most accurate — the orchestrator detected it at Setup Step 5.
- Otherwise (no `agentstate.yaml`, or no `session.domain` field): fall back to `code`.

`agentstate.yaml` is root-anchored, at a fixed workbench-relative path — see `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`.

```bash
DOMAIN=""
if [ -f "$WORKBENCH/agentstate.yaml" ]; then DOMAIN="$(grep -E '^  domain:' "$WORKBENCH/agentstate.yaml" | head -1 | sed -E 's/.*domain:[[:space:]]*"?([a-z]+)"?.*/\1/')"; fi
DOMAIN="${DOMAIN:-code}"
```

The 2-space leading indent scopes the match to `session:`-block fields (the only place `domain:` lives today); the `"?` around the captured token handles both quoted (`"code"`) and unquoted (`code`) YAML values.

`<detected-domain>` ∈ `{code, data, strategic, knowledge}` for the remainder of this skill.

## Step 3 — Dispatch playmaker

Use the `Agent` tool with target `fusion:playmaker`. The dispatch prompt's first non-empty content line MUST be the domain parameter; the rest of the prompt is empty for the default invocation (playmaker resolves its own paths at its Setup and reads what it needs from the workbench).

Prompt body:

```
**Domain:** <detected-domain>
```

No other parameters. Playmaker reads, ranks, regenerates the portfolio file, writes its own history file, and returns. It never renames Circle records and never writes `.active-circle`.

**Explicit-form short-circuit:** if the user invoked `/fusion:next <circle-dirname>` (or the `--write-activation` alias), the dispatch in this step is still useful — it keeps the portfolio fresh and re-runs cycle and warning checks before we mutate state — but the briefing render in Step 5 may be skipped. In that case go straight to Step 6 with `<circle-dirname>` as the target. If the explicit target does not exist, or its record does not carry the `_a_` marker, halt with a clear mismatch report; do not fall back to the recommended one.

## Step 4 — Read the portfolio

```bash
cat "$WORKBENCH/$PORTFOLIO"
```

The file was just regenerated by playmaker. Treat its current content as authoritative.

## Step 5 — Render inline to the user

Extract and present three things from the portfolio file:

1. **Top recommendation** — the first entry of the `## Anticipated (_a_) — ranked` section names a Circle directory and a rationale. Render it as one clear line, e.g. *"Empfehlung: `260511-1100-rebuild-auth` — drei Abhängigkeiten alle geschlossen, eine offene Entscheidung zitiert."* If the section reads `(none)`, say so plainly.

2. **Counts** — the number of Circles per marker class. Either count entries within the portfolio's four state sections, or read explicit per-section counts when the file already carries them. Render as one compact line, e.g. *"Stand: 1 aktiv, 4 geplant, 12 geschlossen, 2 begrenzt abgeschlossen."*

3. **Warnings** — quote (verbatim or summarised) any content in the `## Warnings` section: `dependency-cycle-detected`, `MULTIPLE-ACTIVE`, `STALE-POINTER`, `POINTER-MISMATCH`, `MISSING-POINTER`, parent-grounding-stale cross-references. If it reads `(none)`, omit this part.

After rendering the briefing, proceed to Step 6.

## Step 6 — Interactive activation

Two entry paths:

- **Default (no argument).** Use the top-recommended anticipated Circle from Step 5. If none exist, skip Step 6 entirely — the briefing was the whole output.
- **Explicit (`/fusion:next <circle-dirname>`).** Use the cited directory name as the target.

**Gate — a Circle is already active.** `fusion-paths` emitted a `CIRCLE=` line in Step 1 exactly when one is. If it did, do NOT offer activation. Print one line naming the active Circle and exit; the briefing has already done its job. This is what keeps the activation branch from stomping an in-progress Circle.

**Prompt.** Use `AskUserQuestion`. Follow `rules/user-facing-output.md` and the chat profile at `./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`; the language comes from the `**Language:**` line in `CLAUDE.md` (see `rules/fusion-workbench-conventions.md` `## Project language`). German shape:

> **Frage:** Circle `<candidate-dirname>` jetzt aktivieren? Das benennt den Datensatz von `_a_` auf `_t_` um, setzt den Zeiger `.active-circle` und startet eine frische Orchestrator-Sitzung.
>
> **Option "Aktivieren"** (Standard): Führt die Umbenennung und den Zeiger-Schreibvorgang aus.
> **Option "Andere wählen"**: Zeigt die geplanten Circles zur Auswahl.
> **Option "Nur schauen"**: Beendet ohne Änderung.

On **Andere wählen**, list the anticipated Circles from the portfolio's `## Anticipated` section as a follow-up `AskUserQuestion` (one option per directory name), then proceed with the chosen one. If the section has only one entry, this option is equivalent to **Aktivieren**; merge them.

On **Aktivieren** (or after a selection) carry out the following in order.

### 6.1 — Verify the target

Read the target Circle's record and confirm it carries the `_a_` marker. Enumerate the record rather than globbing per state — the underscore marker is inert, so `circles/*/_a_circle.md` matches literally (no escaping) and `find -name '_a_circle.md'` needs no special handling, but the enumeration below reads the marker as data in one pass. See `rules/fusion-workbench-conventions.md` `## State Markers — circles`.

```bash
CDIR="$WORKBENCH/$SCAN_CIRCLES/<candidate-dirname>"
REC=""; while IFS= read -r f; do REC="$f"; done < <(find "$CDIR" -mindepth 1 -maxdepth 1 -name '*_circle.md' 2>/dev/null)
MARKER="$(basename "$REC" | sed -nE 's/^_([a-z])_.*/\1/p')"
```

If `$CDIR` is not a directory, `$REC` is empty, or `$MARKER` is not `a`, halt and report the mismatch. Do not rename, do not write the pointer. A directory holding no record, or more than one, is a workbench-state fault the user must resolve — say which it is.

### 6.2 — Rename the record

Only the record is renamed. The directory name never changes; that stability is the whole point of the marker-on-the-record design (`rules/fusion-workbench-conventions.md` `## State Markers — circles`).

```bash
mv "$CDIR/_a_circle.md" "$CDIR/_t_circle.md"
```

The brackets are safe here: this is a literal argument to `mv`, not a glob. It is only *pattern matching* that must avoid the bracket form.

### 6.3 — Write `.active-circle`

The pointer holds the **directory name** — no marker, no `circles/` prefix, no `.md`:

```bash
printf '%s\n' "<candidate-dirname>" > "$WORKBENCH/.active-circle"
```

### 6.4 — Overwrite the dashboard placeholder

The dashboard may carry stale state from a previous session ("Session: Complete", a final commit list). Overwrite it so the prior session's final state cannot be mistaken for the current one. Use the `Write` tool to overwrite `$WORKBENCH/orchestrator-live.md` with this exact content (substitute the directory name):

```markdown
# Orchestrator — Live

**Active Circle:** <candidate-dirname>
**Session:** Not started — orchestrator Setup will refresh this dashboard on next session start

## Current
  [READY] orchestrator -> Activation complete; awaiting Turn 1
```

This is a minimal placeholder — the orchestrator overwrites it in full at the next Setup.

### 6.5 — Chain into a fresh orchestrator session

The skill's final output must phrase itself as an implicit directive that the orchestrator (the parent session reading this output) will pick up. Print, verbatim except for the substitution:

> *Aktiviert. Der Circle steht auf `_t_`, der Zeiger `.active-circle` zeigt darauf.*
>
> *Es beginnt eine frische Orchestrator-Sitzung gegen diesen Circle. Der Orchestrator führt jetzt Setup aus (das überschreibt das Dashboard), liest das `## Directive` aus dem Datensatz des Circles `<candidate-dirname>`, nimmt es als Sitzungs-Directive und fährt mit Phase 0 → Phase 1 → Phase 2 fort.*

That message is itself the directive. The orchestrator's own prompt instructs it to run Setup at the start of work, so emitting this text is sufficient to trigger Setup on the parent thread.

## Boundaries

The skill never writes Circle *content*. Its only writes are the record rename (`_a_`→`_t_`), the `.active-circle` write, and the dashboard placeholder, all in Step 6, all gated by explicit confirmation. The portfolio file is written by playmaker, not by this skill. Safe to invoke during an active orchestrator session — playmaker reads everything and writes only Circle records and the portfolio, so it cannot interfere with the active Turn loop's writes. The Step 6 activation branch is short-circuited when a Circle is already active.

## Tone

User-facing output follows `rules/user-facing-output.md` (loaded into every agent via `bin/fusion-rules`) plus the chat profile for the project's language. For this skill specifically:

- The briefing leads with the **recommendation** (action), then counts, then warnings. No leading metadata block.
- Marker syntax in prose uses the **words** ("1 aktiv, 4 geplant"), not the bracket codes. The bracket codes belong in filenames.
- The activation confirmation leads with the **user action**, not a paragraph of Turn-loop jargon.

Concise. One line for the recommendation, one for counts, the warnings list if any. The user invoked `/fusion:next` for a snapshot, not a discussion. The activation confirm is one short prompt with three clear options.
