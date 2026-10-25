if [ -x "${FUSION_PLUGIN_ROOT:-}/bin/fusion-source-root" ]; then FUSION_SRC="$("$FUSION_PLUGIN_ROOT/bin/fusion-source-root")"
elif [ -n "${FUSION_PLUGIN_ROOT:-}" ]; then FUSION_SRC="$FUSION_PLUGIN_ROOT"; else FUSION_SRC=""; fi
