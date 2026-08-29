The macOS Local-Network listener claim is unverified at HEAD and still justifies a harness constraint

---
`bin/monitor`'s MONITOR_BIND comment states that macOS parks a non-loopback listener of a process
without Local Network permission in CLOSED, never LISTEN, dropping inbound SYNs even from
127.0.0.1. It was measured on this development machine on 2026-08-06 and could not be re-measured
on 2026-08-16, because the precondition is gone: this process tree now holds the permission. The
claim is therefore neither confirmed nor refuted, and it still decides two things — the monitor
test harness's `MONITOR_BIND=127.0.0.1` pin, and the skip guard on the new wildcard-bind case.

---
**Severity:** Low. Nothing is broken by the uncertainty; two constraints are simply held on faith,
and one of them (the pin) makes a whole class of bind defect invisible to every case that carries it.

**Evidence, both directions.**

- *For:* `circles/260805-2005-textschicht-gegen-code-nachziehen/issues/260806-0820_c_*` records the
  measurement — nine red tests, `0.0.0.0` and an explicit LAN-IP bind both in CLOSED, `127.0.0.1`
  exempt. That record labels the CLOSED/LISTEN dichotomy measured and the TCC attribution inferred.
- *Against, but inconclusive:* measured 2026-08-16 on macOS 15.7.7 (24G720), all four bind
  spellings (`0.0.0.0`, `::`, the en0 LAN address, `127.0.0.1`) reach LISTEN and answer. The
  precondition is absent — an outbound TCP connect to the LAN gateway succeeds, which a denied
  process cannot do — so this measures a different host configuration, not the claim.
- Reading the permission state directly is not available: both TCC databases return
  `authorization denied`.

**What would settle it.** A macOS 15+ host whose shell's responsible app is **denied** Local Network
permission: bind `0.0.0.0` and `::`, read `lsof -nP -i :PORT`, and try `curl http://127.0.0.1:PORT`.
Two outcomes, both worth having. If CLOSED reproduces, the pin and the skip guard are earned and
should say so with a second date. If it does not, the claim can be deleted from `bin/monitor`, the
harness pin can be dropped, and every case in the monitor suite can run against the default bind
rather than one case behind a probe.

Producing that host from this one means revoking the permission (`tccutil reset`, or
Settings → Privacy & Security → Local Network). That is a change to the user's system
configuration and is the user's call to make, not an agent's — which is why this is filed rather
than done.

**Where it currently bites.**

- `bin/monitor` — the MONITOR_BIND comment, which now states the evidence status explicitly.
- `hooks/lib/__tests__/monitor-warnings-panel.test.ts` — `startMonitor`'s pin, and
  `wildcardLoopbackUsable()`, the probe guarding the one case that reaches the default bind.
- No longer the port-clearing step: that was rewritten on 2026-08-16 to identify a stale monitor by
  what it is running rather than by socket state, specifically so it would not depend on this.

**Filed by:** coder, closing `shared/issues/260815-2326_c_*`, which asked for exactly this question
to be answered and could not be closed on an answer nobody can produce here. Filed as its own open
record rather than as a paragraph in a closed one — the mistake `260815-2327_c_*` was filed about.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `bin/monitor:1372-1387` still carries the unverified claim, the harness pin `MONITOR_BIND: "127.0.0.1"` is live at `hooks/lib/__tests__/monitor-warnings-panel.test.ts:290`, and `wildcardLoopbackUsable()` still guards the wildcard bind. Marker stays open. Log: `260817-1836-reconciliation.md`.

---
Resolved: unfixable — settling it needs a macOS host whose shell is denied Local Network permission, a change to the user's system that no agent makes; the measurement command stands in `## What would settle it` above.
