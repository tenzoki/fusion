"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"
echo '{"op":"inspect"}' | "$FUSION_PLUGIN_ROOT/bin/fusion-record" | node -e 'let s="";process.stdin.setEncoding("utf8");process.stdin.on("data",d=>s+=d).on("end",()=>{try{const v=JSON.parse(s).result.state;if(v)console.log("\"state\":"+JSON.stringify(v))}catch{}})'
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" discuss
```

Halt on a non-zero exit from the first: there is no workbench to write into, and this body creates none — tell the user to run the setup entry at the project root.

The second line is the workbench's format. On `"state":"json-control"` go on: the record's state lives in a control file the codec writes. `"state":"legacy"` stops here, before anything is written: tell the user the workbench is legacy (no `workbench.json`: its control data is Markdown), which this version reads only once it has been migrated: start the migrate entry. Any other line, or none, stops it too: quote it.

Hold the resolver's `KEY=value` output for the whole run. `$WORKBENCH` is absolute, `$OUT_DISCUSSION` is relative to it, and that pair is the only spelling of the store in this body; written into a block, each is the value held here. On a non-zero exit read the code before acting — the full table is `rules/fusion-workbench-conventions.md` `## Path Resolution` under Exit codes. Exit 1 is no workbench; exit 3 is scope the resolver could not determine, which the user clears; exit 4 is a fusion bug and their workbench is fine. **Never guess a path and never substitute a default**: an empty `$OUT_DISCUSSION` halts the run naming that key, because an empty expansion writes to the workbench root silently.
