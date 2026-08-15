The monitor's LISTEN-only port clearing cannot see the stale listener the same file documents on macOS

---
`bin/monitor`'s port-clearing step was narrowed to `lsof -ti :PORT -sTCP:LISTEN` so it stops
SIGTERMing the user's browser tab. The narrowing is correct for that purpose and was verified. But
the same file, forty lines below, states that on macOS a **non-loopback** listener belonging to a
process without Local Network permission is parked in `CLOSED` state and never reaches `LISTEN`.
The default bind is non-loopback. On such a host a stale monitor is invisible to a `-sTCP:LISTEN`
query, so the step that exists to clear it clears nothing — and because `SO_REUSEPORT` is set
unconditionally, the new monitor binds anyway and two servers end up sharing the port.

---
**Severity:** Medium, and the confidence is split — see *What is verified and what is inferred*.

**Where.**

- `bin/monitor:1192-1208` — the narrowed query.
- `bin/monitor:1263-1266` — the claim about macOS:

  > `MONITOR_BIND=127.0.0.1` gives a loopback-only server — the test suite relies on this, because
  > macOS parks a non-loopback listener of a process without Local Network permission in CLOSED
  > state (never LISTEN) and silently drops its inbound connections.

- `bin/monitor:1224-1228` — `SO_REUSEADDR` and `SO_REUSEPORT`, both set on every server this file
  builds, so a second bind on an already-held port succeeds rather than failing.

**What is verified.** The narrowing does what the commit says it does. Measured 2026-08-15 on
macOS 24.6.0 against `f4f01b0`:

```
$ lsof -nP -i :18490
Python  28480  k1  3u  IPv4  ...  TCP 127.0.0.1:56978->127.0.0.1:18490 (CLOSE_WAIT)
Python  28458  k1  4u  IPv6  ...  TCP *:18490 (LISTEN)
$ lsof -ti :18490            # 28480 28458   — the client is in the kill set
$ lsof -ti :18490 -sTCP:LISTEN  # 28458      — it is not
```

End to end, with monitor A serving, a client holding a connection, and monitor B started on the
same port: A's pid was cleared, the client survived, B bound and served. The fix works.

**What is inferred, and not reproduced.** The `CLOSED`-state case above. Reproducing it needs a
macOS host whose terminal lacks Local Network permission, which this reviewer does not have — on
the machine measured, the wildcard listener shows `(LISTEN)` and is found. The chain is:

1. The default bind is the non-loopback wildcard (`bin/monitor:1273-1282`, `::`).
2. On the platform `:1264` describes, that listener's socket never reaches `LISTEN`.
3. `-sTCP:LISTEN` matches by state, so it returns nothing for such a process.
4. The clearing step therefore no longer reaches the stale monitor it was written for, where before
   the narrowing it did.
5. `SO_REUSEPORT` means the new bind succeeds regardless, so the outcome is two live servers on one
   port rather than a loud failure.

If `:1264` is accurate, this is a behavioural regression on the default configuration of the
platform this plugin is developed on. If `:1264` is stale or overstated, there is nothing here —
and that is worth knowing either way, because a test-suite comment is currently the only evidence
for it.

**Why it is worth acting on now rather than filing under "watch it".** `f5ae298`'s own commit
message says the record's third candidate cause — a stale monitor holding the port — "remains
unexcluded and is made more plausible by the port-clearing defect". This finding says the narrowing
that fixed the port-clearing defect may have left that candidate reachable by a second route.

**Fix direction — the trade-off is real, so pick deliberately.**

- Widening back to every state re-introduces the browser kill. Not that.
- Excluding by state (`-sTCP:^ESTABLISHED` and friends) is fragile: the client measured above was
  in `CLOSE_WAIT`, not `ESTABLISHED`, so any state blacklist has to be enumerated and will drift.
- Identifying the target by **what it is** rather than by socket state is the shape that survives:
  the stale process to clear is a `python3` running the script this wrapper wrote. `lsof -ti :PORT`
  for the candidate set, then `ps -o command=` per pid and a match on `monitor-server.py`, kills
  exactly the prior monitors and nothing else — in `LISTEN` or `CLOSED` alike — and can never reach
  a browser.

First step either way: confirm or refute `:1264` on a host that actually lacks Local Network
permission. If it is refuted, delete the claim from the comment rather than leaving it to justify a
test-harness constraint nobody can check.

**Found by:** coderev, review of `d33cd22..f4f01b0`, commit `f5ae298`.
