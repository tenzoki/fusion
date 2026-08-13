# Coder — closing the five review findings this Circle's own Turn 3 and 4 prose introduced

**Agent:** coder
**Circle:** `circles/260813-0910-documentation-matches-shipped-plugin`
**Status:** Complete
**Started:** 260813-2245
**Finished:** 260813-2255

## Directive of this task

Close five findings stamped `260813-2214` — three in `docs/working-model.md`, two in
`README-agents.md` — plus a sixth citation defect if it fell inside the same pass. Every one of
the five is a sentence written in this Circle's Turn 3 or Turn 4 that was never checked against
the artifact it describes, so the acceptance condition was the method: read both sides, and name
the artifact line each correction was checked against.

## What each correction was checked against

| Finding | Correction | Artifact side read |
|---|---|---|
| Entrance 1 claims the orchestrator creates the Circle | `docs/working-model.md:28-34` rewritten: every Circle is created by a command the user types, the shaper in anticipated-circle mode is the only creation site, and a request handed to the orchestrator creates none | `agents/shaper.md:79` (the creation); `agents/orchestrator.md:234-249` `## Scope` — rename `:244`, three record sections `:245-248`, pointer `:249`, no creation; `:214` and `:807` (no Circle is the opt-in ordinary case); `agents/shaper.md:47` (`/fusion:next` performs the activation writes) |
| The entrance count is three, `/fusion:seed-from-plane` is a fourth | The digit is gone from `:28`; `/fusion:seed-from-plane` is item 3, and `:78` names it as the second dispatcher of anticipated-circle mode | `skills/seed-from-plane/SKILL.md:87`, `:92-94`, `:101`, `:141`; `agents/shaper.md:57` (the mode detection contract both skills satisfy) |
| The 5b walkthrough's premise undercounts the playmaker's writes | `:158` now argues from disjointness with the Turn loop and names the playmaker's four writes | `skills/next/SKILL.md:297` (the claim's authoring home); `agents/playmaker.md:10`, `:154`, `:182`, `:239` |
| Two playmaker rows cite Step 3 for a Step 5b dispatch | `README-agents.md:61`, `:62` now read "Step 5b's dispatch"; the `**Domain:**` cell at `:60` gained Step 5b's second dispatch | `skills/next/SKILL.md` headings at `:96`, `:153`, `:167`, `:197`; `:106` ("No other parameters") |
| The preamble states a termination rule the playmaker prompt does not state | `README-agents.md:54` split into two bounds, one cited per parameter, and says plainly that the second's prompt states no rule | `agents/shaper.md:57` (states it for `**Draft:**`); `agents/playmaker.md:207` and `:209-217` (state none); `skills/next/SKILL.md:169-177` |
| The Origin Rule sentence is cited to `## Path Resolution` | Taken in the same pass — one citation in a file already open. `:80` now cites `## Origin Rule`, and names `## Path Resolution` only for the second resolution | `rules/fusion-workbench-conventions.md:97-99` and `:116`; `agents/shaper.md:76` |

## One claim in an issue file was not carried forward

`260813-2214_*_the-two-new-playmaker-rows-…` names `skills/next/SKILL.md:168` as the `**Domain:**`
line inside the Step 5b dispatch block. It is not: `:169` opens the fence and `:170` carries
`**Domain:** <detected-domain>`. The table cell cites `:170`. This is recorded because the issue's
own diagnosis is that a previous pass trusted a claim it had not read — the same failure, one
level up, would have shipped a wrong coordinate while closing a finding about a wrong coordinate.

## What was deliberately not done

No prompt was changed. Three of the six issues name a prompt question they decline to answer —
whether `agents/orchestrator.md` should create a Circle, whether `agents/shaper.md:57` should name
both dispatchers, whether `agents/playmaker.md` should state a termination rule for its block —
and each is outside this Circle's Directive. The five Turn 1-3 findings named as out of scope were
not touched.

## Verification

- `cd hooks && npx vitest run lib/__tests__/derivable-enumerations-lint.test.ts` — exit 0, 21 tests passed.
- `cd hooks && npm test` — exit 0, 49 files, 1022 tests passed.

## Files changed

- `docs/working-model.md` — four passages
- `README-agents.md` — one preamble sentence, three table cells
- six issue records under the Circle's `issues/`, each with an appended `Resolved:` block and renamed `_o_` → `_c_`
