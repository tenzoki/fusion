Run this step only when `[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-migrate" ]` holds; otherwise say the installed bundle carries no JSON migration and stop. Every question in this step is plain chat text with numbered options and ends your turn: one question per message, and the user answers with a number or in their own words.

**Node first, before any `bin/fusion-migrate` call.** The rename pass above needed no Node and stands as it is; this step does:

```bash
W="$(sed -n 's/.*"node": *">=\([0-9][0-9.]*\)".*/\1/p' "$FUSION_PLUGIN_ROOT/codec/package.json" 2>/dev/null | head -1)"; W="${W:-20.12.0}"; if command -v node >/dev/null 2>&1 && node -e 'const c=s=>s.split(".").map(Number),h=c(process.versions.node),w=c(process.argv[1]);for(let i=0;i<3;i++)if(h[i]!==w[i])process.exit(h[i]>w[i]?0:1)' "$W" 2>/dev/null; then echo "NODE=$(node --version)"; else echo "REFUSED: the JSON migration needs Node $W or later, and node is missing or older. This container does not provide it; report it."; fi
