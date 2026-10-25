hc() { find "$@" \( -name package.json -o -name '*.record.json' -o -name '*.evidence.json' \) -print 2>/dev/null | head -n 1; }
K=""; while IFS= read -r f; do [ -n "$f" ] || continue; r="${f#"$WORKBENCH"/}"; case "$r" in workbench.json|.json-state|.json-state/*) echo "  refused (safety filter 1): $r"; continue ;; esac; if [ -d "$f" ]; then h="$(hc "$f")"; else s="$(basename "${f%.md}")"; h="$(hc "$(dirname "$f")" -maxdepth 1 \( -name package.json -o -name "$s" -o -name "$s.record.json" -o -name "$s.evidence.json" -o -name "$s.*.evidence.json" \))"; fi; if [ -n "$h" ]; then echo "$r" >> "$C.candidates"; else K="$K$f
"; fi; done <<EOF
$KEEP
EOF
KEEP="$K"
