# Coder — plan C0 step 7: a test for `bin/fusion-prose-metric`

**Date:** 2026-08-22
**Status:** Complete
**Agent:** coder
**Dispatch:** step 7 of `260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`
**Circle:** none active; artifacts filed to `shared/`

## What was implemented

`hooks/lib/__tests__/fusion-prose-metric.test.ts`, 162 lines, 9 cases in 5 describe
blocks. It spawns the real `bin/fusion-prose-metric` and parses its table, pinning the
behaviour the script's own header documents as authoritative rather than the behaviour of
the awk under it. Every expected number was derived by hand from the header's stated rule
before the program was run, then confirmed against it; all matched on the first run, so
the test reports no divergence between the header and the implementation.

| Case | Pins |
|---|---|
| the counts it reports | em-dash 3, words 19, rate 157.9, permit 0, verdict `over` on a two-line prose fixture — and exit 0 despite `over`, which is the header's "it reports and it never gates" |
| region (1) | a fenced block, both fence lines included, drops out of both counts (1 em-dash, 6 words) |
| region (2) | an inline code span, delimiters included, drops out (1 em-dash, 8 words) |
| region (3) | a block-quote line drops out whole, not just its marker (1 em-dash, 3 words) |
| region (4) | an `anti_examples:` subtree in a `.yaml` drops out (1 em-dash, 6 words); the same text as `.md` counts 3, pinning that region 4 alone is keyed on the extension |
| exhibits vs instances | a fixture of the shape that broke the old measurement: whole-file `grep -o` reads 7, the metric reads 1 |
| only U+2014 | `–` U+2013 and `-` U+002D are not counted; an en-dash-only file reads 0 |
| exit 1 | no file named — usage on stderr |
| exit 2 | an unreadable path is named on stderr, appears in no row, and the readable file is still measured |

The exhibits case uses a synthetic fixture rather than the shipped `rules/user-facing-output.md`
deliberately: pinning the metric against a corpus file would redden this gate on any edit
to that file's prose.

## Measurements

- Hook test surface, before: total 19 911, floor 17 875, budget 20 375, **head-room 464**.
- Hook test surface, after: total 20 073, **head-room 302**. Measured by summing
  `TEST_LINE_BASELINE` over the files present and comparing against a recursive newline
  count of `hooks/lib/__tests__/**/*.ts`, the way `surface-growth-bound.test.ts` sums it.
  The step's closure clause requires at least 300; the file was cut from a first draft of
  180 lines to 162 to clear it.
- `hooks/lib/__tests__/fixtures/surface-growth.golden` regenerated: one added row
  (`fusion-prose-metric.test.ts 162`) and `total 19911` → `20073`. Nothing else moved.
- `AGENT_BASELINE`, `SKILL_BASELINE`, `TEST_LINE_BASELINE` and `RULE_BASELINE` are
  byte-identical to HEAD `370bfc5`, confirmed by `diff` against `git show HEAD:`. The three
  `*_HEAD_ROOM` constants are unchanged too.
- `reference-resolution-lint.test.ts`'s `surface()` reads `hooks/lib` non-recursively and
  filters on `isFile()`, so it does not walk `__tests__/`. The new file moves no count pin
  and needs no re-approval block. Verified by reading `surface()` at lines 138-184.

## Collateral repair, and one thing that was not mine

Renaming the defect record `_o_` → `_c_` broke two citations of it by its old path, in
`260822-0035_*_…` and `260822-0119_*_…`, and
`workbench-citation-lint.test.ts` went red on both. Each was rewritten to the wildcard
marker form `260821-0144_*_…`, which is the fix the gate's own finding prescribes.

Two further violations in that same run were **not** caused by this step: two issues filed
by the concurrent reviewer at 14:21 and 14:22 cited a review file it had not yet written.
The file landed 8 seconds into a bounded wait and the suite went green with no action on
those two records.

## Verification

`cd hooks && npm test` — exit 0. 41 test files, 724 tests, all passing.

## What was closed, and what was not

Closed `260821-0144_*_the-authoritative-prose-metric-has-no-test-and-the-hook-test-surface-has-43-of-2500-lines-left.md`
with a `Resolved:` note. The note states plainly that the record's title figure (43 of
2 500 lines) is long stale, that the room this file spent was bought by step 2 of this
plan rather than by this fix, and that the record's **second** question — whether a
re-approval comment belongs on a budget derived from what test code costs to maintain and
to run — is **not** closed. That question is filed as
`260822-1154_*_does-the-hook-test-line-budget-cover-comment-prose.md` and
stays open; the record itself named it as not its own to answer.

The separate defect
`260822-1154_*_an-open-defect-cites-a-test-file-deleted-eleven-days-ago-and-half-of-it-is-unfixable.md`
is about a **different** record, `260810-0510_*_…`, not this one. It was read
and is untouched.

## Files changed

- `hooks/lib/__tests__/fusion-prose-metric.test.ts` (new, 162 lines)
- `hooks/lib/__tests__/fixtures/surface-growth.golden` (regenerated)
- `260821-0144_*_…` →
  `…_c_…` (renamed, `Resolved:` note appended)
- `260822-0035_*_two-installed-copies-report-the-same-version-and-differ-in-which-bin-helpers-they-carry.md` (one citation to wildcard form)
- `260822-0119_*_the-prose-metrics-worked-exhibit-reports-six-em-dashes-in-a-file-that-carries-four.md` (one citation to wildcard form)

Nothing staged, nothing committed.
