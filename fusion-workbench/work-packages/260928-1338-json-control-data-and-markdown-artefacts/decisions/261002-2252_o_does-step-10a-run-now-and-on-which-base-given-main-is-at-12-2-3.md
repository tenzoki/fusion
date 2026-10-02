# Does FJ04 step 10a (13.0.0, closing the v12 window) run now, and on which base, given `origin/main` is at 12.2.3?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-1338-json-control-data-and-markdown-artefacts.md, 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md, 261002-2128_*_should-a-second-run-no-op-plan-stay-a-later-operation-that-blocks-rollback.md

---

## Question

Step 10a sets `plugin.json` to 13.0.0 and makes the closing release's deletions: the transition subsection, the legacy store entries, the `Executor:` alias, the manifest's old-name match, and setup's continue-on-legacy case turned into a refusal. Steps 11 to 13 depend on it.

The package runs under `**Mode:** autonomous` while the user is away. Under that mode a destructive operation is filed and skipped, never answered by the field. 10a removes features, so the orchestrator stopped before it.

A second fact changes the step's ground. Measured on 2026-10-02 22:52: `fj-json-workbench` carries `plugin.json` 12.0.0, while `origin/main` is at `48f0c9ff`, fusion 12.2.3. That is 45 commits the branch does not hold. The step's dependency line reads: "The branch carries `origin/main`'s 12.0.1 changes before this step, or the note names that it does not; merging is the user's git act." The branch also holds 144 commits not pushed to `origin/fj-json-workbench`.

## Options

1. **Merge `origin/main` into the branch first (the user's act), then run 10a on the merged tree.**
   - Pros: 13.0.0 follows 12.2.3 and keeps its fixes; the bounds' merge rule applies once.
   - Cons: the merge must be done and checked before 10a; the growth-bound baselines move at the merge event.
2. **Run 10a on the branch as it stands, the note naming that main is not merged.**
   - Pros: 11 to 13 can proceed at once.
   - Cons: 13.0.0 would lack 12.0.1 to 12.2.3's changes until a later merge, and that merge then carries the deletions against 45 commits of main.
3. **Hold 10a and the steps after it** until the user is back.

## Recommendation

Option 1. Advisory only; the merge and the destructive step are the user's to authorise.
