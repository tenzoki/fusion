## Step 0t — The intermediate-file directory

Create it, grant it, link `tmp` to it; `fusion-tmp=absent` blocks nothing:

```bash
T="$FUSION_PLUGIN_ROOT/bin/fusion-tmp"; [ -x "$T" ] && for c in path grant link; do "$T" $c || echo "fusion-tmp $c: exit $?"; done || echo "fusion-tmp=absent"
```

