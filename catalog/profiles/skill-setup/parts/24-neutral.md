  echo "${rel#stilwerk/} copied"
  h="$(shasum -a 256 "./fusion-workbench/$rel" | cut -c1-64)"
  grep -v "  $rel$" "$PROV" > "$PROV.t"; printf '%s  %s\n' "$h" "$rel" >> "$PROV.t"; mv -f "$PROV.t" "$PROV"
done
```

The copy is idempotent — an existing file is left untouched, so any project-local edits to the profiles survive subsequent setups.

