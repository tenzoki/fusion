# Coder: bind the playmaker rationale to a read, bound the activation-proposal block

**Date:** 260827-1808
**Status:** Complete
**Plan:** `260827-1756_*_repair-the-twenty-open-defect-records.md` Bundle C step 2 (records 2 and 3)

## Implemented

`agents/playmaker.md`, eight edits against the plan's line numbers (each verified one line lower in the file at HEAD):
- Deleted the top-of-prompt consultant boundary paragraph and its blank line; the `## Boundary notes` consultant entry now carries the "did not survive the reorganisations" clause itself.
- `## Scope`, Circle-record write line: an append is permanent, checking budget goes there first.
- Step 2 cap: "enough to rank, and enough to check what you state, no more"; the verifying read is inside scope. Step 17 edits this sentence next.
- Step 2b merge item: traceability subject widened to every sentence written into a Circle record, the portfolio or the log.
- Step 3 rationale and `## Output Style` citation bullet: a cited path names a file this run opened, or the clause is marked `inference:` (`rules/critical-stance.md` §3, pointed at).
- `## Activation proposals`: the appended block is bounded to the one-paragraph rationale, timestamp and run id; a mechanism or file-content claim is a quotation with its path or absent.

Bytes: 38 953 to 39 269, +316 (plan expected under +600). `hooks/lib/__tests__/fixtures/surface-growth.golden` regenerated for the new per-file size; the bound itself was never crossed. Both records closed with `Resolved:` and renamed `_p_` to `_c_`.

## Verification

`cd hooks && npx vitest run lib/__tests__/surface-growth-bound.test.ts lib/__tests__/playmaker-backlog-mandate-lint.test.ts lib/__tests__/workbench-citation-lint.test.ts` — exit 0 (27 tests).
