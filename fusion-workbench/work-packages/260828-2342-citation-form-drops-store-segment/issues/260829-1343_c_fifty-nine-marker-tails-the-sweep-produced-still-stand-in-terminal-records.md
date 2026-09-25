Fifty-nine marker tails the sweep produced still stand in terminal records
---
Commit B's message says 239 tails of the shape `<basename>.md_o` were stripped by hand. At HEAD `e9f2ed0b`, `grep -rEo '\.md_[a-z]\b|\.md\.md' fusion-workbench --include='*.md'` still finds 59 in 24 files: 39 in `history/`, 10 in `analyses/`, 5 in `issues/`, 3 in `decisions/`, 2 in `planning/`; every record among them is terminal (`_c_`/`_i_`), so no gate sees them. `bin/fusion-citation-check` reports each as `dangling` (they are among its 260 dangling rows on this repo, `verdict=violations`), which is the verdict `/fusion:cleanup` Step 8 now prints for fusion's own tree.
---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260829-1333_*_the-citation-sweep-is-not-idempotent-a-truncated-citation-gains-a-marker-tail-on-rewrite.md` (the mechanism that produced them)

Acceptance: the same grep returns nothing, or the citing lines are fenced where the spelling is the datum; and the cleanup verdict for this repo is stated once with its residual dangling count explained.

Also seen: 260829-1344 by orchestrator — the active Circle record itself carries three such tails in its `## Activation proposal` section (`…report.md_*`, `…scan-store.md_*`, `…mandates.md_*`), so the class is not confined to terminal records.

---
Resolved: 260829-1420, coder (Turn 2 task R1). Stripped by the sweep's new `--repair` pass together with the wider set the coderev issue counts (239 chained tails and 9 doubled basenames, `archive/` and terminal records included, the three in the active Circle record's activation proposal among them). The grep `\.md_[a-z]\b|\.md\.md` over `fusion-workbench` now returns only the two exhibits in `260829-1346_*_the-committed-sweep-rewrote-29-date-head-fields-into-filenames-and-left-181-chained-tails-in-the-tree.md`, where the spelling is the datum. `bin/fusion-citation-check` on this repository: `store-prefixed=0`, `dangling=248` (209 dangling, 39 stale-marker), of which 56 rows sit in terminal records and 190 in markerless history, analysis and review files; the rows are pre-existing dead pointers (deleted or never-filed records, task nicknames written as stamp-names) plus truncated citations the widened grammar now sees and the old one counted as bare stamps.

Reconciled: 260829-1805, reconciler. Closure verified at `3276b1e1` and re-verified at `a60d1fea`: `bin/fusion-citation-sweep` dry-run over the tree prints `rewrites=0`, `bin/fusion-citation-check` prints `store-prefixed=0`, `npm test` 805 green.
