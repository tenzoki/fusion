# The pty case in the monitor suite has no path for a machine that cannot allocate one

---

`hooks/lib/__tests__/monitor-warnings-panel.test.ts` drives the interactive browser-launch
case through a `python3` pseudo-terminal wrapper. `os.openpty()` is called unguarded, and
the spawn has no `error` listener. Where a pty cannot be allocated, the case does not skip
and does not report the pty — it times out after 15 seconds with `monitor did not come up`,
naming the component that is fine.

---

## Evidence

`hooks/lib/__tests__/monitor-warnings-panel.test.ts`, `PTY_RUNNER`:

```python
master, slave = os.openpty()
proc = subprocess.Popen(sys.argv[1:], stdin=slave, stdout=slave, stderr=slave,
                        close_fds=True)
```

`startMonitor` spawns it and polls, with no listener on the child's `error` event:

```ts
  const proc = spawn(cmd, args, { stdio: "ignore", detached: true, env: {...} });
  running.push(proc);
  const deadline = Date.now() + 15000;
  for (;;) {
    try { const r = await fetch(...); if (r.ok) return port; } catch { }
    if (Date.now() > deadline) throw new Error("monitor did not come up");
    await new Promise((r) => setTimeout(r, 100));
  }
```

Two failure modes follow, and neither names its cause:

- **No `/dev/ptmx`** (a container, a locked-down sandbox): `os.openpty()` raises `OSError`,
  python3 exits non-zero, the monitor is never started, and the poll throws
  `monitor did not come up` after 15 s. Two of the three new cases use `tty: true`, so the
  suite reports two monitor failures for one pty failure.
- **No `python3` on `PATH`**: `spawn` emits `error` (ENOENT) with no listener attached, which
  Node re-raises as an uncaught exception. In vitest that surfaces as an unhandled error
  rather than as a failing assertion.

## What is *not* wrong here

I checked the two things the dispatch asked about and both hold:

- **The fake-`open` shim cannot leak.** `fakeOpen()` writes into a fresh `mkdtemp` directory
  and `pathWith(dir)` is passed only through `opts.env` into the spawned child. The test
  runner's own `process.env.PATH` is never mutated, so no other case in the file or the
  suite can reach the shim.
- **The process group is cleaned up.** `spawn(..., detached: true)` makes the python runner
  the group leader and `bin/monitor` plus its python server inherit that group, so the
  existing `afterEach` `process.kill(-p.pid, "SIGTERM")` reaches all three.

The `python3` dependency itself is not the finding either — `bin/monitor` is a python
heredoc, so a machine without python3 fails the whole monitor suite already, exactly as the
test's own comment says.

## Severity

Low. fusion has no CI, the suite is green on the development machine, and the affected
cases are new rather than regressed. It is a diagnosability cost, paid by whoever first
runs this suite somewhere a pty is not available.

## Scope

`hooks/lib/__tests__/monitor-warnings-panel.test.ts` only. No shipped code.

## Recommendation

Probe once before the tty cases — run `python3 -c "import os; os.openpty()"` and skip the
two `tty: true` cases with a named reason when it fails — or, at minimum, have
`startMonitor` attach an `error` listener and include the child's exit status in the
timeout message, so a pty failure reads as a pty failure.

## Cross-references

- `fusion-workbench/shared/issues/260810-1557_c_bin-monitor-opens-a-browser-tab-on-every-non-interactive-spawn-and-the-test-suite-spawns-it-eleven-times.md` — the defect these cases were written for
- `fusion-workbench/shared/issues/260810-1558_o_a-missing-open-command-exits-the-monitor-wrapper-under-set-e-and-orphans-the-server-it-forked.md` — the still-open residual on the same gate
- Filed by `coderev`, review `shared/reviews/260810-1632-coderev-turn-1-range-430d73a-to-head.md`

---
Resolved — `hooks/lib/__tests__/monitor-warnings-panel.test.ts`, session `260811-1315`.

**A pty failure now reads as a pty failure, and it fails rather than skips.** `ptyAvailable()`
probes once with the same interpreter and the same `os.openpty()` call `PTY_RUNNER` makes, memoised
for the run. `startMonitor` consults it before the `tty: true` spawn and throws
`this case needs a pseudo-terminal and this machine cannot allocate one: <reason>. bin/monitor is
not implicated: it is never started.` The reason distinguishes three causes: python3 not runnable
(the `spawnSync` error), python3 killed by a signal, and `os.openpty()` raising (the last stderr
line, so the `OSError` reaches the report).

**Why a failure and not a skip**, recorded in the probe's own docstring so the next reader meets it
where the branch is: the two `tty: true` cases are the only executable coverage of the
browser-launch gate, fusion has no CI, and under vitest 2.1 a programmatic `ctx.skip()` carries no
reason into the summary at all (the note argument arrives in vitest 3.1). A green run on a machine
that never exercised the gate claims coverage it does not have, which is the failure mode
`shared/issues/260810-2149_o_a-coverage-floor-cannot-see-coverage-leave-and-the-approved-baseline-pin-is-the-general-answer.md`
is open about. The cost is one red case in a pty-less container, with the cause in the first line
of the message.

**The case cannot vanish where the pty works.** The probe fails only on those three conditions;
every other way of not coming up still reaches the poll and fails there. On this machine both
`tty: true` cases ran and passed — `cd hooks && npm test` → exit 0, 1246 tests, the count unchanged
from HEAD `619dfb7`.

**The second failure mode is closed too.** `startMonitor` now attaches `error` and `exit` listeners,
so a child that never execs is reported as this case failing instead of as an unhandled vitest
error, and an exit before the first answer is reported immediately with its status rather than
after the 15-second deadline. The timeout message now names the port and says the process is still
running, so "monitor did not come up" is no longer the only thing a reader gets.

**Measured, both branches** (neither is reachable on this machine, so each was provoked):
python3 removed from `PATH` → `python3 could not be run: spawnSync python3 ENOENT`, in 13 ms;
a `python3` shim exiting non-zero with an `OSError` traceback →
`os.openpty() failed: OSError: [Errno 2] No such file or directory: '/dev/ptmx'`.
