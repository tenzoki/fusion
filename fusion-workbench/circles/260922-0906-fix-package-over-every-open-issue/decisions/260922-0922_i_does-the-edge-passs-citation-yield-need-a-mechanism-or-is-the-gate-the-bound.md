# Does the edge pass's citation-edge yield need a mechanism, or is the gate the bound?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260918-0824_*_the-container-hop-voided-the-only-stated-mitigation-for-flooding-the-gate.md, 260918-0828_*_may-the-edge-pass-propose-an-edge-whose-dependent-is-not-the-corpus-owner.md, 260917-2253-depends-on-edges-proposed-and-confirmed.md, 260922-0922_*_the-51-open-issues-at-451bb312-worked-autonomously-as-one-package.md

---

## Question

`agents/curator.md` `### The corpus, and the live/terminal bound` now states, in its own words, that nothing in the prompt bounds the citation-edge yield of the `**Edges:** on` survey: the one-hop bound stops recursion and not the count, the pre-test excludes less after the container hop than before, and what held the first run to a handful of proposals was the legacy-status exclusion and a store of seven items, neither of which scales. The defect that measured this closed its three acceptance clauses and left the substance open: a store of forty native items at the first run's citation density puts the proposal count an order of magnitude higher with the same prompt in force, and "the gate is the bound" is a statement of where the cost lands, not a bound. The item that owns the pass is `paused` on two other rulings; this question is not among them, so it is filed where a ruling can land.

## Options

1. **The gate is the bound, stated**: the survey proposes every citation edge the hop reaches, the ledger puts them all at one gate, and the user rules once per ledger; the prompt says so and names the measured figure.
   - Pros: nothing new; the ledger-at-a-gate shape already batches the cost into one question.
   - Cons: a forty-item store puts thirty to a hundred rows at one gate, which is the flooding the plan's struck risk row named.
2. **Bound by relation, not by count**: the citation arm proposes only where the cited record is a work item's own record or a spec or plan the item runs on (`**Active spec/plan:**`), never for a decision, review or analysis cited in passing.
   - Pros: the yield tracks what a reader would call a relation between items; decisions and analyses keep their own checkers, which is what the struck mitigation said.
   - Cons: an item cited only through a decision it rests on produces no proposal; the classification gains a branch, and the classification is the part already found neither disjoint nor complete once.
3. **Bound by budget**: the survey proposes at most N citation edges per run, highest-confidence first, and reports the residue count.
   - Pros: the gate's size is fixed.
   - Cons: N is a number nobody derived; the residue is re-read every run and never shrinks unless the user confirms.

## Constraints

- `**Depends-on:**` proposals are unaffected; only the `**Cross-references:**` arm is in question.
- A confirmed edge is durable and re-run semantics (`applied` with nothing written) stay as `agents/curator.md` `### Pass 2 — apply. Approved entries only.` states them.
- `agents/curator.md` sits on the agent growth bound; option 2 costs one classification branch, option 3 one constant and its residue sentence.

## Recommendation

Option 2. It restores the mitigation the plan named, on the relation the field was defined to carry rather than on a count, and the branch it adds is decidable from the cited record's kind, which the citation grammar already reads. Option 1 is where the tree stands and is what the defect measured as not scaling.

---
Answered: 260922-0922_*_does-the-edge-passs-citation-yield-need-a-mechanism-or-is-the-gate-the-bound.md `## Options` — option 2: the citation arm proposes only where the cited record is a work item's own record or a spec or plan an item runs on, never a decision, review or analysis cited in passing; the 260922-0703 run's four written edges all had item targets and would have survived; ruled by user, Kai Stalmann <ks@qantr.com>, 260922-1228.

---

Implemented: the commit that carries this line — option 2, the arm is bounded by the relation. `agents/curator.md` `### The corpus, and the live/terminal bound` keeps its measurement (70 basenames, 27 resolving into a container, 11 containers, 6 out under the legacy rule, 5 work items, 2 already in the field) and replaces the claim that the gate is the only bound with the ruled one: the citation arm proposes an entry only where the cited record is a work item's own record, or a spec or plan the item runs on as named in its `**Active spec/plan:**` field, and never for a decision, review, analysis or history cited in passing. The classification table's `non-empty | no` row carries the same condition and sends any other record kind to residue with that reason. The `**Edge:**` line's `hop` description says what `hop` may now report on a citation entry.

The residue definition moved with it rather than being left false: it was an ordering reading this pass may not propose, in two cases with no third, and it is now a reading of either arm, in three cases with no fourth, the new one being the citation that resolved through a record kind the bound excludes. `rules/critical-stance.md` §4 makes a gap in a case split a defect of the same kind as a wrong result, and adding a residue case without widening its definition would have opened one.

The check the ruling names holds: all four edges the 260922-0703 run wrote had item targets and survive the bound unchanged. The `**Depends-on:**` arm and the node-set ruling under it are untouched, and so is the one-hop rule.

`bin/fusion-prose-metric` reads `agents/curator.md` `over`, as it did at `49ab50e4`: 156 em-dashes both times, the rate falling 13.2 to 13.0 per 1 000 words. The plan expected `ok`; the file has not been `ok`, and this step added no em-dash.
