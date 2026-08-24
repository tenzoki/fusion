# ontocoder — T3-notes: close the three findings the Turn 2 data review filed

**Agent:** ontocoder
**Circle:** circles/260824-1853-close-every-open-defect
**Status:** Complete

## What changed

- `planning/260824-1905_p_plan-close-every-open-defect.md:189`: a dated progress line under step 14 records that P-14b closed it at `13aaa85`, so the `[DONE]` mark has the line that justifies it.
- `issues/260824-2056_c_readme-agents-still-cites-skills-next-*.md:13`: `Corrected:` line — citing lines 53, 59, 60, 61 (not 58), five tokens including `:97`, and `:148` a blank line whose restatement is `:149`. `Resolved:` untouched.
- `shared/issues/260811-1734_c_reduce-the-surface-*.md:53`: `Corrected:` line — rows 21 and 23 are both step 12.
- The three `260824-2155_o_*` records closed `fixed` and renamed `_c_`.
- Filed `issues/260824-2147_o_readme-agents-line-61-cites-skills-next-148-which-is-a-blank-line.md` for `coder`: `README-agents.md:61` itself carries the `:148` citation (the review finding said no README line did), and it points at a blank line.

## Verification

- `cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts lib/__tests__/plan-stopping-section-lint.test.ts`: 2 files, 21 tests, exit 0.
- Each citing line verified with `sed -n` / `grep -n 'skills/next' README-agents.md`; `README-agents.md:97` is blank and cites nothing — the `97` in the dispatch is the `skills/next/SKILL.md:97` token on line 59.
