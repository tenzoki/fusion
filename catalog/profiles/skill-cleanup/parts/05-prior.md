- **Never push.** No `git push`, plain or forced: the push is the host's step, run only when the entry declares a remote.
- **Never `git add` or `git commit`.** Stage nothing, commit nothing, amend nothing: the host's integration takes the workspace as it stands, so a split is a statement in this run's result, not a state of the index.
- **Never discard user work.** No `git reset --hard`, no `git checkout -- <file>`, no deleting untracked files.

If `git status` reports a merge or rebase in progress, or the tree carries conflict markers, stop immediately and report. Do not hand splits over an unresolved state.
