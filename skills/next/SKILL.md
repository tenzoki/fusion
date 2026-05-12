---
description: Portfolio briefing — dispatches playmaker, renders the next-recommended Circle, and offers interactive activation.
argument-hint: "[<circle-id>]"
allowed-tools: [Bash, Read, Write, AskUserQuestion, Agent(fusion:playmaker)]
---

# Fusion — next (portfolio briefing + interactive activation)

The user invoked `/fusion:next`. This skill is the user-facing surface for the Circle portfolio: it dispatches the `playmaker` agent, reads the regenerated `fusion-workbench/portfolio.md`, renders the inline summary (top-recommended Circle + counts + warnings), and offers an interactive activation prompt for the recommended Circle.

The skill writes nothing on the briefing path. The only writes it performs are part of the activation branch (Step 6): the `[a]→[t]` marker rename, the `.active-circle` overwrite, and a dashboard placeholder write to `orchestrator-live.md`. All writes are gated by an explicit user confirmation.

**Invocation forms:**

- `/fusion:next` — briefing + interactive confirm on the top-recommended Circle (default).
- `/fusion:next <circle-id>` — explicit-filename form. Skips the proposal step and goes straight to the confirm for that specific Circle. `<circle-id>` is the basename of an `[a]` Circle file in `fusion-workbench/circles/`.
- `/fusion:next --write-activation <circle-id>` — back-compat alias for the explicit form. The explicit `/fusion:next <circle-id>` form is preferred.

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

**Explicit-form short-circuit:** if the user invoked `/fusion:next <circle-id>` or `/fusion:next --write-activation <circle-id>`, the dispatch in this step is still useful (keeps `portfolio.md` fresh and re-runs cycle/warning checks before we mutate state) but the briefing render in Step 5 may be skipped if the user clearly wants to act on a specific Circle. In that case go straight to Step 6 with `<circle-id>` as the target. If the explicit `<circle-id>` does not exist or does not carry the `[a]` marker, halt with a clear mismatch report — do not fall back to the recommended one.

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

After rendering the briefing, proceed to Step 6.

## Step 6 — Interactive activation

This step has two entry paths:

- **Default (no argument).** Use the top-recommended `[a]` Circle from the `## Anticipated ([a]) — ranked` section's first line. If `(none)` or no `[a]` Circles exist, skip Step 6 entirely — the briefing was the whole output.
- **Explicit (`/fusion:next <circle-id>` or `--write-activation <circle-id>`).** Use the cited `<circle-id>` as the target.

**Gate — active Circle already exists.** Before prompting the user, check whether an active `[t]` Circle is already in play:

```bash
if [ -f "$WORKBENCH/fusion-workbench/.active-circle" ]; then
  ACTIVE=$(cat "$WORKBENCH/fusion-workbench/.active-circle")
  # If the cited file still exists and still carries [t], an active Circle is in play
  if [ -n "$ACTIVE" ] && [ -f "$WORKBENCH/fusion-workbench/circles/$ACTIVE" ] && echo "$ACTIVE" | grep -q '\[t\]'; then
    # Active Circle exists — do not offer activation. Exit cleanly.
    :
  fi
fi
```

If an active `[t]` Circle is already in play, do NOT offer activation. Print one line stating which Circle is active and exit. The briefing has already done its job.

**Prompt — the recommended/explicit Circle is the candidate.** Use `AskUserQuestion`:

- Question: *"Activate Circle `<candidate-basename>` now? This renames `[a]`→`[t]`, updates `.active-circle`, and starts a fresh orchestrator session."*
- Options:
  - **Activate** (default) — proceed with the rename + pointer write + dashboard placeholder + chain-into-session sequence below.
  - **Pick another** — list the `[a]` Circles from `portfolio.md`'s `## Anticipated` section as a follow-up `AskUserQuestion` (each `[a]` basename is one option). User picks one. Then proceed with the rename for the chosen file. If `## Anticipated` has only one entry, this option is equivalent to **Activate**; merge them.
  - **Skip** — exit cleanly, no state change. This is the "I just wanted to peek" exit.

On **Activate** (or after **Pick another** selection) carry out the following in order:

### 6.1 — Verify the citation

Confirm the target file exists at `$WORKBENCH/fusion-workbench/circles/<basename>` and that the basename contains the `[a]` marker. If either check fails, halt and report the mismatch — do not rename, do not write the pointer.

### 6.2 — Perform the rename

Replace the `[a]` substring with `[t]` in the basename, then `mv` the file:

```bash
OLD="$WORKBENCH/fusion-workbench/circles/<basename>"
NEW="$WORKBENCH/fusion-workbench/circles/$(echo '<basename>' | sed 's/\[a\]/[t]/')"
mv "$OLD" "$NEW"
```

### 6.3 — Overwrite `.active-circle`

Write the new basename (the `[t]` form) as the sole content of `$WORKBENCH/fusion-workbench/.active-circle`:

```bash
basename "$NEW" > "$WORKBENCH/fusion-workbench/.active-circle"
```

### 6.4 — Overwrite the dashboard placeholder

The orchestrator's dashboard (`fusion-workbench/orchestrator-live.md`) may carry stale state from a previous session ("Session: Complete", final commit list, etc.). To make it impossible to confuse the prior session's final state with the current one, overwrite the dashboard with a transition placeholder. Use the `Write` tool to overwrite the file with this exact content (substitute `<new-basename>` with the renamed basename, the `[t]` form):

```markdown
# Orchestrator — Live

**Active Circle:** <new-basename>
**Session:** Not started — orchestrator Setup will refresh this dashboard on next session start

## Current
  [READY] orchestrator -> Activation complete; awaiting Turn 1
```

This is a minimal placeholder — the orchestrator overwrites it in full at the next Setup.

### 6.5 — Chain into a fresh orchestrator session

The skill's final output to the user must phrase itself as an implicit directive that the orchestrator agent (the parent session reading this output) will pick up and act on. Print, verbatim except for the `<new-basename>` substitution:

> *Activation complete. The Circle is now `[t]` and `.active-circle` points at it.*
>
> *Beginning a fresh orchestrator session against this Circle. The orchestrator should now run Setup (which will overwrite the dashboard), read the active Circle's `## Directive` from `fusion-workbench/circles/<new-basename>`, treat that Directive as the session Directive, and proceed with Phase 0 → Phase 1 → Phase 2.*

That message is itself the directive. The orchestrator's own prompt instructs it to run Setup at the start of work, so emitting this text is sufficient to trigger Setup on the parent thread.

## Boundaries

The skill never writes `circles/` *content* — the only writes it performs are the marker rename (`[a]`→`[t]`), the `.active-circle` overwrite, and the `orchestrator-live.md` placeholder, all in Step 6, and all gated by the user's explicit confirmation. `portfolio.md` itself is written by playmaker, not by this skill. Safe to invoke during an active orchestrator session — playmaker is read-everything-write-only-`circles/`-and-`portfolio.md`, so it cannot interfere with the active Turn loop's writes. The Step 6 activation branch is short-circuited when an active `[t]` Circle is already in play, so it cannot stomp an in-progress Circle.

## Tone

Concise. Show one line for the top recommendation, one line for counts, the warnings list (if any). Don't editorialise. The user invoked `/fusion:next` to get a portfolio snapshot, not a discussion — match that energy. The activation confirm is one short prompt with three clear options.
