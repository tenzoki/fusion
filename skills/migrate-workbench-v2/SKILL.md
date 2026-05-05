---
description: One-time migration of an existing workbench from v1.x (issues only) to v2.0 (issues + decisions). Walks open issues with the user, classifying each as defect (stays in issues/) or decision (moves to decisions/ with the new marker vocabulary).
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Migrate Workbench to v2

A one-time migration for a workbench created on v1.x of the fusion plugin. v2.0 introduced `fusion-workbench/decisions/` alongside `fusion-workbench/issues/` (see `rules/fusion-workbench-conventions.md`). Open issues that are actually open *questions* belong in `decisions/` under the richer `[o]/[a]/[i]/[d]/[s]` vocabulary.

This skill walks every open issue in `fusion-workbench/issues/`, classifies each as defect or decision (with user confirmation), and moves the decisions to `fusion-workbench/decisions/` while preserving original text. Defects stay where they are.

## Scope and safety

- **Backup first.** Before any moves, the skill copies `fusion-workbench/issues/` to `fusion-workbench/.migration-v2-backup/issues-<YYMMDD-HHMM>/`. Rollback = restore from backup.
- **Move, don't copy.** Items the user marks "decision" are `mv`-ed (with a path-rewrite from `issues/` to `decisions/`).
- **Original text preserved.** When converting, the SKILL prepends the decision-record template scaffolding (Domain, Status, Filed by, Question, Options, Constraints headers) and keeps the original issue body verbatim under a `## Original issue text` section. The user can edit further later.
- **One item at a time.** No bulk-classify. Every classify decision goes through `AskUserQuestion`.
- **Quittable.** The user can stop mid-migration; partial migration is supported (mixed defect/decision state in `issues/` is tolerated by v2.0 agents).
- **No git.** The skill does not stage, commit, or branch. The user controls when (or if) to commit the migration.

## Process

### Step 0 — Confirm and backup

1. Confirm `fusion-workbench/` exists at `pwd`. If not, abort with a message.
2. Confirm `fusion-workbench/issues/` exists and contains at least one open file. If empty, report "no open issues to migrate" and stop.
3. `mkdir -p fusion-workbench/.migration-v2-backup`
4. Backup: `cp -r fusion-workbench/issues fusion-workbench/.migration-v2-backup/issues-$(date +%y%m%d-%H%M)`
5. `mkdir -p fusion-workbench/decisions`
6. Report the backup path to the user.

### Step 1 — Inventory + auto-classification heuristic

1. List open issues: `ls fusion-workbench/issues/*[o]*.md fusion-workbench/issues/*[p]*.md 2>/dev/null` (also include `[c]` and `[d]` if the user opts to migrate closed/deferred items in Step 2 — by default, only open).
2. For each, run a lightweight title-based heuristic for an *initial guess* (the user always confirms):
   - **Likely decision** if the title contains: `which`, `what should`, `decide`, `vs`, `pick`, `choose`, `Stefan to`, `user to`, `open question`, `?`, `or` (between two named options), or starts with a question word
   - **Likely defect** otherwise
3. Report the inventory: total count, count likely-decision, count likely-defect.

### Step 2 — Optional batch override

Ask via `AskUserQuestion`:
- Only migrate `[o]` and `[p]` items (default), or also `[c]` and `[d]`? Closed/deferred items are usually defects-in-history; only migrate them if the user explicitly says so.
- Migrate everything one-by-one (recommended), or accept the heuristic for all "likely decision" items in one batch (faster, riskier)?

### Step 3 — Per-item walk

For each open issue file (in filename order):

1. Read the file. Extract title (line 1 minus `#`) and first paragraph of body.
2. Present to user via `AskUserQuestion`:
   - Show: filename, marker, title, first paragraph, heuristic guess.
   - Options: `defect` (stays in issues/) | `decision` (moves to decisions/) | `skip` (leaves it for later) | `quit` (stops the migration; partial state is fine)

3. If `defect`: no action; continue to next item.
4. If `skip`: log skipped; continue to next item.
5. If `quit`: log "user quit at item N"; jump to Step 4.
6. If `decision`:
   - Determine the new marker:
     - Source `[o]` → new `[o]` (open question)
     - Source `[p]` → new `[o]` (in-progress issues become open questions; the "in progress" state doesn't apply to decisions)
     - Source `[c]` with a `Resolved:` footer pointing to an analysis or planning file → new `[a]` (rewrite footer as `Answered: <path> — <summary from Resolved>`)
     - Source `[c]` with a `Resolved:` footer pointing to a commit → new `[i]` (rewrite footer as `Implemented: <hash> — <summary>`)
     - Source `[d]` → new `[d]` (preserve any deferral note)
   - Build the new file body:
     ```markdown
     # <original title>

     ---
     **Domain:** <ask user: code | data | strategic | knowledge>
     **Status:** open | answered | implemented | deferred
     **Filed by:** migrated from issues/
     **Cross-references:** <leave empty for the user to fill, or copy any references from the original body>

     ---

     ## Question

     <leave the user to phrase the question; placeholder: "see original text below">

     ## Options

     <leave the user to enumerate; placeholder: "see original text below">

     ---

     ## Original issue text

     <verbatim copy of the original issue file body>

     ---
     <appropriate footer line per the new marker>
     ```
   - Write the new file at `fusion-workbench/decisions/<YYMMDD-HHMM>[<new-marker>]-<topic>.md`. Preserve the `YYMMDD-HHMM` from the original filename.
   - Delete (don't `mv` — the body changed) the original file in `fusion-workbench/issues/`.

### Step 4 — Log and report

Write `fusion-workbench/history/YYMMDD-HHMM-v2-migration.md` containing:
- Backup path
- Counts: total reviewed, classified-as-defect, classified-as-decision, skipped, quit-at-N
- List of files moved (old path → new path) and files left in place
- Instructions to the user: "review the new `decisions/` files (Question + Options + Constraints sections need filling in by you); the heuristic-generated scaffolding is a starting point, not a finished record."

## Guardrails

- Never delete the backup.
- Never modify the body of an issue that the user marked `defect`.
- Never write a decision file with a marker the user did not explicitly confirm. If unsure about marker mapping (e.g. a `[c]` issue with no Resolved footer), default to `[o]` and flag in the report.
- Never touch `fusion-workbench/.guard-state/`, `agentstate.yaml`, or other live-state files.
- Never run `git` commands.
- If the user quits mid-migration, leave the partial state as-is. v2.0 agents tolerate mixed populations in `issues/` (defects + uncategorised) — the user can re-run the skill later to finish.
