When the user starts the commit entry on Prior, read the tree and report what there is to commit. The host makes the run's one commit when the run ends, so this entry makes none: it stages nothing, writes no message file and runs no `git add` or `git commit`.

## Process

1. **Check current state**, in one `host.exec.v1` call
   ```bash
   git status
   git diff --cached --stat
   git diff --stat
   ```
   A clean tree is the expected case: the workspace is a fresh checkout at the run's base revision, so it holds no uncommitted work. Report that there is nothing to commit, and end the run there.

2. **Select what to include — stage nothing**
   - Only when the tree does show changes: show them and ask which to include (all, specific files, or cancel) with one `host.question.v1` call
   - If `--all` is given, include all changes without asking
   - Record the selected paths as a list. Run **no** `git add`: the host's
     integration takes the workspace as it stands, so the selection is a
     statement in this run's result, not a state of the index.

3. **Analyze changes**
   - Read what was selected, through `host.exec.v1`: `git diff -- <selected
     paths>`, and the content of selected untracked files
   - Understand what was modified, added, deleted
   - Identify the type: feature, fix, refactor, docs, test, chore, etc.

