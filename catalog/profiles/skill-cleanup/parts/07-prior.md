"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root" || { echo "No fusion workbench above $(pwd). Run the setup entry first."; exit 1; }
# no cd persists: every host.exec.v1 call gives the project root, workspace-relative, as its directory
