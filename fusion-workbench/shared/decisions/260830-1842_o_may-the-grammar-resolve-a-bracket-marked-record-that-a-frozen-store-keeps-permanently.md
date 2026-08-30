# May the grammar resolve a bracket-marked record that a frozen store keeps permanently?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260830-1841_*_citation-mechanism-four-defect-repair.md` (the plan this was surfaced by, defect 2), `260812-2136_*_the-citation-grammar-reads-one-ellipsis-and-one-marker-syntax-and-the-workbench-uses-two-of-each.md` (the stance this would overturn)

---

## Question

`hooks/lib/citation-scan.ts` states, with its reason, that the pre-v4 bracket marker (`260519-0438[o]-loader-check.md`) is **not read on purpose**: a grammar that accepted it would remove the only pressure to run `/fusion:migrate`.

That reason holds for a live workbench and does not hold for a frozen one. `/fusion:migrate` deliberately does not convert `archive/`, `stashes/` or `.migration-v2-backup/`, because `skills/setup/SKILL.md` bounds its probe to the two live trees, and `rules/fusion-workbench-conventions.md` says the frozen stores keep the filenames their content was frozen with. So a bracket-named record in a frozen store is **permanent**, and no citation form fusion accepts can address it. Measured in the consuming project `unite-co-creator`: 21 bracket-named `.md` files in `archive/`, 205 in `.migration-v2-backup/`.

The repair planned for defect 2 does not answer this. It widens `REC_RE`'s tail so a bracket-marked store-prefixed citation tokenises **whole** instead of stopping at the stamp, and it stops the sweep rewriting a token whose rewritten form the grammar cannot see. Both leave the token reported as `store-prefixed` and unresolved. This record asks the separate question the repair deliberately does not settle.

## Options

1. **Leave it unresolvable.** The bracket form is reported as a violation and never resolves anywhere.
   - Pros: keeps the migrate pressure exactly as the header states it. No index shape changes.
   - Cons: a citation of a permanently frozen record is reported as a fault with no available fix. The reader is told to repair something that cannot be repaired.

2. **Resolve the bracket form against frozen stores only.** `basenameMatcher` learns `[x]` as a marker position, and a match is accepted only when every matching index entry sits under a frozen prefix.
   - Pros: the pressure to migrate survives, because a live bracket-named record still fails to resolve. A citation of a frozen record resolves and stops being a false fault.
   - Cons: a location-conditional resolution rule, in a grammar whose whole design is one basename lookup with no path arithmetic. That is the arithmetic coming back.

3. **Resolve the bracket form everywhere, and let a separate check carry the migrate pressure.** The marker slot admits `[x]` like `_x_`; `/fusion:migrate`'s own probe becomes the thing that reports an unmigrated live tree.
   - Pros: one uniform marker rule; no location condition. Moves the pressure to the mechanism whose job it is.
   - Cons: the probe does not run unless somebody runs it, so the pressure weakens in practice. Two marker syntaxes in the index forever.

4. **Introduce an explicit frozen-citation form** so a reader can address a frozen record deliberately, and keep the bracket form unresolvable.
   - Pros: says out loud that a frozen record is a different kind of referent.
   - Cons: a fourth citation shape, six days after the project collapsed to one.

## Constraints

- Whatever is chosen must not make `bin/fusion-citation-sweep` rewrite a bracket-marked token: a rewrite that produces a token no pattern reads is the defect this was surfaced beside.
- The uniqueness measurement in `workbench-citation-lint.test.ts` reads `MARKER_SLOT`, so widening the slot widens the set that test measures.

## Recommendation

None yet. The choice turns on how many bracket-named frozen records exist across real consuming projects and how often they are cited: 226 files are measured in one project, and the number of *citations* of them is not. Take that measurement before answering.
