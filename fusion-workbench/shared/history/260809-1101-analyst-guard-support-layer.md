# Session: analyst — the compliance guard's support layer

**Date:** 2026-08-09 11:01
**Agent:** analyst
**Domain:** code
**Status:** Complete
**Circle:** none active; filed to `shared/`
**Tree:** HEAD `451a07e`

## Task

Dispatched to analyse the support layer beneath the guard's two enforced
policies: configuration, path resolution and persistent state. Twelve
TypeScript modules plus `fusion-guard.json` and its template. Six questions,
each to be answered with `file:line` evidence. A parallel analysis covered the
enforced policies (`guard.ts`, `tracker.ts`, `protected-snapshot.ts`,
`git-branch-guard.ts`, `shell-parse.ts`, `command-word.ts`); those files were
read only at the boundary, for callers and consumers.

## What was done

Read all twelve modules in full, plus `hooks/config.json`,
`rules/protected-path-discipline.md`, `README-hooks.md` and the relevant
`CLAUDE.md` sections. Traced every consumer of the support modules by grep
across `hooks/`, `bin/`, `skills/`, `agents/` and `rules/`. Measured the
comment-versus-code split per file with a comment-aware counter. Ran one
execution check in a scratch workbench under `/tmp` to confirm the churn
coercion defect rather than infer it.

## Headline findings

- The layer is 3,112 lines: 1,197 code, 1,699 comment, 216 blank. It is not
  oversized in mechanism; it is oversized in argument, and the argument is
  distributed inversely to where the remaining defects sit.
- `rules-write-exemption.ts` is 151 lines of code under 572 of comment. About
  25 of those comment lines describe the retired Bash classifier.
- `config.ts` is 374 code lines, of which roughly 250 are on the path to the
  three keys the policies act on (`protectedPaths`, `enabled`,
  `blocksBeforeHalt`).
- Of the five `.guard-state/` files, two steer a branch (`escalation.json`,
  `protected-snapshot.json`) and three do not. `cross-file.json` has no reader
  anywhere outside the accumulation that writes it.
- The documented cwd-versus-root stand-down asymmetry is implemented as
  described. A third, undocumented anchor exists: the write-tool surface judges
  paths in cwd space against configuration authored in workbench-root space.

## Artifacts

- `shared/analyses/260809-1101-guard-support-layer.md` — the report, with two
  Mermaid diagrams (module dependencies, state-file readers and writers) and six
  ranked consolidation targets.
- Four defects filed to `shared/issues/`:
  - `260809-1101_o_churn-and-cross-file-state-are-cast-not-coerced-so-a-shape-valid-file-swallows-the-halt-message.md` (High, verified by execution)
  - `260809-1101_o_churn-and-cross-file-criticals-latch-permanently-and-never-reset.md` (Medium)
  - `260809-1101_o_escalation-json-read-modify-write-can-lose-a-halt-raised-by-a-parallel-tool-call.md` (Medium, interleaving marked speculative)
  - `260809-1101_o_an-absent-plugin-config-layer-yields-an-empty-protected-list-with-no-diagnostic.md` (Low by reachability)

## Open threads handed on

- Whether the decision-governed check (CHECK 3) is a live feature. Inert on
  shipped defaults, reachable by any consuming project, and no consuming
  project's configuration is visible from this tree. Wants a decision record
  before its 60 lines of support are touched.
- Whether cross-file tracking should survive at all.

## Notes on method

Read-only throughout; no code, data or configuration was modified. Three claims
carry explicit calibration labels in the report: one `speculation:` (the
escalation interleaving), two `inference:` (CHECK 3 reachability, the plugin-config
absence). Everything else is read from the tree or measured.
