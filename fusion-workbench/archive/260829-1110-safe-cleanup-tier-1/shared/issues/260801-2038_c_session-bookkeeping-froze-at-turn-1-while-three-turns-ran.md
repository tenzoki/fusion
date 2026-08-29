Session bookkeeping froze at Turn 1 while three Turns and sixteen commits ran, and nothing detected it

---

Three of the four session-state surfaces stopped being updated after the first Turn of the 260801 session, while the session went on to run three Turns, sixteen commits and two code reviews. Each surface is individually recoverable; together they mean an interrupted-session resume would have restarted from a point four hours and twelve commits behind reality.

Verified at 260801-2038, at HEAD `9ab5a2a`:

| Surface | Says | Reality |
|---|---|---|
| `fusion-workbench/agentstate.yaml` | `# Updated: 260801-1535_coder_backslash-continuation-splice.md`, `progress.turn: 1`, `tasks_done: 4`, `commits: 4`, `current_task: S3 running`, five tasks still `queued` | 16 commits, all eight plan steps done, S3 committed at `50d7f00` |
| `260801-1244-guard-bash-inspection` | `**Status:** anticipated`, `**Active session history:** (none yet)`, `## Turn log` empty | Circle has been `_t_` since 12:47; fifteen history files in its own `history/` |
| `260801-0936-orchestrator-session.md` | `**Directive:** (not yet set — awaiting the user's task)`, `**Status:** Setup complete, awaiting scope`, `## Per-Turn Log` → `(no Turns yet)` | Directive was set, three Turns ran; the file's own body documents twelve design decisions and a full spec discussion |
| `fusion-workbench/orchestrator-events.jsonl` | current — 74 kB, last write 20:29 | the one surface that kept up |

The event log staying current while the other three froze is the diagnostic: event emission is a per-action call that cannot be forgotten without the action failing, whereas the other three are end-of-Turn writes that a session can skip without anything breaking.

---

## Why it matters

**Resume is the feature this breaks.** `agentstate.yaml` exists so a killed session can be picked up. Resuming from this one would have re-dispatched S3 (already committed), then S4 through S8 (all committed), with no cheap way for the resuming orchestrator to notice — the file is the authority precisely because the session that wrote it is gone.

**The Circle record is the durable artifact.** `_t_circle.md`'s `## Turn log` is where a Circle's history lives after its session state is deleted. An empty Turn log on a Circle about to close means the Circle's own record will never say what happened in it. The Circle record's own template names the format (`- Turn N (session YYMMDD-HHMM): commits <hash>..<hash>; Coherence verdict …`), so this is not an unspecified field.

**The session history's `**Directive:**` line is a reconciler input.** The reconciler's Step 2.5 names it as the canonical source for the Artifact↔Directive and Grounding↔Directive edges when `agentstate.yaml` is absent. Here `agentstate.yaml` was present and carried a Directive, so the reconciliation survived; had the orchestrator deleted it on exit as it does on a clean exit, the fallback would have read `(not yet set)`.

## What is not the cause

Not a crash: the session ran to completion and dispatched this reconciliation. Not a write failure: the files are writable and `orchestrator-events.jsonl` was appended to at 20:29. The Turn-2 and Turn-3 work simply did not carry the bookkeeping writes that Turn 1 did.

## Candidate resolutions

1. **Make the Turn-boundary write unskippable.** Whatever the orchestrator does at the end of a Turn, the `agentstate.yaml` + Circle Turn-log write should be part of the same step as the commit, not a separate obligation after it. An obligation that rides an obligation already held is the pattern `rules/fusion-workbench-conventions.md` uses for path resolution at Setup step 2, and it works for the same reason.
2. **Detect it rather than only prescribe it.** A cheap check exists: compare `agentstate.yaml`'s `progress.commits` against `git rev-list --count <git_head_at_start>..HEAD`. A divergence of more than one is a stale-state signal, computable by `/fusion:setup`'s interrupted-session check, by the monitor, and by the reconciler. Today nothing computes it, which is why a four-hour drift went unremarked.
3. **Let the reconciler repair it.** Rejected as filed rather than proposed: the reconciler's scope deliberately excludes `agentstate.yaml` and Circle records, and widening it would put two writers on the session-state surfaces. The reconciler should *report* the drift — as it did here — not paper over it.

Option 2 is the one that generalises; option 1 is the one that prevents.

## Provenance

Found by the reconciler during the closing pass of `260801-1244-guard-bash-inspection`, 260801-2038. Filed to the shared store rather than into that Circle per the Origin Rule: the drift is a property of how the orchestrator runs a session, not of the guard work that session happened to be doing.

---

**Reconciliation 260803-1516 (reconciler, domain `code`) — stays `_o_`. Second instance, one Circle later, and this time the divergence check this issue proposes was actually computed.**

Session `260803-1038-orchestrator-session.md`, one Turn, seven commits `c9bf59e..fa81589`. Three of the four surfaces froze again, in the same pattern:

| Surface | Says | Reality |
|---|---|---|
| `fusion-workbench/agentstate.yaml` | `# Updated: 260803-1038-orchestrator-session.md`, `progress.turn: 0`, `commits: 0`, all eight tasks `queued`, `current_task: queue-confirmation` (a gate) | eight tasks resolved, seven commits, ten issues closed, one review filed |
| `260801-1244-guard-rules-write` | `**Status:** anticipated`, `**Active spec/plan:** 260801-1122_*_spec-normative-consolidation.md`, `**Active session history:** (none yet)`, `## Turn log` empty | active since 260802, its own plan at `260802-1856_*_plan-guard-rules-write.md`, fifteen files in its own `history/`, three Turns run |
| the session history file above | `## Per-Turn Log` → "(No Turn started yet in this session.)" | written once at `3b0f9e7` (36 lines, the first commit of the Turn) and never touched again |
| `fusion-workbench/orchestrator-events.jsonl` | current | the one surface that kept up, again |

**Candidate resolution 2, computed.** This issue proposes comparing `agentstate.yaml`'s `progress.commits` against `git rev-list --count <git_head_at_start>..HEAD`. Run here: the file says `0`, `git rev-list --count c9bf59e..HEAD` says `7`. Divergence 7, against a stated threshold of "more than one". The check works, costs one command, and nothing in the toolchain runs it. That is now demonstrated on two sessions rather than argued from one.

**The Circle-record half is the expensive one.** `## Turn log` is where a Circle's history lives after its session state is deleted, and this Circle is one gate away from closure with three Turns and twenty-three commits behind it and an empty log. `260801-1020_*_plane-mirror-circle-closed-with-empty-turn-log.md` records what that costs a Circle that has already closed.

**Not repaired here, for the reason this issue's own candidate 3 gives.** The reconciler's scope excludes `agentstate.yaml` and Circle records, and widening it would put two writers on the session-state surfaces. Reported, not papered over.

---

**Reconciliation 260807-1515 (reconciler, domain `code`) — stays `_o_`. Third instance, and the first one where the session shipped a release past the frozen bookkeeping.**

Session `260806-2158-orchestrator-session.md`, active Circle `260807-0923-guard-misst-statt-orakelt`, HEAD at start `bf48802`, HEAD now `e684eae`. The same three surfaces froze, in the same pattern:

| Surface | Says | Reality |
|---|---|---|
| `fusion-workbench/agentstate.yaml` | `# Updated: 260807-0945`, `progress.turn: 1`, `tasks_done: 0`, `commits: 0`, `current_task: S1 running`, nine of eleven tasks `queued` | eleven plan steps `[DONE]`, eight commits, v6.0.0 released and tagged |
| `260807-0923-guard-misst-statt-orakelt` | `**Active spec/plan:** (noch keiner)`, `## Turn log` empty, `## Closure note` empty, `**Status:** active` | the plan has existed since 260807-0931 and is complete; the Circle's own `history/` holds eleven files |
| `260806-2158-orchestrator-session.md` | `**Directive:**` is the *superseded* Circle's; `**Status:** Stopped by the user mid-Turn-1 … its record still carries the active marker and `.active-circle` still points at it` | the superseded Circle carries `_s_` since 260807-0923-guard-misst-statt-orakelt, `.active-circle` points at the successor, and the session went on to ship a major release |
| `fusion-workbench/orchestrator-events.jsonl` | current | the one surface that kept up, for the third time |

**Candidate resolution 2, computed for the third time.** `agentstate.yaml` says `commits: 0`; `git rev-list --count bf48802..HEAD` says `8`. Divergence 8, against the stated threshold of "more than one". The check now has three data points across three Circles and is still run by nothing in the toolchain.

**One new observation this instance adds.** `agentstate.yaml`'s `session.history_file` names `260807-0945-orchestrator-session.md`. That file does not exist — the Circle's `history/` holds eleven sub-agent logs and no orchestrator session log, and the session's actual log stayed at `260806-2158-orchestrator-session.md` under the superseded Circle. So the resume anchor points at nothing, which is a stronger failure than a stale value: a resuming orchestrator would find neither the Turn state nor the log it names.

**Why that happened here and would happen again.** The session began under one Circle and continued under its successor. Nothing in the process moves the session's history file, or forks a second one, when a Circle is superseded mid-session — so the anchor was written for a file the session never created. That is a gap in the supersession path specifically, not only in the end-of-Turn write, and it is worth naming separately when candidate 1 is taken up.

**Not repaired here**, same reason as the two instances above.

---

**Reconciliation 260809-1651-reconciliation.md (reconciler, domain `code`) — stays `_o_`. Fourth instance, and the first in which the `**Directive:**` fallback this record warns about was actually exercised.**

Session `260808-0920-orchestrator-session.md`, HEAD at start `451a07e`, HEAD now `fb262d8`. Three of the four surfaces froze again, in the same pattern. There is no active Circle this time, so the Circle-record row of the earlier instances is replaced by the plan:

| Surface | Says | Reality |
|---|---|---|
| `fusion-workbench/agentstate.yaml` | `# Updated: 260809-1056`, `progress.turn: 1`, `tasks_done: 1`, `commits: 0`, `current_task: A-1/A-2 running` (`agent: analyst`), `plan_context.plan_file: null` | two analyses delivered, a seven-step plan written and approved, six commits, six defects closed, two decision records filed |
| `260808-0920-orchestrator-session.md` | `**Directive:** (not yet stated — user ran /fusion:setup without a task)`, `**Status:** In progress`, `## Session log` ends at 09:20 with "Awaiting the user's Directive" | the Directive was stated and is in `agentstate.yaml`; eight hours and six commits of work followed |
| `260809-1229_*_plan-five-severe-guard-defects.md` | current — steps marked `[DONE]` as they landed, status and closure summary written | the one artifact surface that kept up |
| `fusion-workbench/orchestrator-events.jsonl` | current | the one session surface that kept up, for the fourth time |

**Candidate resolution 2, computed for the fourth time.** `agentstate.yaml` says `commits: 0`; `git rev-list --count 451a07e..HEAD` says `6`. Divergence 6, against the stated threshold of "more than one". Four data points across four sessions, and nothing in the toolchain runs the check.

**What this instance adds.** In the three earlier instances `agentstate.yaml` carried the Directive and the reconciliation survived on it. Here the history file's `**Directive:**` line reads "(not yet stated)" while `agentstate.yaml` carries the real one, so the two surfaces now contradict each other on the field the reconciler's Step 2.5 names as canonical. `agentstate.yaml` was still present, so this reconciliation again survived — but the orchestrator deletes that file on a clean exit, and after this session's clean exit the only surviving statement of the Directive would be "(not yet stated)". The failure this record calls a fallback risk is one clean exit away from being a data loss.

**One surface improved.** `session.history_file` names `260808-0920-orchestrator-session.md`, which exists. The dangling resume anchor recorded in the third instance did not recur; that instance's cause was a mid-session Circle supersession, which did not happen here.

**Not repaired here**, same reason as the three instances above: this record's own candidate 3.

---

**Partially addressed 260810-0410_*_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md (coder, task T6) — stays `_o_`. Candidate 2 built, on the orchestrator side only. Candidate 1 not built.**

`agents/orchestrator.md` now carries a **Drift check** (under `## Persistent State File`) and calls it at four points. It reads the two records this issue identifies as un-freezable — `orchestrator-events.jsonl` and git — and prints each bookkeeping surface beside the record that can contradict it: `progress.commits` against `git rev-list --count <git_head_at_start>..HEAD`, `progress.turn` against the count of `turn_start` events since the last `session_start`, `session.history_file` against the disk, the history file's `**Directive:**` line against the state file's, and the Circle record's `## Turn log` entry count against the Turns run. Each row has its own drift condition, so a value that legitimately differs is not reported as a fault. On drift the orchestrator emits a new `state_drift` event **before** `agentstate.yaml` is deleted at Cleanup, tells the user in one line naming what diverged and from what, then performs the writes Write Points already required.

**The call points ride event emissions rather than standing beside them.** `turn_start` (Phase 2), `turn_end` (Step 3e), `session_end` (Cleanup), plus the resume path at Setup Step 1. That is this record's own diagnostic turned into the mechanism: a separate end-of-Turn obligation is the shape that was skipped four times, so the check was attached to the one call that empirically never was. `session_end` matters on its own — two of the four instances were single-Turn sessions, which reach no second `turn_start` and, on convergence, no `turn_end` either.

**A fifth instance, measured live while this was being written.** Session `260810-0241-orchestrator-session.md`, HEAD at start `8960e1a`. `agentstate.yaml` read `# Updated: 260810-0243`, `progress.turn: 0`, `commits: 0` while `git rev-list --count 8960e1a..HEAD` returned 12 and the event log carried one `turn_start` and three `commit` events. Divergence 12, against the stated threshold of "more than one". The snippet was run against this workbench and printed exactly those rows, so the check is demonstrated on live drift rather than only argued.

**What it honestly is: a convention.** Nothing executes it. It is prompt text, and prompt text is overridable under task pressure — the section says so in its own closing paragraph, and `hooks/lib/__tests__/state-drift-detection-lint.test.ts` pins that admission along with the surfaces, the drift conditions, the `state_drift` event row, and the attachment to all four emissions. That gate keeps the contract in the prompt; it cannot make a session run it. An enforcement would have to sit where something runs unasked — a PostToolUse hook, or a `bin/` helper that `/fusion:setup`, the monitor and the reconciler all call — and none of that was in this task's scope.

**What remains open, and why the marker stays `_o_`:**

- **Candidate 1 (prevention) is not built.** The Turn-boundary write still stands as its own obligation; it does not ride the commit.
- **`/fusion:setup` does not compute the divergence.** The orchestrator's inlined Setup Step 1 does, but `skills/setup/SKILL.md` carries the same steps for the user-triggered path and was out of scope. Until it is mirrored there, the resume-time detection exists only on the self-initiated path.
- **The monitor does not compute it either.** `bin/monitor` is on the guard's protected-path list and a monitor change carries its own release consequence.
- The mid-session Circle supersession case is now **named** in the Drift check (the `session.history_file` row is what catches it, and the section states that a session keeps one history file for its whole life), but nothing prevents the anchor being re-pointed.

---

## Reconciliation — `260810-0819`, session `260810-0241-orchestrator-session.md` Phase 3

The note above is accurate on every claim I checked. Two things it does not carry, both measured at
HEAD `dd50efd`.

**1. The defect recurred during the session that partially fixed it, at four surfaces, not one.**

| Surface | Frozen at | Ground truth |
|---|---|---|
| `agentstate.yaml` | `turn: 1`, `tasks_done: 9`, `commits: 12`, `# Updated: 260810-0415` | 3 Turns, 22 commits |
| `orchestrator-live.md` | Turn 2, `17/32`, `Commits: 21`, coderev shown `[RUNNING]` | Turn 3 ran and closed |
| `260810-0241-orchestrator-session.md` | `## Per-Turn Log` reads `(Turn 1 starting)`; `**Status:** In progress` | 3 Turns completed; **file is untracked in git** |
| `tasklist.md` | 3 of 31 tasks marked `[x] done` | 11 tasks resolved; **never committed — git's copy is the 260809 queue from `c353196`** |

`grep -c state_drift fusion-workbench/orchestrator-events.jsonl` → **0**. The check never fired.

**2. The reason it never fired is a mechanism this record does not name.** The note explains
non-firing as prompt text being overridable under task pressure. That is not what happened. `9bad4d6`
landed at 04:15; the `turn_end`/`turn_start` call points at `agents/orchestrator.md:335` and `:468`
were both reached at 06:55, 2h40m later, and neither fired. **An agent prompt is loaded at session
start, so a fix written into `agents/orchestrator.md` cannot reach the session that writes it.** A
prompt-only fix has zero effect on its own session, by construction. That is a distinct failure mode
from task pressure, it is not overridable, and it is what produced this instance.

**3. Three defects are already filed against what `9bad4d6` shipped**, none cross-referenced from
here: `260810-0710_*_` (the check's last line makes the whole block exit non-zero when no Circle is
active — and `.active-circle` is absent right now, so that is this workbench's ordinary state),
`260810-0509_*_the-cleanup-drift-call-point-claims-a-single-turn-session-reaches-no-other-which-phase-2-contradicts.md` (the prompt text `9bad4d6` wrote contradicts Phase 2), and `260810-0502_*_the-state-drift-lint-anchors-on-the-phrase-it-checks-and-one-negative-control-is-a-duplicate.md` (the
lint that guards it is defeatable at all four call points — see the reconciliation note on that
record).

The `_o_` marker is right and the note's own honesty is not in question. The gap is one notch wider
than admitted: the detection exists, is unreachable in-session by construction, exits non-zero on the
common path, and has now failed once against live drift.

---

**Resolved 260811-1005 (coder, task `I:260801-2038-frozen-state`) — `_o_` → `_c_`. The measurement
left the prompt and became a program. The repair write did not, and never will.**

## What was built

One computation, `hooks/lib/state-drift.ts`, with three callers and **not one of them the session
that installed it** — which is the acceptance clause this record's own reconciliation `260810-0819`
wrote after measuring why the first fix did nothing:

| Caller | When it runs | What it does |
|---|---|---|
| `hooks/tracker.ts` (PostToolUse) | every `Write`/`Edit`/`MultiEdit`/`NotebookEdit`/`Bash` call, invoked by Claude Code from `hooks/hooks.json` | names the diverging rows back to the model as `additionalContext`, emits a `state_drift` event under `.guard-state/` |
| `bin/fusion-state-drift` → `hooks/state-drift.js` | `/fusion:setup` Step 1, `agents/orchestrator.md` `### Drift check`, any human at a terminal | prints `anchor=`/`state=`/`rows=`/`drift=`/`verdict=` and one line per surface |
| `bin/monitor` | the dashboard's warnings panel | renders the emitted events as a **Stale state** row. It does *not* recompute the divergence — one measurement, surfaced |

**Candidate 1 is what the hook is.** A commit is what moves `git rev-list --count` past what
`agentstate.yaml` claims; a commit is a `Bash` tool call; the tracker fires on that very call. So the
demand for the bookkeeping write arrives attached to the act that made it necessary, with nothing to
remember. `agents/orchestrator.md` Step 3b gained step 7 saying the same thing in the place the
orchestrator reads it, and the prompt's Drift check now calls the helper instead of carrying twenty
lines of shell that a second reader was free to spell differently.

**Candidate 2 now runs on both paths.** `skills/setup/SKILL.md` Step 1 computes the divergence before
it summarises, which is the user-triggered half that was out of scope when detection landed.

**Candidate 3 stays rejected, and is now enforced by a test rather than by intent.**
`state-drift.test.ts` asserts byte-equality of `agentstate.yaml` across a tool call that reported
drift on it. Nothing but the throttle record under `.guard-state/` is ever written.

**The mid-session Circle supersession case stays named** — the paragraph in `### Drift check` is
unchanged, and `session.history_file` pointing at a file that does not exist is now one of the five
measured rows, with a case of its own.

**`agents/reconciler.md` was not touched.** It still reports drift and still does not repair it.

## The residual, stated rather than left to be found

**This makes a skipped write impossible not to notice. It cannot make the write happen.** The
session-state surfaces have exactly one writer by design, so the last step — writing `agentstate.yaml`,
the Circle's Turn-log entry, the history file's Per-Turn Log — is still the orchestrator's, and still
prompt text. What changed is that skipping it now leaves a `state_drift` event in a log that outlives
the session, and a sentence in the orchestrator's own tool result at the moment it happens.

Two smaller limits, both deliberate:

- **The monitor surfaces rather than computes.** The monitor's copy lives at `fusion-workbench/monitor`
  with no path back to `hooks/dist/`, and a second implementation of the comparison would be free to
  disagree with the first. It reads the events the one measurement emits.
- **`additionalContext` reaching the model is a prior measurement, not a fresh one.** `hooks/tracker.ts`'s
  header records it against Claude Code 2.1.224; this task asserts the hook's envelope, not the host's
  handling of it.

## Verification

`cd hooks && npm test` — 42 files, **1166 tests, exit 0** (1142 at `d8e38d5`, plus 22 integration
cases in `lib/__tests__/state-drift.test.ts` and 2 in the existing lint). The new suite spawns real
subprocesses against real git repositories and covers: the five rows and their conditions, the
difference-of-one tolerance, Turn counting scoped to the last `session_start`, undecidable rows
reported as `UNCHECKED` rather than dropped, the throttle in all three directions (repeat, growth,
repair), non-repair of the surfaces, the CLI's exit codes, and — the one that would otherwise have
been assumed — that the check does **not** stand down in fusion's own repository, where all six
measured instances happened.

---
Revised by: `agents/orchestrator.md:238` and the 2026-08-15 removal of the state-drift measurement — every
mechanism the `Resolved 260811-1005` note rests on has been deleted, and the failure recurred on 260822.

The closure note names one computation and three callers. None of the four exists at HEAD, verified by
file rather than by report: `hooks/lib/state-drift.ts`, `hooks/lib/__tests__/state-drift.test.ts` and
`hooks/dist/state-drift.js` are absent; `bin/` holds no `fusion-state-drift`; `grep -rn 'state_drift'`
over `hooks/lib`, `hooks/*.ts`, `bin`, `agents` and `skills` returns only `bin/monitor`, which renders
events already in the log and computes nothing. `hooks/tracker.ts:246` states the removal in its own
header. `agents/orchestrator.md:109` and `:238` state its two consequences in the prompt: a re-pointed
`session.history_file` and a frozen Circle Turn log are now "a thing you avoid rather than a thing you
are told about", and `:238` names this record by number while doing so.

So candidate 3 is still rejected, candidate 1 is still prompt text, and **candidate 2, the detection
this record was closed on, no longer runs on either path**. The note's own residual said the mechanism
"makes a skipped write impossible not to notice"; nothing notices any more.

**A fifth instance stands live at the moment of this reconciliation**, session
`260822-2204-orchestrator-session.md`, one
Turn, two tasks, two commits `f90de0c..b938f68`. The same four-surface split, in the same direction:

| Surface | Says | Reality |
|---|---|---|
| `fusion-workbench/agentstate.yaml` | `# Updated: 260822-2210`, `current_task: T-1 status running`, `work_queue` T-1 `running` and T-2 `queued` | both tasks carry `task_done` at 20:28:48, two commits landed |
| `fusion-workbench/orchestrator-live.md` | `Tasks: 0/2`, `Commits: 0`, T-1 `[RUNNING]`, T-2 `[QUEUED]` | 2 of 2 done, 2 commits |
| `260822-1921-measure-what-two-checkouts-share` | `## Turn log` empty | one Turn ran and ended |
| the session history file above | `**Mode:** (not yet resolved — Phase 0 pending)`, `**Status:** In progress`, `## Session log` → "(Turn entries appended as the session runs.)" | `scope_resolved` names `mode=custom` at 20:10:01; the Turn loop converged at 20:28:48 |
| `fusion-workbench/orchestrator-events.jsonl` | current through `turn_end` | the one surface that kept up, for the fifth time |

The marker stays `_c_` and the `Resolved:` note above is left unedited: it records what was true when it
was written, and the mechanism it describes really did exist. What moved is the tree underneath it. The
live defect is re-filed as
`260822-2236_*_the-four-session-bookkeeping-surfaces-froze-again-and-the-detection-that-closed-the-first-record-has-been-removed.md`,
because a `_c_` record tracks no open work.
