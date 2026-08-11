# Coder — staging drift: a queue rebuild gets an owner, and the workbench gets measured

**Status:** Complete
**Task:** 5 of `fusion-workbench/tasklist.md`, ID `I:260811-0114-uncommitted-queue`
**Source:** `shared/issues/260811-0114_*_the-queue-rebuild-and-its-history-file-never-entered-a-commit-and-survive-only-in-the-working-tree.md`
**HEAD at start:** `afd7c2e`
**Verification:** `cd hooks && npm test` — exit 0, 1243 tests (1210 at HEAD, 33 added)

---

## The three questions, answered

**1. Who commits a queue rebuild? — the orchestrator, at Phase 1, from a field the
producer now has to write.**

`agents/taskplanner.md` gains Step 6: every run ends with `**Files written:**`,
absolute paths or the recorded word `none`. `agents/orchestrator.md` Phase 1
gains step 3: stage exactly those paths under the Step 3b commit shape and
commit before Phase 2 starts. The field is the handoff across a boundary that
previously had nothing crossing it — taskplanner writes the queue, the
orchestrator moves the index, and until now neither owned the space between.

The old Phase 1 steps 3 and 4 became 4 and 5; the one cross-reference (the agent
routing table's "handle per Phase 1 step 3") moved with them.

**2. Should the orchestrator check for unstaged workbench records at Turn end? —
yes, and it is the same shape as tasks 2 and 4, with a different trigger.**

`hooks/lib/staging-drift.ts` + `bin/fusion-staging-drift`, two callers, the same
family as `state-drift.ts` and `review-coverage.ts`. It is a third module rather
than an extension of either, because the inputs and the verdict are different:
state-drift compares bookkeeping surfaces against un-freezable records,
review-coverage tiles declared ranges against a commit range, this one compares
the index against the workbench's record stores.

**The trigger is HEAD having moved since the previous tool call**, read with
`git rev-parse`. Task 4's finding — firing on the commonest path is itself a
defect — decided it: an unstaged record *mid-Turn* is the normal and correct
state (a coder writes an issue file, Step 3b stages it minutes later), so the
every-call path was out. Reading a `Bash` command's text for `git commit` was
also out, and for the sharper reason: that is the classifier the guard deleted
at v6.0.0 and the branch policy deleted on 260809 after 24 false blocks.
Measuring HEAD is correct across `git commit`, an alias, a script, a rebase and
a reset alike.

**3. Should the commit-message file be forbidden inside the workbench? — yes, in
two halves.**

Run time: the measurement reads any commit-message-shaped file under the
workbench as a fault of its own class, whatever its spelling, and names the
prescribed `/tmp` path back. Test time: `commit-message-path.test.ts` pins the
prescription in `agents/orchestrator.md` Step 3b step 3, binds it to the module
constant `PRESCRIBED_MESSAGE_PATH`, and fails if any shipped prompt prescribes a
commit-message path inside `fusion-workbench/`. `skills/commit/SKILL.md`'s
`<msg-file>` placeholder was unbounded and is now pinned to `/tmp` too —
`/fusion:cleanup` defers to it, so that covers both.

## The constraint

The staging shape is untouched. `queue-commit-ownership-lint.test.ts` asserts it
mechanically: no `git add` inside any fenced block of `agents/orchestrator.md`
carries `-A`, `-u`, `--all`, a bare `.` or a directory argument, and Step 3b step
4 still states the rule as a shape. The scan is fenced-blocks-only on purpose —
the prose quotes `git add -u` deliberately, because naming `f38f37d` is how the
rule earns its keep, and a lint that flagged the explanation would teach its
reader to delete it.

## What it reports, and what it does not

Four classes, every entry printed, the alarm narrow:

| Class | Verdict | Example |
|---|---|---|
| `record` | fault | `tasklist.md`, anything under an artifact store, a Circle record |
| `commit-message` | fault | `.commit-msg-tmp` |
| `in-flight` | never | the dashboard, the event log, `.guard-state/`, the setup marker, this session's own history file |
| `unclassified` | never | a user's note file, a stash snapshot |

Run against this session's own tree at `afd7c2e`:

```
anchor=workbench-root
head=afd7c2e
rows=3
unstaged=0
verdict=clean
  in-flight       M .fusion-setup  (the setup marker — written by /fusion:setup)
  in-flight       M orchestrator-events.jsonl  (append-only — …)
  unclassified   ?? shared/backlogs/260811-0826_observations.txt  (not a record store and not live state — nothing is claimed about it)
```

The live example from the task brief behaves as required: `shared/backlogs/` is
named, classified, and not an alarm. The session's own history file is
distinguished from every other file in the same store by reading
`session.history_file` out of `agentstate.yaml` — a recorded fact, not a guess
from the filename.

It stages nothing and commits nothing. A mechanism that added paths to the index
would be a second author of the staging list, and the shape's whole value is
that a human wrote every path in it.

## Incidental

`agentstate.yaml` was read by three modules with two copies of the same flat
field reader; `readStateFile` / `stateField` are now exported from
`lib/state-drift.ts` and all three read through them.

## Files changed

- `hooks/lib/staging-drift.ts` (new), `hooks/staging-drift.ts` (new), `bin/fusion-staging-drift` (new)
- `hooks/tracker.ts`, `hooks/lib/events.ts` (`staging_drift`), `hooks/lib/state-drift.ts`, `hooks/lib/review-coverage.ts`
- `hooks/lib/__tests__/staging-drift.test.ts` (new, 15), `commit-message-path.test.ts` (new, 7), `queue-commit-ownership-lint.test.ts` (new, 11), `helpers/guard-harness.ts`
- `agents/orchestrator.md`, `agents/taskplanner.md`, `skills/commit/SKILL.md`
- `README-hooks.md`, `.gitignore`

## Not done, deliberately

- **Gated task 49** (changes nobody authorised) is untouched. It meets this from
  the opposite side and was out of scope.
- **The marker rename and the tasklist tick** are left to the orchestrator.
  `shared/issues/260810-2024_*_a-marker-rename-is-claimed-by-two-prompts-and-one-executor-moved-seven-other-executors-records.md`
  is the open record about an executor doing that, and doing it here would be
  the same defect.
- **`bin/monitor`** does not surface `staging_drift`. Parity with
  `review_coverage`, which the monitor also leaves alone; the warnings panel's
  per-class caps are reasoned per rate and adding a class needs that reasoning,
  not a line.
