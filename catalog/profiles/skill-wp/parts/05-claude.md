echo '{"op":"inspect"}' | "$FUSION_PLUGIN_ROOT/bin/fusion-record" | grep -o '"state":"[a-z-]*"' | head -n 1
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" wp
```

The first line is the workbench's format. `"state":"json-control"` goes on. `"state":"legacy"` stops here, before anything is written: tell the user the workbench is legacy (no `workbench.json`: its control data is Markdown), which this version reads only once it has been migrated: run `/fusion:migrate`. Any other line, or none, stops it too: quote it. Read `WORKBENCH` and `OUT_PACKAGES`. Exit 1 means no workbench above `pwd`: tell the user to run `/fusion:setup` at the project root first. The other codes are `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes.
