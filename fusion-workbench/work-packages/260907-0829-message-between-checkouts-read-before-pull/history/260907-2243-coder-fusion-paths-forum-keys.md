# Coder — `bin/fusion-paths` gains `OUT_FORUM` and `SCAN_FORUM`

**Date:** 2026-09-07
**Agent:** coder
**Task:** S1 of `260907-1942_*_message-between-checkouts-read-before-pull.md`, step 1
**Status:** Complete

## What was implemented

Two keys, both resolving to the literal `shared/forum`, in `bin/fusion-paths` and in no
other file.

- `value_for()` gains `OUT_FORUM` beside `OUT_BACKLOG` and `SCAN_FORUM` beside
  `SCAN_BACKLOG`, each a `printf '%s' "shared/forum"` literal. Neither goes through
  `scan_value` nor `$OUT_BASE`, which is what makes the pair immune to `.active-circle` and
  to the `<circle-dir>` argument by construction rather than by a guard that could be
  forgotten.
- `ORDER` gains `OUT_FORUM` on the line already holding `OUT_BACKLOG` and `OUT_CIRCLE`, and
  `SCAN_FORUM` on the line holding `SCAN_BACKLOG` and `SCAN_CIRCLES`. The last line of the
  string is untouched and still reads exactly seven spaces then `PORTFOLIO"`, which
  `fusion-paths.test.ts` patches by regular expression to drive the `value_for`
  fallthrough.
- The header's unconditionally-shared paragraph now names `OUT_FORUM` alongside
  `OUT_CONSULT`, `OUT_MEMO` and `OUT_BACKLOG`, keeps the reason it already gave (none of
  these kinds arises from executing a Directive) and adds this kind's own: a forum entry is
  a message addressed to another checkout rather than a product of this checkout's work, so
  whichever Circle this one happens to be running says nothing about where the message
  belongs.

Two cardinality statements in the header were rewritten rather than incremented, per
`rules/critical-stance.md` §5. "None of the three arises" became "None of these kinds
arises"; "There were four until 2026-08-15" became "OUT_INVESTIGATION and its read
counterpart stood in this list until 2026-08-15", which says the same thing without a
numeral that the new key falsifies. The read-side sentence "SCAN_CONSULT and SCAN_BACKLOG
are the two exceptions" now names its three members instead of counting them — leaving it
would have had the header assert something the file below it contradicts.

## Files changed

- `/Users/k1/Projects/productive/fusion-news/bin/fusion-paths`

## Verification

`cd hooks && npx vitest run lib/__tests__/fusion-paths.test.ts` — **exit 0**, 81 passed.

The acceptance was run rather than asserted. No shipped prompt names either key yet
(`skills/news/SKILL.md` is task S8, the cleanup body's message half S10), so a fixture
consumer was staged in the scratchpad: a copy of `fusion-paths` with its two siblings
`fusion-workbench-root` and `fusion-plugin-cwd`, an `agents/fixture.md` naming
`$OUT_FORUM`, `$SCAN_FORUM`, `$OUT_PLAN` and `$SCAN_PLANS`, and a scratch workbench holding
two Circle directories. All three states print the same value:

| State | `OUT_PLAN` | `OUT_FORUM` / `SCAN_FORUM` |
|---|---|---|
| no Circle active | `shared/planning` | `shared/forum` |
| Circle active (alpha) | `circles/260101-0000-alpha/planning` | `shared/forum` |
| active alpha, target beta | `circles/260102-0000-beta/planning` | `shared/forum` |

`OUT_PLAN` moving in each row while the forum keys hold is what shows the immunity is real
and not an artefact of the fixture never being Circle-bound.

Against the real tree from the repository root: `./bin/fusion-paths orchestrator` and
`./bin/fusion-paths cleanup` each exit 0 and emit exactly the keys their own prompts name,
neither of which is a forum key today — emission is per-consumer, so that is the correct
answer and not a miss. `./bin/fusion-paths news` exits 2 naming both candidate prompt
paths, which is expected until S8 lands and is not this task's to fix.

`grep -c '^       PORTFOLIO"$'` returns 1, so the test's injection anchor still matches.

## Notes

The full suite was not run, on the dispatch's instruction: three sibling agents are editing
`bin/fusion-forum`, two rule files and the path-literal gate in this same tree, so a
full-suite result would not have been about this change. Plan step 12 is where the suite
runs.
