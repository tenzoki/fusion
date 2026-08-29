# The stash push's exit code is read, and a failed freeze stops before the manifest

**Agent:** coder
**Date:** 2026-08-10 09:41
**Status:** Complete
**Task:** fix `260810-0505_*_circle-stash-step-7-6-still-swallows-the-push-exit-code-the-branch-exists-to-avoid.md` — Step 7.6 swallowed the push exit code the branch exists to avoid
**Source record:**
- `260810-0505_*_circle-stash-step-7-6-still-swallows-the-push-exit-code-the-branch-exists-to-avoid.md`

**Origin:** Not Circle work; no Circle active. Review finding (coderev, session
`260810-0241-orchestrator-session.md`, Turn 1) against `8960e1a..HEAD`, on the fix committed in `b6bbae7`.

## What was wrong

The branch itself is right and was left alone — the record verified it against four
scratch repositories. What was wrong is that both of its arms ended in `|| true`, so the
whole defence against "a freeze that did not happen" rested on the probe being right, and
the `STASH_COUNT_BEFORE`/`AFTER` check could not stand in for it: in the measured failure
mode git **creates the entry** and leaves the working tree untouched, so the count reads
exactly like a success.

## What changed — `skills/circle-stash/SKILL.md` (only file touched)

Step 7.6, one bash block still (the block is extracted and executed by
`hooks/lib/__tests__/circle-stash-git-exclusion.test.ts`, which takes the *first* block
after the heading — splitting it in two broke four of that test's cases, and the fix
belonged in the skill, not the test):

- both push arms capture `PUSH_OUT` / `PUSH_RC` instead of `|| true`, with `PUSH_RC=$?`
  on the same line as the assignment, since any command in between overwrites `$?`;
- `PUSH_RC != 0` sets `PUSH_FAILED=true` and **nothing is written into `$STASH_DIR`** —
  no `git/head`, no `git/stash-ref`, and by the prose that follows, no manifest (7.11), no
  deletion of the originals (7.7), no dashboard notice (7.8). `STASH_IN_PROGRESS` stays,
  which is what makes `/fusion:circle-pop` refuse the directory;
- a German failure report: do not switch branches, what state the workspace is in, git's
  own message, a by-hand path back, plus one extra line when the count grew anyway;
- a **What each check catches** pair, so the count is no longer read as the only check;
- the `--all` wording corrected, plus a new paragraph on why the probe's `--all` spelling
  and git's internal spelling agree only while `--include-untracked` is passed.

## Measured, not read (git 2.49.0)

`git add -n --all` → 1, bare `git add -n` → 1, `git add -n -u` → **0**, all against
`':/' ':(exclude)fusion-workbench'` with the workbench ignored. Push behaviour, driving
the block as extracted from the file:

| Configuration | `PUSH_RC` | count | tree | outcome |
|---|---|---|---|---|
| wb not ignored, dirty | 0 | 0→1 | freed | proceeds, `stash@{0}` |
| wb ignored, dirty (fallback) | 0 | 0→1 | freed | proceeds, `stash@{0}` |
| clean tree | 0 | 0→0 | — | proceeds, `(no changes)` |
| probe mispredicts, wb ignored | **1** | **0→1** | **still dirty** | halts, nothing written |
| unmerged index | **1** | 0→0 | still dirty | halts, nothing written |

Row 4 is the record's failure mode: the count alone calls it a success. Row 5 is the one
where the count alone would have written `(no changes)` and told the user the tree was
clean.

## Verification

`cd hooks && npm test` — exit 0, 38 files, 1007 tests. The two concurrently-modified files
(`agents/orchestrator.md`, `skills/next/SKILL.md`) belong to another task; nothing failed
naming them.

## Left for the user

- `hooks/lib/__tests__/circle-stash-git-exclusion.test.ts` still states the old mechanism
  in two comments (`git add --all` at `:176-177`, `|| true` at `:188`) — outside the one
  file this task was scoped to.
- Not committed, and the issue marker not renamed: the user does both after validating.
