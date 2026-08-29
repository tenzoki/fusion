# Coder: step 1 of `260829-1226_*_citation-form-drops-store-segment.md` (the grammar moves to `hooks/lib/citation-scan.ts`)

**Date:** 2026-08-29
**Agent:** coder
**Circle:** 260828-2342-citation-form-drops-store-segment
**Status:** Complete

## What was done

- `hooks/lib/citation-scan.ts` (new): the grammar, the exemptions, `fencedContentLines`, the two memoised indexes, the token walk, `scanRecordCitations`, `scanCitationTokens`, `scanCorpus`, `partition`, `markdownFilesUnder`, `shippedPrompts` and `agentNames`, moved verbatim from the test helper. The indexes and every resolver are bound to a workbench root through `createScanner(workbenchRoot)`; `agentNames` and `shippedPrompts` take the plugin root as their first argument. Header rewritten: the "test-scoped on purpose" paragraph is gone and the module states why it left the test tree (decision `260828-0904_*_does-fusion-ship-a-citation-checker-to-consuming-projects.md`). The CLI `main` at the old tail was dropped; step 8 builds the shipped entry point.
- `hooks/lib/__tests__/helpers/citation-scan.ts`: now a 52-line shim. Keeps `pluginRoot`, `workbenchRoot`, `WORKBENCH_PRESENT`, binds one scanner, re-exports the bound functions, the root-free helpers and the types under their old names. No test import changed.
- `hooks/dist/lib/citation-scan.js` and `.d.ts`: built by `npm run build`.
- Two files the dispatch scope did not name but the gates forced, both reported rather than hidden:
  - `README-hooks.md`: one `hooks/lib` table row for `lib/citation-scan.ts`. `derivable-enumerations-lint` requires the table to list exactly the `lib/*.ts` files that exist, so the module cannot land without the row. The plan's step 1 lists this file.
  - `hooks/lib/__tests__/fixtures/surface-growth.golden`: regenerated with `UPDATE_SURFACE_GOLDEN=1` (the helper 947 -> 52 lines, hook tests total 20 313 -> 19 418). No baseline moved.
  - `hooks/lib/__tests__/reference-resolution-lint.test.ts`: `BASELINE.paths` re-approved 1514 -> 1517, anchors unmoved, the whole move measured by single-file revert of `README-hooks.md` (the row's three path tokens). Note prepended on the existing line; the file's line count is unchanged at 990.
- Not touched, left for a later step: the two citations of the old helper path in `CLAUDE.md` (the `bin/fusion-prose-metric` row) and `bin/fusion-prose-metric:96`. The path still exists as the shim, so both still resolve; the plan names them under step 1 but the dispatch scope excluded them.

## Verification

- `cd hooks && npm run build` — exit 0.
- `cd hooks && npm test` — exit 0 (44 files, 785 tests).
- Hook-test surface: 20 313 -> 19 418 lines (895 freed; the plan expected about 530 against the 574-line baseline entry, the helper had grown to 947 since).
