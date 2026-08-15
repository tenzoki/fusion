# Coder — the monitor's printed address becomes an address it answers at

**Stamp:** 260815-2306
**Agent:** coder
**Status:** Complete
**Source record:** `shared/issues/260812-0253_c_the-monitor-is-no-longer-reachable-on-localhost.md`
**Files changed:** `bin/monitor`

## The dispatched defect

`ReuseServer` extends `ThreadingHTTPServer`, whose `address_family` is `AF_INET`, so the default
bind `0.0.0.0` listened on IPv4 alone — while the startup banner, the browser launch and the
launch-failure message all named `http://localhost:$PORT`. Measured here,
`socket.getaddrinfo("localhost", …)` returns `AF_INET6` (`::1`) before `AF_INET`, so the first
address the name resolves to was an address nothing was listening at.

## What I could not reproduce, and why it matters

The record's symptom is "unreachable". Against the unfixed monitor on port 8477 it was not
reachable-failing: `curl http://localhost:8477/api/state` returned `200` with
`remote_ip=127.0.0.1`, and Python's `urllib` did the same. Both walk the whole address list, so the
refused `::1` attempt costs one round trip and not a failure; the browsers behave the same way.

So the defect is real as *stated in the dispatch* — the program named an address it was not on —
but it does not by itself produce a dead dashboard for a fallback-capable client. I have recorded
that in the issue rather than letting the closure imply more than was measured. The record's third
candidate cause (a stale monitor holding the port) is still unexcluded, and adjacent defect 1 below
makes it more plausible, not less.

## The fix, and the alternative I did not take

The dispatch offered two: print `127.0.0.1`, or bind dual-stack. It asked for the smaller change
unless a reason against it turned up. One did.

`hooks/lib/__tests__/monitor-warnings-panel.test.ts:874` pins the URL handed to the browser
launcher to exactly `http://localhost:${port}`. Changing the spelling in `bin/monitor` moves the
defect out of `bin/monitor` and into that test's expectations — and the dispatch scoped me to
`bin/monitor` alone while requiring `npm test` green, so the two cannot both hold. Binding both
families instead makes the existing spelling true and leaves the pin correct. The second reason is
independent of the test: the URL is the string a user copies, pastes and bookmarks, and `localhost`
is what belongs in it.

Implementation — a `DualStackServer(ReuseServer)` with `address_family = AF_INET6`, clearing
`IPV6_V6ONLY` in `server_bind()`, used **only** for the wildcard bind (`0.0.0.0`, `::`, empty).
Three properties are deliberate:

- An explicit `MONITOR_BIND` is untouched and still builds the `AF_INET` server. Widening it would
  be wrong, not merely unnecessary: a loopback IPv6 socket cannot carry `127.0.0.1` (v4-mapping
  works on the wildcard only), so it would move the server off the address the caller named. The
  test harness sets `MONITOR_BIND=127.0.0.1` on every spawn, so no existing test path changes.
- `IPV6_V6ONLY=0` is not universal — OpenBSD refuses v4-mapped sockets — so a platform that rejects
  it raises out of `server_bind()`, `TCPServer.__init__` closes the socket and re-raises, and the
  caller falls back to the IPv4 server this file has always built. Worse than dual-stack, identical
  to today.
- `LOOPBACK_BINDS` is unchanged and its comment now says why the wildcard is not listed in it.

## Adjacent defect 1 — port clearing killed clients

`lsof -ti :PORT` answers "who has this port open", which includes every connected client. Measured
on 8477 with the server at pid 63107 and a client process at 67971: the unnarrowed query returned
both, and the step SIGTERMs everything it returns — so starting a monitor on the port a browser tab
was already watching killed the browser. `-sTCP:LISTEN` returned 63107 alone.

Verified end to end after the fix: a client held a connection to the running monitor on 8478 while
a second monitor started on the same port. The client (28236) survived, the prior listener (23781)
was cleared, the new server bound and served. The step still reaches the one process whose
existence would make the bind fail, and nothing else. The usage text's existing note ("if another
process is listening on `<port>` … monitor will SIGTERM it") was over-broad as a description of the
old code and is exactly true of the new.

## Adjacent defect 2 — the banner never reached a redirected log

Python block-buffers stdout when it is not a terminal. The banner is ~237 bytes, nowhere near the
8 KB that flushes a block buffer, and `serve_forever()` then blocks — so the log was empty for the
process's whole life and the banner appeared at shutdown, or not at all under `SIGKILL`. Measured
before the fix: 0 bytes in the redirected log 3 s after start, with the server answering requests.

Fixed with `sys.stdout.reconfigure(line_buffering=True)` at the top of the embedded script, guarded
against `AttributeError`/`OSError`. Line buffering rather than one flush after the banner: it also
covers the shutdown line, and it leaves the next `print` anyone adds correct by default. Measured
after: the full banner in the log at 2.5 s.

## Verification

| What | Command | Result |
|---|---|---|
| Syntax | `bash -n bin/monitor`; `python3 -m py_compile` on the extracted heredoc | exit 0, exit 0 |
| AC1 live fetch | `curl -sS -m 5 http://localhost:8478/api/state` (the URL the banner printed) | `code=200 remote_ip=::1` |
| AC1, both families | `curl http://[::1]:8478/…`; `curl http://127.0.0.1:8478/…` | `200` / `200` |
| AC2 | client held 8478, second monitor started on it | client alive, prior listener cleared, new server served |
| AC3 | `./bin/monitor probe 8478 -d ./fusion-workbench > mon2.log` | 237 bytes of banner at 2.5 s, server still running |
| AC4 | `cd hooks && npm test` on a clean `HEAD` worktree carrying only this patch | **exit 0** — 40 files, 751 tests |

`remote_ip=::1` on the third row is the whole fix in one measurement: the resolver picked IPv6
first, and the server answered there. Before the change that connection was refused.

**On the shared working tree, `npm test` exits 1** — `surface-growth-bound.test.ts`'s `agents`
golden, `orchestrator.md 139859 → 139858`, one byte. That is another agent's concurrent uncommitted
edit to `agents/orchestrator.md`, not mine: `bin/monitor` belongs to none of the four bounded
surfaces. I isolated it rather than asserting it — `git worktree add --detach` at `d33cd22`,
`git apply` of my `bin/monitor` diff alone, full suite green there, worktree removed.

## What is still open

No test exercises the wildcard bind, so nothing pins the fix. The harness spawns with
`MONITOR_BIND=127.0.0.1` and fetches by address, never by name, which is why it could not have
caught the original defect either. Closing that means either a test that spawns on the default bind
(and inherits the macOS Local Network permission problem the existing comment documents) or one
that asserts on the socket family. Neither is in this dispatch's scope; the gap is named in the
issue record.
