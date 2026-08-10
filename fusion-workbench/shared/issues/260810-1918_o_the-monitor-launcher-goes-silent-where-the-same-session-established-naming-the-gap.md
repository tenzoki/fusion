The monitor launcher goes silent where the same session established that an unavailable capability is named

---

`bin/monitor:1244-1246` collapses two different outcomes into no output at all:

- the chosen launcher is absent (`command -v` fails) — the `if` body is skipped, nothing is printed;
- the launcher exists and fails (no display, no registered handler, a browser that refuses to
  start) — `|| true` swallows the status, and the launcher's own stderr may or may not say anything.

A person at a terminal who was promised a tab and got none has no way to tell those apart, or from
"the server did not start". The comment at `:1234` says the absent-launcher case behaves "exactly as
under `MONITOR_NO_BROWSER`" — but `MONITOR_NO_BROWSER` is a choice the user made, and this is not.

The same range settles the opposite convention twice, on the same class of problem:

- `skills/setup/SKILL.md:251` and `skills/next/SKILL.md:112` print `queue-check: UNAVAILABLE` with
  the reason and the remedy rather than skipping in silence, and `skills/setup/SKILL.md:247` states
  why: *"the step is skipped in silence — the file is found, the branches are not."*
- `agents/orchestrator.md:126` and `:142` apply it to the two `bin/` helpers: on the absent branch
  "one line naming which of the reasons applies" goes to stderr, because "report a ranking you did
  not take and it reads as a project with no churn".

`bin/monitor` is the third instance of that shape and is the one left silent.

---

**Failure scenario.** A user runs `./fusion-workbench/monitor F03 8088` on a Linux box with no
`xdg-open` installed. The dashboard is served correctly on port 8088 and the terminal says nothing
about a browser at all. The user reads the silence as "the monitor did not start", kills it, and
retries — or worse, starts a second one on another port. Nothing anywhere names the one-line cause.

**Fix.** One stderr line on each of the two paths, in the shape the orchestrator prompt already uses:
`monitor: no <launcher> on PATH — serving on http://localhost:$PORT, open it yourself` when
`command -v` fails, and the same with "…could not open a browser" replacing `|| true`'s silence.
Keep both non-fatal.

**Cross-references.** `260810-1918_o_sleep-0-5-is-the-remaining-command…` (same block, different
defect). `HYG-NO-SILENT-FAIL`.

**Filed by:** coderev, review of session `260810-1646` Turn 1, range `5ef92eb..940d522`.
