# P-7b: Layout row for `bin/fusion-session-domain`

**Agent:** coder
**Date:** 2026-08-24
**Status:** Complete

## What was done

- `CLAUDE.md` line 44: added the `## Layout` row for `bin/fusion-session-domain`, the text the issue carried, checked against the helper's header (prints `domain=` and `source=`, exit 3 without a workbench, three `[ -x ]`-guarded call sites, decision `260810-2145_*_should-a-repeated-skill-body-snippet-become-a-bin-helper-now-that-one-fact-lives-in-four-executable-copies.md`). Em-dash count unchanged at 126.
- Closed issue `260824-2040` (`_o_` -> `_c_`) with a `Resolved:` note.
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE`: not touched by me. The row moves paths by +4; the concurrent step-12 coder re-approved the pin to `{ paths: 1341, anchors: 191 }` on the same line and attributed the four `CLAUDE.md` paths there.

## Verification

`cd hooks && npx vitest run lib/__tests__/derivable-enumerations-lint.test.ts lib/__tests__/reference-resolution-lint.test.ts` — exit 0 (57 passed).
