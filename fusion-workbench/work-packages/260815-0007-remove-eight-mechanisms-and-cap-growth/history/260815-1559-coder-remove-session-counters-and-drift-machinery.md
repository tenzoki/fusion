# Step 11 — the session counters go, and the drift machinery whose only subject they were

**Date:** 2026-08-15 15:59
**Agent:** coder
**Status:** Complete
**Task:** Plan step 11 of `260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md`, plus one reversal folded in from step 10.
**HEAD at start:** `dd312eb`

## Verification

`cd hooks && npm test` — exit 0. **39 test files, 741 tests, all passing.** Before this step
the suite stood at 41 files and 790 tests; the two deleted files
(`state-drift.test.ts`, `state-drift-detection-lint.test.ts`) carried 49 cases between
them, which is the whole of the difference. `npm run build` was run before the test, so
`hooks/dist/` is current.

## What was removed

`hooks/lib/state-drift.ts` (677 lines), `hooks/state-drift.ts` (87), `bin/fusion-state-drift`
(64), and the two suites above (863 + 985). Plus the `measureStateDriftForModel` body and
its call in `hooks/tracker.ts`, and every prose call point in `agents/orchestrator.md`,
`skills/setup/SKILL.md` and the two `README`s. Deletions were staged with `git rm`; the new
module is a plain new file, not a `git mv` — a 677-line measurement module and an 87-line
file reader are not the same file under two names, and recording it as a rename would claim
they were.

3 242 deletions against 602 insertions across 33 shipped files, excluding `hooks/dist/`.

## Extraction, done first and in the same working tree

`hooks/lib/state-file.ts` (87 lines) holds `readStateFile` and `stateField`, which
`lib/staging-drift.ts:129` and `lib/review-coverage.ts:111` import and which both survive.
Both importers were re-pointed before the deletion, so no intermediate state of the tree
had a dangling import. The module has its row in `README-hooks.md`'s `hooks/lib` table —
the check is exact set equality in both directions, so an undocumented new file is exactly
as red as an undeleted row — and it sits inside `hooks/tsconfig.json`'s `include`
(`lib/**/*.ts`), which the build's prune requires.

## The three decisions the step left to execution time

### 1. What `agentstate.yaml` keeps, and what the block is now called

Seven fields go: `progress.turn`, `max_turns`, `tasks_total`, `tasks_done`, `tasks_skipped`,
`tasks_errored`, `commits`. Three remain, and none is a count, so the block is renamed
`progress:` → `control:`. A block named `progress` holding no progress is the kind of false
name this project files defects about.

The file's remaining shape:

- `session:` — `directive`, `mode`, `domain`, `started`, `history_file`, `git_head_at_start`.
  Unchanged. Every one is an identity or an anchor.
- `control:` — `turn_start_head` (a git anchor), `paused_at_task`, `directive_revisions_this_session`.
  The last two are control state that bounds a loop, not a tally of one.
- `current_task:`, `work_queue:`, `plan_context:` — unchanged. **`work_queue` is now the
  queue's only durable copy**, since step 10 removed the persisted `tasklist.md`, and the
  orchestrator prompt says so at both the Phase 1 write and the Cleanup delete.

A derivation table went into `### Format` naming, for each removed field, the record it is
now read from: commits from `git rev-list --count session.git_head_at_start..HEAD`, the Turn
number from `turn_start` events in `orchestrator-events.jsonl`, the task tallies from
`work_queue[].status` in the same file, and the ceiling from `bin/fusion-turn-budget`. Both
resume paths — `agents/orchestrator.md` Setup step 1 and `skills/setup/SKILL.md` Step 1 —
now carry the shell that takes the first two, and both report an untakeable figure as
`unavailable` rather than as `0`.

`bin/fusion-turn-budget` is untouched, as the step requires.

### 2. `bin/monitor`'s `state_drift` styling — kept, all three sites, and the prose re-tensed

Step 10's precedent for `queue_built` applies here unchanged, and the step's own file list
asked for a removal that I did not make. The criterion the prompt draws is between a style
rule for data that still exists and a reader of a state file that ceased to exist.
`bin/monitor` is the first: it reads `orchestrator-events.jsonl`, which is append-only and
holds **29 real `state_drift` rows**, the most recent at `2026-08-15T12:43:29` — this
session's Turn 3, hours before the emitter was removed. It never read `state-drift.json` and
never recomputed the divergence; it renders an event.

So `WARNING_EVENT_TYPES` membership, the `DRIFT_EVENT_TYPES` carve-out with its budget of 8,
and the `state_drift` level branch all stay. Dropping the level branch would not remove a
row — the rows still reach the panel through the membership — it would render them at the
amber default labelled "Warning", which says less about a historical divergence than "Stale
state" does. Dropping the carve-out would charge those rows to the general 30-row warning
budget, where a pre-removal burst evicts `guard_block` and `guard_halt` rows from the panel
of anyone reading an older log: the exact failure the carve-out exists to prevent, and it is
still preventable because the rows are still there.

What was false was the tense. All three comment blocks now say the emitter is gone, name the
date, and state the keep-decision and its reason at the site.

**This is what resolved the second re-pointed suite for free.** `monitor-warnings-panel.test.ts:730`
asserts `level("state_drift")` → `{warning, "Stale state"}`, and the step expected that
assertion to be deleted as collateral of removing the branch. With the branch kept the
assertion is still true, so it stays; I added a comment there carrying the same reasoning, so
the next reader does not delete it as a leftover.

The line I did draw, and it is the same criterion from the other side: **`state_drift` was
removed from the `GuardEventType` union in `hooks/lib/events.ts`.** That union is the
*emitter's* vocabulary — what a hook may write — and nothing can write the value any more.
The monitor is a reader of data that exists; the union is a writer's declaration for data
nothing can create. Both halves of that distinction are written into the two files.

### 3. The two `hook-fail-open.test.ts` tracker cases — re-pointed, not retired

The step is right that after this step no tracker measurement fires on an ordinary write at
an unremarkable path, and that both cases lose their trigger rather than their wording. It
left the choice between building a replacement probe and retiring them. I re-pointed both,
and re-pointed the nine cases of `guard-state-shape.test.ts` the same way, onto
**review coverage**.

The reason the choice is not close: `guard-state-shape.test.ts` is the **only** suite in this
repository that covers `lib/guard-state-file.ts`'s coercion seam (grepped, not assumed —
nothing else in `hooks/lib/__tests__/` names `loadGuardState`, `isStateObject` or the
module). That seam still ships and still has three callers. Retiring the nine cases would
leave a measured production defect (`260809-1101`: a `{}` state file throws on the next field
access and the tracker's whole reply goes out empty) with no regression coverage at all.

Why coverage and not staging drift, which is structural rather than a preference:
**staging drift's throttle record holds the HEAD its own trigger compares against.** Every row
in `guard-state-shape.test.ts` seeds that record malformed — that is the whole subject of the
file — and a malformed staging throttle reads as "first sighting of this HEAD", which disarms
the trigger and observes nothing. Coverage's throttle holds only a signature; a malformed one
reads as "never reported", which is the safe direction, and the gap still speaks. So the seam
is reached with the state file in exactly the shapes the defect was measured in.

The cost is named in both files rather than hidden: these cases now fail if the coverage
trigger breaks, for a reason that is not their subject. The step's earlier declination of
coverage was made when an uncoupled option existed. It does not now, so the criterion decides
between two coupled options instead of against them.

Mechanically: `freezeCommitCount` in the harness became `openCoverageGap` (anchor plus three
commits — the same fixture, a different reading of it, since `session.git_head_at_start` is
what the coverage window is measured over), joined by `openCoverageWindowWithNoGap` and
`REVIEW_PAYLOAD`; `DRIFT_SENTENCE_MARKERS` became `COVERAGE_SENTENCE_MARKERS`;
`stateDriftEntry` was deleted from the harness's five remaining entry points.

One case needed more than a re-point. "costs nothing on an ordinary write with nothing to
report" asserted that the throttle **load** runs, does not throw, and writes nothing. Under
coverage an ordinary write returns at the payload test, before the load, and the assertion
would have been vacuous. It now uses a session window with an *empty* range — anchor at HEAD
— which is the one shape where the measurement is well-formed, its signature is `""`, and the
load therefore runs and returns before writing. A project with no `agentstate.yaml` would
return on the `why` branch, which also sits before the load.

The third case in that describe block, "tracker with nothing to report writes nothing", needed
no re-point at all and became strictly more true: it was a property of one quiet corner and is
now the general case.

## The gate that fired, and the assertion I inverted rather than deleted

`turn-budget-lint.test.ts` failed on two cases, both pinning `progress.max_turns` into
`agentstate.yaml` — one requiring the field in `### Format`, one requiring the sentence that
omits it when the budget is unresolved.

Its reasoning was that the state file is the handoff surface, so a resumed session reads the
budget rather than assuming one. That reasoning does not survive the removal, and the
argument against it is the gate's own: a Turn budget is a **configured ceiling**, resolved
from `fusion-guard.json` through `bin/fusion-turn-budget` at Setup Step 2, and Setup Step 2
runs on a resume exactly as on a fresh session. The persisted copy handed a resume nothing it
could not resolve itself, while being one more number a session could write stale — and
having several sources for this one value is the whole of issue `260811-1712_*_max-turns-is-hardcoded-in-eight-places-and-cannot-be-set-per-project.md`, which is why
the gate exists.

So the `### Format` case is **inverted rather than deleted**: it now asserts the field's
ABSENCE, with the reversal and its reasoning written into the case. Re-adding the field is
the natural-looking fix for someone who meets a resume and wants the budget nearby, and an
absent assertion would not stop them. The unresolved-case assertion moved onto the sentence
that replaced it — the instruction widened from "omit this key" to "write no substitute
anywhere", which is what it always meant.

## What is no longer noticed, stated plainly

The user chose to delete the file whole at the plan gate, on the evidence that three of its
five rows never fired in either measured project. That is not re-litigated here. What it
costs:

1. **A frozen Circle Turn log.** The record now carries fewer entries than Turns run and
   nothing says so. This is one of the six failures `260801-2038` was filed on.
2. **A dangling `session.history_file`.** The resume anchor can point at a file that is not
   on disk. This was the row with the only non-numeric failure mode, and it caught the
   mid-session Circle-supersession case where the anchor was rewritten to a path the session
   never created.
3. **A history file whose `Directive:` line is a placeholder** while `agentstate.yaml`
   carries one.

Rows 1 and 2 of the five lost their *subject* — the commit count and the Turn number are no
longer written down, so there is nothing to contradict. Rows 3, 4 and 5 above measure
surfaces that survive, and they are simply no longer measured.

**A fourth thing stops being noticed and it is not on the drift check's list**: after this
step no tracker measurement fires on an ordinary write at all. Both survivors are narrowly
triggered — a review file landing, or HEAD having moved — so an ordinary `Edit` reaches
nothing. Written into `hooks/tracker.ts`'s header, the family comment and the `main` comment,
and into `README-hooks.md`'s `tracker.ts` row, because it changes what a reader should expect
from the hook.

And the sentence that used to end Step 3b step 7 — "you will not be trusted to remember it
and you do not have to be" — is now false. That step's own text says so: the commit count and
the measurement that caught its absence are both gone, what is left is the write riding the
commit that made it necessary, and nothing will tell the orchestrator when it skips.

## The step-10 reversal, folded in

Step 10 removed `queue_built` **and** `queue_empty` from the event-type table; the plan asked
only for `queue_empty`. `queue_built` is restored — both the table row and the **emission**
at Phase 1, because a row in the table with no emitter is a false row and restoring one
without the other would only move the error. It carries the task count and the blocked count.

The reasoning stands harder after this step than before it: `agentstate.yaml` is deleted at
Cleanup and the drift machinery that cross-read it is gone, so the event log is more nearly
the sole durable record of a session's shape. An event recording the queue's initial size is
worth more, not less. `bin/monitor` still styles it (`.event-type.queue_built`) and the log
holds 23 real entries.

## Judgements named — citations the step's file list did not carry

Every one of these is a statement my own change made false, in a file the step did not name,
and none is visible to any gate.

1. **`.gitignore:40`** carried `!bin/fusion-state-drift`, a negation for a file I deleted.
   Removed. **And in the same three lines, `!bin/fusion-plane`** — the identical fault left by
   step 2, which no gate sees because `reference-resolution-lint` does not scan `.gitignore`
   (proven by HEAD being green with the token present). Removed too, and named here rather
   than left as the next reader's surprise.
2. **`bin/fusion-source-root:61`**, **`bin/fusion-staging-drift:29`** and
   **`bin/fusion-review-coverage:31`** each cited `bin/fusion-state-drift` in a header
   comment. The last two were in the step's list; the first was not. All three re-pointed to a
   surviving sibling.
3. **`hooks/lib/guard-state-file.ts`** claimed "Four modules use it today" and "the three
   measurement throttle records". Three and two now. Its two `state-drift.ts` mentions were
   re-worded as history rather than deleted — the module's argument is *why the seam exists*,
   and the third copy that motivated it is part of that.
4. **`hooks/lib/git.ts`** and **`hooks/tracker.ts`** each carry a chassis trip-wire counting
   copies of the measurement boilerplate. Both said "three". **The trip-wire counts UP** — a
   fourth copy is the signal to build the chassis — so the removal moved it further off rather
   than resetting it, and both now say so explicitly, because "three → two" reads like progress
   toward the wire unless the direction is stated.
5. **`hooks/review-coverage.ts:47`** cited `hooks/state-drift.ts` as the authority for the
   stdout-verdict rule, and **`hooks/staging-drift.ts`** cited `bin/fusion-state-drift` twice
   for the same. Re-pointed; the rule (issue `260810-0710`) outlives the file that carried it.
6. **`hooks/lib/__tests__/review-coverage.test.ts`** (twice) and **`staging-drift.test.ts`**
   cited `state-drift.test.ts` for the per-process `isFusionPluginCwd()` caching discipline.
   Each now cites the other; the discipline is unchanged.
7. **`agents/reconciler.md:21`** told the reconciler to read `progress.turn` and
   `progress.turn_start_head`. Only the anchor survives, under `control:`, and the line now
   says where the Turn number comes from instead.
8. **`README-agents.md:169`** and **`CLAUDE.md`'s `bin/fusion-turn-budget` row** both said the
   unresolved-budget branch "omits the maximum from `agentstate.yaml`". There is no key to
   omit. Both re-worded.
9. **`rules/fusion-workbench-conventions.md`** layout tree named `hooks/lib/state-drift.ts` as
   a consumer of `agentstate.yaml` and of `orchestrator-events.jsonl`. The first row now names
   `hooks/lib/state-file.ts`; the second drops it.
10. **`hooks/lib/events.ts`'s `GuardEventType`** — decision 2 above.

## What the twice-corrected step still missed

Beyond the ten citations above, three things:

- **`turn-budget-lint.test.ts` was not in the file list**, and it is a hard gate with two
  cases that fail on this step's central change. It is the same class of miss as the two
  suites the second correction added — a gate pointed at a field the step deletes — and it
  went unnoticed for the same reason: the step's list was built from what the change touches,
  not from what asserts about it.
- **The step said `bin/monitor` line 133 and 562.** They are 132/144 and 557 at `dd312eb`, and
  the `state_drift` entry in `WARNING_EVENT_TYPES` at line 124 — which decides whether the rows
  reach the panel at all, and is the one of the three that most needed a decision — was not
  named.
- **Restoring `queue_built` to the table alone would have shipped a false row.** The reversal
  instruction names the event-type table; step 10 had also removed the Phase 1 emission. Both
  restored.

## Files

Deleted (`git rm`): `hooks/lib/state-drift.ts`, `hooks/state-drift.ts`, `bin/fusion-state-drift`,
`hooks/lib/__tests__/state-drift.test.ts`, `hooks/lib/__tests__/state-drift-detection-lint.test.ts`.
Deleted by the build's prune: `hooks/dist/state-drift.{js,d.ts}`, `hooks/dist/lib/state-drift.{js,d.ts}`.
New: `hooks/lib/state-file.ts`, `hooks/dist/lib/state-file.{js,d.ts}`.
Modified: `.gitignore`, `CLAUDE.md`, `README-agents.md`, `README-hooks.md`,
`agents/orchestrator.md`, `agents/reconciler.md`, `bin/fusion-review-coverage`,
`bin/fusion-source-root`, `bin/fusion-staging-drift`, `bin/monitor`, `hooks/tracker.ts`,
`hooks/review-coverage.ts`, `hooks/staging-drift.ts`, `hooks/lib/{events,git,guard-state-file,review-coverage,staging-drift}.ts`,
`hooks/lib/__tests__/{guard-state-shape,hook-fail-open,monitor-warnings-panel,review-coverage,staging-drift,turn-budget-lint}.test.ts`,
`hooks/lib/__tests__/helpers/guard-harness.ts`, `hooks/lib/__tests__/fixtures/rules-emission.golden`
(regenerated by the documented one command, `RULE_BASELINE` untouched),
`rules/fusion-workbench-conventions.md`, `skills/setup/SKILL.md`, plus 17 rebuilt files under
`hooks/dist/`.

Not committed — the orchestrator commits.
