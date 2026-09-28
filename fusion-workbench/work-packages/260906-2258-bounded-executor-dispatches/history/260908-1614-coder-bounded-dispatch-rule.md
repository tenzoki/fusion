# Wrote `rules/bounded-dispatch.md`

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7

Task S5 of `260907-1450_*_plan-bounded-executor-dispatches.md`, section `### 5. Write
rules/bounded-dispatch.md`.

## What was asked

Create `rules/bounded-dispatch.md` with a provenance header at line 3, an opening naming
both audiences and both delivery routes, and five named sections: the stopping-time
parameter, when the clock is read, the seven-row unit table, the bounded return's four
statements and handoff rules, and the orchestrator's continuation half carrying C3's
five-row site table, the stall guard and four cross-cutting rules. No number of minutes
anywhere in the file. No other file touched.

## What was done

One new file, `rules/bounded-dispatch.md`, 9 162 bytes, provenance header
`**Provenance:** 260906-2258-bounded-executor-dispatches` at line 3.

Sections written exactly at the prescribed headings, including their trailing periods:
`## What a stopping time in your dispatch prompt means.`, `## When you read the clock.`,
`## What one unit is, for you.`, `## The bounded return.`, and
`## For the orchestrator: continuing a bounded return.`

The five-row site table is carried verbatim from the specification's C3 `## What each site
does with a bounded return`, with one amendment the plan's Step 10 mandates: the Step 3a
stall cell now states that the fall-through is Step 3a step 6, that `task_error` **is**
emitted at the stall, and that it is **not** emitted at a bounded return.

All seven unit-table citations were opened and confirmed to exist at the cited heading
before the table was written. One was corrected against the plan: the plan cites
`agents/curator.md` `### Pass 2, apply`, and the heading in the file reads `### Pass 2 —
apply. Approved entries only.` The file cites the heading as it exists.

## The one deviation from the plan, and why

The plan's section 3 prescribes the sentence "an agent that enters a 30-minute unit at
minute 19 returns at minute 49", and the same step's acceptance criterion requires that
"nothing in the file states a number of minutes". Those contradict each other, in the plan
and in the dispatch prompt identically.

The criterion was taken. The overshoot residual is stated with the same force and no
numeral: an agent that reads the clock just short of its stopping time and then enters a
unit longer than its whole bound returns well past that time, and nothing bounds or
measures the overshoot. The number-free phrasing loses nothing the illustration carried and
additionally scales with whatever the bound is configured to, whereas "minute 19" silently
encodes the current default of the very value Step 14 exists to keep out of the prose.

## Verification

- `cd hooks && npm test -- provenance` exits **0**, 27 tests passed.
- `bin/fusion-prose-metric rules/bounded-dispatch.md`: **0 em-dashes over 1 469 prose
  words**, rate 0.0 against a permitted 1, verdict `ok`. The one em-dash in the file sits
  inside the backticked curator heading and is correctly excluded as an inline code span.
- `grep -nE '\b[0-9]+[ -]?minutes?\b|\bminute [0-9]+' rules/bounded-dispatch.md` returns
  nothing.

## What this step broke, and it is outside this dispatch's file scope

`hooks/lib/__tests__/reference-resolution-lint.test.ts` is **red**. Every reference in the
new file resolves; what failed is the pinned-count assertion:

```
expected { paths: 1721, anchors: 242, ... } to deeply equal { paths: 1713, anchors: 237, ... }
```

The new file adds 8 resolvable paths and 5 anchors. The gate's own failure message says
re-approving `BASELINE` is the expected response and that the re-approval belongs in the
same commit as the edit. This dispatch was scoped to one file and forbidden from touching
any test, so the baseline was left alone.

No step of the plan accounts for this. Step 5 names only the provenance lint; Step 7
regenerates the emission golden and the `ROLES` map and does not mention this baseline.
Whoever takes Step 6 or Step 7 must write `paths: 1721, anchors: 242` into `BASELINE` in
that test file, or the suite stays red from this commit onward.

Confirmed by measurement, not inference: with the new file moved aside the three lints run
green apart from one pre-existing failure; with it restored, only this assertion is added.

## Pre-existing failure, not caused by this step

`hooks/lib/__tests__/citation-sweep.test.ts` fails on this tree with and without the new
file: the committed workbench carries a store-prefixed citation the sweep would rewrite.
Untouched here.

`hooks/lib/__tests__/fusion-citation-check.test.ts` failed once in a multi-pattern
`npm test --` invocation and passes when run alone with the new file present. Read as a
runner artifact, not a defect of this step.
