# Is an archived record a citation target, or is a citation that resolves only into archive/ dangling?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `shared/issues/260828-0828_*_fusion-citation-bookkeeping-defect-report.md`, `shared/analyses/260828-0859-citation-bookkeeping-defect-report-measured-against-fusions-own-corpus.md`, `circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`

---

## Question

The citation gate (shape 1, 260819) lets a citation of `shared/issues/X` resolve to `archive/<sweep>/shared/issues/X` and stays green. The consumer report calls that resolution the defect: the store segment is what moves, and a reader following the path finds nothing. 142 of 783 path citations in fusion's own gate corpus resolve only into `archive/` today (analysis, Finding 5). Which reading is fusion's?

## Options

1. **Archived is a valid target** (status quo) — the gate's `unsweep()` stands; a reader is expected to look under `archive/`. Pros: nothing to rewrite. Cons: the written path is wrong for every reader that is not the gate.
2. **Archived is dangling** — the archive step repairs or annotates every live citation of what it moves, and the gate stops unsweeping. Pros: written paths are true. Cons: the archive step gains a rewrite pass; 142 citations to repair once.
3. **Drop the store segment from the citation form** (see the sibling record on the store segment) — makes the question moot, because a storeless citation resolves wherever the record is.

## Constraints

Any answer must keep `hooks/lib/__tests__/workbench-citation-lint.test.ts` decidable over the tree at HEAD, and must not reopen the deletion annotation rule in `rules/circle-records.md`.
