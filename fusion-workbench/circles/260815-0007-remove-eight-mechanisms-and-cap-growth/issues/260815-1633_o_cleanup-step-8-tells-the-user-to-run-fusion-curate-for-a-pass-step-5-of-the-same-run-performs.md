Cleanup's Step 8 still tells the user to run `/fusion:curate` for a pass Step 5 of the same run performs

---

Step P-12 made the `CLAUDE.md` reconciliation Step 5 of `/fusion:cleanup` and deleted the paragraph
that justified naming `/fusion:curate` to the user. The naming itself survives two paragraphs later,
at `skills/cleanup/SKILL.md:243`, where it now advises the user to run by hand the thing the run just
did.

---

## Context

P-12 removed this justification from Step 8:

> Cleanup never consolidates; `/fusion:curate` is the surface that does, and naming that command for
> the user here is the one deliberate exception to "perform the work, don't name the command" at the
> top of this file — a pass that rewrites binding rules is a thing the user asks for, not a thing a
> wrap-up does on their behalf.

and replaced it with:

> It reports the state of the surfaces; Step 5 is what changes them, and only through the gate.

But `skills/cleanup/SKILL.md:243`, in the same Step 8, still ends:

> a project that has never consolidated and a run that found nothing to change are different facts,
> and only the first is a reason to run `/fusion:curate`.

On a full run, Step 5 has already surveyed and gated by the time Step 8 computes this line, so the
consolidation date it reports is either from this run or the user rejected this run's ledger.
Neither is a reason to go and type `/fusion:curate`. On a `--skip claude-md` run the advice is
defensible, but the line does not distinguish the cases.

It also re-opens the "perform the work, don't name the command" rule at the top of the same file
(`skills/cleanup/SKILL.md:20`) without the exception paragraph that used to license it.

## Suggested direction

Point the sentence at the flag rather than the command — `--only claude-md` — or make it conditional
on Step 5 having been skipped. Either way the surviving `/fusion:curate` reference should not be the
only trace of a justification the same step deleted.
