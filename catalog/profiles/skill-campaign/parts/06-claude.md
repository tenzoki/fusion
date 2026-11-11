
## Step 5: `lanes`

The user names the proposal to take, the `proposal=` path of a cut they confirmed, and which checkout works which lane, each by its eight hex characters (`"$FUSION_PLUGIN_ROOT/bin/fusion-identity"` prints a checkout's own as `CHECKOUT=`; the overview's `held=` lines name the others). A lane the user assigns nobody keeps no checkout. Say in a sentence which lanes, packages and checkouts will be written and ask once before running:

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" lanes --from <proposal file> <--assign lane-<n>=<hex>, one per assigned lane> <--campaign <id>, when more than one campaign is running or paused>; echo "exit=$?"
```

Exit 0 prints `path=` and `revision=`: report that the lanes are written. **Then one question, with these three options and no fourth**: put it as a dialog with `AskUserQuestion` where the host renders one, else as a numbered list in the chat, in these words:

> The lanes are written. Shall every package in a lane run autonomously, with the campaign as the recorded source of that word?
> 1. Yes: set `mode` `autonomous` on every lane member now, in one act.
> 2. No: leave every package's mode as it is.
> 3. Stop here.

On 1, per lane member, `<control path>` its package's control path (the `path` of the overview's package rows, or of the codec's `list`), `<path>` the `path=` the write printed and `<revision>` its `revision=` value:

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-write" set-mode --record <control path> --value autonomous --source '{"kind":"user-word","ref":{"kind":"other","path":"<path>","sha256":"<revision>"}}' --actor user; echo "exit=$?"
```

Report the members set, and any the codec refused by name with the `fusion-write:` line. On 2 and 3 nothing more is written. A write that printed `state=` instead of `path=`: Step 7.

End with the two sentences Step 6 ends every steering report with.
