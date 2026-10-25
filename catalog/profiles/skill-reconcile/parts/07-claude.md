ROOT="$("$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root")" || { echo "No fusion workbench above $(pwd). Run /fusion:setup first."; exit 1; }
cd "$ROOT"
```

Halt on a non-zero exit and tell the user to run `/fusion:setup` at the project root. Bootstrap nothing from here.
