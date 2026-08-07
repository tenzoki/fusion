Session bookkeeping froze at Turn 1 while three Turns and sixteen commits ran, and nothing detected it

---

Three of the four session-state surfaces stopped being updated after the first Turn of the 260801 session, while the session went on to run three Turns, sixteen commits and two code reviews. Each surface is individually recoverable; together they mean an interrupted-session resume would have restarted from a point four hours and twelve commits behind reality.

Verified at 260801-2038, at HEAD `9ab5a2a`:

| Surface | Says | Reality |
|---|---|---|
| `fusion-workbench/agentstate.yaml` | `# Updated: 260801-1535`, `progress.turn: 1`, `tasks_done: 4`, `commits: 4`, `current_task: S3 running`, five tasks still `queued` | 16 commits, all eight plan steps done, S3 committed at `50d7f00` |
| `circles/260801-1244-guard-bash-inspection/_t_circle.md` | `**Status:** anticipated`, `**Active session history:** (none yet)`, `## Turn log` empty | Circle has been `_t_` since 12:47; fifteen history files in its own `history/` |
| `shared/history/260801-0936-orchestrator-session.md` | `**Directive:** (not yet set — awaiting the user's task)`, `**Status:** Setup complete, awaiting scope`, `## Per-Turn Log` → `(no Turns yet)` | Directive was set, three Turns ran; the file's own body documents twelve design decisions and a full spec discussion |
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

Found by the reconciler during the closing pass of `circles/260801-1244-guard-bash-inspection`, 260801-2038. Filed to the shared store rather than into that Circle per the Origin Rule: the drift is a property of how the orchestrator runs a session, not of the guard work that session happened to be doing.

---

**Reconciliation 260803-1516 (reconciler, domain `code`) — stays `_o_`. Second instance, one Circle later, and this time the divergence check this issue proposes was actually computed.**

Session `circles/260801-1244-guard-rules-write/history/260803-1038-orchestrator-session.md`, one Turn, seven commits `c9bf59e..fa81589`. Three of the four surfaces froze again, in the same pattern:

| Surface | Says | Reality |
|---|---|---|
| `fusion-workbench/agentstate.yaml` | `# Updated: 260803-1038`, `progress.turn: 0`, `commits: 0`, all eight tasks `queued`, `current_task: queue-confirmation` (a gate) | eight tasks resolved, seven commits, ten issues closed, one review filed |
| `circles/260801-1244-guard-rules-write/_t_circle.md` | `**Status:** anticipated`, `**Active spec/plan:** shared/planning/260801-1122_o_spec-normative-consolidation.md`, `**Active session history:** (none yet)`, `## Turn log` empty | active since 260802, its own plan at `planning/260802-1856_o_plan-guard-rules-write.md`, fifteen files in its own `history/`, three Turns run |
| the session history file above | `## Per-Turn Log` → "(No Turn started yet in this session.)" | written once at `3b0f9e7` (36 lines, the first commit of the Turn) and never touched again |
| `fusion-workbench/orchestrator-events.jsonl` | current | the one surface that kept up, again |

**Candidate resolution 2, computed.** This issue proposes comparing `agentstate.yaml`'s `progress.commits` against `git rev-list --count <git_head_at_start>..HEAD`. Run here: the file says `0`, `git rev-list --count c9bf59e..HEAD` says `7`. Divergence 7, against a stated threshold of "more than one". The check works, costs one command, and nothing in the toolchain runs it. That is now demonstrated on two sessions rather than argued from one.

**The Circle-record half is the expensive one.** `## Turn log` is where a Circle's history lives after its session state is deleted, and this Circle is one gate away from closure with three Turns and twenty-three commits behind it and an empty log. `shared/issues/260801-1020_o_plane-mirror-circle-closed-with-empty-turn-log.md` records what that costs a Circle that has already closed.

**Not repaired here, for the reason this issue's own candidate 3 gives.** The reconciler's scope excludes `agentstate.yaml` and Circle records, and widening it would put two writers on the session-state surfaces. Reported, not papered over.

---

**Reconciliation 260807-1515 (reconciler, domain `code`) — stays `_o_`. Third instance, and the first one where the session shipped a release past the frozen bookkeeping.**

Session `shared/history/260806-2158-orchestrator-session.md`, active Circle `circles/260807-0923-guard-misst-statt-orakelt`, HEAD at start `bf48802`, HEAD now `e684eae`. The same three surfaces froze, in the same pattern:

| Surface | Says | Reality |
|---|---|---|
| `fusion-workbench/agentstate.yaml` | `# Updated: 260807-0945`, `progress.turn: 1`, `tasks_done: 0`, `commits: 0`, `current_task: S1 running`, nine of eleven tasks `queued` | eleven plan steps `[DONE]`, eight commits, v6.0.0 released and tagged |
| `circles/260807-0923-guard-misst-statt-orakelt/_t_circle.md` | `**Active spec/plan:** (noch keiner)`, `## Turn log` empty, `## Closure note` empty, `**Status:** active` | the plan has existed since 260807-0931 and is complete; the Circle's own `history/` holds eleven files |
| `shared/history/260806-2158-orchestrator-session.md` | `**Directive:**` is the *superseded* Circle's; `**Status:** Stopped by the user mid-Turn-1 … its record still carries the active marker and `.active-circle` still points at it` | the superseded Circle carries `_s_` since 260807-0923, `.active-circle` points at the successor, and the session went on to ship a major release |
| `fusion-workbench/orchestrator-events.jsonl` | current | the one surface that kept up, for the third time |

**Candidate resolution 2, computed for the third time.** `agentstate.yaml` says `commits: 0`; `git rev-list --count bf48802..HEAD` says `8`. Divergence 8, against the stated threshold of "more than one". The check now has three data points across three Circles and is still run by nothing in the toolchain.

**One new observation this instance adds.** `agentstate.yaml`'s `session.history_file` names `circles/260807-0923-guard-misst-statt-orakelt/history/260807-0945-orchestrator-session.md`. That file does not exist — the Circle's `history/` holds eleven sub-agent logs and no orchestrator session log, and the session's actual log stayed at `shared/history/260806-2158-orchestrator-session.md` under the superseded Circle. So the resume anchor points at nothing, which is a stronger failure than a stale value: a resuming orchestrator would find neither the Turn state nor the log it names.

**Why that happened here and would happen again.** The session began under one Circle and continued under its successor. Nothing in the process moves the session's history file, or forks a second one, when a Circle is superseded mid-session — so the anchor was written for a file the session never created. That is a gap in the supersession path specifically, not only in the end-of-Turn write, and it is worth naming separately when candidate 1 is taken up.

**Not repaired here**, same reason as the two instances above.
