Two step histories cite seven records by the open marker the same step moved, and history is outside the gate
---
`circles/260824-1853-close-every-open-defect/history/260824-2019-ontocoder-repair-seven-citations-and-close-row-102.md:12-17` and `…/history/260824-2032-ontocoder-citation-repair.md:14-16` cite six records by their open marker, as pointers. Verbatim, the spelling being the datum:

```
260814-1850_o_the-new-dispatch-contract…
260815-1913_o_closing-the-plan…
260816-0725_o_…
260816-1330_o_the-override-record…
260819-0822_o_…
260822-0119_o_…
```

All six are `_c_` at `d5c34cd`, renamed by this range. `hooks/lib/__tests__/workbench-citation-lint.test.ts` `inCorpus()` admits circle records, open issues, live decisions and live plans only, so no history file is judged and these went stale silently. Two further spelled markers sit inside the corpus and resolve today only because their targets have not moved yet: `circles/260824-1853-close-every-open-defect/_t_circle.md:32` (an `_a_` spelling) and `shared/issues/260816-1330_*_two-of-the-twenty-nine-replacements-chose-a-mark-weaker-than-the-clause-it-replaced.md:15`, whose commit `a760849` starred the first citation on the line and left the second.
---
**Filed by:** ontorev
**Attribution backfilled 260825 (not written by the filing agent):** `ontorev` filed this record; the person half of `**Filed by:**` is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried no `bin/fusion-identity` at that time. See `shared/issues/260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.
**Severity:** Low
**Domain:** data
**Affects:** the two history files above; `circles/260824-1853-close-every-open-defect/_t_circle.md:32`; `shared/issues/260816-1330_*_two-of-the-twenty-nine-replacements-chose-a-mark-weaker-than-the-clause-it-replaced.md:15`
**Cross-references:** `rules/fusion-workbench-conventions.md` `## Filename Patterns` (cite with the marker wildcarded); `shared/decisions/260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md`

Fix: star the marker in all nine positions. Whether history files should enter the corpus is the open question of 260816-0119 and 260823-1414, not this record's.
---
Resolved: fixed — the marker is starred in every pointer the record names: seven positions across the two history files, the `_a_` on `_t_circle.md:32` and the `_o_` on `shared/issues/260816-1330_*_two-of-the-twenty-nine-replacements-chose-a-mark-weaker-than-the-clause-it-replaced.md:15`; whether history enters the corpus stays with 260816-0119; `grep -c '_o_the\|_o_spec\|_o_closing' circles/260824-1853-close-every-open-defect/history/260824-2019-*.md circles/260824-1853-close-every-open-defect/history/260824-2032-*.md` prints 0 for both
