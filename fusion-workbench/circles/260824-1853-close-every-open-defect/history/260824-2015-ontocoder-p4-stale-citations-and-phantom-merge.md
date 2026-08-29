# P-4: stale citations repaired, three phantom decision files merged

**Agent:** ontocoder
**Task:** plan step 4 of `260824-1905_*_plan-close-every-open-defect.md` (Triage rows 92, 131, 139, 152, 155)
**Status:** Complete

## What changed

- Row 131: seven literal `_o_` marker positions starred to `_*_` in `shared/decisions/` (`260801-1020_*_may-any-fusion-writer-touch-rules.md:103`, `260809-1731_*_…:7`, `260810-0921_*_…:107`, `260810-2145_*_…:7,122,157` (one citation, three occurrences), `260812-1232_*_does-the-escalation-counter…:10,11`, `260812-1232_*_does-the-write-guards…:10`). The two in `260810-1635_*_…:7` were already starred at HEAD, so the record's count of nine was seven at the time of this pass.
- Row 155: `260811-2009_*_…:7`, two marker positions starred; the third citation on the line (`260810-1820_*_an-executor-verified-a-gate-by-mutating-a-file-another-executor-held-in-the-live-tree.md`) left as it stood, per the plan.
- Row 152: `circles/260815-0007-…/260815-0007_*_does-fusion-cleanup-block…:7`, `_a_circle.md` became `_*_circle.md`.
- Row 92: each phantom's text appended to its record under its own `---`, with `30d6f0a` (the commit that wrote the phantoms and realised the answers) inserted after `Implemented:`; the three records renamed `_a_` to `_i_`; the three `*`-named files deleted.
- Row 139: `260814-1915_*_…` now closes with the full footer block (Answered, Implemented filled; Deferred, Superseded by, Retired empty). Its `**Status:**` head field is untouched.
- The five defect records closed with `Resolved: fixed — …` and renamed `_o_` to `_c_`.

## Verification

- `find fusion-workbench -name '*\**'` returns nothing.
- `cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts` exit 0 (10 tests passed), run after all edits.

## Not done here

- Two further literal citations of the same class were seen and left, because they are outside row 131's enumeration: `260801-1020_*_provenance-header-on-rule-files.md:62` (`260801-1122_*_`) and `260807-0158_*_how-is-a-unique-record-filename-obtained.md:176` (`260808-0030_*_`). Both are the same one-character repair.
