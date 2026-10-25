[ -n "$FUSION_PLUGIN_ROOT" ] && [ -f "$FUSION_PLUGIN_ROOT/bin/monitor" ] && { cp "$FUSION_PLUGIN_ROOT/bin/monitor" ./fusion-workbench/monitor.new && chmod +x ./fusion-workbench/monitor.new && mv -f ./fusion-workbench/monitor.new ./fusion-workbench/monitor && P=./fusion-workbench/.asset-provenance && { [ -f "$P" ] || : > "$P"; } && h="$(shasum -a 256 ./fusion-workbench/monitor | cut -c1-64)" && { grep -q "^$h  monitor$" "$P" || { grep -v "  monitor$" "$P" > "$P.t"; printf '%s  monitor\n' "$h" >> "$P.t"; mv -f "$P.t" "$P"; }; }; }
```

The tail of that command **stamps** the copy in `./fusion-workbench/.asset-provenance`, the record the `assets` selector below reads; the setup entry's profile step states its shape and its reason.

If the copy fails, or the mounted tree carries no `bin/monitor`, report it and continue. The host sets `$FUSION_PLUGIN_ROOT` on every call, so an unset one is a broken bundle, reported as such.
