migrate: the helper header and the README-hooks row still describe the landed-fence cell as chunks that landed "before the reset"
---
13.1.7 took the presupposed git reset out of the landed-fence message and out of `docs/upgrading-to-v13.md`. 13.1.8 took it out of the `idleFence` doc comment. Two documentation mirrors of the same cell still presuppose it. `landedFence` checks no reset: it holds on any tree that reads as legacy Markdown with rollback chunks of this record stored, a tree made stale by hand included.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261017-0849-reviewer-closing-pass-over-the-help-13-1-7-credit-and-idlefence-comment-package.md`, `261016-2123-migrate-landed-fence-message-asserts-a-git-reset-it-never-checked.md`, `261017-0000-reviewer-closing-pass-over-the-migrate-landed-fence-wording-package.md`

**Evidence (at `0dbce04b`).**
- `bin/fusion-migrate` header, `rollback --end-fence` entry: "Where rollback chunks landed before the reset, it names them and the hand deletion of that file …".
- `README-hooks.md` `## Files`, the `migrate.ts` row: "… rollback chunks landed before the reset, its refusal names them and the hand deletion of `.json-state/maintenance.json` …".
- `hooks/migrate.ts` `landedFence`: `own === null || own.landed.length === 0 || intentStands(wb, i) ? null : own`, with `ownFence` checking `i.state === "legacy"` and the fence id. No reset is read. Its own doc comment says "nothing checks for one".
- The closing review of the previous package called the `idleFence` comment "the last place the code describes the cell by its usual cause". These two mirrors show that was not so.

**Fix direction.** Reword both clauses the way `docs/upgrading-to-v13.md` `**Undo.**` already reads: chunks of the undo landed and the tree then reads as legacy Markdown, a git reset being one way there. No code change. Neither file is in `hooks/lib/__tests__/fixtures/surface-growth.golden` (its sections are agents, skills and hook tests). Keep every backticked citation byte-identical so `reference-resolution-lint` does not move.

**Acceptance.** Neither `bin/fusion-migrate` nor the `migrate.ts` row of `README-hooks.md` contains "before the reset". Each names a reset only as one possible way into the cell. `reference-resolution-lint` passes at its `BASELINE` with no edit to it.
