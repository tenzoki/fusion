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
