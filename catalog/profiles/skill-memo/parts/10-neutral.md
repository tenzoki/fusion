
**Adoption, before the first write of a run.** `memos-$CO.md` and `memos-$USER.md` go into the notes file, `tasks-$CO.md` and `tasks-$USER.md` into the tasks file: for each that exists, append its lines below its `# ` header to the end of the target, remove it, and report both paths. Those are this checkout's own files, `$CO` by its identifier and `-$USER` by the older login key (`rules/fusion-workbench-conventions.md` `## Filename Patterns`), which is folded in here rather than renamed first. Another checkout's file stays where it is; nothing else is merged or deleted.

## Note or task — which target

**Route to the task file when:**
- The argument starts with an explicit keyword: `task:`, `todo:`, or `aufgabe:` (case-insensitive). Strip the keyword from the captured text.
