
## Error Handling

| Failure mode | Response |
|--------------|----------|
| Agent produces no changes | Emit `task_blocked` with the reason, tell the user, move on |
