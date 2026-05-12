---
description: Draft a Directive — shaper refines a one-line draft via clarifying questions and writes an anticipated Circle file at fusion-workbench/circles/. Use when you want to capture a goal as a portfolio-anticipated Circle without starting a Turn loop.
argument-hint: <draft Directive>
allowed-tools: [Bash, Read, Write, Edit, Agent(fusion:shaper)]
---

# Fusion — direct (draft a Directive)

The user invoked `/fusion:direct <draft>`. This skill is the user-facing surface for **capturing a Directive as an anticipated Circle** without entering an orchestrator Turn loop. It dispatches the `shaper` agent in `anticipated-circle` mode; shaper runs its normal clarification flow with the user and writes the Circle file at `fusion-workbench/circles/YYMMDD-HHMM[a]-<directive-slug>.md`.

The skill itself does not write Circle content — shaper does. The skill's only writes are (a) `mkdir -p` of `fusion-workbench/circles/` if absent (see Step 2 — this is the one deviation from `/fusion:next`'s stricter "circles/ absence means run setup" rule, and is the user's explicit choice for this skill), and (b) optional helpful follow-up text printed to the user.

## Step 1 — Pre-flight check

Locate the workbench:

```bash
WORKBENCH="$("$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root" 2>/dev/null)" || WORKBENCH=""
```

- **No workbench** (`$WORKBENCH` is empty): halt with the standard message:

  > *No fusion workbench found above $(pwd). Run `/fusion:setup` at the project root first.*

  Exit cleanly. Do NOT bootstrap a workbench from here — `/fusion:setup` is the single point of workbench creation. (Creating the `circles/` *subdirectory* in Step 2 is a different scope: it adds a missing sub-folder inside an existing workbench, not a new workbench.)

- **No draft argument provided**: halt with:

  > *Usage: `/fusion:direct <draft Directive>` — provide a one-line draft of what you want to capture. The shaper will clarify it with you and write the anticipated Circle file.*

  Exit cleanly.

- **Both conditions OK**: continue.

## Step 2 — Ensure circles/ exists

```bash
mkdir -p "$WORKBENCH/fusion-workbench/circles"
```

If `circles/` was missing (e.g. workbench was set up on a pre-Track-C plugin version), this creates it. The standard remedy is to re-run `/fusion:setup`, but this skill creates the one subdirectory it needs so capture isn't blocked. Other absent subdirectories are not addressed — re-run setup for a full refresh.

## Step 3 — Detect domain

Same pattern as `/fusion:next` Step 2: prefer `agentstate.yaml` if present, else default `code`.

```bash
DOMAIN=""
if [ -f "$WORKBENCH/fusion-workbench/agentstate.yaml" ]; then
  DOMAIN=$(grep -E '^  domain:' "$WORKBENCH/fusion-workbench/agentstate.yaml" | head -1 | sed -E 's/.*domain:[[:space:]]*"?([a-z]+)"?.*/\1/')
fi
DOMAIN="${DOMAIN:-code}"
```

`<detected-domain>` ∈ `{code, data, strategic, knowledge}` — passed to shaper so it sets the Circle's `**Domain:**` frontmatter correctly. The user can edit the field later if the heuristic misjudged.

## Step 4 — Dispatch shaper in anticipated-circle mode

Use the `Agent` tool with target `fusion:shaper`. The dispatch prompt's first three non-empty content lines MUST be the mode + draft + domain parameters, in that order.

Prompt body:

```
**Mode:** anticipated-circle
**Draft:** <user's raw argument, verbatim>
**Domain:** <detected-domain>
```

The `**Draft:**` value may span multiple lines if the user passed multi-line input; shaper reads it as everything between `**Draft:**` and the next `**<Keyword>:**` line (or end of prompt).

Shaper will then:
- Read the conventions doc and load the Circle template
- Run its normal 1-4-questions-per-round clarification flow with the user via `AskUserQuestion`
- Derive a `<directive-slug>` from the refined Directive (kebab-case, ≤6 words, lowercased, articles dropped)
- Write the new Circle file at `fusion-workbench/circles/YYMMDD-HHMM[a]-<directive-slug>.md`
- Write its own history file at `fusion-workbench/history/YYMMDD-HHMM-shaper-<directive-slug>.md`
- Return with the Circle file path

Wait for shaper to complete. The clarification flow may take several rounds — that's the whole point of using shaper instead of stashing the draft verbatim.

## Step 5 — Confirm to user

When shaper returns, report:

1. **Path to the new Circle file** — full path, copy-pasteable.
2. **One-line summary of the refined Directive** — extract from the file's `## Directive` section (first non-empty paragraph).
3. **Follow-up hint** — print:

   > *Next:*
   > - *Run `/fusion:next` to see this Circle ranked in the portfolio alongside other anticipated Circles, then confirm the activation prompt.*
   > - *Or run `/fusion:next <basename>` to activate it directly (skips the proposal step and goes straight to the activation confirm). `--write-activation <basename>` is retained as a back-compat alias.*

   Substitute `<basename>` with the actual filename (e.g. `260511-1925[a]-replace-auth-with-oauth.md`).

This is the entire user-facing output.

## Boundaries

- The skill never writes Circle file content directly — shaper produces it.
- The skill never starts an orchestrator Turn loop. Capture is the whole product.
- The skill never modifies an existing Circle file. It only causes a *new* `[a]` Circle to come into being.
- The skill is safe to invoke during an active orchestrator session — a new `[a]` Circle does not affect the active `[t]` Circle (and `.active-circle` is unchanged). The orchestrator's own writes are limited to its own loop and `.active-circle` at marker transitions.

## Tone

Concise. The user invoked this to capture a Directive, not to read meta-commentary. Shaper handles the clarification dialogue; this skill is just the entry point and the post-write confirmation.
