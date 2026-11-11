
## Step 6: `open`, `pause`, `resume`, `move`, `reassign`, `end`

Each is one act on the campaign record in this checkout's working tree, confirmed once before it runs: say in a sentence what will be written, ask, then run. The flags are the helper's (`bin/fusion-campaign`, `## The steering writes`); `--campaign <id>` is needed only where more than one campaign is running or paused, and to name one that is neither. Each line is followed by `; echo "exit=$?"`.

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" open --id "$(date +%y%m%d-%H%M)-<slug>" --objective <text> --authorisation <citation> <--stop <text>, one per stop condition>
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" pause --reason <text>
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" resume
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" move <package> --to <lane>
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" reassign <lane> --checkout <hex>
"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" end --outcome <completed|bounded|failed|cancelled> <--reason <text>, when the user gave one> <on completed: the evidence flags below>
```

`open` takes the objective, the citation of what authorises the campaign and each stop condition from the user's words; a stop condition the user did not state is not invented. `end` on `completed` asks the user which of the four hold, the objective met, the intake closed, every attempt terminal, the final audit passed, and passes `--objective-met`, `--intake-closed`, `--all-attempts-terminal` and `--final-audit-passed` for each yes, `--watermark` and `--audit-ref` where the user names them.

Exit 0 prints `path=` and `revision=`. Report the act in a sentence (the campaign is open; paused, with the reason; running again; the package stands in that lane; the lane is that checkout's; the campaign has ended with that outcome), then end every such report with two sentences: **the act reaches a working session at the holding session's next commit**, and no time is given for that; and the record travels with your next commit and push, so until then no other checkout sees it.

## Step 7: the two refusals of a write

Read `state=`, not the exit code, and define none. Both mean that nothing was written.

- `state=holds-package`, with `held=`: this checkout is working on a package itself, so it cannot steer. Say which package, and that a steering act runs from a checkout holding none, or after the package is released.
- `state=refused`, with `refused=<class>/<reason>`: say what the reason means in the user's project. `campaign-exists`: a campaign of that name is already there. `campaign-not-running`, `campaign-not-paused`, `campaign-not-live`: the act does not fit the campaign's state; name the state. `campaign-terminal`: that campaign has ended. `package-unknown`, `lane-unknown`: no such package or lane; name what was given. `no-lanes`: the lanes are not cut yet (Steps 4 and 5). `package-already-in-lane`: it stands there already. `duplicate-lane-checkout`: that checkout already works another lane. `revision-moved`: the record changed since it was read; run the overview and try again. `proposal-unreadable`: the file is no proposal. Any other: quote the line and the stderr.

Exits 1, 3 and 4 as in Step 4. **exit 2** is a value outside the helper's grammar, an id that is not `YYMMDD-HHMM-<slug>`, a checkout that is not eight lowercase hex characters, an outcome outside the four, an evidence flag on another outcome, or a usage fault of this body: say which.
