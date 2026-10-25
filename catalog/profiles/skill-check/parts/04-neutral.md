
| Selector | What it answers |
|---|---|
| `monitor` | the workbench's monitor binary is the one this version ships |
| `concurrency` | another orchestrator session is already running against this project |
| `assets` | the workbench's voice profiles against the ones this version ships |
| `config` | the project has its own `fusion.json` |
| `permissions` | the project has a permission file, so a session need not approve every write |
| `gitattributes` | the event log has a union merge driver |
| `identity` | this checkout is in the registry |
| `gitignore` | a tracked workbench's `.gitignore` against the four-class partition |
| `upstream` | how far this checkout is behind what it last saw of the remote |
| `leftovers` | files written by mechanisms fusion no longer ships |
| `claude-md` | where `CLAUDE.md` carries its weight |

**Nothing here blocks anything.** `permissions` asks one question on a normal run; `assets`, `identity` and `leftovers` each ask at most one when they find something to ask about. Everything else reports and continues. Report what every selector you ran had to say, then run the stamp at the end.

**Never prepend `cd <something>`** to the commands below: every path is relative to the project root, where the workbench and the project's own root-level files sit.

## monitor — the workbench's copy of the monitor binary

Always re-copy the monitor from the installed plugin so the project's copy matches the current plugin version. Copy to a temp file and atomically `mv` it into place — this overwrites cleanly even when a monitor process is currently running (avoids `Text file busy` / `ETXTBSY`):

```bash
