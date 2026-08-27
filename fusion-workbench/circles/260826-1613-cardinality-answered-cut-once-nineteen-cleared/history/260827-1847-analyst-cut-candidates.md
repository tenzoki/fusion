# Analyst session: cut candidates for `skills/` and the hook tests

**Date:** 2026-08-27 18:47
**Agent:** analyst, dispatched by the orchestrator for plan step 21
**Filed by:** analyst, Kai Stalmann <kai@qantr.com>
**Status:** Complete

## What was done

- Re-measured the four growth bounds at HEAD `c599bf0` with the gate tests' own readers: hook tests 1 line free, `skills/` 88 bytes free, `agents/` 13 879, rule core 12 963.
- Sized the `skills/` need from drafted texts for steps 5, 12, 18b/10b, 20 and the two C4 records that touch the surface (`260826-1112`, `-1113`): 5 986 bytes drafted; cut recommended at 7 000 or more.
- Sized the hook-test need: step 19's measured 285 plus 189 estimated for the five C4 records (`260826-0847`, `-0848`, three `-0906`): 474 lines; cut recommended at 500 or more.
- Ranked eight `skills/` candidates (about 10 850 bytes reachable) and nineteen hook-test candidates (74 from the C4 reserve re-verified, about 383 from header prose shrunk in place), each with a verified span and its loss.
- Wrote `analyses/260827-1843-cut-candidates-for-skills-and-the-hook-tests.md`. Filed no issue. Edited no shipped file.

## Two corrections to earlier analyses, recorded here rather than by editing them

- The C4 reserve's candidates 5 to 8 are 74 lines at HEAD, not 78 (the import-form cases are 18, not 22).
- Nine hook-test files carry no baseline entry, not eight: `fusion-events.test.ts` joined at `46de871`.

## Verification

`bin/fusion-prose-metric` on the report: 0 em-dashes over 4 159 words. `npx vitest run lib/__tests__/workbench-citation-lint.test.ts lib/__tests__/surface-growth-bound.test.ts`: 22 passed. No file outside the two write targets was created or changed.
