# Implementation Plan: streaming input, first cut

**Date:** 2026-09-03
**Status:** Complete
**Decidability:** Whether a chunk boundary falls inside a token is decidable from the tokenizer's state at the boundary.

## Implementation Steps

1. [DONE] **A chunked reader behind the existing source trait**
   - Executor: `code-implementer`
   - Files: `src/source/chunked.rs`

2. [DONE] **The tokenizer carries its state across a chunk boundary for ASCII input**
   - Executor: `code-implementer`
   - Files: `src/lexer/mod.rs`

## Where this work stops

- ASCII sources of any size parse through the chunked reader.
