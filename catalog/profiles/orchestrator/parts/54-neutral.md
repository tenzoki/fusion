
## Error Handling

| Failure mode | Response |
|--------------|----------|
| Agent produces no changes | Emit `task_blocked` with the reason, tell the user, move on |
| Agent modifies wrong files (out of scope) | Revert out-of-scope files with `git checkout HEAD -- <file>`, log error, file issue for correct agent |
| Validation fails after agent work (tests fail, consistency check fails) | Re-dispatch the same executor as a defect task (one attempt). On success: commit. On failure: revert all task changes, mark the task errored, tell the user |
| Agent edits outside its declared scope (`code-implementer` edits `.yaml`, `data-implementer` edits `.go`) | Revert out-of-scope files, file issue for correct agent, log the scope violation |
| Cross-domain task discovered at runtime (task needs both code + data changes) | Split into two subtasks with dependency, present to user for confirmation |
| Git conflict during commit | Log the conflict details, skip commit, mark task as errored |

**Revert strategy:** Always use `git checkout HEAD -- <specific-files>`, never `git checkout .` or `git reset --hard`. Revert only the specific files that are problematic.

