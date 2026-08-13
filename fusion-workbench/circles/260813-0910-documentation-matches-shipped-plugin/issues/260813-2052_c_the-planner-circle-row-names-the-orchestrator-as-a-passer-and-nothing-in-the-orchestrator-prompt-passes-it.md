The planner's Circle row names the orchestrator as a passer, and no line in the orchestrator prompt passes it

---
`README-agents.md` `## Dispatch parameters`, the `planner` / `**Circle:**` row, says the
parameter is passed by "orchestrator or user". The string `**Circle:**` occurs in exactly
three places in the shipped plugin — `agents/planner.md:13`, `:53` and `:55` — and in no
agent prompt and no skill body as a dispatch. The orchestrator's only planner dispatch,
`agents/orchestrator.md:377`, passes `**Executors:**` and nothing else.
---

## Both sides read

**Documentation side**, `README-agents.md`, the `planner` / `**Circle:**` row's `Passed by`
cell:

> orchestrator or user, to plan an anticipated Circle before it is activated. A name matching
> no directory exits 1 from the resolver and the planner halts rather than re-resolving

**Artifact side**, three reads.

`agents/planner.md:53` declares the parameter and names no passer:

> `**Circle:** <directory-name>` — the Circle this plan belongs to, named by its directory
> […] This is what lets you plan an **anticipated** Circle before it is activated

`agents/orchestrator.md:377`, Step 0b.2, the prompt's only planner dispatch:

> Invoke `planner` with the spec file path (or with the raw request if shaping was skipped).
> When the detected domain (Setup Step 5) is `strategic` or `knowledge`, prefix the dispatch
> prompt with `**Executors:** coder, ontocoder, analyst` on its own line […] For `code` and
> `data` domains, omit the prefix

Searched, not inferred: `grep -rn '\*\*Circle:\*\*' agents/*.md skills/*/SKILL.md` returns
`agents/planner.md:13`, `:53`, `:55`, plus two unrelated hits in
`skills/circle-stash/SKILL.md` (a report field, not a dispatch). The orchestrator prompt does
not contain the string.

Everything else in the row holds: the value form, the absent behaviour, and the exit-1 halt
are `agents/planner.md:53-55` verbatim. The defect is confined to the passer.

## Why it matters

The row's other half is true and useful — a user can pass `**Circle:**` on a direct planner
dispatch, which is what the parameter was built for (`git:994fe05`, "it lets a plan be written
into an anticipated Circle before activation"). Naming the orchestrator beside the user tells
a reader the orchestrator has an anticipated-Circle planning flow. It has none: it plans the
Circle it is running, and `agents/orchestrator.md` never resolves `fusion-paths planner` with
a target. A reader looking for that flow finds nothing and cannot tell whether the gap is in
the prompt or in their reading.

This is the same class of defect the step corrected elsewhere in the same commit — a surface
describing a mechanism the prompts do not have — reintroduced one column over.

## Scope

`README-agents.md` only. `agents/planner.md` and `agents/orchestrator.md` are consistent with
each other; nothing is broken at run time.

## Recommended fix direction

Either drop "orchestrator" from the cell, leaving "user, on a direct planner dispatch", or —
if the orchestrator is *meant* to pass it — that is a prompt change and belongs in an issue
against `agents/orchestrator.md`, not in this cell. Do not resolve it by adding the line to
the orchestrator prompt as part of a documentation pass.

Filed by: coderev (review of Circle Turn 3, range `22f892e..8d87192`, commit `8d87192`).

---

Resolved: 2026-08-13 — the cell now reads "the user, on a direct planner dispatch, to plan an
anticipated Circle before it is activated", and states that no agent prompt and no skill body passes
the line, citing `agents/orchestrator.md:377` as the orchestrator's only planner dispatch and the one
that passes `**Executors:**` alone. Re-confirmed by grep over `agents/*.md` and `skills/*/SKILL.md`:
`**Circle:**` occurs at `agents/planner.md:13`, `:53`, `:55`, and at `skills/circle-stash/SKILL.md:170`
and `:446` as a report field rather than a dispatch; `agents/orchestrator.md` does not contain the
string. The row's other half was left standing after the reading — value form, absent behaviour and
the exit-1 halt are `agents/planner.md:53-55` verbatim. Nothing was added to the orchestrator prompt,
per the issue's own fix direction.
