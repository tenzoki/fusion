# Step 11 — the shipped text says what the guard now is

**Agent:** coder
**Date:** 2026-08-17
**Circle:** 260816-1741-guard-becomes-observation-only
**Plan:** `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_p_the-compliance-guard-becomes-observation-only.md`, step 11
**Status:** Complete

## What was asked

Bring every shipped text surface into line with a guard that decides nothing,
working from step 11's own nine-file list plus six defect records that amend it:
`260816-2124` (`bin/fusion-turn-budget`'s header), `260816-2125`
(`hooks/lib/guard-state-file.ts`), `260816-2126` (`docs/upgrading-to-v9.md` and
`docs/working-model.md:162`), `260816-2127` (`skills/setup/SKILL.md`'s attribution
of the legacy flag), `260816-2315` (`hooks-wiring.test.ts`'s Bash justification)
and `260816-2321` (two lines the step's line-scoped text left inside files it
already opens). `CLAUDE.md` and everything under `rules/` were out of bounds:
both belong to the curator at step 16.

## Measurement before

`cd hooks && npm test` — exit 1, **3 files / 5 cases** red:

- `derivable-enumerations-lint` (1) — the `hooks/lib` table in `README-hooks.md`
  still carried rows for `escalation.ts` and `project-relative.ts`.
- `reference-resolution-lint` (2) — 29 dangling citations across the shipped
  text, and the pinned reference counts at `paths: 1122` against an actual 1093.
- `surface-growth-bound` (2) — step 10's.

## What changed

### The two lints, which are what this step is verified by

`derivable-enumerations-lint` is **green**. The two dead rows came out of the
`hooks/lib` table, which is back in set equality with `hooks/lib/*.ts` at twelve
entries.

`reference-resolution-lint` is green **except its whole-surface case**, and the
four citations keeping it red are all in `CLAUDE.md`: `:29` and `:129` name
`hooks/lib/project-relative.ts`, `:30` names `templates/fusion-guard.json` and
`hooks/config.json`. Every one of the other 25 is gone. **Step 16 is therefore
sufficient to finish this gate** — nothing outside `CLAUDE.md` is left for it.

The pinned counts were re-approved in the same change, `paths` 1122 → 1103, with
a note saying what the number is made of. It is two opposed halves rather than
one movement: steps 2 to 7b deleted the modules and files that 29 of the pinned
citations named, which had already taken the count to 1093 with no step
re-approving it in between, and this step's own rewrite puts 10 back by citing
what survived — `templates/fusion.json`, `hooks/lib/config.ts`, the three `bin/`
helpers behind the work-tree preference, `hooks/session-start.ts`. `anchors` and
`records` did not move.

Two `EXAMPLE_PATHS` edits went with it, both forced rather than chosen.
`rules/relevant-file.md` had to come **out**: it was the fabricated `ruleFile`
value in `README-hooks.md`'s *Adding a decision* example, and the no-dead-weight
case went red the moment that section was deleted. `lib/escalation.ts` went
**in**, on the precedent of the four modules the protected-path removal left
named on purpose — `README-hooks.md` names it in the account of its own removal
and in the Origin table, which are the sections that exist because the module
does not.

### `README-hooks.md` — rewritten around the two products

The opening sentence, `## Concept`, the `## Architecture` diagram, `### 2.
Review the configuration`, the `## Files` and `hooks/lib` tables, the whole
`## Usage` run and `## Origin`. The file now leads with what the hook produces —
the write trace and the configuration diagnostic — and carries every removed
check as history with its measurement.

`### Escalation` became `### The decision-governed deny, the escalation counter
and the halt were removed on 2026-08-16`, carrying the composition that ended
them: with the protected-path half gone the deny was the only remaining halt
source, it shipped switched off, neither reachable consuming project had armed
it, and all 50 recorded `guard_block` rows in the larger one's 37 186 events
read "Protected path".

`### Tuning or disabling the guard` became `### Tuning the guard: there is
nothing left to tune`. `### Clearing a halt` and `### Adding a decision` were
**deleted whole**: the first names a script that is gone, the second configures a
check that is gone, and neither has a shorter true form. What a halt was, and
what a project still carrying one should do, is now one section that says the
remedy is `/fusion:setup`'s deletion offer.

`### Per-project configuration: fusion-guard.json` became
`### Per-project configuration: fusion.json`, with the two-layer merge, the one
leaf, and retirement at its two scopes — the retired **file** and the three
retired top-level keys — including the statement that the retired-file
diagnostic is the whole of the v10 migration.

Two paragraphs stale before this Circle were corrected while the file was open:
the churn section's claim that session-state drift is a live measurement and
that a halt has one source again, and the `### Start your session at the project
root` paragraph, which listed the decision-governed check and the stand-down
among the cwd-anchored resolutions. One resolution is left there now, the
work-tree preference of the three `bin/` helpers, which is what
`hooks/session-start.ts` already says.

### `docs/philosophy.md` — the surface the user named at shaping

Principle 4 was **Compliance over speed**; it is now **Observation, because
enforcement was tried and measured**. It states what the hook layer offers, then
gives all three enforcement mechanisms with their figures rather than dropping
the principle in silence: the protected-path deny (no instance of the failure it
prevented across ~450 records, 53 records of cost in one project), the
decision-governed deny and halt (no measured installation configured one, all 50
recorded blocks read "Protected path"), and the branch policy (24 consecutive
false blocks in one afternoon, no true positive, on a question undecidable from a
command's text). The doc's opening claim that drift is caught at write time was
corrected in the same pass — it is caught by the reviewers and the coherence
gates, which read what landed.

### `agents/orchestrator.md` — a row deleted, not reworded

The *Guard halt* circuit-breaker row at Step 3d is **gone**, and so is its
restatement in the unresolved-budget table. Nothing can halt, so it is not a
breaker that never trips; it is a condition that cannot arise. The two counts
around the restatement moved with it: "the other five" became four, "one exit
among six" became five. Setup Step 5's guard check became a statement that there
is no halted state to snapshot, naming `/fusion:setup` as what offers to delete a
leftover flag. The Turn-budget paragraph at `:122` was corrected in full per
`260816-2321`, not at the filename alone.

### The rest

`README.md` — product summary, the best-practices bullet that told a user to
dial the guard down, and the whole `## Configuration` section, which is now one
file, one setting and a three-row table whose middle row is the
`fusion-guard.json` migration. `README-agents.md:169` — two layers, not three.
`docs/working-model.md` — section 4 rewritten around the trace and the
diagnostic, the walkthrough's step 5, the `README-hooks.md` pointer at `:162`,
and the intro. `skills/help/SKILL.md` — the configure topic points at
`templates/fusion.json` instead of a deleted example file, and "three things to
configure" is two. `skills/archive/SKILL.md` — `escalation.json` is no longer
classified among the live state files. `bin/monitor` — both stale comments, the
advisory-cap examples at `:188` and the fail-open one below it.

## Verification

`cd hooks && npm test` — **exit 1**, 2 files / 3 cases red:

| File | Cases | Whose |
|---|---|---|
| `surface-growth-bound.test.ts` | 2 | step 10's — the baselines are re-armed there |
| `reference-resolution-lint.test.ts` | 1 | step 16's — the four `CLAUDE.md` citations |

Down from 3 files / 5 cases. No file outside those two is red, and no case that
was green went red.

Anchor integrity was checked separately, because the section renames moved four
of them: every `](…#anchor)` link across `*.md`, `docs/`, `agents/`, `skills/`
and `rules/` resolves to a heading that exists.

## What this step did not touch

`CLAUDE.md` and `rules/` — step 16's, through `/fusion:curate`, and the Directive
keeps them there. `260816-2115`'s `rules/` surface is left with its
`hooks/session-start.ts` twin, as instructed. `templates/fusion.json` and the
root `fusion.json` landed in `6890ea2` and were not opened.

Nothing was committed.
