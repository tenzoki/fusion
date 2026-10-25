D="$OUT_PACKAGES/<YYMMDD-HHMM>-<topic>"; N="$D/<YYMMDD-HHMM>-<topic>.md"
"$FUSION_PLUGIN_ROOT/bin/fusion-write" create --kind package --narrative-file "$N" --origin user-request --domain <code|data> --actor user; echo "exit=$?"
```

The domain is the user's where their content names one, else `domain=` of `"$FUSION_PLUGIN_ROOT/bin/fusion-session-domain"`. **`exit=0`**: filed at `open`; report the record's path. **Any other exit: the record you wrote stays, and no package was filed.** Name its path and the `fusion-write:` line to the user and delete nothing. `exit=7` alone may have filed it, outcome unknown: give the `operation_id=` and `id=` lines and resend nothing yourself.
