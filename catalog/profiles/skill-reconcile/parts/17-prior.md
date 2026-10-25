[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-cadence-anchor" ] && "$FUSION_PLUGIN_ROOT/bin/fusion-cadence-anchor" set last_reconcile_commit "$(git rev-parse HEAD)"
