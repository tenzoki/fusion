1. Resolve `WORKBENCH`, `OUT_MEMO`, `$P` and `$CO` per Step 0; an empty `$P` halts.
2. Adopt this checkout's per-checkout files, and `node -e 'require("fs").mkdirSync(process.argv[1],{recursive:true})' "$WORKBENCH/$OUT_MEMO"`.
