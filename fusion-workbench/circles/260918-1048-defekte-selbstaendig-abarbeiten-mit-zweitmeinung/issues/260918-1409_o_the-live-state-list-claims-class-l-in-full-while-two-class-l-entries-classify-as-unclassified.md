The LIVE_STATE list claims class L "in full" while two class-L entries classify as `unclassified`
---
The doc comment above `LIVE_STATE` in `hooks/lib/staging-drift.ts` says the list "is read off `rules/workbench-tracking.md` `## The four classes`, and it holds two of that partition's classes in full". At HEAD `f7545a4c` that rule's class L row names `.session-marker`, `.checkout-id`, `.cadence-anchors`, `.commit-lock/`, `monitor` and `.guard-state/`. `.checkout-id` and `.cadence-anchors` have no row in `LIVE_STATE` and no prefix in `LIVE_PREFIXES`, so `classify()` returns `unclassified` for both. The list is not class L in full, and the comment's "which is the property to check when the layout gains a root-anchored entry" was not checked when those two entries arrived.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260911-1339_*_staging-drift-still-classifies-a-pointer-a-rule-says-nothing-creates-and-names-a-turn-boundary-trigger-it-does-not-have.md` (the fix that edited this comment block and reasoned from its class-L claim), `260918-1335_*_the-live-state-comment-keeps-two-retired-rows-for-a-consequence-classify-cannot-produce.md` (the same block's other stale paragraph; a fix to one should read the other)

**Route:** `coder` — a TypeScript constant and its doc comment, plus the rebuilt `hooks/dist/lib/staging-drift.*`.

**Evidence, at `f7545a4c`.**

- `rules/workbench-tracking.md` `## The four classes`, class L row: "`.session-marker`, `.checkout-id`, `.cadence-anchors`, `.commit-lock/`, `monitor`, and `.guard-state/` in full".
- `hooks/lib/staging-drift.ts`, `LIVE_STATE`: rows for `.session-marker`, `monitor`, `portfolio.md`, plus the two retired rows and the three R2/R3 rows; `LIVE_PREFIXES`: `.guard-state/`, `.commit-lock/`. No `.checkout-id`, no `.cadence-anchors`.
- Probed on the compiled module from the project root:

  ```
  node -e 'import("./hooks/dist/lib/staging-drift.js").then(m=>console.log(JSON.stringify(m.classify(".checkout-id",""))))'
  {"klass":"unclassified","why":"not a record store and not live state — nothing is claimed about it"}
  ```

  `.cadence-anchors` prints the same.
- The same comment paragraph spans class L as "`.session-marker` through `portfolio.md` below". `portfolio.md` is not in the rule's class L row (its row's own `why` says v11 removed it), so the span names a retired row as the end of a live class — a third retired row beside the two `260918-1335_*` names.

**Consequence.** Both entries are gitignored in this repository (`.gitignore:96`, `:99`), so in a project following the shipped split they never reach `git status`. In a project that tracks its workbench differently they print under `unclassified` ("nothing is claimed about it") instead of `in-flight`; `fault` is false either way, so no verdict changes. The defect is the comment's guarantee, which the `260911-1339_*` fix read as its ground for removing a row, and which is false for two entries the rule names.

**Cross-cutting.** `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` says a new root-anchored surface "lands in this tree and in the record-or-live-state split in `rules/workbench-tracking.md`, both in the same commit". The classifier is a third consumer of that split and the sentence does not name it, which is how two entries reached the tree and the rule without reaching the list.

**Acceptance.** `LIVE_STATE` (or `LIVE_PREFIXES`) carries a row for every entry the class L row of `rules/workbench-tracking.md` `## The four classes` names, or the comment stops claiming "in full" and says which entries it omits and why; the class-L span sentence names no retired row; `hooks/dist/lib/staging-drift.*` rebuilt; `cd hooks && npm test` exits 0. Whether the conventions' same-commit sentence gains the classifier as a third site is a one-line rule edit to decide with the fix, not to assume.
