# Shaper session: guard becomes observation-only

**Date:** 2026-08-16
**Status:** Complete
**Mode:** anticipated-circle (dispatched via `/fusion:direct`)
**Result:** `circles/260816-1741-guard-becomes-observation-only/_a_circle.md`

## The draft

The user's draft, verbatim:

> Rückbau des Guard-Sperrapparats: CHECK 3, Eskalationszähler, Halt und der fusion-Repo-Stand-down
> werden entfernt, der Guard wird beobachtend; clear-halt.js erst nach einer Migration für
> Fremdprojekte mit aktivem Alt-Halt.

Domain parameter: `code`. The draft is raw text, not a backlog entry, so no backlog marker moved
and no `Promoted:` line was written.

## Grounding read before the questions

The three decisions the draft names, all answered by the user on 2026-08-16 and recorded in
`shared/history/260816-1500-orchestrator-session.md`:

- `shared/decisions/260809-1224_*_is-the-decision-governed-escalation-check-3-a-live-feature.md`
- `shared/decisions/260812-1232_*_does-the-escalation-counter-survive-a-block-source-that-ships-inert.md`
- `shared/decisions/260812-1232_*_does-the-write-guards-fusion-repo-stand-down-survive-the-loss-of-its-subject.md`

Code read: `hooks/guard.ts`, `hooks/lib/escalation.ts` (411 lines), `hooks/clear-halt.ts` (295),
`hooks/lib/self-detect.ts`, `hooks/lib/config.ts` (742), `hooks/turn-budget.ts`, `hooks/config.json`,
`templates/fusion-guard.json`, `fusion-guard.json`, the guard rendering in `bin/monitor`, and the
test inventory under `hooks/lib/__tests__/`. Text read for the surfaces that state the halt as
live: `docs/philosophy.md`, `agents/orchestrator.md`, `skills/setup/SKILL.md`,
`skills/help/SKILL.md`, `skills/archive/SKILL.md`, `rules/fusion-workbench-conventions.md`.

## Clarifications made

Round 1 put four questions to the user. The answers, and the price accepted with each:

1. **Migration.** `/fusion:setup` detects a legacy halt at start and offers to delete it;
   `clear-halt.js` goes in the same release. Accepted price: it reaches only projects that run
   Setup again.
2. **The guard afterwards.** The PreToolUse hook stays registered, allows everything, and keeps
   writing `guard_allow`. Accepted price: a hook on every tool call that decides nothing.
3. **The configuration file.** `fusion-guard.json` goes and `orchestrator.maxTurns` moves. The
   destination is left open on purpose and filed as this Circle's own decision.
4. **Text surfaces.** Code, plus the surfaces that would otherwise state something false. The rest
   goes to the curator. `docs/philosophy.md` is in scope by name.

Two shaper proposals stood unopposed: the monitor keeps rendering historical `guard_block` and
`guard_halt` rows, and the removed configuration keys are retired loudly, the way
`guard.protectedPaths` is.

## No round 2 was asked for

The open question from answer 3 is the destination of `orchestrator.maxTurns`. It was filed as
`circles/260816-1741-guard-becomes-observation-only/decisions/260816-1742_o_where-does-the-orchestrators-turn-budget-live-once-the-guard-configuration-file-is-gone.md`
with five options, five constraints and no recommendation, which is what the user asked for. The
Directive does not depend on the answer; the plan does, and the record says so. Asking a second
round would have closed a question the user had deliberately left open.

## What was written

| Path | What it is |
|---|---|
| `circles/260816-1741-guard-becomes-observation-only/` | the Circle directory and its six artifact subdirectories |
| `circles/260816-1741-guard-becomes-observation-only/_a_circle.md` | the anticipated Circle record |
| `.../decisions/260816-1742_o_where-does-the-orchestrators-turn-budget-live-once-the-guard-configuration-file-is-gone.md` | the open decision the Circle carries |
| `.../history/260816-1742-shaper-guard-becomes-observation-only.md` | this file |

Nothing outside the new Circle was written or renamed.

## Residuals recorded in the Circle

Four, each stated rather than designed away: the curator boundary leaves `CLAUDE.md` and one
sentence of `rules/fusion-workbench-conventions.md` briefly wrong; the retired-key advisory needs
a reader that two of the five budget options would delete; the Bash zero-side-effect property
survives, so `guard_allow` stays on the write-tool path only; and the halted-developer-session
consequence in fusion's own tree disappears with the stand-down and the halt together.

---

## Decision answered by the user, 2026-08-16 (orchestrator, inline)

**`260816-1742_o_where-does-the-orchestrators-turn-budget-live-once-the-guard-configuration-file-is-gone.md`
— option 1, a renamed project-root file.**

`orchestrator.maxTurns` moves to a renamed file at the project root (working name `fusion.json`).
The three-layer merge survives with the guard layers cut out and the loader keeps one leaf. The
setting stays git-tracked at the project root, which is the property the `_gitTracked` note
argues for, and the retired-key advisory keeps its natural reader, so the first constraint on the
record is satisfied without a replacement mechanism: `hooks/lib/config.ts` survives and goes on
producing the diagnostic that names a leftover `fusion-guard.json`.

Costs the user accepted, stated in the record and not designed away: a 742-line configuration
module and a three-layer merge survive to carry one integer, and every consuming project renames
a file for no gain of its own.

Consequences for planning, which was blocked on this:

- `hooks/lib/config.ts`, `hooks/turn-budget.ts` and `bin/fusion-turn-budget` are **kept in reduced
  form**, not deleted. The removal is the smaller of the two shapes the record described.
- `DEFAULTS` in `hooks/lib/config.ts` stays the single site of the default. No new single site has
  to be named.
- The unresolved-budget branch in `agents/orchestrator.md` Setup Step 2 and Step 3d keeps working
  unchanged: the helper survives, so it can still fail in a way the orchestrator detects.
- The `[ -x ]` guard convention at both call sites of `bin/fusion-turn-budget` is unaffected.
- This repository's own value of 12 migrates into the renamed file.
- The migration for consuming projects is a rename of their `fusion-guard.json`, which needs a
  position of its own: whether it is offered at `/fusion:setup` alongside the legacy-halt offer,
  or left to the upgrade note.
