O="$(dirname "$OUT_DISCUSSION")/package.json"; [ -f "$WORKBENCH/$O" ] || O=user-request
"$FUSION_PLUGIN_ROOT/bin/fusion-write" create --kind discussion --narrative-file "$N" --origin "$O" --actor <the actor of this run's role, never claude>; echo "exit=$?"
```

On `exit=0` hold its `path=` line beside the record's path: `--close` names it. Any other exit begins nothing: name the record left behind and the `fusion-write:` line to the user, and delete nothing. Rounds then edit the Markdown alone, never the control file. Which token Prior expects after `--actor` is Prior's to name (request 76, question 9).
