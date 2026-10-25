This body opens no file the module ships, so it resolves no source root; every helper is run from `$FUSION_PLUGIN_ROOT`.

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" news
```

If the first exits non-zero, halt with *No fusion workbench found above `$(pwd)`. Run `/fusion:setup` once at the project root first.* Do not create one from here.

Hold the resolver's `KEY=value` output: `$WORKBENCH` is absolute, `$SCAN_FORUM` is relative to it. **`$SCAN_FORUM` is the only correct spelling of the message store in this body**, and it is passed to the helper as the workbench-relative value the resolver printed. On a non-zero exit read the code before acting; the table is in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes.
