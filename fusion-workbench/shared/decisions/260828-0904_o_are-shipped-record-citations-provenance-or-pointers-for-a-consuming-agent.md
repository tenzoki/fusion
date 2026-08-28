# Are the record citations in the shipped prompts provenance for fusion's maintainers, or pointers a consuming agent is meant to follow?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `shared/issues/260828-0828_*_fusion-citation-bookkeeping-defect-report.md`, `shared/analyses/260828-0859-citation-bookkeeping-defect-report-measured-against-fusions-own-corpus.md`, `shared/issues/260828-0900_*_twelve-shipped-lines-tell-a-consuming-agent-that-one-of-fusions-own-records-sits-in-its-scan-store.md`, `shared/analyses/260818-0715-preventing-fusion-internal-identifiers-from-reaching-a-consuming-project.md`

---

## Question

Twelve shipped lines in seven files tell an agent that one of fusion's own records sits "in `$SCAN_DECISIONS`". Those keys resolve to the consuming project's stores, where the record has never existed; `install.sh` ships no workbench. Is a shipped citation of a fusion record meant to be followed at run time, or is it the maintainers' provenance?

## Options

1. **Provenance** — shipped citations name fusion's own workbench explicitly (`fusion's workbench: …`) and never a consumer resolver key; an agent is told not to look for them. Pros: honest, no run-time cost. Cons: 12 lines to reword, and a lint to keep the key form out.
2. **Pointer** — fusion ships the cited records (or their substance) so the citation resolves in a consumer. Pros: the Grounding travels. Cons: ships workbench content, growth against the surface bounds.
3. **Substance inline** — pull the decision's substance into the prompt line and drop the citation (the form decision `260805-0709` already prescribes for dead paths). Pros: no pointer to break. Cons: prompt growth per line.

## Constraints

The always-on rule set and `agents/` carry failing growth bounds; option 2 and 3 cost bytes there.

## Recommendation

Option 1, with the analysis's prior verdict (260818-0715) as precedent that fusion-internal identifiers should not reach a consumer as instructions.

---
Reconciled 260828-0907 (HEAD ffc6ae88): still `_o_`. Searched `shared/analyses/`, `shared/planning/` and the other four `260828-0904_*` records for an answer; none records one. The "twelve shipped lines" figure the cross-referenced issue carries is sixteen at HEAD (issue `260828-0900_*`, reconciliation note).
