---
description: Archive completed/aged fusion-workbench artifacts. Supports pre-defined safety tiers (tier-1/tier-2/tier-3) or natural-language description. Survey, propose, confirm, then move into the workbench's archive store.
argument-hint: tier-1 | tier-2 | tier-3 | <natural-language description>
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Archive

Move a curated set of workbench artifacts out of the live workbench and into a timestamped archive subfolder. Archives are local, on-disk snapshots — moved, not copied — so the live workbench stays focused.

**Whether git preserves the bytes is the project's decision, not this skill's.** fusion ships no `.gitignore` rule for the workbench, so a consuming project's workbench may be tracked, ignored, or neither (`rules/fusion-workbench-conventions.md` `## Which of them a tracked workbench tracks`). Only where the project tracks it does a past commit still hold what a move relocated. Where it does not, the archive folder is the **only** copy of every artifact this skill moves: Step 7's collision guard prevents an overwrite, and nothing after that prevents a loss.

## What changed with the Circle-container layout

**A closed Circle archives in one piece.** A Circle is a directory holding its own planning, issues, decisions, history, reviews and analyses (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`). Archiving it is one `mv` of one directory — not a collection pass across ten type folders hunting for files that belong together. The tier logic below is the same idea it always was; it just has less to do.

Two rules follow from the container premise, and they are what keep this skill simple:

1. **Circle artifacts travel with their Circle.** This skill never reaches inside a Circle to archive individual files. A Circle's closed issue is archived when the Circle is, and not before.
2. **The per-file passes therefore only ever touch the shared store.** Everything a tier enumerates below either is a whole terminal Circle or lives in `shared/`.

## Where archives go

```
<archive store>/<YYMMDD-HHMM>-<slug>/
```

- `YYMMDD-HHMM` from `date +%y%m%d-%H%M` (never guess).
- `<slug>` is a short kebab-case label (lowercase, alphanumerics + dashes, ≤ 40 chars). For tier mode the slug is `safe-cleanup-tier-<n>`. For natural-language mode it's derived from the description.
- One archive folder per `/fusion:archive` invocation. Never reuse a folder.
- Inside the archive folder, preserve the original path relative to `$WORKBENCH`. A Circle directory keeps its whole subtree.

## Step 1 — Resolve paths

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" archive
```

Hold the emitted `KEY=value` values for the rest of the skill. `$WORKBENCH` is absolute; everything else is workbench-relative. On a non-zero exit, read the code — it says whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes):

- **Exit 1** — no workbench above `pwd`. Halt: there is nothing to archive. Tell the user to run `/fusion:setup` at the project root.
- **Exit 3** — `.active-circle` is orphaned or corrupt. Report the resolver's stderr verbatim; tell the user to fix or delete the pointer. Do not proceed — archiving against an inconsistent workbench state is how artifacts get lost.
- **Exit 4** — an internal error in `fusion-paths`. The user's workbench is fine; do **not** send them to check `.active-circle`. Report it as a fusion bug and stop.

`CIRCLE` is emitted only when a Circle is active. That line is what tells the two states apart.

**Deriving the shared store.** Every `SCAN_*` value carries both stores — the active Circle's and the shared one — and collapses to the shared store alone when no Circle is active (`rules/fusion-workbench-conventions.md` `## Path Resolution` → invariant 2). The shared store of a kind is therefore what remains of its `SCAN_*` value after dropping the active Circle's path:

```bash
# Split via command substitution, not `for p in $1`: zsh does not word-split an
# unquoted parameter expansion, but both bash and zsh field-split an unquoted
# command substitution. Store paths never contain whitespace, so the split is safe.
shared_of() { for p in $(printf '%s\n' "$1"); do case "$p" in "${CIRCLE:-__no_active_circle__}"/*) continue ;; esac; printf '%s\n' "$p"; done; }
SHARED_PLANS="$(shared_of "$SCAN_PLANS")"; SHARED_ISSUES="$(shared_of "$SCAN_ISSUES")"; SHARED_DECISIONS="$(shared_of "$SCAN_DECISIONS")"; SHARED_REVIEWS="$(shared_of "$SCAN_REVIEWS")"; SHARED_HISTORY="$(shared_of "$SCAN_HISTORY")"
for v in "PLANS:$SHARED_PLANS" "ISSUES:$SHARED_ISSUES" "DECISIONS:$SHARED_DECISIONS" "REVIEWS:$SHARED_REVIEWS" "HISTORY:$SHARED_HISTORY"; do
  case "$v" in *:) echo "shared-store derivation for ${v%:} came back empty although the resolver emitted a SCAN_* value — workbench state or derivation is broken" >&2; exit 1 ;; esac
done
```

This derives the shared store from the invariant, not from the order the resolver happens to print the two paths in. Do not take "the last field" — that ordering is not part of the contract.

**An empty derivation is an error, never an empty result.** Invariant 2 guarantees every `SCAN_*` value contains the shared store, so `shared_of` coming back empty means the derivation or the workbench state is broken — not that there is nothing to archive. The check above halts on it (`HYG-NO-SILENT-FAIL`); when it trips, report the failing kind to the user and stop. Do not proceed to a survey that would silently skip a whole store and report "nothing to archive".

## Argument modes

The skill takes one of:

- `tier-1` / `tier-2` / `tier-3` — mechanical, pre-defined safety tiers (described below). Optionally followed by an age threshold like `tier-3 21d` (default 14d).
- `<natural-language description>` — ad-hoc archive: describe what to move; skill surveys, applies safety filters, proposes, confirms.
- (empty) — ask the user via `AskUserQuestion` whether they want a tier or a natural-language description.

## Marker vocabulary (per `rules/fusion-workbench-conventions.md`)

| Artifact kind | Markers | Terminal? |
|---|---|---|
| Circle record | `_a_` anticipated · `_t_` active · `_c_` closed-coherent · `_b_` bounded closure · `_s_` superseded · `_d_` deferred | `_c_`, `_b_`, `_s_`, `_d_` |
| Defect, spec/plan | `_o_` open · `_p_` in-progress · `_c_` closed · `_d_` deferred | only `_c_` |
| Decision record | `_o_` open · `_a_` answered · `_i_` implemented · `_d_` deferred · `_s_` superseded | `_i_` and `_s_` |
| History, review, analysis, investigation, consultation, memo | none | n/a |

**Terminal** = work is done; the artifact is a record, not a live work item. Only terminal-state artifacts are safe to bulk-archive without per-file review.

**Terminal is not the same as archive-class.** `_d_` (deferred) is terminal in both the Circle and the defect vocabularies, and is still excluded from every tier — see safety filter 2.

## Safety filters (apply to ALL modes)

These are non-negotiable defaults. The user can override them at the `refine` step in natural-language mode, but the tier modes treat them as hard guardrails.

1. **Reserved — never archive.** The root-anchored surfaces, because their consumers read them at fixed paths and none has a fallback (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`):
   - `$WORKBENCH/agentstate.yaml`, `$WORKBENCH/orchestrator-live.md`, `$WORKBENCH/orchestrator-events.jsonl`
   - `$WORKBENCH/$TASKLIST`, `$WORKBENCH/$PORTFOLIO`
   - `$WORKBENCH/.guard-state/`, `$WORKBENCH/.commit-lock/`, `$WORKBENCH/.session-marker`, `$WORKBENCH/.active-circle`, `$WORKBENCH/.fusion-setup`
   - `$WORKBENCH/monitor`, `$WORKBENCH/stilwerk/`, `$WORKBENCH/stashes/`
   - Anything already under the archive store.

2. **Active markers — never archive in tier modes:**
   - The **active Circle** (`$CIRCLE`) and any anticipated (`_a_`) or active (`_t_`) Circle — live work.
   - `_d_` Circles — *deferred ≠ done*; the user may want to revisit. Terminal, but excluded by default.
   - `_o_` (open) and `_p_` (in-progress) defects and plans — live work.
   - `_d_` defects and plans — same reasoning as `_d_` Circles.
   - `_a_` decisions — answer recorded but not yet realised in code/data. Archiving breaks decision↔implementation traceability. Promote to `_i_` when implementation lands; do not bulk-archive `_a_`.

3. **CLAUDE.md citation check:** if a file is referenced from `CLAUDE.md` (by relative path or filename), exclude it from the proposal regardless of tier or marker. CLAUDE.md is auto-loaded into every Claude session — its references must remain resolvable. For a Circle directory, check its directory name and its record.

4. **Out of tier scope by construction.** The tiers below enumerate what they include; anything they do not name is unreachable from a tier. That covers investigations, consultations, memos and analyses in the shared store — they hold strategic deliverables, briefings and source artefacts, and they are archive-class only with the user's explicit natural-language ask.

   This is deliberately a positive enumeration rather than an exclusion list. An exclusion list has to be kept in step with every directory the layout gains, and goes silently out of date when it isn't. What a tier does not name, a tier cannot touch.

## Tier definitions

Each tier is **additive**: tier-2 includes tier-1, tier-3 includes tier-2. The default age threshold for "aged" buckets is 14 days; override with `tier-N <D>d` (e.g. `tier-3 21d`).

### Tier 1 — Terminal Circles + terminal markers in the shared store

| Target | Selection | Reason |
|---|---|---|
| `$SCAN_CIRCLES/<dirname>/` | record marker is `_c_`, `_b_` or `_s_` | closed, bounded or superseded Circle — terminal; moves as one directory |
| `$SHARED_ISSUES` | `*_c_*.md` | closed defect, terminal |
| `$SHARED_PLANS` | `*_c_*.md` | closed plan, terminal |
| `$SHARED_DECISIONS` | `*_i_*.md` | implemented decision, terminal |
| `$SHARED_DECISIONS` | `*_s_*.md` | superseded decision, terminal |

### Tier 2 — Tier 1 + aged shared reviews

Adds `$SHARED_REVIEWS/*.md` whose filename date prefix is older than the threshold. Reviews don't carry markers; aging is the only signal. All three review kinds (coderev, ontorev, conceptrev) share this one store and are distinguished by the sender in the filename.

### Tier 3 — Tier 2 + aged shared history

Adds `$SHARED_HISTORY/*.md` whose filename date prefix is older than the threshold. Old session logs are archive-class; the orchestrator only reads recent history for context.

## Process

1. **Resolve paths.** Step 1 above. `cd` to the directory holding `$WORKBENCH` so relative paths resolve.

2. **Parse the argument.**
   - Match against `^tier-[123]( +(\d+)d)?$` for tier mode (capture the optional age threshold; default 14).
   - Otherwise treat as a natural-language description.
   - If empty, ask via `AskUserQuestion` whether they want `tier-1` / `tier-2` / `tier-3` / describe.

3. **Build the candidate list.**

   **Circles (all tiers).** Enumerate the records and read the marker from the name. One pass, no bracket expression, no glob per state:

   ```bash
   find "$WORKBENCH/$SCAN_CIRCLES" -mindepth 2 -maxdepth 2 -name '*_circle.md' 2>/dev/null | while IFS= read -r f; do d="$(basename "$(dirname "$f")")"; m="$(basename "$f" | sed -nE 's/^_([a-z])_.*/\1/p')"; case "$m" in c|b|s) printf '%s\t%s\n' "$m" "$d" ;; esac; done
   ```

   **Enumerate the records; do not glob one marker at a time.** The underscore marker is inert as a glob — `_c_circle.md` matches literally, no escaping — so the enumeration form above (which reads the marker as data in one pass) is the form to use; a per-state glob such as `$SCAN_CIRCLES/*/_c_circle.md` also resolves correctly, and `find -name '_c_circle.md'` needs no special handling. See `rules/fusion-workbench-conventions.md` `## Marker globs`.

   Skip any directory equal to `$CIRCLE`'s basename as a second guard — the active Circle's record carries `_t_` and is already excluded by marker, but a workbench whose pointer and marker disagree is exactly the case where a single guard isn't one.

   A Circle directory holding no record, or more than one, is a workbench-state fault: report it, exclude it, do not guess which record is real.

   **Shared files (per tier).** Mechanically expand the tier's globs against the `$SHARED_*` values derived in Step 1. For aged buckets, parse the `YYMMDD` (or legacy `MMDD`) date prefix and compare to `today - threshold`.

   **Natural-language mode.** Survey what the description suggests; apply safety filters as defaults but flag any active-marker hits with `[ACTIVE]` rather than silently dropping them — the user may want them at `refine`.

4. **CLAUDE.md citation check.**
   ```bash
   KEEP=""; for f in <candidates>; do bn="$(basename "$f")"; rel="${f#"$WORKBENCH"/}"; if grep -q -F -e "$bn" -e "$rel" CLAUDE.md 2>/dev/null; then echo "  kept (cited in CLAUDE.md): $rel"; else KEEP="$KEEP$f
   "; fi; done
   ```
   `$KEEP` is the surviving candidate list; a cited file is dropped from the proposal and reported as kept, never silently.

5. **Propose.** Print to the user:
   - Mode (tier-N + threshold, or the natural-language description verbatim).
   - Resolved slug + target archive path.
   - Per-bucket counts. Name the Circles individually — a Circle is a large, meaningful unit and the user should see which ones by name, with their Directive line, not just a count. Files may be counted in bulk.
   - Total file count and total bytes.
   - Anything dropped by the safety filters, with a one-line summary.
   - In natural-language mode, list `[ACTIVE]`-flagged hits explicitly.

6. **Confirm via `AskUserQuestion`.** Write the prompt in the project's language per the `**Language:**` line in `CLAUDE.md` (see `rules/fusion-workbench-conventions.md` `## Project language`), following `rules/user-facing-output.md` and the chat profile at `./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`. Offer:
   - **Archivieren** — archive exactly this list
   - **Ändern** — change scope (drop or add items, change tier, change threshold)
   - **Abbrechen** — abort, change nothing

   Do not move anything until the user picks the first.

7. **Archive on confirmation.**
   - `mkdir -p "$WORKBENCH/archive/<YYMMDD-HHMM>-<slug>/"`
   - For each Circle: recreate the parent path under the archive folder and `mv` the whole directory. One move per Circle.
   - For each shared file: recreate its parent path under the archive folder and `mv` it.
   - Move only — never copy.
   - **A collision never overwrites.** If a destination exists, leave the source in place, say so on stderr, and count it. Losing an artifact to a silent clobber is the one outcome this skill must never produce (`HYG-NO-SILENT-FAIL`).
   - Write the manifest (next step).

8. **Write `MANIFEST.md`** at `<archive store>/<YYMMDD-HHMM>-<slug>/MANIFEST.md`:
   ```markdown
   # Archive Manifest

   **Date:** <YYYY-MM-DD HH:MM>
   **Mode:** <tier-N + threshold> | <natural-language description verbatim>
   **Slug:** <slug>
   **Invoked by:** <orchestrator | direct user>

   ## Circles archived

   <one per line: directory name, marker, Directive one-liner>

   ## Files archived

   <one path per line, original location relative to the workbench root>

   ## Counts

   - <per-bucket counts as in the proposal>
   - **Total:** <N> Circles, <M> files, <total> bytes

   ## Safety filters applied

   - <list of filters that excluded items, e.g. "3 cited from CLAUDE.md", "5 recent reviews", "1 deferred Circle">

   ## Collisions

   <any destination that already existed, and therefore was not moved — or "none">
   ```

9. **Report.** Print archive path, Circle count, file count, manifest path. Any collision needs the user's attention — it means an artifact stayed put. Remind the user that archives are local and not committed automatically; they can `git add` the archive directory if they want the snapshot in version control.

## Guardrails

- **Move, do not copy.** The point is to shrink the live workbench. If the user wants a copy without removal, ask via `AskUserQuestion` before doing it.
- **Never reach inside a Circle.** Individual files within a Circle directory are not archive candidates; the Circle is. A user who explicitly asks for one file out of a Circle in natural-language mode is asking to break the container — surface that consequence before doing it.
- **Never archive the active Circle**, and never archive an anticipated one. Terminal Circles only.
- **Never delete the archive folder.** This skill only creates and adds.
- **Never touch git.** No `git add`, no `git commit`. The user decides whether to commit the archive.
- **Never modify content of what's being archived.** Move only; do not rewrite, reformat, or "tidy".
- **If the survey returns zero matches:** report that and stop. Do not invent candidates. Do not broaden the search without re-asking.
- **The CLAUDE.md citation check is a hard exclusion** — do not surface cited files even with `[ACTIVE]` flags. To archive something cited from CLAUDE.md, the user updates CLAUDE.md first.
