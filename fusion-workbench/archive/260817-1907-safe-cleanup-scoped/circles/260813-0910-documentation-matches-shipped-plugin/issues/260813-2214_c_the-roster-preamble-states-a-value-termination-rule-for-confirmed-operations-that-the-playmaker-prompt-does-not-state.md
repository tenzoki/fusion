The roster preamble states a value-termination rule for `**Confirmed operations:**` that the declaring prompt does not state

---
`README-agents.md:54` gained a clause this Turn: "A value may run past its own line —
`**Draft:**` and `**Confirmed operations:**` both end at the next `**<Keyword>:**` line or at the
end of the prompt." For `**Draft:**` that is `agents/shaper.md:57` verbatim. For
`**Confirmed operations:**` nothing in `agents/playmaker.md` states a termination rule at all: the
parameter is declared at `:207` and shown as a block form at `:209-217`, and neither says where the
value ends. The preamble is the one sentence in a section that otherwise puts a cited line behind
every cell, and half of its new clause has no line to cite.
---

## Both sides read

**Documentation side**, `README-agents.md:54`:

> A value may run past its own line — `**Draft:**` and `**Confirmed operations:**` both end at the
> next `**<Keyword>:**` line or at the end of the prompt.

**Artifact side**, two reads.

`agents/shaper.md:57` states the rule for `**Draft:**` in those words:

> The `**Draft:**` value may span multiple lines; treat it as everything between `**Draft:**` and
> the next `**<Keyword>:**` line (or end of prompt).

`skills/seed-from-plane/SKILL.md:97` restates it from the caller's side: "`shaper` reads it as
everything between `**Draft:**` and the next `**<Keyword>:**` line."

`agents/playmaker.md:207`, the declaration of `**Confirmed operations:**`, states what the block
*means* and not where it ends:

> A dispatch prompt carrying a `**Confirmed operations:**` block means: perform exactly the
> operations it lists and no others, propose nothing further, and stop. The lines are the first
> run's own words, copied rather than paraphrased …

The block form at `:209-217` shows `**Proposal source:**` on the line after the four operation
lines, which is where a reader would *infer* the boundary. Searched: no sentence in
`agents/playmaker.md` names a termination condition for the value, and no other prompt or skill
body states one for this parameter.

The second half of the clause is unreachable for it in any case: the block form always places
`**Proposal source:**` after `**Confirmed operations:**`, so "or at the end of the prompt" never
applies — and a dispatch omitting `**Proposal source:**` is the case the table's own `If absent`
cell at `:62` describes as leaving "the stamp check nothing to read".

## Why it matters

The clause was added so a block-valued parameter could sit in a table whose preamble says "one per
line" — the closure note on
`260813-2052_*_the-dispatch-parameter-roster-omits-the-two-lines-the-playmaker-relay-carries.md`
says exactly that. The widening is right; what it should not do is attribute one prompt's stated
contract to a second parameter whose prompt is silent. The section states its own ground truth two
sentences later ("`Declared at` names the prompt lines each row was read against"), and this
sentence is the only claim in the section that no line supports.

## Scope

`README-agents.md`, one clause. `agents/playmaker.md` and `agents/shaper.md` are correct as they
ship; whether the playmaker prompt *should* state a termination rule for its block is a prompt
question this issue does not answer.

## Recommended fix direction

Attribute the rule where it is stated and describe the other case as what it is: `**Draft:**` ends
at the next `**<Keyword>:**` line or at the end of the prompt (`agents/shaper.md:57`);
`**Confirmed operations:**` is a block whose lines are followed by `**Proposal source:**` in the
form both sides use (`agents/playmaker.md:209-217`, `skills/next/SKILL.md:167-176`). One sentence,
two citations, no inherited contract.

Filed by: coderev (review of Circle Turn 4, range `93388bc..c663a1f`, commit `c663a1f`).

---

Resolved: 2026-08-13 — the preamble at `README-agents.md:54` no longer attributes the shaper's
termination rule to the second parameter. It now states the two bounds separately: `**Draft:**` ends
at the next `**<Keyword>:**` line or at the end of the prompt, cited to `agents/shaper.md:57`, and
`**Confirmed operations:**` is a block "whose declaring prompt states no termination rule", with the
form both sides write cited to `agents/playmaker.md:209-217` and `skills/next/SKILL.md:170-176`.

The prompt was read before the wording was chosen, per the task's instruction. `agents/playmaker.md:207`
declares what the block means ("perform exactly the operations it lists and no others, propose nothing
further, and stop") and says nothing about where the value ends; the fenced form at `:209-217` places
`**Proposal source:**` on the line after the four operation lines and states no rule either. Searched
the whole prompt for a boundary sentence and found none, which is why the preamble now says the rule
is not stated rather than inventing one. `skills/next/SKILL.md:169-177` carries the identical block
from the caller side. No prompt was changed: whether the playmaker prompt *should* state a
termination rule is the open question the issue declined to answer.
