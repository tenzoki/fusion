echo '{"op":"inspect"}' | "$FUSION_PLUGIN_ROOT/bin/fusion-record" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const v=JSON.parse(s).result.state;if(v)console.log("\"state\":"+JSON.stringify(v))}catch{}})'
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" archive
