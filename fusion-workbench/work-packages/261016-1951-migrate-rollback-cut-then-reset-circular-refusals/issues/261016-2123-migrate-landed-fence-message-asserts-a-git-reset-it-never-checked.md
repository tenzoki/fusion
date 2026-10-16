/fusion:migrate: the landed-fence message asserts a git reset and "nothing was written or lost" without checking either
---
`landedThenReset` in `hooks/migrate.ts` states the cause as fact: "then the tree was reset to Markdown, so its plan index is gone". `landedWay` adds "nothing was written or lost". `landedFence` does not check either claim. It tests stale, legacy, this record's fence, chunks landed and no intent. A tree that meets those tests without any reset gets the same false text.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261016-2123-reviewer-closing-pass-over-the-migrate-rollback-cut-then-reset-package.md`, `261016-1958-is-a-rollback-fence-ended-when-the-rollback-landed-chunks-and-a-git-reset-then-took-the-tree-back-to-markdown.md`

**Evidence.** Reviewer probe, run in a scratch clone at `74992939` with the real bundle and the `killPlugin()` kill stand-in. Run, then a rollback killed at `{phase: "rollback", chunk: 2}`. No commit and no reset. Then `archive/migrations/<id>/plan.json` was deleted by hand. `status` printed `state=legacy`, `record=stale` and the fence. `set-aside --consent` exited 5 with:

> a rollback of this record landed rollback chunk 2, then the tree was reset to Markdown, so its plan index is gone and the fence … stands; no command of this helper ends that fence, and nothing was written or lost; this tree still carries control state of the migration (24 of the 41 control paths the proposal lists stand), so the fence must stay.

`rollback` and `rollback --end-fence` printed the same text. No reset took place. Rollback chunk 2's writes are still in the tree, and the plan index is lost. So "reset to Markdown", "so its plan index is gone" (as an effect of a reset) and "nothing was written or lost" are all false here. The safety outcome is correct: no deletion was named, and the fence stayed byte-identical.

**Scope.** `hooks/migrate.ts` `landedThenReset` and `landedWay`. Every caller reaches them: `current`, `setAside`, `endLeftFence`, and `preconditions` (the sibling branch). The way out stays correct. This is a wording defect only.

**Fix direction.** Give the situation as the helper observed it, not as an inferred cause. For example: "a rollback of this record landed rollback chunk(s) N, and this tree carries neither its plan index nor chunk 0's answer (a git reset does this)". In the K>0 branch, drop "nothing was written or lost", or limit it to "nothing was written by this call".

**Acceptance.** In `hooks/lib/__tests__/migrate.test.ts`, the probe above (no reset, plan index deleted by hand) runs `set-aside --consent`. It exits 5, its stderr does not state that the tree was reset and does not contain "nothing was written or lost", and `.json-state/maintenance.json` stays byte-identical. The extended "cell A reset with git" case stays green.

---
Resolved: 2026-10-16, plan `261016-2331-plan-migrate-landed-fence-wording-and-unverified-proposal-branch.md` steps 1 and 2. Pinned first in `hooks/lib/__tests__/migrate.test.ts`, the case "cell A: a rollback cut after its first chunk over a legacy tree is current …", row A: with no reset and the plan index deleted by hand, `status` gave `record=stale` and `set-aside --consent` exited 5 with "then the tree was reset to Markdown" and "nothing was written or lost" in its stderr, no deletion named and `.json-state/maintenance.json` byte-identical. In `hooks/migrate.ts`, `landedThenReset` now states only what its callers checked (the landed rollback chunks, the fence they began standing over a tree that reads as legacy Markdown, and the finding of `stale`), and names a git reset as a possible cause only; `landedWay` no longer says "nothing was written or lost". Row A now asserts that its stderr carries the finding of `stale` and neither "the tree was reset" nor "nothing was written or lost", and the case "cell A reset with git and cell C with a fence of another id" passes unchanged.
