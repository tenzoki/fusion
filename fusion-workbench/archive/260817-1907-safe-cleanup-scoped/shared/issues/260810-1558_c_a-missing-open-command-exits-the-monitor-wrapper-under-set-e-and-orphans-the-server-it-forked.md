A missing `open` command exits the monitor wrapper under `set -e` and orphans the server it forked

---

`bin/monitor` runs under `set -euo pipefail` and ends:

```
python3 "$TMPFILE" ... &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null; wait $SERVER_PID 2>/dev/null; exit 0' INT TERM
if [[ -t 1 && -z "${MONITOR_NO_BROWSER:-}" ]]; then
  sleep 0.5
  open "http://localhost:${PORT}"
fi
wait $SERVER_PID
```

`open` is a macOS command. On a platform without it (Linux, and any macOS whose `PATH` is
narrowed) the launch fails with exit 127, and under `set -e` that exit is the wrapper's:
`wait $SERVER_PID` is never reached.

Measured, not inferred:

```
$ bash -c 'set -euo pipefail; if [[ 1 == 1 ]]; then nosuchcmd_xyz "u"; fi; echo REACHED_WAIT'
bash: nosuchcmd_xyz: command not found
exit=127
```

`REACHED_WAIT` does not print. A failing command inside an `if` body is not exempt from
`set -e`; only the condition is.

**Consequence.** The forked python server is not killed — it is orphaned and goes on
serving and holding the port, while the wrapper the user is watching has exited. The
`INT`/`TERM` trap dies with the wrapper, so Ctrl+C in that terminal no longer stops the
server; it has to be found by port and killed by hand. The user sees the banner, the
shell prompt returns, and a listener stays behind.

**Age and reach.** Pre-existing, not introduced by the `[ -t 1 ]` gate added in session
260810-1402 — before that gate the same 127 exit happened on every start on such a
platform. The gate narrows the reach rather than widening it: the failure is now
reachable only in the interactive case, because a non-interactive caller never runs
`open` at all. That is why it was left standing rather than folded into that fix.

**Shape of a fix**, for whoever takes it: `open ... || true`, or a launcher chosen by
platform (`open` / `xdg-open`), so a failed or absent launcher never decides the
wrapper's lifetime. Either way the server's supervision must not depend on the browser.

**Filed by** coder, session 260810-1402, found while fixing
`260810-1557_*_bin-monitor-opens-a-browser-tab-on-every-non-interactive-spawn-…`.

---
Resolved: `bin/monitor`'s browser-launch block now chooses the launcher by platform
(`open` on Darwin, `xdg-open` elsewhere), runs it only when `command -v` finds it, and
appends `|| true` so no launcher failure can become the wrapper's exit status. The
platform dispatch is not decoration: on many Linux distributions `/usr/bin/open` is
util-linux's `openvt`, so a bare `command -v open` probe would find a virtual-terminal
switcher and run it. Both gates from session 260810-1402 (`[[ -t 1 ]]`,
`MONITOR_NO_BROWSER`) are untouched, and the new code sits entirely inside them.

Measured before and after under a pty, with the pty held open past the wrapper's exit so
an orphan would be visible. Before: `WRAPPER_EXIT=127`, wrapper gone, python server
reparented to init (ppid 1) and still answering HTTP 200 on its port. After, with a
launcher that exits 127 and again with no launcher on the platform at all: the wrapper is
alive with the server as its child, the dashboard serves, and a SIGINT takes both down and
frees the port. `npx vitest run lib/__tests__/monitor-warnings-panel.test.ts` — exit 0,
12/12, all three browser-launch cases included.

Fixed by coder, session 260810-1646-orchestrator-session.md, Turn 1 (task 3). Full record:
`260810-1807-coder-monitor-launcher-lifetime.md`.
