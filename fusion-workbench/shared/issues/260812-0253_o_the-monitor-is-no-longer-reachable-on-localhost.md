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
