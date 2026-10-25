git rev-parse --abbrev-ref HEAD; git log --oneline -1; git status --short
```

Hold the branch, the starting HEAD and the working-tree listing for the report.

If the directory is not a git repository at all, say so in one line and stop: there is nothing here for this command to do.

**No path resolution runs here.** This body writes no workbench record, so it names no store and calls no resolver.

## Step 1 — Read what is uncommitted

`git status --short` and `git diff --stat`, plus the untracked entries. Read enough of the diff to write an honest sentence about each group — a commit message derived from filenames alone is the message this step exists to avoid.

## Step 2 — Commit in meaningful splits

**Split by concern, not by file count.** Separate application code from structured data, both from documentation, and all three from workbench records, this checkout's registry entry among them. Separate unrelated fixes. The test of a good split is that its message is one honest sentence with no "and also" in it. A narrative and its control file are staged in the same split, never in two (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`).

For each split, in order:

