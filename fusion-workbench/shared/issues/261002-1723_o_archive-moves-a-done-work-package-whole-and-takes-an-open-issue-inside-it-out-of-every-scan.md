Archive moves a done work package whole and takes an open issue inside it out of every scan
---
`/fusion:archive` selects a work package by its `**Status:**` head field alone and then moves the whole container (`skills/archive/SKILL.md`, Tier 1 table and Step 7). Nothing checks the records inside the container. A `done` item can still hold an `_o_` or `_p_` issue, an `_o_` or `_a_` decision or an open plan, and the move takes that live record out of every store a session scans. Safety filter 2 forbids archiving exactly these markers in tier mode, but it is applied to the shared buckets only, never to a container's contents, so the filter and the container move contradict each other.
---
**Filed by:** user, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260827-1756_*_which-citation-corpus-does-the-archive-safety-filter-protect.md

Evidence, measured in the consuming project krk on 2026-10-02: `/fusion:archive tier-3 30d` moved the container of `foreign:krk:260911-1825-fusion-leseprofile-auf-fusion-11-nachziehen.md` (record `**Status:** done`) into krk's tier-3 archive folder of 2026-10-02 17:20, and with it the issue `foreign:krk:260912-2158_*_zwei-rundendatensaetze-tragen-eine-status-kopfzeile-die-ihrem-eigenen-dateinamen-widerspricht.md`, which was open. A before/after count over `shared/issues` and `work-packages/*/issues` showed open issues 112 → 111 while the run moved only `_c_` files from the shared stores. The proposal the skill printed named the container and its brief line, never the open record inside it, so the user confirmed a list that did not show the live file. Repaired by hand: the issue was moved back to `shared/issues/` and the manifest carries a correction note.

The same gap applies to the claimed item's stores in `$SCAN_*`: those are filtered by marker and are safe. Only the container path skips the filter.

Acceptance: before a `done` or `dropped` container becomes a candidate, the survey walks its `issues/`, `plans/` and `decisions/` and excludes the container when any record carries `_o_`, `_p_` or `_a_` (and `_d_`, consistent with filter 2), naming the container and the live record in the proposal; natural-language mode flags it `[ACTIVE]` instead. A test builds a `done` container holding an `_o_` issue and proves the tier survey does not select it.
