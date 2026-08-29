# Re-approve the two text-gate baselines after the curator's normative edits

**Status:** Complete
**Agent:** coder
**Date:** 260821-1455-re-approve-two-text-gate-baselines.md

## What this was

Eight approved curator edits landed in three normative text files and turned two
test gates red. Neither gate failed over a defect: both pin a committed baseline
against a live measurement, and the measurement moved because the text moved. The
task was to re-approve both baselines and change nothing else. No production code
was touched, and none should have been.

The edits that moved the numbers, all pre-existing in the working tree and not mine:

| File | Before | After |
|---|---|---|
| `CLAUDE.md` | 66626 | 67104 |
| `rules/fusion-workbench-conventions.md` | 57055 | 57114 (+59) |
| `rules/context-lean-claude-md.md` | 6811 | 6708 (−103) |

## Task 1 — the rules-emission golden

Regenerated with `UPDATE_RULES_GOLDEN=1 npx vitest run
lib/__tests__/rules-emission-golden.test.ts`, which rewrites the fixture and then
fails on purpose so the flag can never be left on in a green run.

The resulting diff is 30 changed lines over 15 agent blocks, two per block: the
`fusion-workbench-conventions.md` entry moving 57055 to 57114, and that block's
total moving by the same 59. Nothing else moved. No filename appeared or
disappeared, no block gained or lost a line (`git diff --numstat` reports 30
insertions against 30 deletions), and `rules/context-lean-claude-md.md` does not
appear, which is correct because it is not in the always-on set.

Each block's total was checked against the sum of its own entries rather than
taken on trust. All fifteen reconcile:

```
[analyst] 6 entries, sum 99900, total 99900
[bugfixer] 5 entries, sum 95066, total 95066
[coder] 5 entries, sum 95066, total 95066
[coderev] 5 entries, sum 95066, total 95066
[consultant] 5 entries, sum 95066, total 95066
[curator] 5 entries, sum 95066, total 95066
[editor] 5 entries, sum 95066, total 95066
[ontocoder] 5 entries, sum 95066, total 95066
[ontorev] 5 entries, sum 95066, total 95066
[orchestrator] 7 entries, sum 119476, total 119476
[planner] 6 entries, sum 99900, total 99900
[playmaker] 6 entries, sum 113813, total 113813
[reconciler] 5 entries, sum 95066, total 95066
[shaper] 7 entries, sum 118647, total 118647
[taskplanner] 6 entries, sum 99900, total 99900
```

`RULE_BASELINE` was not moved. The golden's own header and the regeneration
failure message both state that it does not move with the fixture, so a
regeneration records growth and never absolves it.

## Task 2 — the reference-resolution baseline

`BASELINE` in `hooks/lib/__tests__/reference-resolution-lint.test.ts:894` moved
`paths` from 1255 to 1257. `anchors: 162` and `records: 115` are unchanged, the
assertion is unchanged, and `BASELINE_MESSAGE` is unchanged.

The measurement was read before the edit rather than assumed: running the gate
against the unedited baseline reported `{ paths: 1257, anchors: 162, records: 115 }`
against the pinned `{ paths: 1255, ... }`, and the other 36 tests in that file
passed, including the no-dangling-reference assertion. Both new citations
therefore resolve.

Attribution of the +2 to the `docs/` row in `CLAUDE.md`:

- The row's replacement sentence cites `docs/upgrading-to-v10-3.md` and
  `docs/upgrading-to-v10-4.md`, where the sentence it replaced cited no path.
  Both files exist on disk, confirmed by `ls docs/`.
- The other three changed lines in `CLAUDE.md` are net zero. The
  `bin/fusion-prose-metric` row keeps its single decision-record citation, the
  `rules/decision-record-examples.md` row changed a marker transition (`_a_→_s_`
  to `_i_→_s_`) and carries no path, and the critical-stance bullet added a
  fourth norm with no new path token.
- The two `rules/` files are net zero as well. In the conventions file
  `skills/archive/SKILL.md:96` became `:102`, which is one token either way; the
  voice-profile-fallback paragraph keeps its single issue citation; and the
  removed `**Status:**` is a bold head label, not a path. The
  `context-lean-claude-md.md` cut removed a sentence containing no path.

Attribution was done by reading the diffs rather than by the revert-one-file
method the surrounding comments describe, because the dispatch forbade any
whole-tree git command and the three edited files belong to another party.

## One thing left undone, deliberately

The five re-approvals preceding this one each carry an attribution comment above
`BASELINE` naming the edit, the old and new numbers, and how the move was
attributed. This re-approval carries none, because the dispatch scoped the edit to
the constant and said to change nothing else. The file's own convention wants that
comment; adding it is a one-paragraph edit somebody should make before this is
committed.

## Verification

`npm test` from `hooks/`, exit 0. 40 test files, 718 tests, all passing. Both
gates green in that run:

```
✓ lib/__tests__/reference-resolution-lint.test.ts (37 tests)
✓ lib/__tests__/rules-emission-golden.test.ts (15 tests)
```

Nothing else went red.

## Files changed

- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/rules-emission.golden`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/reference-resolution-lint.test.ts`

Nothing was staged and nothing was committed. The three curator-edited files and
the two untracked history files that were in the working tree at the start are
untouched and still present.
