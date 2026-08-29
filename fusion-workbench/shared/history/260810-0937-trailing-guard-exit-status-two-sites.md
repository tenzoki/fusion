# Trailing `&&` guard in final position — two sites

**Status:** Complete
**Agent:** coder
**Started:** 260810-0937
**Base commit:** `a7c2b03`

---

## What was wrong

One shell hazard at two sites: a conditional written as `[ test ] && action` in **final
position** of a bash block. The guard's status becomes the block's status, so the intended
reading "do this if applicable" is delivered as "the block failed if it was not applicable".
Both sites hit their non-zero path on the *ordinary* case.

Source records (markers left untouched — the user renames them after validating):

- `260810-0710_*_the-drift-checks-last-line-makes-the-whole-block-exit-non-zero-when-no-circle-is-active.md`
- `260810-0506_*_the-activation-pointer-write-in-next-6-3-exits-non-zero-when-no-queue-exists.md`

## What changed

**1. `agents/orchestrator.md`, `### Drift check` under `## Persistent State File`.**
The trailing `[ -n "$REC" ] && row "Circle Turn log" …` became an explicit `if … fi`.
With no active Circle `$REC` is empty and the whole drift check exited 1 — a check built to
detect a bookkeeping step that silently stopped happening, reporting failure on the session
where nothing is wrong.

**2. `skills/next/SKILL.md` step 6.3.**
The trailing `[ -f "$WORKBENCH/tasklist.md" ] && echo …` became an explicit `if … fi`.
With no queue at the root — the ordinary case for a fresh workbench — the block exited 1,
and the failing command was the `printf` that writes `.active-circle`, the single most
consequential write in the skill.

**3. Same site, the resolver bypass** named in `260810-0506_*_the-activation-pointer-write-in-next-6-3-exits-non-zero-when-no-queue-exists.md` §2. The site spelled
`tasklist.md` literally; it now uses `$TASKLIST`. Because the prompt now names the key, the
resolver's key-set derivation emits it — measured before and after:

```
before:  fusion-paths next → WORKBENCH, SCAN_CIRCLES, PORTFOLIO
after:   fusion-paths next → WORKBENCH, SCAN_CIRCLES, PORTFOLIO, TASKLIST=tasklist.md
```

`skills/setup/SKILL.md` naming the file literally is permitted (one of two `EXEMPT_SKILLS`
in the path-literal lint) and was not touched.

**4. A short regression note at each site**, saying why the form is an `if` and not a
trailing `&&`. The filing record observes the corpus warns about this shape nowhere an
author would meet it; a lint was explicitly out of scope (see below), so the note at the
site is the proportionate remaining measure.

## Why the same remedy at both

The record left the choice open (explicit `if`, trailing `true`, or reordering). Both sites
took the explicit `if`:

- It reads as intent. `|| true` and a trailing `true` read as a workaround, and both are
  *wider* than the defect — they would also swallow a genuine non-zero from `row` or `echo`,
  which is the silent-failure the conventions forbid (`HYG-NO-SILENT-FAIL`).
- Reordering does not apply. At both sites the guarded line is genuinely the last thing the
  block does; moving it would mean inventing a trailing statement whose only job is to carry
  a zero.

Two sites, one shape, one remedy — so nothing here is a special case of the other.

## Verification

Each block was **extracted from its source file** by an awk extractor (first ` ```bash `
fence after the heading) and run against purpose-built fixtures, so what ran is what the
file says rather than a transcription. Four states, four exit codes:

| Block | State | Before | After |
|---|---|---|---|
| drift check | active Circle present | 0 | 0 |
| drift check | no active Circle | **1** | **0** |
| `/fusion:next` 6.3 | queue at root | 0 | 0 |
| `/fusion:next` 6.3 | no queue at root | **1** | **0** |

The applicable case still does what it did: the `Circle Turn log` row still prints with a
Circle active, and the queue note still prints with a queue present. Both confirmed in the
captured output, not inferred.

Full suite: `cd hooks && npm test` — **exit 1**, from a file that is not this change.
The sole failing file is `lib/__tests__/circle-stash-git-exclusion.test.ts` (4 of its 8
tests), which parses only `skills/circle-stash/SKILL.md` (line 29) and never reads either
file edited here. That file is under concurrent edit by another task; it was unmodified when
an earlier run of the same suite, already carrying every change in this log, reported 38
files and 1007 tests all passing.

Scoped corroboration — the seven lints that do parse the two edited files:
`npx vitest run state-drift-detection-lint queue-ground-lint path-literal-lint fusion-paths
queue-retirement-empty-key domain-cascade-order-lint executor-verification-report-lint`
— **exit 0**, 7 files, 133 tests.

## Out of scope, deliberately

`260810-0710` raises a third question: whether this shape earns a lint in
`hooks/lib/__tests__/`. Not written, per instruction. The record argues against adding one
before deciding whether the existing cohort of prose-parsing lints earns its keep, and two
open records (`260810-0502_*_the-state-drift-lint-anchors-on-the-phrase-it-checks-and-one-negative-control-is-a-duplicate.md`, `260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`) are about exactly that cohort. My reading is
recorded in the report to the user; the user files it as a decision if wanted.

## Files changed

- `/Users/k1/Projects/productive/fusion/agents/orchestrator.md`
- `/Users/k1/Projects/productive/fusion/skills/next/SKILL.md`

Not committed, and neither issue marker renamed — the user does both after validating.
