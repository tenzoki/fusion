`/fusion:cleanup`'s closing note still says "run it end to end", which the new gate makes false

---

Step P-12 rewrote `## Autonomy and safety` to state that a run typed and walked away from stops at
Step 5 and does not finish. The last bullet of `## Notes for the assistant`
(`skills/cleanup/SKILL.md:252`) still instructs the opposite and was not edited.

---

## Context

The rewritten section (`skills/cleanup/SKILL.md:57`):

> **A run that is typed and walked away from stops at Step 5 and does not finish.** Steps 6, 7 and 8
> never happen [...]
>
> Three hard guardrails hold on every run, gate or no gate:

The unedited note (`skills/cleanup/SKILL.md:252`):

> Match the user's energy: they asked for a one-shot wrap-up. Run it end to end; report once at the
> end, not after every step (unless a guardrail trips).

The parenthetical does not rescue it. The rewritten section separates the gate from the guardrails in
so many words — "gate or no gate" — and the three guardrails it then lists are force-push, `git add
-A`/`git add .`, and secrets. The `CLAUDE.md` gate is none of them, so "run it end to end" reads as
an instruction to pass through Step 5 without stopping.

This is the residual the step's own reasoning was aimed at: the P-12 commit message says the autonomy
sentence "was rewritten rather than softened", and the rewrite reached the section it was about and
not the note eleven lines below it that repeats the same claim in shorter form.

## Suggested direction

Rewrite the bullet around the one stop, e.g. that the run reports once at the end and asks once, at
Step 5. Keep the "don't report after every step" half — that part is still right.
