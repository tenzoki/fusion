# Coder — Step 8: move the two commit-procedure narratives to `rules/commit-lock.md`

**Status:** Complete
**Agent:** coder
**Date:** 2026-09-08
**Source:** `260907-1450_*_plan-bounded-executor-dispatches.md` `### 8`

## What was done

Two bullets of `agents/orchestrator.md` Step 3b — the "Why this is a rule and not a
preference" narrative under step 3 and the "Why the shape and not just a ban on `-A`"
narrative under step 4 — were moved verbatim into a new `## Two measured defects behind
this procedure` section at the end of `rules/commit-lock.md`, after `### Cross-reference`
and at `##` level. Each site keeps one pointer line at the same indent, with the same
bolded lead-in, sending the reader to that section.

The move is lossless and was checked as a byte comparison rather than by reading:
`git show HEAD:agents/orchestrator.md | grep -o 'Measured in this repository:.*'` and the
same grep over the new `rules/commit-lock.md` diff clean, so no sentence, hash or citation
was dropped or reworded. `bin/fusion-rules` emits `commit-lock.md` to `orchestrator` only,
which is the one agent that read these narratives, so the same dispatch still carries them.

## Measurements

| Item | Before | After | Delta |
|---|---|---|---|
| `agents/orchestrator.md` | 152 491 | 151 756 | -735 |
| `rules/commit-lock.md` | 7 004 | 8 337 | +1 333 (baseline 9 250) |
| `agents/*.md` total | 414 334 | 413 599 | -735 |

`agents/` head-room after this step: **4 244 bytes** (413 599 - 399 843 = 13 756 spent
against 18 000). The plan predicted about 4 246; the two pointer lines came out two bytes
shorter than the estimate.

## Fixtures and pins regenerated

- `hooks/lib/__tests__/fixtures/rules-emission.golden` — one block, `[orchestrator]`, two
  numbers: `commit-lock.md 7004 -> 8337` and `total 124281 -> 125614`.
- `hooks/lib/__tests__/fixtures/surface-growth.golden` — two numbers:
  `orchestrator.md 152491 -> 151756` and `total 414334 -> 413599`.
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE` re-approved
  1721/242/14 -> 1723/244/14, rewritten in place with no line added. The +2/+2 is the two
  pointer lines, each contributing one path and one adjacent heading anchor. Attributed by
  single-file revert against the full tree: with the orchestrator prompt alone restored to
  HEAD and the rule file left as this step wrote it, the gate reads 1721/242/14 green —
  which also measures that the moved prose itself moved nothing, since both copies of the
  narrative stood at once and the count did not rise (the record citation is the storeless
  wildcard form, skipped on the asterisk).

None of the four named baselines moved: `git diff` over `surface-growth-bound.test.ts` and
`rules-emission-golden.test.ts` is empty, so `AGENT_BASELINE`, `RULE_BASELINE`,
`RELEASE_CAP` and `DRIFT_CEILING` are byte-identical.

## Verification

`cd hooks && npm test` was run four times. The four gates the plan names —
`surface-growth-bound`, `rules-emission-golden`, `provenance-header-lint`,
`reference-resolution-lint` — are green in every run and green in isolation
(4 files, 89 tests). One full run was entirely green (924/924).

The other three runs each failed a different one to three of `staging-drift.test.ts`,
`fusion-commit-lock.test.ts` and `guard-state-shape.test.ts`, never the same set twice.
Each passes in isolation (`staging-drift` re-run alone: 18/18). All three spawn real git
projects through `helpers/guard-harness.ts` and are timing-sensitive under full-suite
parallel load. None of them reads `agents/orchestrator.md` or `rules/commit-lock.md`: the
only occurrences of those names in the two that mention them are a header comment and
synthetic scratch-project fixture filenames. **Inference, not a verified claim:** the
flakiness is pre-existing and unrelated to this edit. It was not verified against a clean
tree, because doing so needs a whole-tree git command the dispatch forbade.

## Not done

Verification item 3 expects `grep -c '045a14f\|f38f37d' agents/orchestrator.md` to return
0. It returns **1**. `045a14f` is gone as expected, but `f38f37d` also appears at
`agents/orchestrator.md:1013`, in a third passage ("**Do not answer it by widening `git
add`.**") that is not one of the two bullets this step moves. The dispatch forbids moving
a third passage, so it was left standing. The plan's expectation of 0 was written on the
assumption that the hash appeared only in the moved bullet.
