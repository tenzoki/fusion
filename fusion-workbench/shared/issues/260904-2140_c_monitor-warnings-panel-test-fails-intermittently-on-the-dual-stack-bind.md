`monitor-warnings-panel.test.ts` fails intermittently on the dual-stack bind
---
One observed failure with `connect ECONNREFUSED ::1:<port>` in the dual-stack bind case, followed by four passes: three isolated runs and one full-suite run. A gate that fails on load rather than on the code under test costs a session a diagnosis every time it fires.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence, and the honest limit on it.** The observation is the coder's, made while implementing step 7 of the active Circle, and reported with the limit attached: five observations, called flaky rather than proven. The diff that was in the tree at the time touches nothing in the bind path. Nothing here establishes a rate, and nothing has looked at the bind code.

**Why it is worth a record rather than a shrug.** `npm test` is a release gate in this repository, and a suite that fails on a race gives a session a red result it has to spend a diagnosis on before it can tell the flake from a real regression. Today it cost one, and today's suite was already red for two other reasons, which is exactly the condition under which an intermittent failure gets absorbed into the noise and stops being noticed.

**Acceptance.** Either the bind path is made deterministic, so the test cannot fail on which stack answers first, or the record says why the race is acceptable and what a session should do when it sees this failure. A rate is measured before either, over a run count the record names.

---
Reconciled 260905-2015 (reconciler, HEAD `5b84b13a`): still open, and nothing has looked at it.

`git log -- hooks/lib/__tests__/monitor-warnings-panel.test.ts` names three commits, the most recent
`90c309ce` on 2026-08-27, eight days before this record was filed. So no edit has touched the file
since the observation, and the bind path has not been read.

No rate has been measured. The record's acceptance asks for one "over a run count the record names"
before either branch, and the only figure on disk is still the coder's five observations.

One datum this pass can add without claiming a rate: `cd hooks && npm test` at HEAD ran green in a
single full-suite run, 50 files and 864 tests. That is a sixth observation on the passing side and
nothing more.

---
Resolved: d2323105 — the fault was the test assumption and not the bind, established by measurement rather than by reading. The monitor builds a dual-stack socket, falls back to IPv4 on error, and reports the URL it actually bound; the harness bound port zero, read the number, released it, and then asserted on that number without reading what the monitor said. The port stays unreserved for the whole case, so a second suite hands the same number to its own monitor, which takes the port over through the monitor documented takeover step and kills the first. That was reproduced directly: after the takeover the port answers over IPv4 and refuses IPv6, which is the recorded failure exactly. The monitor now lets a caller name the file it publishes its bound URL to, accepts port zero without the takeover step, and re-reads the port after binding; every case starts on port zero and reads the answer back rather than predicting it. The record acceptance asked for a measured rate first, and it was taken under the isolation record own protocol: ten pairs of concurrent full-suite runs, 0 red of 20 for this file, while three other files failed inside a single one of those pairs. That is what makes the zero evidence rather than a quiet afternoon. Not covered: the pre-repair rate under the same protocol was not measured, because restoring the old harness would have meant a second copy of a large file inside a bounded surface; the before side rests on the record own observation plus the direct takeover measurement. Also named and not repaired: a skill body cites a line range in the monitor that was already wrong before this edit and is now further out.

---
Reconciled 260906-0335 (reconciler, HEAD `b462d55d`): the closure note holds, verified against the
code rather than through the note's own citation, and the "not covered" clause is honest.

Verified. `bin/monitor` accepts port 0 and skips the takeover step behind an explicit `if PORT != 0`
guard, with the measurement that justifies it in the comment above it; `MONITOR_URL_FILE` lets a
caller name the file the server publishes its bound URL to. In the harness, `startMonitor()` passes
the literal `"0"` as the port for every case and reads the URL back through `readBound(urlFile)`, so
the file predicts no port anywhere — its own header states that as a property and the code keeps it.

The "not covered" clause is honest and not decorative. It names a measurement that was **not** taken
(the pre-repair rate under the same ten-pair protocol) and says what the before side rests on
instead. That is a real limit: the 0-of-20 figure is evidence about the repaired harness only, and
the note does not let it stand in for a controlled before-and-after.

The clause's second half is also true and is **larger than the clause says**. It names one stale
line-range citation in a skill body. `skills/setup/SKILL.md:86` cites two ranges for where the
root-anchored surfaces are read, and **both** are wrong at HEAD: `bin/monitor:72-75` is the
workbench-directory default block (the reads are at `:142-144`, moved from `:122` by this repair),
and `hooks/tracker.ts:33-36` is comment prose, moved further out by `b462d55d`. Both were already
wrong before their respective commits, so neither is this session's fault; what this session did was
widen them. No gate sees either: `reference-resolution-lint` resolves paths and heading anchors, not
line numbers. The class is measured and filed as
`260906-0335_*_nine-of-twelve-line-number-citations-in-shipped-text-name-the-wrong-line-and-no-gate-resolves-one.md`.
