# coder — a failing browser launcher stops deciding the monitor's lifetime

**Status:** Complete
**Session:** 260810-1646-orchestrator-session, Turn 1, task `I:260810-1558-monitor-orphan` (tasklist task 3)
**Source record:** `fusion-workbench/shared/issues/260810-1558_c_a-missing-open-command-exits-the-monitor-wrapper-under-set-e-and-orphans-the-server-it-forked.md`
**Files changed:** `bin/monitor` (browser-launch block at the tail only)

## What the defect was

`bin/monitor` runs under `set -euo pipefail`. It forks the python server, installs an
`INT`/`TERM` trap that kills it, then runs `open "http://localhost:$PORT"` before reaching
`wait $SERVER_PID`. A failing command inside an `if` body is not exempt from `set -e` —
only the condition is — so a missing or failing `open` became the wrapper's own exit status
and `wait` was never reached. The forked server was left orphaned: still listening, still
holding the port, with the trap dead along with the shell that installed it.

## The fix, and why this shape

Two halves, both in the same block:

1. **`|| true` on the launch.** This is the load-bearing half and the non-negotiable one.
   Every launcher can fail for reasons that are none of the server's business: no display,
   no registered handler, a browser that refuses to start. The server's supervision must
   not depend on any of them.
2. **Platform dispatch, `open` on Darwin and `xdg-open` elsewhere, behind `command -v`.**
   The record offered this as an alternative to `|| true`; it is really a complement, and
   it earns its three lines twice. It makes the tab actually open on Linux, where `open`
   does not exist at all. And it avoids the trap a bare `command -v open` walks into there:
   on many Linux distributions `/usr/bin/open` is util-linux's `openvt`, which switches
   virtual terminals and has nothing to do with a URL. A `command -v` probe with no
   platform dispatch would find that binary, consider the launcher present, and run it.

The `case` on `uname -s` is disjoint and complete: `Darwin` takes `open`, `*` takes
`xdg-open`, so `BROWSER_LAUNCHER` is always assigned and `set -u` has nothing to trip on.
If the chosen launcher is absent the server simply runs without a tab, exactly as under
`MONITOR_NO_BROWSER`.

Neither non-interactive gate was touched: `[[ -t 1 ]]` and `MONITOR_NO_BROWSER` still sit
where session 260810-1402 put them, and the new code is entirely inside that gate.

## How it was verified

**Direct measurement, before and after.** A harness (`scratchpad/demo.sh`) ran the wrapper
under a pty via `script(1)`, with the pty deliberately held open by a trailing `sleep`
*after* the wrapper returns. Without that, `script` tears the pty down the moment the
wrapper exits and the hangup collects the orphaned server too, which hides the exact leak
under test. Two shims: `failing` puts an `open` on PATH that exits 127 (what a not-found
command does); `absent` puts a `uname` on PATH that prints `Linux`, so the dispatch picks
`xdg-open`, which this machine does not have.

The harness also prefixes the chain with `perl -e '$SIG{INT}="DEFAULT"; exec @ARGV'`. Bash
sets `SIGINT` to `SIG_IGN` in any job it starts with `&` when job control is off, and a
signal inherited as ignored cannot be trapped by the shell that inherits it — without the
prefix the Ctrl+C half of the test measures the harness, not the monitor. That cost one
false reading before it was found.

Before (`git show HEAD:bin/monitor`), failing launcher:

```
t+4s  wrapper: GONE
t+4s  server:  67288   (ppid 1 — reparented to init)
t+4s  port 8791 answers HTTP: 200
WRAPPER_EXIT=127
```

The orphan, exactly as the record describes it: the wrapper gone with the record's 127, the
server adopted by init and still serving.

After, failing launcher (port 8793):

```
76925 76921 bash bin/monitor demo 8793 ...
76950 76925 python ... monitor-server.py demo 8793 ...   (child of the wrapper)
t+4s  port 8793 answers HTTP: 200      ("shim: open failed" on the pty)
after SIGINT -> wrapper: GONE, server: GONE
```

After, absent launcher (port 8797, `uname` says Linux): same shape — wrapper alive with the
server as its child, no launcher run at all, no error, and SIGINT takes both down.

**Test suite.** `npm test` from `hooks/` — **exit 0, 41/41 test files, on the second run.**

The first run came back exit 1 on a single failure that belonged to another agent working in
parallel this Turn: `derivable-enumerations-lint.test.ts` compares the `hooks/lib` table in
`README-hooks.md` against `lib/*.ts`, and it caught `hooks/lib/domain-cascade.ts` untracked
(`git status`: `?? hooks/lib/domain-cascade.ts`, ` M README-hooks.md`) while that agent was
mid-file. It settled on its own, with nothing changed here in between. Recorded because a
run that goes from red to green with no edit deserves its explanation on the record rather
than a quiet second attempt. (An earlier full run had also shown three
`fusion-commit-lock.test.ts` timing failures under the load of five suites at once; those
too were gone by the second run.)

The monitor's own suite is green in isolation:
`npx vitest run lib/__tests__/monitor-warnings-panel.test.ts` — exit 0, 12/12, including all
three browser-launch cases. The positive case there is the one that matters for this change:
it puts a fake `open` first on PATH and asserts the marker file it writes, so it proves the
Darwin dispatch still finds and runs a PATH-supplied `open`. The two negative cases prove the
non-interactive paths are unchanged.

## One observation, not acted on

The wrapper's own exit status after a trapped `INT` or `TERM` reads `143` rather than the
trap's `exit 0`. *Inference, not verified:* this is bash re-raising the fatal signal against
itself after the handler returns, so the parent sees death-by-signal. It is unchanged by this
edit — the trap line was not touched — and it affects nothing the acceptance criteria name:
the server dies with the wrapper and the port frees. Recorded here rather than fixed.
