# Coder — realise decision 260813-0027_*_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md (orchestrator may dispatch shaper portfolio-activation)

**Date:** 2026-08-14
**Agent:** coder
**Status:** Complete
**Source decision:** `260813-0027_*_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md` (shared decision store) — answered option 2, narrowly.

## What was implemented

The decision's realisation list, all three items, in one change across two agent prompts.

### 1. `agents/shaper.md` — both absolute prohibitions become conditional

- **Frontmatter description.** "reachable only by the user running shaper directly with the mode
  contract — no skill or agent dispatches it" became "run by the user directly with the mode
  contract, or dispatched by the orchestrator when the user's answer at a gate named this mode and
  the dispatch prompt records that the user initiated it — no other agent and no skill dispatches
  it". The `/fusion:next` clause is kept: that skill still performs the activation writes itself
  and dispatches nobody.
- **Mode 3.** "user-invoked directly, and only directly … No skill or agent dispatches this mode"
  became "user-initiated, by one of two routes and no third", the second route citing
  `agents/orchestrator.md` `## Re-sharpening an anticipated Circle (shaper portfolio-activation)`
  as the sole carrier of that permission. The playmaker and `/fusion:next` sentences are unchanged,
  so the two agents that genuinely cannot dispatch are still named as unable to.
- **`**Initiated by:**`, a third parameter line**, required on a dispatched run and optional on a
  top-level one. The shaper decides which case it is from an input it actually holds: presence of
  `AskUserQuestion` means top-level, absence means dispatched. Missing on a dispatched run, the
  shaper halts, alongside the existing halt for a missing `**Circle file:**`.
- **`## Tool Discipline`** now enumerates portfolio-activation as a third dispatched shape, so the
  batched-questions channel visibly covers it rather than covering it by silence.

### 2. `agents/orchestrator.md` — the contract that did not exist

New section `## Re-sharpening an anticipated Circle (shaper portfolio-activation)`, placed between
`## Circle head fields` and `## Plane mirror` — beside the activation material it constrains rather
than inside a phase, because the dispatch is not phase-bound. It carries:

- the condition (the user's answer at a gate named the mode; a stale Grounding is a reason to ask,
  never to dispatch),
- the distinguishing rule (below),
- the three parameter lines the dispatch must carry, with `**Initiated by:**` named as the audit
  trail the permission rests on, plus the `shaper_start` / `shaper_done` events and a session-history
  line, because the dispatch prompt persists nowhere,
- the relay obligation, including that every re-dispatch repeats all three parameter lines (a
  re-dispatch dropping `**Mode:**` falls back to the mode-detection heuristic and returns a spec
  instead of a record edit),
- what stays with the orchestrator: the `_a_`→`_t_` rename and the `.active-circle` write, never
  the shaper's, and re-sharpening is explicitly not activation.

Two supporting rows: the `shaper` row of `## Agents the Orchestrator Invokes` names the second
dispatch shape and points at the section; the `shaper_start` / `shaper_done` event rows name the
second dispatch site and what the detail carries for it.

### 3. The distinguishing rule, and where it was put

Written into the orchestrator's contract section rather than given a home of its own. It reads:
can you quote the user's own words choosing it? A gate answer that names re-sharpening is the
evidence; a playmaker recommendation, a reconciler verdict, a stale Grounding or the orchestrator's
own reading are inputs to the question, never substitutes for its answer.

It has exactly one addressee — the orchestrator is the only agent that dispatches — and the
shaper cannot apply it, since the shaper sees only what the dispatch prompt says, not who chose.
A separate home would be a second surface for a single-reader rule, which is the drift the
decision's own constraint 2 warns about. The two prompts therefore carry disjoint halves: the
orchestrator holds the rule that makes `**Initiated by:**` true, the shaper holds the check that
the line is present at all, and halts when it is not.

## The defect this had to avoid

Closed issue `260805-1839_*_der-shaper-portfolio-activation-modus-hat-keinen-erreichbaren-dispatcher-mehr.md`
(guard-rules-write Circle): shaper.md named playmaker and `/fusion:next` as dispatchers, neither
could dispatch, and the mode was unreachable. The inverse — a named dispatcher with no contract —
is avoided by both edits landing in one commit: `shaper.md` names the orchestrator, and
`orchestrator.md` carries the contract that names the condition, the parameter lines and the relay.

## Verification

`cd hooks && npm test` — exit 0, 49 files / 1030 tests passed. Checked specifically:

- the growth-bound golden fixture `hooks/lib/__tests__/fixtures/rules-emission.golden` is unchanged
  and does not appear in `git diff --stat`, as expected: `agents/*.md` are not in the always-on
  rule corpus;
- `hooks/lib/__tests__/path-literal-lint.test.ts` passes — the new `circles/<dir>/_a_circle.md`
  literal is a container root, deliberately outside `TYPE_FOLDERS`.

The orchestrator's `tools:` allowlist already carries `Agent(fusion:shaper)` and `AskUserQuestion`,
so this contract implies no dispatch the allowlist does not cover. Nothing was widened.

## Not done here, by instruction

The decision record itself is untouched and stays `_a_`; the `_a_`→`_i_` transition belongs to the
commit that lands these two files. `skills/next/SKILL.md`, `agents/playmaker.md` and
`rules/circle-records.md` were read but not edited.
