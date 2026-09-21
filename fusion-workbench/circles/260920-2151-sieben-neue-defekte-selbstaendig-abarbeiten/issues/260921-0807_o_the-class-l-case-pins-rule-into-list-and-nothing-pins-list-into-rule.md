The class L case pins rule into list, and nothing pins list into rule
---
`staging-drift.test.ts` now asserts that every entry the class L row of `rules/workbench-tracking.md` `## The four classes` names classifies `in-flight` (rule ⊆ list). Nothing asserts the converse: that every entry of `LIVE_STATE` and `LIVE_PREFIXES` in `hooks/lib/staging-drift.ts` is named by the rule's L, R2 or R3 cell (list ⊆ rule). A row the rule retires can therefore stay in the list unnoticed, which is the class of defect `260918-1335_*` was.
---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260918-1409_*_the-live-state-list-claims-class-l-in-full-while-two-class-l-entries-classify-as-unclassified.md` (the fix that added the one-directional case), `260920-2228_*_does-the-staging-classifiers-live-state-list-keep-rows-for-retired-surfaces.md` (the decision that made the list "exactly" the three classes, which is the property only half of which is checked)

**Route:** `coder` — a test case, and the two constants' `export`.

**Evidence.** The comment above `LIVE_STATE` states the list is "exactly class L, class R2 and class R3 … every entry those rows name and nothing else". The case added under `260918-1409_*` reads the class L row and probes each token through `classify()`; it cannot see a list entry the rule does not name, and it reads neither the R2 nor the R3 row. `LIVE_STATE` and `LIVE_PREFIXES` are module-private, so no test can read them.

**Second observation, same follow-on.** The layout tree in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` names `hooks/lib/staging-drift.ts` as a consumer beside `orchestrator-events.jsonl`, `.guard-state/`, `.commit-lock/` and `.session-marker`, and not beside `.checkout-id` and `.cadence-anchors`, which the classifier now holds too. The tree's own sentence says the column names a consumer that "only *names* the path, in an exclusion or classification list" as much as one that reads it.

**Acceptance.** `LIVE_STATE` and `LIVE_PREFIXES` are exported; one case in `staging-drift.test.ts` asserts each `path` and each `prefix` is a backticked token of the L, R2 or R3 row's Entries cell, a few lines inside the hook-test growth bound; the two layout-tree lines gain `hooks/lib/staging-drift.ts` in their consumer column; `cd hooks && npm test` exits 0.
