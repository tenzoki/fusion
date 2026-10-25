SWEEP="$FUSION_PLUGIN_ROOT/bin/fusion-citation-sweep"; K=record,package-record,package-dir; if [ -x "$SWEEP" ]; then "$SWEEP" --write --kinds "$K"; echo "EXIT=$?"; else echo "SWEEP=absent"; fi
```

- **`SWEEP=absent`**: say the installed bundle carries no citation sweep, which is a defect of the bundle to report, with no `fusion --update` and no restart on this host; go to Step 7.
