# Analysis: commit cadence of autonomous sessions

**Date:** 2026-11-09 15:15
**Type:** Document Study (a measurement over two event logs)
**Status:** Complete
**Requested by:** orchestrator, as step 18 of `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md`

## Question

How long does an autonomous session go between two commits? The plan reads campaign state once per commit cycle, so the gap between commits is the delay a steering act can meet before a working session sees it. Step 18 fixes the acceptance figure as the p90 of those gaps and asks on which side of 60 minutes it falls. The answer decides the wording of step 20's skill text and whether the spec's second stop clause goes to the user before step 19.

## Scope

Two event logs, each read from a commit and from no working tree.

| | Consuming project | fusion |
|---|---|---|
| Repository | `/System/Volumes/Data/Projects/productive/F03_digital-leadership/ax-k2-3` | this repository |
| HEAD | `56c19983ac4eea74342f364ef10ff5863573d6c3` | `9d9cc8415acf0e064481ab2631d0413040f99e3d` |
| Commit date | 2026-11-04 23:57:58 +01:00 | 2026-11-09 15:06:58 +01:00 |
| Branch | `main` | `campaign` |
| `git status -sb` | `## main...origin/main`, level with its remote-tracking ref; one modified file, `fusion-workbench/.fusion-setup` | `## campaign`, no upstream shown; two modified files, the event log and the plan's control file |
| Log at that commit | 20293 rows, 2026-06-21 14:01:44 to 2026-11-04 22:57:57 UTC | 9064 rows, 2026-07-06 16:51:48 to 2026-11-09 14:06:58 UTC |
| SHA-256 of the extracted log | `5faba1e4e814f05e0ec240d944e4190aed305fa3f9c387b033cdb74da6394e47` | `f3ee381faaf9055ba9c2c516345118a946b3263fdb988228fe10083cde683c89` |

No fetch was run in either repository, so whether the consuming project's remote has moved since its last fetch is not known. Every figure below is true of these two commits. fusion's log at HEAD does not hold the row of the HEAD commit itself, because the lock appends that row after the commit lands.

The consuming project's clone stands at the commit the plan's `## Current State` measured, so the baseline can be recomputed on the same bytes.

## Findings

### The figures

Gaps are in minutes. A gap is the time between two consecutive `commit` rows of one `session_id`, read from the rows' `ts`. Gaps of 24 hours or more are cut.

| Log | Group | Sessions | Gaps | Cut | median | p75 | p90 | p95 | min | max |
|---|---|---|---|---|---|---|---|---|---|---|
| Consuming project | autonomous | 45 | 1369 | 4 | 21.2 | 56.3 | **137.8** | 260.8 | 0.0 | 1275.0 |
| Consuming project | all | 152 | 3259 | 20 | 16.7 | 51.5 | 139.9 | 309.7 | 0.0 | 1429.3 |
| fusion | autonomous | 11 | 470 | 1 | 14.0 | 47.2 | **146.1** | 340.7 | 0.0 | 814.6 |
| fusion | all | 59 | 1135 | 3 | 14.9 | 41.3 | 126.4 | 305.5 | 0.0 | 1202.8 |
| Pooled | autonomous | 56 | 1839 | 5 | 18.6 | 54.1 | **139.8** | 278.4 | 0.0 | 1275.0 |
| Pooled | all | 211 | 4394 | 23 | 15.9 | 49.1 | 137.4 | 309.7 | 0.0 | 1429.3 |

The third column counts the session ids that carry at least one `commit` row. Every autonomous session in both logs contributes at least one gap. Among all sessions, 137 of the 152 and 53 of the 59 do; the others hold a single commit row.

The "all" rows contain the autonomous sessions. They are the baseline the plan recorded, not a comparison group.

### The command

One command per log produced both of its rows. The log comes from the named commit on standard input.

```
git -C /System/Volumes/Data/Projects/productive/F03_digital-leadership/ax-k2-3 show 56c19983ac4eea74342f364ef10ff5863573d6c3:fusion-workbench/orchestrator-events.jsonl | node -e 'const R=require("fs").readFileSync(0,"utf8").split("\n").filter(Boolean).map(l=>JSON.parse(l));const A=new Set(R.filter(r=>r.event==="gate_response"&&r.session_id&&/answered by \*\*Mode:\*\* autonomous/.test(r.detail||"")).map(r=>r.session_id));const S={};for(const r of R)if(r.event==="commit"&&r.session_id)(S[r.session_id]=S[r.session_id]||[]).push(Date.parse(r.ts+"Z"));const f=(n,k)=>{const ids=Object.keys(S).filter(k),g=[];let c=0;for(const id of ids){const t=S[id].sort((a,b)=>a-b);for(let i=1;i<t.length;i++){const d=(t[i]-t[i-1])/6e4;d<1440?g.push(d):c++}}g.sort((a,b)=>a-b);const q=p=>g[Math.floor((g.length-1)*p)].toFixed(1);console.log(n,"sessions",ids.length,"gaps",g.length,"cut",c,"median",q(.5),"p75",q(.75),"p90",q(.9),"p95",q(.95),"min",g[0].toFixed(1),"max",g[g.length-1].toFixed(1))};f("autonomous",id=>A.has(id));f("all",()=>true)'
```

Its output on the consuming project's log:

```
autonomous sessions 45 gaps 1369 cut 4 median 21.2 p75 56.3 p90 137.8 p95 260.8 min 0.0 max 1275.0
all sessions 152 gaps 3259 cut 20 median 16.7 p75 51.5 p90 139.9 p95 309.7 min 0.0 max 1429.3
```

For fusion's log the same `node -e` program reads `git show 9d9cc8415acf0e064481ab2631d0413040f99e3d:fusion-workbench/orchestrator-events.jsonl`, run in this repository. For the pooled rows it reads both blobs one after the other, `{ git -C <clone> show <commit>:<log>; git show <commit>:<log>; } | node -e '<the same program>'`. Pooling by concatenation is sound because the two logs share no session id (294 ids in one, 181 in the other, none in both).

### How a percentile is defined here

The percentile `p` of `n` gaps sorted ascending is the element at index `floor((n − 1) · p)`, counted from zero. No interpolation takes place, so every figure is a gap that occurred. We keep this one definition for every figure in the report.

We chose it because it reproduces the plan's baseline to the digit. Linear interpolation between the two neighbouring ranks moves the autonomous p90 by 0.1 minutes in the consuming project (137.9) and by 1.1 minutes in fusion (147.2). The largest shift in the table is fusion's autonomous p95, 350.1 instead of 340.7. No figure changes its side of 60 minutes under either definition.

### The baseline agrees with the plan, with one exception

The plan's `## Current State` records, for the consuming project's log over all sessions: 3259 gaps in 152 sessions, median 16.7, p75 51.5, p90 139.9, p95 309.7. The command above returns the same six values. The plan's second baseline, the gaps since 2026-11-01, also reproduces: 351 gaps, median 15.6, p90 136.2, counting a gap when its earlier commit falls on or after that day.

The exception is the count of autonomous sessions. The plan says 49 sessions carry a `gate_response` answered by `mode` autonomous. The exact string `answered by **Mode:** autonomous` identifies 45. The number 49 is what a search for the letters "autonom" anywhere in a `gate_response` row returns. The four extra sessions are named below.

### The acceptance figure

**The autonomous p90 is above 60 minutes in each reading: 137.8 minutes in the consuming project's log, 146.1 in fusion's, 139.8 pooled.** All three exceed the threshold by a factor above two, so no choice among them changes the branch the plan takes.

The plan's wording does not say which of the three it means. Step 18 asks for the figures "stated per log" and then names "the p90 of the autonomous-session gaps" in the singular. `## Where this work stops` speaks of "an autonomous-session p90". Three readings fit that text:

| Reading | Figure | What speaks for it |
|---|---|---|
| The consuming project's log | 137.8 | The plan's baseline in `## Current State` is this log alone, and the measured case the work is built on is this project. |
| fusion's log | 146.1 | Step 18 names "this repository's own log" beside the other with equal weight. It is the least favourable of the three. |
| Pooled | 139.8 | Nothing in the wording. It is dominated by the consuming project, which supplies 1369 of the 1839 gaps. |

We state the ambiguity and leave the choice to the user. The consequence the plan names is the same for all three: the phrase "at the holding session's next commit" stands in step 20's skill text, and the spec's second stop clause is put to the user with the figure before step 19 is dispatched.

Sixty minutes sits at the 76.9th percentile of the autonomous gaps in the consuming project and at the 77.9th in fusion. Roughly three gaps in four are under an hour; the p90 lies in the remaining quarter.

### What the data can carry, and what it cannot

**Which sessions are autonomous.** All 440 marker rows in the consuming project and all 252 in fusion use the one spelling `answered by **Mode:** autonomous`, and every one carries a `session_id`. There is no second spelling of the marker. The earliest marker row is dated 2026-09-21 15:09:29 UTC in fusion and 2026-09-22 21:01:56 UTC in the consuming project, so the autonomous figures cover the period from those days onward and nothing earlier.

Beside the marker rows, 31 `gate_response` rows in the consuming project and 12 in fusion mention autonomy in other words. They are free-text records of an instruction the user gave in chat, such as "proceed autonomously" or "mode set autonomous on the user's word". Four of them in the consuming project name the field without the words "answered by" and fall in sessions the marker already identifies. Counting every such row as a marker raises the session count to 49 and 14 and moves the p90 to 131.6 and 141.9. The result does not depend on where the line is drawn.

**The label is per session, the mode is per package.** A session counts as autonomous when one marker row carries its id. The gaps before that row, and gaps spent on a package that is not autonomous, count as well, because a `commit` row names no package. Restricting the measure to gaps that begin at or after the session's first marker row leaves the consuming project unchanged (1184 gaps, p90 137.8) and lowers fusion's p90 to 103.7 over 311 gaps.

**Rows without a `session_id`.** The consuming project's log holds 394 `commit` rows without one, the last dated 2026-08-27 02:12:33 UTC; fusion's holds 332, the last dated 2026-08-26 10:12:17 UTC. They belong to no session and enter no figure. None is later than the first row that carries an id, and all predate the autonomous mode by more than three weeks. The exclusion costs the autonomous figures nothing. It shortens the all-sessions baseline to the period from 2026-08-27 onward, which the plan's baseline shares.

**From when the `commit` rows are machine-written.** `rules/commit-lock.md` `### The lock writes the commit event` dates the machine-written row to v10.8.0, whose documentation commit `67f7782a` is dated 2026-08-27 04:24 UTC. The rows themselves show the change. Before it, `commit` rows come in seven key shapes in the consuming project and eight in fusion, with `task`, `turn` or `agent` keys and in part a bare hash as `detail`. From 2026-08-27 05:20:06 UTC in the consuming project and 2026-08-27 16:09:11 UTC in fusion, every `commit` row has the single shape `ts, event, detail, person, checkout, session_id` with `detail` as hash and subject, and no row of an older shape follows. That every row since is the lock's is inference from this uniformity. Two checks support it. No autonomous session holds two identical `commit` rows. And among the rows with a session id whose hash still resolves to one commit in the clone, the `ts` follows that commit's committer time by 0 to 15 seconds for all 1177 such rows in fusion, and by 0 to 60 seconds for 3129 of 3166 in the consuming project, the largest lag being 901 seconds. This check reads hashes; the measure does not. The whole autonomous period lies inside the machine-written period in both logs.

**Rebased commits and settling commits.** The measure reads `ts` and no hash. In the consuming project 265 of the 3431 rows with a session id name a hash the clone does not resolve to exactly one commit; they count as they stand. Settling commits write no row and shorten no gap, as the plan intends: 10 of the 1900 `commit` rows in autonomous sessions carry a `chore(events)` subject. The consuming project's autonomous sessions hold 57 rows for merge commits; without them its p90 is 140.2.

**Commits that have no row.** A commit made outside the lock, or without an exported session id, writes no row and would shorten a gap if it had one. Of the non-merge commits on the consuming project's head since 2026-09-22, 64 of 2811 are named by no row and are not settling commits; in fusion since 2026-09-21 the count is 49 of 913. These counts cover all sessions. The measured gaps are therefore upper bounds on the true commit gaps by a small margin, and they are exact for the commits the orchestrator makes under the lock, which is where the planned read sits.

**A session id is not a sitting.** The id is Claude Code's own, and `hooks/session-id.ts` states that `--resume` and `--continue` preserve it. The SessionStart hook writes its row once per id and suppresses every later one (`hooks/lib/orchestrator-events.ts`, "Once per session, keyed on the identifier"), and both logs hold exactly one hook-written row per autonomous session. The log therefore cannot count resumes, and no row kind marks a context compaction. That an id survives a compaction is consistent with this design and is not verified from the rows. What the rows do show: the 45 autonomous sessions of the consuming project span a median of 24.6 hours from first to last commit and at most 121.6 hours, and 35 of them cross a UTC calendar day. For fusion's 11 the median is 19.1 hours, the maximum 179.2, and 10 cross a day. In 10 sessions of the consuming project and 3 of fusion, commit rows follow the session's own `session_end` row.

**Waiting inflates the upper tail, and the 24-hour cut removes almost none of it.** The cut drops 4 autonomous gaps in the consuming project and 1 in fusion. A session that sits overnight for eight or twelve hours stays in the measure. The tail above 60 minutes holds 316 gaps in the consuming project and 104 in fusion, and its composition is as follows.

| Among the autonomous gaps over 60 minutes | Consuming project (316) | fusion (104) |
|---|---|---|
| A `gate_response` without the marker, so one the mode did not answer, lies inside the gap | 81 | 51 |
| The gap contains more than 60 minutes in which the session wrote no row of any kind | 210 | 85 |
| The longest such silence begins at a `commit` row | 154 | 67 |
| It begins at a `task_done` row | 93 | 9 |
| It begins at a `gate_hit` row | 16 | 11 |
| It begins at a start row of a dispatch (`task_start` and its siblings) | 26 | 5 |
| It begins at another row kind | 27 | 12 |

The last five lines partition the gaps by the row that precedes the longest stretch without a row. In 247 of 316 and 76 of 104 long gaps, the longest silence starts where the session has just committed or just received a finished task. A dispatch that ran for more than an hour is the rarer case, 26 and 5. Of the gaps between four and twenty-four hours, 46 of 77 in the consuming project and 17 of 33 in fusion begin between 19:00 and 02:59 UTC. That these silences are a session waiting for its user, or left open overnight, is inference from this pattern. No row says so, and an orchestrator working for an hour in its own loop without a dispatch would look the same.

**The spread across sessions.** fusion's autonomous figure rests on 11 sessions from two checkouts, and the three largest supply 54.5 percent of its 470 gaps. The consuming project's rests on 45 sessions from eight checkouts, the three largest supplying 24.0 percent. Per session, among those with at least ten gaps, the p90 ranges from 29.4 to 325.2 minutes in the consuming project (34 sessions, 8 at or under 60) and from 15.9 to 324.6 in fusion (11 sessions, 4 at or under 60). A minority of sessions keeps the cadence under an hour at p90; most do not.

**A gap count is not a waiting time.** The p90 counts each gap once. A steering act arrives at a moment in time and is more likely to land in a long gap than in a short one. In the consuming project 75.9 percent of the 1335 hours covered by autonomous gaps lie in gaps over 60 minutes; in fusion 82.9 percent of 476 hours. Measured from a random moment inside a gap, the wait until the next commit has a p90 of 384 minutes and 423 minutes. The plan defines the acceptance figure over gaps, and we report it so. This second reading carries the same idle time and is worse for it.

### Readings beside the acceptance figure

None of these replaces the plan's figure. They show how far it moves when one assumption changes. All use the percentile definition above.

| Reading | Consuming project | fusion |
|---|---|---|
| The plan's measure | 1369 gaps, p90 137.8 | 470 gaps, p90 146.1 |
| Every `gate_response` that mentions autonomy counts as a marker | 1498 gaps, p90 131.6 | 520 gaps, p90 141.9 |
| Only gaps beginning at or after the session's first marker row | 1184 gaps, p90 137.8 | 311 gaps, p90 103.7 |
| Only gaps with no marker-less `gate_response` and no `session_start` or `session_end` row inside | 1189 gaps, p90 98.3 | 372 gaps, p90 84.9 |
| Row silences over 60 minutes removed from each gap, unless a dispatch is in flight | p90 61.3 | p90 43.4 |
| Row silences over 30 minutes removed from each gap, unless a dispatch is in flight | p90 44.1 | p90 31.9 |

The last two rows estimate the time in which the session wrote rows. A dispatch counts as in flight from a start row until its done row or the next commit. Both rows depend on a threshold the plan did not set. Removing every long silence, a dispatch in flight included, gives 58.3 and 42.6 at the 60-minute threshold and 36.3 and 26.8 at 30 minutes. For the consuming project this estimate lies between 36.3 and 61.3 minutes and does not settle a side of 60. For fusion it lies between 26.8 and 43.4. The secondary readings were computed with scratch scripts that are not kept; their definitions are the row labels.

## Implications

The plan's criterion is not met. Under every reading of "the autonomous p90" the figure is above 60 minutes, by a wide margin and independent of the percentile definition, the marker's strictness or the log chosen. Step 20's replacement phrase "within about an hour" would be false for one gap in four.

The figure measures how long a session id stays between two commits, and a session id stays open while nobody works in it. Most of the tail is a session that has committed, or finished a task, and then writes nothing for hours. The logs cannot separate that idle time from work, because no row marks a wait, a resume or a compaction. A tighter figure for working time would need such a row; with the present rows it can only be estimated under a threshold, and the estimate is not stable enough in the consuming project to state a side of 60.

For the stop clause the composition matters more than the number. A steering act that arrives while a session is idle is read at that session's first commit after its user returns, whatever the commit cadence is while it works. A steering act that arrives while a session is working meets a gap that is under an hour in roughly three cases out of four, and the activity estimate puts the working p90 between half an hour and an hour. Whether "at the holding session's next commit" is an acceptable intervention delay on those terms is the user's ruling, as the spec's second stop clause says.

## Recommendations

1. **orchestrator:** put the spec's second stop clause to the user before step 19 is dispatched, with the three p90 figures (137.8, 146.1, 139.8 minutes) and the composition of the tail from `### What the data can carry, and what it cannot`. The plan's `## Where this work stops` names the two outcomes: the user accepts the measured figure as the intervention delay, or ruling B goes back to the user.
2. **orchestrator:** leave the phrase "at the holding session's next commit" as it stands in step 20's dispatch. The plan replaces it only at or under 60 minutes.
3. **implementation-planner, or the orchestrator when it next amends the plan:** correct the sentence in `## Current State` that counts 49 autonomous sessions. The marker the plan itself specifies in step 18 identifies 45.

## Filed Issues

None. The dispatch confined this run to the report. The one finding that would otherwise be an issue is recommendation 3.

## Sources

- `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md`: `## Current State` (the baseline), steps 17, 18 and 20, `## Where this work stops`.
- `261108-2135-spec-campaign-the-frame-for-work-spread-over-several-checkouts.md`: `### C3`, `## Stops when`, the ruling B row of `## Clarification round`.
- `rules/commit-lock.md` `### The lock writes the commit event`.
- `260912-2041_*_should-the-commit-lock-skip-its-row-when-the-commit-carries-nothing-but-the-log.md`, for why a settling commit writes no row.
- `261109-1313-a-commit-row-names-a-hash-a-later-rebase-removes-so-last-push-by-ancestor-test-under-reports.md`, for the rebased hashes.
- `bin/fusion-commit-lock`, the line that stamps the row with `date -u +%Y-%m-%dT%H:%M:%S`: the `ts` values are UTC and carry no zone suffix, which is why the command appends `Z` before parsing.
- `hooks/session-id.ts` (header) and `hooks/lib/orchestrator-events.ts` ("Once per session, keyed on the identifier").
- The two event logs at the commits named under `## Scope`; `git log` of both repositories for committer times and subjects, read only.

## Open Questions

- [ ] Which of the three p90 figures does the user take as the acceptance figure? All three are above 60 minutes.
- [ ] Does the user accept the measured figure as the intervention delay, or is the read point of ruling B reopened?
- [ ] Is a figure for working time wanted? The present rows cannot give one without a threshold, and a row marking a wait or a resume does not exist.
