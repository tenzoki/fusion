An untracked zero-byte `Test.txt` sits at the repository root, and no ignore rule covers it

---

`/Users/k1/Projects/productive/fusion/Test.txt` is 0 bytes, untracked, and `git check-ignore`
returns nothing for it. It was written at 07:58 on 2026-08-19, one minute after commit `06ab15b`.
Nothing in the tree references the name.

---

## What is wrong

The file is harmless in itself. What makes it worth a record is that nothing stops it being
committed. `/fusion:cleanup` stages and commits the session's work, and any pass that reaches for
`git add -A` or `git add .` at the repository root takes an unexplained file into the plugin's
history, where a later reader has no way to learn what it was for. `install.sh` copies a named set of
assets rather than the whole tree, so it would not reach an end user's install; the exposure is the
repository, not the distribution.

It was seen and deliberately not filed. The Turn-2 review records it under
`## Two working-tree observations, filed nowhere`
(`shared/reviews/260819-0832-coderev-turn-2-ten-closures-carried-scope-and-the-baseline-re-approval.md`),
correctly noting it is outside the range it was reviewing. A review document is not a filing home:
`rules/fusion-workbench-conventions.md` `## Issue and Decision Filing` names review documents
explicitly among the places an item must not be left. This record moves it to one.

## Fix direction

Delete it. `rm Test.txt` at the repository root, by whoever knows they created it — which nobody in
this session's records claims. If it turns out to be a deliberate fixture, it needs a name that says
so and a line in `.gitignore` or in the test that uses it.

The second working-tree observation in the same review section is **not** filed here: a detached
`git worktree` registration at `3a0408a` under another session's scratchpad belongs to that session
and is not this repository's state to correct.

**Found by:** reconciler, final reconciliation of session `260818-2301`, verified at HEAD `83488e9`.
No Circle is active, so it is filed in the shared store under the Origin Rule.
