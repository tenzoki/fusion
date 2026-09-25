# Coder: step 13, `rules/` (the always-on core and the conditional files)

**Status:** Complete
**Plan:** `260824-1905_*_plan-close-every-open-defect.md` step 13
**Dispatched by:** orchestrator

## What was done

Ten rule files edited, 24 defect records closed (`_o_` → `_c_`), one test pin re-approved, the rules-emission golden regenerated.

**Always-on core.** Head-room before: 431 bytes (98 142 emitted against a budget of 98 573). After: 209 bytes (98 364 emitted). The placeholder-footer cut in the decision-record template (row 85) was made first and paid for the additions in rows 61, 8/74, 95 and 217. `bin/fusion-prose-metric` reads `ok` on all five core files; `rules/critical-stance.md` went from 1 em-dash of a permit of 1 to 0, because its specimens now sit in block quotes.

**Conditional files.** `rules/circle-records.md` grew 22 798 → 24 653 bytes (rows 26, 149, 213). The role report now stands at: playmaker 24 653 against a budget of 21 302 (over by 3 351), shaper 29 938 against 26 975 (over by 2 963), and a third role newly over: orchestrator 30 760 against 30 552 (over by 208), because `rules/commit-lock.md` grew 5 671 → 6 107 with the `cd` paragraph (row 17). These are reports, not failures.

**Test pin.** `hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE` re-approved paths 1350 → 1353, anchors unmoved, on the same line. `hooks/lib/__tests__/fixtures/rules-emission.golden` regenerated with `UPDATE_RULES_GOLDEN=1`. `surface-growth.golden` did not need regenerating.

## Departures from the records' proposals

- Row 198: the `_i_` row took the colon, and its internal colon became `, and` rather than a full stop and capital. A capital `Code` drops the row out of `hooks/lib/domain-cascade.ts` `REACH.holes[0].cost` (12 → 11), and that pin and the `README-hooks.md` block it regenerates are outside this step's files.
- Row 72: `skills/next/SKILL.md:5` still carries the real Circle name; that was step 10's half and is noted in the record's `Resolved:` line.
- Row 149: `agents/playmaker.md:207` still carries the single-line split form; not this step's file.
- Row 213: `agents/orchestrator.md` `## Circle head fields` says "the claim's two literal openings"; there are three now. Not this step's file.

## Citation sweep the renames forced

Closing 24 records moved their markers, and `workbench-citation-lint` reads every live record. Every pointer to one of the 24 in a live record was starred to the wildcard form: `260820-2249_*_spec-style-rules-arrive-and-get-measured.md` (two), `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, and two pointer fields in reviewer records filed into this Circle during the step (the `**Affects:**` line of `260824-2059_*_two-step-histories…` and one citation in `260824-2056_*_readme-agents-still-cites…`). One statement-about-a-citation on line 3 of `260824-2059_*_two-step-histories…` was touched by the sweep and reverted by hand, since the spelling there is the reviewer's datum.

## Verification

`cd hooks && npm test` exit 1: 748 of 749 pass. The one failure is `workbench-citation-lint` on line 3 of `260824-2059_*_two-step-histories-cite-seven-records-by-the-open-marker-the-same-step-moved-and-history-is-outside-the-gate.md`, a reviewer's record filed during this step that lists seven records by their old open marker as prose addresses rather than as file:line or a fence. Six of the seven were dangling before this step's renames (seen in the first full run); the seventh, `260816-1330_*_two-of-the-twenty-nine…`, went dangling with this step's closure of it. The record is the reviewer's and the fix is theirs; not edited. Every gate the step names is green: `rules-emission-golden`, `provenance-header-lint`, `reference-resolution-lint`, `surface-growth-bound`.
