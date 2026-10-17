migrate: the v13 Undo note names `rollback --end-fence` for a fence the undo left with no chunk landed, but with an intent pending the helper names it nowhere and `--end-fence` refuses
---
`docs/upgrading-to-v13.md` `**Undo.**`: "Where a fence the undo left still stands, the helper refuses to set the record aside and names how that fence is ended: a `rollback --end-fence` of the same record, once no rollback chunk landed under it." An undo cut inside its first chunk, followed by a git reset, meets that premise: the record is stale, its own fence stands, no rollback chunk is stored. Its intent is still pending, though. Then `set-aside` names "the tool that set it" rather than `--end-fence`, and `--end-fence` gives the generic refusal. 13.1.10 added the no-intent condition to the next sentence in the same paragraph and not to this one.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261017-1637-reviewer-closing-pass-over-the-migrate-landed-cell-docs-stale-condition-package.md`, `261017-1610-plan-migrate-landed-cell-docs-stale-condition.md`, `261016-1436-how-is-a-rollback-fence-ended-that-a-git-reset-left-standing-over-a-legacy-tree.md`

**Evidence (at `2615df08`).**
- The sentence quoted above is at `docs/upgrading-to-v13.md` `**Undo.**`. It is unchanged in the range `f95c0b28..2615df08` and dates from `0be7ecbd`.
- `hooks/migrate.ts` `idleFence` returns null when `intentStands`. `endLeftFence` then skips the idle branch, and `landedFence` is null too (no chunk stored), so the subcommand ends on "no fence of a refused rollback stands on a store under JSON control, nor an idle fence of this record over a legacy store; nothing was sent".
- `hooks/migrate.ts` `setAside`, the same cell: `fence === null`, so the refusal is "a fence or a pending intent stands (…), and `run` refuses while it stands, so <session> stays; the tool that set it closes it." It does not name `rollback --end-fence`.
- Reproduced in a scratch clone: run, commit, then `rollback` with the directory of one of chunk 2's control files read-only, so rollback chunk 2 failed mid-write (exit 7, `EACCES` on unlink), leaving its intent under `.json-state/journal/`. Then `git reset --hard HEAD~1`. `status`: `state=legacy`, a fence equal to the record's `rollback.begin_id`, `record=stale`. No rollback chunk was stored, and the journal still held the chunk 2 intent. `rollback --end-fence` exited 5 with the generic refusal above. `set-aside --consent` exited 5 with "the tool that set it closes it".
- The header's `set-aside` entry is correct here ("naming `rollback --end-fence` where it ends it"), and so is its idle-fence sentence, which lists "no intent is pending". The README's idle-fence clause says "a fence its own refused rollback left", which leaves out an interrupted undo. So only the docs sentence states this premise.
- The ruling cited above leaves this class undecided ("A pending intent that survives a reset belongs to the same class … This record does not decide it."). This issue asks for nothing about the behaviour, only that the note stops promising `--end-fence` here.

**Fix direction.** Add the missing condition to the sentence. In substance: "… a `rollback --end-fence` of the same record, once no rollback chunk landed under it and no intent is pending." Optionally, say what the helper names when an intent stands. Keep the new words unbackticked. No code change.

**Acceptance.** No sentence of `docs/upgrading-to-v13.md` `**Undo.**` states a premise that the mid-chunk-cut-then-reset cell above meets while naming `rollback --end-fence` as its way out. `reference-resolution-lint` passes with no edit to `BASELINE`.
