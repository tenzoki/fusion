  node -e 'require("fs").copyFileSync(process.argv[1],process.argv[2])' "$FUSION_PLUGIN_ROOT/$rel" "./fusion-workbench/$rel" || continue
