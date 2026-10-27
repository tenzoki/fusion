skill-news prior opening says the seen mark does not outlive the run
---
`catalog/profiles/skill-news/parts/01-prior.md:1` lists "that the seen mark does not outlive the run" among the host differences. That is false under Prior's step-17 model. It also contradicts line 46 of the same file, which says the mark Step 5 writes reaches the checkout with the run's integration (map row K19). The statement map has no row for line 1.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** 261027-2337-reviewer-13-4-1-pre-release-steps-2-to-7.md (finding 2), 261027-2145-entry-delivery-model-statement-map.md (row K19)

Fix: drop the clause, so the sentence reads "…how a block runs, that the container has no network unless the entry declares its remote, and that this run pulls nothing."

Acceptance: `grep -rli outlive` over the `*-prior.md` parts of the 25 supported entries prints nothing. `FUSION-CATALOG` and `CLAUDE-RENDER` exit 0.

---
Resolved: in `catalog/profiles/skill-news/parts/01-prior.md`, the opening paragraph (line 1) no longer lists "that the seen mark does not outlive the run"; the sentence now ends "…unless the entry declares its remote, and that this run pulls nothing.", consistent with line 46 (the mark reaches the checkout with the run's integration). `grep -rli outlive` over the `*-prior.md` parts prints nothing.
