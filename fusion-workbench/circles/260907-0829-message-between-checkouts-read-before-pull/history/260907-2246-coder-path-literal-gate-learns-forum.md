# Coder — the path-literal gate learns the `forum` store

**Date:** 2026-09-07
**Agent:** coder
**Task:** S3 of `260907-1942_*_message-between-checkouts-read-before-pull.md`, step 3
**Status:** Complete

## What was implemented

One entry, `"forum"`, added to `TYPE_FOLDERS` in
`hooks/lib/__tests__/path-literal-lint.test.ts`, placed after `backlog` — the last of the
live stores — and ahead of the three retired review folders, so the list keeps its
live-then-retired shape. From this commit on, no agent prompt and no skill body may write
the store name as a path literal: every such site resolves it through `$OUT_FORUM` or
`$SCAN_FORUM`.

`DEFINITION_SITES` was deliberately left alone. `bin/fusion-forum` takes the store path as
an argument and defines nothing, so no fourth definition site comes into existence, and the
plan's step 3 forbids adding one.

## Files changed

- `/Users/k1/Projects/productive/fusion-news/hooks/lib/__tests__/path-literal-lint.test.ts`
  (+1 line; the whole diff is the one entry)

## Verification

`cd hooks && npx vitest run lib/__tests__/path-literal-lint.test.ts` — exit 0, 22 passed.

`hooks/node_modules` was absent, so `npm install` ran first. It is gitignored and produced
no tracked file; `git status --porcelain hooks/` afterwards named only the edited test.

**Both halves of the acceptance were run, not asserted.** The gate passes at HEAD as it
stands, so no shipped body writes the store as a literal today. To prove it would fail on
one, a throwaway probe was spliced into the whole-tree assertion — the line
`Write the message to shared/forum/<stamp>-<checkout>-<slug>.md` appended to the text of
`skills/cleanup/SKILL.md` as that test reads it, an in-memory splice that never touched the
shipped body. With the probe present the run exited **1** and reported

```
skills/cleanup/SKILL.md:251  type-folder path literal 'forum/260907-1942-a1b2c3d4-slug.md'
    -> resolve it through bin/fusion-paths (a $OUT_* / $SCAN_* value) instead of naming the directory;
```

A control run then removed `"forum"` from `TYPE_FOLDERS` with the same probe still in
place: exit **0**, 22 passed. That is what makes the added entry, rather than some other
alternative in the regex, the thing that catches the literal. Both the probe and the control
were reverted; the committed diff is the single line, confirmed with `git diff`.

## Notes

The full suite was not run: three sibling agents are mid-edit on `bin/fusion-paths`, two
rule files and `bin/fusion-forum` in this same tree, so a full-suite result would not have
been about this change. The dispatch directed the targeted run for that reason.
