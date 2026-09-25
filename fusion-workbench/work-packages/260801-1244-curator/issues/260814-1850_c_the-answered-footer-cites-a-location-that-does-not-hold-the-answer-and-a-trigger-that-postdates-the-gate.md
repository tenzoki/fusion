The Answered footer cites a location that does not hold the answer, and a trigger that postdates the gate

---
`260813-0027_*_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md`
carries `Answered: shared/history/260813-2345-orchestrator-session.md '## Coherence' → Rebalance
gate, 2026-08-14 — **option 2, narrowly.**` That section holds the reconciler's verdict and its
recommendation; it records no user answer, and neither does the session's
`## User decisions recorded this session`. The footer also states the gate "followed the reconciler's
`review-needed` verdict" — the gate is stamped 13:13:35 and that verdict was written at 14:57.

---
**What the convention requires.** `rules/fusion-workbench-conventions.md:332`: "The file body MUST
cite the answer's location with `Answered: <path>:<line> — <one-line summary>`." The point of the
field is that a reader can open the cited place and find the answer. Here the cited place is
`## Coherence`, which is `<!-- RECONCILER-OWNED -->` and ends at
`**Rebalance recommendation:** revise Grounding`.

**Where the answer actually is.** `fusion-workbench/orchestrator-events.jsonl:1424-1425`:

```
{"ts":"2026-08-14T13:13:35","event":"gate_response","turn":3,"agent":"user","detail":"Rebalance gate: revise Grounding"}
{"ts":"2026-08-14T13:13:35","event":"rebalance_grounding","turn":3,"detail":"shared/decisions/260813-0027 answered _o_->_a_ with option 2 (narrowly permit orchestrator dispatch of shaper portfolio-activation mode when the user named it at a gate); realisation work named in the record, not done"}
```

That is the only place on disk where the user's choice of option 2 is recorded. `grep -rn narrowly
shared/history/ circles/260801-1244-curator/history/` returns three hits, all of them downstream
prose (the curator run file quoting the record's own recommendation, and the coder's history naming
the answer it was told to realise) and none of them the gate.

**The ordering claim, checked against timestamps.**

| Moment | Evidence |
|---|---|
| per-Turn `coherence_review`, `verdict ok` | events 12:42:06 |
| `circuit_breaker` (net-negative) and `turn_end` turn 3 | events 12:42:06 |
| Rebalance `gate_response` — "revise Grounding" | events **13:13:35** |
| Turn 4 starts, T9 dispatched | events 13:37:03 |
| `18173e1` committed, the HEAD the reconciler verified against | git 14:26:43 |
| the three defect records the reconciler's `## Coherence` counts | stamps `260814-1450` |
| `260814-1457-reconciliation.md` — "final pass" | its own header, **14:57** |

The reconciler's `review-needed` verdict did not exist when the gate was held, and could not have
triggered it. The verdict was appended afterwards and recommends the option already taken.

**Why this matters beyond tidiness.** This is the record whose realisation is the whole of Turn 4,
and the contract that realisation added says, in `agents/orchestrator.md:355-358`: "record the same
gate answer in your session history. The dispatch prompt persists nowhere; the event log and the
history file are what outlive the session, so a permission that lives only in the prompt leaves no
trace at all." The very gate that established that obligation left its trace in one of the two places
and cited the other.

**Candidate fix.** Repoint the `Answered:` citation at
`orchestrator-events.jsonl` 2026-08-14T13:13:35, or add the answer to
`260813-2345-orchestrator-session.md` `## User decisions recorded this session` — that
section already holds six entries in exactly the right shape — and cite it there. Correct or drop the
"followed the reconciler's `review-needed` verdict" clause; what preceded the gate was the
net-negative circuit breaker and the per-Turn `coherence_review` recorded as `ok`.

**Do not** rewrite the reconciler's `## Coherence` section to match. It is an honest record of a pass
that ran at 14:57 and says so.

**Scope.** One decision record's footer, and optionally one session-history section. Executor:
`coder`, or the orchestrator for the history half (a session history is its own surface).

**Filed by:** coderev, review `260814-1850-coderev-curator-turn-4.md`.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Both halves stand.**

`260813-0027_*_should-the-orchestrator-be-able-to-dispatch-…` still footers `Answered: shared/history/260813-2345-orchestrator-session.md \`## Coherence\` → Rebalance gate, 2026-08-14 — **option 2, narrowly**`. `grep -n 'narrowly'` over that history file returns nothing, and neither `## Coherence` section in it records a user answer — both end at `**Rebalance recommendation:**`. The timing half is unchanged too: the `review-needed` verdict the footer names is the 14:57 pass, 1h44m after the 13:13:35 gate it is offered as the trigger for.

Both files are outside this pass's write scope (`shared/decisions/`, `shared/history/`), so this record is annotated and nothing is corrected.

---
Resolved: fixed — the decision record carries an appended correction naming the `gate_response` and `rebalance_grounding` events at 13:13:35 and the true ordering; 260813-0027_*_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md:179
