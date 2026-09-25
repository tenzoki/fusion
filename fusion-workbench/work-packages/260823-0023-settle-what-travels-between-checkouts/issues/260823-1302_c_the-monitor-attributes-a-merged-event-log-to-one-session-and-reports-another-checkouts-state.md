The monitor attributes a merged event log to one session, and reports another checkout's state as this one's

---

**Severity:** Medium
**Domain:** code
**Filed by:** analyst, running plan step 9 of C2
**Affects:** `bin/monitor` (`computeETA`, `_parse_mode`, the `/api/dashboard` event window, the Event Log panel)
**Cross-references:** `260823-1302-two-checkouts-one-event-log-and-what-the-monitor-makes-of-it.md` (the measurement); `260823-0800_*_c2-what-travels-between-checkouts-is-settled.md` step 9, which assigned the question and excluded the repair; `260823-1110_*_the-merge-driver-unsorts-a-second-event-log-reader-whose-repair-direction-is-positional.md`, which named this reader and left it to step 9; `rules/workbench-tracking.md` `## The event log carries a union merge driver`, which states the ordering cost

---

## What is wrong

`bin/monitor` reads `fusion-workbench/orchestrator-events.jsonl` as the record of one session. Since commit `c9eba48` the file is merged with `merge=union` whenever two checkouts both append to it, so it holds two or more independent sessions interleaved. Four readings in the monitor become false, and the failure is user-visible on the running dashboard.

**The dashboard status comes from the last line of the file.** `_parse_mode` reads `events[-1].event` and maps `session_end` to the label `Session complete`. Measured against a real merge: checkout A's session was live with a task in flight, and the running monitor served `mode: "done"`, so the dashboard read `Session complete` while A was working.

**The ETA disappears for as long as the other checkout's clock is ahead.** `computeETA` drains its pending-task map on every `session_end` and rejects any running `task_start` older than `max(latest session_start, last session_end)`. Another checkout's `session_end` sets that floor. Measured: with checkout B's four lines present, A's live task at 10:07 produced an empty return, which the page renders as `ETA: —`. The same log with B's four lines removed produced `ETA: 12:18 (12m avg, coder)`.

**The paired-duration average is computed from a subset that depends on the interleaving.** In file order the coder history held two pairs and averaged 16 minutes; in timestamp order it held one pair and averaged 12 minutes, over the identical set of lines. A `session_end` from either session discards the other's in-flight starts, so which pairs survive is an artefact of the merge.

**The event window and the Event Log panel are file-order constructs.** The server takes `lines[-MAX_EVENTS:]`, the last N lines of the file, and the page renders that array in reverse as newest-first. Measured with `-n 4`: the window held checkout B's four lines, and the running task's own `task_start`, which is among the four chronologically most recent events, was outside it.

## Why sorting by `ts` does not fix it

Sorting is the obvious repair and it is not sufficient. It corrects nothing in two of the four readings and makes one worse.

Measured on the same file: read in file order, the last line was checkout A's `task_start` and `_parse_mode` returned unset, so the dashboard fell back to the age-based label. Sorted by `ts`, the last line became checkout B's `session_end` at 10:20 and `_parse_mode` returned `done`. The sort moved the answer from vague to wrong.

The reason is that the question the monitor asks is not answerable from the merged log at all. It asks what *this checkout's session* is doing now. Every emitted line carries `ts`, `event`, and some of `turn`, `task`, `agent`, `detail`. None carries a session identifier or a checkout identifier, so no ordering of those lines separates one session's events from another's. This is the `rules/critical-stance.md` §4 case: the mechanism needs an input it does not have, and the repair is a change of mechanism rather than a better read of the same bytes.

Two shapes are available and the choice is a real fork, not a detail. Give each emitted line an identity for the session that wrote it, so every reader can filter, which changes the event schema and the orchestrator's emit sites. Or read live state from a file that does not travel, which is what `orchestrator-live.md` already is: class L, untracked, one writer per checkout, and already the monitor's source for everything except the event panel and the ETA.

## Verified

Measured on 2026-08-23 against HEAD `a76ee8f`, in two clones of a scratch project with a local bare remote, built and destroyed outside this repository. The merge was a real `git pull` with the driver declared by `/fusion:setup` Step 0h in each clone. `computeETA` and `parseUTCTs` were extracted verbatim from `bin/monitor` and run under node; `mode` and the event window were read from a running `bin/monitor` over `/api/dashboard`. Commands and output are in the analysis named above.

## Direction, not a prescription

Not repaired here. Plan step 9 excluded the repair from C2 by name, and the fork above needs the user rather than an executor. The record exists so the choice is made deliberately: fusion now ships the merge that causes this, and the monitor is the surface where a person sees the result.

Two further consequences worth carrying into whoever takes it. The repair direction recorded for the Turn count in `260822-1136_*_two-definitions-of-the-turn-count-disagree-and-the-resume-snippet-counts-every-session-in-the-log.md`, and re-stated for C4 in `260823-1110_*_the-merge-driver-unsorts-a-second-event-log-reader-whose-repair-direction-is-positional.md`, offers sorting by `ts` as one of two ways out. The measurement above says sorting alone does not separate the sessions, so only the second half of that direction survives, namely a window that does not depend on file order. And the Phase-4 sequence diagram repaired in `2f1e3a6` now sorts correctly and still draws two checkouts' sessions as one interaction, which is a smaller instance of the same missing identity.

---
Resolved: referred (C4) — the session identity on emitted lines is C4's first measurement, and sorting alone does not separate the sessions; 260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md `### C4`

---
Resolved: `bin/monitor` serves `/api/dashboard` from this checkout's lines alone. The new `_read_events()` parses every line rather than the last `MAX_EVENTS`, drops the lines whose `checkout` is present and differs from the identifier in `fusion-workbench/.checkout-id`, sorts what remains on the raw `ts` string, then takes the last `MAX_EVENTS`; `_read_checkout_id()` reads that file and never mints it. All four readings measured above are downstream of the one array, so the single change repairs all four, and the method's own comment names them and cites this record. A line carrying no `checkout`, and an identifier that cannot be read at all, each keep every line — today's behaviour exactly, which is what keeps the whole pre-C4 log on the dashboard. Plan step 7 of `260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`; the marker was already `_c_` from the referral, so this note is appended beside it rather than replacing it.
