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
`260717-0030_*_git-stash-include-untracked-can-sweep-the-stash-directory.md`:
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

**Reconciliation 260809-1651-reconciliation.md (reconciler, domain `code`) — stays `_o_`. Neither part of the fix has been applied.**
`git ls-files fusion-workbench/.commit-lock/` still returns `fusion-workbench/.commit-lock/holder`, so part 1 (`git rm --cached`) has not run; the path shows as ` D` in the working tree only, which is the deletion this record already describes and not its removal from the index. `.gitignore` carries no `fusion-workbench/.commit-lock/` entry, so part 2 has not run either. The broader question the record raises — whether `.session-marker`, `.active-circle` and `.guard-state/` belong in the same pass — is answerable now with one observation: `.session-marker` and `agentstate.yaml` are both untracked and show as `??`, while `.guard-state/` is tracked and its four files are modified on every session. So the same sweep hazard applies to `.guard-state/` today, with the difference that its churn is continuous rather than transient.

---
Resolved: the holder file is ignored and untracked, and the other nine root-anchored surfaces were each decided rather than swept.

The dividing line used was a question, not a category: **does an earlier version of this file make a statement, or does it only describe the present?**

Kept tracked (3): `orchestrator-events.jsonl` (append-only across all sessions, read cross-session by the monitor, `/fusion:cadence` and the stash protocol, 149 KB over the project's life); `tasklist.md` (written prose with reasoning, acceptance wording and verified-open notes, not a machine refresh); `portfolio.md` (regenerated whole, but each version is a complete briefing — left tracked deliberately where the case was arguable rather than guessed at).

Ignored (7): `.commit-lock/*` (a mutex whose lifetime is one commit — the original defect); `.session-marker` (a heartbeat whose signal is the mtime); `.active-circle` (a pointer at now, six commits of add/delete twitching, whose durable statement lives in the Circle markers and the event log, and which `/fusion:circle-pop` restores from the stash manifest rather than from git); `agentstate.yaml` (session state overwritten per Turn; resume reads the working tree, never history); `.guard-state/*` (counters, plus a 7.4 MB `events.jsonl` that grows per tool call and already has an open record as an unbounded writer — `.gitignore` already ignores exactly this class under `fusion_journal/audit/*.log`); `orchestrator-live.md` (the running Turn's dashboard view, rewritten by the tracker hook on every call, whose durable counterpart is the session history); `monitor` (a byte-identical copy of the tracked `bin/monitor`, recreated by `/fusion:setup` — it showed as modified precisely because Setup had copied a newer one over the tracked duplicate).

Six paths were untracked in the commit below: `.commit-lock/holder`, the three `.guard-state/*` files, `monitor`, and `orchestrator-live.md`. The whole index was checked against the new patterns; no other tracked path in the repository is hit.

Two mechanical points that were measured rather than assumed. Every pattern is anchored at the repository root (`fusion-workbench/...`) so the copies inside `stashes/<id>/` stay tracked — an unanchored `agentstate.yaml` would have taken the stash copies with it. And directories are written `dir/*` rather than `dir/`, verified in a throwaway repository: with `d/*` a later `!d/keep` works, with `d/` it does not, which is the pattern rule `CLAUDE.md` records.

**The second half, which two other tasks were waiting on.** The answer is stated in `rules/fusion-workbench-conventions.md` § "Which of them a tracked workbench tracks", directly under the enumeration of root-anchored surfaces, with the two consequences that hang on it: nothing in the ignored group survives a fresh clone, so no skill may promise that git holds the bytes (`260801-1020` archive durability); and an ignored path is skipped by `git stash --include-untracked` but not by `git stash --all` or `git clean -xdf` (`260717-0030_*_git-stash-include-untracked-can-sweep-the-stash-directory.md` stash sweep). It was placed in the conventions rather than in `rules/workbench-stash-and-lock.md` because the latter is emitted to the orchestrator only, while both dependent tasks route to `coder`, which receives the conventions.

Cost stated: 2151 bytes in a file every agent loads on every dispatch.

Session: `260810-0241-orchestrator-session.md` (task T15).
