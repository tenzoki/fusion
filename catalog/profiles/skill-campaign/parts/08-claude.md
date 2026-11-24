
## Step 8: `answer`

`answer [<decision>]`, or the user taking up Step 3's offer. It needs the decision's `question=` row with answer `none` from an overview of this use (Step 2), or the watch's `new-question=` row (Step 9); with no decision named, offer the open ones. Read the record at that commit, `git show <head>:<path>` with that page's `head=` and the row's path, and put its question and options to the user in chat, never with `AskUserQuestion`: the question in one line, the options beneath it as a numbered list in the record's words, and that a number, the option's words or anything else they write will do. Then wait. **No answer is filed without the user's choice**, and none is picked for them.

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" answer --question <decision> --option '<the option chosen, one line>' <--note '<what else the user wrote>', when they did>; echo "exit=$?"
```

Exit 0 prints `path=` and `revision=`. The choice confirms it: commit and push the pair (`.record.json` and `.md`) as Step 6 does, and say the peer reads it within about 5 minutes if its session is open. `question-unknown`: no open question of that name at the remote's commit. `question-answered`: an answer stands already; run the overview again. Exits 5 to 7 as in Step 2, the others as in Step 7.
