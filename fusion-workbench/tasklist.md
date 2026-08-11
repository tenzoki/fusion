# Tasklist

**Generated:** 2026-08-10 17:23
**Domain:** code
**Active Circle:** none (unaffiliated backlog)
**Git HEAD at build time:** `5ef92eb`
**Records inventoried:** 47
**Open tasks:** 45 (0 blocked on a missing prerequisite task; 20 need a human decision before an executor can start)
**Blocked:** 0
**Close without work:** 2

---

## Read this first

**The queue is ordered ungated-first this run.** Every task that an executor can start without a
user decision comes before every task that carries a `**Human gate:**` line. Tasks 1 to 25 are
dispatchable now; tasks 26 to 45 need an answer first, and the plan for this session is to answer
them in one batch after the ungated block is worked. Dependencies still win where they are genuine:
where an ordering choice was reversed to honour the ungated-first preference, the task says so.

**Two of the forty-seven need no work.** They are in `## Close without work` at the bottom, not
queued. One was resolved by later work and one is no longer reproducible. So 45 of 47 are genuinely
open, and all 47 were re-verified against the working tree at `5ef92eb`.

**Seven records are new since the 14:34 queue** and were never verified before: tasks 1, 3, 13, 24,
25, 39 and 45. Five of the seven came out of the `coderev` pass over `430d73a..HEAD`; two were filed
by the session that produced that range.

**Five records that the 14:34 queue carried have since closed** and are gone from here — the stray
markup tag, the Setup helper absence, the churn key anchor, the archive durability premise and the
Plane key documentation. `## Changelog` names each one and the commit that closed it.

**One task's evidence got stronger while this queue was being built.** Task 2 (the frozen session
bookkeeping) now has a live reproduction in the event log, written by the drift check the half-fix
installed: at 14:29:55 the state file said 0 commits while git counted 7. The detection half works;
the prevention half is still missing, which is what the task is for.

## Scope of this queue

This queue covers exactly the **47 open defect records in `fusion-workbench/shared/issues/`** — every
file matching `*_o_*.md` or `*_p_*.md` in that one directory, counted at `5ef92eb`. There are no
`_p_` files; all 47 are `_o_`.

Deliberately **not** inventoried, by the session's own instruction. Their absence here says nothing
about their state:

- **1 open plan** in `shared/planning/` (`260801-1122_o_spec-normative-consolidation.md`).
- **7 open decisions** in `shared/decisions/`, two of them filed today
  (`260810-1544` on a guarded-call convention for `bin/` helpers, `260810-1635` on who must update an
  artefact when the behaviour it explains changes).
- **16 open defect records inside `fusion-workbench/circles/*/issues/`**, left for a later session.
- Review files and analyses in `shared/`.

Do not read an absence from this queue as "nothing else is open".

## Verification

All 47 were checked against the working tree at `5ef92eb`, by reading the file or running the command
the record cites. Each task carries a `**Verified open:**` line saying what was read or run and what
it said.

**On reuse of the previous queue's verification.** The queue this file replaces was built at
`430d73a` on 260810-1434 and inventoried 45 records. Measured against the current store: **40 are
still open, 5 have since closed** (all five carry `_c_` on disk — no renames, no losses), and **7
currently-open records were unknown to it**. Nine commits landed in between, so nothing was carried
forward unchecked: every one of the 40 survivors was re-run today, and the entries whose measurement
moved say so in place (tasks 2, 12, 14, 20, 22 for shifted line numbers or new evidence).

**Suite baseline, measured rather than assumed.** `cd hooks && npm test` at `5ef92eb`: **40 files,
1072 tests, all passing, 90.49s**. The 14:34 queue measured 39 files / 1040 tests; the new file and
the 32 new tests are the churn-key-anchor suite and the monitor warnings-panel cases added in the
range. Any task below that reports a red suite is reporting its own regression.

## Same class, not duplicates

Groups in this queue that look like one record split in two. Each is genuinely distinct, and in every
case the records say so themselves. Do not merge them.

| Group | Why they are distinct |
|---|---|
| Tasks 6, 7, 15 (three lint gates) | Three separate test files, three different weaknesses: a token match a decoy branch satisfies, an anchor that quotes the phrase it checks, and negative controls that never call the production helper. A fix to one teaches nothing to the other two. |
| Tasks 12, 13, 45 (three churn defects) | One is a comment naming a metric that no longer exists, one is a read-path filter the migration made necessary, one is a stand-down gate asking the wrong directory. They share two files and nothing else. |
| Tasks 8, 39 (review accountability) | Task 8 is coverage — passes that ran but did not tile the range. Task 39 is ordering — a pass correctly scoped to the whole range and overtaken by the release it was gating. `260810-1618` states plainly that fixing `260810-1205` does not fix it. |
| Tasks 14, 22, 37, 21 (four wrong counts) | A shipped README's site count, a record's prose against its own list, a review's totals against its own body, and a dashboard's session tally against the disk. Same class, four different producers. |
| Tasks 2, 21 (session bookkeeping) | Task 2 is four state surfaces freezing for a whole session; task 21 is two counts drifting by two inside one correct-looking total. The finer one is not a subset: its own invariant passed. |
| Tasks 17, 18 (suite instability) | A test count that moves between runs, and a timing case that fails under CPU contention. `260810-1135` cross-references `260810-0918` as "a different instability in the same suite". |
| Tasks 3, 25 (the monitor browser gate) | One is the wrapper's lifetime depending on a launcher that may not exist; the other is a test harness with no path for a machine that cannot allocate a pty. Both were found while fixing `260810-1557`, and neither is that record. |
| Tasks 19, 40 (a `bin/fusion-plane` flag) | One flag is undocumented in `usage()`; a different flag is silently ignored when passed without its partner. Same file, same family of silence, two different flags. |

## Routing

- **44 tasks route to `coder`** — TypeScript under `hooks/`, shell helpers under `bin/`, agent prompts
  under `agents/`, skill bodies under `skills/`, rule files under `rules/`, and documentation.
- **1 task routes to `ontocoder`** — task 44, whose payload is the two `stilwerk/default-voice-*.yaml`
  profiles as structured data.
- **Task 23** edits YAML frontmatter *inside* a skill body and is queued to `coder` anyway, with a
  routing note: splitting a four-line frontmatter edit away from the body edit in the same file costs
  more than the split buys.

## Human gates

Twenty tasks need a human answer before an executor starts. They are tasks **26 to 45**, in that
block for exactly that reason. Six kinds:

| Kind | Tasks |
|---|---|
| The record names two or more candidate fixes and explicitly refuses to choose | 27, 30, 32, 34, 39, 40, 41, 42, 43, 45 |
| A design question the record hands to the framework owner by name | 28 (should files move into a Circle), 36 (the marker-rename staging convention) |
| Acceptance cannot be pinned down from the record without a user answer | 26 (what the seeded permission grant is), 33 (authorship of an edit only the user can confirm), 43 (the record's own first step is "ask why, before writing anything") |
| A schema or template change to a file every consuming project holds a copy of | 31 (the Circle record template), 44 (the voice-profile schema) |
| The record's own closure is the question | 35 (is the second criterion moot now that the branch policy is gone?) |
| **Partial** — part of the work is ungated and named separately | 29 (`.plane-map.json` is answered, `.plane-outbox.jsonl` is not), 37 (fix the two counts now; whether totals become derived is the decision), 38 (detection is a `grep`; the overwrite semantics are the decision) |

Nothing in this queue is structurally destructive.

**Guard note.** Fifteen tasks write to a path the guard protects (`agents/**`, `rules/**`). In *this*
repository the protected-path measurement stands down (`hooks/lib/self-detect.ts`), so those writes
are not blocked here. Do not carry that assumption into a consuming project.

## Dependency graph

Two things this graph encodes, and they are different:

- **A subgraph means "these tasks edit one file."** Landing two of them is two commits, not one, and
  the second executor re-reads the file. Membership is the collision statement; no edge is drawn for
  a collision alone.
- **An edge means "the tail must land before the head."** Six edges carry real content dependencies
  and are labelled; the rest are ordering choices inside a contended file, made so an executor
  working top-to-bottom never has to jump.

Three honest readings of the shape:

- **`agents/orchestrator.md` is still the contended file, not a contended task.** Ten tasks touch it.
  One prompt carries the session loop, the Setup heuristic, the commit procedure, the dispatch
  contract, the drift check and the Phase 4 bookkeeping. It is a god-file, and the graph shows that
  rather than hiding it. `rules/fusion-workbench-conventions.md` is the second, with six.
- **Twenty-four tasks have no edge at all.** In a design DAG an orphan is a defect. In a work queue it
  is the good case: the task shares no file and no open decision with anything else and can be
  dispatched in any order.
- **One edge from the 14:34 graph was deliberately reversed.** It ran task 26 (seed a permission
  source) before task 5 (the citation root), both in `skills/setup/SKILL.md`. That was a file
  collision dressed as an ordering, not a content prerequisite, so the ungated task now goes first
  and the gated one re-reads the file. Nothing else was reordered against a dependency.

Node labels carry the priority and, where it applies, `gate` — the marker for a task an executor
cannot start on.

```mermaid
flowchart TD
  subgraph orch["agents/orchestrator.md — one prompt, six regions"]
    direction TB
    T1["T1 · a commit message survives an apostrophe<br/>high"]
    T2["T2 · the session's own bookkeeping stops freezing<br/>high"]
    T8["T8 · review coverage measured against the range<br/>high"]
    T16["T16 · one derivation of the queue's ground<br/>normal"]
    T20["T20 · the Cleanup wording stops excluding a live call point<br/>low"]
    T21["T21 · session counts derived, not tallied by hand<br/>low"]
    T24["T24 · Setup reads exit 3 as a missing build<br/>low"]
    T32["T32 · the dispatch prompt states the task's origin<br/>normal · gate"]
    T33["T33 · an unauthorised edit becomes visible<br/>normal · gate"]
    T39["T39 · a release states whether its range was reviewed<br/>normal · gate"]
  end

  subgraph conv["rules/fusion-workbench-conventions.md — the second god-file"]
    direction TB
    T9["T9 · exempt surfaces stop over-claiming<br/>normal"]
    T10["T10 · the tracked-workbench split gets complete<br/>normal"]
    T29["T29 · the layout tree names the Plane files<br/>normal · gate"]
    T30["T30 · decide whether archived records are readable<br/>normal · gate"]
    T36["T36 · a marker rename cannot be staged half-way<br/>normal · gate"]
    T42["T42 · a citation form that does not rot<br/>low · gate"]
  end

  subgraph skills["skills/setup and skills/next"]
    direction TB
    T5["T5 · the cross-file citation gets a root<br/>high"]
    T26["T26 · a fresh project stops prompting per tool call<br/>high · gate"]
    T31["T31 · a Circle states its state once<br/>normal · gate"]
    T38["T38 · a stale chat profile is detected<br/>normal · gate"]
  end

  subgraph churn["hooks/tracker.ts and hooks/lib/churn.ts"]
    direction TB
    T12["T12 · the noise list names one metric<br/>normal"]
    T13["T13 · the ranking stops promoting noise files<br/>normal"]
    T45["T45 · the stand-down asks the right directory<br/>low · gate"]
  end

  subgraph lints["hooks/lib/__tests__ — the four gates that landed together"]
    direction TB
    T6["T6 · the cascade gets executed, not read<br/>high"]
    T7["T7 · the drift lint anchors on the act<br/>high"]
    T15["T15 · a negative control calls the real helper<br/>normal"]
  end

  subgraph plane["bin/fusion-plane"]
    direction TB
    T19["T19 · the second test seam gets documented<br/>low"]
    T40["T40 · an unused flag stops being silent<br/>low · gate"]
    T41["T41 · the third key derivation<br/>low · gate"]
  end

  subgraph suite["test-suite reliability"]
    direction TB
    T17["T17 · the suite total stops moving<br/>normal"]
    T18["T18 · a timing case stops depending on load<br/>normal"]
    T25["T25 · a pty failure reads as a pty failure<br/>low"]
  end

  subgraph free["No shared file, no shared decision — dispatch in any order"]
    direction TB
    T3["T3 · a missing launcher stops orphaning the server<br/>high"]
    T4["T4 · the queue records its own ground<br/>high"]
    T11["T11 · backfill an empty Turn log<br/>normal"]
    T14["T14 · drop the stale ordering-site count<br/>normal"]
    T22["T22 · a record about counting counts once<br/>low"]
    T23["T23 · frontmatter hygiene<br/>low"]
    T27["T27 · a red baseline stops blocking every task<br/>high · gate"]
    T28["T28 · a route from existing work into a Circle<br/>high · gate"]
    T34["T34 · the diagram is checked against its prose<br/>normal · gate"]
    T35["T35 · close the halt record or state what is left<br/>normal · gate"]
    T37["T37 · the review's totals match its own body<br/>normal · gate"]
    T43["T43 · why the review file was never written<br/>low · gate"]
    T44["T44 · the writing profile answers to its name<br/>low · gate"]
  end

  T2 --> T8
  T2 --> T20
  T2 --> T21
  T4 -->|"mandate the head line before consolidating the parser that reads it"| T16
  T5 -->|"if the section moves to a rule file, the duplicate goes in the same change"| T16
  T15 -->|"factors the table check into a callable helper this task extends"| T16
  T12 -->|"the corrected comment travels with the constant this task may move"| T13
  T10 -->|"move the second enumeration first, so the two Plane files land once"| T29
  T9 --> T42
  T19 --> T40
  T40 -->|"the wire-format question is the same decision, one layer out"| T41
  T8 -->|"the same range-against-reviews computation, used as a precondition"| T39
  T26 --> T38
  T32 --> T33
```

**One collision the graph cannot show.** Task 3 edits `bin/monitor`, and `bin/monitor` is also one of
task 2's three named files. Task 3 is a five-line change to the wrapper's tail; task 2's monitor half
is a divergence computation it does not yet have. They do not conflict in practice, but whoever lands
the second one re-reads the file.

---

## Tasks

### 1. Take the shell out of the commit-message path

- **ID:** `I:260810-1535-commit-apostrophe`
- **Source:** `fusion-workbench/shared/issues/260810-1535_o_the-orchestrators-commit-procedure-truncates-any-message-containing-an-apostrophe.md`
- **Executor:** `coder`
- **Files:** `agents/orchestrator.md` Phase 2 Step 3b (the commit-lock invocation and the HEREDOC
  instruction two lines below it); `skills/commit/SKILL.md` and `skills/cleanup/SKILL.md` (check both
  for the same nesting); `rules/workbench-stash-and-lock.md` (read-only — it documents the canonical
  `with <tag> -- <cmd...>` form)
- **Depends on:** none
- **Priority:** high
- **Status:** [ ] open
- **Detail:** Step 3b tells the orchestrator to commit through
  `bin/fusion-commit-lock with orchestrator -- bash -c "git add …; git commit …"` and, two lines
  later, to "use HEREDOC for commit messages to ensure correct formatting". Followed together, the
  heredoc body ends up inside a quoted `bash -c` argument, and **the first apostrophe in the message
  closes that quoting**. Everything after it is re-parsed by the outer shell.
  **Measured, not reasoned:** commit `045a14f` in this repository landed with its message cut off
  mid-sentence at `so a consuming project` — the apostrophe in `project's` ended the argument — and
  three further lines of the message were executed as commands, reporting `command not found: be`,
  `command not found: folder`, `command not found: were`. The commit's *content* was correct and
  complete; only the message was destroyed. It was repaired with `git commit --amend -F <file>`,
  producing `4f16c60`.
  **The failure is silent in the direction that matters.** `git commit` succeeded, the lock helper
  reported exit 0, and the stray `command not found` lines appeared *after* the success line, where
  they read as noise from the helper rather than as evidence that the message was mangled. A session
  that does not read its own commit back never notices — and this project's convention is that commit
  messages carry the reasoning, which is exactly the part that is lost.
  **The trigger is ordinary English.** `project's`, `doesn't`, `agent's`, `it's`, any possessive.
  **Take option 1 from the record, not option 2.** Write the message to a file and run
  `git commit -F <file>` with no nested quoting: the orchestrator has a `Write` tool and can produce
  the file directly, which removes the shell from the message path entirely so no character in the
  message can be special. It composes with the lock through the explicit
  `acquire` / `git commit -F` / `release` form Step 3b already permits "if the commit sequence has
  internal control-flow". Option 2 — keep `bash -c` and quote more carefully — is the shape that just
  failed, made conditional on getting the quoting right every time; `rules/critical-stance.md` §2
  names that pattern.
  **Scope note from the record, and it is load-bearing:** the `with <tag> -- <cmd...>` form is
  documented as canonical in `rules/workbench-stash-and-lock.md` and is the right pattern for commands
  with no free text in them. The defect is combining it with a heredoc carrying prose. Whatever is
  written must say which form belongs to which case, or the next author reaches for `with` again
  because it is labelled canonical.
- **Acceptance:** a commit message containing an apostrophe, a backtick and a `$` lands verbatim;
  the message never passes through a nested `bash -c` argument; `/fusion:commit` and `/fusion:cleanup`
  are checked for the same nesting and fixed or cleared explicitly; the prompt states which of the
  two lock forms belongs to a command carrying free text.
- **Verified open:** `agents/orchestrator.md` Phase 2 Step 3b still carries both instructions and the
  `bash -c` wrapper. The evidence in the record is a commit in this repository's own history —
  `git log -1 045a14f` shows the truncated message, and `4f16c60` is the repaired version, both
  reachable at `5ef92eb`.

### 2. Stop the session's own bookkeeping freezing, and make the freeze reach the surfaces that report it

- **ID:** `I:260801-2038-frozen-state`
- **Source:** `fusion-workbench/shared/issues/260801-2038_o_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md`
- **Executor:** `coder`
- **Files:** `agents/orchestrator.md` (the Turn-boundary write, `### Drift check`, Phase 4),
  `skills/setup/SKILL.md` (the interrupted-session check), `bin/monitor`
- **Depends on:** none
- **Priority:** high
- **Status:** [ ] open
- **Detail:** Three of the four session-state surfaces stop being updated after Turn 1 while the
  session runs on. Measured **five times** across five sessions before filing: `agentstate.yaml` said
  `commits: 0` while `git rev-list --count` said 6, 7, 8, then 12; a Circle record said
  `Status: anticipated` with an empty Turn log while the Circle had been active for days; a
  session-history file said `Directive: (not yet stated)` while the Directive was set and eight hours
  of work followed. The one surface that never froze is `orchestrator-events.jsonl`, and that is the
  diagnostic: event emission is a per-action call that cannot be forgotten without the action failing,
  while the other three are end-of-Turn writes a session can skip with nothing breaking. Resume is the
  feature this breaks — the state file is authoritative precisely because the session that wrote it is
  gone.
  **Half of the fix has landed and its own limits are recorded.** `agents/orchestrator.md` carries a
  `### Drift check` attached to four event emissions, which is candidate 2 (detection). What remains:
  - **Candidate 1, prevention, is not built.** The Turn-boundary write still stands as its own
    obligation; it does not ride the commit. That is the shape that was skipped, now, six times.
  - **`/fusion:setup` does not compute the divergence.** The orchestrator's inlined Setup Step 1 does;
    `skills/setup/SKILL.md` carries the same steps for the user-triggered path and was out of scope.
  - **`bin/monitor` does not compute it either.** Note the collision with task 3, which edits the tail
    of the same file.
  - Candidate 3 (let the reconciler repair it) is rejected in the record and must stay rejected — it
    would put two writers on the session-state surfaces.
  - **A prompt-only fix cannot reach the session that writes it.** An agent prompt is loaded at session
    start, so the enforcement has to sit where something runs unasked: a hook, or a `bin/` helper that
    `/fusion:setup`, the monitor and the reconciler all call.
- **Acceptance:** the Turn-boundary write rides an obligation the session already holds rather than
  standing alone; `/fusion:setup` computes the commit divergence on the user-triggered path; the
  mid-session Circle supersession case stays named, because that is what produced the dangling resume
  anchor; the reconciler still reports drift and still does not repair it; whatever is built, the
  session that installs it is not the session expected to run it.
- **Verified open, and the evidence has strengthened:** `grep -c "Drift check" agents/orchestrator.md`
  → 6, so the detection half is present. `grep -c "rev-list --count"` → `skills/setup/SKILL.md: 0`,
  `bin/monitor: 0`: both named gaps are unchanged. **`grep -c state_drift
  fusion-workbench/orchestrator-events.jsonl` now returns 2, where the 14:34 queue measured 0.** The
  second of the two, written at 14:29:55, is a live reproduction of this record: *"agentstate.yaml says
  0, git counts 7 since 430d73a. The Turn-boundary write was never performed during the Turn."* The
  check fires and reports correctly; nothing prevents the freeze it reports.
  `fusion-workbench/agentstate.yaml` does not exist at the moment — the last session deleted it at
  Cleanup, as designed — so the state surface itself cannot be inspected; the event log is what
  outlived it, which is the reason the drift entry says so in its own text.

### 3. Stop a missing browser launcher from taking the monitor's server down with it

- **ID:** `I:260810-1558-monitor-orphan`
- **Source:** `fusion-workbench/shared/issues/260810-1558_c_a-missing-open-command-exits-the-monitor-wrapper-under-set-e-and-orphans-the-server-it-forked.md`
- **Executor:** `coder`
- **Files:** `bin/monitor` — the browser-launch block at the tail, after the `trap` and before
  `wait $SERVER_PID`
- **Depends on:** none
- **Priority:** high
- **Status:** [x] done — launcher chosen by platform (`open` / `xdg-open`) behind `command -v`,
  launch suffixed `|| true`. Verified by direct before/after measurement under a pty (before:
  `WRAPPER_EXIT=127` with the server orphaned to ppid 1 and still serving; after: wrapper alive,
  server its child, SIGINT stops both) and by `monitor-warnings-panel.test.ts` — exit 0, 12/12.
  History: `fusion-workbench/shared/history/260810-1807-coder-monitor-launcher-lifetime.md`
- **Detail:** `bin/monitor` runs under `set -euo pipefail`, forks the python server, installs an
  `INT`/`TERM` trap that kills it, and then runs `open "http://localhost:$PORT"` inside an
  `if [[ -t 1 && -z "${MONITOR_NO_BROWSER:-}" ]]` gate before reaching `wait $SERVER_PID`. `open` is a
  macOS command. On Linux, or on any macOS whose `PATH` is narrowed, it exits 127 — and under `set -e`
  that exit is the wrapper's, so `wait` is never reached.
  **Measured, not inferred**, in the record:
  `bash -c 'set -euo pipefail; if [[ 1 == 1 ]]; then nosuchcmd_xyz "u"; fi; echo REACHED_WAIT'` prints
  the `command not found`, exits 127, and never prints `REACHED_WAIT`. A failing command inside an `if`
  body is not exempt from `set -e`; only the condition is.
  **The consequence is a leak the user cannot see.** The forked python server is not killed. It goes on
  serving and holding the port while the wrapper the user is watching has exited, and the trap dies with
  the wrapper, so Ctrl+C in that terminal no longer stops it — the server has to be found by port and
  killed by hand. The user sees the banner, gets their prompt back, and a listener stays behind.
  **Age and reach:** pre-existing, not introduced by the `[ -t 1 ]` gate added in session `260810-1402`.
  Before that gate the same 127 exit happened on *every* start on such a platform; the gate narrows the
  reach to the interactive case, because a non-interactive caller never runs `open` at all. That is why
  it was filed rather than folded into that fix.
  **Shape of a fix, from the record:** `open … || true`, or a launcher chosen by platform
  (`open` / `xdg-open`). Either way the server's supervision must not depend on the browser.
- **Acceptance:** an absent or failing browser launcher leaves the wrapper running, the trap installed
  and `wait $SERVER_PID` reached; Ctrl+C still stops the server on a platform with no `open`; the
  non-interactive path is unchanged; the monitor suite stays green.
- **Verified open:** read the tail of `bin/monitor` at `5ef92eb`. `set -euo pipefail` is in force, the
  `if [[ -t 1 && -z "${MONITOR_NO_BROWSER:-}" ]]` block calls `open` bare with no `|| true` and no
  platform dispatch, and `wait $SERVER_PID` sits after it.

### 4. Make the work queue record the ground it was built on

- **ID:** `I:260810-0431-queue-ground`
- **Source:** `fusion-workbench/shared/issues/260810-0431_o_the-work-queue-does-not-record-the-ground-it-was-built-on.md`
- **Executor:** `coder`
- **Files:** `agents/taskplanner.md` Step 4 (the mandated tasklist header)
- **Depends on:** none
- **Priority:** high
- **Status:** [ ] open
- **Detail:** `agents/taskplanner.md` Step 4 mandates a four-line header — `**Generated:**`,
  `**Domain:**`, `**Open tasks:**`, `**Blocked:**` — and none of them says which Circle the queue was
  built for. A run that follows the specification to the letter produces a queue that cannot afterwards
  be told apart from one built under different ground. Two real queues measured in the record: the
  260807 queue carried an `**Active Circle:**` line on its own initiative, the 260810 queue did not,
  and nothing in Step 4 made either wrong. The consumer-side half already landed
  (`agents/orchestrator.md` `### The queue's ground`), and its retirement at closure fires only for a
  queue that names its Circle; for one that does not, the verdict falls back to comparing modification
  times, which a checkout or a copy resets. So the exact half of the fix covers a format one run
  happened to produce and the weak half covers the format the specification actually mandates — which
  is backwards. **The question is undecidable without the stamp:** which Circle a queue was built *for*
  cannot be recovered from its text, because the task `**Source:**` paths do not answer it. The fix is
  one line in one producer, written on every run, with an explicit `none` when no Circle is active so
  the absence is a recorded fact rather than an omission.
- **Note for the executor:** *this* queue carries the line (`**Active Circle:** none (unaffiliated
  backlog)`) because the dispatch asked for it, and so did the one before it. Writing it by hand does
  not close the record — the record asks that the producer be *required* to write it.
- **Acceptance:** `agents/taskplanner.md` Step 4 mandates the `**Active Circle:**` field with both
  spellings shown, including `none`; rows 3 and 4 of the verdict table in `agents/orchestrator.md`
  `### The queue's ground` collapse into rows 1 and 2 and the modification-time comparison is dropped;
  a gate pins the mandate the way the other queue-ground lints do.
- **Verified open:** read `agents/taskplanner.md` Step 4 at `5ef92eb`. The mandated header is still
  exactly four lines and contains no `**Active Circle:**`; `grep -c "Active Circle"
  agents/taskplanner.md` → **0**. Unchanged since the 14:34 queue measured the same thing at `430d73a`.

### 5. Give the two skills' cross-file citation a root they can actually resolve

- **ID:** `I:260810-0501-citation-root`
- **Source:** `fusion-workbench/shared/issues/260810-0501_o_two-skills-cite-a-prompt-section-they-have-no-documented-route-to-read.md`
- **Executor:** `coder`
- **Files:** `skills/setup/SKILL.md` (`:243`), `skills/next/SKILL.md` (`:104` and `:164`);
  `skills/cleanup/SKILL.md:11` (read-only, the precedent to copy)
- **Depends on:** none. **The 14:34 queue ordered this behind task 26** (the permission seeding),
  because both edit `skills/setup/SKILL.md`. That was a file collision, not a content prerequisite, so
  the order is reversed here and the ungated work goes first. Whoever lands task 26 later re-reads the
  file.
- **Priority:** high
- **Status:** [ ] open
- **Detail:** Both new sections delegate a whole procedure to a section of another file named by a bare
  relative path — *"Run the check from `agents/orchestrator.md` `### The queue's ground` →
  `#### Reading a queue`. That section is the canonical implementation … do not restate the branches
  here."* `agents/orchestrator.md` does not exist at a consuming project's root. It ships inside the
  plugin, and the only documented way a skill reaches a plugin file is `$FUSION_PLUGIN_ROOT`;
  `skills/cleanup/SKILL.md:11` sets that precedent explicitly and applies it twice. `bin/fusion-rules`
  does not close the gap either — it emits rule files, and `agents/orchestrator.md` is emitted to no
  agent. **Bare citations of this shape already existed and survived because each carried an inline
  fallback**; these two remove the fallback deliberately, which makes an unresolvable citation
  load-bearing for the first time. A reader who cannot open the file has nothing at all: no branches,
  no verdict table, no default. **The failure is silent** — a file is found, the heading is not, and the
  step is likely to be skipped or improvised.
  **Worth deciding alongside, and arguably the better answer:** a procedure three consumers must run
  verbatim is a **rule**, not a section of one agent's prompt. Moving `#### Reading a queue` into a file
  under `rules/` and emitting it to the three consumers would use the mechanism the project already has
  and remove the citation instead of repairing it — the same partition the conventions file's own header
  table documents for four other topics. If that route is taken, task 16's duplicate goes in the same
  change.
  **Two further bare citations exist in the same file and are worth the same pass**, though they are
  not the record's own scope: `skills/setup/SKILL.md:227` and `:228` both send the reader to
  `agents/orchestrator.md` Setup Step 5 with no root. Task 24 edits that same Step 5 block.
- **Acceptance:** every citation of `agents/orchestrator.md` from a skill body resolves through
  `$FUSION_PLUGIN_ROOT` or through an emitted rule file; a consuming project running `/fusion:setup`
  against an install that lacks the section is told so rather than silently skipping the step; the
  `skills/cleanup/SKILL.md:11` precedent is reused, not restated.
- **Verified open:** the three bare citations are present at `5ef92eb` — `skills/setup/SKILL.md:243`
  (was `:242` at `430d73a`), `skills/next/SKILL.md:104` and `:164` — each naming `agents/orchestrator.md`
  with no `$FUSION_PLUGIN_ROOT`. The line drift inside `skills/setup/SKILL.md` is itself another
  instance of what task 42 is filed against.

### 6. Execute the domain cascade instead of reading its prose

- **ID:** `I:260810-0503-cascade-lint`
- **Source:** `fusion-workbench/shared/issues/260810-0503_o_the-domain-cascade-lint-is-defeated-by-a-decoy-branch-and-one-helper-has-no-negative-control.md`
- **Executor:** `coder`
- **Files:** `hooks/lib/__tests__/domain-cascade-order-lint.test.ts` — `firstIndex` (`:66`),
  `assertCodeCountFirst`, `assertAbsentCountFirst`, the negative-control block; possibly a new
  executable cascade beside `bin/fusion-count-sources`
- **Depends on:** none
- **Priority:** high
- **Status:** [x] done — `hooks/lib/domain-cascade.ts` parses the cascade out of the prompt and
  executes it; `hooks/lib/__tests__/domain-cascade.test.ts` asserts verdicts, and the order lint now
  reads parsed conditions and has the missing negative control. All four defeats measured failing
  against the real prompt.
- **Detail:** The lint measures branch **order** by asking whether a branch's text *mentions* a token,
  so `firstIndex(branches, /\bcode_files\b/)` is satisfied by any branch containing the string whether
  or not that branch can ever fire. **Four edits that reinstate the original defect pass**, each
  confirmed by probing the production helpers directly: a decoy branch (`elif code_files < 0`) above a
  restored pre-fix order; an inverted condition (`elif code_files == 0`) in the `> 0` slot; a dead
  threshold (`elif code_files > 100000`); and the token appearing only in a trailing comment, since
  `branchesFrom` keeps the whole line and the cascade in the prompt is comment-heavy. So the decisive
  answer is yes: **`260807-1942` can be reinstated in full with the suite green.** That matters because
  the domain the cascade produces is passed as the default to `taskplanner`, `reconciler` and `planner`,
  and under `strategic` the reconciler runs no code tests.
  A second, separable defect: `assertAbsentCountFirst` — the helper guarding the `counted_by == "none"`
  line the prompt itself calls load-bearing — is never demonstrated to fail on anything. The block that
  looks like its negative control is a second *positive* assertion (`.not.toThrow()`).
  **What is right and must be kept:** the fixture claim is substantially true, checked against
  `git show 2910cf6`, which is better than its sibling lints can say; and the cascade itself is sound,
  disjoint and complete with a final `else`. The lint is the weak part, not the change.
  **The record recommends option 2 and gives the reason:** stop linting the prose and execute the
  cascade. It is six lines of decision logic over five integers; lifting it into a function beside
  `bin/fusion-count-sources` and asserting the *verdicts* for the projects the commit message already
  measured (Cargo 0→27, Go 0→19, frontend 50→11, this repo 4→88, a consuming project 0→108, ontology
  2/30) gates behaviour instead of layout and catches all four defeats.
  `circle-stash-git-exclusion.test.ts` is the worked precedent for extracting executable logic out of a
  prompt body.
- **Acceptance:** each of the four mutations above fails the suite; `assertAbsentCountFirst` has a
  negative control that calls it and expects a throw; if the cascade is lifted into code, the prompt and
  the function cannot drift apart silently; `npm test` green from `hooks/`.
- **Verified open:** `hooks/lib/__tests__/domain-cascade-order-lint.test.ts` has not been touched since
  `31d8bb3` (`git log --oneline -1` on the file). `firstIndex` at `:66` still reads
  `branches.findIndex((l) => re.test(l))` — a text match, not a condition match.

### 7. Anchor the drift lint on the act, not on the phrase it checks

- **ID:** `I:260810-0502-drift-lint`
- **Source:** `fusion-workbench/shared/issues/260810-0502_o_the-state-drift-lint-anchors-on-the-phrase-it-checks-and-one-negative-control-is-a-duplicate.md`
- **Executor:** `coder`
- **Files:** `hooks/lib/__tests__/state-drift-detection-lint.test.ts` — `CALL_POINTS[1]` (`:76`),
  `CALL_POINTS[3]` (`:78`), the fixtures at `:180-196`, the negative control at `:205-211`, the header
  claim at `:30-39` and `:68-73`
- **Depends on:** none
- **Priority:** high
- **Status:** [x] done — `shared/history/260810-1812-coder-drift-lint-anchors.md`. Anchors moved to the
  four acts (enforced by a control requiring each to match the pre-fix prompt, which contains no
  "drift check"); assertion split into presence / skip-licence / binding; controls now fail at distinct
  call points with distinct messages; fixture provenance stated per line; header claim reduced to what
  the code does. Record §4's empty-`Drift when` cell is outside this acceptance and stays open.
- **Detail:** The lint states its own design rule in its header — *"The anchor is the EMISSION …, never
  the drift check — a check that has drifted away from its carrier must fail here, and it cannot do that
  if the anchor is the check itself"* — and two of its four anchors break that rule, matching lines that
  necessarily contain the phrase the follow-up assertion then looks for. Removing the check from Step 3e
  produces a missing-anchor error rather than the intended failure.
  **The reconciliation makes it worse than the record claims**, and this is the part to build against:
  the follow-up assertion is `toMatch(/drift check/i)` against the anchored line, so a line that mentions
  the check *while forbidding it* satisfies the gate — verified by running `assertRidesAnEmission`
  against a copy of the prompt with all four call points inverted (`"The drift check is NOT run here"`,
  `"may be skipped under time pressure"`). It passed. The other five tests read only `### Drift check`
  and the event table, and all four mutated lines sit outside both, so **`npm test` stays green with the
  check disabled at every call point it exists to hold. All four anchors are defeatable, not two.**
  Two further defects: the negative control at `:205-211`, titled *"rejects a check bolted on beside the
  emission instead of into it"*, is a renamed duplicate — both fixtures open with the identical
  `turn_start` line, `assertRidesAnEmission` throws on `CALL_POINTS[0]` and returns, so the standalone
  line is never reached and an *honest* standalone obligation is accepted. And the fixture comment claims
  *"the three call points exactly as they stood at HEAD before this change"* while two of its four lines
  are invented — `git show 9bad4d6^:agents/orchestrator.md` contains no occurrence of "drift check"
  anywhere.
  This is not an argument for deleting the lint: the mechanism it guards is sound, and it has now
  demonstrably worked — the check fired twice today and caught a live freeze (see task 2). It is an
  argument for the header's claim being brought down to what the code does.
- **Acceptance:** the assertion is about the *act*, not the phrase, so a line that mentions the check
  while forbidding it fails; all four call points are genuinely anchored; the negative controls assert
  on distinct messages; the two invented fixture lines are corrected or dropped and the comment says
  plainly which lines are historical and which are constructed; the header claim matches what the code
  does; `npm test` green from `hooks/`.
- **Verified open:** `hooks/lib/__tests__/state-drift-detection-lint.test.ts` has not been touched since
  `9bad4d6` (`git log --oneline -1` on the file), so every cited line still lands on the text it
  describes.

### 8. Measure review coverage against the range, not against the last Turn

- **ID:** `I:260810-1205-review-coverage`
- **Source:** `fusion-workbench/shared/issues/260810-1205_o_seven-of-sixteen-commits-in-the-session-range-never-reached-a-review-pass-and-nothing-measures-the-gap.md`
- **Executor:** `coder`
- **Files:** `agents/orchestrator.md` (the Turn loop's review dispatch, and the session-end summary);
  `fusion-workbench/agentstate.yaml` (which carries no review-coverage field)
- **Depends on:** task 2 — both add an obligation to the orchestrator's session bookkeeping, in the same
  file; land the freeze fix first so this one can ride the mechanism rather than invent a second.
- **Priority:** high
- **Status:** [ ] open
- **Detail:** Sixteen commits landed in `18b6094..ed87d87`. Two `coderev` passes ran, their two ranges
  do not tile the session's range, and the untiled part was never noticed: seven code-bearing commits
  reached HEAD and a **pushed tag** with no reviewer having opened them.
  **Turn 2's omission is the one worth naming, because it was declared rather than overlooked.** The
  first pass states in its own header that three named files "were not opened" because concurrent tasks
  held them — and those are exactly the files two of the unreviewed commits changed. The reviewer
  correctly reported the boundary of its scope; nothing downstream read that sentence and re-queued the
  files. That a second look was needed is not hypothetical: a real defect in one of those commits was
  filed by an *executor* reporting outside its own scope, and fixed three commits later in a commit that
  was never reviewed either.
  **The reporting understated it by a factor of seven** — the dashboard said one commit had no review
  pass. The session did not hide the gap; it measured it against the last Turn instead of against the
  range. Nothing holds "commits reviewed" against "commits landed": `agentstate.yaml` tracks `commits`,
  `turn` and `turn_start_head` and no reviewed-through marker, while the review filenames carry their
  ranges — the data needed to tile the range is on disk, in the filenames, and nothing reads it.
  **Two of the record's three pieces are in scope here; the third is not.** (1) Derive the coverage
  statement from the review files' own ranges against `git rev-list <session-start>..HEAD`. (2) Carry a
  reviewer's declared out-of-scope file list into the next dispatch's scope, as an obligation rather than
  a footnote. (3) Whether a release may go out over an unreviewed range at all is a decision, is not
  filed here, and belongs beside
  `shared/decisions/260810-0710_o_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`.
  **Read this beside task 39**, which is the ordering half of the same accountability gap and which
  would consume the computation this task builds, as a precondition rather than as a report.
- **Acceptance:** the session-end summary's review-coverage statement is computed from the review files'
  ranges, and a range not covered is named commit by commit; a reviewer's declared out-of-scope file list
  is carried into the next review dispatch's scope; the third piece is left to a decision record and not
  implemented ahead of it.
- **Verified open:** `git rev-list --count 18b6094..ed87d87` → **16**. `grep -c` for
  `reviewed_through|review-coverage|reviewed through` over `agents/orchestrator.md` → **0**. Nothing
  measures the gap. `fusion-workbench/agentstate.yaml` does not exist right now (deleted at the last
  session's Cleanup), which is why the second half of the grep could not be re-run — the field's absence
  from the orchestrator prompt is the durable measurement and it holds. `shared/reviews/` now holds
  **eight** coderev files, one more than at `430d73a`.

### 9. Split the exempt-surface list by who the text actually reaches

- **ID:** `I:260807-2153-exempt-surfaces`
- **Source:** `fusion-workbench/shared/issues/260807-2153_o_the-exempt-surface-list-is-plugin-repo-shaped-but-ships-to-every-consumer.md`
- **Executor:** `coder`
- **Files:** `rules/fusion-workbench-conventions.md` `## Project language`, the exempt-surface block
  (measured at `:217` at HEAD)
- **Depends on:** none
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** The block says *"Exempt surfaces — English in every project, whatever either line says.
  These ship to consuming projects of every language, so one project's declaration cannot govern them"*,
  then lists `rules/`, `agents/`, `skills/`, code and comments, `README.md` and `docs/`, and operator
  strings. `rules/fusion-workbench-conventions.md` is emitted unconditionally to all sixteen agents in
  **every** project, so a German consuming project's agents read this list and apply it to their own
  tree — where `rules/` is the project's own agent-rule directory that ships nowhere, `agents/` and
  `skills/` do not exist as plugin directories at all, and `README.md` and `docs/` are the consumer's own
  documents for the consumer's own readers. The stated reason is true for exactly one repository, this
  one, while the rule it justifies is stated absolutely. A `de`-declaring consumer is told its own README
  must be English on a ground that does not hold for it.
  Two of the six bullets survive universalisation on their own merits — code and comments, and operator
  strings emitted by tooling before any agent has read `CLAUDE.md`, the latter with a worked
  justification in `hooks/session-start.ts`. **Fix direction: split the list in two by audience.**
  Universal exemptions keep the `session-start.ts` citation. The other four become exemptions belonging
  to *a project that ships a rule corpus*, stated as a **criterion rather than a path list**: text a
  project ships to consumers of unknown language is English. Then fusion's own repo falls under it by the
  criterion, a consumer that ships nothing is unaffected, and a consumer that does ship a corpus gets the
  same guidance for the right reason. The binding decision required naming this repository's double role
  — source of the shipped rule text *and* a `de` project with its own workbench — and the current text
  universalises instead.
- **Acceptance:** the sentence "These ship to consuming projects of every language" is no longer offered
  as the reason for a rule a project that ships nothing must also obey; the universal half and the
  ships-a-corpus half are separated; the double role is named.
- **Verified open:** `grep -n "These ship to consuming projects of every language"
  rules/fusion-workbench-conventions.md` → `:217` at `5ef92eb`, reason clause verbatim and unchanged.
  The record itself cites `:204-213`, which is a live instance of the defect task 42 is filed against.

### 10. Complete the tracked-workbench split, and stop enumerating one list twice

- **ID:** `I:260810-0504-tracked-split`
- **Source:** `fusion-workbench/shared/issues/260810-0504_o_the-tracked-workbench-section-re-enumerates-a-closed-list-and-leaves-one-surface-unclassified.md`
- **Executor:** `coder`
- **Files:** `rules/fusion-workbench-conventions.md` `### Which of them a tracked workbench tracks`
  (`:71` at HEAD); `rules/workbench-stash-and-lock.md` (the proposed destination); the `.gitignore`
  comment that applies the decision
- **Depends on:** none
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** Three parts.
  **(1) The partition is incomplete.** The section splits the root-anchored surfaces into records
  (tracked) and live state (untracked). `fusion-workbench/.fusion-setup` appears in the layout tree
  directly above and is in **neither** bucket: it is not a record in the section's sense (no past version
  answers anything) and it is not live state (written once, never overwritten). Checked here — it is
  tracked and not ignored, so the tree and the `.gitignore` agree by accident rather than by the rule.
  `rules/critical-stance.md` §4 is the standard the section itself has to meet, and the commit message
  claimed "all ten root-anchored surfaces were put to it" while the tree holds eleven.
  **(2) It is a second enumeration of a list the same file already closes ten lines above**, under a
  paragraph that says the tree "is exhaustive as written … an incomplete tree invites exactly the
  reasoning-by-omission it exists to prevent". There are now two enumerations of one set in one file, so
  a `bin/` helper that adds a root-anchored surface has two places to land instead of one. The cost is
  already concrete: task 29 records two files missing from the tree, and the new section omits them too.
  **(3) The audience does not match the content.** This file is emitted to all sixteen agents on every
  dispatch. The tracked/untracked split is consumed by `/fusion:circle-stash`, `/fusion:cleanup` and
  whoever writes a `.gitignore` — never by `coder`, `ontocoder`, `analyst`, `shaper`, `editor`,
  `planner`, `taskplanner` or `conceptrev`. The file's own header table documents the remedy and has
  applied it four times: partition a topic into its own authoring home and emit it to a derived audience.
  `rules/workbench-stash-and-lock.md` already exists, is emitted to `orchestrator` alone, and is cited by
  both stash skills.
- **Acceptance:** `.fusion-setup` is classified, or the split explicitly says it ranges over the ten
  session-state surfaces and not over the tree; the section moves to `rules/workbench-stash-and-lock.md`
  with a one-line pointer left behind, matching the four partitions the header table already records; the
  `.gitignore` comment cites it; the two Plane runtime files are added once, in the tree, per task 29.
- **Verified open:** the section is at `rules/fusion-workbench-conventions.md:71` at `5ef92eb` and
  carries both bullets verbatim. `grep -c "fusion-setup"` over that section → **0**, so the surface is
  still in neither bucket. `git ls-files fusion-workbench/.fusion-setup` returns the path: tracked, not
  ignored, exactly as the record says.

### 11. Backfill the Plane-mirror Circle's Turn log, and make the omission detectable

- **ID:** `I:260801-1020-empty-turnlog`
- **Source:** `fusion-workbench/shared/issues/260801-1020_o_plane-mirror-circle-closed-with-empty-turn-log.md`
- **Executor:** `coder`
- **Files:** `fusion-workbench/circles/260719-1536-plane-mirror-integration/_c_circle.md` (`## Turn log`,
  the placeholder at `:58`); `agents/orchestrator.md` Phase 4 (the closure step)
- **Depends on:** none
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** That Circle carries the closed-coherent marker and a full Closure note citing six commits
  `eb9cf59..aefbf39`, while its `## Turn log` still holds the placeholder written at anticipation time.
  The template specifies the Turn log as an append-only list, one bullet per Turn, carrying the commit
  range, the Coherence verdict and the session-history path. The other Circles in this workbench have
  substantive Turn logs; this one has the most work behind it and is the only empty one. The information
  is not lost — the Closure note carries it — but it is in the section mechanical readers do not read, so
  any consumer that walks Turn logs to reconstruct what a Circle did under-reports this Circle to **zero
  Turns**. `/fusion:cadence` ranks recurring themes by how many sessions a topic reappears in, and
  playmaker's `portfolio.md` renders recently-closed Circles from their records: the Circle with the most
  work behind it looks like the one with none. Two parts: backfill this record's Turn log from
  `shared/history/260719-1632-orchestrator-session.md` and the six commits named in its Closure note; and
  make the omission harder to repeat — the orchestrator writes the Turn log and renames the record in the
  same Phase 4, so a closure that finds the anticipation placeholder still present is a detectable
  condition.
- **Acceptance:** the Circle's `## Turn log` states its Turns with commit ranges, verdicts and history
  paths, in the template's format; the placeholder text is gone; a closure that would leave an
  anticipation placeholder in place is caught at Phase 4 rather than discovered later by an analyst.
- **Verified open:** read `## Turn log` in `_c_circle.md` at `5ef92eb`. Line 58 still reads "(none yet —
  anticipated; on activation: shaper portfolio-activation refreshes this Grounding snapshot against the
  current v5.4.0 tree …)", immediately above a full Closure note.

### 12. Reduce the tracker's noise-list comment to the one metric that still reads it

- **ID:** `I:260809-2252-noise-comment`
- **Source:** `fusion-workbench/shared/issues/260809-2252_o_the-tracker-noise-list-still-says-it-excludes-two-metrics-when-only-churn-reads-it.md`
- **Executor:** `coder`
- **Files:** `hooks/tracker.ts` (the `TRACKER_NOISE_FILES` header comment, `:101` at HEAD),
  `hooks/dist/tracker.js` (`:74` — rebuild, do not hand-edit)
- **Depends on:** none. **The 14:34 queue ordered this behind the churn-key task; that task closed in
  `25c5454`, so the dependency is discharged** and `hooks/dist/` is already rebuilt against it.
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** The header comment reads "Tracking them as churn or ping-back produces pure noise —
  exclude from **both metrics**." There is no second metric. The constant has exactly one reader at HEAD,
  on the churn path; the ping-back tracker, its state file, its event types and its configuration block
  all left with commit `c353196`, and the exclusion list itself did not need to change — only the reason
  given for it. This is not the kind of drift an identifier grep would have caught, because the comment
  says "ping-back" and the removed module was called "cross-file". Nothing about the list's membership
  changes. There is an irony worth keeping in mind while editing: the rest of the same comment block
  argues at length that the `.guard-state/**` entry must **not** be deleted merely because a sibling entry
  elsewhere was retired — and the opening sentence is about that retired sibling. Leave that argument
  intact.
  **Coordinate with task 13.** That task may move or export `TRACKER_NOISE_FILES` so the churn read path
  can apply it. Landing this comment fix first means the corrected comment travels with the constant
  instead of being rewritten twice.
- **Acceptance:** the `TRACKER_NOISE_FILES` header names one metric and the word "ping-back" does not
  appear in it; `hooks/dist/tracker.js` is rebuilt from source with `npm run build`, not hand-edited;
  `git grep -in 'ping-back\|pingback' -- hooks/ bin/ rules/ agents/ skills/ docs/ README*.md` returns only
  past-tense mentions naming decision `260809-2004`.
- **Verified open:** `grep -n "both metrics" hooks/tracker.ts hooks/dist/tracker.js` returns both sites at
  `5ef92eb` — `hooks/tracker.ts:101` and `hooks/dist/tracker.js:74`, source and compiled twin still in
  step and both still wrong. Both moved by seven and one lines respectively since `430d73a`, which the
  churn-key commit caused; the text is unchanged.

### 13. Keep the files the tracker refuses to measure out of the ranking it feeds

- **ID:** `I:260810-1632-churn-noise-filter`
- **Source:** `fusion-workbench/shared/issues/260810-1632_o_the-churn-ranking-has-no-noise-filter-so-the-migration-promotes-dashboard-files-into-setups-top-ten.md`
- **Executor:** `coder`
- **Files:** `hooks/lib/churn.ts` — `rankThrashing` (`:529`) and its result shape (`:497`);
  `hooks/tracker.ts` — `TRACKER_NOISE_FILES` (`:123-128`, which has to be exported or moved);
  `hooks/churn-rank.ts` and `bin/fusion-churn-rank` (the reader); `hooks/dist/` (rebuild)
- **Depends on:** task 12 — same constant, and the corrected comment should travel with it if the
  constant moves.
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** `rankThrashing` excludes entries whose file is absent and nothing else.
  `TRACKER_NOISE_FILES` names four workbench surfaces the tracker refuses to count as churn, because
  they are rewritten continuously by design: `orchestrator-live.md`, `orchestrator-events.jsonl`,
  `agentstate.yaml` and `.guard-state/**`. The migration that commit `25c5454` introduced re-anchors
  legacy keys into exactly those spellings, and the read path then shows them.
  **Measured in the record against this repository's live `churn.json` (592 entries), migrated in memory
  through the shipped `hooks/dist/lib/churn.js`:** `fusion-workbench/orchestrator-live.md` scores 15
  (total 47) and `fusion-workbench/agentstate.yaml` scores 2 (total 6). `orchestrator-live.md` lands
  **10th** in the default `--limit 10` ranking — a slot in the exact output `agents/orchestrator.md`
  Setup Step 5 tells the orchestrator to read and report to the user.
  **Why the migration is what surfaces them, stated so the fix is not misdirected:** before `25c5454`
  these entries were spelled `orchestrator-live.md` and `agentstate.yaml` bare, written by sessions
  started inside `fusion-workbench/`. In that spelling they matched no noise pattern — the mechanism
  `hooks/tracker.ts:673-677` already documents. The migration correctly lifts them to
  `fusion-workbench/…`, at which point the write path skips them, but the entries already in the map keep
  their accumulated score and the read path has no reason to drop them. The fix that stopped the leak
  left the pool behind and made it visible.
  **Recommendation from the record:** apply `matchesAny(path, TRACKER_NOISE_FILES)` in `rankThrashing`
  as a second exclusion, **counted separately from `absent`** so the reader can tell "deleted" from "not
  evidence". That keeps the entries in the map, which decision
  `260810-0920_i_what-should-a-churn-key-be-anchored-to…` part (c) asks for, and keeps them out of the
  ranking, which is the same treatment absent files already get. Dropping them during the migration would
  also work but discards history the decision chose to preserve, and would not help a map migrated before
  the fix lands.
  **Reach:** every project whose churn map predates the anchor change, which is every project that has
  ever run the guard. A fresh project is unaffected.
- **Acceptance:** a migrated map's noise entries do not appear in `bin/fusion-churn-rank` output; the
  count of excluded-as-noise entries is reported separately from `absent=`; the entries stay in the map;
  the constant has one definition, not two copies; `npm test` green from `hooks/`.
- **Verified open:** `grep -n "TRACKER_NOISE_FILES" hooks/tracker.ts hooks/lib/churn.ts` at `5ef92eb`
  returns three hits, all in `hooks/tracker.ts` (`:123` definition, `:675` comment, `:695` the write-path
  filter) and **none in `hooks/lib/churn.ts`** — the read path cannot see the list. `rankThrashing` is at
  `hooks/lib/churn.ts:529`.

### 14. Drop the ordering-site count from `README-hooks.md` rather than correcting it

- **ID:** `I:260809-2258-site-count`
- **Source:** `fusion-workbench/shared/issues/260809-2258_o_readme-hooks-says-fourteen-ordering-sites-and-the-commit-that-wrote-it-converted-fifteen.md`
- **Executor:** `coder`
- **Files:** `README-hooks.md` (the `lib/fail-open.ts` row — `:174` at HEAD)
- **Depends on:** none
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** The row says `answer` and `bestEffort` "carry the same rule to the **fourteen sites** inside
  `main` where an escalation save, an event append or the churn heatmap stood ahead of the verdict." The
  count was wrong when written and is wrong now, in the opposite direction. **The record's own evidence
  has been overtaken:** it argued the true figure was fifteen and named a site in `hooks/guard.ts` as the
  omitted one. That code is gone — commit `7598073` deleted the branch policy outright. Counting the class
  at HEAD gives **thirteen**. Do **not** simply write "thirteen": that number goes stale on the next
  conversion or deletion exactly as this one did, twice within a week. Take the record's own second option
  and replace the number with a description that does not carry a count. The reason to fix it rather than
  absorb it is that this sentence is the shipped description of the security boundary's ordering rule, and
  a reader auditing it finds a different number of converted sites than the document admits and has to
  work out which of the two is wrong.
- **Acceptance:** the `lib/fail-open.ts` row describes the ordering rule without a site count, or states
  a count that a reader can re-derive and that is correct at HEAD; the rest of the row's claims (the
  verdict first and unguarded, every record of it after, each in its own `try`) are unchanged.
- **Verified open:** `README-hooks.md:174` at `5ef92eb` still reads "the fourteen sites"; the row moved
  down one line in the range and its text is untouched. Re-counted today rather than carried forward:
  `grep -c "answer(\|bestEffort("` → `hooks/guard.ts: 8`, `hooks/tracker.ts: 5`, **13 total** — the same
  figure the 14:34 queue derived at `430d73a`, unchanged by the nine commits since.

### 15. Make the queue-ground lint's negative controls call the helper they claim to test

- **ID:** `I:260810-0510-negative-controls`
- **Source:** `fusion-workbench/shared/issues/260810-0510_o_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`
- **Executor:** `coder`
- **Files:** `hooks/lib/__tests__/queue-ground-lint.test.ts:222-256` (and `assertRidesTheAct` at
  `:130-140`, which must be given a parameter first);
  `hooks/lib/__tests__/executor-verification-report-lint.test.ts:180-193`
- **Depends on:** none
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** **Part 1.** The queue-ground lint has three negative controls; one is real and two do not
  exercise the production assertions. One builds a string and then asserts that the string it just built
  lacks a substring — `assertRidesTheAct`, the production helper, is never called. The other copies the
  table-splitting logic from the real test inline and asserts against the copy. Both prove something
  about the fixture and nothing about the gate. **Measured consequence:** replace the body of
  `assertRidesTheAct` with an empty block and nothing in the file fails, so the whole four-call-point
  enforcement is deletable with the negative control untouched.
  **A structural precondition the fix must absorb:** `assertRidesTheAct` is declared with **no
  parameter** — it closes over the functions that read the real files — so a fixture cannot be handed to
  it and the control had nowhere to go but a copy. The factoring is a precondition, not a tidy-up. The
  same applies to the table check, which lives inline inside an `it` block. Task 16 needs that same
  callable table check, which is why it is queued behind this one.
  **Part 2.** The executor-verification lint's fixture comment claims *"the coder's Implementation
  Process exactly as it stood at HEAD before this change"* and diverges three ways from
  `git show 1f2faaf^:agents/coder.md`: a step is omitted, a `### Report shape` heading is **prepended**
  that did not exist, and a further step is truncated. The prepended heading is not cosmetic — the parser
  requires exactly one such section and throws otherwise, so the genuine pre-fix text would have failed at
  the parser rather than at the assertion the test is demonstrating. The fixture was shaped to route the
  failure to the intended place. The negative controls in that file are otherwise the strongest of the
  four new lints; only the historical claim is overstated.
  **Why the two are filed together:** `rules/critical-stance.md` §3 is the standard — a claim of
  verification is permitted only where the verification happened. The pattern worth naming rather than
  fixing six times is that *a negative-control block is only a negative control when it calls the same
  function the real test calls.*
- **Acceptance:** both queue-ground controls call `assertRidesTheAct` and the extracted table assertion
  and expect a throw; `assertRidesTheAct` takes its input as a parameter; the executor-verification
  fixture comment says plainly that the heading is supplied so the parser can reach the assertion under
  test; `npm test` green from `hooks/`.
- **Verified open:** neither test file has been touched since the commit that introduced it —
  `git log --oneline -1` gives `ff70d3a` for `queue-ground-lint.test.ts` and `1f2faaf` for
  `executor-verification-report-lint.test.ts` — so every cited line range still lands on the text it
  describes.

### 16. State the queue-head derivation once, in the section that calls itself canonical

- **ID:** `I:260810-0511-parser-twice`
- **Source:** `fusion-workbench/shared/issues/260810-0511_o_the-queue-head-parser-is-written-twice-in-one-file-that-calls-itself-the-canonical-implementation.md`
- **Executor:** `coder`
- **Files:** `agents/orchestrator.md` — Phase 4 step 4 (the retirement snippet) and
  `### The queue's ground` → `#### Reading a queue`; `hooks/lib/__tests__/queue-ground-lint.test.ts`
  (the "one canonical implementation" assertion)
- **Depends on:** tasks 4, 5 and 15. **Task 4 is a content dependency:** both parsers read a line format
  no producer mandates, so mandating the format first means the consolidated parser is reading something
  guaranteed to be there. **Task 5 is a content dependency:** if the section moves to a rule file, this
  duplicate goes in the same change rather than being carried across. **Task 15** factors the table check
  into a callable helper, which is the shape this task's lint extension needs.
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** The same eight-stage pipeline for extracting the Circle name out of the queue's head line
  appears twice in `agents/orchestrator.md`, about a hundred lines apart, and the two copies **already
  differ**: the retirement copy carries `2>/dev/null`, the reading copy does not.
  **This matters more than an ordinary duplicate** because the section containing the second copy declares
  itself canonical, and two skills were changed in the same commit to defer to it rather than restate
  anything. The lint enforces exactly that discipline — but only against the two **skills**. The
  orchestrator's own second copy is inside the file the lint treats as the source of truth, so it is
  invisible to the check: the rule was applied outward and not inward.
  The consequence is concrete: the retirement decides whether to **move** the work queue by comparing its
  extracted value against the active Circle's directory name. If the two derivations drift, the reading
  section can report a queue `current` while the retirement declines to retire it, or the reverse — a
  queue moved that a consumer had just called a valid backlog.
  **Fix direction:** state the derivation once, in `#### Reading a queue`, and have Phase 4 step 4 cite
  it — the same treatment the two skills were given. The retirement then needs only the comparison, not
  the extraction. Extend the lint's assertion to count occurrences of the parser inside
  `agents/orchestrator.md` itself, so the file that owns the rule is also held to it.
- **Acceptance:** one derivation of the queue's ground exists in the prompt and Phase 4 cites it; the two
  copies' `2>/dev/null` divergence cannot recur; the lint fails if a second parser appears anywhere in
  `agents/orchestrator.md`; `npm test` green from `hooks/`.
- **Verified open:** counted the pipeline again at `5ef92eb`:
  `grep -c "grep -oE 'circles/[A-Za-z0-9._-]+"` over `agents/orchestrator.md` → **2**. Both copies are
  still present and the lint still reaches only the skills.

### 17. Find out whether the suite total still moves, before changing anything

- **ID:** `I:260810-0918-suite-variance`
- **Source:** `fusion-workbench/shared/issues/260810-0918_o_the-suite-total-moves-between-runs-and-the-variance-is-entirely-in-one-file.md`
- **Executor:** `coder`
- **Files:** `hooks/lib/__tests__/fusion-plane.test.ts` — test collection, not any assertion
- **Depends on:** none
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** Three consecutive `npm test` runs against the same tree reported three different totals —
  1002, 1005, 1002, all green — and diffing the per-file counts pinned the whole variance to one file,
  which collected **96** tests in one run and **93** in another while every other file was stable.
  **Why it is worth a record rather than a shrug:** a test count that moves on its own defeats the
  cheapest check there is. Exit code still works; the *count* does not, so a genuinely dropped test — a
  `describe` that stops registering, a conditional `it` that silently skips — cannot be distinguished from
  this variance by anyone reading two numbers. Three tests appearing and disappearing is also the shape of
  a registration that depends on something environmental: a fixture file's presence, a `git` invocation at
  collection time, a platform probe, or a `describe.skipIf`. That would mean three assertions are not
  running on some runs, which is a coverage question and not only a bookkeeping one.
  **Read the verification below before starting.** The variance has now failed to reproduce in six
  consecutive runs across two build points, so the first question is no longer "which three tests" but
  "does this still happen at all, and if not, which commit stopped it". Do not start from the source; run
  `vitest run <file> --reporter=json` twice and diff the collected test *names* if it does reproduce.
- **Acceptance:** either the conditional registration is identified and made unconditional (or its
  condition made explicit and asserted), or the variance is shown not to reproduce at HEAD and the record
  closes with the measurement recorded and the commit that ended it named; if some tests genuinely cannot
  run in some environments they are `skip`ped visibly rather than never registered, since a skipped test is
  reported and counted.
- **Verified open, and the reproduction has now failed twice over:** ran
  `npx vitest run lib/__tests__/fusion-plane.test.ts` three consecutive times at `5ef92eb`. All three
  reported **123 tests passed**, identical — the same result the 14:34 queue got at `430d73a`. Six runs,
  no variance, against the 96/93 the record measured. Six runs on one machine is evidence, not proof: an
  environment-dependent registration can be stable here. The record stays open because its cited
  measurement is what no longer holds, not because the question is answered.

### 18. Identify the commit-lock timing case before widening anything

- **ID:** `I:260810-1135-lock-flake`
- **Source:** `fusion-workbench/shared/issues/260810-1135_o_a-timing-case-in-fusion-commit-lock-test-fails-under-load-and-passes-in-isolation.md`
- **Executor:** `coder`
- **Files:** `hooks/lib/__tests__/fusion-commit-lock.test.ts` — one timing case, not yet identified;
  `bin/fusion-commit-lock` (read-only context)
- **Depends on:** none
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** With three agents running `npm test` concurrently against the same checkout, one full-suite
  run failed a single timing case in the commit-lock test. The same case passed in isolation and passed on
  the next full run. Two other runs in the same window failed only on files a concurrent task was editing,
  which is a different and understood cause.
  **What has not been established, and the record is careful about it:** whether the flake is load-induced
  or intrinsic. The observation was made under an unusual condition — three vitest processes on one machine
  — and that is exactly the condition under which a timing assertion with a real sleep in it will fail
  without anything being wrong. The honest reading is that this may be a test that is correct but not
  robust under CPU contention, rather than a test that is wrong. Nobody has identified *which* case it was;
  the executor reported the file and the shape, correctly staying inside its own scope.
  **Why it is worth a record:** this project commits on the suite's exit code, and every task is asked to
  report that code as the thing that decides whether its work lands. A load-sensitive case gives that gate
  a false-failure mode, and a false failure teaches its reader to re-run rather than to look. The commit
  lock is also the mechanism that makes concurrent agents safe to run at all. Its documented behaviour
  includes real timing — a 200ms poll with exponential backoff to 2s, and stale-lock detection at 60
  seconds — so a test of it necessarily waits, and the question is whether it waits on a wall clock or on
  an injectable one.
  **Fix direction:** identify the case first, by running the file alone in a loop under artificial load. If
  it asserts on elapsed wall-clock time, make the timing injectable rather than widening the tolerance — a
  widened tolerance is the same test with a longer fuse. If it depends on the stale-lock threshold, that
  threshold is a constant the test could be given rather than sharing with production.
- **Acceptance:** the case is named; whether it is load-induced or intrinsic is stated with the evidence;
  if it is fixed, the fix is an injectable clock or an injected constant, not a wider tolerance; `npm test`
  green from `hooks/`.
- **Verified open:** the file carries real timing at `5ef92eb` — `setTimeout`-based `sleep`,
  `Date.now()`-bounded polling loops, and an injected `FUSION_TEST_HOLDER_WRITE_DELAY` sleep patched into
  the script under test (five such sites). No case is marked as timing-sensitive and none has an injectable
  clock. The full suite passed today in 90.49s with no failures, so the flake did not reappear in this run
  either.

### 19. Document the second `bin/fusion-plane` test seam, the way the first one was

- **ID:** `I:260810-1030-comments-fixture`
- **Source:** `fusion-workbench/shared/issues/260810-1030_o_the-comments-fixture-seam-is-undocumented-in-usage-the-way-fixture-was.md`
- **Executor:** `coder`
- **Files:** `bin/fusion-plane` — the `push` synopsis in the file header (`:16`) and in `usage()` (`:2374`)
- **Depends on:** none
- **Priority:** low
- **Status:** [ ] open
- **Detail:** `--comments-fixture` and its env twin `FUSION_PLANE_COMMENTS_FIXTURE` appear nowhere in the
  `push` synopsis, in the file header or in `usage()`. That is the same omission commit `98c8b3f` just
  corrected for `--fixture`, in the same two places, left standing because the review that found it was
  scoped to `--fixture`. So the two seams now disagree about whether a test seam gets documented, and a
  reader who finds `--fixture` in `usage()` and reasons that the list is complete will conclude
  `--comments-fixture` does not exist. It was filed rather than fixed on the spot because the executor was
  scoped to three records and correctly declined to widen into a fourth — "while I was in there" is how a
  task's diff stops matching its stated scope.
  **Do the general check while in the file**, as the record asks: whether any other flag the file accepts
  is missing from those two lists. The same question has now been asked once per seam; asking it once for
  all of them would end the series.
- **Acceptance:** both spellings appear in the `push` synopsis in the header and in `usage()`, matching
  the wording `98c8b3f` used for `--fixture`; every other accepted flag is checked against those two lists
  in the same pass.
- **Verified open:** `--comments-fixture` is parsed at `bin/fusion-plane:1697-1698` at `5ef92eb`, and
  `sed -n '/^usage()/,/^}/p' bin/fusion-plane | grep -c "comments-fixture"` → **0**. Accepted by the
  parser, absent from the help. Unchanged since `430d73a`.

### 20. Say what the Cleanup drift call point means instead of what it claims

- **ID:** `I:260810-0509-cleanup-wording`
- **Source:** `fusion-workbench/shared/issues/260810-0509_o_the-cleanup-drift-call-point-claims-a-single-turn-session-reaches-no-other-which-phase-2-contradicts.md`
- **Executor:** `coder`
- **Files:** `agents/orchestrator.md` — Phase 2 step 2, Step 3e (the `turn_end` paragraph, `:486` at
  HEAD), Cleanup (the `session_end` bullet, `:670` at HEAD)
- **Depends on:** task 2 — both edit the drift-check call points in `agents/orchestrator.md`; land the
  mechanism work first so this prose fix is not written twice.
- **Priority:** low
- **Status:** [ ] open
- **Detail:** Three sections written in one commit disagree about which drift-check call points a short
  session reaches. Phase 2 attaches the check to **every** Turn's opening emission. Step 3e then says of
  the `turn_end` point that "a session that converges or exits early never reaches this emission at all;
  for those, the `session_end` call point in Cleanup is the one that fires." And Cleanup says "a
  single-Turn session reaches this call point and no other." Both of the last two are false as written: a
  single-Turn session runs Turn 1, so it reaches `turn_start` and therefore the Phase 2 call point, before
  it reaches `session_end`. "The one that fires" and "no other" each exclude a call point the same commit
  installed two sections earlier.
  **The substantive point behind the wording is sound**, and the fix is to say it: at `turn_start` of Turn
  1 there is nothing to have drifted yet, so `session_end` is the first call point that can *find* anything
  in a single-Turn session. It is worth a record because `agents/orchestrator.md` is the file three
  consumers now treat as a canonical implementation, and a lint asserts the call-point set is complete and
  attached — a reader reconciling "four call points" against "no other" has to decide which sentence to
  trust, which is the kind of small contradiction that becomes a wrong edit later.
- **Acceptance:** the Cleanup bullet says `session_end` is the first call point at which anything can have
  *drifted* in a single-Turn session, not the only one that fires; Step 3e is adjusted the same way; the
  four-call-point statement elsewhere in the file is not contradicted by either.
- **Verified open:** both sentences are verbatim at `5ef92eb` — `agents/orchestrator.md:486` ("the
  `session_end` call point in Cleanup is the one that fires") and `:670` ("A single-Turn session reaches
  this call point and no other"). Both moved down eighteen lines since `430d73a`; the wording is untouched.

### 21. Derive the session's closed and filed counts instead of tallying them by hand

- **ID:** `I:260810-1205-session-counts`
- **Source:** `fusion-workbench/shared/issues/260810-1205_o_the-session-closure-and-filing-counts-are-hand-maintained-and-both-drifted-by-two-against-the-disk.md`
- **Executor:** `coder`
- **Files:** `agents/orchestrator.md` (the Turn-loop bookkeeping that produces the `## Session result`
  lines); `fusion-workbench/orchestrator-live.md` (the surface, regenerated each session)
- **Depends on:** task 2 — both change what the orchestrator writes about its own session, in the same
  file; land the freeze fix first.
- **Priority:** low
- **Status:** [ ] open
- **Detail:** A session's `## Session result` reported "18 defect records closed, 13 filed"; measured from
  disk and git it was **20 closed and 15 filed**. **The arithmetic is self-consistent and still wrong:**
  `48 − 20 + 15 = 43` and `48 − 18 + 13 = 43` both land on the observed endpoint, so the invariant that
  would normally catch a miscount passes on either pair. Two compensating errors of the same size cannot be
  detected by the check the session has.
  **The likely cause is named and is worth building against:** five records were filed by a review and
  closed before anything was committed, so their `_o_` names never reached the index. A count kept by
  watching git renames misses them from the closed side; a count kept by watching new `_o_` files misses
  them from the filed side. That is precisely the observed −2/−2.
  **Why a mechanism rather than a correction in place:** the numbers are derivable. `shared/issues/` is a
  directory of files whose names carry both the marker and the filing timestamp, and the session start stamp
  is in `agentstate.yaml`. Every figure in that block is a two-line shell command against data already on
  disk, and none is currently computed that way.
- **Acceptance:** the `## Session result` counts are derived from `shared/issues/` and the session-start
  stamp at write time, not accumulated across Turns by hand; the closed count is derived from the marker on
  disk, not from git renames, so a record filed and closed within one commit is counted on both sides.
- **Verified open:** `fusion-workbench/orchestrator-live.md` does not exist at `5ef92eb` — the dashboard is
  regenerated per session and the last one removed it at Cleanup — so **the specific instance is gone and
  only the mechanism remains**. That is the durable half and it is what this task is for: nothing in
  `agents/orchestrator.md` derives those counts, so the next session's block will be hand-kept again.

### 22. Make the record about counting instances give one count

- **ID:** `I:260810-0751-three-counts`
- **Source:** `fusion-workbench/shared/issues/260810-0751_o_the-record-about-counting-instances-of-a-shape-gives-three-different-counts.md`
- **Executor:** `coder`
- **Files:** `fusion-workbench/shared/issues/260810-0710_c_the-drift-checks-last-line-makes-the-whole-block-exit-non-zero-when-no-circle-is-active.md`
  (the opening line of its own argument, `:13`)
- **Depends on:** none
- **Priority:** low
- **Status:** [ ] open
- **Detail:** The record's own argument is that two instances of one shell-idiom hazard in one Turn are
  worth reading together rather than patching separately. It then states the count three ways within seven
  lines: *"It is the **third** instance of one shape tonight … the reason to read the **three** together"*;
  the list underneath it has **two** bullets; and *"**Both** arrived in Turn 1"*. The commit message filing
  the same record says *"the **second** instance of the shape tonight"*, matching the list and the "Both"
  and contradicting the record's own opening.
  **The count is the argument.** "Twice in one Turn, by different agents" is what carries the record's third
  question — whether the shape earns a check — and a reader who takes "third" at face value looks for a
  missing instance that does not exist.
  **The two sites named are real and do share the shape** — that part was verified at filing: a
  `[ -n "$REC" ] && row …` in final position makes the drift-check block exit non-zero whenever no Circle is
  active, and `/fusion:next` step 6.3 carries `[ -f … ] && echo …` in the same position. No third site was
  found.
  **Fix: one word.** Change "third" to "second" and "the three" to "the two", or add the third instance if
  one exists that the reviewer did not find.
- **Acceptance:** the record states one count and it matches its own list and its own commit message; if a
  third instance is found it is named rather than implied.
- **Verified open:** the target record carries the closed marker (`260810-0710_c_`) but the defect is in its
  prose, not its state: `grep -n "third instance"` on that file returns `:13`, *"It is the third instance of
  one shape tonight, and that is the reason to read the three together rather than patch each"*, immediately
  above a two-bullet list. Editing a closed record's prose is legitimate here — the record remains the
  written argument, and the argument is currently wrong.

### 23. Trim the cadence skill's frontmatter to what routing needs

- **ID:** `I:260731-2246-cadence-frontmatter`
- **Source:** `fusion-workbench/shared/issues/260731-2246_o_cadence-frontmatter-unused-tools-and-oversized-description.md`
- **Executor:** `coder` — **routing note below**
- **Files:** `skills/cadence/SKILL.md` frontmatter (`description`, `allowed-tools` at `:4`)
- **Depends on:** none
- **Priority:** low
- **Status:** [ ] open
- **Detail:** Two hygiene findings, no functional failure.
  **(1)** `allowed-tools` lists `Glob` and `Grep` and the body prescribes neither — it does discovery with
  `find` (and the comment beside it argues explicitly for `find` over globbing, because it survives a missing
  directory under zsh), reads with `Read` and writes with `Write`. Honest qualification carried from the
  record: they are not *impossible*, since an agent could reasonably reach for `Grep` to find the day-sections
  in the activity log, so this is a permissive allowlist rather than a wrong one, inherited unchanged from
  `flight`'s original. Either drop them, or name the read they authorise in the body so the allowlist stays
  checkable. Nothing is missing in the other direction.
  **(2)** The description is the outlier by a wide margin — roughly 900 characters of value against 346 for
  the next-longest skill. A skill description is routing metadata and it sits in the context of every session
  in a project with the plugin enabled, whether or not the skill is ever invoked, so that is roughly 220
  tokens of standing cost against a plugin that otherwise keeps them at 60-90, which cuts against fusion's own
  lean-context convention. Most of the length is body material that does not aid routing: the three lists
  enumerated in full, the source inventory, and the resolution mechanism. Cut to the two things routing needs —
  what the skill produces and the trigger phrasings — in the 150-250 character band the other skills use. Keep
  the "what have I been working on" / "what did I do yesterday" / "show my cadence" triggers.
  **Three things were checked and are not issues:** the frontmatter parses (no `: ` sequence inside the
  description value, so the unquoted plain scalar is safe and the known frontmatter-breaking failure mode does
  not apply); the dashes in the description are harmless in plain-scalar YAML; and `argument-hint: ""` is a
  cosmetic inconsistency only.
- **Routing note:** this is a YAML-frontmatter edit, which by the letter of the file-ownership split is
  `ontocoder` territory. It is queued to `coder` because the frontmatter and the body it describes are one file
  and one change, and item 1's honest resolution may be to *name the read* in the body rather than drop the
  tools. If the caller prefers the strict split, treat it as one task with two commits.
- **Acceptance:** `allowed-tools` matches what the body prescribes, or the body names the read the extra tools
  authorise; the description is in the 150-250 character band and keeps the trigger phrasings;
  `claude plugin validate .` still passes.
- **Verified open:** `skills/cadence/SKILL.md:4` at `5ef92eb` still reads
  `allowed-tools: [Bash, Read, Glob, Grep, Write]`; the `description:` line measures **904 characters**
  including the key (re-measured, not carried forward); `grep -cE "\bGlob\b|\bGrep\b"` over the file returns 1,
  which is the frontmatter line itself, so neither tool is named in the body.

### 24. Teach Setup what the churn helper's exit 3 means

- **ID:** `I:260810-1632-churnrank-exit3`
- **Source:** `fusion-workbench/shared/issues/260810-1632_o_setup-documents-churn-rank-exit-2-and-not-the-exit-3-that-this-repos-own-build-cycle-produces.md`
- **Executor:** `coder`
- **Files:** `agents/orchestrator.md` Setup Step 5 (the `bin/fusion-churn-rank` paragraph at `:126`);
  `skills/setup/SKILL.md:227` inherits it by pointing at that block
- **Depends on:** none
- **Priority:** low
- **Status:** [ ] open
- **Detail:** Setup Step 5 wraps `bin/fusion-churn-rank` in an `[ -x ]` guard and explains exit 2. It never
  mentions **exit 3**, which the wrapper raises when `hooks/dist/churn-rank.js` is absent — and the `[ -x ]`
  guard does not cover that case, because the wrapper is present and executable while the thing that is
  missing sits one directory over.
  **Reachable, not theoretical.** `bin/fusion-churn-rank` resolves its program relative to itself
  (`$here/../hooks/dist/churn-rank.js`), so in the fusion work tree during a build, or in any checkout where
  `hooks/dist/` was never built, the helper exists, passes `[ -x ]`, and exits 3. The condition is recorded
  first-hand in the same commit range, at `hooks/lib/__tests__/helpers/guard-harness.ts:120-128`: *"`npm run
  build` deletes and rebuilds `dist/` — a second session running the suite in the same checkout has been
  observed wiping it mid-run."*
  **The `bin/fusion-count-sources` sibling has no equivalent gap** — it is self-contained bash, so "the
  wrapper exists" and "the wrapper can run" are the same question there. For `fusion-churn-rank` they are two
  questions and Step 5 answers only the first.
  **Severity is low and the record says so:** churn is advisory, the failure is loud on stderr, and nothing
  downstream reads the ranking. What it costs is one non-zero exit at the orchestrator's own Setup in
  vocabulary the prompt has not taught the cascade to read — the same complaint decision `260810-0921` filed
  against the bare exit 127, arriving one step later.
  **Recommendation, and it is deliberately small:** add one sentence to the paragraph that already covers
  exit 2 — exit 3 means the plugin's compiled hooks are missing, the remedy is `fusion --update` for an
  installed copy or `cd hooks && npm run build` in a work tree, and the ranking is skipped exactly as in the
  absent-helper branch. **Do not add a cascade branch:** the outcome is identical to the two branches already
  there, and decision `260810-0921` settles that the reason is reported rather than branched on.
- **Acceptance:** Setup Step 5 states what exit 3 means and what the orchestrator does with it; the remedy is
  named for both the installed copy and the work tree; no new cascade branch is added; `skills/setup/SKILL.md`
  still reaches the explanation through its existing pointer rather than restating it.
- **Verified open:** `agents/orchestrator.md:126` at `5ef92eb` documents the `[ -x ]` guard and exit 2 and
  stops there; `grep -c "exit 3" agents/orchestrator.md` → **0**. The wrapper's exit 3 is at
  `bin/fusion-churn-rank:49-52`, verbatim as the record quotes it.

### 25. Make a pty failure in the monitor suite read as a pty failure

- **ID:** `I:260810-1632-pty-case`
- **Source:** `fusion-workbench/shared/issues/260810-1632_o_the-pty-case-in-the-monitor-suite-has-no-path-for-a-machine-that-cannot-allocate-one.md`
- **Executor:** `coder`
- **Files:** `hooks/lib/__tests__/monitor-warnings-panel.test.ts` — `PTY_RUNNER` and `startMonitor`. No
  shipped code.
- **Depends on:** none
- **Priority:** low
- **Status:** [ ] open
- **Detail:** The suite drives the interactive browser-launch case through a `python3` pseudo-terminal
  wrapper. `os.openpty()` is called unguarded and the spawn has no `error` listener, so on a machine that
  cannot allocate a pty the case does not skip and does not name the pty — it times out after 15 seconds with
  `monitor did not come up`, accusing the component that is fine.
  Two failure modes, neither of which names its cause:
  - **No `/dev/ptmx`** (a container, a locked-down sandbox): `os.openpty()` raises `OSError`, python3 exits
    non-zero, the monitor is never started, and the poll throws after 15s. Two of the three new cases use
    `tty: true`, so the suite reports two monitor failures for one pty failure.
  - **No `python3` on `PATH`**: `spawn` emits `error` (ENOENT) with no listener attached, which Node re-raises
    as an uncaught exception; in vitest that surfaces as an unhandled error rather than a failing assertion.
  **Two things the record checked and cleared, so nobody re-checks them:** the fake-`open` shim cannot leak
  (it writes into a fresh `mkdtemp` and is passed only through `opts.env`; the runner's own `process.env.PATH`
  is never mutated), and the process group is cleaned up (`detached: true` makes the python runner the group
  leader, so the existing `afterEach` `process.kill(-p.pid, "SIGTERM")` reaches all three processes). The
  `python3` dependency itself is not the finding either — `bin/monitor` is a python heredoc, so a machine
  without python3 fails the whole monitor suite already.
  **Severity low:** fusion has no CI, the suite is green on the development machine, and the affected cases
  are new rather than regressed. The cost is diagnosability, paid by whoever first runs this suite somewhere a
  pty is not available.
  **Recommendation:** probe once before the tty cases — run `python3 -c "import os; os.openpty()"` and skip the
  two `tty: true` cases with a named reason when it fails — or, at minimum, attach an `error` listener in
  `startMonitor` and include the child's exit status in the timeout message.
- **Acceptance:** on a machine that cannot allocate a pty the two `tty: true` cases skip with a reason naming
  the pty, or fail with a message naming it; a missing `python3` produces a failed assertion rather than an
  unhandled error; the non-tty cases are unaffected; `npm test` green from `hooks/`.
- **Verified open:** `hooks/lib/__tests__/monitor-warnings-panel.test.ts` at `5ef92eb` calls `os.openpty()`
  unguarded inside `PTY_RUNNER`, and `startMonitor` spawns with `stdio: "ignore"` and no `error` listener
  before a 15-second poll whose only failure message is `monitor did not come up`. The file was last touched
  by `2679589`, the commit that added these cases.

---

## Tasks that need a human answer first

Everything from here down carries a `**Human gate:**` line. Dispatching an executor at one of these
produces a guess, not a fix. Three of them are *partial* — part of the work is ungated and named
separately in the task.

### 26. Seed a permission source in the consuming project, because the plugin's `settings.json` is not one

- **ID:** `I:260810-0326-seed-settings`
- **Source:** `fusion-workbench/shared/issues/260810-0326_o_setup-must-seed-claude-settings-because-the-plugin-settings-json-is-not-a-permission-source.md`
- **Executor:** `coder` — **Human gate**
- **Files:** `skills/setup/SKILL.md` (a new seeding step, reusing `/fusion:unlock`'s merge procedure);
  `skills/unlock/SKILL.md` (read-only, the procedure to reuse); `settings.json` at the plugin root
  (its fate is part of the gate)
- **Depends on:** none. Task 5 edits the same file and is queued ahead of it; whoever lands this one
  re-reads `skills/setup/SKILL.md`.
- **Priority:** high
- **Status:** [ ] open
- **Detail:** Measured on 260810 against Claude Code 2.1.226: a plugin's `settings.json` is **not** read
  as a permission source under `--plugin-dir`. The decisive probe was a pair — the same tool, the same
  command, one identical `"Write"` allow entry, differing only in which file held it: in a project's
  `.claude/settings.json` it was permitted; in a minimal throwaway plugin's `settings.json` loaded with
  `--plugin-dir` it was denied and the denial was recorded. So fusion's 16 scoped auto-allows grant
  nothing, in an HTTPS install and a marketplace install alike, and padding that file would change no
  session's behaviour. A fresh consuming project therefore has no permission source of its own, and
  `Write`, `Edit` and the non-sandboxed shell calls every fusion session makes will prompt or be denied
  there.
  **A second measurement is load-bearing for the fix and must not be assumed away:** directory-scoped
  path patterns did not match at all in this version, *from a source that is honoured*. With the entry
  in the project's own `.claude/settings.json`, `Write(fusion-workbench/**)` — the exact form fusion
  ships — and three sibling spellings were all denied. Only the bare `Write` was honoured. Whoever
  implements the seeding must not assume fusion's existing scoped patterns work once relocated; they
  were never exercised, because the file holding them was never read. Why the scoped forms miss is
  **not characterised** — treat it as measured behaviour, not as an explanation.
  One further observation worth a look: under `--agent fusion:orchestrator`, three `Bash` calls were
  denied that ran fine under the default agent in the same directory. An agent with an explicit
  `tools:` allowlist appears to lose the sandbox path that makes read-only shell calls permission-free,
  and fusion's orchestrator is the only agent with such a list.
- **Human gate — two questions, both in the record:** (1) **What the seeded grant is.**
  `/fusion:unlock` is deliberately permissive (`bypassPermissions`); a setup-time default may want to
  be narrower, and the measurement above says a narrower grant *cannot* currently be expressed with the
  scoped path patterns fusion ships. That is a decision, not an executor's call. (2) **What becomes of
  the inert `settings.json` at the plugin root** — delete it, or keep it with a comment saying it is not
  read. Leaving it as-is invites the next reader to conclude from its contents what a session is allowed
  to do.
- **Acceptance:** a fresh consuming project that has only run `/fusion:setup`, with no `.claude/`
  beforehand, completes an orchestrator Turn without a per-tool approval dialog; the seeded file is
  produced by the same merge procedure `/fusion:unlock` uses, not a second implementation of it;
  whatever is decided about the plugin-root `settings.json`, no shipped document claims it grants
  permissions.
- **Verified open:** `grep -c "settings.local.json\|\.claude/settings" skills/setup/SKILL.md` → **0**
  at `5ef92eb`. Setup seeds no permission source, unchanged since `430d73a`.

### 27. Stop a known-red baseline from blocking every task that runs the suite

- **ID:** `I:260810-0703-blocked-derivation`
- **Source:** `fusion-workbench/shared/issues/260810-0703_o_the-report-contract-derives-blocked-from-a-suite-exit-code-so-a-known-red-baseline-blocks-every-task.md`
- **Executor:** `coder` — **Human gate: three ways, none obviously right, per the record**
- **Files:** `agents/coder.md` (the `Verification:` forms and the `Result` derivation, `:78-80` at HEAD),
  `agents/ontocoder.md` (the same contract), `agents/orchestrator.md` Step 3a step 5 (the receipt branch
  that reads the field)
- **Depends on:** none
- **Priority:** high
- **Status:** [ ] open
- **Detail:** Commit `1f2faaf` gave the executors a report shape in which `Verification:` admits three
  forms and `Result` is derived from it, so `done` requires an exit code of 0. The derivation is what
  made `done` mean something and it works. It also has a consequence nobody stated: **the exit code it
  reads is the whole suite's**, so any pre-existing failure blocks every task that runs the suite,
  whatever the task touched. Observed the night the contract landed: an executor fixed
  `bin/fusion-count-sources`, ran `npm test`, got 967 of 968 passing with the single failure in a
  fixture the task never touched, and reported `Result: blocked … field 2 decides, not me`. That is the
  contract behaving exactly as written, and the executor was right to follow it rather than exercise
  judgement about which failures count. The cost is that one unrelated failure converts into a blocked
  report from every executor dispatched until somebody clears it, and the party who can clear it is
  often not the party being blocked. **There are three states and the shape distinguishes two:** the
  verification passed; it failed because of this task; it failed for a reason that predates the task and
  is named, owned and tracked elsewhere. The third currently reads as the second. The dispatch prompts
  worked around it by naming the known failure in prose, which is a convention that works only because
  the dispatcher remembers to warn.
- **Human gate — the record lists three and recommends none.** (1) **Leave it.** A red baseline is a
  real defect and blocking on it is arguably correct; the alternative is executors deciding for
  themselves which failures are theirs, which is exactly the judgement the derivation removed. (2) **Add
  a fourth `Verification:` form** for "failed, and the failure is named and predates this task" — this
  reintroduces a judgement call, and the same session's reviews show how readily an agent's
  self-assessment overstates. (3) **Make the question narrower rather than the answer softer** — ask the
  suite about the task's own surface, so the exit code being read is about this task. That is the shape
  `rules/critical-stance.md` §4 recommends when a question cannot be decided from the inputs at hand,
  and it costs a way to select tests per change, which this repository does not have.
- **Acceptance:** whichever option is taken is recorded as a decision rather than implied by the
  implementation; if the shape changes, `coder`, `ontocoder` and the orchestrator's receipt branch move
  together; an executor is never asked to judge which failures are its own.
- **Verified open:** `agents/coder.md:78-80` at `5ef92eb` still defines exactly the three `Verification:`
  forms, and `agents/orchestrator.md` Step 3a step 5 still branches on them. No fourth form and no
  per-surface selection exists. The baseline is green today — 40 files, 1072 tests — so nothing is
  blocked right now; the defect is latent until the next red.

### 28. Give existing pre-Circle work a route into a Circle

- **ID:** `I:260803-1837-precircle-route`
- **Source:** `fusion-workbench/shared/issues/260803-1837_o_no-route-turns-existing-pre-circle-work-into-a-circle.md`
- **Executor:** `coder` — **Human gate: the second question is explicitly the framework owner's**
- **Files:** `agents/shaper.md` (anticipated-circle mode's fixed frontmatter fill, `:65` at HEAD;
  portfolio-activation mode above it); `skills/direct/SKILL.md`, `skills/seed-from-plane/SKILL.md`;
  `rules/circle-records.md` (the Circle record template)
- **Depends on:** none
- **Priority:** high
- **Status:** [ ] open
- **Detail:** Circle creation accepts a raw one-line draft and nothing else. There is no route that
  takes work already on disk — a finished spec, a reviewed plan, its issues and its answered decisions —
  and makes a Circle out of it, although the conventions treat the pre-Circle case as routine and say so
  in as many words. Anticipated-circle mode creates the Circle from a draft string with a fixed
  frontmatter fill (`**Active spec/plan:**` and `**Active session history:**` are `(none yet)`), writes
  no spec, and may not modify an existing Circle; two skills reach that mode and both inherit the
  hardcoded value. Portfolio-activation mode *does* set the field, but it produces a new spec in the same
  run, so pointing it at already-planned work yields a second spec and repoints the field away from the
  reviewed plan — worse than the gap. So the only way to attach existing work is a hand edit that no
  prompt authorises, on a field whose three consumers (`/fusion:circle-stash`'s lookup, playmaker's
  `portfolio.md` rendering, the orchestrator's resume) all "degrade without announcing it". A Circle left
  at `(none yet)` looks healthy in the portfolio briefing while its plan is invisible to everything that
  would surface it. The clarification round is wasted work too: the mode re-asks questions an existing
  spec already answered.
  **Minimum a fix must do:** a route that takes an existing plan or spec and produces an anticipated
  Circle whose `**Active spec/plan:**` names it, whose `## Grounding snapshot` carries the decisions the
  plan realises, and whose `## Dependencies` cites the issues it closes — a hardened plan's own
  cross-reference block already carries the material for all three. Activation then has to **skip** the
  shaping pass rather than mint a second spec, which is a change to portfolio-activation mode as well.
- **Human gate:** the second question is the framework owner's and is deliberately left open — **should
  files move into the Circle, or only be pointed at?** Three shapes, listed in the record without a
  recommendation: pointer only (cheapest, consistent with the Origin Rule as written, leaves the
  container property unmet); adoption with citation rewrite (delivers the container property, needs a
  second placement rule and a reliable rewrite pass, which is what the Origin Rule's second corollary
  warns against); or a `## Working set` section on the record listing every artifact with its path (a
  view rather than a placement, so it needs no change to the Origin Rule). The Origin Rule as written
  forbids moving, and the only escape hatch it contemplates runs the other way, Circle to `shared/`. If
  shape 2 or 3 is taken, it belongs in a decision record.
- **Acceptance:** a user with a finished spec and a reviewed plan can create a Circle that names them,
  without a hand edit and without minting a second spec; activation of such a Circle does not re-run the
  clarification round; whichever placement shape is chosen is recorded as a decision, not implied by the
  implementation.
- **Verified open:** `agents/shaper.md:65` at `5ef92eb` still fixes `**Active spec/plan:**` and
  `**Active session history:**` to `(none yet)` in anticipated-circle mode — unchanged since `430d73a`.

### 29. Put the two Plane runtime files in the tree that calls itself exhaustive

- **ID:** `I:260810-0410-layout-tree`
- **Source:** `fusion-workbench/shared/issues/260810-0410_o_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md`
- **Executor:** `coder` — **Human gate (partial): one of the two files is already classified**
- **Files:** `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` (the tree) and its
  tracked/untracked split
- **Depends on:** task 10 — **content dependency.** That task moves the second enumeration out of the
  file; doing it first means these two files get added in one place rather than two, which is what the
  record and its sibling both ask for.
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** The layout tree enumerates the root-anchored surfaces and says of that enumeration: *"The
  list is exhaustive as written, and it is a list rather than a count on purpose."* It then names the
  obligation that keeps it true: *"When a `bin/` helper or a hook adds a root-anchored surface, it lands
  in this tree in the same commit."* Two root-anchored surfaces are missing:
  `fusion-workbench/.plane-map.json` and `fusion-workbench/.plane-outbox.jsonl`. Both are owned and
  written by `bin/fusion-plane`, both sit at the workbench root, and `CLAUDE.md` names them there. The
  tree does not.
  **This is worth a record rather than a one-line edit** because the paragraph does not merely list — it
  makes a claim about itself and names the discipline that keeps the claim true. The omission is evidence
  that the discipline did not hold when the Plane bridge landed, and the same gap recurs with the next
  helper that needs root-anchored state. Note also that the tree justifies root-anchoring per surface —
  none of the listed surfaces belongs to a unit of work — and that argument has never been made for
  either Plane file.
- **Human gate — one of three questions is open, and it is narrow.** (1) Do the two files belong in the
  tree with the same per-surface justification the others carry? (2) Which group does each fall into?
  **`.plane-map.json` is answered — tracked, because it holds the record-to-Plane-ID binding without
  which the idempotent push breaks.** `.plane-outbox.jsonl` is **not**: it is a human-readable record of
  deferred pushes, which reads like the tracked group, but it grows unboundedly, which reads like the
  ignored one. (3) Is there a check that would have caught this, or does the obligation stay a
  convention? A lint comparing the root-anchored paths named across `bin/` and `hooks/` against the
  tree's enumeration is conceivable; whether it is worth its own maintenance is the open part.
  **The ungated part** — adding `.plane-map.json` to the tree with its justification — can start as soon
  as task 10 lands.
- **Acceptance:** both files appear in the tree exactly once, each with the per-surface justification the
  other entries carry; `.plane-outbox.jsonl`'s group is decided rather than defaulted; whether the
  obligation gets a gate is answered explicitly rather than left implied.
- **Verified open:** `grep -c "plane-map\|plane-outbox" rules/fusion-workbench-conventions.md` → **0** at
  `5ef92eb`. Neither file appears anywhere in the conventions.

### 30. Decide whether archived records are readable, and say so either way

- **ID:** `I:260801-1020-archive-scan`
- **Source:** `fusion-workbench/shared/issues/260801-1020_o_scan-keys-never-reach-the-archive-store.md`
- **Executor:** `coder` — **Human gate: the record calls this a design call, not a bug fix**
- **Files:** `bin/fusion-paths`; `rules/fusion-workbench-conventions.md` `## Path Resolution`;
  `rules/workbench-path-resolution.md` (the key table)
- **Depends on:** none
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** Nine read keys are defined and every one resolves into the active Circle and `shared/`.
  **None resolves into `archive/`.** Meanwhile `/fusion:archive` tier-1 moves whole terminal Circles plus
  closed defects, closed plans, and implemented and superseded decisions out of the shared store, and
  `/fusion:cleanup` Step 4 runs tier-1 **autonomously with no confirmation gate**. Failure scenario: a
  project runs `/fusion:cleanup` at the end of each session, as intended; after several months most
  closed Circles and all implemented and superseded decisions sit in `archive/`; a reconciler then
  computes the Grounding-Directive edge by globbing the decision store and sees only the live records; a
  new decision that contradicts an archived implemented one is filed, answered and implemented with
  nothing noticing, because the record it contradicts is outside every resolved read path. The
  supersession marker the vocabulary exists to express is never applied, and the Grounding-history layer
  stops functioning as a layer. The same blindness hits any capability grounded in project history: the
  record set shrinks with every cleanup run, precisely as the project's history gets longer.
  Two candidates: add an explicit archive read key (say `SCAN_ARCHIVE`) that the resolver emits for
  consumers whose prompts name it, which follows the existing derive-from-prompt contract and costs
  nothing for consumers that never ask; or state deliberately that archived material is out of scope for
  all agent reads and say so in the conventions.
- **Human gate:** option 2 is genuinely defensible — unbounded read scope has its own cost — so this is
  a choice, not an oversight to be corrected by an executor. What is **not** defensible is the current
  state, where the exclusion is invisible and its effect grows silently. Either answer closes it; no
  answer does not.
- **Acceptance:** an agent that needs archived records can resolve a path to them, or the conventions
  state that archived material is deliberately out of every agent's read scope; the reconciler's
  Grounding-Directive computation is explicitly covered by whichever answer is chosen.
- **Verified open:** `grep -c "archive" bin/fusion-paths` → **0** at `5ef92eb`. No `SCAN_ARCHIVE`, no
  archive resolution of any kind. Same result at the two previous build points.

### 31. Give a Circle's state one source instead of two

- **ID:** `I:260802-0920-status-field`
- **Source:** `fusion-workbench/shared/issues/260802-0920_o_next-skill-activates-a-circle-without-updating-its-status-field.md`
- **Executor:** `coder` — **Human gate: the record's preferred option is a decision, not a fix**
- **Files:** depends on the choice. `skills/next/SKILL.md` Step 6 (the rename at `:146`),
  `agents/orchestrator.md` Phase 4 closure, `rules/circle-records.md` (the record template)
- **Depends on:** none
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** `/fusion:next` Step 6 renames the Circle record from `_a_circle.md` to `_t_circle.md` and
  writes `.active-circle`, and never touches the record's `**Status:**` field, so the field keeps saying
  `anticipated` while the filename says active. The template defines both surfaces and no rule says which
  wins; the marker is the one every agent reads, which makes the field the copy that rots.
  **Four reconciliation passes measured the whole workbench and corrected the record's own scope
  paragraph in a direction it did not anticipate.** The field is *not* never updated: five of six closed
  Circles said `closed`, and one record read `active` at a closed marker, meaning its field was updated
  at activation and missed at closure — the inverse failure. So the defect is not "the transition points
  never update the field"; it is that **no prompt or skill step requires the update**, so it happens when
  a writer happens to notice and is skipped when nobody does. By the fourth pass the defect had
  out-raced its own correction inside eight minutes.
  Three candidates: update the field at every transition point (correct, and it spreads an obligation
  that every new transition point inherits and can forget); **drop `**Status:**` from the template and
  let the marker be the only source**; or keep the field and define it as decorative. The record and four
  reconciliations all lean to the second, on the ground that a field maintained by attention rather than
  by procedure will keep producing exactly the mixture observed — and because the framework already made
  this call once, replacing a declared key set with a derived one for the same reason.
- **Human gate:** option 2 removes a field from a record template every consuming project writes, so it
  is a decision record, not a defect fix. Note also that one record
  (`circles/260801-1244-rule-provenance-header`) deliberately preserves the contradiction as the sole
  specimen, per its own closure note — do not "fix" it by hand.
- **Acceptance:** a reader of a Circle record has exactly one authoritative statement of its state;
  whichever option is taken, the obligation lands somewhere a new transition point cannot silently skip;
  the preserved specimen record is handled deliberately.
- **Verified open:** `skills/next/SKILL.md:146` at `5ef92eb` is
  `mv "$CDIR/_a_circle.md" "$CDIR/_t_circle.md"`, and `grep -c "Status:" skills/next/SKILL.md` → **0** —
  no `**Status:**` write anywhere in the file. Unchanged since `430d73a`.

### 32. Put the task's origin in the dispatch prompt

- **ID:** `I:260805-0629-dispatch-origin`
- **Source:** `fusion-workbench/shared/issues/260805-0629_o_dispatch-prompt-carries-no-origin-so-a-sub-agents-history-lands-by-pointer-alone.md`
- **Executor:** `coder` — **Human gate: two choice points, both stated in the record**
- **Files:** `agents/orchestrator.md` Step 3a step 4 (the four-bullet dispatch prompt, ending at `:377`
  at HEAD); `rules/fusion-workbench-conventions.md` `## Origin Rule (Herkunftsregel)`
- **Depends on:** none
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** The dispatch prompt names four things — what to do, which files to touch, the acceptance
  criteria, and a reference to the source file — and origin is not one of them. So a dispatched agent
  cannot apply the Origin Rule; it can only take whatever `.active-circle` says. The Origin Rule leaves
  exactly one judgement to the writing agent — *"did this arise from the active Directive, or did you
  merely find it nearby?"* — and a dispatched sub-agent is a cold start with no memory of the session, so
  it knows only those four bullets, none of which answers the question. Meanwhile `bin/fusion-paths`
  resolves `OUT_HISTORY` mechanically from `.active-circle`, so with a Circle active every dispatched
  agent's history store is the Circle's, regardless of what the task was about. The resolution is correct
  as specified and still semantically wrong whenever the task did not come from the Directive. The damage
  is not a lost file — both stores are always scanned — it is that the Circle's record of what it
  produced now includes work it did not produce, which is the attribution the container layout exists to
  keep straight. **Reuse the parameter mechanism that already carries `**Domain:**`** rather than
  inventing a second one; the same mechanism already carries `**Executors:**`, `**Mode:**`,
  `**Circle file:**` and `**Parent task:**`.
- **Human gate:** two things the record explicitly does not settle. (1) Is the origin statement
  **advisory** (the agent still resolves through `bin/fusion-paths`) or **binding** (the agent overrides
  the resolved `OUT_HISTORY` when told the task is not Circle-work)? The second is the larger change,
  because it puts a store decision back into a prompt after v4.0.0 deliberately took it out. (2) Is
  history even the right artifact to move? A sub-agent's history records a dispatch the orchestrator made
  during this Circle's session, which is arguably Circle-work whatever the task was about — if that
  reading holds, the defect is only the absence of a stated origin, and just issues and decisions need
  the routing.
- **Acceptance:** the dispatch prompt states the task's origin explicitly, supplied by the orchestrator,
  which is the party that knows why it dispatched; if the fix goes past the advisory form, the two
  questions above are answered in a decision record first.
- **Verified open:** read `agents/orchestrator.md` Step 3a step 4 at `5ef92eb`. It still lists exactly
  four bullets, ending with "Reference to the source plan/issue file" at `:377`, with no origin line.

### 33. Let the orchestrator notice a file that changed with no task authorising it

- **ID:** `I:260801-1410-unattributed-edit`
- **Source:** `fusion-workbench/shared/issues/260801-1410_o_unattributed-edit-to-ontocoder-prompt-during-session.md`
- **Executor:** `coder` — **Human gate: part 1 is a question only the user can answer**
- **Files:** `agents/orchestrator.md` Step 3a step 5 ("Verify output", `:384` at HEAD)
- **Depends on:** task 32 — both edit `agents/orchestrator.md` Step 3a, one step apart.
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** **Part 2 of this record is already discharged and must not be redone.**
  `agents/ontocoder.md` gained a scope-exclusion bullet during a session with no task authorising the
  file, and the added text asserted orchestrator behaviour that does not exist ("The orchestrator
  grep-checks staged diffs before committing"). Commit `a342e9b` committed the bullet and removed the
  false sentence, verifying that no such grep appears in `agents/orchestrator.md` and no implementation
  exists in hooks or skills. What remains is parts 1 and 3.
  **Part 3 is the durable half and is not specific to that incident:** the orchestrator should diff the
  working tree against its own expected file set after each dispatched task, rather than relying on an
  executor happening to report an anomaly it noticed in passing — which is the only reason this one
  surfaced at all. Note what the record establishes about the guard: `agents/**` is on the protected
  list, but the guard stands down entirely when cwd is the plugin's own repo, so nothing there could have
  detected the edit; and after the shell-bypass work it still could not, because the plugin-repo
  stand-down covers that too by design. So the detection has to be the orchestrator's, not the guard's.
- **Human gate:** part 1 asks the user to confirm or deny authorship of the original nine lines. Nothing
  in the Circle histories, the session history or the commit trail records an answer, and the commit's
  attribution says nothing because every commit in that session carries the same. An agent cannot answer
  this. If it was an agent's edit, that is a scope violation worth understanding, since no dispatched task
  in the session was near that file. If the user cannot reconstruct it after this long, say so and close
  part 1 explicitly rather than leaving it hanging.
- **Acceptance:** the orchestrator compares the working tree against the file set it dispatched for, and
  reports a file that changed outside it; part 1 is answered or explicitly retired; part 2 stays done.
- **Verified open:** `agents/orchestrator.md:384` at `5ef92eb` reads "Check that it modified only files
  within its declared scope" — the agent's own report, not a measurement.
  `grep -c "diff the working tree\|expected file set" agents/orchestrator.md` → **0**.

### 34. Check the design diagram against the prose it illustrates

- **ID:** `I:260804-1702-diagram-agreement`
- **Source:** `fusion-workbench/shared/issues/260804-1702_o_the-diagram-self-check-tests-shape-and-never-tests-agreement-with-the-prose.md`
- **Executor:** `coder` — **Human gate: the general rule is what needs deciding**
- **Files:** `rules/design-diagrams.md` `## Coherence self-check`; possibly `agents/conceptrev.md`
- **Depends on:** none
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** The self-check asks five questions — hairball, fan-out, cycles, layering, orphans — and all
  five are about the graph **in isolation**. None asks whether the graph says the same thing as the
  document around it. A plan can pass every one and still draw a dependency the prose does not declare,
  or omit one the prose does. Not hypothetical: it was the finding in two consecutive independent
  evaluations in the same Circle, against two plans by the same authoring agent. The second returned a
  tangled verdict for a missing `Step 2 → Step 4` edge that Step 4's own text declares, four statements
  about two steps disagreeing, and a transitive-reduction policy applied inconsistently so a missing edge
  could not be told from a deliberate omission — and named the recurrence explicitly: *"in both plans the
  work-order graph is read at a gate for a partition it does not draw."*
  **The five shape questions could not have caught either one, and this is the sharp part: a graph with a
  missing edge is *less* tangled by every measure the checklist names — fewer edges, lower fan-in, no new
  cycle. The checklist rewards the defect.** Both instances fell on the question the human gate was
  convened to answer, which is where the cost is highest: a reader who trusts the picture starts work that
  cannot proceed, or approves an ordering the plan does not have. What is missing is an agreement check
  between the graph and the declarations it draws, **plus** a stated policy on transitive edges so a
  reader can tell a deliberate omission from a forgotten one.
- **Human gate:** one worked formulation exists as a local convention in a revised plan — every edge is
  one name in one step's `Dependencies` line and every name in every `Dependencies` line is one edge,
  direct prerequisites only. Whether that is right as a *general* rule is exactly what needs deciding: it
  is written for a dependency DAG and says nothing useful about a sequence diagram or an entity model, so
  lifting it verbatim into the rule file would be the wrong move.
- **Acceptance:** the self-check asks at least one question the graph cannot pass while contradicting its
  document; the transitive-edge policy is stated so an omission is distinguishable from a forgotten edge;
  whatever is added is scoped to the diagram types it actually applies to.
- **Verified open:** read `rules/design-diagrams.md` `## Coherence self-check` in full at `5ef92eb`. It
  lists exactly five bulleted questions, all about the graph alone;
  `grep -c "agreement\|agrees with the prose"` over the whole file → **0**.

### 35. Close the branch-policy halt record, or state what is left of it

- **ID:** `I:260809-2255-guard-halt`
- **Source:** `fusion-workbench/shared/issues/260809-2255_o_the-branch-policy-verification-left-an-active-halt-and-24-consecutive-blocks-in-the-live-guard-state.md`
- **Executor:** `coder` — **Human gate: the record's own closure is the question**
- **Files:** none unless the second criterion is taken up, in which case a verification-surface rule
  under `rules/`
- **Depends on:** none
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** A verification sweep ran the branch policy's documented deny cases as real `Bash` calls
  against the **live** project guard rather than against a harness project — nine of them inside 1.3
  seconds — and left `haltActive: true` with 24 consecutive blocks, while both status surfaces a human
  consults still said `Guard: OK (0 blocks)`. **The first acceptance criterion is now met.** The halt was
  cleared by a human intervention on 2026-08-09, and the clearing is recorded in a session history file
  that names the intervention and states that the events left in `recentEvents` are residue of a policy
  that no longer exists — correct to leave, because `recentEvents` is a log and the events happened.
  **The second criterion is not met and may be moot.** It asks that "the verification-surface rule covers
  the branch policy explicitly". No such rule exists, because commit `7598073` deleted the branch policy
  outright before a rule could be written for it. That leaves the criterion satisfiable only in the
  general form — *a policy is verified through the sanctioned harness, not through live probes against the
  running project* — which is the same shape of question that
  `shared/decisions/260810-0710_o_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`
  carries from the other direction.
  The record also proposed a read-only classification path so a reviewer could measure a guard verdict
  without moving the escalation counter. The branch policy is gone, but that shape — a probe that
  measures without side effects on shipped project state — still applies to the protected-path
  measurement. If it is wanted, it is a decision record, not a defect.
- **Human gate:** the reconciler states plainly that it does not make this call, because the criterion is
  written as a rule obligation and not as a state fact. **The question for the user is one sentence: with
  the branch policy deleted, is criterion 2 moot, so that this record closes on criterion 1 alone?** If
  yes, this is a marker change and no code work. If no, the general verification-surface rule is the
  deliverable.
- **Acceptance:** either the record is closed with the reason recorded, or a verification-surface rule
  exists that names the harness as the sanctioned surface in the general form; the residual read-only
  probe idea is filed as a decision or explicitly dropped.
- **Verified open:** `fusion-workbench/.guard-state/escalation.json` at `5ef92eb` reads
  `haltActive: false, consecutiveBlocks: 0` — criterion 1 confirmed still met, against the `true / 24` the
  record quotes. `grep -rn "sanctioned verification surface\|harness is the sanctioned" rules/ agents/
  CLAUDE.md` → **nothing**; criterion 2 confirmed unmet.

### 36. Make a marker rename impossible to stage half-way

- **ID:** `I:260810-0819-marker-staging`
- **Source:** `fusion-workbench/shared/issues/260810-0819_o_head-carries-six-records-twice-and-the-class-fix-was-deferred-to-a-decision-never-filed.md`
- **Executor:** `coder` — **Human gate: the record's own second criterion is a decision**
- **Files:** `rules/fusion-workbench-conventions.md` `## State Markers` (the authoring home named by the
  record), plus a gate under `hooks/lib/__tests__/` if the convention route is taken
- **Depends on:** none
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** Three commits in one session performed `_o_` → `_c_` marker renames add-only: the new
  filename was staged, the old one was not. HEAD then carried six records under two names each, and a
  marker glob against git returned 52 open records where the disk held 46. On disk every record appeared
  once; the six deletions sat unstaged.
  **This is not simply a repeat.** `260807-1941_c_` closed the identical shape for three records three
  days earlier, and its own "The fix" section is explicit that it was closing the *instance* and not the
  *class*: *"whether a marker rename should go through `git mv` as a convention, so the two halves of a
  rename cannot be staged apart. **That is a decision, not a fix**."* That deferral was honest — and no
  decision record was ever filed for it, so the class was left with neither a fix nor an open question
  tracking it, and it recurred at twice the volume in a session that never noticed. The general lesson
  that record drew ("stage the containing directory with `-A`, or name both the old and the new path")
  lives only inside a closed defect record. Nothing an agent loads at Setup carries it.
  **The first acceptance criterion is met and has stayed met** — see the verification below — so what
  remains is entirely the class.
- **Human gate:** the record's second criterion offers an either/or that only the framework owner can
  settle: **file a decision record on the staging convention for marker renames, or write the convention
  where an agent reads it and give it a gate.** Its third criterion adds that `260807-1941_c_`'s deferral
  must be answered explicitly rather than left standing for a third recurrence.
- **Acceptance:** `git ls-tree -r HEAD` returns each record exactly once under its current marker (met);
  the class is addressed rather than the instance, by a filed decision or by a written and gated
  convention; the earlier record's deferral is answered explicitly.
- **Verified open:** ran the record's own reproduction at `5ef92eb`.
  `git ls-tree -r --name-only HEAD -- fusion-workbench/shared/issues | grep -c '_o_'` → **47**, and
  `ls fusion-workbench/shared/issues | grep -c '_o_'` → **47**: git and disk agree, and the five renames
  in this commit range were staged correctly, so **criterion 1 held through another five renames**.
  Criterion 2 is unmet: `grep -c "git mv" rules/fusion-workbench-conventions.md` → **0**, and
  `shared/decisions/` still contains no record on marker-rename staging.

### 37. Make the Turn 1 review's totals match the findings it carries

- **ID:** `I:260810-0820-review-totals`
- **Source:** `fusion-workbench/shared/issues/260810-0820_o_the-turn-1-review-totals-table-says-fourteen-findings-and-the-body-carries-seventeen.md`
- **Executor:** `coder` — **Human gate (partial): the third criterion is a decision**
- **Files:** `fusion-workbench/shared/reviews/260810-0512-coderev-turn-1-range-8960e1a-to-head.md`
  (the totals table at `:167-179` and the sentence under it);
  `fusion-workbench/shared/reviews/260810-0752-coderev-turn-2-range-ff70d3a-to-head.md:4` (the range line)
- **Depends on:** none
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** The Turn 1 review's totals table reads Critical 0 / High 3 / Medium 6 / Low 5, total 14,
  and the sentence under it says "All fourteen are in `shared/issues/`". The body of the same file carries
  **seventeen** findings, each with an explicit severity in its heading: High 3 (the table agrees), Medium
  7 (the table says 6), Low 7 (the table says 5). The table's own rows sum to 14, so this is not a
  transcription slip in the total cell — two severity rows are short. The stamp range in the sentence is
  right and every one of the seventeen records is real; only the count is wrong.
  **The wrong number propagated.** It is the figure quoted back to the reconciler in the Phase 3 dispatch
  and it is the figure any future reader will take, because a totals table is what a reader trusts over a
  manual recount of seventeen headings. Three findings under-counted is not cosmetic: the session's own
  closed-versus-filed arithmetic is the input to the Coherence verdict, and this table biases it toward
  progress.
  A second, smaller instance in the same cohort: the Turn 2 review's header says the range is 6 commits
  where `git rev-list --count` returns 5. The nine findings and the file counts in the same header are
  correct; only the commit count is off by one.
- **Human gate — the third criterion only.** The first two criteria are arithmetic and ungated: fix the
  totals table to 3 / 7 / 7 / 17, fix the sentence, fix the range line to 5 commits. The third asks
  whether a review's totals should be **derived** rather than typed — the counts are mechanically
  recoverable from the finding headings the file already carries, and this is the third counting defect
  the cohort has produced. If the answer is that they stay typed, that has to be said somewhere a reviewer
  reads, rather than leaving the next recount to a reconciler.
- **Acceptance:** the Turn 1 totals table reads 3 / 7 / 7 / 17 and the sentence says seventeen; the Turn
  2 range line says 5 commits; whether totals become derived is answered and recorded either way.
- **Verified open:** re-ran the record's own reproduction at `5ef92eb`.
  `grep -c '^\*\*F[0-9]* · '` on the Turn 1 review → **17**; the table at `:167-179` still reads
  `0 / 3 / 6 / 5` totalling **14**, and the sentence still says "All fourteen".

### 38. Detect a chat profile that still names its sibling by filename

- **ID:** `I:260807-2154-stale-profile`
- **Source:** `fusion-workbench/shared/issues/260807-2154_o_corrected-sibling-wording-never-reaches-an-existing-consumer.md`
- **Executor:** `coder` — **Human gate (partial): the guarded-copy semantics are deliberate**
- **Files:** `skills/setup/SKILL.md` (the four guarded profile copies at `:135-138`); possibly `README.md`
  beside the `**Artifact language:**` line
- **Depends on:** task 26 — both edit `skills/setup/SKILL.md`; land the permission seeding first.
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** A plan step replaced the same-language *filename* in both chat profiles with a
  language-neutral role reference. The corrected files reach new consumers only. Every project set up
  before v6.1.0 keeps a `chat-voice-<lang>.yaml` that still names `default-voice-<chat-lang>.yaml` as its
  long-form sibling — which is exactly the file the two-declaration split stops emitting once that project
  declares `**Artifact language:**`. No skill refreshes an existing workbench's profiles: setup's four
  copies are all guarded by `[ -f … ] ||`, `/fusion:migrate` names `stilwerk/` in its never-touch list, and
  `/fusion:archive` excludes it.
  Failure scenario: a project set up at v6.0.1 with `**Language:** de` adds `**Artifact language:** en`;
  `bin/fusion-rules` emits `chat-voice-de.yaml` and `default-voice-en.yaml`; the stale chat profile tells
  the agent the sibling is `default-voice-de.yaml`, a file that was not emitted. The agent then holds two
  contradicting statements, because `rules/agent-setup.md` ships fresh with the plugin and says the two
  paths *may* name different languages and that this is intended. Resolving that conflict the wrong way is
  the behaviour the wording change was written to prevent.
  Three candidates: have `/fusion:setup` detect a chat profile that still names a `default-voice-*.yaml`
  filename and tell the user to delete it so the fresh copy lands (detection is a plain `grep`, the
  overwrite stays opt-in); document the one-time refresh in `README.md` beside the `**Artifact language:**`
  line; or accept and close, since the shipped rule already carries the authoritative statement and the
  stale comment is only a hint.
- **Human gate:** options 1 and 2 need a decision first. The guarded-copy semantics are deliberate —
  *"existing files are left untouched, so any project-local edits to the profiles survive subsequent
  setups"* — and must not be silently inverted. **The detection itself is the ungated half:** a `grep` that
  reports and changes nothing does not touch those semantics.
- **Acceptance:** a pre-v6.1.0 consumer that adopts the two-declaration split either gets told once to
  refresh its chat profile, or is documented as not needing to; project-local edits to a profile are never
  overwritten without the user asking; if the record's third option (accept and close) is chosen, that is
  recorded as a decision rather than left implicit.
- **Verified open:** the four `[ -f … ] ||` guarded copies are at `skills/setup/SKILL.md:135-138` at
  `5ef92eb`, verbatim as cited and at the same line numbers. `grep -rn "stilwerk" skills/` finds no other
  write path — every remaining hit is a read of a chat profile or an exclusion entry.

### 39. Let a release state, from evidence, whether its range was reviewed

- **ID:** `I:260810-1618-release-ordering`
- **Source:** `fusion-workbench/shared/issues/260810-1618_o_a-release-was-tagged-and-pushed-while-its-own-review-pass-was-still-running.md`
- **Executor:** `coder` — **Human gate: three candidate directions, none decided in the record**
- **Files:** `CLAUDE.md` `## Release process` (the gate list — step 0 validate, the smoke test, the
  guard-testing caution); `agents/orchestrator.md` (the Turn loop's review dispatch and the release
  sequence)
- **Depends on:** task 8 — **content dependency.** That task builds the range-against-reviews computation
  from the review filenames; this task consumes it as a precondition rather than as a report. Do not build
  it twice.
- **Priority:** normal
- **Status:** [ ] open
- **Detail:** Session `260810-1402` dispatched a `coderev` pass over its own commit range
  `430d73a..HEAD` and, to avoid making the user wait, ran the release mechanics in parallel: version bump
  across four surfaces, `claude plugin validate`, the agent smoke test, the marketplace bump, `git push`,
  `git tag -a v7.2.0`, `git push origin v7.2.0`. **The release finished first. v7.2.0 is tagged, pushed
  and reachable by every consumer while the review of what it contains had not returned.** The dispatch
  prompt for that review said, in its first line, that a release goes out immediately after and that its
  findings decide what ships; the orchestrator then did not wait for the answer to the question it had
  just asked. Five of this queue's seven new records came out of that review.
  **Why this is not merely untidy.** A finding now cannot change v7.2.0. It lands in a 7.2.1, after
  consumers have been told to update — and the user's stated reason for closing the session early was
  precisely to update consumers. Holding the tag for the ten minutes the review needed would have cost
  nothing that mattered.
  **A reproduction, not a new class, and the distinction decides who fixes what.** `260810-1205` (task 8)
  is about **coverage**: passes that ran but did not tile the range, and nothing measuring the gap
  afterwards. This record is about **ordering**: a pass correctly scoped to the whole range and overtaken
  by the release it was gating. A coverage metric computed at session end would have reported this range
  as fully reviewed, because the review did eventually run. **Fixing `260810-1205` does not fix this.**
  Note also that task 8 was in the previous queue, classified high, ordered behind task 2, and not
  reached — the session carrying the fix committed the defect.
  **The release procedure is where it should be caught.** `CLAUDE.md`'s release section has a validate
  gate, a smoke test and a guard-testing caution, and no gate asking whether the range being tagged has
  been reviewed. Every check it carries is about whether the plugin *loads*; none is about whether anyone
  looked at the change. Prompt text telling a future orchestrator to be patient is not a repair for that —
  the same reasoning `260801-2038` (task 2) records about prompt-only fixes.
- **Human gate — the record lists three and decides none.** (1) **A release gate that refuses to tag over
  an unreviewed range**, derived from the review filenames against `git rev-list` — task 8's computation
  used as a precondition. (2) **Make the review synchronous whenever a release follows** — cheap, and what
  should have happened, and exactly the kind of instruction that loses to task pressure, which is how this
  happened. (3) **Accept that a release may go out over an unreviewed range, and say so** — already an open
  question with a home at
  `shared/decisions/260810-0710_o_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`.
  If the answer there is yes, this record closes as intended behaviour rather than as a defect.
- **Acceptance:** a session that tags a release can state — from evidence rather than from recollection —
  whether the tagged range was reviewed, and a `no` is visible **before** the tag is pushed rather than
  after; the computation is task 8's, not a second one.
- **Verified open:** `git tag --points-at 8b2a206` confirms `v7.2.0` sits on the release commit inside the
  range, and `shared/reviews/260810-1632-coderev-turn-1-range-430d73a-to-head.md` — the review of that
  range — is stamped 16:32, after the tag. `CLAUDE.md` `## Release process` at `5ef92eb` lists steps 0
  through 6 with no review-coverage gate among them.

### 40. Decide what an unused `--fixture` should do, then stop it being silent

- **ID:** `I:260810-0918-push-fixture`
- **Source:** `fusion-workbench/shared/issues/260810-0918_o_push-fixture-without-rebuild-map-never-reads-the-fixture-and-says-nothing.md`
- **Executor:** `coder` — **Human gate: the record names what must be decided before it is fixed**
- **Files:** `bin/fusion-plane` — `cmd_push` flag handling
- **Depends on:** task 19 — both edit the same flag surface; land the documentation fix first, since it is
  ungated and cheap.
- **Priority:** low
- **Status:** [ ] open
- **Detail:** `--fixture <f>` is only ever consumed by the rebuild path. A caller who passes it without
  `--rebuild-map` gets a run that ignores the file entirely, exits 0, and prints nothing about the flag on
  either stream. This is the same silent-no-op family as the record commit `4bf509e` just closed from the
  other side: the user named an input, the input was not used, and nothing said so. The file's own rule is
  stated in `map_forget` — an absent mutation is a reported failure, never a silent no-op.
  **Why it was not folded into that commit, and the reasoning holds:** `FUSION_PLANE_ISSUES_FIXTURE` is the
  env twin of this flag and is picked up unconditionally, so a blanket refusal would break every push
  issued from a shell that exports the seam for other purposes. The refusal that was right for
  `--rebuild-map` under `--plan` is not obviously right here, which makes this a separate decision rather
  than a widening of that one.
- **Human gate:** whether an unused `--fixture` should be a usage error, a warning on stderr, or left alone
  as a harmless no-op on a documented test seam. **The env twin is the complication:** whatever is decided
  has to say what happens when the fixture arrives from the environment rather than the command line, since
  that is the spelling a user does not see in their own command.
- **Acceptance:** a `--fixture` that will not be read produces whatever the decision says it produces, and
  the same rule is stated for the env twin; the file no longer contradicts its own stated rule about silent
  no-ops; `npm test` green from `hooks/`.
- **Verified open:** at `5ef92eb` every `--fixture` reference in `bin/fusion-plane` sits on the rebuild
  path — the header synopsis at `:16` and `usage()` at `:2374` both read
  `push [--circle <dir>|--all] [--plan] [--rebuild-map [--fixture <json>]]`. Nothing consumes it otherwise
  and nothing reports its being ignored.

### 41. Decide whether a Plane issue body should carry a key-format marker

- **ID:** `I:260810-1158-third-derivation`
- **Source:** `fusion-workbench/shared/issues/260810-1158_o_a-third-derivation-site-reads-the-key-back-out-of-a-plane-issue-body-which-carries-no-format.md`
- **Executor:** `coder` — **Human gate: the fix changes the wire format**
- **Files:** `bin/fusion-plane` — `JQ_REBUILD_MAP`, where it applies `stable_key` to a key extracted from a
  Plane issue body (`:1538`)
- **Depends on:** task 40 — same file, and the decision one layer out: both ask what a Plane-side input is
  allowed to mean.
- **Priority:** low
- **Status:** [ ] open
- **Detail:** Commit `205ae06` closed the divergence between the file side and the map side by stamping
  `key_format: 2` on every entry at `map_put` and having the map side derive only for entries that predate
  the stamp. That works because the map is a file fusion owns and can stamp. `JQ_REBUILD_MAP` has a **third**
  derivation site the fix does not reach: a rebuild reconstructs the map from the board, reading each key
  back out of the Plane issue **body** — and a body carries no format field. So a pathological name whose
  issue was POSTed after the key went marker-free is stripped again on rebuild, producing the same
  divergence the parent record describes, arriving through the wire instead of through the map.
  **Reachability, inherited exactly from the parent:** the trigger is a filename of the shape
  `<stamp>_<marker>_<letter>_<rest>.md`. All 348 issue and decision filenames in this workbench were scanned
  when the parent was filed and none carries a second `_<letter>_` segment; kebab-case slugs carry no
  underscores, so the convention holds and nothing enforces it. Latent today, permanent once reached, and
  reached only through a name the convention does not produce.
- **Human gate:** whether the issue body should carry a format marker at all, and if so what happens to
  issues already on a board without one. The map's answer — treat an absent field as legacy and fold once —
  is available here too, but it costs a different thing: on the map the fold is a local rewrite, while on
  the wire it means a PATCH to every issue fusion has ever created, or an indefinite legacy path.
  **An alternative worth weighing:** the rebuild could take the key from the map for entries the map already
  knows, and derive only for issues it has never seen. That keeps the wire format unchanged and reduces the
  exposure to genuinely new issues, though it does not remove it.
- **Acceptance:** whichever route is chosen is recorded as a decision before implementation; the rebuild
  cannot re-introduce a divergence the map side has already resolved; issues already on a real board are
  covered explicitly rather than by assumption; `npm test` green from `hooks/`.
- **Verified open:** at `5ef92eb`, `grep -c "key_format" bin/fusion-plane` → **8**, none of them on the wire
  side; `JQ_STABLE_KEY` still defines both `stable_key` and the format-aware `settled_key`, and the comment
  above it states plainly that "the rebuild uses bare `stable_key`". Unchanged since `430d73a`.

### 42. Adopt a citation form for rule files that does not go stale on the next edit

- **ID:** `I:260808-0030-line-citations`
- **Source:** `fusion-workbench/shared/issues/260808-0030_o_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md`
- **Executor:** `coder` — **Human gate: the scope of the preference needs deciding**
- **Files:** `rules/fusion-workbench-conventions.md` (a convention line);
  `hooks/lib/__tests__/reference-resolution-lint.test.ts` if option 2 is taken
- **Depends on:** task 9 — both edit `rules/fusion-workbench-conventions.md`; land the substantive
  language fix first.
- **Priority:** low
- **Status:** [ ] open
- **Detail:** A record that cites a rule file by line number is correct the day it is written and silently
  wrong afterwards: any insertion above the cited line moves it, the citation still parses, the file still
  exists, and the reader lands on something else. Measured on live records — a section that ran 185-208 now
  runs 221-245; two citations into `bin/fusion-rules` moved by 17 lines. **The sharpest instance: an open
  finding was staled by a later Turn of the same session, about two hours after it was filed.** This is not
  slow rot.
  Nothing catches it: `reference-resolution-lint.test.ts` is the gate built for this class and it resolves
  three kinds of reference — plugin-file paths, adjacent section-heading anchors, and workbench-record
  citations in the ratified wildcard form. A line number is none of the three; the gate reads the path,
  confirms the file exists, and stops. Its input surface is also bounded to the plugin's own shipped text,
  so workbench records sit outside it twice over.
  **The record class was solved and this one was not, and the solved one is the model:** a decision ratified
  a citation *form* for records that survives a marker change, then taught the lint to enforce it. Three
  directions: (1) prefer the heading anchor and say so — a `## Section` reference is stable under every edit
  that does not rename the heading, and the existing lint already resolves that form, so it composes with the
  gate that exists; (2) extend the lint to fail when a cited line number exceeds the file's length, which
  catches the crude half and nothing subtler; (3) accept and repair on reconciliation, which costs nothing up
  front and guarantees that citations in records nobody re-reads stay wrong. **Option 1 is the only one that
  removes the failure rather than sampling it.** Nothing is broken at runtime; the cost is a reader sent to
  the wrong line.
- **Human gate:** option 1 needs a scope decision — does the preference bind fusion's own shipped text only,
  or also the records agents write? The second is much the larger surface.
- **Acceptance:** a stated preference exists for the stable citation form; whichever scope is chosen, the
  gate that already resolves heading anchors is reused rather than a second mechanism built; historical
  records are explicitly out of scope for repair (they are evidence that the failure is systemic, not
  individual defects).
- **Verified open, and the defect produced four more instances in nine commits:**
  `grep -ci "line number\|lineNumber" hooks/lib/__tests__/reference-resolution-lint.test.ts` → **0**, so the
  gate still reads no line numbers. Citations that drifted between `430d73a` and `5ef92eb`, all recorded in
  this queue rather than only argued: the tracker noise comment `:94`→`:101` (task 12), the README-hooks row
  `:173`→`:174` (task 14), the two Cleanup sentences `:468`/`:652`→`:486`/`:670` (task 20), and the skill
  citation `:242`→`:243` (task 5). The rate is now roughly one new stale citation per two commits touching a
  cited file.

### 43. Find out why the review file was never written, before editing anything

- **ID:** `I:260808-0030-missing-review`
- **Source:** `fusion-workbench/shared/issues/260808-0030_o_the-coderev-pass-filed-four-issues-and-left-no-review-file.md`
- **Executor:** `coder` — **Human gate: the record's own first step is a question, not an edit**
- **Files:** none yet. `agents/coderev.md` only if the diagnosis says so;
  `fusion-workbench/shared/reviews/` if a reconstruction is chosen
- **Depends on:** none
- **Priority:** low
- **Status:** [ ] open
- **Detail:** Four issues carry `**Filed by:** coderev, review of b246996..HEAD` and no corresponding review
  document was ever written — confirmed against git rather than the directory listing, so this is a file that
  was never created rather than one lost to a staging fault. It matters because `agents/coderev.md` makes the
  review file the pass's only durable record and says so as the reason no history entry is kept. With
  neither, the pass left no record of its own scope: what range it read, which files it covered, what it
  looked at and found clean, and how many findings it judged the tree to hold. The four issues are the
  findings; nothing states they are *all* the findings. The practical loss lands at the next review, which
  cannot tell what its predecessor already cleared and so either re-reads everything or assumes coverage it
  cannot verify. The four findings themselves are intact, well-evidenced and correctly routed — this is a
  missing record, not a missing review.
  **The evidence has strengthened further toward "instance, not pattern".** Five later coderev passes have
  each written their review file, one more than at the last build. **But read this beside tasks 8 and 39**,
  which are the coverage and ordering halves of the same accountability gap; `260810-1205` names this record
  as such in its own cross-references. The diagnosis question below is cheaper to answer if all three are
  considered together.
- **Human gate:** the record orders its own options and the order is the point. **Option 3 first:** ask why
  the step was skipped, at the next coderev dispatch, before any prompt is edited — one instance is not a
  pattern, and nothing here establishes whether the obligation is unclear in the prompt, whether the dispatch
  omitted it, or whether the pass ran out of turn. Then either reconstruct the review file from the four
  issues (honest only if it says plainly that it was assembled after the fact and that the pass's
  clean-surface coverage is therefore not recoverable — half a record is not the record), or accept the gap
  as an instance. Editing `agents/coderev.md` on a single instance would be a fix applied ahead of a
  diagnosis.
- **Acceptance:** the diagnosis question is asked and answered before any file is written; if a
  reconstruction is written it is labelled as one; if the gap is accepted, that is recorded so it is not
  re-derived at the next reconciliation.
- **Verified open:** `ls fusion-workbench/shared/reviews/ | grep -i coderev` at `5ef92eb` returns eight
  files — `260731-2247`, `260806-1154`, `260809-2050`, `260810-0512`, `260810-0752`, `260810-0939`,
  `260810-1032`, `260810-1632` — and none covers the `b246996..HEAD` range, which would carry a `260807-21xx`
  stamp. The gap is unchanged.

### 44. Give the writing profile a handle for the reference that points at it

- **ID:** `I:260807-2154-profile-handle`
- **Source:** `fusion-workbench/shared/issues/260807-2154_o_the-writing-profile-carries-no-handle-for-the-reference-that-now-points-at-it.md`
- **Executor:** `ontocoder` — **Human gate: item 1 is a schema change to a file every consuming project holds**
- **Files:** `stilwerk/default-voice-en.yaml`, `stilwerk/default-voice-de.yaml` (the plugin copies — the two
  files under `fusion-workbench/stilwerk/` are this project's own copies and are not the fix)
- **Depends on:** none
- **Priority:** low
- **Status:** [ ] open
- **Detail:** With the filename removed from the chat profiles, "the long-form writing profile" / "das
  Langform-Schreibprofil" is the only handle each chat profile offers for its sibling — and neither writing
  profile contains that phrase or declares a `scope:` key, while both chat profiles declare
  `scope: short-form`. The reference resolves only through `rules/agent-setup.md`; the target file gives the
  reader nothing to match on.
  Failure scenario, in this repository's own configuration (chat German, artifacts English): an agent is
  handed `chat-voice-de.yaml` and `default-voice-en.yaml`, reads that long-form prose is governed by "das
  Langform-Schreibprofil", opens the other emitted file and finds a document calling itself "Consulting &
  Strategy - Professional Voice" that declares no scope. Nothing in that file confirms it is the thing the
  pointer meant. Before the change there were two handles, the filename and a German word-stem match; both
  are now gone. That is the correct trade — the filename had to go — but it makes the target file's silence
  load-bearing where it was not before.
  Two items: **item 1**, add `scope: long-form` to both writing profiles, mirroring the chat profiles;
  **item 2**, add one header comment line to each naming its role, so a plain text match succeeds. Both are
  language-neutral, so neither re-introduces the coupling that was removed. **Item 2 alone already closes the
  dangling-reference half and carries no schema risk.** Severity is low and the record says so plainly: the
  reference does resolve today, through a rule every agent reads at Setup before it reads either profile.
  This is a robustness gap, not a live fault.
- **Human gate:** item 1 adds a key to a profile schema that every consuming project holds a copy of, and the
  record states it must not be made without the user's approval. Item 2 does not need that approval and can
  be landed alone if the user prefers.
- **Acceptance:** an agent holding only the two emitted profile paths can confirm from the writing profile's
  own text that it is the long-form profile; if item 1 is taken, both writing profiles declare it and the chat
  profiles' `scope: short-form` is unchanged; if only item 2 is taken, that is recorded as the deliberate
  scope.
- **Verified open:** `grep -c '^scope:'` at `5ef92eb` → **0** for both `stilwerk/default-voice-en.yaml` and
  `stilwerk/default-voice-de.yaml`, and **1** for both chat profiles. The asymmetry is unchanged.

### 45. Make the churn stand-down ask the directory its own reason names

- **ID:** `I:260810-1632-churn-standdown`
- **Source:** `fusion-workbench/shared/issues/260810-1632_o_the-churn-stand-down-still-asks-cwd-and-the-comment-justifying-that-was-falsified-by-the-same-commit.md`
- **Executor:** `coder` — **Human gate: the record offers two answers and picks neither**
- **Files:** `hooks/tracker.ts` — the stand-down gate and its justifying comment (`:766-781`), the churn key
  call (`:680`); `hooks/dist/tracker.js` (rebuild). No consuming project is affected.
- **Depends on:** none. Tasks 12 and 13 edit the same two files and are queued ahead of it.
- **Priority:** low
- **Status:** [ ] open
- **Detail:** `hooks/tracker.ts` states, as the reason the churn stand-down asks a different directory than
  the protected-path measurement does: *"Churn is keyed on paths relativized against `process.cwd()`, so cwd
  is the directory it must ask about."* **Commit `25c5454` made that false in the same file.** Churn is now
  keyed against the workbench root — `churnKey(rawFilePath, process.cwd(), findWorkbenchRoot())` at `:680`,
  with `KEY_ANCHOR = "workbench-root"` in `hooks/lib/churn.ts` — so the one fact the two-gate split rests on
  no longer holds.
  **The behavioural half, measured in the record:** `isFusionPluginCwd()` and its shell twin check
  `./.claude-plugin/plugin.json` at cwd with no upward walk, so in this repository a session started at the
  repo root records no churn at all, while a session started in `fusion-workbench/` — which `CLAUDE.md` calls
  "the ordinary case here" — records churn **and** triggers the on-disk migration that rewrites
  `.guard-state/churn.json` (592 entries in, 415 out, measured against the live file). That is the same shape
  as the defect `25c5454` closed: what gets counted depends on which directory the session started in. The
  protected-path measurement does not have it, because `measurementRoot()` asks `isFusionPluginRoot(root)`
  about the root it walked up to.
  **Scope is narrow and stated:** `hooks/tracker.ts` only. `isFusionPluginCwd()` is false in every project
  that is not this one, so the gate never fires elsewhere. The cost is confined to the plugin's own
  repository and to the correctness of the comment, which `CLAUDE.md`'s "both halves stand down here"
  doctrine leans on when a reader asks why there are three gates and not two.
- **Human gate:** the record names two answers and chooses neither, and they are not equivalent. (1) **Change
  the gate to ask the root** — `isFusionPluginRoot(findWorkbenchRoot())`, the same question `measurementRoot()`
  already answers — which makes churn stand down uniformly here and removes the cwd dependence. (2) **Keep
  `isFusionPluginCwd()` and rewrite the comment** to state the reason that actually holds. The record is firm
  on one point only: *do not leave the comment as written*, because it argues from a premise the file below it
  contradicts. Since the comment's content depends on which answer is taken, there is no ungated half to start
  on.
- **Acceptance:** the stand-down gate and the comment beside it agree with what the churn key is anchored to;
  whichever answer is taken, the three-gate structure is explicable from the code rather than from a
  falsified premise; if the gate changes, `CLAUDE.md`'s account of the stand-downs moves with it; `npm test`
  green from `hooks/`.
- **Verified open:** at `5ef92eb`, `hooks/tracker.ts:778` still reads `if (isFusionPluginCwd()) {` under the
  comment the record quotes, and `hooks/tracker.ts:680` still passes `findWorkbenchRoot()` as the churn key's
  anchor. Both are exactly as filed, three hours ago.

---

## Close without work

These two are not execution tasks. Each was re-checked against the working tree at `5ef92eb` and needs no
code change. They still carry the open marker in `fusion-workbench/shared/issues/`; closing that marker is
the `reconciler`'s call, not this queue's.

### C1. The lint gate's four scope questions were all answered — `260717-0031`

- **Source:** `fusion-workbench/shared/issues/260717-0031_o_p8-lint-gate-scope-open-questions-from-conversions.md`
- **Reason:** **already resolved.** The record collected four scope decisions the path-lint gate would need.
  The gate exists as `hooks/lib/__tests__/path-literal-lint.test.ts`, and all four are settled in it, each
  with the reasoning written beside it:
  - **Item 1 (frontmatter).** Settled the opposite way from the record's fear: the gate reads the whole file,
    frontmatter included, under a test named "reads the whole file, frontmatter included" with the decision
    recorded in a comment beside it. The record's second half — that playmaker's `description` was factually
    stale and described the pre-container model — is also fixed.
  - **Item 2 (`skills/setup/SKILL.md`'s `circles/` glob).** Settled by excluding the structural container
    roots `circles/`, `shared/`, `archive/` and `stashes/` from the type-folder list, with the reason stated
    in the file: they are the layout's roots, legitimately named in prose, in Circle globs, and as the
    resolver's own values. An artifact-type segment nested inside a circle path is still caught.
  - **Item 3 (path shape, not the bare noun).** Settled: the gate matches the `<type>/` path form.
  - **Item 4 (union with hosted skills).** Dissolved and replaced. Under-emission and over-emission both
    became impossible once `bin/fusion-paths` derived each key set by grepping the one prompt that names it.
    What replaced it is a genuinely different and still-live check, tested in the same file: every
    `$OUT_*`/`$SCAN_*` key `skills/setup/SKILL.md` names must be one `agents/orchestrator.md` names, because
    setup calls `fusion-paths orchestrator`.
- **Re-verified at `5ef92eb`:** `hooks/lib/__tests__/path-literal-lint.test.ts` exists and the frontmatter
  test is at `:186`. Same verdict the two previous queues reached, re-checked rather than carried.
- **Not carried forward:** nothing. The five prompt-gap rows the record's item 4 pointed at were filed under
  their own record, which closed on 260810 as `260717-0107_c_`.

### C2. The two-layout window closed with the migration — `260717-0115`

- **Source:** `fusion-workbench/shared/issues/260717-0115_o_live-workbench-split-across-two-layouts-during-conversion.md`
- **Reason:** **no longer reproducible.** The record describes a window during the v4 conversion in which this
  repository's own workbench held artifacts in both the pre-v4 root type folders and the new `shared/` store at
  once, because the agent prompts were converted before the workbench was migrated. The record itself says the
  consequence is bounded and that the migration step would merge rather than lose anything. It did. The
  general lesson it draws for other projects — any project upgrading fusion mid-session hits the same window,
  and `/fusion:setup`'s migration check is what closes it — is already implemented: setup detects a pre-v4
  workbench and refuses, routing the user to `/fusion:migrate`.
- **Re-verified at `5ef92eb`:** `ls -d fusion-workbench/*/` returns exactly `archive/`, `circles/`, `shared/`
  and `stilwerk/`. **Not one pre-v4 type folder remains.**

---

## Changelog

- **2026-08-10 17:23** — Queue rebuilt from scratch at `5ef92eb`, replacing the 260810-1434 queue entirely.
  That queue inventoried 45 records at `430d73a`; **40 are still open, 5 have since closed** (all five verified
  to carry `_c_` on disk — no renames, no losses), and **7 currently-open records were unknown to it**. 47
  records inventoried, 45 queued, 2 closed without work.
  **The five that closed, and what closed them** (nine commits landed in the range `430d73a..5ef92eb`):
  | Record | Was | Closed by |
  |---|---|---|
  | `260809-2243` the stray `</content>` tag in `docs/philosophy.md` and `README.md` | task 1, high | `e0acdb6` |
  | `260810-0352` Setup Step 5 calling a helper the installed copy may not have | task 2, high | `26ea3c3` |
  | `260809-2023` the churn map keyed by the session's cwd and never pruned | task 4, high | `25c5454`, with the new `bin/fusion-churn-rank` read path |
  | `260801-1020` `/fusion:archive` promising unconditionally that git holds the bytes | task 22, normal | `4f16c60` |
  | `260810-0507` the Plane setup doc's marker-bearing key shape | task 27, normal | `7c4dfb2` |
  Two decisions moved `_a_` → `_i_` alongside them: `260810-0920` (the churn key anchor) and `260810-0921`
  (how a prompt calls a `bin/` helper the install may lack). Neither was ever queued as a task.
  **The seven new records** are tasks 1, 3, 13, 24, 25, 39 and 45. Five came out of the `coderev` pass over
  `430d73a..HEAD` (`shared/reviews/260810-1632-coderev-turn-1-range-430d73a-to-head.md`); two were filed by
  the session that produced that range, one of them about the session's own commit procedure and one about its
  release ordering. Three of the seven are direct residuals of the churn work that closed task 4 — the ranking
  has no noise filter, Setup does not document the new helper's exit 3, and the stand-down comment was
  falsified by the same commit that fixed the key.
  **Ordering changed this run, by the session's instruction.** The queue is ungated-first: tasks 1-25 need no
  user decision, tasks 26-45 do. One edge from the previous graph was reversed to honour it — task 26 (seed a
  permission source) no longer precedes task 5 (the citation root); that was a `skills/setup/SKILL.md`
  collision dressed as an ordering, not a content prerequisite. Every genuine content dependency was preserved
  and none required breaking the preference: task 8 behind task 2, task 16 behind tasks 4/5/15, task 29 behind
  task 10, task 39 behind task 8, task 13 behind task 12, task 41 behind task 40, task 42 behind task 9,
  task 33 behind task 32, task 38 behind task 26.
  **One dependency was discharged rather than carried:** task 12 (the tracker noise comment) sat behind the
  churn-key task in the previous queue; that task closed in `25c5454` and `hooks/dist/` is already rebuilt, so
  task 12 is now free-standing.
  **Three verification results moved materially since `430d73a`:**
  - Task 2's drift check has now **fired twice** (`grep -c state_drift` on the event log returns 2, against 0
    this morning), and the second entry is a live reproduction of the record: the state file said 0 commits
    while git counted 7. The detection half is proven; the prevention half is still the task.
  - Task 17's test-count variance failed to reproduce for a **second** set of three runs (123/123/123 at both
    build points), so six consecutive runs now contradict the record's own 96/93 measurement.
  - Task 42's defect produced **four new instances in nine commits** — four line-number citations in this
    queue's own predecessor drifted — which is now recorded in the task rather than only argued.
  14 dependency edges recorded: 8 from file collisions turned into sequencing, 6 carrying genuine content
  dependencies (the labelled edges in the graph). 24 tasks carry no edge at all and are parallelisable.
  20 tasks flagged as needing a human decision before dispatch, three of them partially. 1 task routed to
  `ontocoder`; 1 (task 23) routed to `coder` against the letter of the file-ownership split, with a note.
  **Suite baseline measured, not assumed:** 40 files, 1072 tests, green, 90.49s — up one file and 32 tests
  from the 14:34 measurement, which is the churn-key-anchor suite and the new monitor warnings-panel cases.

