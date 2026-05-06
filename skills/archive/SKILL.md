---
description: Archive completed/aged fusion-workbench files. Supports pre-defined safety tiers (tier-1/tier-2/tier-3) or natural-language description. Survey, propose, confirm, then move into fusion-workbench/archive/<YYMMDD-HHMM>-<slug>/.
argument-hint: tier-1 | tier-2 | tier-3 | <natural-language description>
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Archive

Move a curated set of workbench files out of the live workbench and into a timestamped archive subfolder. Archives are local, on-disk snapshots — moved, not copied — so the live workbench stays focused while git preserves the bytes.

## Where archives go

```
fusion-workbench/archive/<YYMMDD-HHMM>-<slug>/
```

- `YYMMDD-HHMM` from `date +%y%m%d-%H%M` (never guess).
- `<slug>` is a short kebab-case label (lowercase, alphanumerics + dashes, ≤ 40 chars). For tier mode the slug is `safe-cleanup-tier-<n>`. For natural-language mode it's derived from the description.
- One archive folder per `/fusion:archive` invocation. Never reuse a folder.
- Inside the archive folder, preserve the original directory structure relative to `fusion-workbench/`. Example: `fusion-workbench/planning/260501-1200-auth.md` → `fusion-workbench/archive/260502-1430-safe-cleanup-tier-3/planning/260501-1200-auth.md`.

## Argument modes

The skill takes one of:

- `tier-1` / `tier-2` / `tier-3` — mechanical, pre-defined safety tiers (described below). Optionally followed by an age threshold like `tier-3 21d` (default 14d).
- `<natural-language description>` — ad-hoc archive: describe what to move; skill surveys, applies safety filters, proposes, confirms.
- (empty) — ask the user via `AskUserQuestion` whether they want a tier or a natural-language description.

## Marker vocabulary (per `rules/fusion-workbench-conventions.md`)

| Folder | Markers | Terminal? |
|---|---|---|
| `issues/`, `planning/` | `[o]` open · `[p]` in-progress · `[c]` closed · `[d]` deferred | only `[c]` |
| `decisions/` | `[o]` open · `[a]` answered · `[i]` implemented · `[d]` deferred · `[s]` superseded | `[i]` and `[s]` |
| `history/`, `codereview/`, `ontoreview/`, `analyses/`, `investigations/`, `consult/` | none | n/a |

**Terminal** = work is done; the file is a record, not a live work item. Only terminal-state files are safe to bulk-archive without per-file review.

## Safety filters (apply to ALL modes)

These are non-negotiable defaults. The user can override them at the `refine` step in natural-language mode but the tier modes treat them as hard guardrails.

1. **Reserved files — never archive:**
   - `fusion-workbench/agentstate.yaml`
   - `fusion-workbench/orchestrator-live.md`
   - `fusion-workbench/orchestrator-events.jsonl`
   - `fusion-workbench/tasklist.md`
   - Anything under `fusion-workbench/.guard-state/`
   - Anything already under `fusion-workbench/archive/`

2. **Active markers — never archive in tier modes:**
   - `[o]` (open) — live work
   - `[p]` (in-progress) — live work
   - `[d]` (deferred) — *deferred ≠ done*; the user may want to revisit. Excluded by default.
   - `[a]` (decisions/) — answer recorded but not yet realised in code/data. Archiving breaks decision↔implementation traceability. Promote to `[i]` when implementation lands; do not bulk-archive `[a]`.

3. **CLAUDE.md citation check:** if a file is referenced from `CLAUDE.md` (by relative path or filename), exclude it from the proposal regardless of tier or marker. CLAUDE.md is auto-loaded into every Claude session — its references must remain resolvable.

4. **User-controlled folders** — never include in tier modes:
   - `fusion-workbench/memos/`
   - `fusion-workbench/handoffs/`
   - `fusion-workbench/investigations/`
   - `fusion-workbench/analyses/`
   - `fusion-workbench/consult/`
   - `fusion-workbench/material/`
   These hold strategic deliverables, briefings, and source artefacts. They're archive-class only with the user's explicit natural-language ask — never as part of a bulk tier.

## Tier definitions

Each tier is **additive**: tier-2 includes tier-1, tier-3 includes tier-2. The default age threshold for "aged" buckets is 14 days; override with `tier-N <D>d` (e.g. `tier-3 21d`).

### Tier 1 — Terminal markers only

| Folder | Glob | Reason |
|---|---|---|
| `issues/` | `*[c]*.md` | closed issue, terminal |
| `planning/` | `*[c]*.md` | closed plan, terminal |
| `decisions/` | `*[i]*.md` | implemented decision, terminal |
| `decisions/` | `*[s]*.md` | superseded decision, terminal |

### Tier 2 — Tier 1 + aged reviews

Adds `codereview/*.md` and `ontoreview/*.md` whose filename date prefix is older than the threshold. Reviews don't carry markers; aging is the only signal.

### Tier 3 — Tier 2 + aged history

Adds `history/*.md` whose filename date prefix is older than the threshold. Old session logs are archive-class; the orchestrator only reads recent history for context.

## Process

1. **Resolve workbench root.** Run `"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"`. If empty, halt — there's nothing to archive. `cd` to the printed path so all subsequent paths are relative to it.

2. **Parse the argument.**
   - Match against `^tier-[123]( +(\d+)d)?$` for tier mode (capture optional age threshold; default 14).
   - Otherwise treat as a natural-language description.
   - If empty, ask the user via `AskUserQuestion` whether they want `tier-1` / `tier-2` / `tier-3` / `describe`.

3. **Build the candidate list.**
   - **Tier mode:** mechanically expand the tier's globs. Apply all safety filters above. For aged buckets, parse the `YYMMDD` (or legacy `MMDD`) date prefix and compare to `today - threshold`.
   - **Natural-language mode:** survey the directories the description suggests; apply safety filters as defaults but flag any active-marker hits with `[ACTIVE]` rather than silently dropping them — the user may want them in `refine`.

4. **CLAUDE.md citation check.**
   ```bash
   for f in <candidates>; do
     bn="$(basename "$f")"
     rel="${f#fusion-workbench/}"
     if grep -q -F -e "$bn" -e "$rel" CLAUDE.md 2>/dev/null; then
       # exclude $f
     fi
   done
   ```
   Cited files are dropped from the proposal automatically.

5. **Propose.** Print to the user:
   - Mode (tier-N + threshold, or the natural-language description verbatim).
   - Resolved slug + target archive path.
   - Per-bucket counts (e.g. *"Tier 1 closed issues: 169 · superseded decisions: 4 · implemented decisions: 1 · closed planning: 41 — total 215"*).
   - File count and total bytes.
   - Anything dropped by the safety filters with a one-line summary (e.g. *"Excluded: 3 files cited from CLAUDE.md, 2 [a] decisions, 5 recent reviews"*).
   - In natural-language mode, list `[ACTIVE]`-flagged hits explicitly so the user can see them.

6. **Confirm via `AskUserQuestion`.** Offer:
   - `proceed` — archive exactly this list
   - `refine` — change scope (drop or add specific items, change tier, change threshold)
   - `cancel` — abort, change nothing

   Do not move anything until `proceed`.

7. **Archive on `proceed`.**
   - `mkdir -p fusion-workbench/archive/<YYMMDD-HHMM>-<slug>/`
   - For each file: recreate its parent path under the archive folder and `mv` it. Move only — never copy.
   - Write the manifest (next step).

8. **Write `MANIFEST.md`** at `fusion-workbench/archive/<YYMMDD-HHMM>-<slug>/MANIFEST.md`:
   ```markdown
   # Archive Manifest

   **Date:** <YYYY-MM-DD HH:MM>
   **Mode:** <tier-N + threshold> | <natural-language description verbatim>
   **Slug:** <slug>
   **Invoked by:** <orchestrator | direct user>

   ## Counts

   - <per-bucket counts as in the proposal>
   - **Total:** <N> files, <total> bytes

   ## Files archived

   <one path per line, original location relative to fusion-workbench/>

   ## Safety filters applied

   - <list of filters that excluded items, e.g. "3 cited from CLAUDE.md", "5 recent reviews">
   ```

9. **Report.** Print archive path, file count, manifest path. Remind the user that archives are local — not committed automatically. They can `git add fusion-workbench/archive/<dir>/` if they want the snapshot in version control.

## Guardrails

- **Move, do not copy.** The point is to shrink the live workbench. If the user wants a copy without removal, ask `AskUserQuestion` whether to switch to copy mode before doing it.
- **Never delete the archive folder.** This skill only ever creates and adds.
- **Never touch git.** No `git add`, no `git commit`. The user decides whether to commit the archive.
- **Never modify content of files being archived.** Move only; do not rewrite, reformat, or "tidy".
- **If the survey returns zero matches:** report that and stop. Do not invent files. Do not broaden the search without re-asking.
- **The CLAUDE.md citation check is a hard exclusion** — do not surface cited files even with `[ACTIVE]` flags. If the user wants to archive something cited from CLAUDE.md, they have to update CLAUDE.md first.
