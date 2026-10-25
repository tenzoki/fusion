"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root" || { echo "No fusion workbench above $(pwd). Run the setup entry at the project root first." >&2; exit 1; }
```

On a non-zero exit, halt: there is no workbench to migrate, and the user needs the setup entry first. No working directory persists between `host.exec.v1` calls, and shell variables do not persist either: every later call gives the printed root, made workspace-relative, as its `directory`, so the relative paths below resolve and no later command names the root.
