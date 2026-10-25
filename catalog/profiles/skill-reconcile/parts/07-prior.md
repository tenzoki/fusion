"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root" || { echo "No fusion workbench above $(pwd). Run the setup entry first."; exit 1; }
```

It prints the project root as an absolute host path. **No `cd` persists**: give that root, written relative to the workspace root (`.` when the project is the workspace), as the `directory` of every later `host.exec.v1` call, never the absolute path. Halt on a non-zero exit and tell the user to run the setup entry at the project root. Bootstrap nothing from here.
