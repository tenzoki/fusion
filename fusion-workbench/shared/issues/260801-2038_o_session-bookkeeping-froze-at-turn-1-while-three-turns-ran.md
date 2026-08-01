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
