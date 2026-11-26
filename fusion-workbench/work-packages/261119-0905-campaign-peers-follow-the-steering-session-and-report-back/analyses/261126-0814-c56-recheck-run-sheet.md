# Analysis: run sheet for the narrow live re-check of C5.6, the outage case

**Date:** 2026-11-26 08:14
**Type:** Feasibility (live re-check, run sheet; observations to be filled after the run)
**Status:** Complete (run 2026-11-26 07:49Z to 10:10Z; filled 2026-11-26 15:49 from `collected-20261126T144211Z`)
**Requested by:** orchestrator, for issue `261126-0900-a-watch-that-exits-on-failed-is-not-restarted-because-the-text-restarts-only-from-a-printed-head.md`

## Question

Issue `261126-0900-*` has a fix in the working tree that is not committed yet. In both texts, `failed=` now gets one sentence and then a restart with the same `--since`: `catalog/profiles/skill-campaign/parts/09-claude.md`, rendered to `skills/campaign/SKILL.md` Step 9, and `catalog/profiles/orchestrator/parts/40a-claude.md`, rendered to `agents/orchestrator.md`, the campaign-lane paragraph. With two real sessions and a blocked remote, does each session report the failure once, ask nothing, restart its watch within a minute, and stay silent through the recovery? The issue's acceptance asks for exactly that. The user ruled: fix, then this re-check of about 20 to 30 minutes, then release.

## Scope

- **Plugin work tree** (what the sessions load): `/System/Volumes/Data/Projects/productive/F04-FUSION/fusion`. HEAD `9f0f527f` (2026-11-26T00:14:43+01:00), branch `main`, `## main...origin/main`, with uncommitted changes to `agents/orchestrator.md`, `catalog/profiles/orchestrator/parts/40a-claude.md`, `catalog/profiles/skill-campaign/parts/09-claude.md`, `skills/campaign/SKILL.md` (the fix) and the event log. Plugin version `13.5.1`.
- **Re-check tree** (scratch, not committed anywhere): `R` = `/Users/kai/.fusion-tmp/114caf11/live-trial/retest-c56`. Remote `R/remote.git` `main` at `47a5262` (2026-11-26T08:10:55+01:00). `steer/` is at `47a5262`, `## main...origin/main`. `peer/` is at `0d8034c`, 2 behind; the session pulls.
- **Reused** from `/Users/kai/.fusion-tmp/114caf11/live-trial/retest/` (left untouched, `collected-*` included): `setup-clone.sh`, `start-steer.sh`, `start-peer.sh`, `env.sh`, `digest.js`, and the pattern of `watches.sh`, `collect.sh`, `block.sh` and `unblock.sh`. How these work, and the run's traps, are in `261124-2015-retest-two-checkouts.md` `## 1` to `## 3`, and its `### F1` describes the defect.

## 1. What was built

| Path | What it is |
|---|---|
| `R/remote.git` | Bare remote, branch `main` |
| `R/steer` | Steering clone, checkout **`2baf48c3`**, registered as `c56-steer`. Holds no package. |
| `R/peer` | Peer clone, checkout **`05cb8750`**, registered as `c56-peer`. Lane 1 names it. |
| P1 `261126-0810-p1-add-file-c` | The one package. `autonomous`, lane-1. Asks for a file holding `C`, named `c-alpha.txt` or `c-beta.txt`, and reserves the choice to the user. That gives the peer one question it cannot decide and no other work, so it waits with its watch running. |
| Campaign `261126-0810-c56` | Running. One lane, `lane-1` = `05cb8750`, member P1. Opened, committed and pushed at `47a5262` (`R/.open-head`). |
| `R/<clone>/.claude/settings.local.json` | As in the earlier retest: bare tool names allowed, no `defaultMode`, `whatsapp` MCP disabled. |
| `R/start-steer.sh`, `R/start-peer.sh` | Start `claude --plugin-dir <work tree> --agent fusion:orchestrator` in the clone. All inherited `FUSION_*` and `CLAUDE*` variables are dropped, and **`FUSION_PLUGIN_ROOT` is set to the work tree, which holds the uncommitted fix.** |
| `R/block.sh`, `R/unblock.sh` | Move `remote.git` out of the tree, to `/Users/kai/.fusion-tmp/114caf11/.c56-parked/`, and back. A session that lists `R` sees no `remote.git.blocked` to put back (earlier F6). Each refuses a second run. |
| `R/follow.sh` (+ `follow.js`) | **New.** Runs until Ctrl-C and prints one timed line per change: `START`, `EXIT`, and `REARM clone=… gap=<s> same-since-as-before=yes/no`. It also prints the outage file per clone: `STATE+` when written, `STATE~` when a failed probe refreshes it (a silent probe in the outage), and `STATE-` when a successful probe removes it (the recovery). It shows `REMOTE blocked/back` as well. Read only, and every line goes to `R/times.log`. |
| `R/watches.sh` | As before: the watches running in this tree, their age and arguments, the pid and state files, the remote head. |
| `R/collect.sh` | As before, adapted: transcripts from `~/.claude/projects/*live-trial-retest-c56-{steer,peer}`, every task output they name, `times.log`, records and logs, into `R/collected-<UTC>/`. |
| `R/build-1.sh`, `R/build-2.sh`, `R/build.log`, `R/setup-c56-*.log` | How the tree was built, and what each step and dry run printed. |

**Verified before the run** (`build.log`): `checks_due=none` in both clones. The `steer/` overview gives `campaign=261126-0810-c56 running`, `lane-1 05cb8750 c56-peer`, `ready=… P1`. The `peer/` `sync --read` gives `mine=261126-0810-c56`, `lane=… lane-1`, `next=261126-0810-p1-add-file-c autonomous none`, and leaves the tree unchanged. With `start-*.sh --env`, only `FUSION_PLUGIN_ROOT=/System/Volumes/Data/Projects/productive/F04-FUSION/fusion` survives, and `PWD` is the clone.

**Dry run of the mechanism, without Claude sessions** (`build.log`, second pass, `--interval 20`). The test started one watch per clone with `--since 47a5262` and ran `block.sh`. Both watches printed `failed=fetch-failed` and exited 0. Each was restarted at once with the same `--since`, giving `REARM … gap=0s same-since-as-before=yes`. The restarted watches' next probe in the outage gave `STATE~` and printed nothing. `unblock.sh` followed. The next probe gave `STATE-` for both and again printed nothing, and both kept running until killed. The helper half of points 2 to 4 therefore holds. What only the live run can show is whether the **sessions** restart. A first pass at `--interval 3` taught one limit: the outage file is stale after two intervals. With the real 300 s interval, a restart more than 10 minutes after the failure would report the outage a second time.

**Timing that sets the sheet.** The watch probes every 300 s, and a restarted watch probes at once. Each session therefore meets the block 0 to 5 minutes after it begins, and the recovery 0 to 5 minutes after the unblock.

## 2. Before you start

1. **`FUSION_PLUGIN_ROOT` must point at the fusion work tree, which holds the uncommitted fix.** The start scripts set this. Start the sessions only with them. Do not commit, stash, check out or reset anything in the fusion repository until the run is over: a `git stash` would take the fix out from under both sessions.
2. Four plain terminals, none opened from inside a Claude session: **A** steering session, **B** peer session, **C** scripts, **D** `follow.sh`. Every command below fits on one line.
3. In A and B, type only what the "Type exactly" column says. A row reading "nothing" means do not type in that session, even when it seems to wait for you. Notes go into `R/notes.txt`, or to the orchestrator session in the fusion repository.
4. If a session asks you something the sheet does not list, do not answer it. Write the question and the time into `notes.txt`. During the block (rows 9 to 12), such a question is itself the observation for point 2.
5. A "trust this folder" dialog at the first start in each clone: choose yes.
6. Keep no second copy of fusion enabled as a marketplace plugin.
7. Start the peer only after the steering overview (row 3).
8. **Expected duration: about 30 minutes** (25 to 35). About 10 minutes go to the setup rows (3 to 7), up to 7 to the block (8 to 10), up to 6 to the recovery (11 to 13), and 3 to wrap up.

## 3. Run sheet

`R` = `/Users/kai/.fusion-tmp/114caf11/live-trial/retest-c56`. Scripts are typed with their full path. **Tb** is the time `block.sh` prints.

| # | Where | Type exactly | Then wait for | Point |
|---|---|---|---|---|
| 0 | C | `/Users/kai/.fusion-tmp/114caf11/live-trial/retest-c56/watches.sh` | `watch: none running in this re-check`, remote at `47a5262`. | – |
| 1 | D | `/Users/kai/.fusion-tmp/114caf11/live-trial/retest-c56/follow.sh` | `follow: started`, `REMOTE back`. Leave it running to the end. | – |
| 2 | A | `/Users/kai/.fusion-tmp/114caf11/live-trial/retest-c56/start-steer.sh` | The session starts. | – |
| 3 | A | `/fusion:campaign` | The overview: campaign `261126-0810-c56` running, lane-1 on `c56-peer` with P1 ready. Nothing asked. D shows `START clone=steer --report steering`. | 1 |
| 4 | B | `/Users/kai/.fusion-tmp/114caf11/live-trial/retest-c56/start-peer.sh` | The session starts. | – |
| 5 | B | `Hallo` | No question to you. It claims P1 and files the question (`c-alpha.txt` or `c-beta.txt`) as a decision in P1's container. It pushes, says **once** that it waits for the steering session, and starts its watch. D shows `START clone=peer --report lane`. About 3 to 8 minutes. | 1 |
| 6 | A | nothing | Within about 5 minutes of the peer's push, the question is reported once, with an offer to answer. **Do not answer.** D shows `EXIT clone=steer`, then `REARM clone=steer … same-since-as-before=no`: the normal restart on a new head. | 1 |
| 7 | C | `/Users/kai/.fusion-tmp/114caf11/live-trial/retest-c56/watches.sh` | Two watch lines, `clone=steer` and `clone=peer`. Neither session is in the middle of a turn. If a line is missing, wait 2 minutes and run it again. | **1** |
| 8 | C | `/Users/kai/.fusion-tmp/114caf11/live-trial/retest-c56/block.sh` | It prints **Tb** and the earliest unblock time (Tb + 5 min). D shows `REMOTE blocked`. | – |
| 9 | A, B | nothing | Within about 5 minutes, **each** session says **once**, in one sentence, that the remote could not be checked, and asks you nothing. For each clone, D shows `EXIT`, then `STATE+`, then `REARM clone=<clone> gap=<s> same-since-as-before=yes` with a gap of at most 60 s. Note each session's sentence time. | **2, 3** |
| 10 | C | `/Users/kai/.fusion-tmp/114caf11/live-trial/retest-c56/watches.sh`, once D shows both `REARM` lines | Two watch lines again, `clone=steer` and `clone=peer`, each younger than the time since its session's sentence plus a few seconds. If one `REARM` is missing 3 minutes after that session's sentence, run this row anyway and note it (that is a `no` for point 3), then go on. | **3** |
| 11 | C | `/Users/kai/.fusion-tmp/114caf11/live-trial/retest-c56/unblock.sh`, at or after Tb + 5 min, and not before row 10 | `Unblocked … after N min`, `remote.git answers.` D shows `REMOTE back`. | – |
| 12 | A, B | nothing | Within about 5 minutes, D shows `STATE- clone=steer` and `STATE- clone=peer`: each watch's recovery probe ran and printed nothing. Then wait 1 more minute. Neither session writes anything from its row 9 sentence until now. | **2, 4** |
| 13 | C | `/Users/kai/.fusion-tmp/114caf11/live-trial/retest-c56/watches.sh` | The same two pids as row 10, still running. | **4** |
| 14 | A, B | `/exit` in each | Both sessions close. D shows two `EXIT` lines. | – |
| 15 | D | Ctrl-C | `follow.sh` stops. | – |
| 16 | C | `/Users/kai/.fusion-tmp/114caf11/live-trial/retest-c56/collect.sh` | `Collected into …/collected-<time>`. Give that path to the orchestrator session in the fusion repository. | all |

**First message of each session:** steering `/fusion:campaign` (row 3), peer `Hallo` (row 5).

## 4. Checklist

The Observed columns are filled from the collection, not during the run. The sources are `follow.sh` lines in `12-times.log`, the digests, and the task output files.

| # | What counts as yes | Evidence | Observed, steering | Observed, peer |
|---|---|---|---|---|
| 1 | Each watch runs before the block | Row 7 `watches.sh`, both clones; `START`/`REARM` lines before `REMOTE blocked` | **yes.** `START clone=steer pid=44457 … since=9db70cc7870b` at 07:50:35Z; row 7 snapshot 07:55:13Z shows pid 44457, age 04:39, `--since 9db70cc…`. Block at 07:56:13Z. | **yes.** `START clone=peer pid=51765 … since=9db70cc7870b` at 07:55:00Z; row 7 snapshot 07:55:13Z shows pid 51765, age 00:15, `--since 9db70cc…`. |
| 2 | On the blocked remote, each session says the failure **once**, in **one sentence**, and asks its user nothing; nothing more until the run ends | Session text from Tb to row 14; no second `failed=` wake; `STATE~` (silent) after the restart | **no, by the letter.** Said once (08:00:44.994Z), asked nothing, no second `failed=` wake (`bm95hg3gh.output` empty), 25 silent `STATE~` lines to 10:00:45Z. But the text is **two sentences**: the failure and restart, then "Die Namensfrage (`c-alpha.txt` oder `c-beta.txt`) wartet weiter auf deine Antwort." | **yes.** One sentence at 08:00:07.244Z: "Das gemeinsame Remote … war gerade nicht lesbar (git meldet, dort liege kein Repository), deshalb habe ich die Beobachtung ab demselben Stand neu gestartet." No question, no second `failed=` wake (`bs8gavblb.output` empty), 26 silent `STATE~` lines to 10:05:08Z. |
| 3 | Each restarts its watch with the **same `--since`**, running again within 60 s of the failure | `REARM … gap≤60s same-since-as-before=yes`; row 10 `watches.sh`; the restart command in the transcript | **yes.** Failed probe 08:00:35.225Z; transcript restart 08:00:41.845Z, `watch --report steering --since 9db70cc7870bee5da961fafab41869420d65ef02`, `run_in_background`, task `bm95hg3gh`; `REARM clone=steer pid=71582 gap=8s … same-since-as-before=yes`. | **yes.** Failed probe 07:59:58.907Z; transcript restart 08:00:04.097Z, `watch --report lane --since 9db70cc7870bee5da961fafab41869420d65ef02`, `run_in_background`, task `bs8gavblb`; `REARM clone=peer pid=70339 gap=6s … same-since-as-before=yes`. |
| 4 | After the unblock, nobody says anything | `STATE-` for both clones; no session text from row 11 to row 14; the same pids in rows 10 and 13 | **yes.** Unblock 10:05:28Z; `STATE- clone=steer` at 10:05:44Z. No transcript entry after 08:03:50Z. Pid 71582 still running at 14:41:48Z and 14:42:16Z, `--since 9db70cc…`. | **yes.** `STATE- clone=peer` at 10:10:08Z. No transcript entry after 08:03:10Z. Pid 70339 still running at 14:41:48Z and 14:42:16Z, `--since 9db70cc…`. |

Verdict rule (issue acceptance): the release waits on any `no`. A `no` goes back to the user together with the line that shows it.

## 5. What to watch for

- **The old failure, if the fix did not take.** The session says it did not restart the watch "while the remote is missing" and then asks whether to continue: the earlier retest, steering side, `### F1`. In D, the clone's `EXIT` would then have no `REARM` after it.
- **A second sentence** after the restart would mean the restarted watch reported the outage again. That happens only if the restart came more than 10 minutes late (the stale outage file), or with a different session id, which would point to a new process, not this fix.
- **Diagnostics in the failure turn.** A session may run `git fetch` or list the tree before its sentence. That counts as fine as long as the user-facing text stays one sentence and asks nothing. The parked remote lies outside `R`, so nothing invites the session to repair it.
- **The steering's row 6 restart** gives a `REARM` with `same-since-as-before=no`. That is the restart on a new `head=` and not the point-3 line. Only the `REARM` lines after `REMOTE blocked` count for point 3.

## Findings

**Verdict: C5.6 is yes on the peer side and not yet yes on the steering side.** The peer gives yes on all four points. The steering session gives yes on points 1, 3 and 4. On point 2 it reported the outage once and asked nothing, but in two sentences. The sheet and the fix text both say one sentence. Under the verdict rule, that `no` goes back to the user with the line below. Points 3 and 4 are the defect issue `261126-0900-*` names, and both sessions now pass them.

### What was judged

- **Only the restarted sessions count.** Those are steering `6bbb2c3d-cd80-4991-8a03-c20b47e65d13` and peer `f4f5d550-08b0-4c15-80c2-c5260fe881f7`. The pid files' names (`campaign-watch-<session>.pid`, `12-times.log` 07:55:13Z) tie them to the watches. The first pair, steering `97a73d82-…` and peer `93aad644-…`, ran from 07:38Z to 07:46Z and does not count.
- **A correction to the chat account.** Both peer commits, `990009c` (07:42:44Z, the claim and the question) and `9db70cc` (07:42:46Z, the event rows), come from the **first** peer session (`93aad644`), which greeted once (07:42:55Z). The restarted peer pushed nothing. It found the question already filed, said so once at 07:55:03Z and started its watch. The restarted steering session started its watch at `9db70cc` and offered the question in its opening overview (07:50:42Z). The row 6 restart on a new head (`same-since-as-before=no`) therefore never happened in the judged run. It does not belong to C5.6.
- **The fix was what the sessions loaded.** The four fix files in the work tree carry mtimes 2026-11-26T07:00:08Z to 07:00:15Z. That is before either session started (07:49:20Z) and unchanged since. HEAD is still `9f0f527f`, `## main...origin/main`. Both transcripts' prompt snapshots (peer 07:54:18Z; steering 07:49:53Z, along with the skill body loaded from `…/F04-FUSION/fusion/skills/campaign`) contain the new text "`failed=`: one sentence, then restart it with the same `--since`". The start scripts set `FUSION_PLUGIN_ROOT` to the work tree, and every `fusion-rules` read resolves there.

### Timeline (UTC)

| Time | Steering (`2baf48c3`) | Peer (`05cb8750`) |
|---|---|---|
| 07:50:35 | Watch `b8ryb7sgr` armed, pid 44457, `--since 9db70cc` | |
| 07:54:58 | | Watch `bxz987bgn` armed, pid 51765, `--since 9db70cc` |
| 07:56:13 | `block.sh`: remote parked | |
| 07:59:58.9 | | Probe fails, outage file written, watch exits 0 with `failed=fetch-failed` |
| 08:00:04.1 | | Restart, same `--since`, task `bs8gavblb`, pid 70339 (gap 6 s) |
| 08:00:07.2 | | **One sentence**, turn ends |
| 08:00:35.2 | Probe fails, watch exits 0 with `failed=fetch-failed` | |
| 08:00:41.8 | Restart, same `--since`, task `bm95hg3gh`, pid 71582 (gap 8 s) | |
| 08:00:45.0 | **Two sentences**, turn ends | |
| 08:00:44 to 10:05:08 | 25 silent `STATE~` refreshes | 26 silent `STATE~` refreshes |
| 10:05:28 | `unblock.sh`: back after 129 min 15 s | |
| 10:05:44 | `STATE-`: recovery probe, prints nothing | |
| 10:10:08 | | `STATE-`: recovery probe, prints nothing |
| 14:41:48 | pid 71582 running, age 06:41:06 | pid 70339 running, age 06:41:44 |

In each failure turn, a session read the task output file, restarted the watch and then wrote its text. Neither ran any other diagnostics, and neither called `AskUserQuestion`: there is no `tool_use` for it in either transcript.

### F1: the steering session's second sentence

The steering text at 08:00:44.994Z (transcript `6bbb2c3d`) reads:

> Das Beobachten des Remotes ist einmal gescheitert, weil `…/retest-c56/remote.git` gerade nicht als Git-Repository lesbar ist; ich habe es vom selben Stand aus neu gestartet. Die Namensfrage (`c-alpha.txt` oder `c-beta.txt`) wartet weiter auf deine Antwort.

The first sentence is exactly what the fix asks for. The second asks nothing, but it repeats the open question that the overview had already offered at 07:50:42Z. That breaks "one sentence" in `skills/campaign/SKILL.md` Step 9 ("`failed=`: one sentence, then restart it with the same `--since`") and in this sheet's point 2. It is a wording overrun, not a repeat of the old defect: the restart happened, nothing was asked and the session never spoke again. The peer, working from the parallel text in `agents/orchestrator.md`, kept to one sentence. Two readings are possible, and the user decides between them:

1. **Accept it.** A reminder of a question still open is not a second report of the outage. Point 2 is then yes, and C5.6 is yes on both sides.
2. **Tighten the text.** Example: "`failed=`: one sentence, nothing else, then restart it with the same `--since`" in `catalog/profiles/skill-campaign/parts/09-claude.md`, rendered to Step 9. Then re-check the steering side.

### F2: the long block confirmed the staleness rule from the other side

The block lasted 129 min instead of 5 to 7. That made the run a stronger test of point 2, not a weaker one. Each restarted watch's own failed probes kept the outage file fresh (`STATE~` every 300 s), so the two-interval staleness never set in, and neither watch woke or reported a second time in two hours. The stale-file case the sheet warns about (`## 1`, a restart more than 10 minutes late) did not arise, because both restarts came within 8 s.

### F3: Claude Code's recaps restate the outage (outside C5.6)

Both transcripts hold one `away_summary` entry each, written during the block: steering at 08:03:50Z ("… und der Remote ist gerade nicht lesbar. Nächster Schritt: wähle c-alpha.txt oder c-beta.txt.") and peer at 08:03:10Z ("Nächster Schritt: Das gemeinsame Remote war zuletzt nicht lesbar, bitte prüfe es und antworte dort."). These come from the harness's recap feature ("turn off recaps in /config"), not from a model turn. No fusion text governs them, so they do not count against point 2. They can still look like a second report to a user who comes back, and the peer's recap asks the user to check the remote, which the lane rule forbids the session itself to do. Turning recaps off in the start scripts would remove this noise from future live runs.

### Where the run departed from the sheet

- The block lasted 129 min (`unblock: … 129 min 15 s`), not the planned 5 to 7 (see F2).
- Row 14 (`/exit`) did not happen before row 16. Both sessions and both watches were still alive at collection (14:41:48Z, 14:42:16Z). That serves as row 13's same-pid check, about 4.5 h after the recovery.
- Row 10 (`watches.sh` after both `REARM` lines) left no snapshot in `times.log`. The `REARM` lines and the 14:41Z snapshot carry its evidence.
- Both transcript files have mtimes later than their last entry (13:49Z and 13:54Z, last entries 08:03Z). Nothing was appended after 08:03:50Z, so this does not touch point 4.

## Sources

- `R/collected-20261126T144211Z/`: `12-times.log`, `digests/steer-6bbb2c3d-…txt`, `digests/peer-f4f5d550-…txt`, `transcripts/{steer/6bbb2c3d-…,peer/f4f5d550-…}.jsonl` (entries 07:59:58Z to 08:03:50Z), `task-outputs/steer/{b8ryb7sgr,bm95hg3gh}.output`, `task-outputs/peer/{bxz987bgn,bs8gavblb}.output`, `01-remote-log.txt`, `06-status-*.txt`, `13-watches-at-collect.txt`
- `R/times.log` (identical to `12-times.log` through 14:42:11Z)
- Work tree: `git status -sb`, `git diff` and file mtimes of `skills/campaign/SKILL.md`, `agents/orchestrator.md` and the two catalog parts, HEAD `9f0f527f`
- Issue `261126-0900-a-watch-that-exits-on-failed-is-not-restarted-because-the-text-restarts-only-from-a-printed-head.md`
- `261124-2015-retest-two-checkouts.md` `## 1` to `## 4`, `### F1`, `### F6`, `## Where the run departed from the run sheet`
- `git diff` of the work tree: `skills/campaign/SKILL.md:160`, `agents/orchestrator.md:380` and their catalog parts
- `bin/fusion-campaign` header, `## probe and watch` (the report mode, `failed=`, the outage file, stale after two intervals; `--interval` 300 by default)
- `hooks/lib/campaign-watch.ts:297-326` (`reportLoop`: probe first, then sleep; a fresh outage file refreshed silently)
- `R/build.log`, `R/setup-c56-steer.log`, `R/setup-c56-peer.log`

## Open Questions

- [x] Observed columns, after the run.
- [ ] F1: does the steering session's second sentence, a reminder of the open question, count against "one sentence"? Accept it (C5.6 is yes on both sides), or tighten the Step 9 text and re-check the steering side.

Ruled by user, 2026-11-26: the steering second sentence ("Die Namensfrage … wartet weiter auf deine Antwort.") is accepted as a reminder, not a second report; C5.6 counts as yes on both sides.
