# The monitor suite reads the bind's own answer instead of predicting a port

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7

## What was asked

Repair the defect in the monitor suite's test-time port handling recorded as
`260904-2140_*_monitor-warnings-panel-test-fails-intermittently-on-the-dual-stack-bind.md`,
under the two later records that supplied the rate and the mechanism:
`260905-2356_*_the-hook-suite-is-not-isolated-from-a-second-copy-of-itself-and-fails-at-forty-percent-under-one.md`
and `260906-0026-what-shared-state-the-hook-suite-reaches.md`, whose change 3
names the remedy and points at the specification in
`260905-2158-the-nine-open-defects-after-loop-1-and-what-loop-2-should-do.md`
entry 8. Say whether the fault is in the bind or in the test's assumption, and
verify by measuring rather than by asserting.

## Where the fault is: the test's assumption, and the bind is sound

The bind is correct and was never implicated. `bin/monitor` builds a dual-stack
`::` socket for the wildcard and falls back to IPv4 on `OSError`; the spelling
of the URL it prints and publishes follows that socket, so it names `localhost`
only where both loopback families answer and `127.0.0.1` where they do not. A
program that says what it bound cannot be the party that lied about the bind.

The harness predicted both halves. It took a port by binding `127.0.0.1:0`,
reading the number and releasing it, then asserted that `localhost` answers at
that number over both families, without ever reading what the monitor said it
had bound. Its own header called the release-to-bind gap "microseconds" and
treated that as the whole exposure. It is not the exposure. An ephemeral port
handed back to us is unreserved for as long as the case runs, and the kernel
recycles the range, so a second copy of the suite can hand the same number to
its own monitor while ours is still serving on it. What happens then is not a
lost bind.

**Measured on this machine, 2026-09-06, and this is the mechanism:** monitor A
was started on the dual-stack wildcard and answered HTTP 200 on both `127.0.0.1`
and `::1`; monitor B was then started on A's port with the harness's own
`MONITOR_BIND=127.0.0.1` pin. B's takeover step SIGTERMed A. That is documented
behaviour, stated in the monitor's own usage text, and right for a monitor a
person starts. The port then answered 200 over IPv4, from B, and refused `::1`.
That is exactly the recorded symptom: an IPv4 readiness poll that passes,
followed by `connect ECONNREFUSED ::1:<port>` from the assertion.

Two things this rules out. The bind-conflict route was probed directly and does
not occur here: with a stranger holding `127.0.0.1:P`, `0.0.0.0:P` or
`127.0.0.1:P` with no `SO_REUSEPORT`, the `::` bind succeeds every time, and the
only holder that defeats it (`::` with `IPV6_V6ONLY=0`) defeats the IPv4
fallback too, so the fallback arm the record's inference reached for is not
reachable by port contention on this host. The raised timeout that landed
separately this session accounts for none of it either, and no deadline was
added here.

## What changed

`bin/monitor`, three changes, each stated at its site:

- `MONITOR_URL_FILE` names the file the server publishes its bound URL to. The
  default still lives in the wrapper's own scratch directory, which the wrapper
  deletes; a caller that spawns the monitor and then has to reach it had no
  channel to the bind's answer at all, which is why the harness was predicting.
- Port `0` is legal: the takeover step is skipped, since there is no stranger on
  a number the kernel has not handed out, and after the bind `PORT` is re-read
  off the socket, so the banner, the LAN line and the published URL all name the
  port that is true rather than the one that was requested.
- The launcher block reads that published URL before checking for a launcher
  rather than inside the found branch. The no-launcher gap message is the one
  line written for a person to act on by hand, and it was naming the composed
  constant: a family an IPv4-only server does not answer on, and, once 0 became
  legal, a port nothing is on.

`hooks/lib/__tests__/monitor-warnings-panel.test.ts`:

- `freePort()` is gone. Every case starts the monitor on port 0 with a
  `MONITOR_URL_FILE` of its own and reads back `{ url, host, port }`.
- The readiness loop waits on two of the server's own events in order, first
  that it published a URL and then that it answers at that URL, instead of
  polling a composed address.
- The dual-stack case asserts on the published host first, with the failure
  message saying that the program took its IPv4 fallback arm on a host whose
  dual-stack wildcard the case's own probe had just bound and reached. Then it
  forces each family at the published port.
- The browser-launch case that pins the launched URL now compares against the
  publication rather than a composed string, and separately pins that the
  harness's bind pin produced an IPv4-only socket.
- The no-launcher gap assertion moves from `localhost` to `127.0.0.1`, which is
  the wrapper change above.

## Verification

`cd hooks && npm test` at `ea17e354` with these two files modified: **exit 1**.
One file fails, `surface-growth-bound.test.ts`, on the checked-in golden, and it
is left alone deliberately: the golden already mismatched before this edit
(`agents/orchestrator.md` under a sibling coder's dispatch) and this edit adds
its own mismatch by taking the test file from 1153 to 1234 lines. The bound
itself is not crossed: 1991 of 2500 head-room lines remain. No baseline and no
golden entry was touched.

The reported diff names only `agents/orchestrator.md`, and that is the
assertion's shape rather than the whole difference: the comparison walks the
surfaces in order and throws on the first mismatch, so the hook-tests block this
edit moves by 81 lines is never reached and never printed.

`npx vitest run lib/__tests__/monitor-warnings-panel.test.ts`: 21 of 21 pass,
exit 0.

## The concurrent measurement

The acceptance protocol the isolation record names, run at `ea17e354`: ten pairs
of concurrent full-suite runs, twenty runs, counting red.

| file | red | total |
|---|---|---|
| `monitor-warnings-panel.test.ts` | 0 | 20 |
| `surface-growth-bound.test.ts` | 20 | 20 |
| `review-coverage.test.ts` | 3 | 20 |
| `fusion-commit-lock.test.ts` | 2 | 20 |
| `staging-drift.test.ts` | 1 | 20 |

The last three rows are what makes the first row evidence rather than a quiet
run. Every one of them is in the isolation record's own affected set, none of
them is in this repair's scope, and all six of their failures landed inside a
single pair, pair 6, whose two halves failed three and four files. So the
concurrent condition was demonstrably live during the measurement, and this file
stayed green through it. Machine load reached 15.6 on 16 cores during the run
and was 1.55 before it started.

`surface-growth-bound` is the golden mismatch above and is not a concurrency
result; it fails identically in a quiet run.

**What was running while this was measured.** Two full suites at a time and
nothing else of mine. A sibling coder was editing `agents/orchestrator.md`,
`hooks/lib/__tests__/commit-message-path.test.ts`, `hooks/lib/staging-drift.ts`
and `hooks/lib/__tests__/staging-drift.test.ts` in this same tree; every one of
those writes landed between 01:10 and 01:17 and the run window was 01:25 to
01:41, so the tree was constant across all twenty runs. Their edits are why
`hooks/dist/` shows as modified and are not this repair's. Two idle Claude
sessions and a terminal were open, as in the analysis this repair follows.

**What was not measured.** The pre-repair rate under this same protocol. The
old harness was not restored to run against, because doing so would have meant
putting a second copy of a 1150-line test file into the bounded surface. The
before side rests on the record's own observation and on the direct kill
measurement above, which is a mechanism rather than a rate.

**What 0 of 20 certifies.** A rate below roughly five percent on this machine
under this load, which is the honest reading the analysis attaches to the
acceptance. It does not certify zero. What it does certify by construction is
narrower and stronger than a rate: no case in this file now names an address or
a port that anything else could be holding, so the mechanism measured above has
no remaining entrance into it.

## One observation, filed as an observation and not repaired

`skills/setup/SKILL.md` cites `bin/monitor:72-75` as the site of the
root-anchored path reads. Those reads were at lines 122 to 125 before this edit
and are at 129 to 132 after it, so the line range was already wrong at HEAD and
this change does not make it newly so. It is outside this dispatch's file scope
and inside a bounded surface, so it is named here rather than corrected.

`fusion-workbench/monitor` is a copy of `bin/monitor` and was byte-identical to
it at HEAD. It is now one edit behind; `/fusion:setup` refreshes it.
