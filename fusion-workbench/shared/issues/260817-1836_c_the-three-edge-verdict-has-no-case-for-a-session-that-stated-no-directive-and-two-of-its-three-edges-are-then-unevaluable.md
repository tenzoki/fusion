# The three-edge verdict has no case for a session that stated no Directive, and two of its three edges are then unevaluable

---
**Domain:** code
**Status:** open
**Filed by:** reconciler (reconciliation pass 260817-1836)
**Cross-references:** `agents/reconciler.md:26`, `:108`, `:109`, `:113-115`, `:172-176` (the Step 2.5 contract and the verdict table); `shared/issues/260817-1613_o_the-reconcilers-verdict-vocabulary-has-no-case-for-a-directive-that-is-reachable-but-deliberately-not-reached.md` (the adjacent gap, a *different* one); `shared/history/260817-1821-orchestrator-session.md` (the session that produced the case)

---

## What happened

Session `260817-1821` opened with `/fusion:setup`, was never given a work scope, and closed with
`/fusion:cleanup`. Its history file records the Directive as `(not yet stated — session opened with
/fusion:setup, no work scope given)`. The reconciler was then dispatched at Phase 3 and had to
produce a three-edge Coherence verdict against a Directive that does not exist.

Two of the three edges are unevaluable in that state, not merely clean:

- **Artifact↔Directive** (`agents/reconciler.md:108`) asks for one of four prose judgements —
  `moves toward / partially toward / orthogonal to / away from` — all four of which presuppose a
  stated Directive to be toward or away from.
- **Grounding↔Directive** (`:109`) asks, for every active decision record, "is its content still
  consistent with the stated Directive". With no Directive, every record is vacuously consistent,
  which is a true sentence that carries no information and reads in the history file exactly like a
  checked one.

The aggregate verdict (`:113-115`) has three values and every one of them asserts something about
the Directive: `coherent` says all three edges are OK, `review-needed` says an edge is flagged,
`bounded-closure-proposed` says the Directive is unreachable. None of them says *there was no
Directive*. The recommendation table (`:172-176`) has the same shape.

## Why this is a defect and not a decision

The prompt already anticipates one failure of the Directive read and rules on it: `:26` says that
skipping the Setup reads "forces the reconciler to either improvise (guess a Directive from commit
messages, pick an arbitrary git anchor) or stall — both are wrong outcomes". This case is the one
where the read *succeeds* and returns the absence of a Directive, and the prompt has no ruling for
it, so the reconciler is pushed toward exactly the improvisation `:26` forbids: two of its three
edge lines have to be written as prose that reads like a measurement and is not one.

## What this pass did instead, and why it is not the fix

This pass wrote both Directive edges as `not evaluable` with the reason named, and took the
aggregate verdict from the one edge that could be measured. That keeps the history file honest but
leaves the shipped vocabulary unchanged, so the next reconciler dispatched into the same state
either repeats the improvisation or repeats this workaround, undocumented.

## Fix directions

1. **A fourth edge state, `not evaluable`, with a stated rule for the aggregate.** The verdict is
   then computed over the evaluable edges only, and the `## Coherence` template carries the reason
   line. Smallest change; does not touch the three verdict values.
2. **A fourth verdict value for the no-Directive session.** Larger blast radius: the orchestrator's
   Phase 3 step 3 reads the verdict to decide whether to dispatch the Rebalance gate, and a Rebalance
   gate against no Directive is itself meaningless.
3. **Do not dispatch the reconciler's Step 2.5 at all when no Directive was stated.** Moves the
   ruling to the orchestrator. Costs the Artifact↔Grounding edge, which was the one edge that
   carried real findings in the measured case.

Option 1 is the one this record recommends, at moderate confidence: it is the only one that keeps
the measurable edge measured, and `not evaluable` is a state the prompt already distinguishes
elsewhere (`bin/fusion-turn-budget`'s unresolved budget is handled exactly that way, as a state
rather than a substituted number).

## Relation to `260817-1613`

That record is about a Directive that exists, is reachable, and was deliberately not reached. This
one is about a Directive that was never stated. They share a symptom (the verdict vocabulary is too
narrow) and have different causes, so a fix for one does not cover the other. Both should be read
before either is planned.

---
Also seen: 260823-1446 by reconciler — session
`circles/260823-0023-settle-what-travels-between-checkouts/history/260823-0721-orchestrator-session.md`
carries `**Directive:** (not yet stated — session started via /fusion:setup, awaiting the user's scope)`
after three Turns and 19 commits, and this pass could evaluate both Directive edges only because
`agentstate.yaml` still held `session.directive` — a class L file that a clean exit deletes.

---
Resolved: fixed — option 1: an edge whose input does not exist reads `not evaluable: <reason>`, the verdict is computed over the evaluable edges, and a session with no Directive maps to the recommendation `state Directive`; `agents/reconciler.md:111`, `:163-175`
