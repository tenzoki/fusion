# Coder: re-approve the reference-resolution BASELINE after the curator apply pass

**Date:** 2026-08-28
**Agent:** coder
**Status:** Complete

## Task

The curator's apply pass (`shared/history/260828-0049-curator-run.md`, L01-L04) edited four sentences in `CLAUDE.md`. Re-approve `BASELINE` in `hooks/lib/__tests__/reference-resolution-lint.test.ts` from 1511/212 to what the gate reads now. Scope: that one line. No commit.

## Measurement

- Dirty tree: gate reports 1514/213.
- `CLAUDE.md` alone reverted to HEAD (`git show HEAD:CLAUDE.md`), rest of the tree untouched: gate reports 1511/212 exactly, 37/37 pass. The whole +3/+1 is `CLAUDE.md`'s.
- Token attribution from the diff: L01 `hooks/hooks.json` (+1 path), L03 `bin/fusion-rules` (+1 path), L04 `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` rooted (+1 path, +1 anchor), L02 0/0.

## Change

One line: `BASELINE = { paths: 1514, anchors: 213 }`, note prepended in the established form citing the curator run, previous notes kept behind `Earlier:`.

## Verification

`cd hooks && npx vitest run lib/__tests__/reference-resolution-lint.test.ts lib/__tests__/derivable-enumerations-lint.test.ts lib/__tests__/workbench-citation-lint.test.ts` — exit 0, 67 passed.
