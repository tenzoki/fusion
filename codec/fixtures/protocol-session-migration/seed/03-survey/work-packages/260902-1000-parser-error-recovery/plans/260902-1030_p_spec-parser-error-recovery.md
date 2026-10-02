# Spec: parser error recovery

**Date:** 2026-09-02
**Status:** Approved 2026-09-02 by the user.
**Filed by:** implementation-planner, Fixture Person <fixture@example.invalid>

## Problem

The parser stops at the first syntax error. A file with three mistakes takes three edit-and-run cycles to clean up.

## Requirements

1. After a syntax error the parser resumes at the next synchronising token.
2. Every error is reported once, in source order, with its line and column.
3. An error caused only by an earlier recovery is not reported.

## Acceptance criteria

- [x] A missing semicolon in the middle of a block is reported and the rest of the block parses.
- [ ] Nested blocks recover at the innermost enclosing brace.
