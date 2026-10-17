migrate: the reworded landed-cell docs drop the stale condition, so an interrupted rollback meets their premise and is not named
---
13.1.9 rewrote the landed-cell clause in the `bin/fusion-migrate` header and in the `migrate.ts` row of `README-hooks.md` to "where rollback chunks landed and the tree then reads as legacy Markdown (a git reset is one way there), [it / its refusal] names them". The helper names them only when the record is also stale. Cell A, a rollback interrupted after a chunk, meets the new premise, is current, and gets the generic refusal.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261017-1049-reviewer-closing-pass-over-the-migrate-landed-cell-docs-reset-wording-package.md`, `261017-0849-migrate-landed-cell-docs-in-the-helper-header-and-readme-hooks-still-presuppose-a-git-reset.md`, `261017-1027-plan-migrate-landed-cell-docs-reset-wording.md`

**Evidence (at `f95c0b28`).**
- `bin/fusion-migrate` header, `rollback --end-fence` entry: "Where rollback chunks of it landed and the tree then reads as legacy Markdown (a git reset is one way there), it names them …".
- `README-hooks.md` `## Files`, the `migrate.ts` row: "where rollback chunks landed and the tree then reads as legacy Markdown (a git reset is one way there), its refusal names them …".
- `hooks/migrate.ts` `endLeftFence`: `const shows = i.state === "legacy" ? stale(wb, s, i.state) : null;` then `const reset = shows !== null ? landedFence(wb, s, i) : null;`. The landed message is printed only when `stale` returns a finding. The three other callers (`preconditions`, `current`, `setAside`) gate on `shows` the same way. `landedThenReset`'s own doc comment lists `stale`'s finding among "only what the caller checked".
- `stale` returns null while a rollback is in flight and the plan index still holds. So a rollback cut after a chunk, before chunk 0, is legacy, own fence, chunks landed, and current.
- `hooks/lib/__tests__/migrate.test.ts`, the test "cell A: a rollback cut after its first chunk over a legacy tree is current, --end-fence leaves its fence": `status` reads `legacy`, a fence, `record=current`; chunk 2's answer is stored; `rollback --end-fence` exits 5 and the fence stays. By code reading (inference, the test asserts no stderr there) the refusal is the generic "no fence of a refused rollback stands on a store under JSON control, nor an idle fence of this record over a legacy store; nothing was sent", which names no chunk.
- The old wording, "landed before the reset", tied the clause to the reset tree of the sentence before it and so carried the stale case implicitly. The plan's `**Decidability:**` line reads the cell off `landedFence` alone and misses the callers' `stale` gate.

**Fix direction.** Name the stale record in both clauses, as `docs/upgrading-to-v13.md` `**Undo.**` does by context (its paragraph opens on `record=stale`). In substance: "where rollback chunks of it landed and the record is stale over a tree that reads as legacy Markdown (a git reset is one way there)". `record=stale` is already backticked later in the README row; adding a backticked token moves `reference-resolution-lint` only if it is a path, so keep the new words unbackticked. No code change.

**Acceptance.** Neither text states a premise that cell A meets: each names the stale record (or `record=stale`) as a condition of the landed clause. Neither contains "before the reset". `reference-resolution-lint` passes at its `BASELINE` with no edit to it.
