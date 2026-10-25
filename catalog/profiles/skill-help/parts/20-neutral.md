
### 4. Update — *picking up new versions*

**If you installed via the HTTPS installer (recommended):** run `fusion --update` — it re-installs the head of `main` into `~/.fusion` — then restart the session. Nothing updates `~/.fusion` on its own. That's the whole update; no slash commands, no cache surgery.

**If you installed via the marketplace:** pull the marketplace clone (caveat below), run `claude plugin update fusion@tenzoki-plugins` in a shell (add `--scope project` or `--scope local` if you installed at that scope), then restart Claude Code. That copy is separate from `~/.fusion`; `$FUSION_SRC/README.md` says how to keep only one.

