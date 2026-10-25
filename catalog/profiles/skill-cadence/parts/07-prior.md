I="$FUSION_PLUGIN_ROOT/bin/fusion-identity"; [ -x "$I" ] && "$I" || true
N="$FUSION_PLUGIN_ROOT/bin/fusion-checkout-name"; [ -x "$N" ] && "$N" resolve "$CO" || true
