# Coder — the two shipped descriptions named as a pair in the release process

**Status:** Complete
**Date:** 2026-08-16
**Agent:** coder
**Task:** Fix direction 2 of `260816-0141_*_the-plugin-manifests-own-description-was-not-brought-to-v9-when-the-marketplace-entry-was.md` — the durable half.

## What was done

Added one paragraph to `CLAUDE.md` `## Release process`, immediately after the paragraph
that names the four version surfaces. It names `.claude-plugin/plugin.json`'s `description`
and the fusion entry's `description` in the marketplace `marketplace.json` as a pair that
moves together, says why the pair drifts (a release rewrites one and leaves the other, which
is what v9.0.0 did), says why nothing catches it (two version strings are equal or not; two
prose descriptions can both be well-formed and still disagree), and states the obligation:
rewrite the pair together in the same release and read the two side by side before pushing.

## Judgement asked for by the dispatch: separate sentence, not folded into the four surfaces

The four-surfaces paragraph carries a count as its subject, and the count is load-bearing —
its own history is that it stopped at three and the README pin drifted for months because of
it. Extending that sentence to "four version surfaces and two descriptions" would blunt
exactly the fact the paragraph exists to carry, and it would put two different notions of
coherence under one word: for a version, coherent means the strings are equal, and a lint
could read it; for prose, coherent means the two still say the same true thing, and no lint
can read that. So the addition is its own short paragraph directly beside the passage. A
person following the release process reads it either way; the version passage keeps its point
intact.

## Files changed

- `/Users/k1/Projects/productive/fusion/CLAUDE.md` (one paragraph added at the end of
  `## Release process`; nothing else touched)

## Verification

`cd hooks && npm test` — exit 1, one failing assertion:
`surface-growth-bound.test.ts > matches the checked-in golden, surface by surface`, on
`agents/orchestrator.md` and `agents/playmaker.md`, both being edited by concurrent tasks in
this session. `CLAUDE.md` is on no bounded surface and the golden was deliberately not
regenerated, per the dispatch. The six lint tests that do read `CLAUDE.md` were run on their
own and all pass (97 tests), including `reference-resolution-lint` and
`derivable-enumerations-lint`. An earlier run also showed `fusion-commit-lock` and
`monitor-warnings-panel` failing on 30 s and 8 s timeouts; both passed on the clean re-run, so
they were load flakes from the concurrent agents, not a regression.

## Not done

Did not commit — the orchestrator stages and commits. Did not touch the issue record's marker;
fix direction 1 was already landed by another task and the record's close is the orchestrator's
to sequence once both halves are in.
