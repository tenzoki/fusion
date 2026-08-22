# Analyst: cut ledger for the three bounded surfaces

**Date:** 2026-08-22 12:26
**Status:** Complete
**Agent:** analyst
**Dispatched by:** orchestrator, step 1 of `shared/planning/260822-1154_o_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`
**HEAD:** `370bfc5`

## What was asked

Produce a measured, per-candidate ledger of text that can be removed from `agents/*.md`,
`skills/*/SKILL.md` and the hook test suite, with a verdict per candidate, so that Gate A can decide
whether the cut the plan needs actually exists. Survey the always-on rule core last and treat a cut
there as optional. Report the hook test surface first.

## What was produced

- `shared/analyses/260822-1226-cut-ledger-for-three-bounded-surfaces.md`
- Three issues: `shared/issues/260822-1226_o_…`, `260822-1227_o_…`, `260822-1228_o_…`
- One decision: `shared/decisions/260822-1229_o_where-does-the-reference-resolution-pins-re-approval-attribution-log-live.md`

Nothing outside `fusion-workbench/` was changed.

## Result

| Surface | Target | Measured genuine removal | Clears? |
|---|---|---|---|
| Hook test suite | 500 lines | about 83 lines | no |
| `agents/*.md` | 10 362 bytes | 6 665 bytes | no, without one relocation row |
| `skills/*/SKILL.md` | 4 300 bytes | 4 290 bytes | effectively yes |
| Always-on rule core | none set | not proposed | n/a |

The hook test suite has no restatement reserve. Measured with 10-word shingles against every shipped
non-test file, only 52 lines of the suite overlap shipped text, and most of those are quoted
assertion strings. The 500 lines exist in exactly one place, the 421-line re-approval attribution log
above the `BASELINE` pin in `reference-resolution-lint.test.ts`, and removing it is a convention
change rather than a restatement cut. Filed as a decision instead of taken.

## Method

Four measurements, each reproducible:

1. Surface totals and per-file deltas, by applying each surface's own `files()` reader and baseline
   map out of `surface-growth-bound.test.ts`. Reproduced the plan's table exactly, so nothing moved
   between planning and this step.
2. Comment/blank/code classification over all 44 test files: 7 167 / 1 652 / 11 544, reproducing the
   plan's figures.
3. Exact-sentence duplication across `agents/`, `skills/` and `rules/`: 65 distinct sentences in more
   than one file. Once bootstrap is excluded, one copy is kept and a citation is left behind, this
   yields 10 631 bytes on `agents/` and 3 496 on `skills/` at zero citation cost, which does not clear
   either target. Everything the ledger claims above those numbers came from reading.
4. 12-word shingle coverage against every shipped file including `rules/`, `bin/`, `docs/` and the
   READMEs: 48 333 bytes covered on `agents/`, 26 687 on `skills/`, 52 lines on the hook tests.

## Findings worth carrying forward

- **The plan's two duplication headline figures are gross occurrence bytes, not removable bytes.**
  The `agents/` figure agrees within splitter noise; the `skills/` one is 5 234 bytes above mine and
  I could not reconcile it. Recorded as an open question rather than resolved.
- **Relocation is not removal.** Several large `agents/` duplications can only be discharged by
  moving text into a rule file the same agent loads. That satisfies the bound and gives the claim one
  home; it does not reduce per-dispatch context. The ledger keeps the two kinds in separate columns
  and only counts deletions.
- **Bootstrap duplication is larger than the plan's "two sentences":** about 9 900 bytes across the
  fifteen prompts, plus two further cases of the same kind in the skill bodies. Named, excluded, not
  counted.
- **`agents/coder.md` and `agents/ontocoder.md` share about 3 900 bytes that a gate requires them to
  share.** `executor-verification-report-lint.test.ts` pins the contract in both. Load-bearing.
- **`agents/orchestrator.md` gets restatement rows only, worth 632 bytes.** The deep cut available is
  its 27 401-byte `## Setup` section, which `skills/setup/SKILL.md` inlines. The report names it,
  states in its own words that the project has not asked for it, and states what would be given up:
  the skill body exists because the prompt instruction lost to task urgency once, so cutting the
  prompt's copy returns the pre-fix state rather than saving bytes.

## Verification

`bin/fusion-prose-metric` on the report: 4 em-dashes over 4 999 prose words, 0.8 per 1 000 against a
permit of 4, verdict ok.
`npx vitest run lib/__tests__/workbench-citation-lint.test.ts lib/__tests__/reference-resolution-lint.test.ts lib/__tests__/plan-stopping-section-lint.test.ts lib/__tests__/portfolio-citation-form-lint.test.ts lib/__tests__/record-counts-measurement.test.ts` — 102 tests, all passing, exit 0. The four
gates that read the workbench are green over the five records this run filed.
