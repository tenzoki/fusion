# Coder session: plan steps 6 and 8 (records 260825-1250 x2)

**Date:** 2026-08-27 18:39
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Plan:** `circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/planning/260827-1756_*_repair-the-twenty-open-defect-records.md`, steps 6 and 8
**Status:** Complete

## What was done

- Step 6: `rules/circle-records.md` `## State Markers — circles` gained one paragraph: a terminal Circle's spec and plan are history, read as evidence, never reconciled in place, reachable only by naming the Circle as `bin/fusion-paths`' second argument. Decision `circles/260824-1853-close-every-open-defect/decisions/260824-2013_*_do-archive-and-terminal-circles-stores-enter-any-scan-set-or-is-the-exclusion-written-down.md` got its `## Answer` (option 5, in the circle-records rule) and moved `_o_` -> `_a_`. Record `shared/issues/260825-1250_*_a-bounded-circle-holds-a-draft-spec-with-49-unreconciled-criteria-that-no-scan-reaches.md` closed on the analysis (36 met / 12 not met / 1 n/a) and the direction, `_p_` -> `_c_`. The analysis's one spelled-marker citation of that record was starred so the rename does not dangle it (plan step 24).
- Step 8: `rules/fusion-workbench-conventions.md` `### Who filed it` names the kinds that owe the field (defects, decisions, reviews, session histories); `## History Logging` requires the line on the history entry; `rules/review-contract.md` mandates `**Filed by:**` as its third header field and every "two" that counted the fields reads "three". Record `shared/issues/260825-1250_*_twenty-eight-records-filed-since-the-attribution-rule-landed-carry-no-person-half-and-no-stated-reason.md` closed (`_o_` -> `_c_`; it carried `_o_`, not the `_p_` the dispatch named), no gate added, reasons in the note. Decision `260827-1756_*_which-record-kinds-owe-the-person-half-of-filed-by.md` `_a_` -> `_i_`, citing the step; the commit hash is the orchestrator's.
- Bytes: conventions 50101 -> 50622 (+521 always-on), circle-records 24653 -> 25373, review-contract 6364 -> 6725. Golden regenerated with `UPDATE_RULES_GOLDEN=1`; the diff is size lines only.
- Citation pin: 1508/208 -> 1513/210. My share +3/+1, measured per file by single-file revert; the remaining +2/+1 is the concurrent step 9 task's in-flight edits to `agents/orchestrator.md` and `rules/orchestrator-rebalance.md`, stated on the BASELINE line.

## Not done, flagged

`agents/coderev.md:69`, `agents/ontorev.md:62` and `CLAUDE.md` (the `rules/review-contract.md` Layout row) still say "the two mandated header fields"; the count is three now. Outside this dispatch's scope; named in record 8's `Resolved:` note.

Verification: `cd hooks && npx vitest run lib/__tests__/rules-emission-golden.test.ts lib/__tests__/review-coverage-mandate.test.ts lib/__tests__/reference-resolution-lint.test.ts lib/__tests__/workbench-citation-lint.test.ts` — exit 0 (77 tests).
