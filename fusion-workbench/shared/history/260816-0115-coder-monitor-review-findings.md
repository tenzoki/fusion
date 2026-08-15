# Monitor review findings — the fallback's printed address, the port clearing, and the missing bind test

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-16
**Sources:** `shared/issues/260815-2325`, `260815-2326`, `260815-2327` (coderev, against commit `f5ae298`)

## What was asked

Three review findings against `f5ae298`, which had made `bin/monitor` bind dual-stack, narrowed its
port clearing to `-sTCP:LISTEN`, and set line buffering.

## What was done

**1 — the printed address follows the bind (`260815-2325`, closed).** The wildcard branch records
whether `DualStackServer` constructed, and the banner is composed from that: `localhost` only when
both loopback families answer, `127.0.0.1` on the `OSError` fallback and on an explicit loopback
bind, the caller's address otherwise. The bash launcher no longer composes the URL at all — python
publishes it to `$TMPDIR_PATH/monitor-url` right after binding and the launcher reads it, which
also turned the flat pre-launch `sleep 0.5` into a bounded wait on the event that sleep was
estimating. The whole-second fallback for platforms rejecting a fractional `sleep` operand is kept.

**2 — the port clearing (`260815-2326`, closed; residual filed as `260816-0110_o_*`).** Investigated
before touching. The load-bearing claim turned out to have a real measurement behind it
(`260806-0820_c_*`, this machine, 2026-08-06), and it does not reproduce here now — but only
because the precondition is gone: this process tree now holds Local Network permission. So the
claim is unverified at HEAD rather than refuted, and the comment now says that with both dates.
The clearing was rewritten so the question stops mattering: two queries, unioned — the existing
LISTEN query, plus the pids holding the port whose `ps -o command=` names `monitor-server.py`.
That reaches a stale monitor in any socket state, can never reach a browser, and is inert where
the old query already worked, so it is not a bet on the claim.

**3 — the wildcard bind is pinned (`260815-2327`, closed).** New case spawning with `MONITOR_BIND`
deleted, asserting `http://localhost:${port}` answers 200 with the family forced via `net.connect`
+ `autoSelectFamily: false` (Node's happy-eyeballs would otherwise pass against the defect). Guarded
by a probe that binds a dual-stack wildcard from the test process and checks loopback reachability,
so the case runs wherever it can and skips with a reason where the 2026-08-06 state holds. The
`OSError` arm is deliberately left untested rather than reached by fault injection; its property is
pinned on the other IPv4-only path by the updated launched-URL assertion at `:874`.

## Verification

- Manual, macOS 15.7.7 (24G720): all three reachable bind paths print an address that answers 200.
- Manual: stale-monitor clearing with a real held client connection — stale monitor cleared, client
  survived, new monitor serving.
- Mutation-checked both new pins: each fails against the defect it exists for, passes restored.
- `cd hooks && npm test` → exit 1, sole failure `surface-growth-bound.test.ts > matches the
  checked-in golden`, whose first mismatch is `agents/orchestrator.md` (+544 bytes, not this task's
  file). 751/752 passing. The golden is deliberately not regenerated. `npx tsc --noEmit` → exit 0.

## Files changed

- `bin/monitor`
- `hooks/lib/__tests__/monitor-warnings-panel.test.ts` (897 → 1079 lines, **+182**)

## Residual

`shared/issues/260816-0110_o_*` — the macOS Local-Network listener claim is still unverified and
still justifies the harness's loopback pin and the new case's skip guard. Settling it needs a host
with the permission denied; producing one from this machine means revoking it, which is the user's
call.
