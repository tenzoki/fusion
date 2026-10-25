if [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-identity" ]; then
  CHECKOUT="$("$FUSION_PLUGIN_ROOT/bin/fusion-identity" | sed -n 's/^CHECKOUT=//p')"
