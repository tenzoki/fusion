Setup's domain-detection bullet names two retired inputs and two of the three agents that take the parameter

---
`skills/setup/SKILL.md:301` describes the workbench-domain heuristic as *"the
`decisions_count`/`analyses_count`/`code_files`/`data_files` block"* and says the detected domain is
passed *"to `taskplanner` and `reconciler` dispatches"*. Two of those four inputs are retired and no
branch reads them, and the agent list is missing `playmaker`. Both halves were true when written and
are false at HEAD.

---

## The inputs

`hooks/lib/domain-cascade.ts:113` declares the readable set:

```
export const COUNT_NAMES = ["code_files", "data_files", "counted_by"] as const;
```

and `:117-122` declares the other two explicitly as retired — *"Inputs only the retired branches
read. Not readable; still recognisable."*:

```
export const RETIRED_COUNT_NAMES = ["commits", "analyses_count", "issues_count", "decisions_count"];
```

The two the skill body names as the block's inputs are the two the cascade may not read, and
`counted_by`, which it may, is absent from the bullet.

## The agent list

`CLAUDE.md:16` and `README-agents.md` `## Dispatch parameters` both state that `**Domain:**` changes
behaviour in **three** agents: `taskplanner`, `reconciler` and `playmaker`. `agents/orchestrator.md`
Setup Step 5 passes it to all three. This bullet names two.

## Why no gate caught it

`hooks/lib/__tests__/domain-cascade.test.ts:866` selects statement units naming two or more domain
literals, and this line names none — it delegates to `agents/orchestrator.md` Setup Step 5 rather
than restating the cascade, which is the right shape and is exactly what puts it outside the gate.
`derivable-enumerations-lint` reads skill-directory names, not agent names. Nothing reads a prose
paraphrase of a count-name set.

**The delegation is why this is not the `260805-1830` defect returning.** Step 5 reads
`bin/fusion-count-sources` first and never reaches a retired branch, so the *behaviour* is right. What
is wrong is a bullet that tells a reader what the block reads, incorrectly, in the one document a
user runs before anything else.

## Fix direction

Name the readable set (`code_files`/`data_files`/`counted_by`) or drop the parenthetical entirely and
let the delegation carry it — the second is cheaper and cannot go stale again. Add `playmaker` to the
agent list.

**Found by:** reconciler (supporting analyst pass), verifying the closure of
`260805-1830_*_die-domaenenheuristik-meldet-strategic-trotz-cargo-workspace-mit-laufenden-tests.md`.
That closure holds; this is a separate surface the record never named.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `skills/setup/SKILL.md:323` still names the retired `decisions_count` and `analyses_count` (both in `RETIRED_COUNT_NAMES` at `hooks/lib/domain-cascade.ts:113`) and still omits `playmaker`, which `agents/orchestrator.md:847` does pass the parameter to. Marker stays open. Log: `260817-1836-reconciliation.md`.

---
Resolved: fixed — the parenthetical naming the inputs is dropped so the delegation carries it, and `playmaker` joins the two agents named; `skills/setup/SKILL.md:443`
