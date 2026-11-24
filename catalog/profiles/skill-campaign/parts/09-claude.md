
## Step 9: the watch

**Every use of this command while a campaign is running turns the watch on**, after whatever else it did: start `"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" watch --report steering --since <last head= read>` as the Bash `run_in_background` command itself, so `TaskStop` ends it. It exits only with a row to act on (the helper's header, `## probe and watch`); its notice shows no output, so read the task's output file for the row. `state=already-watching`: one runs; say nothing. `new-question=`: offer to answer it (Step 8); `new-ready=`: Step 3's words; nothing else. `failed=`: one sentence. `campaign=`: say nothing more; stop watching. Else restart it `--since` the printed `head=`. Any other wake: no text.

Stop it (`TaskStop`) after a `pause` or `end` in this session, and when the user says to stop watching. The next use of this command while it runs turns it on again.
