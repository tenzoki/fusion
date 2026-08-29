No test exercises the monitor's wildcard bind, and the residual is recorded only in a closed record

---
Everything `f5ae298` added to `bin/monitor` — `DualStackServer`, the `WILDCARD_BINDS` branch and its
`OSError` fallback — sits on the wildcard path. Every spawn in
`hooks/lib/__tests__/monitor-warnings-panel.test.ts` sets `MONITOR_BIND=127.0.0.1`, which takes the
`else` arm and builds the plain `AF_INET` server, and every assertion fetches
`http://127.0.0.1:${port}` by address rather than by name. So the new code path is executed by no
test, and the property it exists to establish — that the name the program prints resolves to a
socket the program is listening on — is asserted nowhere. The executor named this residual in the
source record and then closed the record, so nothing open tracks it.

---
**Severity:** Medium. The fix is correct today (verified by hand, below); what is missing is
anything that keeps it correct.

**Where.**

- `bin/monitor:1273-1282` — the untested branch.
- `hooks/lib/__tests__/monitor-warnings-panel.test.ts:277` — `env: { ...process.env, MONITOR_BIND: "127.0.0.1", ...opts.env }`, on the one spawn helper every case uses.
- `:306`, `:332`, `:339`, `:847`, `:892` — every fetch, all by address.
- `:874` — the one assertion that mentions `localhost`, and it is a string comparison on the URL
  handed to the browser launcher, not a request.

**Why the harness could not have caught the original defect either.** Stated in the closed record
and confirmed here: a spawn pinned to `MONITOR_BIND=127.0.0.1` never reaches the wildcard branch,
and a fetch to a literal address never asks the resolver anything. The family mismatch was invisible
to it by construction, and still is.

**Where the residual currently lives.** `260812-0253_*_the-monitor-is-no-longer-
reachable-on-localhost.md`, final paragraph — inside a record whose marker is `_c_`. A closed
record is not a work item, and no scan for open work will return it. That is the filing reason for
this record: the observation was made correctly and put somewhere it cannot be picked up.

**Verified by hand**, 2026-08-15, macOS 24.6.0, `bin/monitor` at `f4f01b0`, default bind:

```
$ lsof -nP -i :18477
Python  96183  k1  4u  IPv6  ...  TCP *:18477 (LISTEN)
$ curl -s -o /dev/null -w '%{http_code}\n' --ipv4 http://localhost:18477/   # 200
$ curl -s -o /dev/null -w '%{http_code}\n' --ipv6 http://localhost:18477/   # 200
```

Both families answer, at the name. This is exactly the check no test performs.

**Fix direction.** One case, spawning the monitor with **no** `MONITOR_BIND` in the environment and
fetching `http://localhost:${port}/api/dashboard` twice — once forced to IPv4, once to IPv6 — is
enough to pin the property. Three constraints the author will meet:

- `MONITOR_BIND` must be **deleted** from the child environment, not set to a wildcard, or the case
  stops testing the default.
- `bin/monitor:1263-1266` says a non-loopback listener may be parked in `CLOSED` on a macOS host
  without Local Network permission, which is why the harness pins loopback in the first place. If
  that claim holds, a wildcard case is flaky on exactly the developer machines it matters on. It is
  under investigation in the sibling record `260815-2326_*_the-monitors-listen-only-port-clearing-
  cannot-see-the-stale-listener-the-same-file-documents-on-macos.md`, and this case should not be
  written until that question is answered — the answer decides whether the case is possible at all.
- Node's `fetch` does its own happy-eyeballs, so a request to `localhost` succeeds against an
  IPv4-only server too. The assertion has to force the family (`net.connect` on `::1`, or an
  `undici` Agent pinned to a family), or it will pass against the very defect it is written for.

**The fallback arm needs its own case or an explicit written-down decision not to have one.** It
cannot be reached on a host that supports v4-mapped sockets, so pinning it means faking the failure
— which is doable (a monkey-patched `setsockopt`) and may not be worth it. Say which, rather than
leaving the arm untested by omission.

**Found by:** coderev, review of `d33cd22..f4f01b0`, commit `f5ae298`.

---
Resolved: the wildcard bind is pinned, and the case is not vacuous (coder, 2026-08-16).

**The case.** `monitor-warnings-panel.test.ts`, new describe block `bin/monitor — the default
wildcard bind`: one case that spawns the monitor with `MONITOR_BIND` **deleted** from the child
environment and asserts `http://localhost:${port}/api/dashboard` answers `HTTP/1.x 200` with the
address family forced, once to 4 and once to 6.

All three of the record's constraints are met, and each in the way it asked for:

- *Deleted, not set to a wildcard.* `MonitorOpts` gained `bind?: string | null`; `null` deletes the
  variable, so what runs is the address the program picks when nobody picked one. The harness's
  `MONITOR_BIND=127.0.0.1` pin stays for every other case — a case whose subject is the panel
  should not be able to fail for the host's privacy configuration.
- *The family is forced.* `fetch` cannot express this — Node does happy-eyeballs and would pass
  against the very defect the case exists for. The case uses `net.connect` with an explicit
  `family` **and** `autoSelectFamily: false`, writes a raw HTTP/1.0 request and reads the status
  line. `autoSelectFamily` alone would have re-introduced the retry.
- *The `:1264` question is answered as far as it can be, and the case is guarded rather than
  flaky.* See the sibling record `260815-2326_c_*`: the claim does not reproduce on this host and
  its precondition is absent, so it is unverified rather than refuted. The case therefore runs
  behind a probe that binds a dual-stack wildcard from the test process itself and checks loopback
  reachability on both families. Where the claim does not hold — this machine, measured — the probe
  passes and the case runs with no excuse available to it. Where it does hold, or where a CI host
  has no IPv6 loopback at all, the case skips and prints the reason. Node and the monitor's python3
  share a responsible app, so they share the permission the probe is standing in for.

**Not vacuous — mutation-checked.** With `IPV6_V6ONLY` replaced by an invalid option number and the
banner forced back to the constant `localhost` — the exact original defect — the case fails with
`connect ECONNREFUSED ::1:PORT`. Restored, it passes. The suite is 16/16.

**The fallback arm: the explicit decision the record asked for, and it is not to test it.** The
`OSError` arm cannot be reached on a host that supports v4-mapped sockets, so pinning it means
faking a kernel failure, and the only seams for that are a monkey-patched `setsockopt` or a
test-only environment knob in production code. Both put a fault-injection surface into `bin/monitor`
to pin one `except` branch. What the arm actually has to get right is not "does it bind" — the
record verified that by hand — but "does the printed address follow it", and that property is now
pinned on the other IPv4-only path the program can take without faking anything:
`monitor-warnings-panel.test.ts:874` asserts the launched URL is `http://127.0.0.1:${port}` for the
loopback-pinned server, and fails if the wrapper goes back to composing a constant. The two cases
together cover the property on both reachable paths; the unreachable arm shares the `local_host`
expression with the path that is covered.

Line delta for the golden: `monitor-warnings-panel.test.ts` 897 → 1079, **+182 lines**. Well inside
the hook-tests head-room (`holds hook-tests inside its own head-room of 2500 lines` passes). The
golden fixture is deliberately **not** regenerated here.
