The monitor's IPv4 fallback reinstates the defect the dual-stack bind removed, and says nothing

---
`bin/monitor` now binds `::` dual-stack for the wildcard, so that the `http://localhost:$PORT` the
banner and the browser launcher both print is an address the server actually answers at. When the
`IPV6_V6ONLY` clear or the IPv6 bind fails, the `except OSError` arm falls back to
`ReuseServer(("0.0.0.0", PORT), Handler)` — an IPv4-only server. The banner, the browser launch and
the launch-failure message are downstream of that branch and unchanged, so on the fallback path the
program prints `localhost` at an IPv4-only server again. That is precisely the defect
`260812-0253` was filed for, restored with no diagnostic distinguishing it from the fixed case.

---
**Severity:** Medium. The fallback is the platform-compatibility path, so it fires exactly where
nobody is watching, and it fails into the original symptom rather than into a named one.

**Where.** `bin/monitor:1273-1282` (the branch), `:1304-1305` (the banner), `bin/monitor:1386` (the
browser launch, in the bash wrapper, which never learns which server python built).

```python
WILDCARD_BINDS = ("0.0.0.0", "::", "")
if BIND in WILDCARD_BINDS:
    try:
        server = DualStackServer(("::", PORT), Handler)
    except OSError:
        # No IPv6 on this host, or a kernel that will not clear V6ONLY. IPv4
        # alone is what this file did before, and it still serves.
        server = ReuseServer(("0.0.0.0", PORT), Handler)
```

**Verified by execution**, 2026-08-15, macOS 24.6.0, against `bin/monitor` at `f4f01b0`. A copy of
the script with `socket.IPV6_V6ONLY` replaced by an invalid option number forces the `OSError` and
takes the fallback arm — nothing else was changed:

```
$ sed 's/socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0/socket.IPPROTO_IPV6, 99999, 0/' bin/monitor > /tmp/monitor-fallback
$ MONITOR_NO_BROWSER=1 /tmp/monitor-fallback probe 18479 -d /tmp/wb > /tmp/log 2>&1 &
$ cat /tmp/log
  probe — Orchestrator Monitor
  Local: http://localhost:18479          <-- unchanged
$ lsof -nP -i :18479
Python  10922  k1  4u  IPv4  ...  TCP *:18479 (LISTEN)
$ curl -s -o /dev/null -w '%{http_code}\n' --ipv4 http://localhost:18479/ ;  # 200
$ curl -s -o /dev/null -w '%{http_code}\n' --ipv6 http://localhost:18479/ ;  # 000
```

The fallback binds and serves — the arm is not broken — but `localhost` over IPv6 is refused, and
the banner still names `localhost` with no qualification.

**Why the record's own reasoning does not cover this.** The history entry
`260815-2306-coder-monitor-localhost-unreachable.md` calls the fallback "Worse than
dual-stack, identical to today". Identical to today is the whole point: today is the state the
record was filed against. What made that state a defect was not the missing IPv6 socket on its own
but the pairing of a missing socket with a printed name that claims it, and the fallback keeps the
pairing intact.

**Fix direction.** Have the fallback change what is printed, not only what is bound. The branch
already knows which server it built, so a `local_host` variable set to `localhost` on the dual-stack
path and `127.0.0.1` on the fallback path, interpolated into the banner, costs one line each.
Two constraints on any fix:

- The browser launcher lives in the **bash** wrapper (`bin/monitor:1386`) and has no channel from
  the python process, so a fix confined to the banner leaves the launched tab still pointed at
  `localhost`. Either the wrapper stops choosing the URL, or it accepts one from the server's
  stdout, or the tab keeps the defect on the fallback path — this is a real design choice and
  should be made, not left implicit.
- `hooks/lib/__tests__/monitor-warnings-panel.test.ts:874` pins the launched URL to exactly
  `http://localhost:${port}`. That pin is correct on the dual-stack path and would have to become
  conditional if the wrapper's URL becomes conditional.

**Adjacent, and deliberately not filed separately.** `MONITOR_BIND=::1` is a plausible thing for a
user to type now that the usage text at `bin/monitor:25-28` announces a dual-stack default, and it
still dies with an uncaught `socket.gaierror` at construction — `::1` is not in `WILDCARD_BINDS`, so
it builds the `AF_INET` `ReuseServer`. `bin/monitor:1286-1289` documents this as intended. It is
pre-existing, and the same `local_host` refactor would be the natural place to also route an
explicit IPv6 literal to an `AF_INET6` server.

**Found by:** coderev, review of `d33cd22..f4f01b0`, commit `f5ae298`.

---
Resolved: the printed address now follows the bind that actually happened (coder, 2026-08-16).
`bin/monitor`'s wildcard branch sets `dual_stack` when `DualStackServer` constructs, and the
banner is composed from it: `localhost` only when both loopback families answer, `127.0.0.1` on
the `OSError` fallback and on an explicit loopback bind (including the `localhost` spelling, which
python resolves to an AF_INET socket and which carried the same defect this record names),
the caller's own address otherwise.

The record's first constraint — the bash launcher having no channel from the python process — is
answered by making the server the author of the URL rather than the wrapper: python writes the
effective URL to `$TMPDIR_PATH/monitor-url` immediately after binding, and the launcher reads it,
falling back to its old constant only if the file never appears. That also replaced the flat
`sleep 0.5` before the launch with a bounded wait on that file, which is the event the sleep was
estimating; the whole-second fallback for platforms that reject a fractional operand is preserved.

The record's second constraint is met by changing the pin rather than dropping it:
`monitor-warnings-panel.test.ts:874` now expects `http://127.0.0.1:${port}`, which is correct for
the loopback-pinned server that case spawns, and the `localhost` case it used to stand for is
pinned by the new wildcard case instead.

Verified by execution, 2026-08-16, macOS 15.7.7 (24G720). All three reachable paths print an
address that answers `200` at `/api/dashboard`: default dual-stack → `http://localhost:P` (200 on
both families), forced fallback (`IPV6_V6ONLY` replaced by an invalid option number, the same
mutation this record used) → `http://127.0.0.1:P` (200), `MONITOR_BIND=127.0.0.1` →
`http://127.0.0.1:P` (200). Mutation-checked: restoring the constant launcher URL fails
`monitor-warnings-panel.test.ts` at the launched-URL assertion.

The adjacent `MONITOR_BIND=::1` `gaierror` is deliberately **not** fixed here. It is pre-existing,
the record filed it as adjacent, and routing an explicit IPv6 literal to an AF_INET6 server is a
behaviour change to the explicit-bind contract that this task's scope does not cover.
