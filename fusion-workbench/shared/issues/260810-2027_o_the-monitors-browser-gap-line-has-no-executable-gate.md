The monitor's browser-gap line has no executable gate

---

`bin/monitor` now prints one stderr line when the interactive user gets no browser tab, on both
paths: `no <launcher> on PATH` when `command -v` fails, and `<launcher> could not open a browser`
when the launcher exits non-zero. Nothing asserts either line.

`hooks/lib/__tests__/monitor-warnings-panel.test.ts` already has everything the assertion needs —
`startMonitor({ tty: true })` with the pty runner, a `fakeOpen()` shim first on `PATH`, and the
`pathWith()` helper. Two cases are missing beside the three that exist: a shim `open` that exits
non-zero, and a `PATH` whose launcher is absent (a `uname` shim printing `Linux` picks `xdg-open`,
which the test machine does not have — that is how the fix was measured by hand). Both would have
to read the monitor's stderr, which `startMonitor` currently discards (`stdio: "ignore"`).

---

**Why it is not just missing coverage.** The line is the only thing standing between a user with no
launcher and reading the silence as "the monitor did not start" (`260810-1918_c_the-monitor-launcher-
goes-silent-…`). A prompt-level obligation with no gate is exactly the asymmetry the Turn-1 review
names in its cross-cutting notes: the domain cascade got a runnable gate, the commit sequence, the
staging rule and the browser launcher did not, so a regression in any of the three is caught only by
review.

**Why it was not fixed in the same commit.** The test file belongs to queued task
`I:260810-1632-pty-case` this session (`260810-1632_o_the-pty-case-in-the-monitor-suite-has-no-path-
for-a-machine-that-cannot-allocate-one.md`), which reworks `PTY_RUNNER` and `startMonitor` — the two
places these cases would hook into. Landing both at once would have collided.

**Cross-references.** `260810-1918_c_the-monitor-launcher-goes-silent-where-the-same-session-
established-naming-the-gap.md` (the behaviour this would gate),
`260810-1632_o_the-pty-case-in-the-monitor-suite-…` (owns the file), history
`shared/history/260810-2026-coder-monitor-sleep-and-launcher-gap.md`.

**Filed by:** coder, session `260810-1646`, Turn 2, task `R:260810-1918-monitor-residuals`.
