When the user invokes `/fusion:commit`, help them commit their changes with a well-crafted commit message.

## Process

1. **Check current state**
   ```bash
   git status
   git diff --cached --stat
   git diff --stat
   ```

2. **Select what to commit — do NOT stage yet**
   - Anything already staged when the workflow starts is part of the commit; note it.
   - Show the unstaged changes and ask which to include: all, specific files, or cancel
   - If `--all` flag provided, include all changes automatically
   - Record the selected paths as a list. Run **no** `git add` here — staging
     happens inside the locked step 6. Parallel sessions share one `.git/index`,
     and `git commit` commits the whole index: files staged now would sit
     unprotected across the confirmation window below, where any parallel
     committer holding the lock would absorb them into its own commit.

3. **Analyze changes**
   - Read what will be committed: `git diff --cached` for anything already
     staged, plus `git diff -- <selected paths>` (and the content of selected
     untracked files) for the rest
   - Understand what was modified, added, deleted
   - Identify the type: feature, fix, refactor, docs, test, chore, etc.

