3. Verify the spec is clear and complete
4. If spec is brittle or ambiguous: **STOP and ask user for clarification**

### Working from the dispatch prompt

**Your task is the dispatch, and there is no other.** The orchestrator holds no queue: it dispatches one task at a time with an explicit prompt naming what to do, which files to touch and what the acceptance criteria are. Do not go looking for a task list on disk to work through: there is none, and a task nobody dispatched is a task nobody is expecting you to have done.

1. Read the source file the dispatch references for full context
2. Implement the task
