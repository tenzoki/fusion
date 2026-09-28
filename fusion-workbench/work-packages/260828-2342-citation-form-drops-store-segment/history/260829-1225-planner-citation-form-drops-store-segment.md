# Planner session: the citation form drops the store segment

**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Status:** Complete
**Circle:** `260828-2342-citation-form-drops-store-segment` (dispatched with `**Circle:**` and `**Executors:** coder, ontocoder, analyst`)
**HEAD at planning:** `dfd567c4`

## What was read

The Circle record's Directive and Grounding snapshot; the five `260828-0904_a_*` decisions; issues `260828-0828_*_fusion-citation-bookkeeping-defect-report.md`, `260828-0900_*_twelve-shipped-lines-tell-a-consuming-agent-that-one-of-fusions-own-records-sits-in-its-scan-store.md`, `260828-0901_*_the-archive-safety-filter-greps-the-literal-basename-and-cannot-match-the-wildcard-citation-form-the-rule-mandates.md`, `260828-0907_*`; the analysis `260828-0859-citation-bookkeeping-defect-report-measured-against-fusions-own-corpus.md` (Findings 4 and 5); the grammar `hooks/lib/__tests__/helpers/citation-scan.ts` and the three gates; `skills/archive/SKILL.md` filter 3; `hooks/lib/__tests__/helpers/growth-bound.ts` and the two bound tests; `bin/fusion-staging-drift` and `hooks/staging-drift.ts` as the helper shape; `skills/cleanup/SKILL.md` Steps 3 and 8; `rules/circle-records.md` head-field and citation-form sections.

## What was measured, all at `dfd567c4`

- Uniqueness: 721/721 marked records live, 1 258/1 258 with `archive/`, 977/977 markerless stamped artifacts, 0 collisions over all 2 235 marker-normalised stamped basenames.
- Store-prefixed record tokens: 6 842 in 1 308 live workbench files, 2 087 in 460 archived files, 109 in 40 shipped files, 117 in 21 hook-test files (fixtures, not swept).
- `$SCAN_*` self-citations: 19 lines in five files (the curator's `f659b04b` rewrote two of the 21).
- Bare stamps in the shipped text: 91 tokens, 43 distinct; 26 resolve to exactly one artifact, 14 are ambiguous, 3 match nothing.
- Growth bounds: agents 11 086 bytes free, skills 93 bytes, hook tests 62 lines (the dispatch's 433 was stale), always-on core 12 345 bytes.

## What was written

- Plan: `260829-1226_*_citation-form-drops-store-segment.md`, 12 steps in three commits, every step `coder`. No step produces a strategic deliverable, so `analyst` is unused; no step touches structured data, so `ontocoder` is unused.
- Decision: `260829-1225_*_which-path-shaped-tokens-does-the-storeless-form-reach-beyond-a-record-citation.md`, filed because the five answered decisions leave three path-shaped token classes unnamed and the workbench gate judges all three; the plan proceeds on option 1 and names the option-2 fallback at steps 2 and 4.
- No issue filed: every defect met was already on file (`260828-0900_*_twelve-shipped-lines-tell-a-consuming-agent-that-one-of-fusions-own-records-sits-in-its-scan-store.md`, `260828-0901_*_the-archive-safety-filter-greps-the-literal-basename-and-cannot-match-the-wildcard-citation-form-the-rule-mandates.md`, `260828-0907_*`).

## Two things the next reader should know

- The plan's own fixture strings first reddened `workbench-citation-lint` (a live plan enters the corpus); they now carry `foo` slugs, which the grammar exempts as fabricated. That is the gate working, and it is the same cost step 3 of the plan pays attention to.
- The hook-test budget stands at 62 lines, not 433. The plan pays for its tests with step 1's move of the grammar into `hooks/lib/`, which the helper requires anyway, and says so.
