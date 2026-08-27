# Which surface is authoritative when the event log and the dashboard disagree?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `shared/issues/260825-1430_*_the-event-log-froze-at-turn-2-while-the-dashboard-stayed-current-inverting-the-diagnostic-six-instances-rest-on.md` `## What to consider` item 2 (the question, left unfiled there); `hooks/lib/orchestrator-events.ts` (the machine-written rows since v10.8.0; `turn_start`/`turn_end` stay prompt-emitted); `bin/fusion-events` (reads the log); `bin/monitor` (renders it); `bin/fusion-review-coverage` (anchors on git); `rules/workbench-tracking.md` `## The four classes` (the log travels, the dashboard does not)

---

## Question

`orchestrator-live.md` and `orchestrator-events.jsonl` contradicted each other on one session: the dashboard current, the log frozen at a `task_start`. Since v10.8.0 the task and commit rows are machine-written, so the freeze mode that produced that contradiction is closed for those rows and still open for Turn boundaries, which only the prompt knows about. Two readers of the log, `bin/fusion-events turns` and `bin/monitor`, show a session parked in a Turn whose end never landed, and nothing says whether a reader should believe the log, the dashboard, or neither. The repair plan closes the defect record on the v10.8.0 evidence and needs this question to have a home.

## Options

1. **The event log is authoritative for what it holds, and an absent boundary row is "unknown", never "still running".** Readers render a Turn with a `turn_start` and no `turn_end` as open-ended rather than in progress; the dashboard is a per-checkout convenience and is never read to settle a disagreement.
   - Pros: matches the transport facts (only the log travels); one rule, two readers to adjust.
   - Cons: `bin/monitor` and `bin/fusion-events` each need a rendering change; the "unknown" state has to be drawn.
2. **Git is the anchor and both files are witnesses.** A reader that finds the log and the dashboard disagreeing derives the session's progress from commits in the session's range, as `bin/fusion-review-coverage` already does, and reports which witness it overruled.
   - Pros: git is the one surface no session can skip; the resuming session of 260826 already did exactly this by hand.
   - Cons: Turn boundaries are not in git; a commit count is not a Turn count, so the derivation answers a neighbouring question.
3. **Make Turn boundaries machine-written too**, so the question does not arise. No hook sees a Turn; it would take a `bin/fusion-turn` helper the orchestrator calls at each boundary, which moves the obligation rather than removing it.
   - Pros: closes the last prompt-emitted row kind.
   - Cons: a helper the prompt must call is the same obligation with a different spelling; the 260825 session skipped a prompt-mandated write, and it would skip this one.

## Constraints

- No reader may render a failed read as a number (`bin/fusion-events` header).
- `orchestrator-live.md` is class L and never travels; a rule that makes it authoritative makes another checkout's reading wrong by construction.
- `hooks/lib/__tests__/` has 1 line free at `0fb5085`; a rendering change in `bin/monitor` that needs a test waits for the cut in the repair plan.

## Recommendation

Option 1, and it is compatible with option 2 as the derivation a reader falls back to. The record family's diagnostic ("the log always keeps up") is restated as an observed frequency in the issue's closure note, not in any shipped text, because no shipped text states it.
