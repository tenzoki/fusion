if [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-session-domain" ]; then "$FUSION_PLUGIN_ROOT/bin/fusion-session-domain"; else printf 'domain=code\nsource=helper-missing\n'; fi
