# coder — Turn 2, three review findings (260827-2042)

**Status:** Complete
**Circle:** 260826-1613-cardinality-answered-cut-once-nineteen-cleared

## Implemented
- `skills/archive/SKILL.md`: Step 4 corpus block resolves `SRC` inside the block (guarded `bin/fusion-source-root`, `$FUSION_PLUGIN_ROOT` fallback), reports and skips on an empty root, redirect moved inside the `find` group; filter 3 prose names the skip; filter 2 line 116 names the live markers and excludes `_d_`. 25965 → 26245 bytes (+280, cap +300). `skills/` total 239605 → 240241.
- `rules/circle-records.md`: "the one way" clause replaced; 25373 → 25544 bytes.
- Three records closed `_p_` → `_c_` with `Resolved:` notes.

## Verification
`cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts lib/__tests__/path-literal-lint.test.ts lib/__tests__/rules-emission-golden.test.ts` — exit 1. Citation lint passes. path-literal-lint fails on `agents/orchestrator.md:885` (not touched here). rules golden fails first on `review-contract.md` 6725 → 6699 (working-tree change not mine) and would also fail on `circle-records.md` 25373 → 25544 (mine, byte size only). Goldens and BASELINE untouched.
Corpus block run verbatim in fresh `bash -c`: resolved → 21 entries, no `/bin`; unset → report line, 0 entries.
