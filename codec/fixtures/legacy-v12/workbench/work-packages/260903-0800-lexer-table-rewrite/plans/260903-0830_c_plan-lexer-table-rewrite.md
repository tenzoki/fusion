# Implementation Plan: the generated lexer table

**Date:** 2026-09-03
**Status:** Complete
**Decidability:** Decidable: the table is a function of the token grammar alone.

## Implementation Steps

1. [DONE] **A build step that emits the table**
   - Executor: `code-implementer`
   - Files: `build.rs`

2. [DONE] **The hand-written table removed**
   - Executor: `code-implementer`
   - Files: `src/lexer/table.rs`

## Where this work stops

- The lexer suite passes on the generated table.
