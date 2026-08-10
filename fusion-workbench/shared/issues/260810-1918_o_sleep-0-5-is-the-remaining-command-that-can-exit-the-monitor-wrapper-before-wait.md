`sleep 0.5` is the remaining command that can exit the monitor wrapper before `wait`

---

`e7b48a1` set out to make the browser-launch block unable to decide the wrapper's lifetime. The
launcher call itself is now safe: `bin/monitor:1245` carries `|| true`, and the `case` at `:1239-
1242` is disjoint (`Darwin` / `*`), total, and `set -u`-safe — both arms assign `BROWSER_LAUNCHER`,
so the `command -v "$BROWSER_LAUNCHER"` guard can never expand an unset name. The two pre-existing
gates are untouched byte for byte: `[[ -t 1 && -z "${MONITOR_NO_BROWSER:-}" ]]` is the same
condition, in the same place, with the same semantics.

One command in the body is still unguarded. `bin/monitor:1244`:

```bash
  if command -v "$BROWSER_LAUNCHER" >/dev/null 2>&1; then
    sleep 0.5
    "$BROWSER_LAUNCHER" "http://localhost:${PORT}" || true
  fi
```

`sleep` is a command like any other, it sits in an `if` **body** rather than in a condition, and the
comment three lines above states the rule it falls under: *"a failing command inside an `if` body is
not exempt from [`set -e`] — only the condition is."* A fractional argument is not portable. GNU
coreutils and macOS accept `0.5`; POSIX specifies an integer operand, and BusyBox built without
`FEATURE_FANCY_SLEEP`, Solaris `sleep` and AIX `sleep` reject it with a non-zero exit. The `*)` arm
of the new dispatch is precisely the platform set where that matters — it exists because the script
is now expected to run somewhere other than Darwin.

---

**Failure scenario.** A monitor started at a terminal on a BusyBox-based image (an Alpine container,
an embedded box, a minimal CI runner) with `xdg-open` present. `sleep 0.5` prints
`sleep: invalid number '0.5'` and exits 1. `set -e` takes the wrapper down at that line: `wait
$SERVER_PID` at `:1248` is never reached, the forked python server keeps the port, and the INT/TERM
trap installed at `:1194` dies with the shell that installed it. That is the same symptom, on the
same line count, as issue `260810-1558` — one command further down.

**Fix.** `sleep 0.5 || true`, or move the sleep in front of the `if` where it is equally harmless, or
drop the fractional argument. The first is the smallest and matches the treatment the line below it
already has.

**Filed by:** coderev, review of session `260810-1646` Turn 1, range `5ef92eb..940d522`.
