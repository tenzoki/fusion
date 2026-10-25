
```bash
wc -l < "$WORKBENCH/.post-draft-$CHECKOUT"
```

`wc -l` counts newlines, so the file ends in one. Over the ceiling, cut the file and recount. Putting a long draft and trimming it in front of the user is a different procedure and does not satisfy this step.

## Step 3: nothing to say is an answer

**Compose nothing** when the project is not a git repository, or when the run has nothing to report: no commits in the range, and no records filed. **With no range to read, that second condition reads on the records alone** — an unread anchor is not a third condition and never suppresses an entry on its own. Say that in one line, `rm -f "$WORKBENCH/.post-draft-$CHECKOUT"` where Step 2 wrote one, and stop. An empty entry costs the other side a read and tells them nothing.

## Step 4: put the draft to the user

