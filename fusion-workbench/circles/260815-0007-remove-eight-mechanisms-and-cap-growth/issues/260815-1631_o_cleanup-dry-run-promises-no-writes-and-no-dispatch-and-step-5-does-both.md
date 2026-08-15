`/fusion:cleanup --dry-run` promises "no writes, no dispatch" and its new Step 5 does both

---

Step P-12 gave `/fusion:cleanup` a `CLAUDE.md` step that dispatches the curator. Under `--dry-run`
that step runs the survey dispatch, and the survey pass writes a run file on every run. Two blanket
statements in the same file still say a dry run neither dispatches nor writes.

---

## Context

The two promises:

- `skills/cleanup/SKILL.md:38` — "`--dry-run` — survey and report what each step *would* do, make no
  writes, no commits, no dispatch. Use this to preview."
- `skills/cleanup/SKILL.md:95` — "If `--dry-run`, announce it now: every subsequent step reports its
  intent but performs no write, commit, dispatch, or push."

What Step 5 now does under `--dry-run` (`skills/cleanup/SKILL.md:188`):

> **`--dry-run` stops after the survey.** Dispatch the survey pass, report the run file's path and
> the per-group counts, ask nothing, and dispatch no apply pass.

And what the survey pass writes (`agents/curator.md:174`):

> Read the eight evidence sources, assign a tier and a citation per candidate change, and write the
> **run file**, which is written on **every** run whether or not anything is later applied. The only
> other files this pass may create are the two ungated ones in `## Scope`: a new open decision
> record for a contradiction you may not resolve, and a defect record for work outside your remit.

So a `--dry-run` dispatches a sub-agent, writes a run file into the history store, and may file a
decision record and a defect record — three writes, in a mode documented as making none.

**The rule genuinely held before this step.** `skills/cleanup/SKILL.md:170` shows Step 3 doing it
correctly: "If `--dry-run`, skip the dispatch and report `$DOMAIN` with its `$DOMAIN_SOURCE`." So
this is a new exception to a convention the file otherwise keeps, not a pre-existing looseness.

**Why it is not merely cosmetic.** `--dry-run` is the flag a user reaches for precisely when they do
not want the pipeline touching anything. Step 5's own reasoning for surveying under dry-run is sound
— a survey that changes nothing is what a preview of that step looks like — but the reasoning has to
reach line 38 and line 95, or the flag's contract is false where a user reads it.

## Suggested direction

Either narrow the two blanket statements to name the survey dispatch and the run file as the one
exception, or have Step 5 under `--dry-run` report that it *would* survey without dispatching. The
first is probably right: the survey is the only thing that makes the dry run informative about this
step at all. Whichever is chosen, lines 38 and 95 must say it.
