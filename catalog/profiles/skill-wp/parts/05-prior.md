echo '{"op":"inspect"}' | "$FUSION_PLUGIN_ROOT/bin/fusion-record" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const v=JSON.parse(s).result.state;if(v)console.log("\"state\":"+JSON.stringify(v))}catch{}})'
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" wp
```

The first line is the workbench's format. `"state":"json-control"` goes on. `"state":"legacy"` stops here, before anything is written: tell the user the workbench is legacy (no `workbench.json`: its control data is Markdown), which this version reads only once it has been migrated: start the migrate entry. Any other line, or none, stops it too: quote it. Read `WORKBENCH` and `OUT_PACKAGES`, and hold them for the run. Exit 1 means no workbench above the project root: tell the user to run the setup entry at the project root first. The other codes are `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes.
