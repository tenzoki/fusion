# Does fusion ship the citation sweep to consumers, or only the checker, and under which guards?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260829-1346_*_the-committed-sweep-rewrote-29-date-head-fields-into-filenames-and-left-181-chained-tails-in-the-tree.md, 260829-1347_*_the-grammars-marker-slot-is-one-letter-while-24-indexed-artifacts-carry-a-word-there-and-the-stamp-bare-rewrite-checks-no-boundary.md, 260828-0904_*_does-fusion-ship-a-citation-checker-to-consuming-projects.md

---

## Question

`bin/fusion-citation-check` reports and never writes; `hooks/scripts/citation-sweep.mjs` writes, and on fusion's own tree its first run rewrote 42 head fields and left 239 chained tails before a repair Turn. Both ship in the tarball. Does a consuming project get the sweep at all, and if so, which guards stand between it and a damaged workbench?

## Options

1. **Ship the checker only.** The sweep stays a fusion-internal script, not on the `bin/` surface, named in no skill or doc as a consumer tool. Pros: a consumer cannot damage its workbench with a fusion tool. Cons: a consumer with thousands of store-prefixed citations repairs them by hand or writes its own sweep (the report's author did).
2. **Ship the sweep as `bin/fusion-citation-sweep` with three guards:** `--write` requires a clean git work tree with a tracked workbench (else exit non-zero); the census per class is printed before any write and the run stops without `--yes`; bare-stamp resolution is not offered at all (removed in Turn 2). Plus a shipped idempotency test (dry run after write reports `rewrites=0`) that blocks a release. Pros: the repair the report asked for is available. Cons: a new helper with the one-release-behind cost, and a write path fusion has to keep safe.
3. **Ship the sweep as an opt-in cleanup pipeline step** behind `/fusion:cleanup --only citation-sweep`, with the same guards as 2 and the gate the pipeline already has. Cons: a write to every record in the workbench inside a wrap-up command.

## Constraints

Whatever ships, no fusion pipeline or skill runs the sweep automatically; `upgrading-to-v10-20.md` states which tool is for consumers.

## Recommendation

Option 2. The guards are mechanical, the test is what fusion's own run lacked, and the removal of bare-stamp resolution takes away the class that changed meaning.
