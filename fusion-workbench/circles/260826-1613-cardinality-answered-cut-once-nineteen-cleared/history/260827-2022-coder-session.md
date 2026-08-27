# coder session 260827-2022 — plan steps 12 and 20

**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Status:** Complete

## Implemented

- Step 12 (record `shared/issues/260825-1440_*`, decision `260827-1756_*` option 1): `skills/archive/SKILL.md` filter 3 (line 118) and Step 4's grep (line 193) run over a positive, existence-guarded enumeration of the shipped corpus plus the project's `CLAUDE.md`, `rules/`, `.claude/rules/`; kept-line names the citing file; guardrail wording follows. `hooks/lib/__tests__/workbench-citation-lint.test.ts` `inCorpus` comment names the skill as twin (one line replaced, line count unchanged at 376). The two globbed kinds go through `find` because zsh `nomatch` aborted the first draft's `for` list in a dry run.
- Step 20 (record `shared/issues/260827-1741_*`): filter 2 bullet (line 116), `open_in` in Step 3 (line 186), Tier 1 row, Step 5 report line; `skills/cleanup/SKILL.md` Step 4 summary (line 177). A first draft named type folders and failed `path-literal-lint`; store names are now the shared stores' basenames.
- Records: both issues closed and renamed `_o_`→`_c_`; decision renamed `_a_`→`_i_`; plan steps 12 and 20 `[DONE]`.

## Measured

- Bytes: `skills/archive/SKILL.md` 23714 → 25965 (+2251); `skills/cleanup/SKILL.md` 23504 → 23735 (+231); total +2482 of the ~2800 allotted.
- `reference-resolution-lint` by single-file revert against the dirty tree: archive -2 paths (1508 → 1506), anchors 0; cleanup 0; the test comment 0 (`recordsOnly`). Not re-pinned; the orchestrator re-approves.
- In-repo survey: 19 terminal Circles, 18 kept by a named citing file, 6 carry open records (1 to 10).
- Scratch workbench dry run of `open_in` and the corpus grep: as the records' acceptance 1 and 2 require.

## Verification

`cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts lib/__tests__/path-literal-lint.test.ts lib/__tests__/derivable-enumerations-lint.test.ts` — exit 0 (52 passed).
