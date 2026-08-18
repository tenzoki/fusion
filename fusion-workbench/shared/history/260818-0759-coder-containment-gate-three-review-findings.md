# Coder — three review findings against the containment gate

**Date:** 2026-08-18 07:59
**Agent:** coder
**Task:** T2 — close `260818-0745`, `260818-0746` and `260818-0747` from review `260818-0748`
**Status:** Complete

## What changed

One shipped file, `hooks/lib/__tests__/sentence-identifier-containment.test.ts`, 273 → 425 lines,
plus the regenerated growth golden. `hooks/tracker.ts`, `hooks/lib/review-coverage.ts` and
`hooks/lib/staging-drift.ts` were read and left byte-identical.

### Finding 1 — the registry-completeness parse (`260818-0745`)

The parse split an import specifier on ` as ` and kept the LOCAL alias, so `budgetSentence as
budgetLine` erased the symbol from the set, and a namespace import contains no braces and was never
seen at all. Two of three legal import forms defeated the half of the gate whose job is to survive
its author.

The parse now reads the imported half (`split(/\s+as\s+/)[0]`), which is the name `REGISTRY` keys a
builder by. The namespace form gets the only honest treatment available to a parse of this kind: it
is REFUSED, with its own failure message saying why the symbols behind `import * as` cannot be
enumerated from the importing file, scoped to relative specifiers because no package or `node:`
builtin can export a fusion builder. Two named functions carry it — `importedSentenceBuilders(source)`
and `completenessFault(source, registry)` — with the source as a parameter, so the new cases drive the
real assertion rather than a copy of it. No allowlist.

### Finding 2 — the line-14 claim (`260818-0746`)

"Nothing authored in the source may contribute an identifier" was wider than
`identifiers(builder(report)) ⊆ identifiers(report)`. The sentence was corrected and the relation was
not: the header now says the relation catches what a BUILDER authors, that an identifier authored
into a report field (`StagingRow.why`, `StagingReport.why`, `CoverageReport.why`) is contained by
construction and passes, that this is latent because no `why` literal carries an identifier today and
neither builder emits the field, and why `supplied()` is not narrowed — the per-field allowlist the
design refused.

### Finding 3 — the stated miss rate (`260818-0747`)

"about 1 in 700" → "0.375^7, about 1 in 960 for the seven-character short hash", with the arithmetic
beside the figure so it can be checked against the pattern rather than re-derived.

### The residual list

Rewritten. The clause claiming the completeness assertion closes the registry residual is gone; a
paragraph of its own now states how far that assertion reaches — static `import` declarations of
`hooks/tracker.ts` alone, keyed on the imported name, plain and aliased forms measured — and the four
things it does not: a namespace import (refused, not resolved), `require` / dynamic `import()` /
re-export, a builder that reaches the model without passing through the tracker, and the `*Sentence`
naming convention that still decides membership.

The 41-line header holding the rejected designs was not cut, per the review's explicit judgement.

## Verification

Seven cases added to the file, one per import form the parse now claims, plus a control with no third
builder so a green case cannot be green for the wrong reason. Beyond those, the fix was measured
end-to-end the way the reviewer measured the defect: a detached worktree at `33645a2`, `budgetSentence`
injected into `hooks/tracker.ts`'s real import section and left out of `REGISTRY`, HEAD's test file
against the fixed one.

| Import form | at `33645a2` | with the fix |
|---|---|---|
| plain named | 1 failed / 11 passed | 1 failed / 18 passed |
| aliased, suffix dropped | 12 passed | 1 failed / 18 passed |
| aliased, suffix kept | 1 failed / 11 passed | 1 failed / 18 passed |
| multi-line block with an inline `type` specifier | not measured | 1 failed / 18 passed |
| `import * as budget from "./lib/budget.js"` | 12 passed | 1 failed / 18 passed |
| `import * as nodePath from "node:path"` | 12 passed | 19 passed |
| no third builder (control) | 12 passed | 19 passed |

The worktree was removed and pruned; the live tree was never mutated for the measurement.

`cd hooks && npm test` — 36 files, 672 tests, exit 0.

## Budgets

The hook-test bound did not go red: 18 344 lines against a budget of 20 375 (floor 17 875 +
2 500 head-room), so 2 031 lines remain. This task spent 152 of them. No baseline was edited.
`hooks/lib/__tests__/fixtures/surface-growth.golden` was regenerated with its documented command; the
diff is two lines, this file's count and the surface total.

## Records

- `shared/issues/260818-0745_*_…` — closed, with the before/after measurement table.
- `shared/issues/260818-0746_*_…` — closed.
- `shared/issues/260818-0747_*_…` — closed.
