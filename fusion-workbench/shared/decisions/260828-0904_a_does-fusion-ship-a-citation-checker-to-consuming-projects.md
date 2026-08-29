# Does fusion ship a citation checker a consuming project can run, or is the convention checked only in fusion's own test suite?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260828-0828_*_fusion-citation-bookkeeping-defect-report.md`, `260828-0859-citation-bookkeeping-defect-report-measured-against-fusions-own-corpus.md`

---

## Question

The three citation gates live in `hooks/lib/__tests__/` and run only under fusion's `npm test`; a consuming project has no way to check its own corpus and the consumer built its own detector (offered in the report). Does fusion ship one, and in which shape?

## Options

1. **A `bin/` helper** (`fusion-citation-check`), wrapping the existing `citation-scan.ts` grammar, reporting like `bin/fusion-staging-drift` (stdout verdict, never a gate). Pros: one grammar, both sides. Cons: a new helper with the one-release-behind cost.
2. **A cleanup pipeline step** — the reconciler or the archive step reports dangling citations per run. Pros: no new surface. Cons: only at cleanup.
3. **Ship nothing**; the convention stays a rule. Cons: the report's mechanism, decay at the rate of use, stands.

## Constraints

Must not decide per-line what a citation *means* (pointer versus statement), which the conventions leave to fencing.

---
Reconciled 260828-0907 (HEAD ffc6ae88): still `_o_`. Searched `shared/analyses/`, `shared/planning/` and the other four `260828-0904_*` records for an answer; none records one. The "twelve shipped lines" figure the cross-referenced issue carries is sixteen at HEAD (issue `260828-0900_*_twelve-shipped-lines-tell-a-consuming-agent-that-one-of-fusions-own-records-sits-in-its-scan-store.md_*`, reconciliation note).

---
Answered: 260828-0904_*_does-fusion-ship-a-citation-checker-to-consuming-projects.md — option 1, user 2026-08-28: a bin/ helper `fusion-citation-check` wrapping the citation-scan grammar, stdout verdict, never a gate.
