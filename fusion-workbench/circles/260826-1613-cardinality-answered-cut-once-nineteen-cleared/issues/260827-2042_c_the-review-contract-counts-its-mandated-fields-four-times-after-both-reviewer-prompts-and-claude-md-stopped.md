The review contract counts its mandated fields four times after both reviewer prompts and CLAUDE.md stopped

---
Commit `b8796a4` removed the count from `agents/coderev.md`, `agents/ontorev.md` and `CLAUDE.md` because "the count was two and is three" (its message). `rules/review-contract.md` keeps the number at `:5`, `:18`, `:63` and `:75` ("three mandated"), four copies of the figure that had just drifted, beside the list that is the figure's source. `rules/critical-stance.md` §5: a number beside its list is the copy that drifts.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Cross-references:** commits `38dc63e` (two → three) and `b8796a4` (siblings de-counted)

## Fix direction

"the mandated header fields" at the four sites, as the siblings now read; the heading at `:18` keeps its list. Conditional emission, reported not bounded.

## Acceptance

`grep -c "three mandated" rules/review-contract.md` is 0.

**Resolved:** 260827-2102, coder. `rules/review-contract.md`: the count dropped at all four sites (`:5`, `:18` heading, `:63`, `:75`) plus the "these three lines" lead at `:20`; the list under the heading stays the source. `grep -c 'three mandated'` is 0. 6725 -> 6699 bytes, conditional emission; citation-token count 3 -> 3.
