The live `agentstate.yaml` still carries the `progress:` block after the commit that renamed it landed

---

`f45f76a` (step 11) renamed the `progress:` block to `control:` and removed seven counter fields.
The file on disk was written **after** that commit — it records `f45f76a` as P-11's commit hash —
and it is still in the retired shape: a `progress:` block carrying all seven removed fields and no
`control:` block at all.

---

## Evidence

`fusion-workbench/agentstate.yaml`, `# Updated: 260815-0110`:

```yaml
progress:
  turn: 4
  max_turns: 12
  tasks_total: 17
  tasks_done: 13
  tasks_skipped: 0
  tasks_errored: 0
  commits: 25
  turn_start_head: "9955e8f"
  directive_revisions_this_session: 0
```

The schema at `agents/orchestrator.md:983-986` defines instead:

```yaml
control:
  turn_start_head: "<short hash …>"
  paused_at_task: "<task ID …>"
  directive_revisions_this_session: <integer …>
```

That the file was written after the rename is not inferred: its own `work_queue` carries
`{id: "P-11", … status: "done", commit: "f45f76a"}`, and `agents/orchestrator.md:545` requires that
row to be written at the commit step. Two further write points have passed since (P-12 task start,
P-12 task complete) and the block has not moved.

## Why it matters beyond tidiness

1. **Every reader of this file now meets a shape no document defines.** The schema, the derivation
   table (`agents/orchestrator.md:1013-1018`) and the write-point table (`:1026-1038`) all describe
   `control:`. A resumed session reads a file none of them describes.
2. **The counters are wrong, which is what the removal predicted.** `commits: 25` was correct at
   `f45f76a` (`git rev-list --count 9a7da8e..f45f76a` = 25) and is 26 at `1e29572` — one Turn-4
   commit stale, the freeze mode exactly. `tasks_done: 13` matches nothing at all: the event log
   holds 12 `task_done` events for this session's plan tasks, and the `work_queue` rows below it
   mark 10 as `done`. Three surfaces in one file, three answers.
3. `turn: 4` and `max_turns: 12` are the two fields the prompt now forbids most explicitly.
   `agents/orchestrator.md:136`: *"The budget is not persisted — `agentstate.yaml` carries no
   `max_turns` field to omit, because it carries no counters at all."* The file has one, and its
   value (12) is not what `bin/fusion-turn-budget` resolves.

## Not a code defect

`bin/fusion-paths`, `hooks/lib/state-file.ts`, `bin/fusion-review-coverage` and
`bin/fusion-staging-drift` all read only `session.git_head_at_start` and `session.history_file`, and
`stateField()` is a flat first-match regex, so nothing breaks on the stale block. The defect is that
the project's own live state contradicts the shape this Turn shipped, at the moment a curator pass
is about to read this session's records as evidence.

## Suggested fix

Rewrite the file in the `control:` shape at the next write point. Related and separately filed: the
`work_queue` content defect, `260815-1631_o_the-work-queue-misstates-three-of-seventeen-tasks-and-is-now-the-only-durable-copy.md`.

---
Resolved: the live file was rewritten in the shape `f45f76a` specified. The `progress:` block is now `control:` with its three non-count fields, and the comment above it names the records the removed counters are read from instead. The file is gitignored here, so it is live state rather than a record, and the orchestrator is its only writer.
