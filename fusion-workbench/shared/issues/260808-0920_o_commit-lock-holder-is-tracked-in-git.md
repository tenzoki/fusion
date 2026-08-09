The commit lock's transient holder file is tracked in git

---

`fusion-workbench/.commit-lock/holder` is under version control in this
repository. It entered the tree in commit `451a07e` and now shows as deleted in
`git status`, because the lock directory was removed when the lock was released.

---

Context.

The commit lock is root-anchored runtime state. `bin/fusion-commit-lock`
creates `fusion-workbench/.commit-lock/` with `mkdir`, writes three lines into
`holder` (tag, pid, acquired_at), and removes the whole directory on release.
Nothing in it survives a release, so nothing in it belongs in version control.

It became tracked because this repository is the one place where
`fusion-workbench/` is git-tracked rather than ignored (`.gitignore:50` carries
the exclusion commented out). A `git add` of the workbench that runs while a
commit is in flight sweeps the holder file in with the artifacts. That is the
same shape as the already-filed stash hazard in
`shared/issues/260717-0030_o_git-stash-include-untracked-can-sweep-the-stash-directory.md`:
a transient root-anchored surface caught by a broad stage in a tracked
workbench.

Two parts to a fix, and they are separable:

1. Remove the current entry: `git rm --cached fusion-workbench/.commit-lock/holder`.
2. Prevent recurrence: add `fusion-workbench/.commit-lock/` to `.gitignore`.
   The same question applies to the other root-anchored transients
   (`.session-marker`, `.active-circle`, `.guard-state/`), which should be
   checked in the same pass rather than one at a time.

Found during orchestrator Setup on 260808-0920. Not blocking: the lock is not
held, and `bin/fusion-commit-lock check` reports `not held`.

---

**Reconciliation 260809-1651 (reconciler, domain `code`) — stays `_o_`. Neither part of the fix has been applied.**
`git ls-files fusion-workbench/.commit-lock/` still returns `fusion-workbench/.commit-lock/holder`, so part 1 (`git rm --cached`) has not run; the path shows as ` D` in the working tree only, which is the deletion this record already describes and not its removal from the index. `.gitignore` carries no `fusion-workbench/.commit-lock/` entry, so part 2 has not run either. The broader question the record raises — whether `.session-marker`, `.active-circle` and `.guard-state/` belong in the same pass — is answerable now with one observation: `.session-marker` and `agentstate.yaml` are both untracked and show as `??`, while `.guard-state/` is tracked and its four files are modified on every session. So the same sweep hazard applies to `.guard-state/` today, with the difference that its churn is continuous rather than transient.
