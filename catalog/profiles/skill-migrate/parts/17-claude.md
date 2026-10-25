SWEEP="$FUSION_PLUGIN_ROOT/bin/fusion-citation-sweep"; K=record,package-record,package-dir; if [ -x "$SWEEP" ]; then "$SWEEP" --write --kinds "$K"; echo "EXIT=$?"; else echo "SWEEP=absent"; fi
```

- **`SWEEP=absent`**: say the installed copy carries no citation sweep yet and `fusion --update` then a restart will get it; go to Step 7.
