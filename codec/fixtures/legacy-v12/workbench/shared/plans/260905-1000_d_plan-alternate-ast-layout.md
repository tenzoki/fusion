# Implementation Plan: an arena-allocated AST

**Date:** 2026-09-05
**Status:** Deferred by the user until the benchmark suite exists.

## Implementation Steps

1. **Nodes allocated from one arena per parse**
   - Executor: `code-implementer`
   - Files: `src/ast/arena.rs`

## Where this work stops

- The parser allocates no node outside the arena.
