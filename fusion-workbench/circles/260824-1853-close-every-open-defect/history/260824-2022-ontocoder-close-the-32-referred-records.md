# ontocoder — P-3: close the 32 defect records that are referred

**Date:** 2026-08-24 20:22
**Task:** plan step 3 of `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md` (Triage rows 1, 2, 3, 4, 6, 7, 11, 12, 16, 32, 33, 34, 36, 41, 44, 103, 116, 118, 121, 125, 143, 144, 157, 166, 169, 170, 173, 193, 202, 203, 204, 206)
**Status:** Complete

## What was done

- Read all 32 records in full. None argues against a referral ending. One carries a tension, recorded in its note rather than left standing: row 32 (`shared/issues/260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`) says twice that "the closing act remains the user's"; the note names the user's Directive for this Circle (every open defect ends at `_c_`) as that act.
- Appended `---` and one `Resolved: referred (decision | backlog | C4) — <clause>; <path>` line to each of the 32, then `mv` `_o_` → `_c_` with full paths, one record per command, no globs.
- Appended one `Also seen: 260824-2022 by ontocoder — …` line to `shared/decisions/260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md` for row 173 (the baseline-raise question).
- Referral targets: the eight `260824-2013_*` decisions of step 1 (rows 2, 6, 11, 12, 16, 41, 116, 121, 125, 144, 166, 204, 206); existing decisions (rows 7, 44, 143, 157, 170, 173, 193); `### C4` of `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` (rows 103, 202, 203); existing backlog entries (rows 32, 33); backlog entry to be filed by the user (rows 1+118 as one idea, 3, 4, 34, 36, 169).

## Verification

- Every `_*_` path named in the 32 notes resolves with `ls` (checked under bash globbing; 0 unresolved). `### C4` exists once in the spec.
- `cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts` — **exit 1**, 8 dangling citations. Six are caused by this step's renames and sit in files outside this task's file list: `circles/260801-1244-rule-provenance-header/_c_circle.md:34` cites row 2 with `_o_`; `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2249_o_spec-style-rules-arrive-and-get-measured.md:455,461,509,513,515` cites rows 33, 32, 7, 32, 33 with `_o_`. Two are not this step's: `260821-0147_o_…` cited from `…/issues/260821-0149_o_…` and `shared/issues/260822-0119_o_…` (a step-5 rename). Not repaired: the task says touch nothing else and no `_*_circle.md`; plan step 4 is the citation-repair step.

## Result

blocked — the lint exit code is 1. The 32 closures and the `Also seen:` line are on disk and correct; the six `_o_` literals in the two files above need the `_*_` form before the gate is green. Nothing committed.
