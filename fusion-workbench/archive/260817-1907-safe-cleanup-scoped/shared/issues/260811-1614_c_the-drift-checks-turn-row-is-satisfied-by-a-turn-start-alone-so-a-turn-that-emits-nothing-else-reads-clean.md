# The drift check's Turn row is satisfied by a `turn_start` alone, so a Turn that emits nothing else reads clean

---

**Severity:** Medium — the measurement built to make a frozen bookkeeping surface impossible to miss reports `verdict=clean` over a Turn whose event log froze after its first line
**Domain:** code
**Filed by:** coderev (Turn 3 review, range `7d9efc8..adaa545`)
**Affects:** `hooks/lib/state-drift.ts:271` (the only line of the event log the check reads), `agents/orchestrator.md:993-999` (the row table)
**Cross-references:**
`shared/issues/260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md` (the finding the drift check answers);
`agents/orchestrator.md:1152-1158` (the `task_start` / `task_done` / `commit` rows of the event schema);
`fusion-workbench/orchestrator-events.jsonl` as committed in `3b30f5e` (the evidence)

---

## What is wrong

`agents/orchestrator.md` `### Drift check` names `orchestrator-events.jsonl` as one of the two
records that *"did **not** freeze in any of the six … because emitting an event is a call that either
happens or visibly does not"*, and builds the whole check on that property. The check's four rows
then read exactly one event type out of it:

```ts
// hooks/lib/state-drift.ts:271
if (lines[i].includes('"event":"turn_start"')) count++;
```

`progress.turn` is compared against that count. Nothing else in the log is read. So a Turn that
emits its boundary event and then none of the per-task events the schema mandates —
`task_start`, `task_done`, `commit` — is indistinguishable to the check from a Turn that emitted
all of them.

The property the section rests on is real for the *boundary* events, because the drift check itself
rides them. It is not enforced for the per-task events, and those are the ones that carry which task
ran, which agent ran it and which commit closed it.

## Measured — this range is the case

`fusion-workbench/orchestrator-events.jsonl` as committed at `adaa545`, last three lines:

```
{"ts":"2026-08-11T12:12:08","event":"coherence_review","turn":2,…}
{"ts":"2026-08-11T12:12:08","event":"turn_end","turn":2,"detail":"15 tasks resolved, 6 commits, 9 issues created, 0 errors"}
{"ts":"2026-08-11T12:48:11","event":"turn_start","turn":3,"detail":"turn_start_head=7d9efc8; …"}
```

Turn 3 then produced three commits (`41d8e2b`, `3b30f5e`, `adaa545`) closing eleven queue entries —
tasks 11, 12, 18, 21 and the seven review findings `CR:260811-1406` … `CR:260811-1413`. The log
carries **no** `task_start`, **no** `task_done` and **no** `commit` event for any of them. Turn 2, for
comparison, emitted a `task_done` per task.

The check run against that state, from the repository root:

```
$ ./bin/fusion-state-drift
anchor=workbench-root
state=present
rows=4
drift=0
verdict=clean
  progress.commits       surface=15               record=15 (git 7785330..HEAD)
  progress.turn          surface=3                record=3 (turn_start events this session)
  session.history_file   surface=…                record=present (on disk)
  history Directive      surface=…                record=…
```

`verdict=clean`, four rows, zero drift, while eleven task events and three commit events are absent
from the log the check calls unfreezable.

## Why this is the finding and not a note about one session

The `progress.commits` row already reads git and already knows the session produced 15 commits. The
log's `commit` events are the one surface that ties a commit to the task it closed, and it is the
surface the Phase 4 sequence diagram is built from — `agents/orchestrator.md:1197` says *"Build it
from the event log — do not reconstruct from memory."* A Turn with no task events yields a diagram
with a start and an end and nothing between, and no row of the check says so.

Secondary, in the same file: `fusion-workbench/agentstate.yaml` carries `# Updated: 260811-1155`
while `progress.commits: 15` and `turn_start_head: "7d9efc8"` are both current as of `adaa545`
(15:55). The header comment is written by hand at each overwrite and nothing reads it, so a stale
stamp beside current values is invisible. Minor, and worth folding into the same fix rather than
filed on its own.

## Suggested direction

Add a fifth row: the number of `commit` (or `task_done`) events carrying the current turn number
against `git rev-list --count <turn_start_head>..HEAD`. It uses the two records the section already
trusts, it needs no new writer, and it fires on exactly the shape above — a Turn that committed
without recording what it committed. Follow the existing row semantics: a difference of more than
one, to allow the commit in flight.

Alternatively, if per-task events are to be considered advisory, say so in the `### Drift check`
section, because the current text presents the whole log as the unfreezable record.

## Acceptance criteria

- [ ] `bin/fusion-state-drift` reports drift, naming the log, for a session whose current Turn has
      commits in git and no `task_done` / `commit` events for that turn.
- [ ] A case in the state-drift suite constructs that state and asserts the row.
- [ ] `cd hooks && npm test` exits 0.

---
Also seen: twice more since filing, which takes this from one measured Turn to four across two
projects.

- **260810-1945, KRK project**, reported by the user on 260811-2030: the orchestrator emitted no
  task event at all across **three** consecutive Turns. Not transferred as a record of its own —
  same defect, and the reporting project cannot fix it.
- **Turn 4 of this session, 260811-2000 onward**: the log carries `turn_start` for Turn 4 and then
  nothing, while `36984d7` and `9f84254` landed and closed five queue entries. Measured at the
  resume drift check at 260811-1915, which reported **clean** on all four rows while this was true.

The pattern across all four instances is one thing, and it is the thing this record proposes to
fix: `turn_start` is emitted at a boundary the orchestrator stops at anyway, while the per-task
events sit beside work that has its own momentum, so the boundary event survives every lapse the
others do not. A row that counts only the surviving event cannot see the lapse. The fifth row
proposed here — commits in the log against `git rev-list --count <turn_start_head>..HEAD` — is
keyed to the record that never freezes, which is the same reasoning the drift check itself uses
for its other four rows.

One consequence worth stating for whoever builds it: in three of the four instances the missing
events were emitted **late**, after a reviewer or the check caught the gap, carrying a note saying
so. A row comparing counts will read a late emission as compliance. That is acceptable — the row
exists to make the gap visible while the session can still act, not to prove it never happened —
but the row's failure message should not claim more than it measures.

---
Resolved: moot, not fixed. `hooks/lib/state-drift.ts` was deleted whole in `f45f76a` (Circle `260815-0007-...`, step 11), all five rows including the Turn row. The deletion was put to the user as a one-way door at the plan gate and accepted (`shared/history/260814-2306-orchestrator-session.md:174`). Verified at HEAD `9306f0a` by the reconciliation pass of 260815-1913.
