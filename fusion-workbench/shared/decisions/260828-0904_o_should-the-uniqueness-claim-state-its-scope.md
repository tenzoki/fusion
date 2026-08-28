# Should the uniqueness sentence in Filename Patterns state the scope it was measured at?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `shared/issues/260828-0828_*_fusion-citation-bookkeeping-defect-report.md`, `shared/analyses/260828-0859-citation-bookkeeping-defect-report-measured-against-fusions-own-corpus.md`

---

## Question

`## Filename Patterns` says no two records share a full basename once the marker is normalised, "measured 260824 over 876 records". That measurement was over the live tree without `archive/` (inference from `2b055a0f`). The claim holds today at every scope here (863 live, 1249 with archive, no bracket names), and the consumer found two collisions in its own frozen archive. Should the sentence name its scope, and should a test pin it?

## Options

1. **State scope and pin it** — reword to "live tree and archive, as of <commit>", and add a uniqueness test so a collision reddens `npm test`. Pros: the storeless form (sibling record) rests on this. Cons: one more test line against the hook-test budget.
2. **Leave the sentence, add the test only.**
3. **Leave both**; the claim is true at HEAD.

## Recommendation

Option 1 if the storeless form is chosen; the form's correctness is exactly this property.

---
Reconciled 260828-0907 (HEAD ffc6ae88): still `_o_`. Searched `shared/analyses/`, `shared/planning/` and the other four `260828-0904_*` records for an answer; none records one. The "twelve shipped lines" figure the cross-referenced issue carries is sixteen at HEAD (issue `260828-0900_*`, reconciliation note).
