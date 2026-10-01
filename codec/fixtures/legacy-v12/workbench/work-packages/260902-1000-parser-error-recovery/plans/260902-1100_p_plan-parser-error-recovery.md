# Implementation Plan: parser error recovery, part 1

**Date:** 2026-09-02
**Status:** In progress
**Spec:** 260902-1030_*_spec-parser-error-recovery.md
**Decidability:** Whether a token ends a recovery is decidable from the grammar's follow sets, which the parser generator already emits.

## Implementation Steps

Steps 3 to 12 moved to part 2 when the plan was split; 12a and 12b stayed here because they finish what step 2 starts.

1. [DONE] **The synchronising-token table**
   - Executor: `code-implementer`
   - Files: `src/parser/sync.rs`
   - Acceptance: the table equals the generated follow sets.

2. [IN PROGRESS] **Panic-mode recovery in statement lists**
   - Executor: `code-implementer`
   - Files: `src/parser/stmt.rs`
   - Acceptance: the recovery corpus's statement cases report each error once.

12a. [OPEN] **Recovery inside nested blocks**
   - Executor: `code-implementer`
   - Files: `src/parser/block.rs`
   - Dependencies: step 2.

12b. **A cap on the number of reported errors**
   - Executor: `code-implementer`
   - Files: `src/parser/mod.rs`
   - Dependencies: step 12a.

## Where this work stops

- Every seeded error in the recovery corpus is reported once, in order.
- Step 12a's nested-block cases pass.
