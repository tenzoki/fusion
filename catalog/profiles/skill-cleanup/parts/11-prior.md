2. **Hand the split over, and stage and commit nothing.** Take no commit lock, and run no `git add` and no `git commit`: the host captures the workspace when the run ends and integrates it as the run's one commit. Whether it keeps the splits as commits of their own or flattens them into that one is Prior's to say (request 76, question 1); until it does, report each split as the one this entry proposes, its paths and its message.

**No event-log commit follows.** This run makes no commit, so it appends no `commit` row to `fusion-workbench/orchestrator-events.jsonl` and leaves no log to settle.
