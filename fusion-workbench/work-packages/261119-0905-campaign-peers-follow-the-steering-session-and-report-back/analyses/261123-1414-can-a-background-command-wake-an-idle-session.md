# Analysis: can a background command wake an idle session

**Date:** 2026-11-23 14:14
**Type:** Feasibility
**Status:** Complete (main-loop run 2026-11-23 13:41:39Z to 14:47:10Z, in the orchestrator session of checkout `114caf11`)
**Requested by:** orchestrator (amendment plan `261123-1000-plan-fix-the-three-trial-causes-and-retest-before-13-6-0.md`, step 1)

## Question

Can a command started with the Bash tool's `run_in_background` stay alive past two 30-minute marks with no notice, and wake an idle main-loop session by exiting, so that the campaign watch can run without the `Monitor` tool's expiry? Step 1 asks five questions, (a) to (e). The verdict decides whether steps 2 to 5 run at all.

## Scope

- Tree: `/System/Volumes/Data/Projects/productive/F04-FUSION/fusion`. HEAD `445c67c5b126daa46acbe2b28529081b7f1b11b0` (2026-11-23 13:02:02 +0100), branch `main`. `git status -sb` reads `## main...origin/main` (local tracking ref, not re-fetched for this report). Work-tree changes are confined to `fusion-workbench/`.
- Probe directory: `/Users/kai/.fusion-tmp/114caf11/live-trial/bg-probe/`. Scratch, not committed. Contents: `README.txt`, `arm.txt`, `wait.sh`, `check-alive.sh`, `twin.sh`, `twin.log`, the bare remote `remote.git` with its clone `work/`, and `dry/` (a 2-second copy of `wait.sh` used once as a dry run).
- Plugin files read: `bin/fusion-campaign` (`## probe and watch`, the `exec node` line 840), `hooks/lib/campaign-watch.ts` (pid file, `claimWatch`), `bin/fusion-tmp` (header).

## Method

The probe runs in a main-loop session, as plan `261119-1248-*` step 1 did for `Monitor` (`261120-1242-can-an-idle-session-poll-the-remote.md`). A dispatched sub-agent cannot measure (a), (b), (c) or (e): it has no idle state between user turns, and its permission mode is not the user's.

| Instrument | What it does |
|---|---|
| `wait.sh` | Writes `start <UTC> pid=… ppid=…` to `wait.log` and its pid to `wait.pid`. Sleeps 3 900 s with nothing on stdout. Then prints `woke <UTC> rows-follow` and `second-line pid=… slept=3900 plan=261123-1000-step-1`, writes `end <UTC>` to `wait.log`, exits 0. Dry run with a 2-second copy (`dry/wait-2s.sh`): both lines printed, `rc=0`, log start and end written. |
| `arm.txt` | The one instruction pasted into the session (one line, 337 bytes): start `wait.sh` with Bash `run_in_background` true, end the turn, do nothing until woken; when woken, quote the output and the UTC time, start the same command again the same way (the re-arm, for (e)), stop that one with `TaskStop` (the main-loop check of (d)), run `check-alive.sh`, stop. |
| `check-alive.sh` | Reads `wait.pid` and prints `<UTC> alive pid=<p> <etime> <command>` or `<UTC> dead pid=<p>`, plus the last two `wait.log` lines. Appends to `alive.log`. Run from a second terminal at minutes 31 and 61. |
| `twin.sh` | Two `fusion-campaign watch --interval 60` with one `FUSION_SESSION_ID` against `remote.git`, plus a control under another session id. Run in this dispatch; result below. |

The run in one-line steps is in `README.txt`. The user records: the arm time; at minutes 31 and 61 the `check-alive.sh` line and whether the idle session showed any notice; the time the session starts a turn on its own; whether that turn shows both lines without reading an output file; whether the re-arm showed a permission prompt and which rule it offered.

## Findings

### The twin check (groundwork for the re-arm, not a verdict row)

`twin.sh`, run 2026-11-23 13:13:24Z to 13:13:35Z, `FUSION_CHECKOUT` unset, `FUSION_PLUGIN_ROOT` the plugin tree at `445c67c5`. `twin.log`, verbatim:

```
twin start 2026-11-23T13:13:24Z plugin-head=445c67c5
probe: state=ok ref=origin/main head=840625f9690eb7bfca99b0d70b856498a78a25a2  rc=0
first pid=63186 alive=yes 2026-11-23T13:13:29Z
second same-session out=[state=already-watching] rc=0 elapsed=0s 2026-11-23T13:13:29Z
control other-session pid=63302 alive-after-5s=yes out=[]
first alive-after-second=yes out=[]
pid files while running under /Users/kai/.fusion-tmp/3407c6e6: [campaign-watch-bg-probe-other-session.pid=63304 campaign-watch-bg-probe-twin-session.pid=63188 ]
after TERM: pid files=[] watches left=[]
twin-verdict: yes (second exits at once with state=already-watching) 2026-11-23T13:13:35Z
```

- A second watch under the same session id exits at once (under 1 s) with `state=already-watching` and exit 0. The first keeps running.
- A watch under another session id is not refused.
- TERM to the node process removes both pid files.
- The scratch clone minted its own checkout id `3407c6e6` on first use, so its pid files sit under `~/.fusion-tmp/3407c6e6/`, apart from this checkout's.
- One trap, seen on the first run (13:12:52Z) and fixed in the script: killing the pid that `&` returns for a backgrounded shell function leaves the node watch running, because that pid is a subshell. `bin/fusion-campaign` itself `exec`s node (line 840), so a command that starts the helper directly has the watch as its own process.

### The main-loop run

The run happened in the orchestrator session itself, not in a session the user opened for it. The session's own record was relayed in the coordinator's message. Each point below was checked against `bg-probe/wait.log` and `bg-probe/alive.log`.

`wait.log`, verbatim:

```
start 2026-11-23T13:41:39Z pid=27070 ppid=27069 secs=3900
end 2026-11-23T14:46:39Z pid=27070 rc=0
start 2026-11-23T14:46:59Z pid=44655 ppid=44654 secs=3900
```

`alive.log`, verbatim:

```
2026-11-23T13:14:09Z no-pid-file
2026-11-23T14:47:10Z dead pid=44655
```

The first `alive.log` line comes from this dispatch's own check of `check-alive.sh`, before the probe was armed. It is not a check at minute 31 or minute 61.

| Time (UTC) | Event | Source |
|---|---|---|
| 13:41:39 | Armed. Bash `run_in_background`, task `brpqlvhtk`, pid 27070. The turn ended right after. | `wait.log` line 1; session record |
| 14:12:39 (min 31) | No check taken. No turn and no notice in the session. | `alive.log` (no line); session record |
| 14:42:39 (min 61) | No check taken. No turn and no notice in the session. | `alive.log` (no line); session record |
| 14:46:39 | `wait.sh` exits, rc=0, after 3 900 s. | `wait.log` line 2 |
| 14:46:49 | The idle session starts a turn with no user input, 10 s after the exit. The turn is a task notification: "Background command … completed (exit code 0)". | session record |
| — | To get the two stdout lines, the session reads the task's output file. | session record |
| ~14:46:59 | Re-arm of the same command, task `bpj6mcxjh`, pid 44655. No permission prompt. | `wait.log` line 3; session record |
| shortly after | `TaskStop bpj6mcxjh`: "Successfully stopped task". | session record |
| 14:47:10 | `check-alive.sh`: `dead pid=44655`. `pgrep` finds no `wait.sh`. Pid 44655 has no `end` line, so the process was stopped, not finished. | `alive.log` line 2; `wait.log` |

### Observed rows

| Q | Question | Observed | Time (UTC) | Answer |
|---|---|---|---|---|
| (a) | The background command is still alive at minutes 31 and 61, with no notice at either mark | Pid 27070 ran without a break from start to its own exit, so it was alive at both marks. The session got no turn and no notice between the arm and the wake. **Caveat:** no outside check was taken at the two marks. Liveness is inferred from the start and end lines of one pid, and "no notice" comes from the session's own record; the user reported nothing either. | 13:41:39 to 14:46:39 | yes, inferred |
| (b) | Its exit at minute 65 starts a turn in the idle session with no user input | A task notification started a turn 10 s after the exit. | exit 14:46:39, turn 14:46:49 | yes |
| (c) | That turn shows the command's stdout, both lines, without the session reading an output file | The notification carried the status and the exit code only. To see both lines, the session had to read the task's output file. | 14:46:49 | **no** |
| (d) | `TaskStop` ends a background command, as the "stop watching" row needs | Sub-agent test on the real watch (below): yes. Main loop: the re-armed `wait.sh` (pid 44655) was stopped, then shown `dead`, and `pgrep` was empty. | 13:13:47 to 13:13:54; 14:46:59 to 14:47:10 | yes |
| (e) | Whether the re-arm waited on a permission prompt, and which allow rule removes it | No prompt, so no allow rule was offered. The session runs in auto mode, and the trial sessions showed "Allowed by auto mode" too. **A user in default permission mode is not measured.** | ~14:46:59 | no prompt in auto mode; default mode not measured |

### What (c) failing means for the design

The exit still wakes the session: (b) holds, and no expiry woke it in 65 minutes. What fails is the second half of step 2's design, "the exit is the wake **and** carries the row". The woken turn learns only that the command finished with exit 0. To learn which row it must act on (`new-question=`, `answered=`, `failed=`), the model must read the task's output file. The tool's own result discourages that read: "Read the file only if … you need a line it prints". The read is available every time, but only through one file read the model chooses to make.

That is a different kind of compliance from the one the trial measured failing, 24 times out of 24. The failing instruction asked the model to *refrain*: to write nothing when woken with nothing to report. This one asks it to *act*: on every wake, read one named file, then act on what is in it. Two readings follow, and the user rules between them.

| Reading | Holds that | Consequence |
|---|---|---|
| **Strict.** Step 1's rule as written | Any wake whose content the model must fetch rests on text, which is what the plan's Decidability paragraph set out to remove. `background-wake: no`. | The work stops here. The orchestrator returns this report with the trial report's R1(b), relaxing C2.4, C5.3 and C5.5 to one line per expiry, and the user rules again before steps 2 to 5. |
| **Amended.** The read is a narrower dependency than silence | Every wake from a report-mode watch carries a reportable row by construction (step 2), so the read is never wasted. A positive "read file X, act on its rows" is a different instruction from "say nothing", and the trial does not measure it. Under `Bash` the expiry wakes are gone, which `Monitor` cannot offer. | Steps 3 and 4 would have to say "read the output file on every wake", and step 6's retest would have to measure that read. The verdict rule would have to be restated without the "without reading an output file" clause, and that change is the user's, not this report's. |

No measurement here decides between the two. The strict reading is the rule as approved.

### (d), measured in this dispatch

My own tools have `Bash` `run_in_background` and `TaskStop`, so I tested (d) on the real watch rather than on a sleep:

| Time (UTC) | Event |
|---|---|
| 13:13:47 | Started `bin/fusion-campaign watch --interval 60` in `bg-probe/work` with `run_in_background` (task `bdrzy36e5`), session id `bg-probe-taskstop`. `pgrep` shows node pid 63461, and the pid file holds 63461. |
| ~13:13:50 | `TaskStop bdrzy36e5`: "Successfully stopped task". |
| 13:13:54 | `pgrep -f 'campaign.js watch'` returns nothing. Pid 63461 is gone. No `campaign-watch-*` pid file is left, so the watch got a signal it could catch and cleaned up. |

This ran in a dispatched sub-agent. The main-loop check during the run (above) also said yes.

## Verdict

`background-wake: no`, with (a) yes (inferred), (b) yes, (c) **no**, (d) yes. (e), outside the verdict: no prompt in auto mode; default mode not measured.

The rule, as step 1 states it: **the verdict line reads `background-wake: yes` only if (a), (b), (c) and (d) are all yes**; anything else reads `background-wake: no`. (e) is not in the verdict; it names the allow rule steps 4 and 5 write. **On `no`, the work stops here** and the orchestrator returns the report to the user with the trial report's R1(b), the option of relaxing C2.4, C5.3 and C5.5 to one line per expiry. The user rules again before steps 2 to 5 run.

## Implications

- Under step 1's rule the work stops after step 1. The orchestrator returns this report to the user with R1(b), and with the two readings of (c) above.
- Whatever the ruling, two facts are now measured: a background command does not hit the 30-minute expiry, and its exit wakes an idle session within about 10 s.
- (e) gives steps 4 and 5 no allow rule to write. A default-mode run would have to measure one.
- The twin check shows the one-watch-per-session guard works as it is. A re-arm while the old watch still lives gets an immediate, silent `state=already-watching` exit. Under report mode that exit is itself a wake with no row, which step 2's header already names.
- A watch that `TaskStop` ends cleans up its pid file, so "stop watching" leaves no stale refusal.

## Recommendations

- Orchestrator: stop at step 1 and put the verdict to the user: R1(b), or the amended reading with its restated rule. Steps 2 to 5 wait for that ruling.
- If the amended reading is chosen: steps 3 and 4 name the output-file read on every wake, step 6's retest measures it, and a default-permission-mode run settles (e).
- Step 3 and 4 texts, if they run: start the helper directly in the background command (as `arm.txt` does with `wait.sh`), not through a shell function or a backgrounded subshell, so the process the tool stops is the watch itself.

## Filed Issues

None.

## Sources

- `bg-probe/twin.log`, `bg-probe/dry/wait.log`; the `TaskStop` result for task `bdrzy36e5`.
- `bg-probe/wait.log`, `bg-probe/alive.log`, `bg-probe/wait.pid`; the orchestrator session's record of the main-loop run (tasks `brpqlvhtk` and `bpj6mcxjh`), as relayed by the coordinator.
- `bin/fusion-campaign` lines 643–698 (`## probe and watch`), line 840 (`exec node`).
- `hooks/lib/campaign-watch.ts` lines 35–38, 133–179 (pid file, `claimWatch`).
- Plan `261123-1000-*` step 1; analysis `261120-1242-can-an-idle-session-poll-the-remote.md` (method precedent).

## Open Questions

- [ ] The user's ruling on (c): the strict reading (stop, R1(b)) or the amended reading (the woken turn reads the output file, and the verdict rule is restated).
- [ ] (e) in default permission mode: not measured.
- [ ] (a) by an outside check at minutes 31 and 61: not taken. The current answer is inferred from `wait.log`.
