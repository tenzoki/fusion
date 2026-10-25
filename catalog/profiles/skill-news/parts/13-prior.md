"$FUSION_PLUGIN_ROOT/bin/fusion-forum" new "$SCAN_FORUM"; echo "exit=$?"
# no network in the container: exit 6 unless the entry declares its remote (request 76, question 4)
