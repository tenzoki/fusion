
**Nothing here blocks anything.** `permissions` asks one question on a normal run; `assets`, `identity` and `leftovers` each ask at most one when they find something to ask about. Everything else reports and continues. Report what every selector you ran had to say, then run the stamp at the end.

**Never prepend `cd <something>`** to the commands below: every path is relative to the project root, where the workbench and the project's own root-level files sit.

## monitor — the workbench's copy of the monitor binary

Always re-copy the monitor from the installed plugin so the project's copy matches the current plugin version. Copy to a temp file and atomically `mv` it into place — this overwrites cleanly even when a monitor process is currently running (avoids `Text file busy` / `ETXTBSY`):

```bash
