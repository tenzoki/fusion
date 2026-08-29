README-agents.md's closing paragraph contradicts its own table row about the executor derivation

---

**Severity:** Medium
**Domain:** code
**Filed by:** `curator`, gate G1 survey run `260815-1706-curator-run.md`
**Owner:** `coder`
**Affects:** `README-agents.md:79`
**Cross-references:**
`260815-0029_*_what-triggers-the-analyst-executor-set-once-strategic-and-knowledge-are-gone.md` (implemented, option 1);
`260815-1447_*_claude-mds-dispatch-parameter-bullet-asserts-orchestrator-behaviour-step-9-inverted-not-just-a-value-list.md` (the same false clause in `CLAUDE.md`, which the curator's ledger carries as entry L05)

---

`README-agents.md` `## Dispatch parameters` is the roster's single authoring home, and it states the
executor-set contract twice, in two places, in opposite terms.

---

**Verified 2026-08-15 at HEAD `5f2171e`.**

The table row is correct:

```
README-agents.md:66
| `planner` | `**Executors:**` | … | orchestrator, on **every** planner dispatch, with no
condition in front of it (`agents/orchestrator.md:396`) | …
```

The closing paragraph, twelve lines below it, is not:

```
README-agents.md:79
… `agents/planner.md` parses no `**Domain:**` line at all; what it takes is `**Executors:**`,
which the orchestrator derives *from* the detected domain and passes as a named executor set.
```

Step 9 (`0894d0d`) deleted exactly that derivation. `agents/orchestrator.md:406` now prefixes
`**Executors:** coder, ontocoder, analyst` on every planner dispatch with no condition, and
`agents/planner.md:27` says in as many words that it is the plan — not the dispatcher — that decides
whether a step needs `analyst`. The detected domain is no longer an input to the executor set at all.

The record that answered this names the rewrite of the `planner` / `**Executors:**` **row** in its
`Implemented:` line. The prose paragraph under the table was not in that sweep.

## Why it is filed rather than fixed

`README-agents.md` is outside the curator's editable surface (`agents/curator.md` `## Remit`,
exclusion 5). The identical clause in `CLAUDE.md:58` is inside it and is on the gate-G1 ledger as
entry L05; approving L05 and leaving this one standing would leave the two documents disagreeing in
the opposite direction from today.

## What it would take

At `README-agents.md:79`, replace `, which the orchestrator derives *from* the detected domain and
passes as a named executor set` with a clause saying the orchestrator passes all three
unconditionally and the routing judgement belongs to the plan — matching the table row at `:66` and
the wording L05 proposes for `CLAUDE.md:58`.

---
Resolved: `README-agents.md:79` rewritten. The clause `, which the orchestrator derives *from* the detected domain and passes as a named executor set.` was replaced with `, which the orchestrator passes on **every** planner dispatch with no condition in front of it. The domain-conditional derivation was deleted on 2026-08-15: whether a step needs `analyst` is a question the plan answers, and no caller upstream of the plan holds the input to answer it.` — the same wording ledger entry L05 landed at `CLAUDE.md:58`, so the two documents now agree with each other and with the table row. The paragraph's closing sentence about the planner's *own* domain parameter was left standing: `260813-1820_*_should-the-planner-accept-a-domain-parameter-that-three-documented-surfaces-already-promise.md` is still open, so "an open design question filed as a decision record" remains true.

One citation in this record is off: the correct table row is at `README-agents.md:62`, not `:66`. The quoted row text is right; only the line number was wrong, and nothing was decided on it.
