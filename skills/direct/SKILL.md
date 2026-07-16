---
description: Draft a Directive — shaper refines a one-line draft via clarifying questions and writes an anticipated Circle. Use when you want to capture a goal as a portfolio-anticipated Circle without starting a Turn loop.
argument-hint: <draft Directive>
allowed-tools: [Bash, Read, Write, Edit, Agent(fusion:shaper)]
---

# Fusion — direct (draft a Directive)

The user invoked `/fusion:direct <draft>`. This skill is the user-facing surface for **capturing a Directive as an anticipated Circle** without entering an orchestrator Turn loop. It dispatches the `shaper` agent in `anticipated-circle` mode; shaper runs its normal clarification flow with the user and creates the Circle.

A Circle is a directory, not a file: shaper creates `<dirname>/` with its record `[a]-circle.md` and the six artifact subdirectories. See `rules/fusion-workbench-conventions.md` `## Circle record template`.

The skill itself does not write Circle content — shaper does. Its only writes are (a) a `mkdir -p` of the Circle store if absent (Step 2 — the one deviation from `/fusion:next`'s stricter "run setup" rule, and a deliberate choice for this skill), and (b) the follow-up text printed to the user.

## Step 1 — Pre-flight: resolve paths

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" orchestrator
```

Hold the emitted values. On a non-zero exit, read the code — it says whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes):

- **Exit 1** — no workbench above `pwd`. Halt:

  > *Keine fusion-workbench über `$(pwd)` gefunden. Führe zuerst `/fusion:setup` im Projektwurzelverzeichnis aus.*

  Exit cleanly. Do NOT bootstrap a workbench from here — `/fusion:setup` is the single point of workbench creation. (Creating the Circle store in Step 2 is a different scope: it adds one missing subdirectory inside an existing workbench, not a new workbench.)

- **Exit 3** — `.active-circle` is orphaned or corrupt. Report the resolver's stderr verbatim and tell the user to fix or delete the pointer. Do not proceed.

- **Exit 4** — an internal error in `fusion-paths`. The user's workbench is fine; do **not** send them to check `.active-circle`. Report it as a fusion bug and stop.

Then:

- **No draft argument provided**: halt with:

  > *So geht's: `/fusion:direct <Entwurf>` — gib in einer Zeile an, was du festhalten willst. Der shaper schärft es mit dir und legt den geplanten Circle an.*

  Exit cleanly.

- **Both conditions OK**: continue.

## Step 2 — Ensure the Circle store exists

```bash
mkdir -p "$WORKBENCH/$OUT_CIRCLE"
```

`$OUT_CIRCLE` is where new Circle directories are created. If it was missing (e.g. the workbench was set up on a pre-Track-C plugin version), this creates it. The standard remedy is re-running `/fusion:setup`; this skill creates the one directory it needs so capture isn't blocked. Other absent directories are not addressed — re-run setup for a full refresh.

## Step 3 — Detect domain

Same pattern as `/fusion:next` Step 2: prefer `agentstate.yaml` if present, else default `code`. `agentstate.yaml` is root-anchored, at a fixed workbench-relative path (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`).

```bash
DOMAIN=""
if [ -f "$WORKBENCH/agentstate.yaml" ]; then DOMAIN="$(grep -E '^  domain:' "$WORKBENCH/agentstate.yaml" | head -1 | sed -E 's/.*domain:[[:space:]]*"?([a-z]+)"?.*/\1/')"; fi
DOMAIN="${DOMAIN:-code}"
```

`<detected-domain>` ∈ `{code, data, strategic, knowledge}` — passed to shaper so it sets the Circle's `**Domain:**` field correctly. The user can edit the field later if the heuristic misjudged.

## Step 4 — Dispatch shaper in anticipated-circle mode

Use the `Agent` tool with target `fusion:shaper`. The dispatch prompt's first three non-empty content lines MUST be the mode + draft + domain parameters, in that order.

Prompt body:

```
**Mode:** anticipated-circle
**Draft:** <user's raw argument, verbatim>
**Domain:** <detected-domain>
```

The `**Draft:**` value may span multiple lines if the user passed multi-line input; shaper reads it as everything between `**Draft:**` and the next `**<Keyword>:**` line (or end of prompt).

Do **not** pass shaper a path. It resolves its own write targets at its Setup, the same way this skill did in Step 1 — that is the whole point of having one resolution point.

Shaper will then:

- Read the conventions and load the Circle record template
- Run its normal 1-4-questions-per-round clarification flow with the user via `AskUserQuestion`
- Derive a `<directive-slug>` from the refined Directive (kebab-case, ≤6 words, lowercased, articles dropped)
- Create the Circle directory `YYMMDD-HHMM-<directive-slug>/`, its record `[a]-circle.md`, and the six artifact subdirectories
- Write its own history file
- Return with the Circle directory name

Note where the spec lands, if shaper writes one: with no Circle active, every `OUT_*` points into the shared store, so a spec written *before* the Circle exists is a shared artifact and the record's `**Active spec/plan:**` field cites it there. That is correct and expected, not a migration defect — see `rules/fusion-workbench-conventions.md` `## Circle record template`.

Wait for shaper to complete. The clarification flow may take several rounds — that's the whole point of using shaper instead of stashing the draft verbatim.

## Step 5 — Confirm to user

When shaper returns, report:

1. **The new Circle's directory name and path** — copy-pasteable.
2. **One-line summary of the refined Directive** — extract from the record's `## Directive` section (first non-empty paragraph).
3. **Follow-up hint** — print:

   > *Weiter:*
   > - *`/fusion:next` zeigt dir diesen Circle im Portfolio neben den anderen geplanten, mit Aktivierungs-Abfrage.*
   > - *`/fusion:next <dirname>` aktiviert ihn direkt und überspringt den Vorschlag. (`--write-activation <dirname>` bleibt als Alt-Alias erhalten.)*

   Substitute `<dirname>` with the actual Circle directory name (e.g. `260511-1925-replace-auth-with-oauth`) — no marker, no `.md`. The marker lives on the record inside the directory, not on the name you type here.

This is the entire user-facing output.

## Boundaries

- The skill never writes Circle content directly — shaper produces it.
- The skill never starts an orchestrator Turn loop. Capture is the whole product.
- The skill never modifies an existing Circle. It only causes a *new* anticipated Circle to come into being.
- The skill is safe to invoke during an active orchestrator session — a new anticipated Circle does not affect the active one, and `.active-circle` is untouched.

## Tone

User-facing output follows `rules/user-facing-output.md` (loaded into every agent via `bin/fusion-rules`) plus the chat profile for the project's language (`./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`; the language comes from the `**Language:**` line in `CLAUDE.md`). For this skill specifically: the Step-5 confirmation leads with the **Circle's name and path** (the action surface — the user wants to know where it lives) and the one-line refined Directive, then the hints. Don't bury the path mid-paragraph.

Concise. The user invoked this to capture a Directive, not to read meta-commentary. Shaper handles the clarification dialogue; this skill is the entry point and the post-write confirmation.
