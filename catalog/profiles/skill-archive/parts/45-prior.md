C="${TMPDIR:-/tmp}/fusion-archive-$STAMP-$SLUG"
if grep -q '^candidate=' "$C.survey" 2>/dev/null; then "$FUSION_PLUGIN_ROOT/bin/fusion-archive" move --survey "$C.survey" --into "$STAMP-$SLUG"; echo "move exit=$?"; fi
