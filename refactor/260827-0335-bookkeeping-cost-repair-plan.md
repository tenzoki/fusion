# Repair plan: cutting fusion's bookkeeping cost

**Filed:** 260827-0335
**Basis:** the 260827 cost audit of this repository (measurements below were taken at `4f7332c`).
**Scope:** reduce the fixed and per-cycle overhead of running fusion without giving up the properties the records exist for: resumability, multi-checkout attribution, and an auditable history.

## The problem, in the audit's numbers

- 213 of 423 commits in the last 14 days touch only `fusion-workbench/`; over the last 200 commits, 86% of added lines are workbench records (52,746 vs 8,540 product lines).
- The last complete session spent 84 minutes between its final product commit and `session_end`. The two most recent sessions consist of Setup only.
- `/fusion:cleanup`'s floor cost is close to its ceiling cost: reconciler, curator and log-activity each run a full workbench pass on every invocation (curator reads ~25 MB including the 10 MB archive and a full `git log --follow` per surface file, unconditionally).
- Per dispatched task the orchestrator performs ~15 prompt-mandated bookkeeping acts; per Turn boundary ~12 more. The mandate is not met in practice: 87% of event-log lines share a second-resolution timestamp with a neighbour (batch-written), only 2.6% carry `person`/`checkout`, and `session_id` appears on 0 of 2,420 lines.
- ~17 of the 19 defects the active Circle inherits are defects in the records themselves (wrong counts, citation forms), not in shipped behaviour. Half of the last full session's dispatches were process-generated repairs.

The plan attacks three structural causes: (1) mechanical logging is a prompt obligation on the model instead of machine work, (2) nothing anywhere is incremental, (3) records state cardinalities in prose that gates then check.

## Goals and how success is measured

| Goal | Metric today | Target |
|---|---|---|
| Cleanup wall time, no-op session | ~10 min | under 2 min |
| Bookkeeping acts per dispatched task | ~15 | 5 or fewer prompt-mandated acts |
| Event-log identity compliance | 2.6% of lines | 100% (machine-stamped) |
| Event timestamp fidelity | 87% batch-written | written at the transition, by construction |
| Monitor poll cost | full-log parse every 2 s | O(appended bytes) per poll |
| Process-generated repair share of dispatches | ~50% | measured per session by `/fusion:cadence`; falling |

Take a baseline before Phase 1 lands: time one `/fusion:cleanup --dry-run`, record `wc -l` of the event log, and keep the audit's commit-ratio measurement as the reference series.

## Phase 1 — machine-written bookkeeping (highest leverage)

The model currently writes events, dashboard, `agentstate.yaml` and the heartbeat by hand, per prompt mandate, and demonstrably does not keep up. Move everything mechanical into code that already runs.

**1.1 Event emission via hooks.**
Add a PostToolUse hook branch (in `hooks/tracker.ts` or a sibling) that appends `task_start`/`task_done` equivalents when the tool is `Agent`, stamped with a real timestamp, `person`, `checkout` and `session_id` resolved once per process. The hook layer already receives every tool call and already writes `.guard-state/events.jsonl`; this reuses that plumbing for `orchestrator-events.jsonl`.
*Constraint respected:* nothing reads a `Bash` command's text (the 260809 deletion stands). Dispatch events come from the `Agent` tool call itself, not from command parsing.
*Saving:* removes 3 event appends per task and 5 to 7 per Turn from the prompt, and closes the identity-compliance gap at the same stroke.

**1.2 Commit events from the lock wrapper.**
`bin/fusion-commit-lock with` already wraps every commit deterministically. Extend it to append the `commit` event line (hash, summary, identity) after the wrapped command exits 0. No Bash text is read; the helper logs its own action.
*Saving:* one prompt-mandated act per commit, with a timestamp that is actually the commit's.

**1.3 Heartbeat and session marker via hook.**
Touch `fusion-workbench/.session-marker` from the PostToolUse hook (rate-limited, e.g. at most once per 60 s). Delete the per-Turn heartbeat mandate from `agents/orchestrator.md`.

**1.4 Identity resolved once per session.**
Resolve `bin/fusion-identity` in the SessionStart hook and export `FUSION_PERSON` / `FUSION_CHECKOUT` (alongside the existing `FUSION_PLUGIN_ROOT` export). `bin/fusion-events` and every filing agent read the environment first and fall back to a fresh resolution only when the variables are absent. Keeps the criterion evaluated in one place (the hook calls the same helper) while ending the three-fold re-resolution per Setup.

**1.5 Dashboard refresh cadence.**
Replace "overwrite at steps 2, 4 and 6, not batched, not deferred" with one overwrite per task completion and one per Turn boundary. The monitor polls every 2 s; three intra-task rewrites buy nothing a 2 s poll can see.

*Why this phase is also a budget win:* every mandate deleted from `agents/orchestrator.md` frees bytes in the `agents/` growth bound, which currently has 47 bytes of head-room. Phase 1 is a net shrink of the most constrained surface, which is what makes the later phases' small prompt edits affordable.

*Residual to plan for:* hooks run from the installed copy, pinned per session. Every phase that touches `hooks/` needs `fusion --update` plus a session restart before its behaviour is live, and verification against a non-plugin project root per the release checklist.

## Phase 2 — incremental cleanup

Introduce one anchor file, then bound each full pass by it.

**2.1 The anchor file.**
`fusion-workbench/.cadence-anchors` (class L in `rules/workbench-tracking.md` terms: per-checkout, never travels), holding `last_reconcile_commit`, `last_curator_run`, `last_activity_log_date` as `KEY=value` lines. Written by the step that completes; read by the next run.

**2.2 Curator: bound the evidence horizon.**
Today `agents/curator.md` mandates the opposite ("Git-history reads are not bounded by the previous run. Read the full `git log --follow` per file every time"), and the archive store is an evidence source in full. Change to: evidence since `last_curator_run`, with `--full` as an explicit escape hatch and one full pass forced when no anchor exists (first run after upgrade). This reverses a written mandate, so it needs a decision record filed before the edit; the record's case is the audit's finding that the archive source makes curator cost strictly monotonic in project age and that archiving (Step 4) currently shifts bytes from one curator source to another rather than reducing anything.

**2.3 Reconciler: precondition on delta.**
Cleanup Step 3 dispatches unconditionally. Add a guard: `git diff --name-only <last_reconcile_commit>..HEAD -- fusion-workbench/` plus `git status --short fusion-workbench/`; when both are empty, report "tracking corpus unchanged, reconcile skipped" and write the anchor forward. When the reconciler does run, hand it the changed-path list so its inventory (today: every `.md` in five store kinds, 744 files in `shared/` alone) opens only what moved plus what those records cite.

**2.4 Reconciler: read only live records.**
964 of 1,007 issues are closed (`_c_`) and are still read on every inventory. Scope the inventory to `_o_`/`_p_` markers plus the delta list from 2.3. Closed records are evidence for the curator, not work for the reconciler.

**2.5 log-activity: append by high-water mark.**
Read `last_activity_log_date` from the anchor instead of re-reading the whole 223 KB log to learn which dates exist; append the new daily blocks instead of rewriting the file. This also removes the failure mode the audit measured (the arc section drifted 28 entries behind the daily entries under whole-file rewrite). Replace the full-tree `find ... -exec ls -l` (417 KB into context per run) with a date-bounded `find -newer` against the anchor.

**2.6 cleanup Step 8: measure without reading bodies.**
`find ... -name '*.md' -print0 | xargs -0 wc -c | tail -1` per surface instead of `cat | wc -c` over 774 KB, and reuse the run-file path Step 5 already holds instead of re-discovering it by filesystem search.

**2.7 Resolve once, pass down.**
Cleanup resolves `fusion-paths` once in Step 0; today the same resolution runs six times per pipeline (cleanup, archive, curate, log-activity, plus once inside each dispatched agent). Export the held `KEY=value` set to the inline-executed bodies; dispatched agents keep their own resolution (they are separate contexts and the contract requires it).

## Phase 3 — record diet and the cardinality fix

**3.1 No cardinalities in prose.**
This is the open decision `260826-1252` in the active Circle; the audit supplies the missing measurement: seven passes could not keep a prose count true, and the defect class now dominates the backlog (~17 of 19 open records). Recommend option (b)/(c) from that record: enumerate items instead of counting them, or derive counts at read time (`grep -c` in the consuming step). File the decision, then sweep the templates in `rules/fusion-workbench-conventions.md` and `rules/circle-records.md` for count-shaped fields.

**3.2 Shorten the records.**
Averages today: 4.9 KB per issue, 1,872 characters per commit message. Set expectations in the two templates rather than adding a gate: an issue states the defect, the evidence path, and the acceptance test, in that order, and stops; a commit message subject plus a body of at most a few sentences. The reconciler and curator both read these stores in full; every byte written here is read many times later. No new lint, no new bound: the fix is the template text agents copy.

**3.3 Session close: one gate, not ten.**
The stop-conditions gate currently reads ten clauses to the user with a `gate_hit`/`gate_response` pair per clause (the log shows more `gate_response` than `turn_start`). Collapse to a single question presenting the clause table with one answer, one event pair.

**3.4 Setup-only sessions must not file full ceremony.**
The two most recent history files are pure Setup snapshots. Defer creating the session history file (orchestrator Setup Step 6/7) until the first dispatch or the first user Directive; a session that ends before either leaves nothing behind but its `session_start` event.

## Phase 4 — the monitor and per-call waste

**4.1 Monitor: incremental log read.**
`bin/monitor` parses the entire unbounded log every 2 s for a 100-row window (correctness-motivated since union merges can place foreign blocks anywhere). Repair without losing that correctness: cache `(byte_offset, parsed_rows)` per file identity; on poll, parse only appended bytes; if the file shrank or the inode changed (a merge or roll rewrote it), invalidate and reparse once. Steady-state cost becomes O(new events). The open testing issue `260826-0906` (a fixture too small to see the parse behaviour) should be fixed in the same change with a fixture large enough to detect both regressions.

**4.2 fusion-events: one parse for Setup.**
Setup runs `presence` and then `turns`: two node cold-starts, two full parses, two nested identity resolutions. Add a combined subcommand (or `--also-turns`) so Setup pays once. With 1.4 in place the nested identity resolution becomes an env read.

**4.3 Archive gate contradiction.**
`skills/cleanup/SKILL.md` Step 4 mandates an autonomous tier-1 run; `skills/archive/SKILL.md` contains an unconditional confirmation gate in the procedure cleanup executes inline. Make the archive body's gate conditional ("when invoked standalone; the cleanup pipeline runs tier-1 without it") so the two files agree and the pipeline stops only at the declared Step 5 gate.

**4.4 EPIPE across the four reporting programs.**
Already filed (`260826-0906`, one shape across `fusion-events`, `fusion-review-coverage`, `fusion-staging-drift`, `fusion-turn-budget`); fold into whichever phase first touches those files.

## Sequencing, constraints, and what each phase needs

| Phase | Order rationale | Needs |
|---|---|---|
| 1 | Biggest saving, frees `agents/` budget for everything after; hooks are release-gated | hook build (`npm run build`, committed `dist/`), verification against a non-plugin project root, `fusion --update` before the next session, a `docs/upgrading-to-vN.md` note |
| 2 | Depends on nothing in Phase 1; 2.2 needs a decision record first | decision record for the curator horizon; anchor-file class added to `rules/workbench-tracking.md` |
| 3 | 3.1 is an open decision the user must answer; 3.2 to 3.4 are template/prompt edits | user gate on `260826-1252`; template edits inside the `skills/`/`agents/` budgets Phase 1 freed |
| 4 | Independent; 4.1 pairs with an open test issue | none beyond release process |

Standing constraints every phase inherits:

- **Growth bounds.** `agents/` has 47 bytes free and `skills/` 16. Any phase adding prompt text must land after (or inside the same change as) a cut. Phase 1 is the cut.
- **Two-session shape.** A change to hooks or agent prompts is only observable after `fusion --update` and a restart; plan each phase's proof run in the following session.
- **Decision records.** 2.2 (curator horizon) and 3.1 (cardinalities) reverse or settle written positions and need records; everything else is repair within existing decisions.
- **Migration.** Phases 1 and 2 change what a consuming project's log lines and anchors look like; ship an upgrade note stating that pre-existing logs remain readable (the absent-field degradation rule already covers old lines).

## What this plan deliberately does not do

- It does not remove any record type, gate, or the archive. The target is the cost of maintaining the records, not their existence.
- It does not touch the guard (observation-only since 260816) or re-introduce anything that reads a Bash command's text.
- It does not propose raising a growth-bound baseline. Every prompt edit here is net-negative or budget-neutral by construction.
- It does not decide the open user decisions it names (`260826-1252`, the em-dash ceiling scope, the review-coverage release question). It queues them where a phase depends on one.
