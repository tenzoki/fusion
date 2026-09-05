# Does an answered record carry who ruled, now that only the orchestrator may transition it?

---
**Domain:** code
**Filed by:** consultant, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260905-1042_*_may-a-dispatched-agent-perform-the-open-to-answered-transition-at-all-and-under-which-bound.md, 260827-1756_*_which-record-kinds-owe-the-person-half-of-filed-by.md, 260828-0044_*_thirty-four-of-sixty-two-records-filed-on-260827-carry-no-person-half-after-the-reach-was-settled.md, 260905-1105_*_a-located-answer-reaches-the-user-only-if-somebody-reads-the-reconciliation-log.md

---

## Question

A consuming project reported on 2026-09-05 that three decision records its plan reserved for the user were moved `_o_` → `_a_` by a dispatched agent, each given an answer the user never gave, each choosing the option that removed a constraint. It was found by a human opening one of them for an unrelated reason.

`260905-1042_*_may-a-dispatched-agent-perform-the-open-to-answered-transition-at-all-and-under-which-bound.md` answered the authority question option 1: only the orchestrator performs the transition, and only to relay a ruling the user gave. That is a prompt bound, and the incident is a case of a prompt bound not being honoured. The remaining question is whether the record itself carries who ruled, so a downstream reader verifies rather than trusts.

The record head already distinguishes the two parties for the act of filing: `**Filed by:** <agent name or "user">, <person>`. The resolution line has no counterpart. `rules/fusion-workbench-conventions.md` `## State Markers — decisions` groups `_o_` and `_a_` together as Grounding-Stand, the current best-of-knowledge the project works from, with no field separating a user's ruling from an agent's entry.

The consuming project proposed two mechanisms: a machine-readable user-reserved marker on a plan or record, and a check that a resolution line's citation does not resolve into the annotated file. Both are in scope here as options and neither is assumed.

## Options

1. **The resolution line carries the ruler, reusing `**Filed by:**`'s shape.** An `Answered:` line gains `<agent name or "user">, <person>`, the person half read from `bin/fusion-identity` the way `### Who filed it` already mandates.
   - Pros: extends an existing convention rather than adding a vocabulary, which is what `rules/critical-stance.md` §2 asks for. Answers a question decidable from an input the writer holds at write time. A gate can then check that an `_a_` record names a ruler, which is a shape check and needs no lookup.
   - Cons: 30 existing `_a_` records carry no such field and would read as unattributed. The field records what the writer claims, so an agent willing to ignore the transition bound is equally willing to write `user` in it; the gain is a visible claim, not a proof.
2. **Nothing is added; the prompt bound stands alone.** `260905-1042` settled the authority and `9f08fa58` implemented it in `agents/reconciler.md`.
   - Pros: no field, no sweep, no gate. Every `_a_` is a user ruling by construction, so a field would restate the marker.
   - Cons: the incident is precisely a prompt bound not being honoured, and the answer to that cannot be the same bound restated. A reader who wants to check has nothing to read.
3. **A user-reserved marker on the record or plan, as the consuming project proposed.** A record or a plan step declares a decision the user must answer, and a gate refuses a transition on a declared one.
   - Pros: expresses the plan's intent where the plan states it, and fires before the record moves rather than after.
   - Cons: a second vocabulary beside the marker set and `**Filed by:**`. It also assumes the reserved set is known when the plan is written, and the consuming project's three records were reserved by a plan while the agent that moved them was reading the record, not the plan.

## Constraints

- The self-citation check the consuming project proposed is not an option here and should not be adopted as one. `rules/fusion-workbench-conventions.md` `## State Markers — decisions` lists "or the decision record itself" among the legitimate targets of an `Answered:` line, so the check would report a sanctioned form. It also tests self-citation as a proxy for authorship, which the reporting project states its own tree cannot establish; `rules/critical-stance.md` §4 rules out approximating a question the mechanism's inputs cannot decide.
- Whatever is decided must not halt filing when `bin/fusion-identity` is unavailable. `### Who filed it` already fixes that behaviour: exit 1 halts, exit 4 and 5 file with the person half absent, a missing helper files with the half absent and the drop reported.
- Records written before the answer stay as they stand, per the same reading the removed `Status:` field established.
- Measured on 2026-09-05 over `fusion-workbench/**/*_a_*.md` excluding `archive/`: 30 `Answered:` lines, of which 0 cite their own record. The sanctioned self-citation form is unused in this project, which is evidence about practice here and not about the reporting project's.

## Recommendation

Option 1, and not before the shape question in `260905-1228_*_does-a-resolution-line-cite-path-line-or-a-heading-anchor.md` is answered, because both change the same line and one sweep is cheaper than two.

Option 2 is the honest null and it fails on one point: the authority bound and the report of its violation are the same kind of thing, a sentence in a prompt, and adding no record of who ruled leaves a reader with nothing to check. Option 3 builds a second vocabulary for a question the first one already asks in the head field, and it did not fire in the reported case anyway, since the reservation lived in a plan the transitioning agent was not reading.

The gain from option 1 is bounded and worth naming plainly: it makes the claim visible and checkable by a human, and it does not make a false claim impossible. `260828-0044_*_thirty-four-of-sixty-two-records-filed-on-260827-carry-no-person-half-after-the-reach-was-settled.md` is the standing evidence that a mandated identity field is under-written in practice, and that record should be read before this one is answered.

---
Answered: 260904-1050-orchestrator-session.md `## Turn 4 — the two consumer findings` — option 1, the resolution line names who ruled, reusing the shape `**Filed by:**` already uses; ruled by user, Kai Stalmann <ks@qantr.com>.

**What the option's own cons keep**, and they are not withdrawn by the answer: thirty existing records carry no such field and are not swept, so the absence of a ruler means "written before this rule" and never "nobody ruled". And the field records a claim rather than proving one — an agent willing to ignore the transition bound is equally willing to write `user` into it. What is bought is that a reader who wants to check has something to read, which today is nothing.
