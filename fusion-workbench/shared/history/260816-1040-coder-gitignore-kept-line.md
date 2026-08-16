# Coder — .gitignore KEPT line, contradiction removed

**Status:** Complete
**Date:** 2026-08-16 10:40
**Record:** 260816-0136 part 2 (edit 1, second pass)

## What was wrong

Edit 1's first pass put `.guard-state/events.jsonl` on the KEPT line while the sentence
directly under it said that same file is "deliberately NOT excepted here". Two
statements about one file, in one comment block, contradicting each other.

"KEPT" in that comment means *tracked by this file's rules*. Measured: the guard log is
ignored by `.gitignore` itself (`fusion-workbench/.guard-state/*`) and appears in no
`git ls-files` output, so it never belonged on the line.

The slip came from reading `rules/fusion-workbench-conventions.md:76`, whose **records**
bullet lists four items including the guard log. That bullet classifies *what kind of
thing an entry is*; the `.gitignore` comment states *what this file tracks*. The rule
keeps the two apart at `:81` — "the one entry above where 'track them' reads as 'keep
what the roll produces'". The first pass collapsed that distinction.

## Change

`.gitignore` only, comment text only, no rule byte touched:

- KEPT line names the three entries this file actually tracks —
  `orchestrator-events.jsonl`, `portfolio.md`, `.fusion-setup`.
- The guard log is named once, parenthetically, in the sentence under it, which states
  its status without contradiction: a record, not excepted here, preserved by the
  archive roll.
- Edit 2's wording (`the archive step of /fusion:cleanup`) and the block's wrap width
  are unchanged.

Net diff against HEAD for edit 1 is now the two changes the source record asked for:
`tasklist.md` dropped, `.fusion-setup` added.

## Verification

`git check-ignore -v` on each KEPT entry — all three exit 1 (not ignored), and all three
are tracked per `git ls-files --error-unmatch`:

    fusion-workbench/orchestrator-events.jsonl   not ignored (exit 1)
    fusion-workbench/portfolio.md                not ignored (exit 1)
    fusion-workbench/.fusion-setup               not ignored (exit 1)
    fusion-workbench/.guard-state/events.jsonl   IGNORED <- .gitignore:78

`git ls-files fusion-workbench/.guard-state/` is empty, confirming the guard log's line
in the comment.

`cd hooks && npm test` — exit 0, 40 files / 764 tests passed. No golden regeneration
needed: the edit changes no rule file.
