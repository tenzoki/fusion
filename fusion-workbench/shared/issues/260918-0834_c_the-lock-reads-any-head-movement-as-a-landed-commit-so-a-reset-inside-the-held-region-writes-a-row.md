The lock reads any HEAD movement as a landed commit, so a reset inside the held region writes a row

---
`emit_commit_event` decides that a commit landed from `[ "$head" = "$before" ] && return 0` — inequality alone. A `git reset` inside the held region moves HEAD without creating anything, so the lock appends a `commit` row naming a commit the session did not make.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Where.** `bin/fusion-commit-lock`, `emit_commit_event`, the third line of its body. `before` is the pre-command HEAD the `with` branch passes; the function compares the two short hashes and treats any difference as a landed commit.

**Measured** in the consuming project `axibra-1` on 2026-09-18. A parallel checkout had done the same removal this session had, so the session rebuilt its branch:

```
fusion-commit-lock with orchestrator -- bash -c 'git reset --hard origin/main'
```

HEAD moved from `00b75ef7a` to `e87c02be0` and the lock appended:

```
{"ts":"2026-09-18T05:38:48","event":"commit","person":"Kai Stalmann <ks@qantr.com>","checkout":"394711f6","session_id":"3de47c24-4c33-457d-923e-2acda29b82dc","detail":"e87c02be0 chore(session): the event row of the closing merge"}
```

That commit is real and was authored by another checkout hours earlier. The row claims this session landed it. It also dirtied the tree, which blocked the next `git cherry-pick` until the row was committed — so the false row cost a commit of its own.

**Why the obvious repair does not work.** `git rev-list --count "$before..HEAD"` is the first discriminator to reach for and it does not separate the cases: the reset above lands on a ref carrying 22 commits `00b75ef7a` never had, so the count is greater than zero exactly as it is after a real commit. The two look identical to every question asked of the range alone.

*Inference, not verified:* what does separate them is whether a commit **object was created** by this command. Two inputs could answer that and neither has been tried — the committer date of HEAD against the moment the held region started, or the reflog entry the operation wrote (`commit` against `reset`). Both are cheap. Whether either is sound under a replayed commit, a `--date` override or an amend is not established here, and this record does not choose between them: `rules/critical-stance.md` §4's reading applies, and the mechanism is what changes rather than the predicate being patched to cover today's counter-example.

**Acceptance test.** Wrap `git reset --hard <other-ref>` in `fusion-commit-lock with` and assert no `commit` row is appended. The sibling records' own cases must keep passing: a region landing a code commit and then a log-only one still emits (`260915-1845_*_the-log-only-predicate-reads-head-alone-so-a-wrapped-command-landing-two-commits-can-lose-its-row.md`), and a merge landed in the region still emits (`260915-1844_*_a-union-merged-log-merge-is-read-as-log-only-so-three-shipped-statements-about-merges-are-false.md`).

**Cross-references:** `260915-1845_*_the-log-only-predicate-reads-head-alone-so-a-wrapped-command-landing-two-commits-can-lose-its-row.md` · `260915-1844_*_a-union-merged-log-merge-is-read-as-log-only-so-three-shipped-statements-about-merges-are-false.md` · `260915-1843_*_the-commit-lock-can-settle-the-tree-and-no-shipped-body-makes-the-settling-commit.md` · `foreign:axibra-1:260918-0540_*_the-commit-lock-writes-a-commit-row-for-a-reset-because-it-reads-head-before-and-after.md` (where it was first filed). All three siblings work the same `before..HEAD` region in `emit_commit_event`, so a repair here should be read against them rather than written beside them.

---
Resolved: `bin/fusion-commit-lock` now writes the row only for a commit OBJECT created in the held region: the `with` branch records `region_start` (epoch seconds, taken beside `head_before` after the acquire) and `emit_commit_event` returns before the log-only test unless HEAD's committer date (`git show -s --format=%ct HEAD`) is at or after it, `-ge` because a commit ordinarily lands in the second the region began. The two open questions were measured in a scratch repository before the header was written: `git commit --amend` and `git cherry-pick` each land a fresh committer date and keep their row; `git reset --hard` onto an older commit and a fast-forward onto older commits land on an old date and write none; `git commit --date` moves the author date only. The record's acceptance case is `fusion-commit-lock.test.ts` "writes no row when the command moved HEAD onto a commit that already existed" (the fixture targets are dated 2020 so a same-second root cannot read as created); on a scratch copy of the script with the committer-date line disabled the reset wrote its row (rows=1), with the shipped script rows=0, and the sibling cases (log-only, the two log merges, code-then-log region) pass unchanged. Residuals accepted and stated in the script header and `rules/commit-lock.md`: a created commit whose committer date was set before the region (`GIT_COMMITTER_DATE`, `--committer-date-is-author-date`) writes no row; a fast-forward or reset onto commits another party committed after the region began, or whose clock runs ahead, writes a false row naming a commit made during the region. The reflog alternative was not taken (it needs an allow-list of commit-creating actions). Second opinion: consultant, accepted. Plan `260921-1726_*_the-33-open-defects-of-the-11-9-1-survey-worked-autonomously-as-one-package.md` step 18, fixed in the commit that carries this line.
