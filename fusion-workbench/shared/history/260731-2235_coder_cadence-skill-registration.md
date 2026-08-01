# Session — register /fusion:cadence in the documentation surfaces

**Agent:** coder
**Date:** 2026-07-31 22:35
**Task:** T2 of the cadence-skill Circle — register the skill added by T1 (`a4c37b2`, `skills/cadence/SKILL.md`) in every place fusion enumerates its skills or its artifact kinds.
**Status:** Complete

## What was done

Grepped for the enumeration points rather than working from the task's list alone (`log-activity`, `fusion:memo`, `fusion:archive` across `*.md`/`*.json`/`*.sh`, excluding the workbench). Five candidate surfaces surfaced; four were edited.

### Changed

1. **`rules/fusion-workbench-conventions.md`** — three edits, all in the artifact-kind registration:
   - `## Filename Patterns` table: new row `Cadence digest | $OUT_MEMO | cadence-<username>.md | no`, placed directly after the Memo row (same store, same no-marker column).
   - One sentence added below that table recording the write-semantics split inside `$OUT_MEMO`: memo/task files append, the cadence digest is overwritten each run. The skill body itself flags this as a live confusion risk (`skills/cadence/SKILL.md` step 8), so the convention file is where a reader should find it settled.
   - `## State Markers — issues and planning` closing sentence: added "cadence" to the list of file kinds that carry no state marker, so it matches the new table row.

2. **`CLAUDE.md`** — `/fusion:cadence` inserted into the `User-invocable skills:` line after `/fusion:log-activity`. Kept the line's existing (non-alphabetical, roughly grouped) ordering.

3. **`README.md`** — the "two skills surface the workbench for you directly" paragraph (was line 150) became three, with cadence described as a digest over the activity log + session histories + git, overwritten each run, and explicitly *summarizing rather than replacing* `/fusion:log-activity`. Prose, matching the neighbourhood; no new section or bullet list.

4. **`README-agents.md`** — the `### skills/` slash-command table gained a `/fusion:cadence` row after `/fusion:memo`. This surface was not in the task brief; found by grep.

### Deliberately not changed

- **`skills/help/SKILL.md`** — grepped for `log-activity`, `memo`, `archive`, `skills`. It does not enumerate skills anywhere. It names `/fusion:setup`, `/fusion:next` and `/fusion:unlock` only where the surrounding procedure needs them (entry-point routing, install, configure). There is no list to extend, so nothing was added rather than inventing a home for it. This also keeps the file clear of the path-literal lint gate, which binds every `skills/*/SKILL.md` except setup and migrate.
- **`docs/philosophy.md`** (pillar 3, traceability) — names `/fusion:memo` and `/fusion:log-activity` as illustrations of "traceability lands on disk". Judgement call: it is example prose in a *why* document, not an enumeration, and the pillar reads complete without a third example. Flagged to the user rather than edited.

## Verification

- `npm test` from `hooks/` — 316 passed, 12 files, path-literal lint included.
- `claude plugin validate .` — passed (1 pre-existing warning: plugin-root `CLAUDE.md` not loaded as project context).
- `git status --porcelain` — exactly the four intended files, plus the pre-existing untracked `fusion-workbench/`.

No version bump (that is T3). No commit — left to the orchestrator.
