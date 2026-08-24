# coder — P-14b: the citation lint's open-issue control runs on a fixture, not on the tree

**Status:** Complete
**Circle:** circles/260824-1853-close-every-open-defect
**Date:** 2026-08-24 21:36–21:40

## What was done

- Filed and closed `issues/260824-2136_c_the-workbench-citation-lints-positive-control-requires-an-open-issue-on-disk-so-a-clean-workbench-fails-it.md` (person half absent: the installed copy carries no `bin/fusion-identity`).
- `hooks/lib/__tests__/workbench-citation-lint.test.ts`: `corpusFiles(root = workbenchRoot)` gains a root parameter; the "at least one open issue is selected" control writes a scratch workbench under `os.tmpdir()` with one `_o_` and one `_c_` issue and asserts `corpusFiles(tmp)` returns exactly the open one (line 293). Two comment blocks tightened to pay for it.
- `hooks/lib/__tests__/fixtures/surface-growth.golden` regenerated via the documented `UPDATE_SURFACE_GOLDEN=1` run (374 → 376 lines for that file; no baseline touched).
- Plan `planning/260824-1905_p_plan-close-every-open-defect.md`: steps 1, 2, 3, 4, 5, 8, 9, 14 marked `[DONE]`, Status Complete.

## Measurements

- Hook-test head-room: 2 lines before, 0 after (net +2 lines, 20 373 → 20 375 against floor 17 875 + 2 500).
- Open issues on disk outside archive: none.
- Reference-lint `BASELINE` untouched: the new citation is in the workbench-lint corpus, not the shipped-text lint's count.

## Verification

`cd hooks && npm test` — exit 0, 760/760.
