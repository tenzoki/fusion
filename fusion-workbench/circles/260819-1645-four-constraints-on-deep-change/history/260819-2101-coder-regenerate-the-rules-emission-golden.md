# Regenerate the rules-emission golden after the circle-records.md addition

**Agent:** coder
**Date:** 2026-08-19 21:01
**Status:** Complete

## Task

One fixture regeneration. `rules-emission-golden.test.ts > matches the checked-in
golden, agent by agent` was the single failure on an otherwise green suite
(677 passed, 1 failed), caused by step 4 of this Circle's plan adding a section to
`rules/circle-records.md` — a conditional emission for orchestrator, playmaker and
shaper.

File set: `hooks/lib/__tests__/fixtures/rules-emission.golden`, and nothing else.

## What was done

Regenerated with the mechanism's own documented invocation, read out of the
`## Updating the golden` comment in the test file rather than guessed:

    cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts

That run rewrote the fixture and then failed on purpose, as designed. The bare
re-run is 15/15 green.

## The six lines the regeneration moved

Predicted before running, from the two figures in the task, then checked against
the diff. Every line matched; none moved that the figures do not explain.

| Block | Line | Before | After |
|---|---|---|---|
| `[orchestrator]` | `circle-records.md` | 14832 | 18747 |
| `[orchestrator]` | `total` | 111875 | 115790 |
| `[playmaker]` | `circle-records.md` | 14832 | 18747 |
| `[playmaker]` | `total` | 106212 | 110127 |
| `[shaper]` | `circle-records.md` | 14832 | 18747 |
| `[shaper]` | `total` | 111046 | 114961 |

Six insertions, six deletions, one file. The `circle-records.md` move is +3 915
bytes, identical in all three blocks, and each total moves by exactly that same
+3 915. The orchestrator figure reproduces the task's stated 111 875 → 115 790.

The three blocks are exactly the three agents `bin/fusion-rules` emits
`circle-records.md` to. No fourth block moved, no other filename moved in any
block, and the twelve agents that do not load the file are byte-identical.

## The always-on growth bound: verified independently, green

The consolidation pass's ground — that `circle-records.md` is a conditional
emission and not part of the always-on core — holds, and was checked rather than
taken on report.

The core is not a declared list. `universalCore()` derives it by measurement, as
the *intersection* of the file sets every agent loads. Twelve agents (bugfixer,
coder, coderev, consultant, curator, editor, ontocoder, ontorev, reconciler and
the rest) load exactly five files, so the intersection is those five:
`agent-setup.md`, `fusion-workbench-conventions.md`, `decision-record-examples.md`,
`user-facing-output.md`, `critical-stance.md`. `circle-records.md` reaches three
agents and therefore cannot be in an intersection over all fifteen.

Two further confirmations, neither of which reads the test's own reasoning:

- `git status --porcelain rules/` names `circle-records.md` and nothing else, so
  no core file moved a byte this Turn. Each core file's on-disk size still equals
  its golden entry exactly.
- The core stands at 91 380 bytes against a `RULE_BASELINE` floor of 86 573 —
  a delta of 4 807 against `GROWTH_BUDGET` of 12 000, leaving 7 193 bytes of
  head-room. Unchanged before and after the regeneration, because the
  regeneration touched no core file.

`holds the always-on rule set — what every agent loads — inside its budget` passed
in all three runs: the pre-regeneration bare run (14 passed, only the golden
assertion failing), the update-flag run, and the final bare run. Had the 3 915
bytes landed in the core instead, this would have been a bound question and the
answer would have been a cut, never a baseline edit — but it did not, and no
number in `RULE_BASELINE` was touched.

## Verification

    cd hooks && npx vitest run   ->   exit 0
    Test Files  37 passed (37)
    Tests  678 passed (678)

The single pre-existing failure is gone; nothing else changed state.

## Files changed

- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/rules-emission.golden`

No commit made, no plan step marked — both were out of scope by instruction.
