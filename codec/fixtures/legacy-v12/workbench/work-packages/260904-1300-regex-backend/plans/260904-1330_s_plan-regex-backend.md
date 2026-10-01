# Implementation Plan: the regex backend

**Date:** 2026-09-04
**Status:** Superseded by 260903-0830_*_plan-lexer-table-rewrite.md
**Decidability:** Decidable: each token class is a regular language.

## Implementation Steps

1. **One compiled expression per token class**
   - Executor: `code-implementer`
   - Files: `src/lexer/regex.rs`

## Where this work stops

- The lexer suite passes on the regex backend.
