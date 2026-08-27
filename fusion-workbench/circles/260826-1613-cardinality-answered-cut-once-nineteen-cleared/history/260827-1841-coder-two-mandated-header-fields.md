# coder — remove the bare "two mandated header fields" count (follow-up to plan step 8, commit 38dc63e)

**Agent:** coder
**Circle:** 260826-1613-cardinality-answered-cut-once-nineteen-cleared
**Status:** Complete

## What
`rules/review-contract.md` mandates three header fields; three surfaces still said "the two mandated header fields". Per `rules/critical-stance.md` §5:

- `agents/coderev.md:69`, `agents/ontorev.md:62` — now "the mandated header fields" (no count).
- `CLAUDE.md:54` — now names the three: `**Reviewed-range:**`, `**Not-opened:**`, `**Filed by:**`.
- `hooks/lib/__tests__/fixtures/surface-growth.golden` regenerated per its header: coderev.md 8145→8141, ontorev.md 7098→7094, agents total 406250→406242.

## Verification
`cd hooks && npx vitest run lib/__tests__/surface-growth-bound.test.ts lib/__tests__/review-coverage-mandate.test.ts lib/__tests__/derivable-enumerations-lint.test.ts` — exit 0 (3 files, 47 tests).
`grep -rn "two mandated" agents/ CLAUDE.md rules/` — empty.

Not committed; the orchestrator commits.
