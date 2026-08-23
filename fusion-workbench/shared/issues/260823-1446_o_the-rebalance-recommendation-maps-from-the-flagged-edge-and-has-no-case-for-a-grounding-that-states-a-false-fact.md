The Rebalance recommendation maps from the flagged edge and has no case for a Grounding that states a false fact

---

`agents/reconciler.md` `## Step 4` maps a `review-needed` verdict to a Rebalance recommendation by keying
on **which edge is flagged**, not on which vertex is wrong. For the case met at
`circles/260823-0023-settle-what-travels-between-checkouts/` the two come apart, and the mapping produces
the wrong advice.

---

**Severity:** Low. The recommendation is advisory and the orchestrator presents all four options
regardless, so nothing is decided wrongly. What it costs is the one thing the recommendation exists to
buy: an orchestrator or a user reading it goes to the wrong option first.

**Domain:** code
**Filed by:** reconciler, Phase-3 pass over `3ee8eaf..7cd79f1`
**Affects:** `agents/reconciler.md` `## Step 4` (the mapping table and the priority-order paragraph
beneath it)
**Cross-references:**
`shared/issues/260817-1836_*_the-three-edge-verdict-has-no-case-for-a-session-that-stated-no-directive-and-two-of-its-three-edges-are-then-unevaluable.md`
and
`shared/issues/260817-1613_*_the-reconcilers-verdict-vocabulary-has-no-case-for-a-directive-that-is-reachable-but-deliberately-not-reached.md`,
the two siblings of this class. Both are about the **verdict** vocabulary being incomplete; this one is
about the **recommendation** mapping under a verdict that is computed correctly.

## What is wrong

The Circle's `## Grounding snapshot` states a fact about the world that is false:
that this Circle's merge-driver step is the first write `/fusion:setup` performs outside
`fusion-workbench/`. `skills/setup/SKILL.md` Step 0g already wrote two files at the project root before
the Circle was shaped, and `skills/setup/SKILL.md:319`, written during this Circle, now says so in the
shipped text.

That is a claim that disagrees with disk, so it lands on **Artifact↔Grounding**, which the prompt defines
operationally as claims-vs-disk. The mapping then reads:

> `review-needed` with `Artifact↔Grounding` flagged → `revise Artifact`

`revise Artifact` means redo the work. The work is correct: nothing was built on the false half, and the
plan's `## Current State` had already caught it and reused Step 0g as the convention for the write. What
needs revising is the **Grounding sentence**. The mapping cannot say so, because `revise Grounding` is
reachable only through the `Grounding↔Directive` edge, and that edge is not flagged here: the false claim
is perfectly consistent with the Directive. It misdirected nothing.

## Why the case split is cut wrong rather than merely incomplete

The three edges are relations between vertices, and the mapping assumes a flagged relation identifies the
faulty vertex. Two edges touch the Grounding, so a Grounding fault can surface on either, and which one it
surfaces on depends on what the fault is *about* rather than on where the correction goes. A Grounding
that contradicts the Directive shows on `Grounding↔Directive`; a Grounding that contradicts the world
shows on `Artifact↔Grounding`, because the world is what the Artifact is checked against. Both are
Grounding faults and both want `revise Grounding`.

The gap is therefore not "one missing row". It is that edge identity does not determine vertex identity,
which is the disjointness failure `rules/critical-stance.md` §4 describes.

## What to consider

Not costed here.

1. **Key the recommendation on the vertex the reconciler names, not on the edge.** The reconciler already
   knows which vertex it would correct; it is the edge label that loses the information. One added clause
   in the edge line and the mapping reads the clause.
2. **Give `Artifact↔Grounding` two readings and map them separately** — the Artifact disagrees with the
   Grounding, versus the Grounding disagrees with the world. Cheap in text, and it makes the ambiguity
   visible at the point somebody would otherwise resolve it silently.
3. **Delete the mapping and let the reconciler state the recommendation in prose**, which is what this
   pass did. The mapping's stated purpose is reducing decision fatigue at the gate, and a one-line prose
   recommendation with its reason serves that without claiming a determinism it does not have.

The three differ in whether the mapping is worth keeping mechanical at all. This pass departed from it and
said so in the `## Coherence` section, which is the honest form under option 3 and a deviation under the
other two.
