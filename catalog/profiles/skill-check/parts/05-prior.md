[ -n "$FUSION_PLUGIN_ROOT" ] && [ -f "$FUSION_PLUGIN_ROOT/bin/monitor" ] && node -e 'const fs=require("fs"),s=process.argv[1],m="./fusion-workbench/monitor",n=m+".new",P="./fusion-workbench/.asset-provenance";fs.copyFileSync(s,n);fs.chmodSync(n,fs.statSync(n).mode|0o111);fs.renameSync(n,m);const k=require("crypto").createHash("sha256").update(fs.readFileSync(m)).digest("hex")+"  monitor",t=fs.existsSync(P)?fs.readFileSync(P,"utf8").split("\n").filter(Boolean):null;if(t===null||!t.includes(k)){fs.writeFileSync(P+".t",[...(t||[]).filter(l=>!l.endsWith("  monitor")),k].join("\n")+"\n");fs.renameSync(P+".t",P)}' "$FUSION_PLUGIN_ROOT/bin/monitor"
```

The tail of that command **stamps** the copy in `./fusion-workbench/.asset-provenance`, the record the `assets` selector below reads; the setup entry's profile step states its shape and its reason.

If the copy fails, or the mounted tree carries no `bin/monitor`, report it and continue. The host sets `$FUSION_PLUGIN_ROOT` on every call, so an unset one is a broken bundle, reported as such.
