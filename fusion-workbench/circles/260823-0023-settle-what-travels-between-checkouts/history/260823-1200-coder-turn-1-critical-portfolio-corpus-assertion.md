# Coder — Turn 1 Critical repair: the fresh-clone red suite

**Date:** 2026-08-23
**Agent:** coder
**Circle:** `260823-0023-settle-what-travels-between-checkouts`
**Dispatched for:** the Critical finding of `circles/260823-0023-settle-what-travels-between-checkouts/reviews/260823-1110-coderev-c2-turn-1.md`
**Record:** `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1110_*_the-untracked-portfolio-turns-npm-test-red-in-every-fresh-clone-of-this-repository.md`
**Status:** Complete

## What was implemented

The corpus-predicate assertion in `hooks/lib/__tests__/workbench-citation-lint.test.ts` no longer
asserts that the tree carries a `portfolio.md`. It asserts that the corpus predicate admits one:
`expect(inCorpus(PORTFOLIO), …)`. The predicate itself is untouched, so coverage of a portfolio's
citations is unchanged wherever a checkout has one.

The fork the dispatch named was decided **against** dropping the portfolio from the corpus. The
reasoning is written out in full in the record's `Resolved:` note; in short, the corpus is a user's
recorded answer pinned by decision
`circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`,
this gate is the only thing that reads a generated portfolio's citations against the tree, and
class L of `rules/workbench-tracking.md` governs what git carries rather than what a gate may read.

`README-hooks.md:369` describes the same corpus to a user and carried the same unqualified claim;
it now names the class and cites its definition.

## Verification

`cd hooks && npm test` — exit 0, 724 tests in 41 files, in this working tree and, with the change
applied, in a fresh `git clone` of this repository at `e41393e` holding no
`fusion-workbench/portfolio.md`. Before the repair that same clone failed with
`portfolio.md is in the corpus by name: expected false to be true`.

## Bounded surfaces

Hook-test lines: 249 free of 2 500 before, 219 after (+23 in `workbench-citation-lint.test.ts`,
+7 in `reference-resolution-lint.test.ts`). `surface-growth.golden` regenerated; the diff is those
two entries and the total, nothing else. `reference-resolution-lint.test.ts` `BASELINE`
`paths 1292 -> 1293`, from the one path citation the `README-hooks.md` edit adds, with an
accounting block above the constant.

## Files changed

- `hooks/lib/__tests__/workbench-citation-lint.test.ts`
- `hooks/lib/__tests__/reference-resolution-lint.test.ts`
- `hooks/lib/__tests__/fixtures/surface-growth.golden`
- `README-hooks.md`
- the defect record, `_o_` -> `_c_` with a `Resolved:` note

Nothing was committed; the working tree and the index were left for the orchestrator.
