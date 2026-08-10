# coder — the sleep stops deciding the monitor's lifetime, and a missing tab says so

**Status:** Complete
**Session:** 260810-1646-orchestrator-session, Turn 2, task `R:260810-1918-monitor-residuals`
**Source records:**
`fusion-workbench/shared/issues/260810-1918_c_sleep-0-5-is-the-remaining-command-that-can-exit-the-monitor-wrapper-before-wait.md`,
`fusion-workbench/shared/issues/260810-1918_c_the-monitor-launcher-goes-silent-where-the-same-session-established-naming-the-gap.md`
**Review:** `fusion-workbench/shared/reviews/260810-1918-coderev-turn-1-range-5ef92eb-940d522.md` (M3, L1)
**Files changed:** `bin/monitor` — the browser-launch block at the tail only. No test file was touched.

## What the two defects were

**M3 — `sleep 0.5`.** `e7b48a1` claimed no path could still exit before `wait $SERVER_PID`.
That claim was false. `sleep` sits in the `if` **body**, so it is under `set -e` exactly as
the launcher call beside it, and it carried no guard. The fractional operand is a GNU/BSD
extension: POSIX specifies an integer, and BusyBox built without `FEATURE_FANCY_SLEEP`,
Solaris `sleep` and AIX `sleep` reject it non-zero. Those are the same platforms the `*)`
dispatch arm was added for, so the change that made the tab work on Linux is what brought
this line within reach of the machines it breaks on.

**L1 — the silent launcher.** Two different outcomes produced no output at all: the chosen
launcher absent (`if` body skipped) and the launcher present but failing (`|| true` swallowed
the status). A person at a terminal who was promised a tab and got none could not tell those
apart, or from "the server never started". The same session had already settled the opposite
convention twice, in `skills/setup/SKILL.md` and `skills/next/SKILL.md` (`queue-check:
UNAVAILABLE`, with the reason and the remedy) and in `agents/orchestrator.md` for the two
`bin/` helpers.

## The fix

```bash
  BROWSER_GAP=""
  if command -v "$BROWSER_LAUNCHER" >/dev/null 2>&1; then
    sleep 0.5 2>/dev/null || sleep 1 || true
    "$BROWSER_LAUNCHER" "http://localhost:${PORT}" ||
      BROWSER_GAP="$BROWSER_LAUNCHER could not open a browser"
  else
    BROWSER_GAP="no $BROWSER_LAUNCHER on PATH"
  fi
  if [[ -n "$BROWSER_GAP" ]]; then
    echo "monitor: ${BROWSER_GAP}. Open http://localhost:${PORT} yourself; set MONITOR_NO_BROWSER=1 to silence this." >&2 || true
  fi
```

**Why the three-part sleep chain rather than the `|| true` the record recommends.** `|| true`
alone satisfies the lifetime requirement and nothing else: on the affected platforms it leaves
`sleep: invalid number '0.5'` on the user's terminal, about a thing the user cannot act on,
and it drops the delay entirely. The delay is not decoration — it is what stops the tab
reaching a port the forked server has not bound yet, and the platforms that reject the
fractional operand are not the fast ones. So the fast path stays at 0.5s where it is
supported, the whole-second fallback keeps the delay where it is not, `2>/dev/null` drops the
message about the first, and the final `|| true` covers a `sleep` missing outright. Each of
the three parts answers a measured case; none is speculative padding.

**Why one message with two reasons rather than two messages.** The gap is reported at one
place, and the reason is data (`BROWSER_GAP`) rather than a second branch of output. That is
the shape `agents/orchestrator.md:126` already uses for its helpers: one line naming which of
the reasons applies. Both non-interactive callers and `MONITOR_NO_BROWSER` are exempt by
construction — neither reaches this block, and a gap is only a gap for someone who wanted the
tab. The launcher's own stderr is deliberately not redirected, so a launcher that explains
itself still does, with the monitor's line after it.

## The rest of the block, checked the same way

Every command between the `trap` at `:1200` and `wait $SERVER_PID`, asked whether it can
become the wrapper's exit status:

| Line | Command | Verdict |
|---|---|---|
| `trap … INT TERM` | builtin | 0 unless misused |
| `[[ -t 1 && -z "${MONITOR_NO_BROWSER:-}" ]]` | `if` condition | exempt from `set -e` |
| `case "$(uname -s)"` | failing command substitution in the case word | **measured**, not assumed: does not trigger `errexit` (probe below). A missing `uname` yields the empty string, which the `*)` arm takes. |
| `BROWSER_LAUNCHER=…`, `BROWSER_GAP=""` | assignments | status 0 |
| `command -v "$BROWSER_LAUNCHER"` | `if` condition | exempt |
| `sleep 0.5 2>/dev/null \|\| sleep 1 \|\| true` | fixed | cannot exit non-zero |
| `"$BROWSER_LAUNCHER" … \|\| BROWSER_GAP=…` | OR-list ending in an assignment | status 0 |
| `[[ -n "$BROWSER_GAP" ]]` | `if` condition | exempt |
| `echo … >&2 \|\| true` | guarded | `printf`/`echo` to a closed stderr really does return non-zero, so the guard is not theoretical |
| `wait $SERVER_PID` | last command | its status is the script's, by design |

## How it was verified

All of it in a scratch copy under `scratchpad/monitor-sleep/`, per the session decision
`260810-1820` — never in the working tree, which four executors were writing to at the time.

**The harness.** `script(1)` gives the wrapper a pty so `[ -t 1 ]` is true. The pty is held
open by a trailing `sleep` **after** the wrapper returns, in an outer `bash -c`; without it
`script` tears the pty down the moment the wrapper exits and the hangup collects the orphaned
server too, hiding the exact leak under test. That reading was taken twice before the outer
shell was added — the first run showed the server gone, which was the harness, not the fix.
Shims on `PATH`: a `sleep` that rejects any operand containing a dot (BusyBox-without-
`FEATURE_FANCY_SLEEP` behaviour, `exec /bin/sleep` otherwise), an `open` that logs its argv
instead of opening a tab, a `uname` printing `Linux` for the absent-launcher case, and an
`open` exiting 1 for the launcher-fails case. A harness-only variant inserts `/bin/sleep 2`
after `SERVER_PID=$!`, so python is bound and listening before the block runs; without it the
wrapper dies so fast that the `EXIT` cleanup trap removes the temp script before python opens
it, and the server dies of that instead — a different failure that would have masked the one
under test.

Before (working tree at `HEAD`, port 8801):

```
RESULT variant=beforeslow monitor_wrapper=EXITED http=200 listener='41851' [pid 41851 ppid 1]
  sleep: invalid number '0.5'
  WRAPPER-EXIT=1
  (launcher log empty — no tab)
```

The wrapper exited **1** at the `sleep` line, never reached `wait`, and the python server is
still answering on the port with **ppid 1**: reparented to init, orphaned, its `INT`/`TERM`
trap dead with the shell that installed it. That is the symptom of `260810-1558` returning by
a different door, as the record predicted.

After (same shim, same harness, port 8802):

```
RESULT variant=afterslow monitor_wrapper=ALIVE http=200 listener='49092' [pid 49092 ppid 48833]
  (no sleep error on the terminal)
  LAUNCHER-CALLED http://localhost:8802
```

Wrapper alive in `wait`, server's parent is the wrapper rather than init, no error line, and
the tab still opened — the fallback delay preserved the launch instead of dropping it.

**The chain in isolation**, under `set -euo pipefail`: with the rejecting shim, `elapsed=1.07s
exit=0`; with the real `sleep`, `elapsed=0.56s`; with `PATH=/nonexistent` (no `sleep` binary at
all), the shell survives. The `case`-word probe and the `false || VAR=…` probe both survive
`errexit`; `printf >&2` with stderr closed returns non-zero, which is why the `echo` is
guarded.

**Both gap paths**, on the fixed script (ports 8811, 8812):

```
monitor: no xdg-open on PATH. Open http://localhost:8811 yourself; set MONITOR_NO_BROWSER=1 to silence this.
monitor: open could not open a browser. Open http://localhost:8812 yourself; set MONITOR_NO_BROWSER=1 to silence this.
```

One line each, the reason named, wrapper alive and serving (`http=200`) in both.

**Suite.** `npm test` from `hooks/` — exit 0, 41 files, 1113 tests, including the three
`bin/monitor — the browser launch` cases (no terminal opens nothing and still serves; a
terminal gets the tab; `MONITOR_NO_BROWSER` suppresses on a terminal too). An earlier run of
the same suite failed 3 tests in `domain-cascade.test.ts` and `fusion-commit-lock.test.ts`;
both files are outside this change's reach (`bin/monitor` is exercised only by
`monitor-warnings-panel.test.ts`) and both passed on the rerun while parallel executors were
landing their own work.

## What was not done

No test file was touched. The new stderr line has no executable gate, which is the same
asymmetry the review's cross-cutting note names for the commit sequence and the staging rule.
Adding one would touch `hooks/lib/__tests__/monitor-warnings-panel.test.ts`, which the queued
task `I:260810-1632-pty-case` owns this session, so the gap is filed rather than collided with:
`shared/issues/260810-2027_o_the-monitors-browser-gap-line-has-no-executable-gate.md`.
