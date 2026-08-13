# Analyst session — documentation staleness survey

**Date:** 2026-08-13 08:28
**Agent:** analyst
**Domain:** code
**Dispatched by:** orchestrator, on the user's request for a Grounding snapshot for a documentation Circle
**Status:** Complete

## Task

Survey the plugin's user-facing and operator-facing documentation for contradiction, omission and
lag against the code and prompts. Six named leads: version-surface coherence, the v8.0.0
protected-path removal, the v8.1.0 additions, agent and skill inventories, the `bin/` helper
inventory, and dead citations.

## What was done

Read `README.md`, `README-agents.md`, `docs/philosophy.md`, `docs/working-model.md`,
`skills/help/SKILL.md` and `CLAUDE.md` in full; `README-hooks.md` and `install.sh` in part;
`docs/plane-setup.md` by grep only. Ran the citation lint, the enumeration lint and the full
48-file hooks suite. Read `agents/shaper.md`, `agents/planner.md`, `hooks/lib/config.ts`,
`hooks/config.json`, `hooks/config.example.json` and `templates/fusion-guard.json` for the
reality side of each candidate. Resolved `bin/fusion-paths` live for shaper and planner.

Every doc-side claim was verified against the thing it describes before it was written down. Two
candidates were dropped after reading: `docs/plane-setup.md`'s one-commit lag behind
`bin/fusion-plane` (the commit changed a test-seam comment, not behaviour), and the `bin/`
helpers that looked undocumented but are authored in `README-hooks.md` or
`rules/workbench-stash-and-lock.md`.

## Result

Fifteen findings. Three of the six leads came back clean, and saying so was as much of the
result as the defects: the four version surfaces agree at 8.1.0, the protected-path removal is
documented accurately everywhere, and the citation lint passes over every surface in scope.

The drift concentrates in the v8.1.0 feature set. The release's documentation step (`0978e9a`)
reached three files; the feature reached seven surfaces. `README-agents.md` is the worst
document, `CLAUDE.md` second on a different axis (accurate about behaviour, incomplete about
inventory).

## Outputs

- `shared/analyses/260813-0828-documentation-staleness-survey.md` — the report
- `shared/issues/260813-0828_o_three-tests-fail-at-head-in-two-files-and-no-open-record-names-them.md` — the one out-of-scope defect found

## Worth carrying forward

Two of the fifteen findings are mechanically derivable and belong in
`derivable-enumerations-lint.test.ts` rather than in a corrected line: the `bin/` roster against
`CLAUDE.md`'s Layout table, and the workbench file count against `git ls-files`. The gate file
already derives four such enumerations, so this extends an existing abstraction rather than
adding one.

The reference lint's coverage has two gaps this survey walked into: it does not resolve workbench
directory paths written as prose, which is how `README-agents.md:268` kept citing a directory
deleted in v4.0.0.
