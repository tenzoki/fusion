# Analyst run: critical assessment of the style-rules spec

**Date:** 2026-08-20 23:08
**Type:** Risk / Feasibility assessment of a draft specification
**Circle:** `circles/260820-2051-style-rules-arrive-and-get-measured`
**HEAD read:** `a5b73da`
**Dispatched by:** orchestrator, on the user's behalf, non-interactive
**Output:** `circles/260820-2051-style-rules-arrive-and-get-measured/analyses/260820-2308-assessment-of-the-style-rules-spec.md`

## What was read

The spec in full, the Circle record, the shaper's session log, the defect the shaper filed, and
fifteen of the seventeen records the coverage table names, including every record whose coverage
claim the assessment tests. Also `bin/fusion-rules`, `skills/setup/SKILL.md` Steps 0b/0d/0f, the two
growth-bound test files with their baseline maps, `hooks/lib/__tests__/helpers/citation-scan.ts`,
and `stilwerk/default-voice-en.yaml`.

## What was measured rather than read

- The always-on rule bytes: 92 869 against a baseline of 86 573 and a budget of 12 000, so 5 704 of
  head-room. The suite is green.
- The em-dash rates of the four stylometric profiles and of `CLAUDE.md`. `CLAUDE.md` runs 125 marks
  over 9 155 words, 13.6 per 1000.
- The prose-agent set: eight agents at `bin/fusion-rules:193`, seven carrying the enumeration.
- The three profile stations: work tree and installed copy byte-identical for all four files today.
- The hook-test inventory: 20 259 lines by `wc -l`, smallest test file 51 lines.
- The state of `circles/260819-1645-four-constraints-on-deep-change`: closed, in `5faed26`.

## What was found

Ten findings. Three change what a planner should be told: the measurement cannot complete inside
this Circle under its own exclusion rule, `CLAUDE.md` is 41 per cent of the always-on prose and is
excluded on a criterion that does not fit a conditioning measurement, and C1's acceptance criterion
7 is unreachable because the refresh source is the installed plugin. Two decidability answers were
judged against `rules/critical-stance.md` §4: C1's is honest with a case overlap to fix, C10's
reasoning is honest while its marker scheme gives the weak branch a terminal marker.

The four figures the requester had already re-derived were not re-derived again, per the dispatch.

## What was not done

No issue was filed. Every finding is a change to a draft specification that the shaper can absorb in
one amendment pass, and filing against a draft would put one record in two places.

## Clarification channel

None. The dispatch was non-interactive. Four open questions are stated at the end of the report,
three of them user decisions the assessment recommends routing through an orchestrator gate before
planning begins.
