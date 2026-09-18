The edge classification is neither disjoint nor complete, in three demonstrated places

---

`### The classification, cut on direction` claims in its own words that "no candidate falls outside them or into two". Three inputs refute it: a sentence whose other endpoint is not a work item falls in two outcomes under the two readings of the pre-test, a relation whose dependent is the other item and whose target is the corpus owner falls in no branch when that other item is terminal, and an ordering reading routed to the citation field by the new terminal-target rule falls in two consequence groups at the gate. The split has been recut once already for an overlap.

---

**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260918-0738-curator-run.md, 260918-0824_*_the-container-hop-voided-the-only-stated-mitigation-for-flooding-the-gate.md, 260918-0712_*_implementation-depends-on-edges-proposed-and-confirmed.md

## 1. The pre-test and test 1's *no* arm cover the same inputs, with different outcomes

The pre-test reads:

> A sentence asserting no relation between the item whose corpus carried it and **another work item** is not a candidate at all: it produces neither an entry nor residue, and that is what keeps the residue bounded.

Test 1 reads:

> **Are both endpoints identified — this item and one other work item**, by basename or by the container hop …? No → **residue**.

Read strictly, the two are the same test. A sentence whose second endpoint is not an identified work item is a sentence asserting no relation to another work item, so the pre-test consumes it and test 1's *no* arm is unreachable: residue is always empty and the section spends four sentences on a dead branch.

Read loosely — "asserting a relation to *something*" — test 1's *no* arm is reachable and residue is **unbounded**: every sentence naming a rule file, a commit, a helper, a person or a foreign record asserts a relation to something, and all of them become residue the run must report.

**The first run took the loose reading silently**, and its own words are the tell: "Each binds this unit of work to **something**, where the something is not a work item." It reported six. Six is not a ceiling the section produced; it is a judgement the run made, and the reader cannot see which sentences it declined to count. This answers the question of whether the pre-test bounds the residue: it does not. What bounded the residue on that run was the run's taste.

## 2. A relation whose dependent is the other item and whose target is the corpus owner falls in no branch

The section asserts:

> The dependent is live in both arms, so no reading of either produces a write into a terminal item.

That is asserted, not derived, and it rests on an unstated premise: that the corpus owner is always the **dependent**. Nothing establishes it. The corpus is iterated over live items; test 1 identifies two endpoints without assigning roles; test 2 assigns direction by reading the sentence. A sentence in a live item's corpus saying that some other item waits on this one puts the other item in the dependent role.

Take that other item terminal. Test 2 is *yes*, so the entry is "a `**Depends-on:**` entry on the dependent" — into a terminal item's head, which the live/terminal bound forbids and the write bound forbids again. The terminal-target repair added at `git:8fad8ead` does not reach it: it covers a terminal **target**, and says nothing about a terminal **dependent**. Take that other item live and the write is permitted but lands in an item that is not the one being surveyed, which the write bound's own sentence says never happens.

So the input falls in no branch, and the section's completeness claim is false for it.

**This is the same question as the finding the repair commit deliberately left open** — that a quoted ordering between two work items neither of which owns the corpus is discarded before test 1. Both reduce to one ruling: may the pass propose an edge whose dependent is not the item whose corpus carried the sentence? A *no* closes both, at the cost the open finding already names. A *yes* closes both and needs a live-check on the dependent, which is the precondition read that `260918-0821_*_the-edge-exception-removed-the-apply-passs-staleness-check-and-put-nothing-in-its-place.md` asks for anyway. They should be ruled together rather than as two findings of different severities.

## 3. An ordering reading on a terminal target belongs to two consequence groups

The repair added:

> **Test 2's *yes* arm on a terminal target routes the same way** … the relation then goes to `**Cross-references:**`.

That completes the **field** routing and leaves the **group** routing open. `### The gate` carries two edge groups, and states why:

> **They are two groups rather than one** so that a user can take the citations without the orderings.

An entry produced by a *yes* on test 2 and written into `**Cross-references:**` is an ordering reading the pass made. Under group 6 a user who takes the citations and rejects the orderings loses it; under group 7 that same user takes the pass's ordering judgement after refusing exactly that. The section names neither. The first run filed `L11` as `work-item citation edge` on no authority in the text.

This matters more than the field routing it came with, because the two-group split is the only instrument the user has for saying "I do not trust this pass's direction calls", and the repair put entries into it that the split cannot classify.

## Acceptance test

The pre-test states which of its two readings is meant, and where it means "a relation to anything", the residue has a stated bound that is not the run's judgement. A sentence whose dependent is not the corpus owner has exactly one outcome, named in the section, for each of the four combinations of that item's liveness and the direction. An entry reaching `**Cross-references:**` through a *yes* on test 2 carries a named consequence group, and the gate's two-group promise is restated or amended to match. Each of the three inputs above is walked through the amended split and lands in exactly one place.
