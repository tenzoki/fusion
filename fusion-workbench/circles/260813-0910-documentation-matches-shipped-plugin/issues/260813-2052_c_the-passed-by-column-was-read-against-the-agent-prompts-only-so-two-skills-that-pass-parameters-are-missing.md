The Passed-by column was read against the agent prompts only, so the two skills that pass parameters are missing from four cells

---
`README-agents.md` `## Dispatch parameters` carries a `Declared at` column citing
`agents/*.md` and a `Passed by` column citing nothing. Four of its eleven cells name fewer
passers than ship: `/fusion:cleanup` passes `**Domain:**` to the reconciler
(`skills/cleanup/SKILL.md:147`) and `/fusion:seed-from-plane` passes `**Mode:**`,
`**Draft:**` and `**Domain:**` to the shaper (`skills/seed-from-plane/SKILL.md:87-93`).
Neither skill appears anywhere in the section.
---

## Both sides read

**Documentation side**, `README-agents.md` `## Dispatch parameters`, four `Passed by` cells:

| Row | Cell as written |
|---|---|
| `reconciler` / `**Domain:**` | "orchestrator at Phase 3" |
| `shaper` / `**Mode:**` | "the user directly for `portfolio-activation`; `/fusion:direct` for `anticipated-circle`" |
| `shaper` / `**Draft:**` | "`/fusion:direct <draft>`" |
| `shaper` / `**Domain:**` | "`/fusion:direct`. Anticipated-circle mode only …" |

**Artifact side**, two skill bodies.

`skills/cleanup/SKILL.md:147`, Step 3:

> `Agent(fusion:reconciler)` with the dispatch prompt prefixed by `**Domain:** $DOMAIN` on
> its own line.

`skills/seed-from-plane/SKILL.md:87-93`, Step 5:

> Use the `Agent` tool with target `fusion:shaper`. The dispatch prompt's first non-empty
> content lines MUST be the mode + draft + domain parameters, in that order.
>
> ```
> **Mode:** anticipated-circle
> **Draft:** <the Plane story's title on the first line, then its description>
> **Domain:** <detected-domain>
> ```

`skills/cleanup/SKILL.md:146` names the same set from the other side — "the same fallback
`/fusion:next`, `/fusion:direct` and `/fusion:seed-from-plane` take" — so four skills obtain
a domain and pass it on, and the table credits two of them.

## The cause, and why it is one defect rather than four

The `Declared at` column cites `agents/*.md` and nothing else, and the step's own history
record (`history/260813-2043-coder-…`) lists what each row was read against: sixteen agent
prompts and `bin/fusion-paths`. No skill body is in that list. The `Passed by` column is the
one column whose ground truth lives outside the agent prompts, and it was populated from the
prompts anyway — the passers it names are the ones an agent prompt happens to mention
(`agents/shaper.md:57` names `/fusion:direct`, `:47` names the user). Where a prompt names no
passer, the cell inherits whatever the prompt implies.

## Why it matters

`Passed by` is the column a maintainer uses to answer "if I change this parameter, what
breaks". Answered from this table, a change to `**Draft:**`'s spelling reaches
`/fusion:direct` and misses `/fusion:seed-from-plane`, which passes the same three lines
verbatim and would break silently — the shaper halts with a contract violation
(`agents/shaper.md:104`) and the Plane seeding path stops working.

## Scope

`README-agents.md` only. Both skills are correct as they ship.

## Recommended fix direction

Read the four cells against the skill bodies and add the missing passers. Consider giving
`Passed by` its own citation, the way `Declared at` has one, so the next pass over the table
has a stated ground truth for that column instead of the agent prompts by default.

Filed by: coderev (review of Circle Turn 3, range `22f892e..8d87192`, commit `8d87192`).

---

Resolved: 2026-08-13 — the `Passed by` column was re-read against all sixteen `skills/*/SKILL.md`
bodies and the dispatching sections of `agents/*.md`. Four cells gained the missing passer: the
reconciler's `**Domain:**` gained `/fusion:cleanup` Step 3 (`skills/cleanup/SKILL.md:147`), and the
shaper's `**Mode:**`, `**Draft:**` and `**Domain:**` each gained `/fusion:seed-from-plane`
(`skills/seed-from-plane/SKILL.md:92`, `:93`, `:94`, `:97`). Every other cell now cites the line it
was read against too — `agents/orchestrator.md:377`, `:392`, `:438`, `:649`, `:850`, `:1397`,
`skills/next/SKILL.md:103`, `skills/direct/SKILL.md:70-72`, `agents/shaper.md:45`, `:47`. The
section preamble now states this column's own ground truth, so the next pass over the table does
not inherit the agent prompts by default.

One residual, found in the same reading and deliberately not resolved here: the `shaper` /
`**Parent task:**` cell names the orchestrator, and `agents/orchestrator.md` contains no such line.
Unlike the `**Circle:**` case, the attribution has an artifact-side source — the declaring prompt
itself, `agents/shaper.md:45`, says the orchestrator dispatches with it optionally. The cell now
cites that source and says the orchestrator's own prompt names no such line, so a reader can see
which side the claim rests on. Whether the orchestrator should carry the line is a prompt question,
not a `README-agents.md` one.
