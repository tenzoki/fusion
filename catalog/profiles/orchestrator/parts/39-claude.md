```bash
if [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-review-coverage" ]; then
  "$FUSION_PLUGIN_ROOT/bin/fusion-review-coverage"
else
  echo "fusion: no bin/fusion-review-coverage in the installed plugin at $FUSION_PLUGIN_ROOT — no coverage read taken" >&2
fi
```
