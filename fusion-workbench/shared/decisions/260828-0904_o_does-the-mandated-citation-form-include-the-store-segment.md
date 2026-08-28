# Does the mandated citation form include the store segment, and is the marker wildcard still needed once it is gone?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `shared/issues/260828-0828_*_fusion-citation-bookkeeping-defect-report.md`, `shared/analyses/260828-0859-citation-bookkeeping-defect-report-measured-against-fusions-own-corpus.md`, `shared/decisions/260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md`

---

## Question

`rules/fusion-workbench-conventions.md` `## Filename Patterns` shows a storeless example (`YYMMDD-HHMM_*_<topic>.md`) while its prose says "full filename", and the shipped text uses four forms (55 bare stamp, 44 storeless, 57 store-prefixed, 5 without extension). The consumer measured the store segment as the cause in 30 of 31 living dangling citations. Does the form carry the store? If not, the marker wildcard is the only variable left; does it stay?

## Options

1. **Storeless basename, marker wildcarded** — `YYMMDD-HHMM_*_<topic>.md`; the reader resolves against every store. Rests on (stamp, slug) uniqueness, which holds here at every scope (863/863 live, 1249/1249 with archive). Pros: survives both moves. Cons: a reader needs a find; two forms in the tree until the old one is swept.
2. **Store-prefixed path, marker wildcarded** (current prose) — survives marker moves only. Pros: opens directly. Cons: dies at archive.
3. **Both allowed, store optional** — the gate accepts either. Pros: no sweep. Cons: the convention stays four forms in practice.

## Constraints

Whatever form is chosen, the three citation gates and the archive skill's safety filter (`shared/issues/260828-0901_*`) must recognise it; a form the gate cannot read decays at the rate the method is used.

---
Reconciled 260828-0907 (HEAD ffc6ae88): still `_o_`. Searched `shared/analyses/`, `shared/planning/` and the other four `260828-0904_*` records for an answer; none records one. The "twelve shipped lines" figure the cross-referenced issue carries is sixteen at HEAD (issue `260828-0900_*`, reconciliation note).
