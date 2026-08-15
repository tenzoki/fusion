The monitor is no longer reachable on localhost

---
Reported by the user on 260812: the dashboard's `localhost` URL no longer works. He suggests
trying the IP address instead, which points at name resolution or interface binding rather than at
the server itself.

---
**Witness:** the user, directly
**Severity:** medium — the dashboard is the only live view of a running session
**Affected:** `bin/monitor`

Candidate causes, none checked: the server binds `127.0.0.1` while `localhost` resolves to `::1`
first on this machine, which fails with no useful message; a macOS change in resolution order; a
port collision with a monitor left running from an earlier session. The IP suggestion is the cheap
probe and it discriminates between the first cause and the others.

Note for whoever takes this: `hooks/lib/__tests__/monitor-warnings-panel.test.ts` starts the
monitor under a pty and asserts the browser launch, so there is a harness. Whether it would have
caught this depends on whether it connects over a name or an address.

---
Resolved: `bin/monitor` now binds the wildcard dual-stack (an `AF_INET6` socket on `::` with
`IPV6_V6ONLY` cleared, falling back to the previous IPv4 server if the platform refuses), so the
`localhost` URL it prints and opens is true whichever family the resolver returns first. The first
candidate cause was the real one and is closed: `ThreadingHTTPServer` is `AF_INET`, the default
bind `0.0.0.0` listened on IPv4 alone, and `localhost` resolves to `::1` first on this machine
(measured: `getaddrinfo` returns `AF_INET6` before `AF_INET`).

**What the fix does not explain, stated because the record asked for it.** The symptom as reported —
unreachable — was *not* reproduced. Against the unfixed monitor, `curl http://localhost:$PORT` and
Python's `urllib` both returned 200 from `127.0.0.1`: they walk the whole address list, so the
refused `::1` attempt costs a delay and not a failure, and browsers do the same. So the address the
program printed was wrong, and that is now fixed, but a client that recovers by itself would not
have shown the user a dead dashboard. The third candidate cause in this record — a stale monitor
holding the port — remains unexcluded, and one adjacent defect found in the same pass makes it more
plausible rather than less: the port-clearing step SIGTERMed every PID with the port open, the
user's own browser tab included (see below). Whoever meets "unreachable" again should capture what
the browser actually reported before assuming this fix covers it.

Two adjacent defects fixed in the same file, both measured:

1. **Port clearing killed clients.** `lsof -ti :PORT` answers "who has this port open", which
   includes every connected client. Measured on port 8477 with the server at pid 63107 and a
   client at 67971: the unnarrowed query returned both PIDs and the step would have SIGTERMed the
   browser tab watching the previous dashboard. Now `-sTCP:LISTEN`, which returned the server
   alone. Verified end to end: a client held a connection while a second monitor started on the
   same port — the client survived, the prior listener was cleared, the new server bound and served.
2. **The startup banner never reached a redirected log.** Python block-buffers a non-terminal
   stdout, the banner is far under the 8 KB buffer, and `serve_forever()` then blocks: measured
   0 bytes in the log 3 s after start, with the server answering. `sys.stdout.reconfigure(
   line_buffering=True)` at the top of the embedded script; the same measurement now shows the full
   237-byte banner at 2.5 s.

**Rejected alternative, recorded because it is the one a reader will reach for first.** Printing
`127.0.0.1` instead of `localhost` is the smaller edit and closes the same gap. It was not taken:
the URL is the string a user copies and bookmarks, and
`hooks/lib/__tests__/monitor-warnings-panel.test.ts` pins the launched URL to
`http://localhost:${port}`, so the spelling change moves the defect out of `bin/monitor` and into a
test's expectations. Binding both families makes the existing spelling true and leaves the pin
correct.

On the harness question this record raised: `monitor-warnings-panel.test.ts` would **not** have
caught this. It spawns the monitor with `MONITOR_BIND=127.0.0.1` and fetches `http://127.0.0.1:...`
— an address, never the name — so the family mismatch was invisible to it by construction. That
gap is unchanged by this fix; only the wildcard bind moved, and no test exercises the wildcard.
