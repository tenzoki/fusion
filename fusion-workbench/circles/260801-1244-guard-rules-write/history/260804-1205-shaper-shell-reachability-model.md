# Shaper session — anticipated Circle for the shell reachability model

**Date:** 2026-08-04 12:05
**Agent:** shaper (anticipated-circle mode)
**Dispatched by:** orchestrator, task T9-2, in Circle `circles/260801-1244-guard-rules-write`
**Status:** Complete
**Produced:** `circles/260804-1205-shell-reachability-model/` (record `_a_circle.md`, plus the six artifact subdirectories)

---

## The draft

> Replace the guard's flat joiner model with a real shell reachability model, so the classifier asks "is this segment guaranteed reached given that the command started?" rather than inspecting one adjacent operator at a time.

The dispatch framed this as a capture rather than an open shaping job: the work had already been analysed, costed and argued in `decisions/260804-0947`, and the user answered that record an hour earlier by choosing option 4 (take the cheap give-up now, give the reachability model its own Circle). The shaper's job was a Directive and a Grounding snapshot, not a re-litigation.

## What was read

- `circles/260801-1244-guard-rules-write/decisions/260804-0947_i_…joiner…moves…writes.md` — the four options, the five constraints, the recommendation, the user's answer, and the implementation note on `4f1007f`.
- `circles/260801-1244-guard-rules-write/issues/260804-0839_o_…flat-joiner…precedence….md` — the live over-deny, its four shapes, its anti-vacuity pins.
- `circles/260801-1244-guard-rules-write/reviews/260804-0845-coderev-turn7-….md` — `### The boundary, by coverage`.
- `circles/260801-1244-guard-rules-write/history/260804-1021-reconciliation.md` — sections D, E, G and I, for the parent Circle's open ledger.
- `circles/260801-1244-guard-rules-write/_t_circle.md` and `circles/260801-1244-curator/_a_circle.md`, as the format precedent for a Circle record in this workbench.
- The parent Circle's plan (`planning/260802-1856_o_plan-guard-rules-write.md`) step headings, to state the dependency in terms of actual steps rather than a remembered range.

## Clarification rounds: none run, and why

The shaper was dispatched as a sub-agent and therefore had no `AskUserQuestion`. Both candidate questions in the dispatch brief were checked against the records first, as the brief instructed.

**Scope (reachability alone, or reachability plus the exit-status question).** Settled by `260804-0947` and not a choice: *"The control row does not improve. `[ -d nope ] || cd build && rm rules/x.md` still denies: reachability is a static property, the exit status is not, and no parser recovers it."* Asking the user to pick between reachability and reachability-plus-exit-status would offer an option that does not exist. Recorded in the Directive as a stated residual instead.

**Sequencing against the parent Circle.** Settled for this Circle's own dependency and left open where it genuinely is open. The dependency itself is mechanical and certain: the two Circles edit the same two files (`260804-1024` lands in `bash-mutation-guard.ts`, which this Circle restructures), the parent's `260804-1025` corrects the very text this Circle's work will rewrite again, and fusion activates one Circle at a time. What is *not* settled is whether the parent ships (plan Step 10) before or after this Circle runs. That choice belongs to the parent Circle's plan, changes nothing in this Circle's content, and is recorded as an open note in `## Dependencies` rather than decided.

## What the Directive kept from the draft, and what it added

The draft's core sentence survives as the Directive's opening claim. Four things were added from the records, each because the parent Circle's history shows what happens when they are left implicit:

1. **The `until` exception, named in the Directive itself** rather than buried in Grounding. It is the cheapest check that an implementation modelled reachability instead of pattern-matching `if`.
2. **The invariant "no command that denies today newly allows"**, stated as part of the Directive rather than assumed. This Circle relaxes over-denies, which is the allow direction, so it carries the invariant under more pressure than any predecessor Turn did.
3. **The pipeline-as-subshell consequence**, because the record's argument for the model over another give-up rests on it falling out as a scope fact rather than as a special case.
4. **The exit-status residual**, so the Circle cannot later be read as having promised the control row.

## The honesty carried forward

The Grounding snapshot states that the cost is unmeasured and says why: beyond the two known ends it cannot be measured without implementing it, and stating a number would repeat the failure the parent Circle's last two Turns were spent correcting. No estimate appears anywhere in the record. The method constraint that follows (generated cross-product, both shells, measured in the shell that performs each write) is stated with it, since the number will only be worth anything if it is produced that way.
