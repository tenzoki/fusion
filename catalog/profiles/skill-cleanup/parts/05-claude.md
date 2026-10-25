- **Never force-push.** Plain `git push`. If it is rejected as non-fast-forward, stop, report the git error verbatim, and leave the commits local for the user to resolve.
- **Never `git add -A` or `git add .`.** Stage explicit paths, one set per split. A blanket stage is what puts an unrelated working-tree change into somebody else's commit.
- **Never discard user work.** No `git reset --hard`, no `git checkout -- <file>`, no deleting untracked files, and never `git commit --amend`.

If `git status` reports a merge or rebase in progress, or the tree carries conflict markers, stop immediately and report. Do not commit over an unresolved state.
