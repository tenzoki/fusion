Plan step 14 is marked [DONE] above a progress line that says it is not
---
`circles/260824-1853-close-every-open-defect/planning/260824-1905_p_plan-close-every-open-defect.md:181` reads `14. [DONE] **Closing measurement and the umbrella records**`. The only progress line under it (`:188`, coder, 260824-2150) ends "**Acceptance not met after the closures:** `npm test` exits 1 on `workbench-citation-lint.test.ts` … Step 14 not `[DONE]`." The mark was set by P-14b (`circles/260824-1853-close-every-open-defect/history/260824-2136-coder-p14b-citation-lint-positive-control.md`, "steps 1, 2, 3, 4, 5, 8, 9, 14 marked `[DONE]`, Status Complete") after that log's own `npm test` read 760/760, but no line under step 14 records that. A reader of the plan alone sees a step whose mark and whose last progress note contradict each other, and the plan is the record the Circle's closure reads.
---
**Filed by:** ontorev
**Severity:** Low
**Domain:** data
**Affects:** `circles/260824-1853-close-every-open-defect/planning/260824-1905_p_plan-close-every-open-defect.md:181-188`
**Cross-references:** `circles/260824-1853-close-every-open-defect/history/260824-2150-coder-step-14-closing-measurement.md` (the measurement); `circles/260824-1853-close-every-open-defect/history/260824-2136-coder-p14b-citation-lint-positive-control.md` (the fix that made the acceptance true); `circles/260824-1853-close-every-open-defect/issues/260824-2136_c_the-workbench-citation-lints-positive-control-requires-an-open-issue-on-disk-so-a-clean-workbench-fails-it.md`

Attribution: the person half of `Filed by:` is absent because the installed plugin copy (`$FUSION_PLUGIN_ROOT/bin/`) does not carry `bin/fusion-identity`; the guarded call failed with the helper missing, not with exit 4, so an identity was owed and could not be read.

Fix: append one progress line under step 14 (`Progress 260824-2136 (coder): P-14b moved the open-issue control onto a fixture; `npm test` 43 files, 760 tests, exit 0; acceptance met, step marked [DONE]`), so the mark has the line that justifies it.

---
Resolved: fixed — a dated progress line under step 14 now records that P-14b closed it at `13aaa85`; `circles/260824-1853-close-every-open-defect/planning/260824-1905_p_plan-close-every-open-defect.md:189`
