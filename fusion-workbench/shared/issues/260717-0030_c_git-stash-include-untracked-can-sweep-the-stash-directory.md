`/fusion:circle-stash` can sweep away the stash directory it just wrote

---
`git stash push --include-untracked` in `skills/circle-stash/SKILL.md` step 7.11 can capture the stash directory that step 7.5 just created, destroying the very artifact the skill exists to produce. The user loses the in-flight Circle they were trying to protect.

Verified by `coder` during task P-4 in three configurations:

| Workbench is… | Result |
|---|---|
| gitignored (fusion's own setup) | safe — ignored files are not swept |
| untracked, not ignored | **entire workbench swept into the git stash** |
| tracked/committed | **the new `stashes/<id>/` is untracked → swept** |

The coder hit it on the first sandbox run and lost the test workbench, which is how it surfaced.

**Pre-existing, not introduced by the restructure.** The original skill had the identical step order (7.5 writes the stash, 7.11 runs `git stash push --include-untracked`). Fusion's own workbench is gitignored, which is the one safe configuration — that is why this has never bitten in practice, and why no test caught it.

**Severity is high where it fires.** Circle-stash is the rescue tool: it runs when a user has in-flight work they cannot afford to lose. Two of the three configurations lose exactly that.

**Not fixed in P-4, deliberately.** The likely fix is a pathspec exclusion (`git stash push --include-untracked -- ':(exclude)fusion-workbench'`), but that is a design call about what the git stash is *for* in this skill — whether the workbench should ever travel in the git stash at all, given that `circle-stash` already captures the parts it needs by copy. That deserves its own decision rather than a silent widening of a conversion task.

---
Resolved: the workbench is excluded from the git stash entirely, which is the user's answer to the prior question the record raised rather than the pathspec it guessed at. `skills/circle-stash/SKILL.md` Step 7.6 pushes with `-- ':/' ":(exclude)$WB_NAME"`, and `WB_NAME` is derived in Step 1 so the workbench is named once. It needs a branch, measured rather than assumed: `git stash push <pathspec> --include-untracked` runs `git add --all` internally, and `git add --all` refuses a pathspec naming an ignored path — so the pathspec form breaks the one configuration that never had the defect, creating the entry, leaving the tree dirty, exiting 1, and being swallowed by the existing `|| true`. The branch condition is that same `git add --all` under `--dry-run`; `git check-ignore` was tried and is wrong (it answers "not ignored" for an ignored directory holding a tracked file). Fallback is safe because it is only taken where git already skips the workbench's untracked content. One residual is named in the skill: an ignored workbench with force-added tracked files still carries those files' modifications in the git stash. All three configurations this record measured, plus the mixed one this repository has had since `65f7c3b`, plus a project root below the git toplevel, were driven in throwaway repositories. Pinned by `hooks/lib/__tests__/circle-stash-git-exclusion.test.ts`, which extracts the Step 7.6 block from the skill body and runs it, and which also drives the old command sweeping the directory. Protocol statement updated in `rules/workbench-stash-and-lock.md` `## Stashes` → Two captures, two jobs.

---
Found by `coder` during task P-4 (structure-skill conversion), reported to the orchestrator as out-of-scope.
Source: 260716-1910[p]-plan-workbench-umbau-circle-container.md
Related: `skills/circle-stash/SKILL.md` (steps 7.5, 7.11), `rules/fusion-workbench-conventions.md` `## Stashes`
