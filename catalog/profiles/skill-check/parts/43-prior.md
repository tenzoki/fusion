V="$(sed -nE 's/.*"version": *"([^"]+)".*/\1/p' "$FUSION_PLUGIN_ROOT/.claude-plugin/plugin.json" | head -n 1)"
