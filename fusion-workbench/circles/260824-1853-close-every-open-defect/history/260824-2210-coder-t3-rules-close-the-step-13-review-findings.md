# Coder T3-rules: close the three findings of the step-13 review

**Sender:** coder
**Date:** 2026-08-24
**Status:** Complete
**Circle:** circles/260824-1853-close-every-open-defect

## Task

Close issues `260824-2151`, `260824-2152`, `260824-2153` filed by `reviews/260824-2154-coderev-step-13-rules-commit.md`.

## What changed

- `rules/fusion-workbench-conventions.md` `## Filename Patterns`: the heading-anchor clause now scopes itself to living text (prompts, rules, docs) and states that a `Resolved:`/`Answered:`/`Implemented:` line is a point-in-time citation carried by its commit, with `path:line` as its form. The contradiction is resolved at the rule; the 24 notes and the `_a_`/`_i_` rows stand. +202 bytes.
- `agents/orchestrator.md` `## Circle head fields`: "two literal openings" is "three".
- `agents/playmaker.md` confirmed-operations block: the `split` line is the header form with two indented produced-entry lines, matching `rules/circle-records.md` and `skills/next/SKILL.md`. +4 bytes.
- `bin/fusion-commit-lock` header, `with` entry: the command runs from the workbench root and pathspecs are written absolute.
- Goldens regenerated: `rules-emission.golden`, `surface-growth.golden`.

## Head-rooms

- always-on rule set: 216 before, 14 after (98 559 of 98 573).
- `agents/`: 3 011 before, 3 007 after.
- hook tests: 0 before, 0 after (no line added).
- `reference-resolution-lint` BASELINE: not moved (closure notes are workbench records, outside its surface; the new prompt text carries no rooted path).

## Departures from the records' proposals

`2151` proposed a clause in each of the `_a_`/`_i_` rows and the template plus a rewrite of the 24 notes; the dispatch chose one statement at the clause and left the notes, which the clause now sanctions.

## Verification

`cd hooks && npm test` — exit 0; 43 files, 760 tests. Open-issue find prints nothing.
