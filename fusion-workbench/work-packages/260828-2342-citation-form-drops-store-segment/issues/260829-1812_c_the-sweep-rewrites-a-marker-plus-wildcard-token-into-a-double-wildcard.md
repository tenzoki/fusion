The sweep rewrites a marker-plus-wildcard token into a double wildcard
---
A citation written as `<stamp>_o_*_<slug>.md` (a literal marker followed by the wildcard, a shape two records in this Circle's history carried) is classed `bare-record` and rewritten to `<stamp>_*_*_<slug>.md`: the marker is starred and the existing star stays, so the result resolves nowhere. Measured on a scratch copy of the tree at `a60d1fea` with two such tokens (`--write --yes`: `rewrites=2`, both to the double-star form).
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

Same family as the truncated-citation chaining (`260829-1333_*`, closed): a token that is already partly in the target form is treated as if it were not. Acceptance: `_<letter>_*_` collapses to `_*_` in one rewrite; a fixture in `citation-sweep.test.ts` carries the shape; a second dry run over the result reports `rewrites=0`.

---
Resolved: The visibility guard in `hooks/citation-sweep.ts` (`readsBackWhole`) refuses any rewrite the grammar reads back as `exempt`, and a probe at HEAD reads the double-star candidate back as `exempt` with reason `glob`, so a `_o_*_` token is left untouched rather than rewritten to `_*_*_`. — closed by a closing pass on 260921 over the plan's "Already resolved at HEAD" list, the evidence re-verified at HEAD in the commit that carries this line.
