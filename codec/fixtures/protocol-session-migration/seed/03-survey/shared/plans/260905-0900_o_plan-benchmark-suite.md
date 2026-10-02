# Implementation Plan: a benchmark suite for the front end

**Date:** 2026-09-05
**Status:** Draft
**Filed by:** implementation-planner, Fixture Person <fixture@example.invalid>
**Decidability:** Decidable: each benchmark is a fixed input and a timed run.

## Implementation Steps

1. **A corpus of generated sources in three sizes**
   - Executor: `data-implementer`
   - Files: `bench/corpus/`

2. **A timing harness over the lexer**
   - Executor: `code-implementer`
   - Files: `bench/lexer.rs`

2b. **A timing harness over the parser**
   - Executor: `code-implementer`
   - Files: `bench/parser.rs`

## Where this work stops

- `cargo bench` reports the lexer and the parser on all three sizes.
