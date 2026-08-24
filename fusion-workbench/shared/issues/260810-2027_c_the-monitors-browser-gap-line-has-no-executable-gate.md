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

**Why it was not fixed in the same commit.** The test file belongs to the queued pty-case task of
this session (`260810-1632_*_the-pty-case-in-the-monitor-suite-has-no-path-
for-a-machine-that-cannot-allocate-one.md`), which reworks `PTY_RUNNER` and `startMonitor` — the two
places these cases would hook into. Landing both at once would have collided.

**Cross-references.** `260810-1918_c_the-monitor-launcher-goes-silent-where-the-same-session-
established-naming-the-gap.md` (the behaviour this would gate),
`260810-1632_*_the-pty-case-in-the-monitor-suite-…` (owns the file), history
`shared/history/260810-2026-coder-monitor-sleep-and-launcher-gap.md`.

**Filed by:** coder, session `260810-1646`, Turn 2, on the monitor-residuals review task.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `bin/monitor:1572` and `:1574` still print both browser-gap lines to stderr, and the test harness still starts the monitor with stderr discarded (`hooks/lib/__tests__/monitor-warnings-panel.test.ts:296`, `stdio: "ignore"`), so neither line can be asserted. Only the three pre-existing cases the record names are present; no case for a non-zero-exit launcher shim or an absent launcher was added. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
Resolved: fixed — two cases in `hooks/lib/__tests__/monitor-warnings-panel.test.ts` read the monitor's stderr through the pty runner (stderr no longer on the pty; `stderr: true` pipes it into `lastStderr`) and assert the browser-gap line for a launcher exiting non-zero and for no `xdg-open` on PATH, each shown failing with the `echo` deleted from `bin/monitor`; paid by three comment-prose cuts in the same file; `cd hooks && npx vitest run lib/__tests__/monitor-warnings-panel.test.ts`
