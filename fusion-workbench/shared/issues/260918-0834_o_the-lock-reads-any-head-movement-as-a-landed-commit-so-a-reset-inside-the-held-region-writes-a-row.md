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
