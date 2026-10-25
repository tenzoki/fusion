if [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-checkout-name" ]; then
  "$FUSION_PLUGIN_ROOT/bin/fusion-checkout-name" resolve "$HEX" --at "$HEAD" || echo "unregistered=$HEX"
