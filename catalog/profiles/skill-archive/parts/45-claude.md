T="$("$FUSION_PLUGIN_ROOT/bin/fusion-tmp" path)"; C="${T:?fusion-tmp path failed}/fusion-archive-$STAMP-$SLUG"
if [ ! -e "$C.survey" ]; then echo survey=absent; elif grep -q '^candidate=' "$C.survey"; then "$FUSION_PLUGIN_ROOT/bin/fusion-archive" move --survey "$C.survey" --into "$STAMP-$SLUG"; echo "move exit=$?"; fi
