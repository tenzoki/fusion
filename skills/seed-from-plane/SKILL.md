---
description: Seed a new anticipated Circle from a Plane issue — one bounded read of the story's title+description, then the standard /fusion:direct→shaper Circle-creation path. Reuses the seed→push round-trip binding so the Circle's later pushes land on the origin story.
argument-hint: <plane-sequence-id>
allowed-tools: [Bash, Read, Write, Edit, Agent(fusion:shaper)]
---

# Fusion — seed-from-plane (seed a Circle from a Plane issue)

The user invoked `/fusion:seed-from-plane <seq>`. This skill is the **one bounded read channel** of the Plane bridge: it reads a named Plane issue's title + description **exactly once**, then hands that text into the **existing `/fusion:direct`→`shaper` path** to create a **new anticipated (`_a_`) Circle** (decision DR-2: anticipated, not straight-to-active). After the Circle exists, the skill binds the origin Plane issue to the Circle in `.plane-map.json` so the Circle's future `push` calls land on the **same** origin story — closing Martin's round-trip (seed from story → work → status/PR/closure pushed back). Plane is **not read again** for that Circle; the Grounding file is authoritative from creation on.

This skill is a **variant of `/fusion:direct`**: same anticipated-Circle outcome, same shaper clarification flow, same follow-up hints. The only differences are (1) the draft Directive is pre-filled from Plane instead of the user's one-liner, and (2) a post-creation `--record-origin` call binds the round-trip. All Circle content is written by `shaper`, never by this skill.

The bounded read and the map binding are delegated to `bin/fusion-plane seed` (which owns `.plane-map.json`, the `zsh -ic` key wrapper, config load, and the C4 never-silent fallback). This skill never touches the map or the API directly.

## Step 1 — Pre-flight: resolve paths

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" seed-from-plane
```

Hold the emitted values (`WORKBENCH`, `OUT_CIRCLE`, …). On a non-zero exit, read the code — it names whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes):

- **Exit 1** — no workbench above `pwd`. Halt:

  > *Keine fusion-workbench über `$(pwd)` gefunden. Führe zuerst `/fusion:setup` im Projektwurzelverzeichnis aus.*

  Exit cleanly. Do NOT bootstrap a workbench here — `/fusion:setup` is the single point of workbench creation.

- **Exit 3** — `.active-circle` is orphaned or corrupt. Report the resolver's stderr verbatim and tell the user to fix or delete the pointer. Do not proceed.

- **Exit 4** — an internal error in `fusion-paths`. Report it as a fusion bug and stop; the user's workbench is fine.

Then check the argument:

- **No `<seq>` argument provided**: halt with:

  > *So geht's: `/fusion:seed-from-plane <seq>` — gib die Plane-Sequenznummer der Story an (die Zahl im Ticket-Kürzel, z. B. `7`). fusion liest die Story einmal und legt daraus einen geplanten Circle an.*

  Exit cleanly.

- **Both OK**: continue.

## Step 2 — The one bounded read

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-plane" seed <seq>
```

This resolves `sequence_id`→issue UUID (Martin's verified `GET issues?per_page=100 | jq 'select(.sequence_id==$s)'` lookup against Plane's issues list endpoint) and GETs the issue's title + description **once**. It writes nothing to the map yet — the Circle's natural key does not exist until `shaper` creates the directory (that binding happens in Step 6).

Parse `bin/fusion-plane seed`'s **stdout JSON** and branch on `status`:

- **`status: "ok"`** — capture `title`, `description`, and `origin_plane_id`. These are the draft Directive for `shaper` and the round-trip anchor for Step 6.

- **`status: "deferred"`** (exit code 10 — absent `PLANE_API_KEY`, Plane unreachable, or an HTTP error; **never silent, never a crash**) — the JSON carries `board_url` and `fetch_cmd`. Relay them to the user and ask them to paste the story's description:

  > *Plane konnte gerade nicht gelesen werden (`<reason>`). Öffne die Story hier: `<board_url>` — oder führe in deiner Shell aus:*
  > *`<fetch_cmd>`*
  > *und füge Titel + Beschreibung hier ein. Ich lege den Circle dann direkt daraus an.*

  Wait for the user's pasted text. Use the pasted title + description as the draft Directive. There is **no** `origin_plane_id` in this path, so the round-trip binding (Step 6) is skipped — note that to the user in Step 7. This never blocks: the Circle is still created.

- **Any other non-zero exit** (e.g. exit 2 — non-numeric `<seq>`, or no issue with that sequence_id) — relay the helper's stderr message verbatim and halt. This is a bad story number, not an outage.

## Step 3 — Ensure the Circle store exists

```bash
mkdir -p "$WORKBENCH/$OUT_CIRCLE"
```

Same one-directory guard as `/fusion:direct` Step 2: if the Circle store is missing (e.g. a workbench set up on a pre-Track-C plugin version), create it so capture isn't blocked. The standard full remedy is re-running `/fusion:setup`.

## Step 4 — Detect domain

Same pattern as `/fusion:direct` Step 3: prefer `agentstate.yaml` if present, else default `code`.

```bash
DOMAIN=""
if [ -f "$WORKBENCH/agentstate.yaml" ]; then DOMAIN="$(grep -E '^  domain:' "$WORKBENCH/agentstate.yaml" | head -1 | sed -E 's/.*domain:[[:space:]]*"?([a-z]+)"?.*/\1/')"; fi
DOMAIN="${DOMAIN:-code}"
```

`<detected-domain>` ∈ `{code, data, strategic, knowledge}` — passed to `shaper` so it sets the Circle's `**Domain:**` field.

## Step 5 — Dispatch shaper in anticipated-circle mode

This is the **exact `/fusion:direct`→`shaper` path** (DR-2: the seeded Circle enters as anticipated `_a_`, never a straight-to-active `_t_`). Use the `Agent` tool with target `fusion:shaper`. The dispatch prompt's first non-empty content lines MUST be the mode + draft + domain parameters, in that order.

Prompt body:

```
**Mode:** anticipated-circle
**Draft:** <the Plane story's title on the first line, then its description>
**Domain:** <detected-domain>
```

Use the `title` + `description` fetched in Step 2 (or the user's pasted text in the deferred path) verbatim as the `**Draft:**` value. `shaper` reads it as everything between `**Draft:**` and the next `**<Keyword>:**` line.

Do **not** pass `shaper` a path — it resolves its own write targets at its Setup, the same way this skill did in Step 1.

`shaper` will then run its normal 1-4-questions-per-round clarification flow with the user, derive a `<directive-slug>`, create the Circle directory `YYMMDD-HHMM-<directive-slug>/` with its record `_a_circle.md` and the six artifact subdirectories, write its own history file, and return the **Circle directory name**.

Wait for `shaper` to complete. The clarification may take several rounds — that's the point of using `shaper` rather than dumping the Plane text verbatim into a Circle.

## Step 6 — Bind the round-trip (Phase B)

Only when Step 2 returned `status: "ok"` (we have an `origin_plane_id`). Take the Circle directory name `shaper` returned and record the origin binding:

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-plane" seed --record-origin <circle-dir-name> <origin_plane_id>
```

This is a pure map write (no network). It records the origin Plane UUID under the Circle's stable directory name (the natural key), so a later `bin/fusion-plane push --circle <circle-dir-name>` updates the **same** origin story rather than creating a duplicate. `last_state` is left empty on purpose, so the first real push syncs the origin issue to the Circle's marker state.

In the **deferred** path (no `origin_plane_id`), skip this step — the Circle exists and is fully usable; only the automatic round-trip binding is absent. Do not fabricate a UUID.

## Step 7 — Confirm to user

When `shaper` returns (and Step 6 ran, if applicable), report:

1. **The new Circle's directory name and path** — copy-pasteable.
2. **One-line summary of the refined Directive** — first non-empty paragraph of the record's `## Directive` section.
3. **Round-trip status** — one line:
   - bound: *Plane-Story #`<seq>` ist mit diesem Circle verknüpft; künftige `push`-Aufrufe aktualisieren dieselbe Story.*
   - deferred: *Plane war beim Lesen nicht erreichbar — der Circle wurde aus deinem eingefügten Text angelegt, aber ohne automatische Story-Verknüpfung. (Optional später manuell binden.)*
4. **Follow-up hint** — print:

   > *Weiter:*
   > - *`/fusion:next` zeigt dir diesen Circle im Portfolio neben den anderen geplanten, mit Aktivierungs-Abfrage.*
   > - *`/fusion:next <dirname>` aktiviert ihn direkt und überspringt den Vorschlag.*

   Substitute `<dirname>` with the actual Circle directory name — no marker, no `.md`.

This is the entire user-facing output.

## Boundaries

- The skill never writes Circle content directly — `shaper` produces it.
- The skill never reads Plane more than once per invocation. After the Circle exists, the Grounding file is the source of truth; Plane is not consulted about that Circle again.
- The skill never touches `.plane-map.json` directly — `bin/fusion-plane` owns it (both the read and the `--record-origin` write go through the helper).
- The skill never starts an orchestrator Turn loop and never activates a Circle. It produces an **anticipated** (`_a_`) Circle only (DR-2). Activation stays the user's explicit choice via `/fusion:next`.
- The skill is safe to invoke during an active orchestrator session — a new anticipated Circle does not affect the active one, and `.active-circle` is untouched.
- The API key is never read from or written to any file — the helper reads it only from `$PLANE_API_KEY` via `zsh -ic`.

## Tone

User-facing output follows `rules/user-facing-output.md` plus the chat profile for the project's language (`./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`; the language comes from the `**Language:**` line in `CLAUDE.md`). For this skill specifically: the Step-7 confirmation leads with the **Circle's name and path** (the action surface) and the one-line refined Directive, then the round-trip status and the hints. Don't bury the path mid-paragraph.

Concise. The user invoked this to seed a Circle from a Plane story, not to read meta-commentary. `shaper` handles the clarification dialogue; this skill is the entry point, the one bounded read, and the post-write confirmation.
