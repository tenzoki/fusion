# Step 11: the suite is green, the golden did not move, and one of the four budgets has 41 lines left

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-24
**Plan:** `260824-0613_*_c3-attribution-on-records-and-a-claim-on-the-circle.md`, step 11
**Range measured:** `e209011..9efe19f`

## What this step produced

No source file changed. The step's product is the measurement below and one defect record it
found on the way.

## Verification

`npm test` from `hooks/` exits 0: 42 test files, 732 tests, all passing. That is the same count the
orchestrator read at `9efe19f`, so nothing about this step's own reads moved it.

`claude plugin validate .` from the repository root reports **passed with warnings**, exit 0. The one
warning is the standing one about `CLAUDE.md` at the plugin root not being loaded as project
context. It is a property of how this repository is laid out and not of anything this Circle wrote.

## The golden diff was empty

`UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts` rewrote
`hooks/lib/__tests__/fixtures/surface-growth.golden` from live measurement and then failed on
purpose, which is the flag's designed behaviour and not a fault. `git diff` over the fixture is
**empty**: the file is byte-identical to what `9efe19f` committed. The orchestrator regenerated it
after each of steps 8, 9 and 10, and the regeneration confirms that. Re-running the same test
without the flag passes, 12 of 12.

No baseline was touched, in that run or in this step at all.

## The prose metric, per changed rule file

Measured with `bin/fusion-prose-metric`. The installed copy at `$FUSION_PLUGIN_ROOT` carries the
helper and is byte-identical to the work tree's, so the guarded call ran the installed one.

| File | em-dash | prose words | per 1 000 | permitted | verdict |
|---|---|---|---|---|---|
| `rules/circle-records.md` | 39 | 2 745 | 14.2 | 2 | **over** |
| `rules/decision-record-examples.md` | 0 | 332 | 0.0 | 0 | ok |
| `rules/fusion-workbench-conventions.md` | 6 | 8 080 | 0.7 | 8 | ok |
| `rules/workbench-tracking.md` | 2 | 2 198 | 0.9 | 2 | ok |

**This Circle added no em-dash to any of the four.** The same four files measured at `e209011` read
39, 0, 6 and 2, the identical counts. `rules/circle-records.md` was already 37 over its permit
before step 7 wrote a line of it, and the 366 prose words step 7 added pulled the rate *down* from
16.4 to 14.2. So the one `over` verdict is an inherited condition the Circle did not worsen, and the
helper reports rather than gates, so nothing here is a failure to fix.

## The four surface budgets

Each surface's "before" is the plan's `## Current State` table, which was measured at `0db1fbb` —
the fix commit that opens this Circle's range, before step 1. All four of the plan's figures
reproduce exactly at that commit.

| Surface | Baseline | Before (`0db1fbb`) | Now (`9efe19f`) | This Circle | Budget | Head-room left |
|---|---|---|---|---|---|---|
| always-on rule core, 5 files, bytes | 86 573 | 95 252 | 97 392 | **+2 140** | 98 573 | **1 181** |
| `agents/*.md`, bytes | 399 843 | 404 137 | 407 098 | **+2 961** | 417 843 | 10 745 |
| `skills/*/SKILL.md`, bytes | 220 439 | 240 237 | 237 311 | **−2 926** | 240 439 | 3 128 |
| hook tests and helpers, lines | 17 875 | 20 187 | 20 334 | **+147** | 20 375 | **41** |

Every surface is inside its budget, which is what the green suite already said and this states in
the units.

Three things the table is worth reading for.

**Step 3 paid for steps 9 and 10 and left change.** `skills/` entered the Circle with 202 bytes of
head-room, had to absorb writes into two bodies, and leaves with 3 128. The cut of 22 spent-reasoning
passages from `skills/setup/SKILL.md` over-covered what the two steps then spent. That is the one
surface this Circle leaves better than it found it.

**The hook-test surface is at 41 lines and is now the binding constraint.** It entered at 188 and
step 5's helper test spent most of what was left, even after the 44-line cut logged at
`260824-1345-coder-hook-test-line-cut.md`.
Forty-one lines is under two of the citation-pin re-approval comments this Circle wrote one of per
step. The next Circle touching a hook test should expect to cut before it writes.

**The always-on core spent 2 140 of its 3 321 bytes and has 1 181 left.** Both of the rule files
this Circle wrote into are in that set, and the core is the surface every agent pays for on every
dispatch, so it is the most expensive of the four per byte.

## The baseline maps did not move

The fourth acceptance clause reads "no baseline map differs from `HEAD` before this Circle". It
holds, and stronger than it asks: `git diff e209011..HEAD` reports
`hooks/lib/__tests__/surface-growth-bound.test.ts` and
`hooks/lib/__tests__/rules-emission-golden.test.ts` as **unchanged files**, not merely as files
whose maps happen to agree. `AGENT_BASELINE`, `SKILL_BASELINE`, `TEST_LINE_BASELINE`, the three
head-room constants and `RULE_BASELINE` are all identical across the range.

`BASELINE` in `hooks/lib/__tests__/reference-resolution-lint.test.ts` is the one number that did
move, and it is not a growth baseline. It is a citation-count pin, and it moved at **every one of
the eight commits** in the range, `{ paths: 1294, anchors: 180, records: 118 }` at `e209011` to
`{ paths: 1319, anchors: 186, records: 120 }` at `9efe19f`. Every one of those moves is by design:
each step of this Circle added citations to shipped text, and the pin counts them.

The file's own convention is that each move carries a comment naming its delta and the tokens behind
it, and six of the seven in-Circle moves do. The seventh does not, which is the defect filed below.

## Defect filed

`260824-1512_*_one-of-the-seven-citation-pin-moves-in-this-circle-carries-no-re-approval-comment.md`

The move at `3ba7a46`, plan steps 4 and 5, carries no re-approval comment, and it is the largest:
paths 1291 to 1303, anchors 180 to 181, records 117 to 119. The comment chain reads as continuous
and is not, since step 3's entry ends at 1291 and step 6's opens at 1303. Fifteen citation tokens
are unaccounted for in the file's own record. Not fixed here: step 11 permits one file to change,
the surface golden, and this is a different file.

## Files changed

- `hooks/lib/__tests__/fixtures/surface-growth.golden` — regenerated, produced no diff, so the file
  as committed at `9efe19f` still stands.
- `260824-0613_*_c3-attribution-on-records-and-a-claim-on-the-circle.md` — step 11 marked `[DONE]`.
- This log, and the defect record named above.
