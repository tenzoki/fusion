if [ -s "$C.candidates" ]; then "$FUSION_PLUGIN_ROOT/bin/fusion-archive" survey --candidates "$C.candidates" > "$C.survey"; echo "survey exit=$?"; grep -E '^(candidate|held|refused)=' "$C.survey"; fi
