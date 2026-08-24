# P-4: stale citations repaired, three phantom decision files merged

**Agent:** ontocoder
**Task:** plan step 4 of `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md` (Triage rows 92, 131, 139, 152, 155)
**Status:** Complete

## What changed

- Row 131: seven literal `_o_` marker positions starred to `_*_` in `shared/decisions/` (`260801-1020_i_may-any-fusion-writer-touch-rules.md:103`, `260809-1731_i_…:7`, `260810-0921_i_…:107`, `260810-2145_a_…:7,122,157` (one citation, three occurrences), `260812-1232_i_does-the-escalation-counter…:10,11`, `260812-1232_i_does-the-write-guards…:10`). The two in `260810-1635_a_…:7` were already starred at HEAD, so the record's count of nine was seven at the time of this pass.
- Row 155: `shared/decisions/260811-2009_i_…:7`, two marker positions starred; the third citation on the line (`260810-1820_o_`) left as it stood, per the plan.
- Row 152: `circles/260815-0007-…/decisions/260815-0007_i_does-fusion-cleanup-block…:7`, `_a_circle.md` became `_*_circle.md`.
- Row 92: each phantom's text appended to its record under its own `---`, with `30d6f0a` (the commit that wrote the phantoms and realised the answers) inserted after `Implemented:`; the three records renamed `_a_` to `_i_`; the three `*`-named files deleted.
- Row 139: `260814-1915_i_…` now closes with the full footer block (Answered, Implemented filled; Deferred, Superseded by, Retired empty). Its `**Status:**` head field is untouched.
- The five defect records closed with `Resolved: fixed — …` and renamed `_o_` to `_c_`.

## Verification

- `find fusion-workbench -name '*\**'` returns nothing.
- `cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts` exit 0 (10 tests passed), run after all edits.

## Not done here

- Two further literal citations of the same class were seen and left, because they are outside row 131's enumeration: `shared/decisions/260801-1020_i_provenance-header-on-rule-files.md:62` (`260801-1122_o_`) and `shared/decisions/260807-0158_i_how-is-a-unique-record-filename-obtained.md:176` (`260808-0030_o_`). Both are the same one-character repair.
