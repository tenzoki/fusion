# The compliance guard observes and never blocks

---
**Domain:** code
**Status:** active
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_p_the-compliance-guard-becomes-observation-only.md
**Active session history:** circles/260816-1741-guard-becomes-observation-only/history/260816-1841-orchestrator-session.md

---

## Directive

fusion's compliance guard decides nothing after this work. The decision-governed check
(CHECK 3), the consecutive-block counter, the halt and `hooks/clear-halt.ts` are gone from
the shipped plugin, and with them the fusion-repository stand-down and
`isFusionPluginCwd()`. The PreToolUse hook stays registered on the four write tools and on
Bash, allows every call, and goes on writing `guard_allow` rows for the write tools, so the
monitor keeps the write trace it renders today. A consuming project that still carries a
halt from the removed protected-path mechanism is offered its deletion at `/fusion:setup`,
in the same release that removes the clearing script, and a project that never runs Setup
again keeps an inert halt flag in a file nothing reads. The project-root `fusion-guard.json`
is gone, its guard keys are announced as retired the way `guard.protectedPaths` is
announced today, and `orchestrator.maxTurns` has a new home that this Circle decides before
it plans. The shipped text that presents a blocking, halting guard as a live property says
what the guard now is, in code, in the agent prompts and skill bodies, in `README-hooks.md`
and in `docs/philosophy.md`. `CLAUDE.md` and the rule files reach the same state through
`/fusion:curate`, which is their own gated path.

## Grounding snapshot

### The three decisions this Circle executes

All three were answered by the user on 2026-08-16 and are recorded in
`shared/history/260816-1500-orchestrator-session.md` under `## Decisions answered by the user`.

`shared/decisions/260809-1224_*_is-the-decision-governed-escalation-check-3-a-live-feature.md`
was re-opened on its own deferral trigger and answered as option 1, retired. The measurement
the trigger asked for was taken on 2026-08-12 across the reachable consuming projects and came
back zero: neither `krk` nor `unite-co-creator` declares `decisions` or any `guard.category*`
key, and all 50 recorded `guard_block` rows in `krk`'s 37,186 events read `Protected path`.
CHECK 3 and its four configuration keys go.

`shared/decisions/260812-1232_*_does-the-escalation-counter-survive-a-block-source-that-ships-inert.md`
was answered as option 3, in its own Circle, which is this one. Once CHECK 3 goes, the
escalation counter has no input at all: roughly 411 lines in `hooks/lib/escalation.ts` and 295
in `hooks/clear-halt.ts`, a state file, two event types, a monitor row type and an orchestrator
Setup step, behind a halt that nothing can raise. The record's own constraint is the sequencing
this Circle inherits: a project carrying an active halt must be able to clear it, so the removal
of `clear-halt.js` sits behind a migration rather than beside it.

`shared/decisions/260812-1232_*_does-the-write-guards-fusion-repo-stand-down-survive-the-loss-of-its-subject.md`
was answered as option 3, dissolution. With no verdict left in `guard.ts` there is nothing for
the stand-down to stand down, so the branch at `hooks/guard.ts:286-321` goes and
`isFusionPluginCwd()` loses its last caller. `isFusionPluginRoot()` stays, with a comment
stating why it is kept without a caller: `hooks/lib/self-detect.ts` carries the measured rule
that a mechanism is stood down in the coordinate space it keys its state by, and the next
root-anchored mechanism should not have to rediscover it.

### What the user settled at shaping round 1 (2026-08-16)

**Migration.** `/fusion:setup` detects a legacy halt at session start and offers to delete it,
and `clear-halt.js` leaves in the same release. The accepted price is stated rather than
designed around: the offer reaches only projects that run Setup again, and a project that never
does keeps the halt state in a file no shipped code reads. The existing guard check at
`skills/setup/SKILL.md:300` already reads `escalation.json` and already offers to clear, so the
migration is a change of what that step offers rather than a new step.

**The guard afterwards.** The PreToolUse hook stays registered, allows everything, and keeps
writing `guard_allow`. The accepted price is a hook on every tool call that decides nothing.

**The configuration file.** `fusion-guard.json` goes from the project root and
`orchestrator.maxTurns` moves. Where it moves is open, and the user chose this option knowing
that. It is filed as the Circle's own decision record, cited below.

**Text surfaces.** Code, plus the surfaces that would otherwise state something false. The rest
goes to the curator. `docs/philosophy.md` is in scope by name, because its fourth principle
presents the halt as a load-bearing property of the product.

**Two proposals stood unopposed.** The monitor goes on rendering `guard_block` and `guard_halt`
rows from existing event logs, because those rows are evidence of what the guard did while it
did it. The removed configuration keys are announced as retired the way `guard.protectedPaths`
is, rather than falling silent.

### The code sites, measured

| Site | What goes |
|---|---|
| `hooks/guard.ts:286-321` | the fusion-repository stand-down |
| `hooks/guard.ts` CHECK 1 | the halt block and its `guard_halt` row |
| `hooks/guard.ts` CHECK 3 | the decision-governed block, the advisory path and `emitBlockEvent` |
| `hooks/lib/escalation.ts` | 411 lines, the whole module |
| `hooks/clear-halt.ts` | 295 lines, after the migration ships |
| `hooks/lib/self-detect.ts` | `isFusionPluginCwd()` only; `isFusionPluginRoot()` stays |
| `hooks/lib/config.ts` | the guard, decisions and escalation layers of 742 lines |
| `hooks/config.json`, `hooks/config.example.json`, `templates/fusion-guard.json`, `fusion-guard.json` | the guard configuration surface |
| `bin/monitor` | nothing removed; the two row types keep rendering history |

Test files whose subject is being removed: `escalation.test.ts`, `guard-escalation-shape.test.ts`,
`guard-halt-event.test.ts`, `clear-halt-concurrent-halt.test.ts`,
`legacy-halt-clearing.test.ts`, `guard-state-shape.test.ts`, and the guard half of
`config.test.ts`, `guard-project-config-integration.test.ts` and `hook-fail-open.test.ts`.
`legacy-halt-clearing.test.ts` is the one to sequence rather than delete on sight: it pins the
migration path that the Setup offer replaces.

### The text surfaces in scope

`docs/philosophy.md:17` presents the guard denying writes and three blocks raising a halt as a
product property. `agents/orchestrator.md:150` reads `escalation.json` at Setup, `:626` carries
the *Guard halt* circuit-breaker row and `:644` names it again in the unresolved-budget table.
`skills/setup/SKILL.md:171` describes seeding `fusion-guard.json` and `:300` is the guard check
that becomes the migration offer. `skills/help/SKILL.md:111` points a user at escalation
behaviour. `skills/archive/SKILL.md:94` classifies `escalation.json` among the state files, while
its `events.jsonl` sections stay correct and stay put. `README-hooks.md` documents the guard for
users and `README.md` presents it in the product summary.

### Residuals stated rather than designed away

**The curator boundary leaves two surfaces briefly wrong.** `CLAUDE.md` and
`rules/fusion-workbench-conventions.md:79`, which classifies `escalation.json` as live state, are
the curator's surfaces under the user's answer to question 4. They keep a false statement until a
`/fusion:curate` pass runs. The boundary is disjoint by construction: the Circle takes every
surface outside the curator's three, and the curator takes its own.

**The retired-key advisory needs a reader.** The advisory that names a retired key is emitted from
`hooks/guard.ts` off `config.diagnostics`, which `hooks/lib/config.ts` produces. An answer to the
`maxTurns` question that removes the configuration loader entirely also removes the machinery that
announces the retirement. Any answer has to say what still reads a project's leftover
`fusion-guard.json` in order to name it. The decision record carries this as a constraint.

**The Bash zero-side-effect property survives.** `guard_allow` is written on the write-tool path
only. Extending it to Bash would append one row per shell call and bury the very rows the monitor
exists to surface, which is the measured reason recorded in
`shared/issues/260707-0751_*_guard-allow-bash-events-flood-events-jsonl.md`.

**A halted developer session in this repository is a live consequence.** While the stand-down
exists, a halt does not block the write tools in fusion's own tree. Removing the stand-down and
the halt in one Circle removes both sides of that, so nothing about it needs a migration here.

### Open decision this Circle carries

`circles/260816-1741-guard-becomes-observation-only/decisions/260816-1742_o_where-does-the-orchestrators-turn-budget-live-once-the-guard-configuration-file-is-gone.md`
is unanswered, and it is load-bearing for planning rather than for the Directive. Two of its five
options delete `hooks/lib/config.ts`, `hooks/turn-budget.ts` and `bin/fusion-turn-budget`
outright, and three keep them in reduced form. The plan cannot be written until the user answers
it.

## Dependencies

No Circle blocks this one. Three closed Circles are its lineage and hold the measurements it
reasons from, cited rather than copied:

- `circles/260807-0923-guard-misst-statt-orakelt`: the guard stopped predicting shell writes and
  measured them instead.
- `circles/260801-1244-guard-bash-inspection`: the Bash inspection surface and its zero-side-effect
  property.
- `circles/260815-0007-remove-eight-mechanisms-and-cap-growth`: the four growth bounds this work
  is measured under, and the precedent that a removal never trips one.

The protected-path removal of 2026-08-12 has no Circle of its own. Its plan is
`shared/planning/260812-1232_*_remove-the-protected-path-half-of-the-compliance-guard.md`.

## Turn log

## Activation proposal (playmaker run 260816-1822)

**Recommended for activation — playmaker run 260816-1822 (trigger: `user-fusion-next`, domain bias
`code`, git HEAD `3d41d4a`).**

This is the only Circle in the portfolio that is not terminal, and it is the first anticipated
Circle to stand in the store since 260815-2115. It scores clean on both halves of the code-domain
heuristic, and both were measured against disk on this run rather than read off the record.

**Unresolved decisions cited in the Grounding snapshot: zero.** The Grounding cites four decision
records and every one of them carries the answered marker. The three lineage records that this
Circle exists to realise, `shared/decisions/260809-1224_*_is-the-decision-governed-escalation-check-3-a-live-feature.md`,
`shared/decisions/260812-1232_*_does-the-escalation-counter-survive-a-block-source-that-ships-inert.md`
and `shared/decisions/260812-1232_*_does-the-write-guards-fusion-repo-stand-down-survive-the-loss-of-its-subject.md`,
were answered by the user on 2026-08-16 and are recorded in
`shared/history/260816-1500-orchestrator-session.md`. An answered-not-yet-implemented decision is
not a block under the heuristic; it is the input the Circle consumes.

**Dependencies: all closed.** The `## Dependencies` section names no blocking Circle and cites
three closed ones as lineage. Each was resolved to an existing directory and each record carries
the closed-coherent marker: `circles/260807-0923-guard-misst-statt-orakelt`,
`circles/260801-1244-guard-bash-inspection` and
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth`. No partial-block flag is raised.

**What changed in the forty minutes before this run, and it is the whole argument for activating
now rather than later.** The record's own `### Open decision this Circle carries` states that the
plan cannot be written until the Turn-budget question is answered, and names two of its five
options as deleting `hooks/lib/config.ts`, `hooks/turn-budget.ts` and `bin/fusion-turn-budget`
outright. The user answered it at 260816-1742, inline, as option 1: a renamed project-root file,
with the loader and both helpers surviving in reduced form. The record is now
`circles/260816-1741-guard-becomes-observation-only/decisions/260816-1742_*_where-does-the-orchestrators-turn-budget-live-once-the-guard-configuration-file-is-gone.md`
at the answered marker. The one stated obstruction to planning is gone, and the answer bounds the
removal rather than widening it, so the plan this Circle needs is now writable in a single pass.

**The Grounding's measured claims were spot-checked and hold.** `hooks/guard.ts:286-321` is the
fusion-repository stand-down as described, `hooks/lib/escalation.ts` is 411 lines,
`hooks/clear-halt.ts` 295, `hooks/lib/config.ts` 742, and every file named in the code-site table
exists at HEAD. The Circle was shaped today, so its Grounding has not had time to decay; the one
line that already has is named in the portfolio's `## Warnings` rather than here.

**Proposed activation timestamp: 260816-1822.** Activation renames this record from `_a_` to `_t_`
and writes `.active-circle`. Neither is this agent's write. The user commits it through
`/fusion:next`, or the orchestrator does at its own activation step.
