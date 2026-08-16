The monitor's second port query matches any command line that names the script, not only a prior monitor

---
`bin/monitor:1237-1250` justifies the new port-clearing union with the claim that its second query "asks *what a process is* rather than what state its socket is in", that a prior monitor is one "by construction", that "a browser can never be one", and that the query "is inert on a host where a stale monitor does reach LISTEN". The predicate underneath is `SERVER_SCRIPT in cmd` — a substring test for the literal `monitor-server.py` anywhere in `ps -o command=` output. Measured: a client process holding the port whose argv merely *named* the file was SIGTERMed, while an identical client without the string survived. Three of the four claims are therefore stronger than the code. No plausible browser carries the string, so the practical risk is small; the comment is the defect.

---

## Measured, not reasoned

Run at `3a0408a` against `bin/monitor` on port 18821, macOS 15.7.7:

1. Started a monitor (pid 60821, `LISTEN`).
2. Started `python3 /tmp/mtest/client.py` (pid 63323) — a plain client holding an established connection to the port. This is the browser stand-in.
3. Started `python3 /tmp/mtest/client.py --note /tmp/somewhere/monitor-server.py` (pid 63324) — the same client, with the string in an *argument*. It is not running the script; it names it.
4. Started a second monitor on the same port.

Result:

```
60821 DEAD    (the listener — intended)
63323 ALIVE   (plain client — the "a browser can never be one" claim holds for it)
63324 DEAD    (client that merely names the file — killed)
```

`_lsof_pids()` with no state filter returns every pid holding the port, clients included; subtracting `_listeners` leaves the clients; `_runs_this_script` then keeps any of them whose full command line contains the substring. Nothing in the chain establishes that the process *is* a prior monitor.

## Which claims are wrong, precisely

| Claim at `bin/monitor:1237-1250` | Status |
|---|---|
| "asks *what a process is* rather than what state its socket is in" | **false** — it asks whether a 17-character string appears anywhere in a command line |
| "are prior monitors by construction" | **false** — construction gives a superset |
| "a browser can never be one" | true in practice, but contingent on browsers not carrying the string, not structural |
| "inert on a host where a stale monitor does reach LISTEN" | **false** — inert only when no port-holder carries the string |

## Why file it rather than let it stand

The union was added on a premise the same comment block labels unverified at HEAD (`shared/issues/260816-0110_*`). Its only remaining defence is the tightness of this predicate, and that defence is overstated in the file itself. A reader deciding whether the union is safe to keep reads exactly this paragraph.

## Fix direction

Two options, and the cheaper one is enough.

1. **Tighten the predicate to the script position.** `ps -o command=` output is `<interpreter> <script> <args…>`; testing `os.path.basename(tok) == SERVER_SCRIPT` over the first two whitespace-separated tokens matches a prior monitor and no process that merely names the file. About four lines.
2. **Or leave the predicate and correct the comment** to say what it does — a substring test over the command line, kept because nothing that holds this port in normal use carries that string.

## Worth keeping: an unremarked fix in the same change

`_lsof_pids` catches `OSError`. The code it replaced caught `(subprocess.CalledProcessError, ValueError, ProcessLookupError)`, none of which covers the `FileNotFoundError` raised on a host with no `lsof` on PATH — so the monitor used to crash at startup there and now does not. The commit message does not claim this and it is a real improvement; do not lose it in any rewrite.

**Found by:** coderev, reviewing `f4f01b0..3a0408a`. Related: `260815-2326_c_*` (closed by this change), `260816-0110_o_*` (the unverified premise).

---

**Resolved via option 1 — the predicate was tightened, not the comment weakened.**

The record offered both and said the cheaper one was enough. Option 1 was taken because it is cheap here for a reason the record did not have to hand: the launch form is fixed. `bin/monitor:1441` runs `python3 "$TMPFILE" <args…>`, so the script sits in a known position of `ps -o command=` output and no guessing is needed to find it.

`_runs_this_script` now walks the tokens after the interpreter, skips interpreter options, and compares the basename of the first non-option token against `SERVER_SCRIPT`. The comparison stays on the basename deliberately: the wrapper writes the script into a fresh `mktemp -d` on every run, so a prior monitor's path is never today's and a full-path test would match nothing.

**Measured after the change**, on macOS 15.7.7, reproducing the record's own setup on port 18825:

```
listener      59851 DEAD    (prior monitor — intended, unchanged)
plain client  60765 ALIVE   (port holder, no string in argv)
naming client 60766 ALIVE   (port holder whose argv names monitor-server.py — was DEAD before)
```

And on the predicate directly, against real processes: `python3 a/monitor-server.py alpha 1 2 3` → True; `python3 b/client.py --note /tmp/somewhere/monitor-server.py` → False; `python3 -u a/monitor-server.py` → True.

**The comment was corrected too**, so the two make the same claim. The union block no longer says the query asks "what a process is" but "what a process is *running*", drops "by construction", and says "adds nothing" rather than "is inert" where the first question already found the listener. It points at `_runs_this_script`, whose docstring states the two residuals the token test costs: a path containing a space splits across tokens, and an interpreter invoked as `-c` never reaches a script token. Both lose a kill rather than gaining a wrong one, and neither touches the first question's listener kill.

The unremarked improvement the record asked to preserve is preserved: `_lsof_pids` still catches `OSError`, so a host with no `lsof` on PATH still starts.
