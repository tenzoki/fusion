echo '{"op":"inspect"}' | "$FUSION_PLUGIN_ROOT/bin/fusion-record" | grep -o '"state":"[a-z-]*"' | head -n 1
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" archive
