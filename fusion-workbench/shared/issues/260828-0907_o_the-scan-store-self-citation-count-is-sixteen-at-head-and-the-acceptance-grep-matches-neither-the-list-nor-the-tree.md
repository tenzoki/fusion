The `$SCAN_*` self-citation count is sixteen at HEAD, and the acceptance grep matches neither the listed twelve nor the sixteen
---
Issue `shared/issues/260828-0900_*` (and the analysis and five decision records that repeat its figure) says twelve shipped lines in seven files tell a consuming agent a fusion record sits in its `$SCAN_*` store. At HEAD `ffc6ae88` there are sixteen: the twelve listed plus `agents/orchestrator.md:435,511,516,550`. The issue's acceptance grep matches fourteen, finding the four unlisted lines and missing two listed ones (`skills/archive/SKILL.md:142`, `skills/next/SKILL.md:167`) whose slug exceeds the pattern's 80-character window. A fix that reads the grep's empty output as done leaves two lines standing; a fix that works from the list leaves four.
---
**Domain:** code
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Related:** `shared/issues/260828-0900_*` (the undercounted record); `shared/analyses/260828-0859-citation-bookkeeping-defect-report-measured-against-fusions-own-corpus.md` (Instance 2, same figure); `shared/decisions/260828-0904_*_are-shipped-record-citations-provenance-or-pointers-for-a-consuming-agent.md` (question opens with the figure)

Measured 260828-0907 with `grep -nE '[0-9]{6}-[0-9]{4}.{0,80}(in|under) .\$SCAN_' rules/*.md agents/*.md skills/*/SKILL.md README*.md CLAUDE.md` (14 hits) and by reading the four extra hits and the two listed misses.

Acceptance: the fix for `260828-0900_*` removes all sixteen; its acceptance grep is widened to `.{0,160}` (or split into stamp and key as two fixed strings on one line) and returns nothing; the cardinality in the analysis and the five decisions is corrected or annotated per critical-stance norm 5.

Reconciled 260828-1001 (session 260828-0846, re-run after the Rebalance gate, HEAD 7bc0e78e): the sixteen is itself low. The widened acceptance grep this record prescribes (`.{0,160}`) matches twenty-one lines at HEAD, all in the same seven files: the sixteen plus `agents/orchestrator.md:33,148,398,709,1008` (decisions `260824-2013`, `260810-0921`, issues `260811-0114` twice, `260810-1205`, each "in/under `$SCAN_*`"; blame dates 260810 to 260824, none from this session). The 260828-0907 pass read only the 80-window hits and the two listed misses and never ran its own widened grep; that was the reconciler's error. The defect is twenty-one lines in seven files; the acceptance criterion (widened grep returns nothing) stands unchanged and would have caught this.
