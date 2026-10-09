The migrate skill reads a missing or refusing git as a workbench not under version control
---
`skills/migrate/SKILL.md` Steps 2 and 4 decide the rename mode with `git rev-parse --is-inside-work-tree`. When git is not installed or refuses the repository (dubious ownership), that check fails and the skill tells the user the workbench is not under version control and moves with `mv`, while `bin/fusion-migrate` (since `f8203e70`) reads the `.git` entry from the filesystem and then stops at Step 7 with exit 3 naming git. Step 7 names Node as its only prerequisite and does not mention git.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence.** Named by the documentation pass that corrected `hooks/migrate.ts` and `bin/fusion-migrate` headers for `261009-2028-migrate-says-plugin-and-node-only-but-needs-git-inside-a-repository.md`; the user scoped that pass to the two headers, so the skill was left unedited. The sentences concerned are in `skills/migrate/SKILL.md` `## Step 4` (the `plain` mode description, the "not under version control" report and its NOTE line) and the opening of `## Step 7` ("The rename pass above needed no Node … this step does"). The review `261009-2028-reviewer-repo-top-by-filesystem-f8203e70.md` (G-3) observed the same behaviour: the user is told "not under version control", the renames run with `mv`, and Step 7 stops with git's ENOENT or ownership message. The user is not locked out: once git works, a rerun goes straight to Step 7.

**Acceptance.** The skill decides "is this a repository" by the same rule as `bin/fusion-migrate` (a `.git` entry at or above the workbench), reports a missing or refusing git inside a repository as that, not as "not under version control", and Step 7 names git as a prerequisite inside a repository.
