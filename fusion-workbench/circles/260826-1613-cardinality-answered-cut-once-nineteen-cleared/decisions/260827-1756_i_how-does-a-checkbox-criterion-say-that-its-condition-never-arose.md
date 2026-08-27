# How does a checkbox criterion say that its condition never arose?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `shared/issues/260825-1250_*_a-conditional-acceptance-criterion-has-no-notation-for-a-false-antecedent-so-three-passes-re-derived-the-same-explanation.md` (two instances, four passes); `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` `### C1` criterion 7; `circles/260825-2023-presence-travels-monitor-filters-own-checkout/planning/260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md` `## Where this Circle stops` clause 7; `agents/shaper.md` (the spec template); `agents/planner.md` (the plan template); `rules/critical-stance.md` §4

---

## Question

A criterion of the form "if the measurement shows X, the Circle stops" cannot be ticked when the measurement showed not-X, and left blank it reads as outstanding work. Four reconciliation passes have each re-derived the same explanation because the verdict lives in a log entry and not beside the box. The two-state checkbox is the wrong notation for a conditional, and the plan that repairs the twenty records has to know which of two conventions to write.

## Options

1. **A third box state.** `- [~]` (or another glyph) for "not applicable, and here is why", followed by one clause. Authored beside the marker vocabularies in `rules/fusion-workbench-conventions.md`; every plan and spec inherits it.
   - Pros: repairs the criteria already written this way; a reader counting what is left sees the state at the box.
   - Cons: a new state in an always-on rule; every reader of every plan learns a glyph for a case that has arisen twice.
2. **A shaping rule.** A conditional whose antecedent is a measurement the Circle itself performs is a stopping clause, not an acceptance criterion; it belongs under `## Where this Circle stops` (plans) or a `## Stops when` section (specs), never in a checkbox list. Existing instances get one inline clause after the box, `(condition did not arise: <one clause>)`, and stay unticked.
   - Pros: the smaller change; no new state; it removes the cause rather than notating the symptom.
   - Cons: does nothing for criteria already written except by the one-off annotation; a stopping clause that never fired still reads as a clause, which is what clause 7 of the C4 plan already is.

## Constraints

- The four-pass cost is the defect: whatever is chosen must put the verdict beside the criterion so no later pass re-derives it.
- `rules/fusion-workbench-conventions.md` is always-on; `agents/shaper.md` and `agents/planner.md` are on the `agents/` bound (14 204 bytes free at `0fb5085`).
- The notation must distinguish "the condition did not arise" from "the condition arose and the work is outstanding" (the `Also seen` note of the issue).

## Recommendation

Option 2, with the inline clause for the two existing instances. The rule goes in the shaper's spec template and the planner's plan template rather than the conventions, because it governs where a conditional is written and both templates are where a conditional gets written.

## Answer

Option 2, with the inline clause `(condition did not arise: <one clause>)` on the two existing instances. The rule goes into the shaper's spec template and the planner's plan template. Realised by plan step 7.

Answered: 260827-1830, Kai Stalmann <ks@qantr.com> at the orchestrator gate of session circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/history/260827-1749-orchestrator-session.md; the recommendation is adopted as written.

Implemented: plan step 7 of `circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/planning/260827-1756_*_repair-the-twenty-open-defect-records.md` (uncommitted at the time of writing; the orchestrator commits after the step) — `## Stops when` in the shaper spec template, one sentence in the planner placeholder, the inline clause on both existing instances, record closed as `_c_`.

Reconciled 260827-2034: the `Implemented:` line above was written before the commit; it landed in `ea4be341` (this file and the shipped edit in the same commit).
