ROOT="$("$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root")" || { echo "No fusion workbench above $(pwd). Run /fusion:setup at the project root first." >&2; exit 1; }; cd "$ROOT"
```

On a non-zero exit, halt: there is no workbench to migrate, and the user needs `/fusion:setup` first. The working directory persists between calls and shell variables do not, so the relative paths below resolve and no later command names the root.
