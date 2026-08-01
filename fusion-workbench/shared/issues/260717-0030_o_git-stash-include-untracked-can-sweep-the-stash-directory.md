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
Found by `coder` during task P-4 (structure-skill conversion), reported to the orchestrator as out-of-scope.
Source: fusion-workbench/planning/260716-1910[p]-plan-workbench-umbau-circle-container.md
Related: `skills/circle-stash/SKILL.md` (steps 7.5, 7.11), `rules/fusion-workbench-conventions.md` `## Stashes`
