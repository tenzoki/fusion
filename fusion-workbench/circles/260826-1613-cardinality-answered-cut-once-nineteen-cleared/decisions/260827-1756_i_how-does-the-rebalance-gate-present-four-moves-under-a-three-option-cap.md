# How does the Rebalance gate present four moves under a three-option cap?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260825-1259_*_the-rebalance-gate-mandates-four-options-and-the-output-rule-caps-a-gate-at-three.md` (the defect this settles); `rules/orchestrator-rebalance.md` `### Rebalance Gate` (the four options, since the 260827-1210_*_do-the-rare-orchestrator-flows-stay-in-every-sessions-context.md partition); `rules/user-facing-output.md` `## Questions and gates` (the cap and the line budget it is derived from); `rules/critical-stance.md` §4

---

## Question

The Rebalance gate offers the three edges of the Coherence model plus its termination, four moves in all, and the output rule caps any gate at three options because a stem, three labels and three foreclosures already fill seven of the eight lines a gate may use. The orchestrator meets both rules at a live gate and has to break one silently. The planning of the twenty-record repair needs the answer before `rules/orchestrator-rebalance.md` can be edited.

## Options

1. **Exempt the Rebalance gate by name.** The output rule names this one gate as the exception and raises its line cap to nine for it.
   - Pros: no change to the gate's shape; one sentence.
   - Cons: the cap stops being derived and becomes a list; the next four-option gate asks for the same exemption.
2. **Split the gate in two, following its own recommendation field.** First gate: does the Directive still stand (Revise Directive, Accept Bounded Closure, or Keep it). Second gate, reached only on Keep it: what to revise (Artifact, Grounding). Two gates of two or three options each, inside every cap.
   - Pros: all four moves survive; both gates are derivable from the caps as written; the split follows the model's own order (destination first, then the path to it).
   - Cons: two prompts where there was one, on a gate that already fires rarely; the re-entry mechanics in `#### Rebalance bounding` gain a second entry point.
3. **Present only the moves the verdict makes live.** The reconciler's recommendation names one move; the orchestrator offers that move, Accept Bounded Closure, and at most one alternative, and the rule says so.
   - Pros: cheapest; it is what the 260825 session did.
   - Cons: a move the model says is available is hidden by the party whose reading is in question; the user cannot pick Revise Directive when the reconciler recommended Revise Artifact unless the orchestrator thought of it.

## Constraints

- Every one of the four moves stays reachable by the user at some gate; §4 forbids dropping a branch of a complete split.
- The length and option caps in `rules/user-facing-output.md` are not raised in general; that file is always-on and its caps are derived.
- `rules/orchestrator-rebalance.md` is emitted to no agent and read through `$FUSION_PLUGIN_ROOT` at the gate, so its bytes fall under no growth bound; `rules/user-facing-output.md` bytes do.

## Recommendation

Option 2. It keeps every move, keeps the caps derived, and costs a second prompt only in the branch where the user has already said the Directive stands. Option 3 is the cheapest and is the one that hides a move; if the user prefers it, the rule must say which move is hidden and why, so the omission is a stated policy rather than each session's improvisation.

## Answer

Option 2: the gate splits in two. First, does the Directive stand (Revise Directive, Accept Bounded Closure, Keep it); second, on Keep it, what to revise (Artifact, Grounding). Every move stays reachable and every gate is inside the cap. Realised by plan step 9.

Answered: 260827-1830, Kai Stalmann <ks@qantr.com> at the orchestrator gate of session 260827-1749-orchestrator-session.md; the recommendation is adopted as written.

Implemented: uncommitted at filing (the orchestrator commits after this dispatch) — plan step 9 of `260827-1756_*_repair-the-twenty-open-defect-records.md`: `rules/orchestrator-rebalance.md` `### Rebalance Gate` split into Gate 1 (Directive stands?) and Gate 2 (Artifact or Grounding); `agents/orchestrator.md` stub updated; record `shared/issues/260825-1259_*` closed.

Reconciled 260827-2034-reconciliation.md: the `Implemented:` line above was written before the commit; it landed in `799ea348` (this file and the shipped edit in the same commit).
