[ -n "$V" ] || { echo "stamp-skipped: plugin version unresolved"; exit 0; }
command -v node >/dev/null 2>&1 || { echo "stamp-skipped: no node on PATH"; exit 0; }
node -e '
const fs = require("fs"); const [m, v, ...ran] = process.argv.slice(1);
let o = null; try { o = JSON.parse(fs.readFileSync(m, "utf8")); } catch {}
if (typeof o !== "object" || o === null || Array.isArray(o)) o = {};
const at = new Date().toISOString().slice(0, 10);
for (const sel of ran) o[sel] = { at, version: v };
fs.writeFileSync(m, JSON.stringify(o) + "\n");
console.log("stamped=" + (ran.join(",") || "none"));
' "$M" "$V" <sel...>
```

Any `stamp-skipped:` line means nothing was stamped, so every selector you just ran is asked for again on the next Setup. Say so; do not write the file by hand to make the line go away.

## Done

Report, in the project's chat language and following `rules/user-facing-output.md` and the chat profile: which selectors ran and what each had to say, in the terms its own section names, plus the stamp line. A selector with nothing to report says nothing.
