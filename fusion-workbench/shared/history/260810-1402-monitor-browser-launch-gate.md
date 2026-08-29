# Session 260810-1402 — the monitor stops opening browser tabs at nobody

**Agent:** coder
**Status:** Complete
**Dispatched:** out of order, ahead of the queue, at the user's request
**Task:** stop `bin/monitor` from launching a browser on every non-interactive spawn

---

## What was wrong

`bin/monitor` ended with an unconditional `open "http://localhost:${PORT}"`. Nothing
asked whether a human was there to receive the tab, so every caller got one.

`hooks/lib/__tests__/monitor-warnings-panel.test.ts` spawns the real script as a
subprocess to drive the served dashboard over HTTP: 11 spawn sites across 9 cases, each
on a fresh random free port, each killed in `afterEach` seconds later. One full
`npm test` run therefore opened about eleven tabs, all on ports that answered nothing,
all stealing focus as they arrived. Run repeatedly on 260810, and at one point by five
agents in parallel, that is what rendered the machine close to unusable.

## The correction to carry forward

The user reported this against their consuming project
`/Users/k1/Projects/productive/krk`. It did not come from there. Every surviving process
named `/Users/k1/Projects/productive/fusion/bin/monitor`, and the varying ports are this
harness's random free ports; a consuming project's monitor runs on one fixed port. `krk`
holds a copied `fusion-workbench/monitor` and no test suite. The browser is a machine-wide
surface, so the tabs surfaced wherever the user happened to be working, and the place a
symptom appears is not evidence about its origin when the surface is global.

## What was changed

**`bin/monitor`** — two independent gates on the launch, both of which must hold:

```bash
if [[ -t 1 && -z "${MONITOR_NO_BROWSER:-}" ]]; then
  sleep 0.5
  open "http://localhost:${PORT}"
fi
wait $SERVER_PID
```

`[ -t 1 ]` is the gate that closes the class. `open` exists to hand a *person* their
dashboard, and having a terminal on stdout is what distinguishes a person from a spawn.
Every non-interactive caller — this harness, a CI job, a background job, `nohup` — is
silent by construction, with no caller change required anywhere and no caller having to
know the gate exists.

`MONITOR_NO_BROWSER` is the second, separate gate: a person at a terminal who wants the
server without the tab. Any non-empty value suppresses. Both are documented in the usage
block beside the existing `MONITOR_BIND` lines, along with the statement that the tab
only ever opens on a terminal.

The harness was deliberately **not** changed to set the opt-out. That is the additive
shape `rules/critical-stance.md` §2 names: it would make today's instance behave while
leaving the hazard for every other non-interactive caller. The gate is the fix; the
opt-out is a separate feature that happens to have been needed at the same time.

**`hooks/lib/__tests__/monitor-warnings-panel.test.ts`** — extended rather than
duplicated, because the spawn-and-poll helper the cases need is already there. Three new
behaviour cases under `bin/monitor — the browser launch`:

1. a spawn with no terminal on stdout opens nothing, and the dashboard still answers;
2. a spawn **with** a terminal still gets the tab — the positive control, so a gate that
   is merely too tight fails here rather than passing quietly;
3. `MONITOR_NO_BROWSER` suppresses the launch on a terminal too.

Two supporting pieces went in with them. A fake `open` placed first on `PATH` appends its
argv to a marker file, so "a tab was opened" is a file that exists rather than a token
found in the script's prose — three of this queue's open defect records are lint gates
that match on a token and are defeated by a decoy, and this is deliberately not a fourth.
And `startMonitor()` gained an options argument: extra environment, and a `tty` mode that
runs the script under a small `python3` pty wrapper, because no `child_process.spawn`
stdio mode can hand a child a terminal. python3 is already a hard requirement of
`bin/monitor` (its server is a python heredoc), so the interactive cases add no
dependency the suite did not already have.

## Verification

| Acceptance | Result |
|---|---|
| started from a terminal, still opens the dashboard | case 2, passing |
| spawned with no controlling terminal, opens nothing, still serves | case 1, passing |
| the opt-out suppresses the launch interactively too | case 3, passing |
| a full `npm test` opens zero tabs | observed: fake `open` first on `PATH` for the whole run, marker file never created |
| the suite is green | `cd hooks && npm test` — exit 0, 40 files, 1072 tests, 108s |

The zero-tabs result is an observation, not an inference: the suite ran with a fake `open`
shadowing the real one on `PATH`, and the marker it would have written does not exist.
The baseline named in the dispatch was 1069 tests; the three new cases account for the
difference.

## Guard

`bin/monitor` is on the guard's `protectedPaths`. In this repository the protected-path
measurement stands down (`isFusionPluginRoot`), so the write landed and stayed: confirmed
after a subsequent guarded tool call by `git diff --stat -- bin/monitor`, which reports
the change. Nothing was silently reverted.

## Reach into consuming projects

A consuming project holds a **copy** at `fusion-workbench/monitor`, made by
`/fusion:setup` Step 0b from `$FUSION_PLUGIN_ROOT/bin/monitor`. The fixed script reaches
such a project only when both of these happen, in this order: the project's fusion install
is updated to a release carrying this change (`fusion --update`, or `/plugin install`
against a pulled marketplace cache), and then `/fusion:setup` is re-run there so Step 0b
re-copies the binary. Until then the copy keeps the old unconditional launch. Nothing was
touched in any consuming project from this session.

Note for whoever releases this: a consuming project's monitor is normally started by the
user from their own terminal (`./fusion-workbench/monitor "Session Name" 8099`, as
`agents/orchestrator.md` Step 0b documents), so the terminal gate leaves that path
behaving exactly as before.

## Records filed

- `260810-1557_*_bin-monitor-opens-a-browser-tab-on-every-non-interactive-spawn-…`
  — the defect and its `Resolved:` note. No record existed when the work started, so this
  one was filed by this session; it exists before the fix is committed, as asked.
- `260810-1558_*_a-missing-open-command-exits-the-monitor-wrapper-under-set-e-…`
  — found, not fixed. Under `set -euo pipefail` a missing `open` (Linux, or a narrowed
  `PATH`) exits the wrapper with 127 before `wait $SERVER_PID`, orphaning the forked
  server and killing the `INT`/`TERM` trap with it. Measured, not assumed: a failing
  command inside an `if` body is not exempt from `set -e`. Pre-existing; the new gate
  narrows its reach to the interactive case rather than widening it, which is why it was
  left standing rather than folded in.

## One more thing found in passing

The first full run failed a single case in
`hooks/lib/__tests__/reference-resolution-lint.test.ts`: a path citation in the new
`bin/monitor` comment named the directory `hooks/lib/__tests__/`, and the lint's path
regex requires a token to end on an alphanumeric, so it captured `hooks/lib/__tests` and
reported it as a plugin file that does not exist. The citation was changed to name the
test file itself, which resolves. Not filed as a defect: a directory path ending in `__/`
is a narrow shape, the lint's own reported token makes the truncation visible to whoever
hits it, and the citation reads better naming the file anyway.

## Not committed

The orchestrator stages and commits, and holds the commit lock. Nothing was staged or
committed from this session.
