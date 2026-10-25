## Step 6: offer the pull, once

Fetching changed no file. Pulling does, and it is the user's decision.

```bash
GD="$(git rev-parse --git-dir 2>/dev/null)"
DIRTY="$(git status --porcelain 2>/dev/null | head -n 1)"
INPROG=no
[ -n "$GD" ] && { [ -e "$GD/MERGE_HEAD" ] || [ -d "$GD/rebase-merge" ] || [ -d "$GD/rebase-apply" ]; } && INPROG=yes
echo "dirty=${DIRTY:+yes} inprogress=$INPROG"
```

If `dirty=yes` or `inprogress=yes`, **do not ask**. Say what stands in the way (uncommitted changes, or a merge or rebase already running) and leave the pull to the user.

Otherwise ask once with `AskUserQuestion`: pull now, or leave it. On yes:

```bash
git pull --ff-only
```

A non-fast-forward is reported to the user as something for them to resolve, with git's message. Do not merge, rebase or force anything on their behalf.
