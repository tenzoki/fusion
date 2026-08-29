The 17:23 queue rebuild and its history file never entered a commit, and survive only in the working tree

---

At HEAD `e2a34f0`, after eighteen commits of session `260810-1646-orchestrator-session.md`:

```
$ git log --oneline -1 -- fusion-workbench/tasklist.md
8b2a206 chore(release): v7.2.0          # the release BEFORE the session

$ git show HEAD:fusion-workbench/tasklist.md | head -6
**Generated:** 2026-08-10 14:34
**Git HEAD at build time:** `430d73a`
**Records inventoried:** 45

$ head -6 fusion-workbench/tasklist.md    # working tree
**Generated:** 2026-08-10 17:23
**Git HEAD at build time:** `5ef92eb`
**Records inventoried:** 47

$ git status --porcelain --untracked-files=all fusion-workbench/
 M fusion-workbench/tasklist.md
?? fusion-workbench/shared/history/260810-1723-tasklist-update.md
?? fusion-workbench/.commit-msg-tmp
```

The queue the whole session worked from — the 17:23 rebuild against `5ef92eb`, 2128 lines,
1409 insertions against the committed copy — is **uncommitted**. Its companion history file,
`260810-1723-tasklist-update.md`, is **untracked**. Neither is gitignored: the
workbench's `.gitignore` block lists six live-state paths (`agentstate.yaml`,
`orchestrator-live.md`, `.session-marker`, `.active-circle`, `.guard-state/*`, `.commit-lock/*`,
`monitor`) and `tasklist.md` is deliberately not among them —
`rules/fusion-workbench-conventions.md` `## Which of them a tracked workbench tracks` puts
`tasklist.md` in the **records** group, "authored text, not machine-refreshed", and says to track it.

Nothing lost it. Nothing would have noticed if something had: a `git checkout -- fusion-workbench/`
would have restored the 14:34 queue over the 17:23 one, and `git clean -xdf` would have taken the
history file, and both are ordinary commands.

---

**Why this happened, and it is not carelessness.** Turn 1 of this session produced the opposite
failure — a `git add -u` over a directory staged three deletions whose renamed successors were
untracked (`f38f37d`). The rule installed in response, now at `agents/orchestrator.md:419`, is a
shape rather than a flag ban: *every path passed to `git add` is one you wrote out yourself.* No
`-A`, no `-u`, no directory argument, no glob.

That rule makes over-staging impossible and under-staging invisible. A file nobody names is a file
nobody commits, and the queue rebuild ran before Turn 1 — dispatched at 17:23, forty-three minutes
before the first commit of the range — so no task's staging list had a reason to name it. The
Turn-1 defect was loud (three records left the index). This one is silent, and it lasted eighteen
commits.

**A third artefact, separate and smaller.** `fusion-workbench/.commit-msg-tmp` holds the commit
message of `d169b0d`, the last commit of the range. Two things about it:

1. `agents/orchestrator.md` Step 3b prescribes `/tmp/fusion-commit-msg-<task-id>.txt`. Nothing in
   `agents/`, `skills/`, `bin/` or `hooks/` mentions `.commit-msg-tmp` — `grep -rn commit-msg-tmp`
   over all four returns nothing. The path was improvised at commit time.
2. It is a **root-anchored** file in a tree that enumerates its root-anchored surfaces and calls the
   enumeration exhaustive: "The list is exhaustive as written, and it is a list rather than a count
   on purpose … When a `bin/` helper or a hook adds a root-anchored surface, it lands in this tree in
   the same commit" (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`). This one
   did not, because no helper added it.

Writing the message inside the workbench rather than under `/tmp` is what makes it a leftover at all:
`/tmp` is swept, the workbench is not, and the workbench is the tree `git status` reports on.

**What to fix, stated as questions rather than a prescription**, because more than one answer is
defensible and one of them belongs to `taskplanner`:

- **The immediate state** is repaired by staging the two files by name. That is a one-command fix and
  it closes nothing, because the next queue rebuild has the same exposure.
- **Who commits a queue rebuild?** `tasklist.md` is `taskplanner`'s alone to write, and `taskplanner`
  does not commit. The orchestrator commits, and dispatches `taskplanner` outside the Turn loop where
  no staging list exists. Neither party currently owns the handoff.
- **Should the orchestrator check for unstaged workbench records at Turn end?** A `git status
  --porcelain fusion-workbench/` at the Turn boundary would have caught this in Turn 1 and every
  Turn after. It is the measurement counterpart to the staging shape — the same move the guard made
  when it stopped predicting writes and started measuring paths
  (`260807-0923-guard-misst-statt-orakelt`). It also overlaps queued task 33 ("Let the
  orchestrator notice a file that changed with no task authorising it"), which is the same
  observation from the other side: task 33 watches for changes nobody authorised, this watches for
  changes nobody staged.
- **Should the commit-message file be forbidden inside `fusion-workbench/`?** Step 3b already names
  `/tmp`; nothing enforces it.

**Cross-references.** `fusion-workbench/tasklist.md` task 33;
`260810-2024_*_a-marker-rename-is-claimed-by-two-prompts-and-one-executor-moved-seven-other-executors-records.md`
(the other ownership gap around record writes);
`260810-1918_*_the-explicit-staging-instruction-became-a-shell-comment-and-still-does-not-forbid-add-u.md`
(the rule whose blind side this is);
`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` and
`## Which of them a tracked workbench tracks`; `agents/orchestrator.md:419-422`.

**Filed by:** reconciler, final reconciliation of session `260810-1646-orchestrator-session.md`, at HEAD `e2a34f0`.

---
Resolved: the durable half of the record, all three questions. (1) `agents/taskplanner.md` Step 6
mandates a `**Files written:**` field with absolute paths or the recorded word `none`, and
`agents/orchestrator.md` Phase 1 step 3 stages exactly those paths and commits before Phase 2 starts;
taskplanner still does not commit, the field is the handoff. (2) `hooks/lib/staging-drift.ts` measures
the index against the record stores, triggered by HEAD having moved since the previous tool call
rather than by reading a command's text — the classifier v6.0.0 deleted is not reintroduced, and
measuring HEAD is right across a commit, an alias, a rebase and a reset alike. (3) The commit-message
path is enforced at run time (a commit-message-shaped file under the workbench is its own fault class)
and at test time (`commit-message-path.test.ts` pins Step 3b to `/tmp` and fails if any shipped prompt
prescribes a path inside `fusion-workbench/`). The staging shape is not weakened:
`queue-commit-ownership-lint.test.ts` asserts no `git add` in any fenced block of the orchestrator
prompt carries `-A`, `-u`, `--all`, a bare `.` or a directory argument. The immediate half was already
discharged by `60f47c2` and was not redone. Task 5 of the 260811-0903-tasklist-update.md queue.
