[ -n "$V" ] || { echo "marker-version-unresolved"; exit 0; }
if command -v node >/dev/null 2>&1; then node -e '
const fs = require("fs"); const [m, v] = process.argv.slice(1);
let o = null; try { o = JSON.parse(fs.readFileSync(m, "utf8")); } catch {}
if (typeof o !== "object" || o === null) o = {};
const before = JSON.stringify(o);
if (typeof o.setup_at !== "string") o.setup_at = new Date().toISOString().slice(0, 19);
o.plugin_version = v;
delete o.checks;
const after = JSON.stringify(o);
if (after !== before) fs.writeFileSync(m, after + "\n");
console.log("marker=" + (after !== before ? "written" : "unchanged"));
' "$M" "$V"; elif [ ! -f "$M" ]; then printf '{"setup_at":"%s","plugin_version":"%s"}\n' "$(date -u +%Y-%m-%dT%H:%M:%S)" "$V" > "$M"; elif ! grep -qF "\"plugin_version\":\"$V\"" "$M"; then if grep -q '"plugin_version"' "$M"; then S="s/(\"plugin_version\" *: *\")[^\"]*\"/\1$V\"/"; else S="1s/^\{/{\"plugin_version\":\"$V\",/;1s/,\}/}/"; fi; sed -E "$S" "$M" > "$M.tmp" && mv "$M.tmp" "$M"; fi
