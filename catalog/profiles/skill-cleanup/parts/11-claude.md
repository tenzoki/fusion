2. **Stage and commit as one pair, under the project's commit lock.** The lock serialises access to the shared git index against any parallel session's agents; the `with` form acquires it, runs the command, and releases on any exit. The protocol, the two stale-lock paths and the failure modes are `rules/commit-lock.md` `## Commit lock`'s, and this body does not restate them.

   ```bash
   "$FUSION_PLUGIN_ROOT/bin/fusion-commit-lock" with cleanup -- bash -c 'git add <path> <path> && git commit -F <msg-file>'
   ```

   The message reaches `git` as `-F <msg-file>` and never as a command-line argument, so an apostrophe in it cannot end a quoted string.

**Then commit the event log alone.** Each split appended a `commit` row to `fusion-workbench/orchestrator-events.jsonl`, so the log is dirty again. Stage that one absolute path, message file as above, and commit it in its own `with cleanup --` acquisition: a held region whose only path is the log emits no row (`rules/commit-lock.md` `### The lock writes the commit event`), so this commit settles the log rather than regenerating it. Skip it when no split committed.
