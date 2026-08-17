bin/monitor opens a browser tab on every non-interactive spawn, and the test suite spawns it eleven times

---

`bin/monitor` ended with an unconditional browser launch:

```
sleep 0.5
open "http://localhost:${PORT}"
wait $SERVER_PID
```

Nothing asked whether a human was there to receive the tab. Every caller got one,
including every automated one.

`hooks/lib/__tests__/monitor-warnings-panel.test.ts` spawns the real `bin/monitor` as a
subprocess to drive the served dashboard over HTTP: 11 spawn sites across 9 test cases,
each on a fresh random free port, each with `stdio: "ignore"` and `detached: true`, and
each killed in the suite's `afterEach` seconds later. So one full `cd hooks && npm test`
run opened about eleven browser tabs, every one of them on a port whose server was gone
by the time the tab rendered, every one of them showing a connection error, and every one
of them stealing focus as it arrived.

The suite was run repeatedly on 260810, at one point by five agents in parallel. The
result was hundreds of dead-port tabs and a machine close to unusable. Six monitor
processes (three `bin/monitor` bash wrappers, three `monitor-server.py` children) were
still alive and were killed by hand before this was dispatched.

---

**Where it was, and where it was not.** The flood was first reported against the
consuming project `/Users/k1/Projects/productive/krk`, and it did not come from there.
Every surviving process named `/Users/k1/Projects/productive/fusion/bin/monitor`, and the
varying ports are this harness's random free ports; a consuming project's monitor runs on
one fixed port. The browser is global, so the tabs surfaced wherever the user happened to
be working. `krk` holds only a copied `fusion-workbench/monitor` and no test suite at all.
The symptom's location is not evidence of its origin when the surface is machine-wide.

**Why the fix is not "the test sets an opt-out".** That leaves the hazard standing for
every other non-interactive caller — a CI job, a background job, `nohup`, the next test
somebody writes — and is the additive shape `rules/critical-stance.md` §2 names: the patch
that makes today's instance behave while the class survives. The gate has to be something
true of every non-interactive caller without any of them opting in.

**Filed by** coder, session 260810-1402, at the same time as the fix. No record existed
when the work started; the orchestrator dispatched the fix out of order at the user's
request, and this record is written so one exists before the fix is committed.

---
Resolved: `bin/monitor` now gates the launch on two independent conditions, and only
opens when both hold: stdout is a terminal (`[ -t 1 ]`), and `MONITOR_NO_BROWSER` is
empty or unset. The `[ -t 1 ]` gate is what closes the class — every non-interactive
caller is silent by construction, with no caller change anywhere, because a spawn with
stdio ignored, piped or redirected has no terminal on stdout and a person at a terminal
does. `MONITOR_NO_BROWSER` is the separate opt-out for the person who wants the server
without the tab; any non-empty value suppresses. Both are documented in the script's
usage block beside the existing `MONITOR_BIND` lines, together with the statement that
the tab only ever opens on a terminal.

The harness was deliberately **not** changed to set the opt-out. Doing that would have
left the hazard for every other non-interactive caller.

Pinned by three behaviour cases in
`hooks/lib/__tests__/monitor-warnings-panel.test.ts` (`bin/monitor — the browser
launch`), not by a text match on the script: a fake `open` is placed first on `PATH` and
appends its argv to a marker file, so "a tab was opened" is a file that exists. The cases
are (1) a spawn with no terminal opens nothing and the dashboard still answers, (2) a
spawn **with** a terminal still gets the tab, so a gate that is merely too tight fails
here, and (3) `MONITOR_NO_BROWSER` suppresses the launch on a terminal too. The
interactive cases get their terminal from a small `python3` pty wrapper in the same file;
python3 is already a hard requirement of `bin/monitor`, so no dependency was added.

Verified: `cd hooks && npm test` — exit 0, 40 files, 1072 tests. Run with a fake `open`
first on `PATH` for the whole suite: the marker file was never created, so a full run
opens **zero** tabs, observed rather than inferred.

One residual was found and left standing, filed as
`260810-1558_o_a-missing-open-command-exits-the-monitor-wrapper-under-set-e-…`: under
`set -euo pipefail` a missing `open` exits the wrapper before `wait $SERVER_PID` and
orphans the server. Pre-existing; the new gate narrows its reach to the interactive case.
