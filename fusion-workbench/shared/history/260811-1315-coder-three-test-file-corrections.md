# coder — three low-priority corrections in three test files

**Status:** Complete
**Session:** `260811-1315-coder-three-test-file-corrections.md`
**Agent:** coder
**Tasks:** 24 (`I:260810-1632-pty-case`), 32 (`I:260810-2110-licence-counts`),
37 (`I:260802-1255-header-window`) — disjoint file sets, three independent fixes.

---

## Verification

`cd hooks && npm test` → **exit 0**, 48 files, 1246 tests. Same count as HEAD `619dfb7`.
Task 24 can move that count on a machine without a pseudo-terminal; on this one the pty works,
both `tty: true` cases ran, and the count is unchanged.

Two branches of the task-24 fix are unreachable on this machine, so each was provoked rather than
claimed:

- `python3` absent from `PATH` (a directory holding only a `node` symlink):
  `this case needs a pseudo-terminal and this machine cannot allocate one: python3 could not be
  run: spawnSync python3 ENOENT.` — reported in 13 ms instead of after the 15-second poll.
- a `python3` shim exiting non-zero with an `OSError` traceback:
  `… os.openpty() failed: OSError: [Errno 2] No such file or directory: '/dev/ptmx'.`

## Task 24 — a pty failure reads as a pty failure

`hooks/lib/__tests__/monitor-warnings-panel.test.ts`. `ptyAvailable()` probes once with the same
interpreter and the same `os.openpty()` call `PTY_RUNNER` makes, memoised; `startMonitor` consults
it before a `tty: true` spawn and throws with the cause named and `bin/monitor` explicitly cleared.
`startMonitor` also attaches `error` and `exit` listeners, so a child that never execs fails the
case instead of surfacing as an unhandled vitest error, and an early exit is reported with its
status immediately rather than after the deadline.

**Chosen: fail, not skip.** The two `tty: true` cases are the only executable coverage of the
browser-launch gate; fusion has no CI; and under vitest 2.1 a programmatic `ctx.skip()` carries no
reason into the summary (the note argument arrives in vitest 3.1). A skip there would be a green
run claiming coverage that did not happen — the failure mode
`260810-2149_*_a-coverage-floor-cannot-see-coverage-leave-…` is open about. The cost
is a red case in a pty-less container, with the cause on the first line. The branch is narrow by
construction (python3 unrunnable, killed, or `os.openpty()` raising), so a machine whose pty works
cannot take it, and the case cannot vanish quietly there. The reasoning sits in the probe's
docstring, where the next reader meets it.

## Task 32 — the licence counts

`hooks/lib/__tests__/state-drift-detection-lint.test.ts`. Counted first: `SKIP_LICENCES` holds 26
entries, 12 of them from issue 260810-1918 (the contraction family is two entries, because
`won't`/`can't` are not auxiliary + n't).

**Derived beat corrected: both numerals are gone rather than fixed.** Nothing in the file derives a
count from the array, so a number beside it is a second source of truth for the array's length, and
this defect is what that cost. The enumeration stays, the control "rejects every declared skip
licence on a phrasing of its own" already witnesses every entry one at a time, and the docstring now
records what the three numbers were (eight table rows, eleven phrasings, twelve entries) so the
confusion is not re-derived. The resolution note of
`260810-1918_*_the-skip-licence-blacklist-…` carries a correction; the commit subject
of `45d76f0` is immutable and the correction names it.

## Task 37 — the interpolated message assertions

`hooks/lib/__tests__/provenance-header-lint.test.ts`. Four assertions take plain literals
(`"no 'Provenance:' line in the first 10 lines"`, `"first 10 lines"`), matching the three sibling
corpus-lint gates; set `HEADER_WINDOW = 3` and each fails. The fifth was removed rather than
rewritten: it sat in the window-boundary block, asserted nothing about that block's fixture, and the
negative-fixture case "negative 2" already makes the identical assertion where message assertions
belong. `HEADER_WINDOW = 10` now carries a `CHANGING THIS NUMBER BREAKS TESTS ON PURPOSE` note
citing the record — the one place someone editing the window will look.

## Bookkeeping

- `260810-1632_*_the-pty-case-…` — `Resolved:` appended, `_o_` → `_c_`.
- `260810-2110_*_the-skip-licence-commit-…` — `Resolved:` appended, `_o_` → `_c_`.
- `260802-1255_*_five-message-assertions-…` —
  `Resolved:` appended, `_o_` → `_c_`, closed in place inside its closed Circle.
- `260810-1918_*_the-skip-licence-blacklist-…` — correction appended to its
  resolution note (task 32's second file).
- `tasklist.md` — tasks 24, 32 and 37 ticked. Header counters untouched; they belong to taskplanner.

No commit made; the orchestrator commits.
