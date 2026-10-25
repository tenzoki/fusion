"$FUSION_PLUGIN_ROOT/bin/fusion-write" transition --record "<its path= line>" --to closed --reason "<the outcome>" --actor <as at Step 4>; echo "exit=$?"
```

Any other exit than 0 leaves the discussion open in its control file: say so, with the `fusion-write:` line.
