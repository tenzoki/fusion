node -e 'require("fs").mkdirSync(process.argv[1],{recursive:true})' ./fusion-workbench && "$FUSION_PLUGIN_ROOT/bin/fusion-write" initialize --workbench ./fusion-workbench; echo "exit=$?"
