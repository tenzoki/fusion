
## Step 8: `answer`

`answer [<decision>]`, or the user taking up Step 3's offer. It needs the decision's `question=` row with answer `none` from an overview of this use (Step 2); with no decision named, offer the open ones. Read the record at that commit, `git show <head>:<path>` with the overview's `head=` and the row's path, and put its question and options to the user in chat, never with `AskUserQuestion`: the question in one line, the options beneath it as a numbered list in the record's words, and that a number, the option's words or anything else they write will do. Then wait. **No answer is filed without the user's choice**, and none is picked for them.

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" answer --question <decision> --option '<the option chosen, one line>' <--note '<what else the user wrote>', when they did>; echo "exit=$?"
```

Exit 0 prints `path=` and `revision=`: say the answer is filed and reaches the peer with this session's next commit and push, not before. `state=holds-package` is Step 7's. `question-unknown`: no open question of that name at the remote's commit. `question-answered`: an answer stands already; run the overview again. Exits 5 to 7 as in Step 2, the others as in Step 7.
