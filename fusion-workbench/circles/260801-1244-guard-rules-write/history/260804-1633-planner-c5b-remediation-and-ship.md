# Planner — the C5b remediation plan and the path to the ship

**Date:** 2026-08-04 16:33
**Agent:** planner
**Status:** Complete
**Circle:** `260801-1244-guard-rules-write`
**Dispatched by:** orchestrator, after the independent assessment concluded the Circle must not ship
**Executors parameter:** absent from the dispatch prompt, so the default set `[coder, ontocoder]` applies. No strategic-domain step was written, so `analyst` was not needed.

## What was asked

A plan taking this Circle from its current state to shippable, scoped to the ship rather than to all twenty-nine open defects, with the deferrals named and costed rather than silently absorbed.

## What was produced

- **Plan:** `260804-1633_*_plan-c5b-remediation-and-ship.md`. Eight steps, two Mermaid diagrams (the configuration seam with each finding located, and the work-order graph with the ship gate marked).
- **Two blocking decision records**, both filed to this Circle per the Origin Rule:
  - `260804-1630_*_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md`
  - `260804-1631_*_may-a-project-file-set-guard-enabled-and-switch-the-whole-guard-off.md`
- **One deferred decision record**, carrying the half of `260804-1432_*_two-case-sensitive-matches-lib-paths-calls-unreachable-become-project-reachable-with-the-c5b-loader.md` that is a choice rather than an edit: `260804-1632_*_should-findrelevantdecisions-fold-case-now-that-a-project-can-configure-categorypaths.md`.
- **One new defect**, found while planning: `260804-1633_*_the-omission-defect-is-latent-in-four-more-top-level-keys.md`.
- **One defect closed**: `260804-1608_*_`, by correcting the predecessor plan's Step 7 marker and `**Status:**` header in place.

## The new defect, and how it was found

Defect `260804-1601_*_a-partial-guard-object-silently-removes-every-protected-path.md` reports that a partial `guard` object empties `protectedPaths`, because an omitted leaf falls back to `DEFAULTS` and `DEFAULTS.guard.protectedPaths` is the empty list. The rule is not scoped to that key: it applies to `escalation`, `churn`, `crossFile` and `decisions` identically.

Compared leaf by leaf at HEAD `53b3765`: `hooks/config.json` and `DEFAULTS` agree on every single leaf except `guard.protectedPaths`. Nothing keeps them agreeing, no test asserts it, and neither file mentions the other. So four further instances of the same defect are armed and invisible.

The finding is the predecessor plan's own failure mode turned around. Its Q2 observed that `defaultSensitivity` is `"medium"` in both sources, concluded that nothing observable changes, and stopped. The observation was correct and the conclusion did not survive the next key.

## Scope decisions, and what drove them

**Twenty defects in, eight out.** The line drawn is: a fail-open into the protected list, or a claim in a document a consuming project reads, is in scope. Everything else is out. Six of the eight deferrals sit inside the shell directory model, which became `260804-1205-shell-reachability-model`, so they cluster rather than scatter.

**`260804-1332_*_git-work-tree-in-the-environment-relocates-the-write-and-the-classifier-reads-no-variable.md` (`GIT_WORK_TREE=` in the environment) is deferred although it is High.** It is pre-existing, it is already carried on both shipped residual lists, and closing it needs a decision about which environment variables the classifier reads at all. Step 7 obligation 11 requires the residual entry to survive the documentation rewrite, so the deferral costs nothing new provided that obligation is met.

**Five configuration defects became one step, not five.** They are one seam with three questions: which keys a project layer may set, what an absent key falls back to, and what an unusable value costs. Answering the second decides the third, because a dropped key and an omitted key should be the same thing. Splitting them would have shipped type validation whose drop behaviour is the defect standing next to it.

**`260804-1344_*_the-git-option-walk-stops-at-an-unknown-options-value-so-a-c-behind-it-is-invisible.md` and `260804-1345_*_git-checkout-treeish-dash-dash-dot-overwrites-the-whole-protected-list-and-allows.md` became one step** on the Turn 10 review's recommendation, and the recommendation holds independently: both sit in the eight lines `613d6fd` edited, and the fix for the second is a `VerbSpec` field that `260804-1346_*_git-clean-fdx-at-the-project-root-is-still-a-residual-and-its-residual-entry-was-deleted.md` and `260804-1348_*_the-two-spellings-of-the-revert-strategy-still-disagree-at-head-and-checkouts-second-cost-is-unreachable.md` also want.

**Neither `260804-1601_*_a-partial-guard-object-silently-removes-every-protected-path.md` nor `260804-1602_*_guard-enabled-false-from-the-project-layer-turns-off-the-branch-policy-and-an-active-halt.md` was decided in the plan.** Both are security-policy choices with a real fork, and the brief was explicit that they go to the user. Each record states what not answering ships, which is the useful part: not answering ships an option nobody chose, without that option's documentation.

## One process error, owned

Setup step 2 was run from `fusion-workbench/` rather than from the project root that `bin/fusion-workbench-root` printed. `bin/fusion-rules` resolves the stylometric profiles at `./fusion-workbench/stilwerk/`, relative to the working directory, so the first run emitted eight rule paths and no voice profile. The absence looked like a missing profile and was a wrong working directory. Re-run from the project root, the helper emitted `chat-voice-en.yaml` and `default-voice-en.yaml` as documented; both were read before the plan prose was written. `rules/agent-setup.md` states the `cd` requirement and it was not followed.

## What the next session needs

Answers to `260804-1630_*_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md` and `260804-1631_*_may-a-project-file-set-guard-enabled-and-switch-the-whole-guard-off.md` before Step 2 can start. Steps 1, 3 and 5 of the new plan depend on no decision and close two of the five High defects on their own, so work is available while the decisions are open.

## Files touched

- `260804-1633_*_plan-c5b-remediation-and-ship.md` (new)
- `260802-1856_*_plan-guard-rules-write.md` (Step 7 marked, header corrected, Steps 9 and 10 marked superseded)
- `260804-1630_*_…`, `260804-1631_*_…`, `260804-1632_*_…` (new)
- `260804-1633_*_…` (new), `260804-1608_*_…` (closed)

Nothing outside `fusion-workbench/` was read for modification, and nothing outside it was written.
