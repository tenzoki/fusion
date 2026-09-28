# ontocoder: repair dangling citations after the marker moves (plan steps 3 and 5 follow-up)

**Status:** Complete
**Circle:** 260824-1853-close-every-open-defect
**Plan:** 260824-1905_*_plan-close-every-open-defect.md

## What was done

`hooks/lib/__tests__/workbench-citation-lint.test.ts` named eight stale-marker citations, all spelling `_o_` on a record that steps 3 and 5 renamed to `_c_`. Each was repaired by the one-token change to the wildcard form `_*_` (`rules/fusion-workbench-conventions.md` `## Filename Patterns`). Nothing else in any file was touched; the `_c_circle.md` edit is the citation repair `rules/circle-records.md` sanctions.

| File | Line(s) |
|---|---|
| `260801-1244-rule-provenance-header` | 34 |
| `260820-2249_*_spec-style-rules-arrive-and-get-measured.md` | 455, 461, 509, 513, 515 |
| `260819-0822_*_the-fifth-source-root-call-site-drops-the-diagnostic-four-siblings-carry-and-reopens-a-closed-defect.md` | 66 |
| `260822-0119_*_the-prose-metrics-worked-exhibit-reports-six-em-dashes-in-a-file-that-carries-four.md` | 9 |

The lint named nothing that was not a stale-marker citation.

## Verification

`cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts` — exit 0 (10 passed). Before the edits the same command exited 1 with the eight violations above.

Not committed; no git command beyond `git diff` was run.
