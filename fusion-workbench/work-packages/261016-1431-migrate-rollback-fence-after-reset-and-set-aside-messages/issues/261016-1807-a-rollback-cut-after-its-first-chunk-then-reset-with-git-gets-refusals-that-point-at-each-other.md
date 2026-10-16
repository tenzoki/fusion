A rollback cut after its first chunk, then reset with git, gets refusals that point at each other
---
After a rollback cut after its first chunk and a `git reset` back to Markdown, every `bin/fusion-migrate` subcommand refuses. The messages send the user in a circle. `rollback`, `resume` and `run` name `set-aside --consent` as the way out. `set-aside` refuses and says "the tool that set it closes it", and that tool is `rollback`, which refuses. `rollback --end-fence` gives its generic refusal. The fence stays byte-identical, which is correct. Nothing is lost, but no message names a step that works.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Severity:** Low
**Cross-references:** `261016-1807-reviewer-closing-pass-over-the-migrate-rollback-fence-after-reset-package.md`, `261016-1436-how-is-a-rollback-fence-ended-that-a-git-reset-left-standing-over-a-legacy-tree.md`

**The cell.** Decision 261016-1436 lists cell A as "record=current, `rollback` resumes". With the migration committed and then reset, the plan index leaves with the reset, so `stale()` reads that cell as stale (`hooks/migrate.ts` `stale`, the `s.rollback !== null` branch). The test "cell A reset with git and cell C with a fence of another id" in `hooks/lib/__tests__/migrate.test.ts` pins `record=stale` and the fence kept. It does not check what any message names.

**Reproduced** at `e4ad6fbf` in a scratch copy: `killPlugin()`, `run`, `git commit`, kill on `{phase: "rollback", chunk: 2}`, `rollback` exits 7, `git reset -q --hard HEAD~1`. Then:
- `rollback`, `resume`, `run`: exit 5, "The way out: `bin/fusion-migrate set-aside --consent` renames that directory …" (`current()`; `idleFence` is null because chunk 2's answer is stored).
- `set-aside --consent`: exit 5, "a fence or a pending intent stands (…), and `run` refuses while it stands, so … stays; the tool that set it closes it. Nothing was moved." (`setAside`, the non-idle branch).
- `rollback --end-fence`: exit 5, "no fence of a refused rollback stands on a store under JSON control, nor an idle fence of this record over a legacy store".

At 13.1.4 this cell was a dead end too: `set-aside` moved the record and `run` then refused for good. So this is not a regression. 13.1.5's Step 7 line now says the exit-5 stderr names "the way out", and here it does not.

**Fix direction.** `current()` should not name `set-aside` while a fence stands that `set-aside` will refuse on. Where that fence is this record's `rollback.begin_id` and a scheduled rollback chunk is stored, `setAside` and `current()` should name this situation in words: a rollback of this record landed chunks, then the tree was reset. They should also name what the user does, for example check out the commit that carries the migration and run `rollback` there. Whether that round trip is safe, and whether it is the way out at all, is open. The planner files it as a decision if needed. No fence may be removed in this cell.

**Acceptance.** In `hooks/lib/__tests__/migrate.test.ts`, extend the "cell A reset with git" case. The stderr of `rollback` and of `set-aside --consent` names neither `set-aside --consent` as a way out nor "the tool that set it" without naming it. It names this record's landed rollback chunks. `maintenance.json` stays byte-identical. If a way out is decided, the case takes it and ends at `result=legacy` or `result=json-control`.
