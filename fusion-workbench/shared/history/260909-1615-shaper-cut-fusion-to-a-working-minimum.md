# Shaper session: cut fusion to a working minimum

**Date:** 2026-09-09 16:15
**Agent:** shaper (user-direct, continuation of a clarification round)
**Filed by:** shaper, Kai Stalmann <kai@qantr.com>

## Input

The user's answers to four clarification questions on a cut to fusion's ceremony, with the
depth fixed at tier (d) cumulative. Evidence base: `260909-1047-size-versus-bookkeeping-across-three-projects.md`
and its verification `260909-1345-verification-of-the-size-versus-bookkeeping-analysis.md`,
the second governing where the two disagree.

## What was done

Re-established context cold: read the verification in full, the analysis's findings 7, 8, 11, 12,
17 and 18 and its recommendations, the setup and cleanup skill bodies, the orchestrator's section
structure, the guard hook header and `hooks/hooks.json`, the growth-bound helper and the emission
golden, and the current portfolio and backlog state.

Measured for the spec rather than inherited: the per-dispatch-path totals for all fifteen agents
(agent prompt plus emitted rule set plus `CLAUDE.md`). The coder row reproduces the verification's
phase-ledger figure of 183.8 KiB exactly; the orchestrator path is 380 065 bytes.

Nine capabilities specified. No second clarification round was needed.

## Decisions taken in the spec

- Six agent roles, argued from a write-surface test rather than chosen for the number. The
  coder/ontocoder split survives with its cost named; playmaker, reconciler, bugfixer, shaper,
  taskplanner, consultant, coderev, ontorev and curator do not survive as roles.
- The decision record is the named catcher for the part of the history-file loss that matters.
  The other part, an approach tried and abandoned, is accepted as lost and named as a risk.
- The bound's consuming-project carrier is the PreToolUse hook, which already fires on every
  dispatch; it reports and never refuses. The setup step and the curator were rejected with reasons.
- The flat list replacing the portfolio is the existing backlog store, one file per item, with
  status and claim head fields. The claim is a re-implementation, not a removal.

## One correction owed to the user

The dispatch stated that reconciliation has no `--only` selector and required the spec to name one
of two fixes. The premise is wrong: `reconcile` is in the step-name table that `skills/cleanup/SKILL.md`
calls "the selector's whole vocabulary", so `--only reconcile` works today. What is true is that it
is not among the three selectors that replaced former standalone commands, and not among the four
steps that have bodies of their own, which is what both `CLAUDE.md` and the skill body enumerate.
The spec states the correction and then answers the question anyway, since the pipeline's removal
makes the selector moot: the five passes become five invocations by name.

## Output

The spec: `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` under the shared planning store.

Next: analyst review, then back to the shaper.
