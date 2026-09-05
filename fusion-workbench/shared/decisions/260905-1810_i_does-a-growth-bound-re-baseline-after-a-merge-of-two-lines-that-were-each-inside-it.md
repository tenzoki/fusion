# Does a growth bound re-baseline after a merge of two lines that were each inside it?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`260905-1755_*_the-merge-puts-two-surface-growth-budgets-over-while-neither-line-was-over-on-its-own.md` (the measurement, and the question it leaves open);
`hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining: the two events at which a baseline moves` (the rule as it stands);
`260814-0738_*_how-is-the-always-on-growth-bound-armed-when-the-corpus-is-already-over-budget.md` (the governing record for the arming form)

---

## Question

The four growth bounds measure a surface's rate of addition against a baseline, and a baseline moves at exactly two written-down events: after a cut, and at an arming. A merge of `origin/main` into this checkout put two surfaces over budget by 175 bytes and 391 lines while neither of the two merged lines had been over on its own. The bound added both lines' growth at once. The question is whether a merge of two lines that were each inside the bound is a third event at which the baseline moves, or whether the cut the rule demands is owed regardless.

## Options

1. **A cut is owed.** The rule stays at two events; the merged tree is cut by 175 bytes and 391 lines.
   - Pros: the rule stays as strict as it was written; nothing in it has to explain a merge.
   - Cons: the cut answers no growth anybody made. Each line was measured and passed; what is being paid for is that two measured histories joined. On the test surface the only cut the instrument itself sanctions frees 7 lines of 391.
2. **A merge of two in-budget lines is a third event.** The baseline moves to the merged figure, and the entry names the merge commit and the two parent figures it reconciles, the way a cleanup names its cut and an arming names its gate.
   - Pros: the bound keeps measuring what it was built to measure, addition per line; the event is as writable-down as the other two, and the record it needs exists already.
   - Cons: it is a hole a careless merge could drive growth through, if the two parents were not each checked. The condition — each parent inside the bound at its own head — has to be stated and checked, not assumed.

## Constraints

- Whatever is chosen, the two parents' own figures are recorded with the merged one, so a later reader can verify that neither was over.
- No option lets a baseline move for a merge whose parents were not each inside the bound. That case is a cut, as before.

---
Answered: 260904-1050-orchestrator-session.md `## Turn 4 — the two consumer findings` — option 2, a merge of two lines that were each inside the bound is a third event at which the baseline moves, with the merge and both parent figures named; ruled by user, Kai Stalmann <ks@qantr.com>.

---
Implemented: 9f3dfae4 — `hooks/lib/__tests__/helpers/growth-bound.ts` names three events, both baselines moved to the merged figures with parents and base recorded, and the suite is green with nothing cut.
