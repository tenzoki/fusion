M="$(echo '{"op":"inspect"}' | "$FUSION_PLUGIN_ROOT/bin/fusion-record" 2>/dev/null | grep -o -e '"maintenance":{[^}]*}' -e 'maintenance-unreadable')"; case "$M" in *operation_id*) echo "fence=$M"; find ./fusion-workbench/archive -maxdepth 2 -name .inventory.json -exec grep -l "\"fence\": \"$(echo "$M" | cut -d'"' -f6)\"" {} + 2>/dev/null ;; ?*) echo "fence=unreadable" ;; esac
```

**No output: print nothing.** `fence=` is one line: the store is fenced since that time and every write to a record is refused; the path printed under it is the inventory for `bin/fusion-archive resume --inventory <path>`, or `abandon` where it records nothing moved. `fence=unreadable`, or no path: the recovery is that helper's header. Never tell the user to delete the fence file.
