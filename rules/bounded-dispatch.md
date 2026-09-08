# Bounded Dispatches

**Provenance:** 260906-2258-bounded-executor-dispatches

This file has two audiences and they receive it by two different routes, so read the half
that is yours.

If you are `coder`, `ontocoder`, `bugfixer`, `reconciler`, `coderev`, `ontorev` or
`curator`, `bin/fusion-rules` emitted this file to you at Setup along with the rest of your
rules. The first four sections below are yours. Every other agent is unbound and receives
this file from nobody.

The orchestrator does **not** receive it at Setup. It reads the last section,
`## For the orchestrator: continuing a bounded return`, on demand through
`$FUSION_PLUGIN_ROOT/rules/bounded-dispatch.md`, at the first bounded return of a session.
That section is the only half written for it.

## What a stopping time in your dispatch prompt means.

A dispatch prompt may carry a line of this shape, on its own line, ahead of the directive
body, in the same form every other dispatch parameter takes:

```
**Stop by:** <YYYY-MM-DDTHH:MMZ>
```

It is a UTC clock time. Read your own clock with:

```bash
date -u +%Y-%m-%dT%H:%MZ
```

and compare the two values as **strings**. ISO-8601 UTC sorts lexicographically in
chronological order, so no arithmetic is needed and none is done. Your reading being
greater than or equal to the given value means the stopping time has been reached.

**A dispatch carrying no such line has no bound.** It runs to its natural end, exactly as
it does today. It does not halt, and it does not invent a bound of its own.

## When you read the clock.

Once, immediately before you start the next unit of your work, and at no finer grain than
that. Never inside a unit.

The cost of that is real and the user bought it knowingly: an agent that reads the clock
just short of its stopping time and then enters a unit longer than its whole bound returns
well past that time, and nothing here bounds or measures the overshoot. The bound is a
request read at unit boundaries, not a timer that interrupts you.

## What one unit is, for you.

| You are | One unit is | Read against |
|---|---|---|
| `coder` | the next file in the dispatch's Files list, carried to the end of the edit that file needs | `agents/coder.md` `## Implementation Process` step 3 |
| `ontocoder` | the next data file **together with every ripple update it requires** | `agents/ontocoder.md` `## Editing Process` steps 5 and 6 |
| `bugfixer` | the next root-cause hypothesis, carried from trace through fix to verification | `agents/bugfixer.md` Phases 2 to 5 |
| `reconciler` | the next tracking record: one plan, one issue, one decision, or one review file | `agents/reconciler.md` `### Step 3: Update every tracking file` |
| `coderev` | the next review topic, which is one per-topic working file | `rules/review-contract.md` `## Per-topic session files` |
| `ontorev` | the same | the same |
| `curator` | the next approved ledger entry of the apply pass | `agents/curator.md` `### Pass 2 — apply. Approved entries only.` |

**The `ontocoder` row is wider than the others on purpose.** That prompt's step 6 requires
the edit and all of its ripple updates in one coherent pass, and a unit that stopped
between a file and its ripples would hand back a dataset its own validation refuses, which
is a worse state than the unfinished one the handoff exists to preserve. The unit is the
coherent pass, not the file.

## The bounded return.

When the stopping time has been reached, return four statements and nothing else, in this
shape:

```
**Bounded return:** stopping time <the time you were given> reached at <your clock reading>
**Completed:** <what is finished, named by path>
**Unfinished:** <what is not, and how far it got>
**Next step:** <the one thing a continuation should do first>
```

What makes that a handoff rather than a report is the four rules under it.

**Write nothing to any workbench store for the purpose of the handoff.** No new file, no
new directory, no new record kind, no new field in an existing record.

**Work already on disk stays on disk.** Name the paths you touched. Do not copy their
content into the return.

**Where you had written nothing yet**, say so and name what you had read or established.
Still copy no content, and accept that the continuation will redo that reading.

**A return that was not caused by the stopping time carries none of these four lines** and
is unchanged by any of this. Report it in the shape your own prompt mandates.

The return is what the continuation is built from, and it is the only thing built from. A
`Completed:` line that overstates what landed causes the continuation to skip work that was
never done.

## For the orchestrator: continuing a bounded return.

**Recognition.** A bounded return is recognised by the return's own statement that the
stopping time was the reason it returned, and by nothing else. Read that test **before**
the site's own handling of a run that did not complete, at every site.

**One continuation rule, and it covers all five sites.** Continue from the site the
dispatch was made at, **before that site's own procedure advances**. Dispatch the same
agent again, with a fresh stopping time and with what the previous run completed. Nothing
else at that site moves in between: no marker is renamed, no commit is made, no completion
or error event is emitted, no dashboard line is overwritten, and no gate is put to the
user.

A run may be continued more than once, and nothing caps the count in advance.

**The stall guard.** If two consecutive continuations return having completed nothing, stop
dispatching and fall through to that site's own not-completed path, per the table's last
column.

**What each site does with a bounded return:**

| Site | Where the continuation is dispatched | What must not happen | If the stall guard fires |
|---|---|---|---|
| Step 3a item 4, queue task | At item 5, inside the same Turn | Item 6 is not reached, so the task is not marked complete and its source marker stays at `_p_`. Step 3b is not entered: the partial work is not committed and the return triggers no validation run | Step 3a step 6 runs, which is this site's own not-completed path: the source marker stays at `_p_`, `task_error` **is** emitted and the dashboard shows `[ERROR]`. The orchestrator reports the stall to the user; the task keeps its `_p_` marker and its queue entry. `task_error` is emitted at the stall and is **not** emitted at a bounded return |
| Step 3b step 2b, self-healing | Inside step 2b, before step 2c is read | **Step 2d does not run.** No `git checkout HEAD -- <files>`, no `bugfix_failure` and no `revert` event. A bounded return is not a reported failure, and step 2e's one-attempt budget counts attempts rather than dispatches, so a continuation does not consume it | Step 2d runs then, on a failure the bugfixer has actually reported |
| Phase 3 step 1 | At step 1 again, before step 2 reads anything | Steps 2 to 4 are not entered, and no Coherence verdict is read off a run that did not finish writing one | Phase 3 step 3's defensive case takes over on its own terms: no parseable `## Coherence` section, so the verdict reads `review-needed` and the Rebalance gate fires |
| Phase 4 step 2a, closing review | At step 2a again, before step 2b | The record is not renamed at step 3, `.active-circle` is not cleared, and `review_done` is not emitted for a bounded return | Closure proceeds and the coverage gap is named in the `## Closure note` at step 3, which is what an uncovered range already does, since coverage is advisory and never blocks a closure |
| Out of phase, on the user's ask | At the same dispatch point, with the same mode | No approval is taken or re-taken on the user's behalf, and the survey pass's gate is not put to the user twice. A continuation of the apply pass carries the same approved ids minus those the run file already records as `applied`, `skipped`, `stale` or `failed` | The orchestrator reports the stall to the user and names the curator's run file |

The second row is the one that changes behaviour rather than adding it. Read as a reported
failure, a bounded `bugfixer` return falls into step 2d and every file the task touched is
reverted, destroying exactly the partial work the handoff exists to preserve.

**Four rules hold across all five sites.**

1. Where a bounded return also carries a failed verification, the failure travels into the
   continuation dispatch as the first thing the continuing agent is asked to address. It is
   never routed to the bugfixer, because the task is still in flight.
2. Each continuation carries its own stopping time, computed fresh at its own dispatch.
3. No event is emitted and no dashboard line is overwritten, because a bounded return is
   not a task outcome. The machine already writes a `task_start` and a `task_done` row for
   every dispatch, so a continuation chain reads back as consecutive pairs naming the same
   agent, and the task keeps the `[RUNNING]` view those rows give it.
4. The `work_queue` entry in `agentstate.yaml` is not written at a bounded return. Step 3b
   step 7 writes that entry when a task completes, and the task has not completed.
