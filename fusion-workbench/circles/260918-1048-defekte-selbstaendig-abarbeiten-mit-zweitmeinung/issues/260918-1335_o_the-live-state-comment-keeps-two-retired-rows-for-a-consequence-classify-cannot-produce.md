The LIVE_STATE comment keeps two retired rows for a consequence `classify()` cannot produce
---
The `LIVE_STATE` doc comment in `hooks/lib/staging-drift.ts` (the paragraph headed "Two entries are held past the layout that named them, deliberately") argues that dropping the `agentstate.yaml` and `orchestrator-live.md` rows "would move an upgrading project's leftover copies from `in-flight` … to `record`, where the report says a commit forgot to carry them". At HEAD `ROOT_RECORDS` is empty and neither basename matches a `STORES` segment, the `_circle.md` branch or the commit-message name, so a root-level leftover with no row falls to `unclassified` — printed, nothing claimed, no `UNSTAGED`, no entry in the verdict. The two rows are kept for a consequence the classifier cannot produce.
---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260911-1339_*_staging-drift-still-classifies-a-pointer-a-rule-says-nothing-creates-and-names-a-turn-boundary-trigger-it-does-not-have.md`

**Route:** `coder` — a TypeScript source comment (and possibly two rows of a constant) plus its built `hooks/dist/` copy.

**Evidence:** `grep -n 'const ROOT_RECORDS' hooks/lib/staging-drift.ts` prints the empty-array declaration; the comment's "to `record`" sentence sits in the `LIVE_STATE` block above the constant. Reproduce the true consequence without editing: `node -e 'import("./hooks/dist/lib/staging-drift.js").then(m=>console.log(JSON.stringify(m.classify("some-root-leftover.md",""))))'` from the project root prints `klass` `unclassified` — the class a root-level basename with no row lands in. The fix under `260911-1339_*` removed the `.active-circle` row on the same reasoning and did not touch this block, which is why it is filed rather than fixed.

**Acceptance:** either the comment states the true consequence (a dropped row moves a leftover to `unclassified`, printed and unclaimed — which is then an argument for dropping the rows, not for keeping them), or the two rows go with the comment paragraph; in both cases `hooks/dist/lib/staging-drift.*` is rebuilt and `cd hooks && npm test` exits 0. Change no other row of `LIVE_STATE`.
