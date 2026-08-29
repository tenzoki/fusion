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

---
Resolved: investigated first, then fixed in a way that does not depend on the investigation's
unresolved half (coder, 2026-08-16).

**What the investigation established.**

1. *The claim is not "a test-suite comment" — it is a measurement, and the record for it exists.*
   `bin/monitor:1264` is a restatement of
   `260806-0820_*_monitor-bind-0000-bricht-loopback-verbindungen-neun-tests-rot.md`,
   whose `Resolved:` note records the state measured on this development machine on 2026-08-06:
   a non-loopback listener of a process without Local Network permission parked in CLOSED, never
   LISTEN, dropping inbound SYNs *even from 127.0.0.1*, with a loopback bind exempt. Nine tests
   were red for it. That record already separates its own confidence the way this one asks for:
   the CLOSED/LISTEN dichotomy labelled measured, the attribution to the Local Network TCC service
   labelled inference.

2. *It does not reproduce on this host today.* Measured 2026-08-16, macOS 15.7.7 (24G720), four
   servers bound in one run and each queried for socket state and reachability:

   | bind | `lsof -nP -i` | `-sTCP:LISTEN` | 127.0.0.1 | LAN ip |
   |---|---|---|---|---|
   | `0.0.0.0` | `*:P (LISTEN)` | found | 200 | 200 |
   | `::` dual-stack | `*:P (LISTEN)` | found | 200 | 200 |
   | `192.168.178.126` | `192.168.178.126:P (LISTEN)` | found | — | 200 |
   | `127.0.0.1` | `127.0.0.1:P (LISTEN)` | found | 200 | — |

   Every bind reaches LISTEN and answers. The 2026-08-06 state is absent, and the explicit-LAN-bind
   row is the direct contradiction of that record's `expliziter LAN-IP-Bind → ebenso CLOSED`.

3. *Why it does not reproduce, and why that is not a refutation.* The precondition is gone: this
   process tree **has** Local Network permission. An outbound TCP connect to the LAN gateway
   (192.168.178.1:80 and :443) succeeds, which a process denied that permission cannot do. The
   2026-08-06 record closed by asking the user to grant it ("bis die Terminal-App unter
   Systemeinstellungen → Datenschutz → Lokales Netzwerk freigegeben ist"), and the grant evidently
   happened. Reading the state directly was attempted and is not available — both TCC databases
   return `authorization denied`.

**What a decisive test would need**, since this one cannot be run here: a macOS 15+ host on which
the responsible app of the shell is **denied** Local Network permission, binding `0.0.0.0` and `::`
and reading `lsof -nP -i :PORT`. Revoking the permission on this machine (`tccutil reset`, or the
Settings pane) would produce that host, and is a change to the user's system configuration that no
fix here is worth making unasked. So the claim stands as **unverified at HEAD** — neither fact nor
fiction — and `bin/monitor`'s comment now says exactly that, with both dates, both measurements
and the reason the second cannot settle the first. It was **not** deleted: deleting it would
discard a real measurement on the strength of a run whose precondition was absent.

**The fix, and why it does not rest on the unresolved half.** The clearing step now asks two
questions and unions the answers. The first is unchanged — `lsof -ti :PORT -sTCP:LISTEN`, which is
this script's documented behaviour ("whatever is listening gets a SIGTERM") and the narrowing that
saved the browser tab. The second asks *what a process is* rather than what state its socket is in:
of the remaining pids holding the port, those whose `ps -o command=` names `monitor-server.py` —
the filename the wrapper writes, read back via `os.path.basename(__file__)` so it cannot drift —
are prior monitors by construction, in LISTEN or CLOSED alike. This is the shape the record
recommended, and it is a strict superset of the previous kill set that adds only prior instances of
this file. It cannot reach a browser (a browser does not run this script), and it is inert on a host
where a stale monitor does reach LISTEN, because there the first question already found it. So it
is a Pareto improvement rather than a bet on the claim, which is why it was safe to make while the
claim is unresolved. The state-blacklist option the record warns about was not taken.

Verified by execution, 2026-08-16: monitor A serving on a port, a real held client connection in
`CLOSE_WAIT` (the browser-tab stand-in, present in `lsof -ti :PORT` and correctly excluded by the
command match), monitor B started on the same port → A cleared, client survived, B serving 200.
The identity match itself was confirmed against a live monitor's `ps -o command=` output.

Residual, filed rather than buried here: `260816-0110_o_*` — the platform claim still justifies the
harness's loopback pin and the new wildcard case's skip guard, and nobody can settle it on this
machine.
