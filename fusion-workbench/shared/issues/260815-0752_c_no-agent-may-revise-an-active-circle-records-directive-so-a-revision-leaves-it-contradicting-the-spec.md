No agent may revise an active Circle record's Directive, so a mid-Circle revision leaves the record contradicting the approved spec

---

The user revised the Directive of an active (`_t_`) Circle mid-session. Nothing in fusion is permitted to write the change into the Circle record, so the record's `## Directive` section now states the opposite of what is in force, under a `**Active spec/plan:**` field pointing at the spec that says otherwise.

This is a fusion defect, not a project one. It is filed in the consuming project's store because that is where it was met; whoever carries it upstream should move it.

---

**Class:** contract
**Consumption site:** `agents/orchestrator.md` `## Scope` → "You may ... Write Circle-record **content** in exactly these three places and nowhere else" (the Closure note, the Turn log entry, the three head fields), with "every other section, and any full-content rewrite, remains off-limits"
**Grep key:** `Write Circle-record`
(read at `$FUSION_PLUGIN_ROOT/agents/orchestrator.md`, fusion 8.2.0)

## The gap

Two parties could write a Circle record's `## Directive`, and neither covers this case:

- **The orchestrator** is forbidden it explicitly. Its three permitted content writes are the Closure note, the Turn log, and the head fields.
- **The shaper's portfolio-activation mode** is named in `agents/orchestrator.md` as "the only sanctioned writer of a Circle record's `## Directive` and `## Grounding snapshot` sections". Its own contract (`agents/shaper.md` mode 3) scopes it to **anticipated** Circles, re-clarifying a Directive ahead of activation. An active Circle is outside it, and its dispatch parameter is a `_a_circle.md` path.

So a Directive revision on an active Circle — which `agents/orchestrator.md` itself provides for, as the Rebalance gate's **Revise Directive** option — has no writer for the record it revises. The Rebalance option re-enters shaping and produces a new spec, and the spec is where the revised Directive lands; the Circle record it belongs to is never updated.

## Why it matters more than it looks

The Circle record is what `/fusion:next`, `playmaker` and every later reader open first. A record whose Directive contradicts its own `**Active spec/plan:**` is worse than one that is merely out of date: a reader who trusts the record acts on a Directive the user has explicitly reversed. In this instance the stale text says the Circle *deliberately does not promise* an editable plan after a run, while the approved spec makes that editability binding.

The `**Status:**` head field has a precedent for this shape — it duplicates the marker and can contradict it — and `agents/orchestrator.md` names the marker as the truth where they disagree. There is no equivalent statement for the Directive, and no equivalent of "the marker is the truth" to fall back on, because the spec is a different artifact rather than a second encoding of the same fact.

## Candidate answers, not a recommendation

1. Widen the shaper's portfolio-activation mode to active Circles, keeping the user-initiated condition the orchestrator already carries for dispatching it.
2. Add a fourth permitted content write to the orchestrator: the `## Directive` section, only when a Rebalance Revise-Directive has been taken and only citing the approved spec.
3. Declare the record's Directive a pointer rather than a copy once a spec exists, so `**Active spec/plan:**` is the single source and the section carries a reference instead of prose.

Option 3 is the only one that removes the duplication rather than assigning it a maintainer, and duplication with a maintainer is what the `**Status:**` field already demonstrates decaying.

## Worked instance

Circle `circles/260814-1228-one-flow-mandate-to-process-control`, 2026-08-15. The Turn log entry for the revision records the gap and points here, which is the only mitigation available inside the current rules: the Turn log *is* a permitted orchestrator write, so the contradiction is at least declared beside the text that carries it.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `agents/shaper.md`-s portfolio-activation mode is still scoped to an anticipated Circle ahead of activation, and `agents/orchestrator.md:236` still permits exactly three Circle-record content writes, none of them a mid-Circle Directive revision. None of the three candidate answers was adopted. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
Resolved: 2026-08-18, candidate answer **3 together with 1** — the plan
`shared/planning/260818-1512_*_the-circle-records-directive-becomes-a-pointer-and-gains-a-writer.md`,
all seven steps, from decision
`shared/decisions/260818-1504_*_how-does-a-circle-record-carry-its-directive-once-a-spec-exists-and-who-may-correct-it-before-one-does.md`
(option 1). The duplication is removed rather than given a maintainer: a record's `## Directive`
holds prose **if and only if** its `**Active spec/plan:**` reads `(none yet)`, and where the field
cites a file the section carries a fixed pointer to the field
(`rules/circle-records.md` `### The Directive is a pointer once a spec exists`). The gap that had no
writer is closed at the same time: the shaper's portfolio-activation mode now accepts a `_t_` record
and takes `**Scope:** directive-only | spec`, so an active Circle whose Directive is wrong has a
sanctioned writer under the user-initiated condition the mode already carried. The orchestrator
gains the fourth content write named in candidate 2, but narrowed to the fixed literal — it removes
the record's independent statement of intent and never authors one.

The `**Status:**` precedent this record cites as the shape of the failure is gone with it: the field
was dropped from the template in the same change (decision
`shared/decisions/260815-2312_*_should-the-circle-records-status-field-exist-at-all-now-that-both-transitions-maintain-it.md`).

**The worked instance is not repaired, deliberately.** `circles/260814-1228-one-flow-mandate-to-process-control`
is terminal, no migration converts an existing record, and converting that one would delete the
evidence this record points at. The plan argues it under `**2. The transition.**`
