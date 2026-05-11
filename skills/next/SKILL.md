---
description: Portfolio briefing — dispatches playmaker, reads portfolio.md, renders the next-recommended Circle and counts inline.
argument-hint: "[--write-activation <circle-id>]"
allowed-tools: [Bash, Read, Agent(fusion:playmaker)]
---

# Fusion — next (portfolio briefing)

The user invoked `/fusion:next`. This skill is the user-facing surface for the Circle portfolio: it dispatches the `playmaker` agent, reads the regenerated `fusion-workbench/portfolio.md`, and renders the inline summary (top-recommended Circle + counts + warnings). It is **read-presenting only** in the default form — the skill itself does not write `circles/` content or `portfolio.md`.

An optional `--write-activation <circle-id>` form lets the user commit an activation (`[a]→[t]` marker rename + `.active-circle` overwrite) after explicit confirmation. That is the only write the skill performs, and only on that flag.

## Step 1 — Pre-flight check

Three possible states; each is handled differently.

```bash
WORKBENCH="$("$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root" 2>/dev/null)" || WORKBENCH=""
```

- **No workbench** (`$WORKBENCH` is empty): halt with the standard message:

  > *No fusion workbench found above $(pwd). Run `/fusion:setup` at the project root first.*

  Exit cleanly. Do NOT bootstrap a workbench from here — `/fusion:setup` is the single point of workbench creation.

- **Workbench present but `circles/` absent or empty**:

  ```bash
  if [ ! -d "$WORKBENCH/fusion-workbench/circles" ] || [ -z "$(ls -A "$WORKBENCH/fusion-workbench/circles" 2>/dev/null)" ]; then
    # empty-or-absent branch
  fi
  ```

  Print exactly one line:

  > *No Circles yet — `fusion-workbench/circles/` is empty. Type a fresh request to the orchestrator to start the first one.*

  Exit. Do NOT dispatch playmaker. Do NOT bootstrap `circles/` (that's part of `/fusion:setup`).

- **Workbench and `circles/` both present and non-empty**: proceed to Step 2.

## Step 2 — Detect domain

Decide which `**Domain:**` value to pass to playmaker.

- If the parent context is an orchestrator session and `$WORKBENCH/fusion-workbench/agentstate.yaml` exists, read its `session.domain` field. That value is the most accurate — the orchestrator detected it at Setup Step 5.
- Otherwise (no `agentstate.yaml`, or no `session.domain` field): fall back to `code`.

Pseudocode:

```
if [ -f "$WORKBENCH/fusion-workbench/agentstate.yaml" ]; then
  # The 2-space leading indent scopes the match to `session:`-block fields (the only place `domain:` lives today);
  # the `"?` around the captured token handles both quoted ("code") and unquoted (code) YAML values.
  DOMAIN=$(grep -E '^  domain:' "$WORKBENCH/fusion-workbench/agentstate.yaml" | head -1 | sed -E 's/.*domain:[[:space:]]*"?([a-z]+)"?.*/\1/')
fi
DOMAIN="${DOMAIN:-code}"
```

`<detected-domain>` ∈ `{code, data, strategic, knowledge}` for the remainder of this skill.

## Step 3 — Dispatch playmaker

Use the `Agent` tool with target `fusion:playmaker`. The dispatch prompt's first non-empty content line MUST be the domain parameter; the rest of the prompt is empty for the default invocation (playmaker reads everything it needs from the workbench).

Prompt body:

```
**Domain:** <detected-domain>
```

No other parameters. Playmaker reads, ranks, regenerates `portfolio.md`, writes its own history file, and returns. It never auto-renames Circle markers and never writes `.active-circle`.

## Step 4 — Read portfolio.md

```bash
cat "$WORKBENCH/fusion-workbench/portfolio.md"
```

The file was just (re)written by playmaker. Treat its current content as authoritative.

## Step 5 — Render inline to the user

Extract and present three things from `portfolio.md`:

1. **Top recommendation** — the first line of the `## Anticipated ([a]) — ranked` section is shaped `Recommended next: <circle file> — <rationale>`. Render it as a clear one-line message to the user, e.g. *"Recommended next: `260511-1100[a]-rebuild-auth.md` — three dependencies all `[c]`, one open decision cited."* If the section reads `(none)` (no `[a]` Circles), say so plainly.

2. **Counts** — extract the number of files under each marker class. Either by counting headings/entries within `portfolio.md`'s four state sections (`## Active`, `## Anticipated — ranked`, `## Recently closed`, `## Archived`), or — when `portfolio.md` already lists explicit per-section counts — read those directly. Render as a compact line, e.g. *"Counts: 1 active, 4 anticipated, 12 closed, 2 bounded."*

3. **Warnings** — quote (verbatim or summarised) any content in `portfolio.md`'s `## Warnings` section: `dependency-cycle-detected`, `MULTIPLE-ACTIVE`, `STALE-POINTER`, `POINTER-MISMATCH`, `MISSING-POINTER`, parent-grounding-stale cross-references. If the section reads `(none)`, omit this part.

This is the entire default user-facing output. The skill writes nothing in this branch.

## Step 6 — Optional `--write-activation <circle-id>` form

When the user invoked the skill with `--write-activation <circle-id>`, treat `<circle-id>` as the **basename** of the `[a]` Circle file to activate (e.g. `260511-1100[a]-rebuild-auth.md`).

1. **Confirm via prompt.** Ask the user (use `AskUserQuestion` if available, else a plain prompt):

   > *Activate Circle `<circle-id>`? This renames `[a]` → `[t]` and updates `.active-circle`.*

   Options: **Activate** / **Cancel**. On Cancel: exit without changes; report nothing happened.

2. **Verify the citation.** Confirm the file exists at `$WORKBENCH/fusion-workbench/circles/<circle-id>` and that the cited basename actually contains the `[a]` marker. If either check fails, halt and report the mismatch — do not rename.

3. **Perform the rename.** Replace the `[a]` substring with `[t]` in the basename, then `mv` the file:

   ```bash
   OLD="$WORKBENCH/fusion-workbench/circles/<circle-id>"
   NEW="$WORKBENCH/fusion-workbench/circles/$(echo '<circle-id>' | sed 's/\[a\]/[t]/')"
   mv "$OLD" "$NEW"
   ```

4. **Overwrite `.active-circle`.** Write the new basename (the `[t]` form) as the sole content of `$WORKBENCH/fusion-workbench/.active-circle`:

   ```bash
   basename "$NEW" > "$WORKBENCH/fusion-workbench/.active-circle"
   ```

5. **Confirm to the user.** Print the new active-Circle basename and the path to the renamed file. The user is now ready to start a Turn against the active Circle (via the orchestrator).

## Boundaries

The skill never writes `circles/` *content* — the only write it performs is the marker rename (`[a]`→`[t]`) and the `.active-circle` overwrite in the `--write-activation` branch, and both are gated by the user's explicit confirmation. `portfolio.md` itself is written by playmaker, not by this skill. Safe to invoke during an active orchestrator session — playmaker is read-everything-write-only-`circles/`-and-`portfolio.md`, so it cannot interfere with the active Turn loop's writes (the orchestrator does not write `portfolio.md` or `circles/` content; only the `[t]→[c]/[b]` marker rename at Phase 4, which is outside the loop).

## Tone

Concise. Show one line for the top recommendation, one line for counts, the warnings list (if any). Don't editorialise. The user invoked `/fusion:next` to get a portfolio snapshot, not a discussion — match that energy.
