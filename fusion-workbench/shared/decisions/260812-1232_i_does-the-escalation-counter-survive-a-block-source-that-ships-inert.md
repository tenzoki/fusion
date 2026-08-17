# Does the escalation counter survive, once its only remaining block source ships inert?

---
**Domain:** code
**Status:** implemented
**Filed by:** planner, planning the protected-path removal
**Cross-references:**
`shared/decisions/260809-1224_d_is-the-decision-governed-escalation-check-3-a-live-feature.md` — **the predecessor question, whose deferral trigger this record reports as met.** Read it first; this record is the successor it does not ask,
`shared/planning/260812-1232_*_remove-the-protected-path-half-of-the-compliance-guard.md` (the plan this arose from; its `**Decidability:**` line carries the same measurement),
`shared/issues/260812-0843_o_the-guard-and-its-configuration-must-be-simplified-project-settable-and-defaulted-to-fit-or-not-shipped-to-consumers-at-all.md` (the user's decision, which named this as "a measurement for the plan, not a premise"),
`shared/analyses/260812-0251-four-mechanisms-purpose-bindingness-and-cost.md` §Finding 1 ("Escalation: keep, unchanged"), corrected by `shared/issues/260812-1232_o_the-four-mechanisms-analysis-says-escalation-has-one-input-and-the-code-has-two.md`,
`shared/analyses/260809-1101-guard-support-layer.md` recommendation C5, which `260809-1224` blocks,
`hooks/guard.ts:604-649` (CHECK 3), `hooks/lib/escalation.ts`, `hooks/clear-halt.ts`

---

## The measurement the predecessor deferral asked for, taken

`260809-1224_d` was deferred by the user on 2026-08-11 with an explicit re-open trigger, quoted in full:

> Re-open when a measurement exists over the consuming projects this developer can reach: does any of them populate `decisions` or the rest of CHECK 3's configuration? A non-zero answer settles it as live (option 2, keep it and give it tests that fire it); a zero answer settles it as retired (option 1, remove the check and its configuration surface).

The measurement was taken on 2026-08-12 while planning the protected-path removal, and it is zero.

| Project | `fusion-guard.json` declares `decisions` or `guard.category*` | Recorded `decision_governed` blocks |
|---|---|---|
| `/Users/k1/Projects/productive/krk` | no — 0 occurrences of either token in the whole file | 0 in 37,186 events; all 50 `guard_block` rows read `Protected path` |
| `/Users/k1/Projects/productive/unite-co-creator` | no — 0 occurrences of either token in the whole file | not measurable, `.guard-state/` is gitignored and absent from the clone |
| fusion itself | no | no `guard_halt` row from that trigger |

Both files are the seeded template with its documentation keys and nothing declared. The bound on the measurement is stated rather than hidden: these are the two consuming projects reachable from this machine, `cocreator` no longer exists here, and `unite-co-creator`'s event log is not in its clone, so the second row's block count is unmeasured rather than zero. What is measured for both is the configuration, which is what the trigger asked about.

By the deferral's own terms that settles `260809-1224` as **retired**, option 1: remove CHECK 3 and its configuration surface. That record is the user's to re-open and answer; this one does not answer it.

## Question

What happens to the escalation counter, the halt and `clear-halt.js` once CHECK 3 goes?

The predecessor does not ask this, because when it was filed CHECK 3 was the *second* input and the protected-path deny was carrying the mechanism. That is no longer true. Three sites in `hooks/guard.ts` write a block: CHECK 1 at `:458` (an active halt, not an independent source, since a halt is only ever raised by the other two), CHECK 2 at `:501` (the protected path, removed by the approved plan), and CHECK 3 at `:604`. `hooks/tracker.ts:593` raises the halt outright on a measured protected-path change, and that goes with CHECK 2.

So the two removals compose into something neither decides alone. Take the protected-path half away and escalation has one input that ships empty everywhere. Take CHECK 3 away as well, on the measurement above, and escalation has **no input at all**: roughly 923 lines in `escalation.ts` plus 295 in `clear-halt.ts`, a state file, two event types, a monitor row type and an orchestrator Setup step, behind a halt that nothing can raise.

That is the question, and it has to be answered deliberately rather than arrived at by two separate removals each holding its own scope correctly.

## Options

1. **Keep escalation and the halt as dead machinery, ready for a future block source.**
   - Pros: no further removal, no migration. `clear-halt.js` stays available for the legacy halts consuming projects may still be carrying from the removed mechanism, which is a real short-term need.
   - Cons: a mechanism with no trigger is not a capability, it is a claim. It is the same shape as the protected-path list one layer down: in force everywhere, reachable nowhere.
2. **Keep escalation, and give CHECK 3 a reason to exist** — document the decision-governed surface, seed an example in `templates/fusion-guard.json`, report the effective categories at Setup.
   - Pros: turns a dormant mechanism into an offered one, per-project by construction rather than inherited from fusion's own values, which is the defect that sank the protected list. It is the mechanism `docs/philosophy.md` actually describes.
   - Cons: it contradicts the measurement just taken and the predecessor's own trigger. It builds on zero demand, which is the standard the protected list failed.
3. **Remove escalation, the halt and `clear-halt.js` together with CHECK 3.** The guard becomes observation-only: churn warnings and the measurement family, no block anywhere.
   - Pros: the largest coherent simplification available and the honest reading of the evidence. Nothing can leave a session stuck.
   - Cons: it removes the ability to stop an agent at all, which the philosophy document names as a load-bearing property. It needs a migration for any project carrying an active halt, because afterwards there is nothing to clear one with. It is a strictly larger removal than the one approved and must not ride along on it.

## Constraints

- Whatever is chosen, a consuming project carrying an active halt from the removed protected-path mechanism must be able to clear it. The removal plan pins this with a test at its step 1 rather than with a note. Option 3 has to sequence its own removal of `clear-halt.js` behind that, or leave projects stuck by a mechanism that is gone twice over.
- Churn is a separate open question with its own analysis and must not be swept into this one.
- The answer must not be inferred from "escalation has never fired usefully". Every retained halt in both projects was raised by a policy since deleted, which is a fact about those policies rather than about the halt.
- `shared/analyses/260809-1101-guard-support-layer.md` recommendation C5 has been blocked behind the predecessor since 9 August. Answering the predecessor unblocks it, and this record should not be allowed to become a second thing it is blocked behind.

## Recommendation

Answer the predecessor first, and separately. `260809-1224_d` has a measurement, a trigger that the measurement meets, and a settled reading under its own terms. Re-opening it, recording the zero, and taking option 1 there is a small, self-contained act that unblocks C5 and costs one decision.

Then answer this one, and the recommendation here is option 3 — but not now, and not in the same Circle as the protected-path removal. Enlarging an approved, measured, bounded removal while it is being executed is precisely the pattern `shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md` names as the reason removal has never bought more than four days.

Option 2 is the one to rule out first, because it is the only one that adds work and the only one that contradicts the measurement.

---
Answered: shared/history/260816-1500-orchestrator-session.md `## Decisions answered by the user` — option 3, in its own Circle: remove escalation, the halt and clear-halt.js with CHECK 3; guard becomes observation-only; clear-halt.js removal sequences behind the legacy-halt migration. User answered inline 2026-08-16.
Implemented: `9c79202` (plan steps P-3 and P-6) — option 3, in its own Circle. `hooks/lib/escalation.ts` with the whole counter and halt apparatus, and `hooks/clear-halt.ts`, are deleted, and `guard_block`, `guard_halt` and `halt_cleared` are gone from `GuardEventType`. The record's sequencing constraint was honoured rather than assumed: the remedy for a project carrying a legacy halt landed first, in `05d848b` (P-1), where `/fusion:setup` offers to delete `.guard-state/escalation.json` instead of clearing it, and `hooks/lib/__tests__/legacy-halt-clearing.test.ts` pins that a seeded halt neither blocks nor is rewritten. The counter's last input had already left with CHECK 3 in `2f624ca` (P-2). `bin/monitor` still styles all three event types on purpose, because consuming projects hold logs that carry them. Plan: `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_*_the-compliance-guard-becomes-observation-only.md`.
Deferred:
Superseded by:
