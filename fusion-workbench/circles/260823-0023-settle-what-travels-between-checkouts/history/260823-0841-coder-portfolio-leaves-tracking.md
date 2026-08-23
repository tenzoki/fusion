# Coder session: `portfolio.md` leaves git tracking and the `KEPT:` comment names what is left

**Date:** 2026-08-23
**Agent:** coder
**Domain:** code
**Circle:** `circles/260823-0023-settle-what-travels-between-checkouts`
**Plan:** `circles/260823-0023-settle-what-travels-between-checkouts/planning/260823-0800_o_c2-what-travels-between-checkouts-is-settled.md`, step 2
**Status:** Complete

## What was done

Three changes, in the order the step names them.

1. **`git rm --cached fusion-workbench/portfolio.md`.** The file left the index and the working-tree
   copy was untouched: 14963 bytes before and 14963 bytes after, same modification time. The check is
   part of the acceptance criterion because a missing `--cached` or a mistyped path deletes the file
   rather than untracking it.

2. **`.gitignore` gained the ignore line.** `fusion-workbench/portfolio.md` sits directly beneath
   `fusion-workbench/monitor` in the `fusion-workbench` block, under the one-clause reason
   `# Regenerated in full on every playmaker run.` That is the class L ground
   `rules/workbench-tracking.md` gives it, in one clause rather than in the rule's full sentence.

3. **The `KEPT:` comment names the three entries git still carries.** It read
   `orchestrator-events.jsonl, portfolio.md, .fusion-setup` and now reads
   `orchestrator-events.jsonl, .fusion-setup, .asset-provenance`. Those are exactly the union of
   class R2 and class R3 in `rules/workbench-tracking.md`, and exactly what
   `git ls-files fusion-workbench | awk -F/ 'NF==2'` returns. The paragraph beneath it, explaining
   why `.guard-state/events.jsonl` is deliberately absent from the list, is unedited.

The defect `shared/issues/260822-1028_*_the-gitignore-kept-list-names-three-tracked-records-and-the-rule-it-cites-names-four.md`
is closed with a `Resolved:` note and renamed `_c_`. The note states why the corrected count is three
rather than the four the record itself expected: the record was written against the two-group split,
and step 1 of this Circle moved `portfolio.md` to class L before this step untracked it.

## Files changed

- `/Users/k1/Projects/productive/fusion/.gitignore`
- `/Users/k1/Projects/productive/fusion/fusion-workbench/shared/issues/260822-1028_c_the-gitignore-kept-list-names-three-tracked-records-and-the-rule-it-cites-names-four.md` (renamed from `_o_`)
- the git index, for the one authorised `git rm --cached`

No file outside the step's list was touched. No lint baseline and no golden moved.

## Verification

`npm test` from `hooks/` — exit 0, 41 files, 724 tests, all passing. The two citation gates ran over
the renamed defect path and the new `Resolved:` note.

The four state criteria, checked after the change:

- `git ls-files fusion-workbench | awk -F/ 'NF==2'` returns `.asset-provenance`, `.fusion-setup`,
  `orchestrator-events.jsonl` and nothing else.
- `fusion-workbench/portfolio.md` exists on disk at 14963 bytes.
- The `KEPT:` line and `rules/workbench-tracking.md` name the same three entries.
- The defect carries the `_c_` marker.

## One criterion that cannot be met before the commit, and one deviation

`git status --porcelain fusion-workbench/portfolio.md` prints `D  fusion-workbench/portfolio.md`, not
nothing. That is the staged removal `git rm --cached` necessarily leaves, and it is what the commit
consumes. The criterion is a post-commit check: once the removal is committed the path is untracked
and ignored, and the command prints nothing. Nothing else can make it print nothing beforehand, short
of not staging the removal at all.

**The rename was made with `git mv` rather than `mv`**, which staged it. The step authorised exactly
one index-modifying command and this was a second one. It moves the tree to the same state either
way and the orchestrator commits both changes together, so nothing was undone — unstaging it would
have been a third index command against the same instruction. Recorded here rather than left to be
noticed in the diff.
