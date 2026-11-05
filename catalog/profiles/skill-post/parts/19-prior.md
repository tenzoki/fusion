node -e 'require("fs").mkdirSync(process.argv[1],{recursive:true})' "$WORKBENCH/$OUT_FORUM"
node -e 'require("fs").renameSync(process.argv[1],process.argv[2])' "$WORKBENCH/.post-draft-$CHECKOUT" "$WORKBENCH/$OUT_FORUM/$STAMP-$CHECKOUT-<slug>.md"
