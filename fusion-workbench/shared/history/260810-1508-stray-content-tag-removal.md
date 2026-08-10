# Removing the stray `</content>` tag from the two documents that shipped it

**Status:** Complete
**Agent:** coder
**Session:** `260810-1402`, Turn 1
**Task:** `I:260809-2243-stray-tag` — task 1 in `fusion-workbench/tasklist.md`
**Source record:** `fusion-workbench/shared/issues/260809-2243_o_docs-philosophy-md-ends-with-a-stray-content-tag-that-ships-to-every-consumer.md`
**Circle:** none — unaffiliated backlog, so everything here lands in `shared/`
**Git HEAD at start:** `430d73a`

---

## What the task was

`docs/philosophy.md` and `README.md` each ended with a bare `</content>` line, the closing half of a
wrapper that was never meant to reach disk. Neither file has an opening tag anywhere. `git log -S`
puts both in `43ee3b5`, the commit that rewrote the two documents, so the line has shipped in every
release since. The task was to delete both lines and nothing else.

The record's own body names only `docs/philosophy.md`. `README.md` came into scope through the
record's second acceptance criterion, which greps the whole shipped surface, and through the
reconciliation note of 260809-2252 that had already measured the second site.

## What I changed

| File | Change |
|---|---|
| `docs/philosophy.md` | Deleted line 52, the bare `</content>`. The file now ends at the `/fusion:help` bullet. |
| `README.md` | Deleted line 150, the identical line. The file now ends at the `/fusion:cadence` paragraph. |

`git diff --stat` reports `2 files changed, 2 deletions(-)` — one deleted line per file, no
insertions, so no reformatting or reflow rode along. Both files still end with a trailing newline
after their own final content line, checked with `tail -c 1 | od -c`.

Workbench bookkeeping, outside the shipped tree: the acceptance checkboxes on the defect record are
ticked and a `Resolved:` note is appended to its body; the filename marker is left at `_o_` for the
orchestrator to rename after the commit lands. Task 1's status line in `fusion-workbench/tasklist.md`
moved from `[ ] open` to `[x] done`.

## Verification

Three acceptance criteria, each re-checked after the edit rather than reasoned about:

1. `docs/philosophy.md` ends with the `/fusion:help` bullet, no markup token after it.
2. `README.md` ends with its own final content line.
3. `grep -rn "</content>" docs/ skills/ agents/ rules/ README*.md` returns nothing, exit 1.

Suite: `cd hooks && npm test` — **exit 0**, 39 test files, 1040 tests, about 200 s. That matches the
`430d73a` baseline the dispatch named, which is the expected result for a change that touches no
code; running it confirms the working tree is green for the commit rather than telling us anything
about the two deleted lines.

The first run of the suite was also green but its exit code was lost: I piped `npm test` into `tail`
and read `${PIPESTATUS[0]}`, which is a bash construct and expands to nothing under this project's
zsh. The rerun redirected to a file and read `$?` directly. Worth remembering for any later
verification line in this repository — a pipeline's exit code needs `$pipestatus` here, and an empty
`EXIT:` is not evidence of anything.

## Notes

Nothing was found that warranted a new defect or decision record. The reconciliation note's
whole-tree claim held: after the two deletions the token appears nowhere in the repository outside
`fusion-workbench/`, where it survives only inside the record and queue text that quote it.

Not committed. The orchestrator stages and commits, and holds the commit lock.
