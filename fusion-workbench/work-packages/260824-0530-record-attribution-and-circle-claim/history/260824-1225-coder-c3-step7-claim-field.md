# C3 step 7 — the Circle record gains its claim field

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-24
**Plan:** `260824-0613_*_c3-attribution-on-records-and-a-claim-on-the-circle.md`, step 7

## What changed

`rules/circle-records.md` gains `**Claim:**` in `## Circle record template`, directly after
`**Filed by:**`, and a new `### The claim field` subsection defining it. The field takes exactly two
literal openings, `Unclaimed` and `Claimed YYMMDD-HHMM: <person>, checkout <id>.`, plus one override
literal appended as a second sentence, `Overridden YYMMDD-HHMM by <person>, checkout <id>.`, so both
people stand in the field. The reader test is stated as a first-word read on the literal opening,
the same shape of test `(none yet)` and `Deliberately deleted ` already carry in that file. A record
written before the field existed carries no field and is read as `Unclaimed`, because records are
not rewritten. The honest limit stands as its own paragraph and says the collision is detected, not
prevented.

`**Filed by:**` in the same template gained `, <person>`. The plan's `## Current State` names the
Circle record as one of the two kinds that gain a value inside a field they already carry, and step
7 is the plan's only step touching this file.

Two goldens were regenerated and one lint baseline re-approved, all of them machine-written records
of a size this edit moved:

- `hooks/lib/__tests__/fixtures/rules-emission.golden` — `circle-records.md` 20 172 -> 22 798 in the
  three roles that load it.
- `hooks/lib/__tests__/fixtures/surface-growth.golden` — hook-test lines 20 374 -> 20 375, the one
  line being the baseline note below.
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` — `BASELINE.paths` 1304 -> 1305, the one
  token being `bin/fusion-identity` cited by the new section. The accounting note is one line.

No baseline was moved. `RULE_BASELINE`, `TEST_LINE_BASELINE` and the surface baselines are untouched.

## Which budget binds this file

The dispatch expected the always-on bound to block this step. It does not reach this file.
`rules/circle-records.md` is emitted to `orchestrator`, `playmaker` and `shaper` only, so it is
role-specific text. `rules-emission-golden.test.ts` measures role-specific growth under the report
that never fails; its hard universal-core bound reads a disjoint file set, the five files every agent
loads, which this edit did not touch and which still stands at 97 392 of its 97 652 cap.

The hard gates that do reach the file:

| Gate | Bound | Before | After |
|---|---|---|---|
| drift ceiling, per agent | 145 144 | 123 227 (orchestrator) | 125 854 |
| drift ceiling, per agent | 145 144 | 122 398 (shaper) | 125 025 |
| drift ceiling, per agent | 145 144 | 117 564 (playmaker) | 120 191 |
| hook-test lines | 20 375 | 20 374 | 20 375 |

The emission golden is hard but is regenerated rather than cut: its own header states that for
role-specific text "a size change costs a regeneration, never a cut".

Reported and not failing: the em-dash rate on `rules/circle-records.md` fell 16.4 -> 14.2 per 1000
prose words against a permitted 2. The file was already over before this edit and the section added
no em-dash of its own; the ceiling gates nothing.

## Verification

`cd hooks && npm test` — exit 0, 732 tests passed, 42 files.
