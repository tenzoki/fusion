else
  FUSION_SRC=""
fi
if [ -n "$FUSION_SRC" ] && [ -f "$FUSION_SRC/rules/workbench-tracking.md" ]; then
  cat "$FUSION_SRC/rules/workbench-tracking.md"
else
  echo "source root: ${FUSION_SRC:-UNRESOLVED (FUSION_PLUGIN_ROOT is unset)} — rules/workbench-tracking.md not read"
fi
```

