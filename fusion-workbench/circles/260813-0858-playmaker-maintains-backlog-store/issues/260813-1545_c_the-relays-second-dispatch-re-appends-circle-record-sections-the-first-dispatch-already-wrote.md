# The relay's second dispatch re-appends the Circle-record sections the first dispatch already wrote

**Filed by:** coderev (review of Circle `260813-0858-playmaker-maintains-backlog-store`, commit `b995049`)
**Severity:** Medium
**Scope:** `agents/playmaker.md` (the confirmed-operations subsection), reached through `skills/next/SKILL.md` Step 5b

## The mechanism

`agents/playmaker.md:207` tells the second run of a relay to *"perform exactly the operations it lists and no others, propose nothing further, regenerate `$PORTFOLIO` so it records what was performed, and stop."*

Regenerating `$PORTFOLIO` is not a local act. `agents/playmaker.md:58` defines it as *"regenerated in full on every run (overwrite)"*, and `## Output — the portfolio` requires all six sections, which means re-running Step 3 (rank), Step 4 (cycles) and Step 5 (bounded-closure propagation). Each of those three appends to Circle records, and none carries an idempotence guard:

- `agents/playmaker.md:182` — *"**Append** a `## Activation proposal` block to the candidate's Circle record."*
- `agents/playmaker.md:141` — *"**append** (do not rewrite) a `## Dependency warning` section"*
- `agents/playmaker.md:149` — *"Append a `## Parent grounding stale` section to the parent's Circle record."*

## The consequence

One `/fusion:next` invocation in which the user approves any backlog operation leaves the top-ranked anticipated Circle's record carrying **two** `## Activation proposal` blocks, stamped a minute or two apart with two different run identifiers — and then Step 6 activates that same record. On a workbench with a dependency cycle or a bounded-closure parent, the duplication reaches those sections too.

The record in this Circle already shows the shape a single such block takes (`.../_t_circle.md`, `## Activation proposal (playmaker run 260813-0926)`); two of them on one record is noise a reader has to reconcile, and the next playmaker run reads the record it is appending to.

## Why the existing wording does not stop it

*"propose nothing further"* is the nearest bound, and it reads as being about **backlog** proposals: the whole surrounding subsection is about the `**Confirmed operations:**` block. Nothing connects it to `## Activation proposal`, which is a Circle-record section governed by a different section of the prompt (`## Activation proposals — never auto-rename`, `agents/playmaker.md:178`–`182`).

## Recommendation

Add one sentence to `### A confirmation carried by the dispatch prompt`: a run holding a `**Confirmed operations:**` block appends **no** section to any Circle record — not `## Activation proposal`, not `## Dependency warning`, not `## Parent grounding stale`. The first run of the relay wrote them minutes ago against the same state, and a second copy is duplication rather than news. The portfolio regeneration still happens; only the record appends are suppressed.

---
Resolved: The clause that sent the second run into the six-section regeneration, and therefore back through Steps 3 to 5, is removed from the opening paragraph. Two paragraphs decide it instead: **Write no Circle record on this dispatch, and rank nothing** — Steps 3, 4 and 5 do not run, none of the three sections is appended, and the sentence says explicitly that 'propose nothing further' governs the backlog proposals while this one governs the appends. And **Regenerate `$PORTFOLIO` from the file you just verified** — Active, Anticipated, Recently closed, Archived and Warnings copied verbatim from the file whose stamp was just checked, only the backlog section rewritten, header freshly stamped. That copy is sound only because of the stamp check, so this fix and the one above hold each other up.
