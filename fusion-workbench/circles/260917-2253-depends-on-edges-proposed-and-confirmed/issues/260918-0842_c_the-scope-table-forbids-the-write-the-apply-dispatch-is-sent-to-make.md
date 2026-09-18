`## Scope` forbids the edge write on every dispatch that performs it

---

`agents/curator.md` `## Scope` permits the two edge fields to be edited "only on an `**Edges:** on` run". No apply dispatch is one. The pass that performs the approved write is therefore forbidden by the same prompt that defines it.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

## The defect

`agents/curator.md` `## Scope`, the fourth bullet of **You may edit, and only after approval at the gate**:

> - The two edge fields — `**Depends-on:**` and `**Cross-references:**` — in the head of a **live** work item, and only on an `**Edges:** on` run (`## The fourth subject — work-item edges`)

Three places in the same prompt and its skill say the apply dispatch never carries that line:

- `agents/curator.md` `## The fourth subject — work-item edges`: "The apply dispatch carries no `**Edges:**` line at all — it follows the ledger."
- `agents/curator.md` `## Dispatch parameters`, the `**Edges:**` row: "If absent … defaults to `off`".
- `skills/curate/SKILL.md` `## Step 6 — Dispatch the curator to apply`: "The first three non-empty content lines MUST be the three parameters" — `**Mode:**`, `**Ledger:**`, `**Approved:**`, and nothing else.
- `README-agents.md` `## Dispatch parameters`, the `**Edges:**` row: "on the survey dispatch alone".

So on every apply dispatch `**Edges:**` resolves to `off`, and `## Scope` withholds permission for the one write `### Pass 2 — apply` exists to make. An agent that reads `## Scope` as the authority on what it may edit halts or marks every edge entry refused; an agent that reads `### Pass 2 — apply` writes. Nothing in the prompt ranks the two.

The bullet is new in this range (`git show 04a1ed8d:agents/curator.md`, `## Scope` — the old block has three bullets and no edge row). The sibling case does not carry the bug: the relocation bullet beside it names no `**Placement:** on` precondition, although `**Placement:**` is off on the apply dispatch for exactly the same reason.

## Why the qualifier cannot simply be kept

The qualifier states a survey-time property on an apply-time permission. The survey decides *whether an edge is proposed*; the apply pass decides *whether an approved entry lands*, and its own gate on the write is already there and already correct — the three preconditions in `### Pass 2 — apply`, whose second is the liveness check. The `**Edges:** on` clause adds nothing those preconditions do not, and it adds one contradiction.

## Acceptance test

`agents/curator.md` `## Scope` carries no permission whose precondition an apply dispatch cannot satisfy. Concretely: read the edge bullet with the apply dispatch's three parameter lines in hand and the bullet permits the write.

Resolved: `agents/curator.md` `## Scope`, edit bullet 4 no longer conditions the edge write on a dispatch parameter the apply dispatch cannot carry. The qualifier "only on an `**Edges:** on` run" is replaced by the gate that actually holds at apply time — "under the three preconditions `### Pass 2 — apply` states" — and the bullet now says in its own words why no `**Edges:**` precondition may be put back: that parameter governs what the **survey** may propose, an apply dispatch carries no such line at all, and a permission conditioned on it would refuse every entry the gate approved. Nothing is weakened by the removal. The survey-side restriction is unmoved and still authored in `## The fourth subject — work-item edges`; the write-side restriction is unmoved and still the three preconditions, whose second is the liveness check. What the bullet lost is a precondition no dispatch could satisfy, and what it gained is the one a reader can check against the apply dispatch's three parameter lines. Acceptance test met: read with `**Mode:** apply`, `**Ledger:**` and `**Approved:**` in hand, the bullet permits the write.
