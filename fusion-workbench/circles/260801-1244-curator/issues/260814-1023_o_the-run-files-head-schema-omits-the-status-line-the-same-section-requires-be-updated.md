The run file's head schema omits the status line the same section requires be updated

---
`agents/curator.md` `## The run file` says "Update the file's status line to `Complete` as the final
step of the run", then enumerates what the file holds. Item 1, the head, is "date, the git HEAD the
run read, the mode, and the date and HEAD of the previous curator run if one is findable". No status
field appears in the schema, so the line the agent is told to update is one the schema never told it
to write.

---
**Context.** `rules/fusion-workbench-conventions.md` `## History Logging` is where the obligation
comes from: "Update the entry's status line to `Complete` as the final step of the session — if
interrupted before this, completion state is lost." The run file is this agent's history entry, so
the obligation is right; only the schema is short. Every other agent that writes a history file
carries the status field in its own output template, and the coder histories in this Circle show the
shape in use (`**Status:** Complete` under the date).

**Fix direction.** Add the status field to item 1 of the head, so the schema and the instruction name
the same line.

**Filed by:** coderev, reviewing `d7786eb..5b81f5a`. Circle store per the Origin Rule.
