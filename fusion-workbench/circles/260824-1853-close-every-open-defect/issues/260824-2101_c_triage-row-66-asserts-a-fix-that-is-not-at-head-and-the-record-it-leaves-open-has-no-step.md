Triage row 66 asserts a fix that is not at HEAD, and the record it leaves open has no step
---
Row 66 of the plan assigns `shared/issues/260816-1330_*_the-repunctuation-replaced-three-em-dashes-with-three-vague-pronoun-openers-the-same-blacklist-bans.md` to S2 as "verified at HEAD: none of the three openers stands". The step-2 executor found one does (`rules/user-facing-output.md:19`, "Those belong") and correctly left the record `_o_` (`…/history/260824-2016-ontocoder-close-moot-unfixable-and-fixed-records.md:17`). The plan was not corrected and no later step lists row 66, so the record is the one of 220 with no ending assigned. It is a one-line `rules/` edit, the surface S13 holds.
---
**Filed by:** ontorev
**Severity:** Low
**Domain:** data
**Affects:** `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md` row 66; `rules/user-facing-output.md:19`
**Cross-references:** `…/history/260824-2016-ontocoder-close-moot-unfixable-and-fixed-records.md:17`

Fix: append a progress note to the plan moving row 66 to S13, and let the S13 coder replace the opener in the same commit that closes the record.
---
Resolved: moot — step 13 replaced the opener and closed the record as fixed before this one was read: `rules/user-facing-output.md` at HEAD carries no "Those belong" (`grep -c 'Those belong' rules/user-facing-output.md` prints 0) and `shared/issues/260816-1330_*_the-repunctuation-replaced-three-em-dashes-with-three-vague-pronoun-openers-the-same-blacklist-bans.md` is `_c_`; the plan's row 66 stands as the record of the wrong assertion
