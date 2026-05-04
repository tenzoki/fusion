---
description: Archive a set of fusion-workbench files described in natural language. Survey the workbench, propose matching items, ask for confirmation, then move them into fusion-workbench/archive/<MMDD-HHMM>-<slug>/.
argument-hint: <description of what to archive — e.g. "completed planning docs", "last orchestrator session", "old issues from before the auth refactor">
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Archive

Move a curated set of workbench files out of the live workbench and into a timestamped archive subfolder. Archives are local snapshots — moved, not copied — so the live workbench stays focused and small.

## Where archives go

```
fusion-workbench/archive/<MMDD-HHMM>-<slug>/
```

- `MMDD-HHMM` from `date +%m%d-%H%M` (never guess).
- `<slug>` is a short kebab-case label derived from the description (lowercase, alphanumerics + dashes, ≤ 40 chars). Example: `0502-1430-completed-planning-docs`.
- One archive folder per `/fusion:archive` invocation. Never reuse a folder.
- Inside the archive folder, preserve the original directory structure relative to `fusion-workbench/`. Example: `fusion-workbench/planning/0501-1200-auth.md` → `fusion-workbench/archive/0502-1430-completed-planning-docs/planning/0501-1200-auth.md`.

## Inputs

- **Empty argument** — ask via `AskUserQuestion` what to archive. Do not survey or propose anything until the user provides a description.
- **Argument present** — use it as the description for slug + match scope.

## Process

1. Resolve `pwd`. Confirm `fusion-workbench/` exists. If not, abort and tell the user there is nothing to archive.
2. Resolve the description (from argument or via `AskUserQuestion`).
3. **Survey the workbench.** Read the relevant directories given the description:
   - `fusion-workbench/planning/`
   - `fusion-workbench/issues/`
   - `fusion-workbench/history/`
   - `fusion-workbench/codereview/`
   - `fusion-workbench/ontoreview/`
   - `fusion-workbench/investigations/`
   - `fusion-workbench/analyses/`
   - `fusion-workbench/memos/`
   - `fusion-workbench/consult/` (if present)

   Use `ls -1` per directory and `head` on candidate files to confirm content matches the description. Use the workbench filename markers (`[o]` open, `[p]` in-progress, `[c]` complete, `[w]` won't-do — see `rules/fusion-workbench-conventions.md`) to filter. For example, "completed planning" → `planning/*[c]*.md`. Never archive `agentstate.yaml`, `orchestrator-live.md`, `orchestrator-events.jsonl`, `tasklist.md`, or anything in `.guard-state/`.
4. **Propose a match list.** Print to the user:
   - the resolved slug + target archive path
   - every file proposed for archival, one per line, with size or one-line preview
   - file count and total bytes
5. **Confirm via `AskUserQuestion`.** Offer three options:
   - `proceed` — archive exactly this list
   - `refine` — user will narrow or expand the list (re-run survey with more specific criteria)
   - `cancel` — abort, change nothing
   Do not move anything until `proceed`.
6. **Archive.** On `proceed`:
   - `mkdir -p fusion-workbench/archive/<MMDD-HHMM>-<slug>/`
   - For each file, recreate its parent path under the archive folder and `mv` it (do not copy — archive means it leaves the live workbench).
   - Write a manifest at `fusion-workbench/archive/<MMDD-HHMM>-<slug>/MANIFEST.md` containing: timestamp, description (the user's argument verbatim), source paths archived, file count, total bytes, and the user agent that ran the archive (orchestrator vs direct user invocation if known).
7. **Report.** Print archive path, file count, and remind the user that archives are local — they are not committed automatically.

## Guardrails

- **Never archive these files**, even if the description seems to match: `fusion-workbench/agentstate.yaml`, `fusion-workbench/orchestrator-live.md`, `fusion-workbench/orchestrator-events.jsonl`, `fusion-workbench/tasklist.md`, anything under `fusion-workbench/.guard-state/`, anything already under `fusion-workbench/archive/`.
- **Move, do not copy.** The whole point is to shrink the live workbench. If the user wants a snapshot without removal, they should say so explicitly — at that point ask `AskUserQuestion` whether to switch to copy mode.
- **Never archive an open or in-progress item silently.** If the proposed list contains files marked `[o]` or `[p]`, surface them in the proposal with a clear flag (e.g. `[OPEN]`) so the user can drop them at the `refine` step.
- **Never delete the archive folder** in any subsequent invocation. `/fusion:archive` only ever creates and adds.
- **Never touch git.** No `git add`, no `git commit`. The user decides whether to commit the archive.
- **Never modify content of files being archived.** Move only; do not rewrite, reformat, or "tidy" archived files.
- If the survey returns zero matches, report that and stop. Do not invent files. Do not broaden the search without re-asking.
