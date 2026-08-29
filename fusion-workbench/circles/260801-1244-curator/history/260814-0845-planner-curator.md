# Planning session: the curator and the always-on growth bound

**Date:** 2026-08-14
**Agent:** planner
**Circle:** `260801-1244-curator`
**Status:** Complete

---

## Task

Produce the implementation plan for the curator Circle from `260814-0738_*_spec-curator.md`, settling the ten questions the spec's `## Open for Planner` section left to the planner, and planning C10 against the answered arming decision rather than against the open question two surfaces still describe.

## Inputs read

- The spec, in full.
- The two lag defects filed in the Circle, `260814-0813_*_the-circle-records-title-and-dependencies-still-describe-the-conventions-file-as-the-validation-case.md` (the record's stale title and Dependencies) and `260814-0828_*_the-grounding-and-the-spec-still-call-the-growth-bound-decision-open-after-it-was-answered.md` (the Grounding and the spec still calling the arming question open).
- The answered decision `260814-0738_*_how-is-the-always-on-growth-bound-armed-when-the-corpus-is-already-over-budget.md`, treated as binding over the spec's `## User Decisions Pending`, as the defect instructs.
- The Circle record's `## Directive`, `## Grounding snapshot` and `## Dependencies`. The title was not read as scope.
- `hooks/lib/__tests__/rules-emission-golden.test.ts` in full, including its doctrine header, `RULE_BASELINE`, `ROLES` and the three hard gates.
- `bin/fusion-rules`, `bin/fusion-paths`, `hooks/lib/__tests__/path-literal-lint.test.ts`, `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`, and the agent and skill enumerations in `context-manifest.test.ts` and `fusion-paths.test.ts`.
- `agents/reconciler.md`, `agents/analyst.md`, `agents/consultant.md`, `skills/revise-claude-md/SKILL.md`, `skills/next/SKILL.md`, `skills/cleanup/SKILL.md`, `README-agents.md`, `templates/fusion-guard.json`.

## Measurements taken, not carried forward

Measured at HEAD `e321a54` on 2026-08-14:

| What | Value | How |
|---|---|---|
| Universal core emitted | 86 466 bytes | `wc -c` over the five always-on files |
| Universal core floor | 63 654 bytes | `RULE_BASELINE` summed over the same five |
| Core overshoot | 10 812 bytes over the 75 654 budget | arithmetic; agrees with the spec's core-only row |
| `circle-records.md` growth | 11 958 against a 9 302 baseline | `wc -c` |
| `workbench-stash-and-lock.md` growth | 12 957 against 9 250 | `wc -c` |
| `design-diagrams.md` growth | 5 673 against 5 673, unchanged | `wc -c` |
| Decision records on disk | 83, of which 55 implemented, 15 answered, 9 open, 4 deferred, none superseded | `find` plus a marker read off each filename |
| Defect records on disk | 512 | `find` |
| Agent-count claims falsified by a seventeenth agent | 32 in 9 files, of which 5 are lint-asserted | `grep` |

The decision corpus stood at 82 when the spec measured it a day earlier and at 83 now. The plan states the count the run must report rather than fixing a figure, which is the spec's own derive-over-correct rule applied to the plan's text.

## What was produced

- **The plan**, `260814-0845_*_plan-curator.md`. Five implementation steps, every one assigned to `coder`, plus a validation run for C11 that is deliberately not an executor step. Three Mermaid diagrams: the gate-crossing architecture, the growth-bound decomposition, and the step dependency graph.
- **One decision record**, `260814-0845_*_are-the-sixteen-agent-claims-corrected-or-derived-away.md`. Whether the thirty-two "sixteen agents" claims are corrected in place or restructured so the count is not written down. Filed rather than settled in the plan because it binds every future agent addition, and because the project's own derive-over-correct doctrine speaks against the reflex answer.

## The ten spec questions, as settled

1. The procedure lives in the agent prompt; the skill is thin.
2. The gate is crossed through the run file, in all three invocation shapes; the apply pass re-verifies each entry's before-text against disk.
3. Git history is read in full on every run; the previous run's HEAD bounds only the interval report.
4. No new rule pattern and no new always-on byte; `curator` joins the `PATTERNS=""` arm, so its role key is one `ROLES` already carries.
5. The gate prompt names the run file and the per-group counts, never the ledger; entry ids give per-entry granularity inside the eight-line cap.
6. The archive is read at `$WORKBENCH/archive` with no resolver change.
7. The hard bound is an assertion in the existing golden test, sharing one growth function with the report over two disjoint file sets.
8. The arming re-baseline is recorded on four surfaces: an inline comment per core entry, a dated arming entry in the cut log, an amended re-baselining section naming both permitted events, and the gate's own failure message.
9. Readable, absent and unreadable are three disjoint branches; unreadable evidence is handled as missing evidence, which downgrades the finding to a candidate.
10. C11 reports the pairs its stated selection rule reached, with the rule named, and never a completeness the corpus size forbids.

## Judgement calls worth flagging

- **The Decidability line is the substance of this plan, not a formality.** Tier 1 is decidable, Tier 2 only in the positive direction, Tier 3 not at all as posed. The mechanism the spec already chose answers a substitute question the inputs can settle, namely whether a citation of the required kind exists and resolves, and puts a user gate behind every judgement built on one. The residual, an LLM reading two prose passages, is named in the plan's risk table rather than papered over.
- **C11 is not assigned to an executor**, because neither `coder` nor `ontocoder` can perform it. The curator performs it, invoked by the user. The plan carries it as a separate section and says so.
- **The golden fixture goes to `coder`** although the routing rule names fixture data as `ontocoder`'s. Its role is a pinned measurement regenerated by the test's own command, so it belongs in the same step as the emission change that moves it. The reasoning is stated in the plan's `## Executor routing`.
- **The suite is red between steps 1 and 2** and cannot be otherwise: the reference-resolution lint fails on a citation of a file that does not exist, and the golden test fails on an agent `bin/fusion-rules` does not know. The two steps belong in one working session, which the plan states.
