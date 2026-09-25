# Analyst: the pre-change reply-length baseline is frozen

**Status:** Complete
**Agent:** analyst (domain `code`)
**Circle:** `260821-1042-reply-bounded-whole-question-answered`
**Dispatched by:** orchestrator, for step 1 of `260821-1805_*_plan-reply-bounded-whole-question-answered.md`
**HEAD at time of work:** `da88e68`

## What this run produced

One analysis report,
`260821-2020-reply-length-baseline.md`.
It carries the counting command, the corpus and its window boundary, three readings of that corpus,
the full frequency distribution of reply lengths, and a calibration section separating what was run
from what was inferred.

No issue was filed and no decision record was written. No file outside the Circle's analyses and
history stores was modified. Nothing under `rules/`, `agents/`, `skills/`, `hooks/` or `bin/` was
touched, so none of the four growth budgets moved.

## The command was reconstructed rather than recovered, and then verified against four outputs

The Circle's Grounding states 2 231 replies across 69 transcripts with 398 over the twelve-line cap,
and no document anywhere recorded the command behind those figures. The shaper's own history file
states the figures and not the command.

The reconstruction was checked against four independent outputs of the original rather than accepted
on plausibility. With the cutoff set to the shaper's run stamp it returns 2 231 and 398 exactly. The
three named sessions return their exact per-reply sequences: `23 26 38 36 31 45`, `1 1 19` and
`44 15 17`. The five-reply difference between the shaper's 2 231 and this run's 2 236 over the same
files is accounted for record by record, by timestamp.

## The figure the Grounding could not give

The Grounding called its 17.8 per cent a floor because the denominator counts one-line narration,
and said the measurement does not say by how much. It does now. Removing one-line narration leaves
856 blocks of which 400 exceed the cap, which is 46.7 per cent.

The corpus turned out to have no two-line blocks at all: 1 380 blocks are exactly one line and
everything else is three or more. That clean split is what makes the second denominator defensible
rather than arbitrary.

## Two things this run deliberately did not do

It did not run and did not amend the prose register measurement protocol. That protocol was read, as
the dispatch required, and left untouched.

It did not add a helper to `bin/`. The command lives in the report and nowhere else, because a script
would be a shipped surface and this Circle's method is to add nothing there.

## Verification

`npx vitest run lib/__tests__/workbench-citation-lint.test.ts` passes with the new report inside the
gate's recomputed corpus, 10 tests.

`bin/fusion-prose-metric` over the report: 0 prose em-dashes over 2 579 prose words, against a
ceiling of 1.0 per 1000.

Every figure in the report was produced by running a command, and the report's calibration section
names the three statements that are inference and the one that is speculation.

## Files written

- `260821-2020-reply-length-baseline.md`
- this history file
