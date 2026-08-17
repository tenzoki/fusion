A sub-agent left renames staged and the orchestrator's next commit absorbed them

---
**Domain:** code
**Filed by:** orchestrator
**Severity:** Medium. Nothing is lost and nothing wrong reached the repository; what breaks is the
correspondence between a commit's message and its contents, which is the only record of why a
change was made.
**Cross-references:** `agents/orchestrator.md` Step 3b step 4 (the staging shape) and step 5 (the
held command); issue `260811-0114` (the staging-drift check, which measures the opposite failure)

---

## What happened

At Turn 4 of Circle `260816-1741-guard-becomes-observation-only` the orchestrator committed the
shaper's correction to `_t_circle.md` plus two issue renames, naming five paths explicitly and
absolutely, exactly as Step 3b step 4 requires. The resulting commit `dbbad70` carries **seven**
files. Four were never named: the renames of `260816-2123`, `260816-2317`, `260817-1032` and the
plan `260816-1915`.

All four had been renamed earlier in the session by the `reconciler`, which staged them and then
continued to append content to them. So at the moment the orchestrator ran `git add <five paths>
&& git commit`, the index already held four rename pairs from another agent. `git commit` writes
the whole index.

The signature is visible in the result: the four extra entries show as pure renames with `0`
changed lines, while their content edits remain unstaged in the working tree afterwards.

## Why the existing rule does not cover it

Step 3b step 4 makes over-staging impossible **by the caller**: every path passed to `git add` is
one the caller wrote out. Step 3b step 5 closes the race where a path staged outside the lock is
absorbed by a parallel committer. Neither addresses a **dirty index inherited from a sub-agent
dispatched earlier in the same session**. The orchestrator's own command was correct and the
outcome was still wrong, which means the defect is in the protocol, not in the execution.

The staging-drift check (`bin/fusion-staging-drift`, issue `260811-0114`) measures records that
reach **no** commit. This is the mirror case: records that reach a commit that was not about them.
Nothing measures it.

## What should happen

Undecided, and deliberately left open rather than proposed as a fix — the options differ in cost
and one of them changes what sub-agents are allowed to do.

- Have the orchestrator assert a clean index before staging (`git diff --cached --quiet`), and stop
  and report when it is not. Cheap, and it makes the inherited state visible at the one moment it
  matters.
- Have the orchestrator commit the inherited staged work first, under its own message, then stage
  its own. Preserves attribution without forbidding anything.
- Forbid sub-agents from staging at all, leaving `git add` to the orchestrator alone. Cleanest in
  principle, but several agents stage as part of their normal work and this would have to be
  stated in each of their prompts.

## Evidence

- `git show --stat dbbad70` — seven files, four of them renames at 100% similarity.
- `git status` immediately after — the same four files listed as ` M` at their new names.
