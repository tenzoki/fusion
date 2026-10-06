# How does the write client log a change it cannot append, or did not observe?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260930-2305_*_plan-fj03c-the-write-client-setup-and-the-skills-on-json.md, 260930-1451_*_where-does-the-monitor-take-a-records-status-from-and-how-does-an-event-name-a-record-and-its-host.md, 260822-1136_*_how-does-the-tracked-event-log-behave-when-two-checkouts-both-appended-to-it.md

---

## Question

Prior accepted the `record_change` row at `ae1ad78` (`Prior: docs/design/fusion-qualified-revision-contract-response.md` `## 32`) with four duties on the writer: a failed append after a successful mutation is reported and never repaired by rerunning the mutation; pending event work is retained in the host for repair; repeated rows are identified by `(workbench_id, operation_id, path, revision)`; and "a replay must not create a fresh-timestamp status event for an old transition: preserve the original observation identity/time, or leave it unlogged if that evidence is unavailable". Whether an answer is a replay is not decidable from the answer: the codec returns a stored answer byte for byte. So the writer needs a question it can answer from its own inputs, and a place to retain rows.

## Options

1. **Observation-based logging, retained rows under `.guard-state/`.** A row is composed only from an answer this call received to an operation id it minted in this call, stamped at that moment. Before appending, the writer skips any row whose key the log already holds. A failed append writes the rows, with their original `ts`, to `.guard-state/record-change-pending.jsonl`; every later `fusion-write` run, and `fusion-write log-repair` alone, appends retained rows by the same key test and removes them. A re-send under a caller-given operation id appends only rows retained for that id; with none retained, it writes nothing and reports `event=unlogged`.
   - Pros: every row is an observation the writer made, at the time it made it; duplicates and delayed rows are decided by the key; `.guard-state/` is class L in full, per checkout, and needs no new root-anchored surface.
   - Cons: a crash between the answer and the append, and a re-send after an unanswered first call, leave the change unlogged (the branch Prior permits); the tracking rule's file list gains one name (FJ03d).
2. **Log every successful answer with the current time.**
   - Pros: nothing goes unlogged.
   - Cons: a replay of an old transition becomes a fresh status row, which the monitor then shows as newest: the case Prior excludes.
3. **Write-ahead the send, then the rows.**
   - Pros: a crash leaves a trace.
   - Cons: the trace holds the send time, not the observation time, so the rows it could produce are the ones Prior says to leave unlogged; it adds a file and a state machine for no loggable row.

## Constraints

- The log is class R2, append-only, merged by union; a row is one complete LF-terminated line and nothing rewrites the file (`rules/workbench-tracking.md`).
- No automatic hook writes the row (`hooks/lib/__tests__/hook-route-exclusion.test.ts`).
- The event is an observation, not a second source of current state.

## Recommendation

Option 1. It replaces "is this a replay" by "did this call observe this answer", which the writer knows, and every remaining gap is one Prior named as acceptable.

---
Answered: plan `260930-2305_*_plan-fj03c-the-write-client-setup-and-the-skills-on-json.md` — option 1 — the client logs only responses it observed itself, retains rows it could not append under .guard-state/ keyed by (workbench_id, operation_id, path, revision) and appends them later, and leaves a resend without retained rows unlogged, as Prior ae1ad78 ## 32 permits; fusion rules this and informs Prior; the user approved it with the FJ03c plan on 2026-09-30; ruled by user, Kai Stalmann <ks@qantr.com>
