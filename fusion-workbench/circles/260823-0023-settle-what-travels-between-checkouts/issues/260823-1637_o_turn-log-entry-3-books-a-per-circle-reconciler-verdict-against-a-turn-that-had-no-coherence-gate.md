Turn-log entry 3 books a per-Circle reconciler verdict against a Turn that never had a Coherence gate

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 4 (`a2a18f9..2ec2bc2`)
**Affects:** `circles/260823-0023-settle-what-travels-between-checkouts/_t_circle.md:62` (`## Turn log`, third entry)
**Cross-references:** `rules/circle-records.md:152-155`, the Turn-log format; `agents/orchestrator.md:1267`, the `coherence_review` event row and its verdict enum; `agents/orchestrator.md:726`, the Phase-3 per-Circle verdict this entry actually carries

---

## What is wrong

`d2089e4` wrote, at `_t_circle.md:62`:

```
- Turn 3 (session 260823-0721): commits a2a18f9..7cd79f1; Coherence verdict review-needed
  (reconciler, Grounding claim false); session history: …
```

**Turn 3 has no Coherence verdict.** Filtering `fusion-workbench/orchestrator-events.jsonl` to this session's date and sorting by `ts` gives, for Turn 3:

```
2026-08-23T11:30:03 turn_start turn=3  Turn 3: all six Turn-2 findings, then closure; head 5fc3201
2026-08-23T12:36:03 turn_end   turn=3  3 tasks resolved, 4 commits, 7 issues created, 10 issues resolved
```

Nothing between them. No `gate_hit` for the per-Turn Coherence gate and no `coherence_review` event with `"turn":3` from this session, where Turns 1 and 2 each have both:

```
09:18:19 gate_hit turn=1  per-Turn Coherence gate
09:42:20 coherence_review turn=1  verdict=ok; …
11:24:37 gate_hit turn=2  per-Turn Coherence gate + closure scope
11:30:03 coherence_review turn=2  verdict=ok; …
```

`review-needed` is the **Phase-3 per-Circle reconciler verdict**, and its scope is the whole Circle rather than Turn 3:

- `circles/260823-0023-settle-what-travels-between-checkouts/history/260823-1446-reconciliation.md:6-8` gives its range as `3ee8eaf..7cd79f1`, 19 commits, three Turns.
- The reconciler ran at 14:46 local, ten minutes after `turn_end turn=3` (12:36:03 UTC = 14:36 local), and the Rebalance it triggered is the `gate_response` at 13:00:19 UTC.

So the log's three entries carry two different objects. Entries 1 and 2 report the per-Turn gate; entry 3 reports a verdict over all three Turns, booked against the last one. Nothing marks the difference. The parenthetical `(reconciler, …)` is the only reason this is legible at all, and it reads as attribution rather than as a change of scope.

**The parenthetical's substance is correct.** The false Grounding claim is real and the reconciler flagged it, on the **Artifact↔Grounding** edge — `history/260823-0721-orchestrator-session.md:40-45`. Not on Grounding↔Directive, which the same pass explicitly declined to flag.

## Why it matters after the rename

The Turn log is the record a later reader tiles a Circle's history from, and it is written once and frozen. Read at face value it says Turn 3 was reviewed for coherence and came back needing review. What happened is that Turn 3 was not reviewed for coherence at all, and the Circle was. Those support different conclusions about where the gap in this session's bookkeeping is — which is the very question `shared/issues/260822-2236_*_the-four-session-bookkeeping-surfaces-froze-again-and-the-detection-that-closed-the-first-record-has-been-removed.md` is open on.

## Verified

Extracted every event stamped `2026-08-23` from `orchestrator-events.jsonl`, parsed and sorted by `ts`, and read the full sequence from `session_start` through `turn_start turn=4`. Confirmed there is no `coherence_review` or Coherence `gate_hit` between `turn_start turn=3` and `turn_end turn=3`. (A `coherence_review turn=3 verdict=ok` does exist in the file, from a different session on a different date — the log is shared across checkouts and is not chronological after a union merge, which is this Circle's own subject.) Read `history/260823-1446-reconciliation.md` and the `## Coherence` section of `history/260823-0721-orchestrator-session.md`.

## Direction, not a prescription

Two things are entangled and only one of them is entry 3.

For the entry: say what the verdict is a verdict *about*. Either record Turn 3 as having no per-Turn Coherence gate and put the reconciler's Circle-level verdict where a Circle-level fact belongs, or keep it in the entry and mark its scope explicitly, so the three entries are not silently reporting two different measurements.

For the class: `rules/circle-records.md:154-155` gives the field as `Coherence verdict <coherent|review-needed|skipped-...>` with no slot for "which Coherence" and no case for a Turn that had none. `agents/orchestrator.md:1267` already ships a `skipped-…` family for the per-Turn event. Whether the Turn log should carry one of those, or should carry nothing when no gate fired, is a question this record does not answer.
