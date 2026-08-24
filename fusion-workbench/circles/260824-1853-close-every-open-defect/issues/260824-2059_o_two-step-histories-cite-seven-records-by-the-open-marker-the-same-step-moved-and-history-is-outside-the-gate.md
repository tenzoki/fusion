Two step histories cite seven records by the open marker the same step moved, and history is outside the gate
---
`circles/260824-1853-close-every-open-defect/history/260824-2019-ontocoder-repair-seven-citations-and-close-row-102.md:12-17` and `…/history/260824-2032-ontocoder-citation-repair.md:14-16` cite `260814-1850_o_the-new-dispatch-contract…`, `260815-1913_o_closing-the-plan…`, `260816-0725_o_…`, `260816-1330_o_the-override-record…`, `260819-0822_o_…` and `260822-0119_o_…` as pointers. All six are `_c_` at `d5c34cd`, renamed by this range. `hooks/lib/__tests__/workbench-citation-lint.test.ts` `inCorpus()` admits circle records, open issues, live decisions and live plans only, so no history file is judged and these went stale silently. Two further spelled markers sit inside the corpus and resolve today only because their targets have not moved yet: `circles/260824-1853-close-every-open-defect/_t_circle.md:32` (`260822-1102_a_…`) and `shared/issues/260816-1330_o_two-of-the-twenty-nine-replacements…:15`, whose commit `a760849` starred the first citation on the line and left the second.
---
**Filed by:** ontorev
**Severity:** Low
**Domain:** data
**Affects:** the two history files above; `circles/260824-1853-close-every-open-defect/_t_circle.md:32`; `shared/issues/260816-1330_o_two-of-the-twenty-nine-replacements-chose-a-mark-weaker-than-the-clause-it-replaced.md:15`
**Cross-references:** `rules/fusion-workbench-conventions.md` `## Filename Patterns` (cite with the marker wildcarded); `shared/decisions/260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md`

Fix: star the marker in all nine positions. Whether history files should enter the corpus is the open question of 260816-0119 and 260823-1414, not this record's.
