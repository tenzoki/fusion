# Where does the orchestrator's Turn budget live once the guard configuration file is gone?

---
**Domain:** code
**Status:** answered
**Filed by:** shaper (anticipated-circle mode, shaping round 1)
**Cross-references:**
`circles/260816-1741-guard-becomes-observation-only/_a_circle.md` (the Circle this question is carried by),
`shared/decisions/260812-1232_*_does-the-escalation-counter-survive-a-block-source-that-ships-inert.md` (the removal that empties the file),
`hooks/lib/config.ts:254-272` (`DEFAULTS`, where `maxTurns: 5` is defined once),
`hooks/turn-budget.ts:81-87` and `bin/fusion-turn-budget` (the only reader),
`agents/orchestrator.md` Setup Step 2 and Step 3d (the unresolved-budget branch and what it costs),
`fusion-guard.json` `_turnBudget` (the note that documents the key today)

---

## Question

The user chose, at shaping round 1 of this Circle on 2026-08-16, that `fusion-guard.json`
disappears from the project root along with the guard keys it carries. That leaves
`orchestrator.maxTurns` without a home. It is the one setting in that file which configures
something other than the guard: the number of Turns the orchestrator's Phase-2 loop may run
before its Max-Turns circuit breaker exits and reports what is left. This repository sets it to
12; the shipped default is 5, defined once in `hooks/lib/config.ts`.

The answer decides how much of this Circle's removal reaches. Two of the options below delete
`hooks/lib/config.ts`, `hooks/turn-budget.ts` and `bin/fusion-turn-budget` outright, and three
keep them in reduced form. A plan cannot be written for the Circle until the question is
answered, which is why it is filed at shaping rather than left to planning.

The user chose the option that raises this question in full knowledge that it was unanswered,
and asked that it be recorded rather than settled by assumption.

## Options

1. **A renamed project-root file, for example `fusion.json`.** The three-layer merge survives with
   the guard layers cut out, and the loader keeps one leaf.
   - Pros: the setting stays git-tracked at the project root, which is the property the
     `_gitTracked` note argues for. The existing merge, validation and advisory machinery keeps
     working with no new mechanism. It gives the retired-key advisory a place to live, so a
     project's leftover `fusion-guard.json` can still be named.
   - Cons: a 742-line configuration module and a three-layer merge survive to carry one integer.
     It also asks every consuming project to rename a file for no gain of its own.

2. **A new file inside the workbench, for example `fusion-workbench/config.json`.**
   - Pros: fusion's own state and configuration sit together, and the workbench is the directory a
     project already accepts fusion writing into.
   - Cons: it crosses the tracked/untracked split the workbench conventions draw. A setting that
     belongs in a diff would sit in a directory a project may legitimately ignore, and the
     `.fusion-setup` marker is the precedent for how badly an ignored workbench file behaves.

3. **A declaration line in `CLAUDE.md`, read the way `**Language:**` is read.**
   - Pros: the orchestrator already reads `CLAUDE.md` at Setup Step 3, and the project already
     declares things there under a rule that owns the resolution and its fallbacks. Both
     `hooks/lib/config.ts` and `bin/fusion-turn-budget` disappear, and the number is set where a
     reader looks for project facts.
   - Cons: it puts a machine-read setting into a prose file, and `CLAUDE.md` is under the growth
     pressure the curator exists to relieve. The unresolved-budget branch in
     `agents/orchestrator.md` Step 3d was built around a helper that reports a resolution failure;
     an agent reading a line for itself has no comparable failure signal to report.

4. **Drop the configurability. The default is the only value.** A project that wants a different
   bound answers the per-Turn check-in the orchestrator already runs when the budget is unresolved.
   - Pros: the largest removal available, and it takes the loader, the helper and the wrapper with
     it. The mechanism that bounds the loop when configuration fails already exists and is
     specified.
   - Cons: it removes a setting this repository actually uses, and the check-in is a question per
     Turn rather than a number set once. A project that wants 60 Turns answers 60 questions.

5. **Keep the guard configuration file under its current name for this one key.** The guard keys are
   retired inside it and only `orchestrator.maxTurns` stays live.
   - Pros: no migration for consuming projects, and the retired-key advisory has its natural
     reader.
   - Cons: it contradicts the user's round-1 answer, and it leaves a file named for a mechanism it
     no longer configures. Listed so the option the user ruled out stays visible.

## Constraints

- **Any answer must say what still reads a project's leftover `fusion-guard.json`.** The advisory
  that names a retired key is emitted from `hooks/guard.ts` off `config.diagnostics`, produced by
  `hooks/lib/config.ts`, and `bin/fusion-turn-budget` prints the same diagnostics to stderr at
  every Setup. The user's standing instruction is that the removed keys are retired loudly, the
  way `guard.protectedPaths` is. Options 3 and 4 remove the module that produces that diagnostic,
  so they owe a minimal reader that names the retired file, or an explicit statement that the
  announcement is dropped.
- **The default stays defined in exactly one place.** It is `DEFAULTS` in `hooks/lib/config.ts`
  today, and it is deliberately absent from `hooks/config.json` and from every agent prompt. An
  answer that deletes that module names the new single site.
- **The unresolved-budget branch must keep working.** `agents/orchestrator.md` Setup Step 2 and
  Step 3d specify what the orchestrator does when the budget does not resolve: it substitutes no
  number, shows `<current>/--`, treats the Max-Turns row as not evaluable and asks the user at
  every Turn boundary. Whatever reads the budget must be able to fail in a way the orchestrator
  can detect and report.
- **This repository's own value of 12 must survive the move**, or the move states that it does not
  and why.
- `bin/fusion-turn-budget` is called under an `[ -x ]` guard by both callers, per decision
  `shared/decisions/260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`.
  An answer that keeps a helper keeps that convention; an answer that removes one removes two
  guarded call sites with it.

## Recommendation

None. The trade is between how much configuration machinery fusion carries and how a project sets
one number, and the four live options differ mainly in how much of the loader survives. That is a
judgement about what fusion wants to keep offering, not a technical question the filing agent can
close.

Option 5 is the one to rule out first, because the user has already ruled it out; it is recorded
so a later reader does not mistake its absence for an oversight.

---
Answered: circles/260816-1741-guard-becomes-observation-only/history/260816-1742-shaper-guard-becomes-observation-only.md `## Decision answered by the user` — option 1: a renamed project-root file; the loader, hooks/turn-budget.ts and bin/fusion-turn-budget survive in reduced form, DEFAULTS stays the single default site, and the retired-key advisory keeps its reader. User answered inline 2026-08-16.
Implemented:
Deferred:
Superseded by:
